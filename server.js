// Secure Backend Server for Skull BJJ Website
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const validator = require('validator');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Muitas tentativas. Tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));

// Body parsing with security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files securely
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        });
    }
    next();
};

app.use(sanitizeInput);

// CSRF protection
const csrfTokens = new Map();

function generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
}

function validateCSRFToken(req, res, next) {
    const token = req.body.csrfToken || req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
        return res.status(403).json({ error: 'Token CSRF inválido' });
    }
    
    next();
}

// Session management (simplified)
const sessions = new Map();

function createSession() {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session = {
        id: sessionId,
        csrfToken: generateCSRFToken(),
        createdAt: Date.now(),
        lastActivity: Date.now()
    };
    
    sessions.set(sessionId, session);
    return sessionId;
}

function validateSession(req, res, next) {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Sessão inválida' });
    }
    
    const session = sessions.get(sessionId);
    
    // Check if session is expired (24 hours)
    if (Date.now() - session.lastActivity > 24 * 60 * 60 * 1000) {
        sessions.delete(sessionId);
        return res.status(401).json({ error: 'Sessão expirada' });
    }
    
    session.lastActivity = Date.now();
    req.session = session;
    next();
}

// Data validation schemas
const contactFormSchema = {
    name: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/
    },
    email: {
        required: true,
        type: 'email'
    },
    phone: {
        required: false,
        type: 'string',
        pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    },
    classType: {
        required: true,
        type: 'string',
        enum: ['fundamentos', 'intermediario', 'avancado', 'trial']
    },
    message: {
        required: false,
        type: 'string',
        maxLength: 500
    }
};

function validateSchema(data, schema) {
    const errors = [];
    
    Object.keys(schema).forEach(field => {
        const rules = schema[field];
        const value = data[field];
        
        // Required validation
        if (rules.required && (!value || value.trim() === '')) {
            errors.push({ field, message: `${field} é obrigatório` });
            return;
        }
        
        // If field is not required and empty, skip other validations
        if (!rules.required && (!value || value.trim() === '')) {
            return;
        }
        
        // Type validation
        if (rules.type === 'email' && !validator.isEmail(value)) {
            errors.push({ field, message: 'E-mail inválido' });
        }
        
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            errors.push({ field, message: `${field} deve ter pelo menos ${rules.minLength} caracteres` });
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push({ field, message: `${field} deve ter no máximo ${rules.maxLength} caracteres` });
        }
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push({ field, message: `${field} formato inválido` });
        }
        
        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push({ field, message: `${field} valor inválido` });
        }
    });
    
    return errors;
}

// Logging system
function logSecurityEvent(level, message, data = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
        ip: data.ip || 'unknown',
        userAgent: data.userAgent || 'unknown'
    };
    
    console.log(`[${level}] ${message}:`, logEntry);
    
    // In production, send to secure logging service
    // For now, write to a log file
    const logFile = path.join(__dirname, 'security.log');
    fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create session
app.post('/api/session', (req, res) => {
    try {
        const sessionId = createSession();
        const session = sessions.get(sessionId);
        
        res.json({
            sessionId,
            csrfToken: session.csrfToken,
            expiresAt: new Date(session.createdAt + 24 * 60 * 60 * 1000).toISOString()
        });
        
        logSecurityEvent('INFO', 'Session created', { ip: req.ip });
    } catch (error) {
        logSecurityEvent('ERROR', 'Session creation failed', { error: error.message, ip: req.ip });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Contact form submission
app.post('/api/contact', validateSession, validateCSRFToken, (req, res) => {
    try {
        // Validate input data
        const errors = validateSchema(req.body, contactFormSchema);
        
        if (errors.length > 0) {
            logSecurityEvent('WARNING', 'Contact form validation failed', { 
                errors, 
                ip: req.ip, 
                userAgent: req.get('User-Agent') 
            });
            return res.status(400).json({ errors });
        }
        
        // Process contact form data
        const contactData = {
            ...req.body,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // In production, save to database or send email
        console.log('Contact form submission:', contactData);
        
        // Save to file for now
        const contactsFile = path.join(__dirname, 'contacts.json');
        let contacts = [];
        
        try {
            if (fs.existsSync(contactsFile)) {
                const data = fs.readFileSync(contactsFile, 'utf8');
                contacts = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error reading contacts file:', error);
        }
        
        contacts.push(contactData);
        fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));
        
        logSecurityEvent('INFO', 'Contact form submitted successfully', { 
            name: contactData.name, 
            email: contactData.email, 
            ip: req.ip 
        });
        
        res.json({ 
            success: true, 
            message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' 
        });
        
    } catch (error) {
        logSecurityEvent('ERROR', 'Contact form submission failed', { 
            error: error.message, 
            ip: req.ip 
        });
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        activeSessions: sessions.size
    });
});

// Security monitoring endpoint (admin only)
app.get('/api/security/status', (req, res) => {
    // In production, add authentication middleware
    const securityStatus = {
        activeSessions: sessions.size,
        rateLimitActive: true,
        securityHeaders: true,
        csrfProtection: true,
        inputValidation: true,
        timestamp: new Date().toISOString()
    };
    
    res.json(securityStatus);
});

// Clean up expired sessions
setInterval(() => {
    const now = Date.now();
    const expiredSessions = [];
    
    sessions.forEach((session, sessionId) => {
        if (now - session.lastActivity > 24 * 60 * 60 * 1000) {
            expiredSessions.push(sessionId);
        }
    });
    
    expiredSessions.forEach(sessionId => {
        sessions.delete(sessionId);
    });
    
    if (expiredSessions.length > 0) {
        logSecurityEvent('INFO', `Cleaned up ${expiredSessions.length} expired sessions`);
    }
}, 60 * 60 * 1000); // Run every hour

// Error handling
app.use((err, req, res, next) => {
    logSecurityEvent('ERROR', 'Unhandled error', { 
        error: err.message, 
        stack: err.stack, 
        ip: req.ip 
    });
    
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Página não encontrada' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logSecurityEvent('INFO', 'Server shutting down');
    process.exit(0);
});

process.on('SIGINT', () => {
    logSecurityEvent('INFO', 'Server shutting down');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🔒 Skull BJJ Secure Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛡️  Security features enabled`);
    logSecurityEvent('INFO', `Server started on port ${PORT}`);
});
