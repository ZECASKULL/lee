// Secure Booking System for Skull BJJ
// Handles class reservations and scheduling with security features

class BookingSystem {
    constructor() {
        this.bookings = this.loadBookings();
        this.classes = this.getClassSchedule();
        this.maxCapacity = {
            'adults-fundamentals': 20,
            'adults-intermediate': 15,
            'adults-advanced': 12,
            'kids-fundamentals': 15,
            'kids-games': 20,
            'kids-intermediate': 12
        };
        
        this.init();
    }
    
    init() {
        this.setupBookingModal();
        this.attachEventListeners();
        this.updateBookingDisplay();
    }
    
    getClassSchedule() {
        return {
            adults: {
                monday: [
                    { time: '19:00-20:00', type: 'fundamentals', name: 'Fundamentos' },
                    { time: '20:00-21:00', type: 'intermediate', name: 'Intermediário' },
                    { time: '21:00-22:00', type: 'sparring', name: 'Rolar' }
                ],
                tuesday: [
                    { time: '19:00-20:00', type: 'intermediate', name: 'Intermediário' },
                    { time: '20:00-21:00', type: 'advanced', name: 'Avançado' },
                    { time: '21:00-22:00', type: 'sparring', name: 'Rolar' }
                ],
                wednesday: [
                    { time: '19:00-20:00', type: 'fundamentals', name: 'Fundamentos' },
                    { time: '20:00-21:00', type: 'intermediate', name: 'Intermediário' },
                    { time: '21:00-22:00', type: 'sparring', name: 'Rolar' }
                ],
                thursday: [
                    { time: '19:00-20:00', type: 'intermediate', name: 'Intermediário' },
                    { time: '20:00-21:00', type: 'advanced', name: 'Avançado' },
                    { time: '21:00-22:00', type: 'sparring', name: 'Rolar' }
                ],
                friday: [
                    { time: '19:00-20:00', type: 'fundamentals', name: 'Fundamentos' },
                    { time: '20:00-21:00', type: 'openmat', name: 'Open Mat' },
                    { time: '21:00-22:00', type: 'sparring', name: 'Rolar' }
                ]
            },
            kids: {
                monday: [
                    { time: '18:00-19:00', type: 'fundamentals', name: 'Kids Fundamentos' },
                    { time: '19:00-20:00', type: 'games', name: 'Jogos & Divertido' }
                ],
                tuesday: [
                    { time: '18:00-19:00', type: 'fundamentals', name: 'Kids Fundamentos' },
                    { time: '19:00-20:00', type: 'intermediate', name: 'Kids Intermediário' }
                ],
                wednesday: [
                    { time: '18:00-19:00', type: 'fundamentals', name: 'Kids Fundamentos' },
                    { time: '19:00-20:00', type: 'games', name: 'Jogos & Divertido' }
                ],
                thursday: [
                    { time: '18:00-19:00', type: 'fundamentals', name: 'Kids Fundamentos' },
                    { time: '19:00-20:00', type: 'intermediate', name: 'Kids Intermediário' }
                ],
                friday: [
                    { time: '18:00-19:00', type: 'fundamentals', name: 'Kids Fundamentos' },
                    { time: '19:00-20:00', type: 'games', name: 'Dia de Jogos' }
                ]
            }
        };
    }
    
    setupBookingModal() {
        // Create booking modal HTML
        const modalHTML = `
            <div id="bookingModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Agendar Aula</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="bookingForm">
                            <div class="form-group">
                                <label for="bookingName">Nome Completo*</label>
                                <input type="text" id="bookingName" required>
                            </div>
                            <div class="form-group">
                                <label for="bookingEmail">E-mail*</label>
                                <input type="email" id="bookingEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="bookingPhone">Telefone*</label>
                                <input type="tel" id="bookingPhone" required>
                            </div>
                            <div class="form-group">
                                <label for="bookingCategory">Categoria*</label>
                                <select id="bookingCategory" required>
                                    <option value="">Selecione...</option>
                                    <option value="adults">Adultos</option>
                                    <option value="kids">Kids</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="bookingDay">Dia*</label>
                                <select id="bookingDay" required>
                                    <option value="">Selecione...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="bookingClass">Aula*</label>
                                <select id="bookingClass" required>
                                    <option value="">Selecione...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="bookingDate">Data*</label>
                                <input type="date" id="bookingDate" required>
                            </div>
                            <div class="form-group">
                                <label for="bookingNotes">Observações</label>
                                <textarea id="bookingNotes" rows="3" placeholder="Alguma observação especial?"></textarea>
                            </div>
                            <div class="capacity-info">
                                <p id="capacityInfo"></p>
                            </div>
                            <button type="submit" class="booking-submit">Confirmar Agendamento</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add modal styles
        const modalStyles = `
            <style>
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 10000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.8);
                    backdrop-filter: blur(5px);
                }
                
                .modal-content {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    margin: 5% auto;
                    padding: 0;
                    border: 2px solid #ff6b6b;
                    border-radius: 15px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    background: rgba(255, 107, 107, 0.2);
                    border-bottom: 1px solid rgba(255, 107, 107, 0.3);
                }
                
                .modal-header h2 {
                    color: #ff6b6b;
                    margin: 0;
                    font-family: 'Bebas Neue', cursive;
                    font-size: 1.8rem;
                }
                
                .close {
                    color: #fff;
                    font-size: 2rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }
                
                .close:hover {
                    color: #ff6b6b;
                }
                
                .modal-body {
                    padding: 2rem;
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                
                .form-group label {
                    display: block;
                    color: #ff6b6b;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }
                
                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 5px;
                    color: #fff;
                    font-family: 'Roboto', sans-serif;
                    transition: all 0.3s ease;
                }
                
                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #ff6b6b;
                    box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
                }
                
                .capacity-info {
                    background: rgba(255, 107, 107, 0.1);
                    padding: 1rem;
                    border-radius: 5px;
                    margin-bottom: 1rem;
                    border-left: 3px solid #ff6b6b;
                }
                
                .capacity-info p {
                    color: #ccc;
                    margin: 0;
                }
                
                .booking-submit {
                    width: 100%;
                    background: linear-gradient(45deg, #ff6b6b, #ff5252);
                    color: #fff;
                    border: none;
                    padding: 15px;
                    border-radius: 5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .booking-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                }
                
                .booking-submit:disabled {
                    background: #666;
                    cursor: not-allowed;
                    transform: none;
                }
                
                @media (max-width: 768px) {
                    .modal-content {
                        margin: 10% auto;
                        width: 95%;
                    }
                    
                    .modal-header {
                        padding: 1rem;
                    }
                    
                    .modal-header h2 {
                        font-size: 1.5rem;
                    }
                    
                    .modal-body {
                        padding: 1rem;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', modalStyles);
    }
    
    attachEventListeners() {
        // Modal controls
        const modal = document.getElementById('bookingModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => this.closeModal());
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Category change
        document.getElementById('bookingCategory').addEventListener('change', (e) => {
            this.updateDayOptions(e.target.value);
        });
        
        // Day change
        document.getElementById('bookingDay').addEventListener('change', (e) => {
            this.updateClassOptions(e.target.value);
        });
        
        // Class change
        document.getElementById('bookingClass').addEventListener('change', (e) => {
            this.updateCapacityInfo(e.target.value);
        });
        
        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBooking();
        });
        
        // Date validation
        document.getElementById('bookingDate').addEventListener('change', (e) => {
            this.validateDate(e.target);
        });
        
        // Phone mask
        document.getElementById('bookingPhone').addEventListener('input', (e) => {
            this.applyPhoneMask(e.target);
        });
        
        // Add booking buttons to schedule
        this.addBookingButtons();
    }
    
    addBookingButtons() {
        const scheduleCells = document.querySelectorAll('.schedule-table td');
        
        scheduleCells.forEach(cell => {
            if (cell.textContent.trim() && !cell.textContent.includes('-')) {
                const bookingBtn = document.createElement('button');
                bookingBtn.className = 'booking-btn';
                bookingBtn.textContent = 'Agendar';
                bookingBtn.style.cssText = `
                    background: linear-gradient(45deg, #ff6b6b, #ff5252);
                    color: #fff;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    margin-left: 10px;
                    transition: all 0.3s ease;
                `;
                
                bookingBtn.addEventListener('click', () => {
                    this.openModal();
                    // Pre-fill based on cell info
                    this.prefillFromCell(cell);
                });
                
                cell.appendChild(bookingBtn);
            }
        });
    }
    
    prefillFromCell(cell) {
        const row = cell.closest('tr');
        const day = row.cells[0].textContent.toLowerCase();
        const classType = cell.className.replace('class-', '');
        
        // Try to determine if it's adults or kids based on context
        const isKids = classType.includes('kids');
        
        document.getElementById('bookingCategory').value = isKids ? 'kids' : 'adults';
        this.updateDayOptions(isKids ? 'kids' : 'adults');
        
        setTimeout(() => {
            document.getElementById('bookingDay').value = day;
            this.updateClassOptions(day);
            
            setTimeout(() => {
                const classSelect = document.getElementById('bookingClass');
                const options = Array.from(classSelect.options);
                const matchingOption = options.find(opt => 
                    opt.value.includes(classType) || opt.textContent.toLowerCase().includes(classType)
                );
                
                if (matchingOption) {
                    classSelect.value = matchingOption.value;
                    this.updateCapacityInfo(matchingOption.value);
                }
            }, 100);
        }, 100);
    }
    
    updateDayOptions(category) {
        const daySelect = document.getElementById('bookingDay');
        const classSelect = document.getElementById('bookingClass');
        
        daySelect.innerHTML = '<option value="">Selecione...</option>';
        classSelect.innerHTML = '<option value="">Selecione...</option>';
        
        if (!category) return;
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const dayNames = {
            monday: 'Segunda',
            tuesday: 'Terça',
            wednesday: 'Quarta',
            thursday: 'Quinta',
            friday: 'Sexta'
        };
        
        days.forEach(day => {
            if (this.classes[category][day]) {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = dayNames[day];
                daySelect.appendChild(option);
            }
        });
    }
    
    updateClassOptions(day) {
        const classSelect = document.getElementById('bookingClass');
        const category = document.getElementById('bookingCategory').value;
        
        classSelect.innerHTML = '<option value="">Selecione...</option>';
        
        if (!day || !category) return;
        
        const classes = this.classes[category][day];
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = `${category}-${cls.type}`;
            option.textContent = `${cls.time} - ${cls.name}`;
            classSelect.appendChild(option);
        });
    }
    
    updateCapacityInfo(classValue) {
        const capacityInfo = document.getElementById('capacityInfo');
        
        if (!classValue) {
            capacityInfo.textContent = '';
            return;
        }
        
        const maxCapacity = this.maxCapacity[classValue] || 15;
        const currentBookings = this.getCurrentBookings(classValue);
        const available = maxCapacity - currentBookings;
        
        if (available > 0) {
            capacityInfo.textContent = `Vagas disponíveis: ${available} de ${maxCapacity}`;
            capacityInfo.style.color = '#4caf50';
        } else {
            capacityInfo.textContent = 'Lotado! Não há vagas disponíveis.';
            capacityInfo.style.color = '#f44336';
            document.querySelector('.booking-submit').disabled = true;
        }
    }
    
    getCurrentBookings(classValue) {
        const today = new Date().toISOString().split('T')[0];
        return this.bookings.filter(booking => 
            booking.class === classValue && 
            booking.date === today
        ).length;
    }
    
    validateDate(input) {
        const selectedDate = new Date(input.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            input.setCustomValidity('Não é possível agendar para datas passadas.');
            showNotification('Selecione uma data futura para o agendamento.', 'error');
        } else {
            input.setCustomValidity('');
        }
    }
    
    applyPhoneMask(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        
        input.value = value;
    }
    
    async submitBooking() {
        const formData = new FormData(document.getElementById('bookingForm'));
        
        // Validate form
        if (!this.validateBookingForm(formData)) {
            return;
        }
        
        // Create booking object
        const booking = {
            id: this.generateBookingId(),
            name: formData.get('bookingName'),
            email: formData.get('bookingEmail'),
            phone: formData.get('bookingPhone'),
            category: formData.get('bookingCategory'),
            day: formData.get('bookingDay'),
            class: formData.get('bookingClass'),
            date: formData.get('bookingDate'),
            notes: formData.get('bookingNotes'),
            timestamp: new Date().toISOString(),
            status: 'confirmed'
        };
        
        try {
            // Check capacity
            const maxCapacity = this.maxCapacity[booking.class] || 15;
            const currentBookings = this.getBookingsForClass(booking.class, booking.date);
            
            if (currentBookings >= maxCapacity) {
                throw new Error('Esta aula está lotada. Escolha outro horário.');
            }
            
            // Save booking
            this.bookings.push(booking);
            this.saveBookings();
            
            // Send confirmation (in production, this would send email)
            await this.sendBookingConfirmation(booking);
            
            // Log security event
            if (window.SkullSecurity) {
                window.SkullSecurity.logSecurityEvent('BOOKING_CREATED', {
                    bookingId: booking.id,
                    email: booking.email,
                    class: booking.class
                });
            }
            
            showNotification('Agendamento confirmado! Você receberá um e-mail com os detalhes.', 'success');
            this.closeModal();
            this.updateBookingDisplay();
            
            // Reset form
            document.getElementById('bookingForm').reset();
            
        } catch (error) {
            showNotification(error.message, 'error');
            console.error('Booking error:', error);
        }
    }
    
    validateBookingForm(formData) {
        const name = formData.get('bookingName');
        const email = formData.get('bookingEmail');
        const phone = formData.get('bookingPhone');
        
        if (!name || name.length < 3) {
            showNotification('Nome deve ter pelo menos 3 caracteres.', 'error');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('E-mail inválido.', 'error');
            return false;
        }
        
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            showNotification('Telefone inválido.', 'error');
            return false;
        }
        
        return true;
    }
    
    generateBookingId() {
        return 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    getBookingsForClass(classValue, date) {
        return this.bookings.filter(booking => 
            booking.class === classValue && 
            booking.date === date
        ).length;
    }
    
    async sendBookingConfirmation(booking) {
        // In production, this would send an email
        console.log('Booking confirmation:', booking);
        
        // Simulate email sending
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1000);
        });
    }
    
    openModal() {
        document.getElementById('bookingModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bookingDate').min = today;
        document.getElementById('bookingDate').value = today;
    }
    
    closeModal() {
        document.getElementById('bookingModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('bookingForm').reset();
        document.querySelector('.booking-submit').disabled = false;
    }
    
    loadBookings() {
        const stored = localStorage.getItem('skullBookings');
        return stored ? JSON.parse(stored) : [];
    }
    
    saveBookings() {
        localStorage.setItem('skullBookings', JSON.stringify(this.bookings));
    }
    
    updateBookingDisplay() {
        // Update any UI elements that show booking information
        const bookingCount = this.bookings.filter(b => b.status === 'confirmed').length;
        console.log(`Total bookings: ${bookingCount}`);
    }
}

// Initialize booking system
document.addEventListener('DOMContentLoaded', function() {
    window.bookingSystem = new BookingSystem();
});

// Export for global access
window.BookingSystem = BookingSystem;
