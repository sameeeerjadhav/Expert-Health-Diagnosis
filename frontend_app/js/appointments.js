const API_BASE = 'http://localhost:8080/api';
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole');

// Apply theme based on role
if (userRole) {
    document.body.classList.add(`theme-${userRole.toLowerCase()}`);
}

// Check authentication
if (!token) {
    window.location.href = 'index.html';
}

let currentTab = 'upcoming';

// Tab switching
window.switchTab = function (tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach((btn, index) => {
        btn.classList.remove('active');
        const tabs = ['upcoming', 'past', 'cancelled'];
        if (tabs[index] === tabName) {
            btn.classList.add('active');
        }
    });

    // Load appointments for selected tab
    loadAppointments(tabName);
}

// Show/Hide booking form
window.showBookingForm = function () {
    document.getElementById('bookingFormSection').style.display = 'block';
    document.getElementById('bookingFormSection').scrollIntoView({ behavior: 'smooth' });
}

window.hideBookingForm = function () {
    document.getElementById('bookingFormSection').style.display = 'none';
    document.getElementById('appointmentForm').reset();
    clearTimeSlots();
}

// Initialize time slots
function initializeTimeSlots() {
    const ALL_SLOTS = [
        "9:00 AM - 9:30 AM", "9:30 AM - 10:00 AM", "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM",
        "11:00 AM - 11:30 AM", "2:00 PM - 2:30 PM", "2:30 PM - 3:00 PM", "3:00 PM - 3:30 PM",
        "3:30 PM - 4:00 PM", "4:00 PM - 4:30 PM", "4:30 PM - 5:00 PM"
    ];

    const container = document.getElementById('timeSlotsContainer');
    if (!container) return;

    container.innerHTML = ALL_SLOTS.map(slot => `
        <div class="time-slot-btn" onclick="selectTimeSlot('${slot}', this)">
            ${slot}
        </div>
    `).join('');
}

function clearTimeSlots() {
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.style.textDecoration = 'none';
    });
    const hidden = document.getElementById('selectedTimeSlot');
    if (hidden) hidden.value = '';
}

window.selectTimeSlot = function (slot, element) {
    // Check if slot is disabled
    if (element.style.cursor === 'not-allowed') return;

    // Remove selection from all slots
    document.querySelectorAll('.time-slot-btn').forEach(btn => btn.classList.remove('selected'));

    // Select this slot
    element.classList.add('selected');
    document.getElementById('selectedTimeSlot').value = slot;
}

// Load doctors for dropdown
async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE}/users/doctors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const doctors = await response.json();

        const select = document.getElementById('doctorSelect');
        if (!select) return;

        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.fullName} - ${doctor.specialization || 'Specialist'}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Load appointments based on tab
async function loadAppointments(filter = 'upcoming') {
    try {
        let url = `${API_BASE}/appointments/${filter}`;

        // If 'past' tab, we want to show Appointment History (Completed ones)
        // We fetch all my-appointments to ensure we get completed ones from today too
        // and filtering specifically for COMPLETED status.
        if (filter === 'past' || filter === 'upcoming') {
            url = `${API_BASE}/appointments/my-appointments`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let appointments = await response.json();

        // Filter and sort based on tab
        if (filter === 'past') {
            // Filter for COMPLETED only
            appointments = appointments.filter(apt => apt.status === 'COMPLETED');
            // Sort by date descending (newest first)
            appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        } else if (filter === 'upcoming') {
            // Filter for PENDING and CONFIRMED
            appointments = appointments.filter(apt => ['PENDING', 'CONFIRMED'].includes(apt.status));
            // Sort by date ascending (soonest first)
            appointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        }

        const container = document.getElementById('appointmentsList');

        if (!container) return;

        if (appointments.length === 0) {
            const emptyMessages = {
                'upcoming': 'No upcoming appointments',
                'past': 'No completed appointments history',
                'cancelled': 'No cancelled appointments'
            };

            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>${emptyMessages[filter] || 'No appointments'}</h3>
                    <p>You don't have any appointments in this category.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = appointments.map(apt => renderAppointmentCard(apt)).join('');
    } catch (error) {
        console.error('Error loading appointments:', error);
        const container = document.getElementById('appointmentsList');
        if (container) {
            container.innerHTML = `<p class="text-danger">Error loading appointments: ${error.message}</p>`;
        }
    }
}

// Render appointment card
function renderAppointmentCard(apt) {
    const date = new Date(apt.appointmentDate);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

    const doctorOrPatient = userRole === 'DOCTOR' ? apt.patient : apt.doctor;
    const initial = (doctorOrPatient?.fullName || 'U').charAt(0).toUpperCase();
    const specialization = userRole === 'DOCTOR' ? 'Patient' : (apt.doctor?.specialization || 'Specialist');

    const statusClass = {
        'PENDING': 'status-pending',
        'CONFIRMED': 'status-confirmed',
        'COMPLETED': 'status-completed',
        'CANCELLED': 'status-cancelled'
    }[apt.status] || 'status-pending';

    return `
        <div class="appointment-card">
            <div class="appointment-date-box">
                <div class="day">${day}</div>
                <div class="month">${month}</div>
            </div>
            
            <div class="appointment-details">
                <div class="appointment-doctor">
                    <div class="doctor-avatar">${initial}</div>
                    <div class="doctor-info">
                        <h3>${doctorOrPatient?.fullName || 'Unknown'}</h3>
                        <div class="specialization">${specialization}</div>
                    </div>
                </div>
                
                <div class="appointment-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${apt.timeSlot}</span>
                    </div>
                    ${apt.notes ? `
                        <div class="meta-item">
                            <i class="fas fa-notes-medical"></i>
                            <span>${apt.notes}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' ? `
                    <div class="appointment-actions">
                        ${userRole === 'DOCTOR' && apt.status === 'PENDING' ? `
                            <button onclick="updateAppointmentStatus(${apt.id}, 'CONFIRMED')" class="action-btn action-btn-primary">
                                <i class="fas fa-check"></i> Confirm
                            </button>
                        ` : ''}
                        <button onclick="cancelAppointment(${apt.id})" class="action-btn action-btn-outline">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <div class="appointment-status ${statusClass}">
                ${apt.status}
            </div>
        </div>
    `;
}

// Book appointment
const form = document.getElementById('appointmentForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedSlot = document.getElementById('selectedTimeSlot').value;
        if (!selectedSlot) {
            alert('Please select a time slot');
            return;
        }

        const appointmentData = {
            doctorId: parseInt(document.getElementById('doctorSelect').value),
            appointmentDate: document.getElementById('appointmentDate').value,
            timeSlot: selectedSlot,
            notes: document.getElementById('notes').value
        };

        try {
            const response = await fetch(`${API_BASE}/appointments/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });

            if (response.ok) {
                alert('✅ Appointment booked successfully!');
                hideBookingForm();
                loadAppointments(currentTab);
            } else {
                const error = await response.text();
                alert('❌ Failed to book appointment: ' + error);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Error booking appointment');
        }
    });
}

// Update appointment status (for doctors)
window.updateAppointmentStatus = async function (id, status) {
    try {
        const response = await fetch(`${API_BASE}/appointments/${id}/status?status=${status}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert(`Appointment ${status.toLowerCase()}`);
            loadAppointments(currentTab);
        } else {
            alert('Failed to update appointment');
        }
    } catch (error) {
        console.error('Error updating appointment:', error);
    }
}

// Cancel appointment
window.cancelAppointment = async function (id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
        const response = await fetch(`${API_BASE}/appointments/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Appointment cancelled');
            loadAppointments(currentTab);
        } else {
            alert('Failed to cancel appointment');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
    }
}

// Check available slots when doctor/date changes
const doctorSelect = document.getElementById('doctorSelect');
const dateInput = document.getElementById('appointmentDate');

if (doctorSelect) {
    doctorSelect.addEventListener('change', checkAvailableSlots);
}

if (dateInput) {
    dateInput.addEventListener('change', checkAvailableSlots);
    dateInput.min = new Date().toISOString().split('T')[0];
}

async function checkAvailableSlots() {
    const doctorId = document.getElementById('doctorSelect')?.value;
    const date = document.getElementById('appointmentDate')?.value;

    if (!doctorId || !date) return;

    try {
        const response = await fetch(`${API_BASE}/appointments/booked-slots?doctorId=${doctorId}&date=${date}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookedSlots = await response.json();

        // Disable booked slots
        document.querySelectorAll('.time-slot-btn').forEach(btn => {
            const slot = btn.textContent.trim();
            if (bookedSlots.includes(slot)) {
                btn.style.opacity = '0.4';
                btn.style.cursor = 'not-allowed';
                btn.style.textDecoration = 'line-through';
                btn.onclick = null;
                btn.title = 'This slot is already booked';
            }
        });
    } catch (error) {
        console.error('Error fetching slots:', error);
    }
}

// Initialize
console.log('Initializing appointments page...');
loadDoctors();
loadAppointments('upcoming');
initializeTimeSlots();
