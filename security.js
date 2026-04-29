// Security Module for Skull BJJ Website
// Implements security headers, input validation, and XSS protection

// Security Headers Configuration
const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// Rate limiting configuration
const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Muitas tentativas. Tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false
};

// Input validation patterns
const validationPatterns = {
    name: {
        pattern: /^[a-zA-ZÀ-ÿ\s]{3,50}$/,
        message: 'Nome deve conter apenas letras e ter entre 3 e 50 caracteres'
    },
    email: {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: 'E-mail inválido'
    },
    phone: {
        pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        message: 'Telefone deve estar no formato (XX) XXXX-XXXX'
    },
    message: {
        pattern: /^[\s\S]{0,500}$/,
        message: 'Mensagem deve ter no máximo 500 caracteres'
    }
};

// XSS Protection
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function sanitizeInput(input, type) {
    if (!input) return '';
    
    // Remove HTML tags and encode special characters
    let sanitized = input.replace(/<[^>]*>/g, '');
    sanitized = sanitized.replace(/[&<>"']/g, function(match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escape[match];
    });
    
    // Apply type-specific validation
    if (validationPatterns[type]) {
        const pattern = validationPatterns[type];
        if (!pattern.pattern.test(sanitized)) {
            throw new Error(pattern.message);
        }
    }
    
    return sanitized;
}

// CSRF Protection
function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

let csrfToken = null;

function getCSRFToken() {
    if (!csrfToken) {
        csrfToken = generateCSRFToken();
        // Store in session storage for the current session
        sessionStorage.setItem('csrfToken', csrfToken);
    }
    return csrfToken;
}

function validateCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrfToken');
    return token === storedToken;
}

// Rate limiting for form submissions
const submissionAttempts = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const attempts = submissionAttempts.get(ip) || [];
    
    // Remove attempts older than 15 minutes
    const validAttempts = attempts.filter(timestamp => now - timestamp < 15 * 60 * 1000);
    
    if (validAttempts.length >= 5) {
        return false;
    }
    
    validAttempts.push(now);
    submissionAttempts.set(ip, validAttempts);
    return true;
}

// Secure form submission
async function secureFormSubmit(formData) {
    const clientIP = await getClientIP();
    
    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
        throw new Error('Muitas tentativas. Tente novamente mais tarde.');
    }
    
    // Validate CSRF token
    const formToken = formData.get('csrfToken');
    if (!validateCSRFToken(formToken)) {
        throw new Error('Token de segurança inválido. Recarregue a página e tente novamente.');
    }
    
    // Sanitize all form data
    const sanitizedData = {};
    for (const [key, value] of formData.entries()) {
        if (key !== 'csrfToken') {
            sanitizedData[key] = sanitizeInput(value, key);
        }
    }
    
    return sanitizedData;
}

// Get client IP (simplified - in production, use server-side detection)
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        // Fallback to a hash of user agent + timestamp
        return btoa(navigator.userAgent + Date.now()).substring(0, 20);
    }
}

// Security audit logging
function logSecurityEvent(event, data) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event: event,
        data: data,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // In production, send to secure logging endpoint
    console.log('Security Event:', logEntry);
    
    // Store critical events locally for monitoring
    if (event === 'SUSPICIOUS_ACTIVITY' || event === 'FAILED_LOGIN') {
        const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 50 entries
        if (logs.length > 50) {
            logs.shift();
        }
        
        localStorage.setItem('securityLogs', JSON.stringify(logs));
    }
}

// Input validation for contact form
function validateContactForm(formData) {
    const errors = [];
    
    // Validate name
    try {
        sanitizeInput(formData.get('name'), 'name');
    } catch (error) {
        errors.push({ field: 'name', message: error.message });
    }
    
    // Validate email
    try {
        sanitizeInput(formData.get('email'), 'email');
    } catch (error) {
        errors.push({ field: 'email', message: error.message });
    }
    
    // Validate phone (optional)
    const phone = formData.get('phone');
    if (phone) {
        try {
            sanitizeInput(phone, 'phone');
        } catch (error) {
            errors.push({ field: 'phone', message: error.message });
        }
    }
    
    // Validate message (optional)
    const message = formData.get('message');
    if (message) {
        try {
            sanitizeInput(message, 'message');
        } catch (error) {
            errors.push({ field: 'message', message: error.message });
        }
    }
    
    return errors;
}

// Initialize security features
document.addEventListener('DOMContentLoaded', function() {
    // Add CSRF token to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfToken';
        csrfInput.value = getCSRFToken();
        form.appendChild(csrfInput);
        
        // Add secure submission handler
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(form);
                const errors = validateContactForm(formData);
                
                if (errors.length > 0) {
                    displayFormErrors(errors);
                    logSecurityEvent('FORM_VALIDATION_ERROR', { errors: errors });
                    return;
                }
                
                const sanitizedData = await secureFormSubmit(formData);
                
                // Simulate secure submission
                await submitSecureData(sanitizedData);
                
                logSecurityEvent('FORM_SUBMITTED', { form: form.id });
                
            } catch (error) {
                logSecurityEvent('FORM_SUBMISSION_ERROR', { error: error.message });
                showNotification(error.message, 'error');
            }
        });
    });
    
    // Monitor for suspicious activity
    monitorSuspiciousActivity();
});

function displayFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            showFieldError(error.field, error.message);
        }
    });
}

async function submitSecureData(data) {
    // In production, this would send to a secure backend endpoint
    console.log('Secure data submission:', data);
    
    // Simulate successful submission
    showNotification('Mensagem enviada com segurança!', 'success');
    
    // Reset form
    document.getElementById('contactForm').reset();
}

// Monitor for suspicious activity
function monitorSuspiciousActivity() {
    let failedAttempts = 0;
    let lastAttempt = 0;
    
    // Monitor form submission patterns
    document.addEventListener('submit', function() {
        const now = Date.now();
        
        if (now - lastAttempt < 1000) { // Multiple submissions in < 1 second
            failedAttempts++;
            logSecurityEvent('SUSPICIOUS_ACTIVITY', {
                type: 'RAPID_SUBMISSIONS',
                attempts: failedAttempts
            });
            
            if (failedAttempts > 3) {
                // Temporarily disable forms
                document.querySelectorAll('form').forEach(form => {
                    form.style.opacity = '0.5';
                    form.style.pointerEvents = 'none';
                });
                
                showNotification('Atividade suspeita detectada. Aguarde alguns minutos.', 'error');
                
                setTimeout(() => {
                    document.querySelectorAll('form').forEach(form => {
                        form.style.opacity = '1';
                        form.style.pointerEvents = 'auto';
                    });
                    failedAttempts = 0;
                }, 5 * 60 * 1000); // 5 minutes
            }
        } else {
            failedAttempts = 0;
        }
        
        lastAttempt = now;
    });
    
    // Monitor console access (basic detection)
    let consoleOpen = false;
    setInterval(() => {
        const before = new Date();
        debugger;
        const after = new Date();
        if (after - before > 100) {
            if (!consoleOpen) {
                consoleOpen = true;
                logSecurityEvent('CONSOLE_ACCESS', { timestamp: before.toISOString() });
            }
        } else {
            consoleOpen = false;
        }
    }, 1000);
}

// Export security functions for global use
window.SkullSecurity = {
    sanitizeInput,
    validateContactForm,
    getCSRFToken,
    logSecurityEvent
};

// Add security meta tags
const securityMetaTags = [
    { charset: 'utf-8' },
    { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: 'Skull BJJ' },
    { name: 'description', content: 'Academia de Jiu-Jitsu Brasileiro - Aprenda a arte suave com os melhores instrutores' }
];

// Add meta tags to head
securityMetaTags.forEach(tag => {
    const meta = document.createElement('meta');
    Object.keys(tag).forEach(key => {
        if (key === 'charset') {
            meta.setAttribute('charset', tag[key]);
        } else if (key === 'http-equiv') {
            meta.setAttribute('http-equiv', tag['http-equiv']);
            meta.content = tag.content;
        } else {
            meta.setAttribute(key, tag[key]);
        }
    });
    document.head.appendChild(meta);
});

console.log('%c🔒 Security Module Loaded', 'color: #4caf50; font-weight: bold;');
