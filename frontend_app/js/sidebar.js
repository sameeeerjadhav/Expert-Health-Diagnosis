// Sidebar Component
function initSidebar() {
    const sidebarContainer = document.getElementById('app-sidebar');
    if (!sidebarContainer) return;

    const userRole = localStorage.getItem('userRole') || 'PATIENT';
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';

    // Define Menu Items
    const menuItems = {
        'PATIENT': [
            { name: 'Dashboard', icon: 'fa-home', link: 'dashboard.html' },
            { name: 'Assessment', icon: 'fa-heartbeat', link: 'assessment.html' },
            { name: 'Appointments', icon: 'fa-calendar-check', link: 'appointments.html' },
            { name: 'Messages', icon: 'fa-comments', link: 'chat.html' },
            { name: 'Profile', icon: 'fa-user-circle', link: 'profile.html' }
        ],
        'DOCTOR': [
            { name: 'Dashboard', icon: 'fa-home', link: 'dashboard.html' },
            { name: 'Appointments', icon: 'fa-calendar-check', link: 'appointments.html' },
            { name: 'My Patients', icon: 'fa-users', link: 'dashboard.html' },
            { name: 'Messages', icon: 'fa-comments', link: 'chat.html' },
            { name: 'Profile', icon: 'fa-user-circle', link: 'profile.html' }
        ],
        'ADMIN': [
            { name: 'Dashboard', icon: 'fa-home', link: 'admin-dashboard.html' },
            { name: 'Users', icon: 'fa-users-cog', link: 'admin-users.html' },
            { name: 'Appointments', icon: 'fa-calendar-alt', link: 'admin-appointments.html' },
            { name: 'Questions', icon: 'fa-question-circle', link: 'admin-questions.html' },
            { name: 'Profile', icon: 'fa-user-circle', link: 'profile.html' }
        ]
    };

    // Get items for role (fallback to Patient)
    const items = menuItems[userRole] || menuItems['PATIENT'];

    // Build HTML with new structure
    let navHtml = `
        <div class="sidebar-header">
            <div class="logo-icon-wrapper">
                <i class="fas fa-heartbeat logo-icon"></i>
            </div>
            <div class="logo-text">ExpertHealth</div>
        </div>
        
        <nav class="sidebar-nav">
            <ul class="nav-list">
    `;

    items.forEach(item => {
        const isActive = currentPage === item.link ? 'active' : '';
        navHtml += `
            <li class="nav-item-wrapper">
                <a href="${item.link}" class="nav-item ${isActive}">
                    <span class="nav-icon"><i class="fas ${item.icon}"></i></span>
                    <span class="nav-label">${item.name}</span>
                    ${isActive ? '<span class="active-indicator"></span>' : ''}
                </a>
            </li>
        `;
    });

    navHtml += `
            </ul>
        </nav>
    `;

    // User Mini Profile at bottom
    navHtml += `
        <div class="sidebar-footer">
            <div class="theme-toggle-container" style="margin-bottom: 15px; padding: 0 10px;">
                <button id="theme-toggle-btn" onclick="window.toggleTheme()" class="btn btn-outline" style="width: 100%; border-color: rgba(255,255,255,0.2); color: var(--text-sidebar); display: flex; justify-content: center; gap: 8px;">
                    <i class="fas fa-moon"></i> <span>Dark Mode</span>
                </button>
            </div>
            <div class="user-mini-profile">
                <div class="user-avatar-small">${userRole.charAt(0)}</div>
                <div class="user-info-mini">
                    <div class="user-name-mini" id="sidebar-user-name">Loading...</div>
                    <div class="user-role-label">${userRole}</div>
                </div>
                <button onclick="logout()" class="logout-btn-mini" title="Logout">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        </div>
    `;

    sidebarContainer.innerHTML = navHtml;

    // Fetch real name
    fetchUserName();
}

// Auto Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = 'auth.html';
}

// Global Theme Logic
window.toggleTheme = function () {
    const isDark = document.body.classList.toggle('theme-oled-dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
};

function applyThemeOnLoad() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('theme-oled-dark');
    }
}

function updateThemeUI(isDark) {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        if (isDark) {
            btn.innerHTML = '<i class="fas fa-sun"></i> <span>Light Mode</span>';
        } else {
            btn.innerHTML = '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
        }
    }
}

// Call immediately to avoid flash
applyThemeOnLoad();

// Update UI after sidebar renders
document.addEventListener('DOMContentLoaded', () => {
    updateThemeUI(document.body.classList.contains('theme-oled-dark'));
});


async function fetchUserName() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const isLocalDev = window.location.hostname === 'localhost' && window.location.port !== '' && window.location.port !== '80';
        const API_BASE = isLocalDev ? 'http://localhost:8080/api' : '/api';
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        if (response.ok) {
            const user = await response.json();
            const nameDisplay = document.getElementById('sidebar-user-name');
            if (nameDisplay) nameDisplay.innerText = user.fullName;
        }
    } catch (e) { console.error(e); }
}
