const isLocalDev = window.location.hostname === 'localhost' && window.location.port !== '' && window.location.port !== '80';
const API_BASE = isLocalDev ? 'http://localhost:8080/api' : '/api';
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole') || 'PATIENT';

if (!token) window.location.href = 'auth.html';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    setupForm();
    setupRoleBadge();
});

// Setup role badge display
function setupRoleBadge() {
    const roleBadge = document.getElementById('role-badge');
    if (userRole === 'DOCTOR') {
        roleBadge.className = 'role-badge doctor';
        roleBadge.innerHTML = '<i class="fas fa-user-md"></i> Doctor';
    } else if (userRole === 'ADMIN') {
        roleBadge.className = 'role-badge admin';
        roleBadge.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
    } else {
        roleBadge.className = 'role-badge patient';
        roleBadge.innerHTML = '<i class="fas fa-user"></i> Patient';
    }
}

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load profile');

        if (response.status === 401 || response.status === 403) {
            window.location.href = 'auth.html';
            return;
        }
        const user = await response.json();

        // Basic Fields
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';

        // Avatar initial
        const initial = (user.fullName || 'U').charAt(0).toUpperCase();
        document.getElementById('avatar-initial').innerText = initial;

        // Header info
        document.getElementById('profile-name').innerText = user.fullName || 'User';
        document.getElementById('profile-email').innerText = user.email || '';

        // Address
        if (document.getElementById('address')) {
            document.getElementById('address').value = user.address || '';
        }



        // Role Specific Fields
        if (userRole === 'PATIENT') {
            document.getElementById('patient-fields').style.display = 'block';
            document.getElementById('age').value = user.age || '';
            document.getElementById('gender').value = user.gender || '';
            document.getElementById('bloodGroup').value = user.bloodGroup || '';
            document.getElementById('medicalHistory').value = user.medicalHistory || '';
        } else if (userRole === 'DOCTOR') {
            document.getElementById('doctor-fields').style.display = 'block';
            document.getElementById('specialization').value = user.specialization || '';
            document.getElementById('experience').value = user.experience || '';
            document.getElementById('bio').value = user.bio || '';
            document.getElementById('clinicAddress').value = user.clinicAddress || '';
            document.getElementById('availableHours').value = user.availableHours || '';
            document.getElementById('consultationFee').value = user.consultationFee || '';
            document.getElementById('languagesSpoken').value = user.languagesSpoken || '';

            // Show verified badge for doctors
            if (user.isVerified) {
                document.getElementById('verified-badge').style.display = 'inline-flex';
            }
        }

        // Load appointment stats
        loadStats();

    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Could not load profile data.', 'error');
    }
}

async function loadStats() {
    try {
        // Get appointments and count only COMPLETED ones
        const response = await fetch(`${API_BASE}/appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const appointments = await response.json();
            console.log('All appointments:', appointments);
            // Filter for completed appointments only
            const completedCount = appointments.filter(apt => apt.status === 'COMPLETED').length;
            console.log('Completed count:', completedCount);
            document.getElementById('stat-appointments').innerText = completedCount;
        } else {
            console.error('Failed to fetch appointments:', response.status);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function setupForm() {
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('save-btn');
        const saveIcon = document.getElementById('save-icon');
        const saveText = document.getElementById('save-text');

        // Show saving state
        btn.classList.add('saving');
        saveIcon.className = 'spinner';
        saveText.innerText = 'Saving...';

        const data = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address') ? document.getElementById('address').value : undefined
        };

        if (userRole === 'PATIENT') {
            const ageVal = document.getElementById('age').value;
            data.age = ageVal ? parseInt(ageVal) : null;
            data.gender = document.getElementById('gender').value;
            data.bloodGroup = document.getElementById('bloodGroup').value;
            data.medicalHistory = document.getElementById('medicalHistory').value;
        } else if (userRole === 'DOCTOR') {
            data.specialization = document.getElementById('specialization').value;
            data.experience = document.getElementById('experience').value;
            data.bio = document.getElementById('bio').value;
            data.clinicAddress = document.getElementById('clinicAddress').value;
            data.availableHours = document.getElementById('availableHours').value;

            const feeVal = document.getElementById('consultationFee').value;
            data.consultationFee = feeVal ? parseFloat(feeVal) : null;

            data.languagesSpoken = document.getElementById('languagesSpoken').value;
        }

        try {
            const response = await fetch(`${API_BASE}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Show success state
                btn.classList.remove('saving');
                btn.classList.add('success');
                saveIcon.className = 'fas fa-check';
                saveText.innerText = 'Saved!';

                showToast('Profile updated successfully!', 'success');

                // Update local storage with new user data
                const updatedUser = await response.json();
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Update UI
                document.getElementById('profile-name').innerText = updatedUser.fullName || 'User';
                document.getElementById('avatar-initial').innerText = (updatedUser.fullName || 'U').charAt(0).toUpperCase();

                // Reset button after delay
                setTimeout(() => {
                    btn.classList.remove('success');
                    saveIcon.className = 'fas fa-save';
                    saveText.innerText = 'Save Changes';
                }, 2000);
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            console.error('Update error:', error);
            showToast('Failed to update profile.', 'error');

            // Reset button
            btn.classList.remove('saving');
            saveIcon.className = 'fas fa-save';
            saveText.innerText = 'Save Changes';
        }
    });
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.innerText = message;
    toast.className = 'toast ' + type;

    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    }

    // Show toast
    toast.classList.add('show');

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
