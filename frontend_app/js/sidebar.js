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
    window.location.href = 'index.html';
}

async function fetchUserName() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:8080/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            const nameDisplay = document.getElementById('sidebar-user-name');
            if (nameDisplay) nameDisplay.innerText = user.fullName;
        }
    } catch (e) { console.error(e); }
}
