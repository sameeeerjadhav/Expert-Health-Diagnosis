const API_BASE = 'http://localhost:8080/api';
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole') || 'PATIENT';

// Apply theme based on role
if (userRole === 'PATIENT') {
    document.body.classList.add('theme-patient');
} else if (userRole === 'DOCTOR') {
    document.body.classList.add('theme-doctor');
} else if (userRole === 'ADMIN') {
    document.body.classList.add('theme-admin');
}

if (!token) window.location.href = 'index.html';

// Set greeting based on time
function setGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17) greeting = 'Good Evening';

    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) greetingEl.innerText = greeting;
}

// Fetch and display dashboard stats
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await response.json();

        // Update stats based on role
        if (userRole === 'PATIENT') {
            document.getElementById('stat-1-label').innerText = 'Upcoming Appointments';
            document.getElementById('stat-1-value').innerText = stats.upcomingAppointments || 0;

            document.getElementById('stat-2-label').innerText = 'Last Risk Level';
            const riskValue = document.getElementById('stat-2-value');
            riskValue.innerText = stats.lastRiskLevel || 'N/A';
            riskValue.style.color = getRiskColor(stats.lastRiskLevel);
        } else if (userRole === 'DOCTOR') {
            document.getElementById('stat-1-label').innerText = "Today's Appointments";
            document.getElementById('stat-1-value').innerText = stats.todayAppointments || 0;

            document.getElementById('stat-2-label').innerText = 'Total Patients';
            document.getElementById('stat-2-value').innerText = stats.totalPatients || 0;
        } else if (userRole === 'ADMIN') {
            document.getElementById('stat-1-label').innerText = 'Total Users';
            document.getElementById('stat-1-value').innerText = stats.totalUsers || 0;

            document.getElementById('stat-2-label').innerText = 'Total Appointments';
            document.getElementById('stat-2-value').innerText = stats.totalAppointments || 0;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function getRiskColor(level) {
    if (level === 'Low') return '#10b981';
    if (level === 'Medium') return '#f59e0b';
    if (level === 'High') return '#ef4444';
    return '#64748b';
}

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();

        // Update greeting with user name
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            const firstName = (user.fullName || 'User').split(' ')[0];
            userNameEl.innerText = firstName;
        }

        // Update subtitle based on role
        const subtitleEl = document.getElementById('dashboard-subtitle');
        if (subtitleEl) {
            if (userRole === 'DOCTOR') {
                subtitleEl.innerText = 'Manage your appointments and patient consultations.';
            } else if (userRole === 'ADMIN') {
                subtitleEl.innerText = 'System administration and management.';
            } else {
                subtitleEl.innerText = 'Your health journey starts here.';
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Role Based UI Logic
if (userRole === 'DOCTOR') {
    const assessmentCard = document.getElementById('action-assessment');
    const findDoctorCard = document.getElementById('action-find-doctor');
    const headerAssessment = document.getElementById('header-new-assessment');

    if (assessmentCard) {
        assessmentCard.innerHTML = `
            <div class="action-icon green">
                <i class="fas fa-user-injured"></i>
            </div>
            <h3>My Patients</h3>
            <p>View your assigned patients and their assessment reports.</p>
            <a href="chat.html" class="btn btn-primary">
                <i class="fas fa-users"></i> View Patients
            </a>
        `;
        assessmentCard.className = 'action-card-enhanced green';
    }

    if (findDoctorCard) findDoctorCard.style.display = 'none';
    if (headerAssessment) headerAssessment.style.display = 'none';

} else if (userRole === 'ADMIN') {
    const assessmentCard = document.getElementById('action-assessment');
    const findDoctorCard = document.getElementById('action-find-doctor');
    const headerAssessment = document.getElementById('header-new-assessment');

    if (assessmentCard) {
        assessmentCard.innerHTML = `
            <div class="action-icon purple">
                <i class="fas fa-users-cog"></i>
            </div>
            <h3>User Management</h3>
            <p>Manage all patients and doctors in the system.</p>
            <a href="admin-users.html" class="btn btn-primary">
                <i class="fas fa-cog"></i> Manage Users
            </a>
        `;
        assessmentCard.className = 'action-card-enhanced purple';
    }

    if (findDoctorCard) {
        findDoctorCard.innerHTML = `
            <div class="action-icon blue">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <h3>Appointments</h3>
            <p>View and manage all appointment bookings.</p>
            <a href="admin-appointments.html" class="btn btn-primary">
                <i class="fas fa-list"></i> Manage Appointments
            </a>
        `;
        findDoctorCard.className = 'action-card-enhanced blue';
    }

    if (headerAssessment) headerAssessment.style.display = 'none';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Initialize
setGreeting();
loadUserInfo();
loadDashboardStats();
loadAppointmentSummary();
loadRoleSpecificData();

async function loadAppointmentSummary() {
    try {
        // Use /my-appointments endpoint which works for both patients and doctors
        const response = await fetch(`${API_BASE}/appointments/my-appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const appointments = await response.json();
            console.log('Appointments fetched:', appointments);

            // Count by status
            const counts = {
                pending: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0
            };

            appointments.forEach(apt => {
                const status = (apt.status || '').toUpperCase();
                if (status === 'PENDING') counts.pending++;
                else if (status === 'CONFIRMED') counts.confirmed++;
                else if (status === 'COMPLETED') counts.completed++;
                else if (status === 'CANCELLED') counts.cancelled++;
            });

            console.log('Appointment counts:', counts);

            // Update UI
            document.getElementById('pending-count').innerText = counts.pending;
            document.getElementById('confirmed-count').innerText = counts.confirmed;
            document.getElementById('completed-count').innerText = counts.completed;
            document.getElementById('cancelled-count').innerText = counts.cancelled;
        } else {
            console.error('Failed to fetch appointments:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error loading appointment summary:', error);
    }
}

async function loadRoleSpecificData() {
    // Role Specific Data
    if (userRole === 'PATIENT') {
        const historySection = document.getElementById('assessment-history-section');
        if (historySection) {
            historySection.style.display = 'block';
            loadAssessmentHistory();
        }
    } else if (userRole === 'DOCTOR') {
        const patientsSection = document.getElementById('my-patients-section');
        if (patientsSection) {
            patientsSection.style.display = 'block';
            loadMyPatients();
        }
    }
}

async function loadAssessmentHistory() {
    try {
        const response = await fetch(`${API_BASE}/assessment/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const history = await response.json();
        const tbody = document.getElementById('assessment-history-list');

        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">No assessments taken yet.</td></tr>';
            return;
        }

        tbody.innerHTML = history.map(h => `
            <tr>
                <td>${new Date(h.createdAt).toLocaleDateString()}</td>
                <td>
                    <span style="color: ${getRiskColor(h.riskLevel)}; font-weight: 600;">${h.riskLevel}</span>
                </td>
                <td>${h.totalScore}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem;" onclick="alert('Details view coming soon')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) { console.error('History error', e); }
}

async function loadMyPatients() {
    try {
        const response = await fetch(`${API_BASE}/doctors/my-patients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const patients = await response.json();
        const tbody = document.getElementById('my-patients-list');

        if (patients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">No patients assigned yet.</td></tr>';
            return;
        }

        tbody.innerHTML = patients.map(p => `
            <tr>
                <td style="font-weight: 500;">${p.fullName}</td>
                <td>${p.email}</td>
                <td>${p.phone || '-'}</td>
                <td>
                    <span style="color: #64748b;">Unknown</span>
                </td>
            </tr>
        `).join('');

    } catch (e) { console.error('Patients error', e); }
}
