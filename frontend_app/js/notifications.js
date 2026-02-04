// notifications.js - Real-time notification system
const API_BASE = 'http://localhost:8080/api';
const token = localStorage.getItem('token');

let notificationStompClient = null;
let currentUserId = null;

// Initialize notifications
async function initNotifications() {
    try {
        // Fetch current user ID
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const user = await response.json();
            currentUserId = user.id;

            // Load initial notifications
            await loadNotifications();

            // Connect to WebSocket for real-time updates
            connectNotificationWebSocket();
        }
    } catch (error) {
        console.error('Failed to initialize notifications:', error);
    }
}

// Connect to WebSocket
function connectNotificationWebSocket() {
    if (!currentUserId) return;

    const socket = new SockJS('http://localhost:8080/ws-chat');
    notificationStompClient = Stomp.over(socket);
    notificationStompClient.debug = null;

    notificationStompClient.connect({}, () => {
        // Subscribe to user-specific notification topic
        notificationStompClient.subscribe(`/topic/notifications/${currentUserId}`, (message) => {
            const notification = JSON.parse(message.body);
            handleNewNotification(notification);
        });
    });
}

// Load notifications from API
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const notifications = await response.json();
            renderNotifications(notifications);
            updateNotificationBadge();
        }
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

// Update unread count badge
async function updateNotificationBadge() {
    try {
        const response = await fetch(`${API_BASE}/notifications/unread-count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const badge = document.getElementById('notification-badge');
            if (badge) {
                if (data.count > 0) {
                    badge.textContent = data.count > 9 ? '9+' : data.count;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Failed to update notification badge:', error);
    }
}

// Render notifications in dropdown
function renderNotifications(notifications) {
    const container = document.getElementById('notification-list');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<div class="notification-empty">No notifications</div>';
        return;
    }

    container.innerHTML = '';
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.isRead ? 'read' : 'unread'}`;
        item.onclick = () => markNotificationAsRead(notification.id);

        const timeAgo = getTimeAgo(notification.createdAt);

        item.innerHTML = `
            <div class="notification-icon ${notification.type.toLowerCase()}">
                <i class="fas ${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${timeAgo}</div>
            </div>
        `;

        container.appendChild(item);
    });
}

// Handle new real-time notification
function handleNewNotification(notification) {
    // Show toast/alert
    showNotificationToast(notification);

    // Reload notifications list
    loadNotifications();
}

// Show toast notification
function showNotificationToast(notification) {
    // Simple toast implementation (you can use a library like Toastify)
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <i class="fas ${getNotificationIcon(notification.type)}"></i>
        <div>
            <div style="font-weight: 600;">${notification.title}</div>
            <div style="font-size: 0.85rem;">${notification.message}</div>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 5000);
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    try {
        await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        loadNotifications();
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

// Mark all as read
async function markAllNotificationsAsRead() {
    try {
        await fetch(`${API_BASE}/notifications/read-all`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        loadNotifications();
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
    }
}

// Toggle notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        if (dropdown.classList.contains('show')) {
            loadNotifications();
        }
    }
}

// Helper functions
function getNotificationIcon(type) {
    switch (type) {
        case 'APPOINTMENT': return 'fa-calendar-check';
        case 'MESSAGE': return 'fa-envelope';
        case 'SYSTEM': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notification-dropdown');
    const bell = document.getElementById('notification-bell');

    if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Auto-init if on dashboard
if (document.getElementById('notification-bell')) {
    initNotifications();
}
