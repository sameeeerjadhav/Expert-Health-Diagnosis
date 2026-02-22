const isLocalDev = window.location.hostname === 'localhost' && window.location.port !== '' && window.location.port !== '80';
const API_BASE = isLocalDev ? 'http://localhost:8080/api/auth' : '/api/auth';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function toggleAuth() {
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('token', result.token);
            alert('Login Successful!');
            // Redirect to dashboard (we will create this next)
            window.location.href = 'dashboard.html';
        } else {
            alert('Login Failed: Check credentials or Register first.');
        }
    } catch (error) {
        console.error(error);
        alert('Network Error: Ensure Backend is running on port 8080');
    }
});

// Handle Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Registration Successful! Please Login.');
            toggleAuth();
        } else {
            alert('Registration Failed: Email might be taken.');
        }
    } catch (error) {
        console.error(error);
        alert('Network Error');
    }
});
