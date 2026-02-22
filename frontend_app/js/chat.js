const isLocalDev = window.location.hostname === 'localhost' && window.location.port !== '' && window.location.port !== '80';
const API_BASE = isLocalDev ? 'http://localhost:8080/api' : '/api';
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole') || 'PATIENT';
let senderId = null; // Will be fetched

// DOM Elements
const listContainer = document.getElementById('chat-list');
const messagesArea = document.getElementById('messages-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const emptyState = document.getElementById('empty-state');
const chatWrapper = document.getElementById('chat-wrapper');
const headerName = document.getElementById('chat-header-name');
const headerStatus = document.getElementById('chat-header-status');
const headerAvatar = document.getElementById('chat-header-avatar');

// State
let currentRecipientId = null;
let currentRecipientName = null;
let stompClient = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[CHAT] DOMContentLoaded fired');
    console.log('[CHAT] Token:', token ? 'Present' : 'Missing');
    console.log('[CHAT] User Role:', userRole);
    console.log('[CHAT] List Container:', listContainer);

    if (!token) {
        console.error('[CHAT] No token found, redirecting to login');
        window.location.href = 'auth.html';
        return;
    }

    console.log('[CHAT] Fetching current user...');
    // Fetch current user info to get user ID
    await fetchCurrentUser();

    console.log('[CHAT] Rendering chat list...');
    renderChatList();

    console.log('[CHAT] Connecting WebSocket...');
    connectWebSocket();

    // Check if we should auto-open a chat (from doctors page)
    const chatRecipientId = localStorage.getItem('chatRecipientId');
    const chatRecipientName = localStorage.getItem('chatRecipientName');
    if (chatRecipientId && chatRecipientName) {
        console.log('[CHAT] Auto-opening chat with:', chatRecipientName);
        const initial = chatRecipientName.charAt(0).toUpperCase();
        selectChat(parseInt(chatRecipientId), chatRecipientName, initial);
        // Clear the localStorage items
        localStorage.removeItem('chatRecipientId');
        localStorage.removeItem('chatRecipientName');
    }

    // Event Listeners
    sendBtn.addEventListener('click', () => {
        sendMessage(messageInput.value);
    });

    // Allow Enter key to send
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(messageInput.value);
    });

    console.log('[CHAT] Initialization complete');
});

async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = 'auth.html';
            return;
        }
        const user = await response.json();
        senderId = user.id;
        console.log('Current user ID:', senderId);
    } catch (error) {
        console.error('Error fetching user info:', error);
        alert('Failed to load user information. Please refresh.');
    }
}

// --- User Listing Logic ---

async function renderChatList() {
    console.log('[CHAT] renderChatList() called');
    console.log('[CHAT] listContainer element:', listContainer);

    if (!listContainer) {
        console.error('[CHAT] listContainer not found!');
        return;
    }

    listContainer.innerHTML = '<div style="text-align: center; padding: 1rem;">Loading...</div>';

    try {
        let endpoint = userRole === 'DOCTOR' ? '/users/patients' : '/users/doctors';
        console.log('[CHAT] Fetching from endpoint:', `${API_BASE}${endpoint}`);
        console.log('[CHAT] User role:', userRole);

        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('[CHAT] Response status:', response.status);
        console.log('[CHAT] Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[CHAT] API Error:', errorText);
            throw new Error('Failed to fetch contacts: ' + response.status);
        }

        const contacts = await response.json();
        console.log('[CHAT] Contacts received:', contacts.length, contacts);

        listContainer.innerHTML = '';

        if (contacts.length === 0) {
            console.log('[CHAT] No contacts found');
            listContainer.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 1rem;">No contacts found.</div>';
            return;
        }

        console.log('[CHAT] Rendering', contacts.length, 'contacts');
        contacts.forEach(contact => {
            const initial = (contact.fullName || 'U').charAt(0).toUpperCase();
            const item = document.createElement('div');
            item.className = 'chat-list-item';
            // Set data-id for selection highlighting
            item.setAttribute('data-id', contact.id);

            // Use contact.id for selection
            item.onclick = () => selectChat(contact.id, contact.fullName, initial);

            item.innerHTML = `
                <div class="chat-avatar-container">
                    <div class="chat-avatar">${initial}</div>
                    <div class="chat-status-indicator status-online"></div>
                </div>
                <div class="chat-info">
                    <div class="chat-name">${contact.fullName}</div>
                    <div class="chat-preview">${contact.email || ''}</div>
                </div>
            `;
            listContainer.appendChild(item);
        });

        console.log('[CHAT] Contact list rendered successfully');

    } catch (error) {
        console.error('[CHAT] List Error:', error);
        listContainer.innerHTML = '<div style="text-align: center; color: var(--danger); padding: 1rem;">Error loading contacts.<br><small>' + error.message + '</small></div>';
    }
}

async function selectChat(id, name, initial) {
    currentRecipientId = id;
    currentRecipientName = name;

    // Update UI
    emptyState.style.display = 'none';
    chatWrapper.style.display = 'flex'; // It's a flex column

    headerName.innerText = name;
    headerStatus.innerText = 'Online'; // Mock status
    headerAvatar.innerText = initial || name.charAt(0);

    // Update Active State
    document.querySelectorAll('.chat-list-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-id') == id) {
            item.classList.add('active');
        }
    });

    // Load chat history
    await loadChatHistory(id);
}

async function loadChatHistory(recipientId) {
    try {
        messagesArea.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 1rem; font-size: 0.8rem;">Loading conversation...</div>';

        const response = await fetch(`${API_BASE}/chat/history/${senderId}/${recipientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load history');

        const messages = await response.json();

        messagesArea.innerHTML = '';

        if (messages.length === 0) {
            messagesArea.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 1rem; font-size: 0.8rem;">Start of conversation</div>';
        } else {
            messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = 'message';

                if (msg.senderId === senderId) {
                    bubble.classList.add('msg-sent');
                } else {
                    bubble.classList.add('msg-received');
                }

                // Add message content and timestamp
                bubble.innerHTML = `
                    <div>${msg.content}</div>
                    <div class="message-timestamp">${formatMessageTime(msg.timestamp)}</div>
                `;
                messagesArea.appendChild(bubble);
            });
        }

        messagesArea.scrollTop = messagesArea.scrollHeight;
    } catch (error) {
        console.error('History error:', error);
        messagesArea.innerHTML = '<div style="text-align: center; color: var(--danger); padding: 1rem; font-size: 0.8rem;">Failed to load conversation history</div>';
    }
}

// --- WebSocket Logic ---

function connectWebSocket() {
    if (!senderId) {
        console.error('Cannot connect WebSocket without user ID');
        return;
    }

    const socket = new SockJS('/ws-chat');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Quiet mode

    stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame);

        // Subscribe to user-specific topic
        stompClient.subscribe('/topic/messages/' + senderId, (messageOutput) => {
            const msg = JSON.parse(messageOutput.body);
            displayMessage(msg);
        });
    }, (error) => {
        console.error('STOMP Error:', error);
    });
}

function sendMessage(content) {
    if (!content.trim()) return;
    if (!stompClient || !currentRecipientId) {
        alert('Select a contact first or check connection.');
        return;
    }

    const chatMessage = {
        senderId: senderId,
        recipientId: currentRecipientId,
        content: content,
        timestamp: new Date().toISOString()
    };

    // Display the message immediately on sender's screen
    const bubble = document.createElement('div');
    bubble.className = 'message msg-sent';
    bubble.innerHTML = `
        <div>${content}</div>
        <div class="message-timestamp">${formatMessageTime(new Date().toISOString())}</div>
    `;
    messagesArea.appendChild(bubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Send via WebSocket
    stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
    messageInput.value = '';
}

function displayMessage(msg) {
    // Only display if this message belongs to current open chat
    const isMyMessage = (msg.senderId === senderId);
    const isFromCurrentChat = (msg.senderId === currentRecipientId);

    // If current chat is not open, ignore
    if (!currentRecipientId) return;

    // Only show if I sent it to current recipient OR if I received it from current recipient
    if (!isMyMessage && !isFromCurrentChat) return;
    if (isMyMessage && msg.recipientId !== currentRecipientId) return;

    const bubble = document.createElement('div');
    bubble.className = 'message';

    if (isMyMessage) {
        bubble.classList.add('msg-sent');
        bubble.innerHTML = `
            <div>${msg.content}</div>
            <div class="message-timestamp">${formatMessageTime(msg.timestamp || new Date().toISOString())}</div>
        `;
    } else {
        bubble.classList.add('msg-received');
        bubble.innerHTML = `
            <div>${msg.content}</div>
            <div class="message-timestamp">${formatMessageTime(msg.timestamp || new Date().toISOString())}</div>
        `;
    }

    messagesArea.appendChild(bubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Video Call Function
function startVideoCall() {
    if (!currentRecipientId || !currentRecipientName) {
        alert('Please select a contact first');
        return;
    }

    // Store recipient info for video call page
    localStorage.setItem('chatRecipientId', currentRecipientId);
    localStorage.setItem('chatRecipientName', currentRecipientName);
    localStorage.setItem('userId', senderId);

    // Navigate to video call page
    window.location.href = 'video.html';
}

// Helper function to format message timestamps
function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    // If within last 24 hours, show time only
    if (diffMins < 1440) { // 24 hours
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    // If yesterday
    if (diffMins < 2880) { // 48 hours
        return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    // Otherwise show date and time
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}


// Send heartbeat to update online status
async function sendHeartbeat() {
    try {
        await fetch(`/users/heartbeat`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ` }
        });
    } catch (error) {
        console.error('Heartbeat failed:', error);
    }
}

// Check user online status
async function checkUserStatus(userId) {
    try {
        const response = await fetch(`/users//status`, {
            headers: { 'Authorization': `Bearer ` }
        });
        if (response.ok) {
            const data = await response.json();
            return data.isOnline;
        }
    } catch (error) {
        console.error('Status check failed:', error);
    }
    return false;
}

// Update online status in chat header
async function updateOnlineStatus() {
    if (!currentRecipientId) return;
    const isOnline = await checkUserStatus(currentRecipientId);
    if (headerStatus) {
        if (isOnline) {
            headerStatus.textContent = 'Online';
            headerStatus.style.color = 'var(--success)';
        } else {
            headerStatus.textContent = 'Offline';
            headerStatus.style.color = 'var(--text-muted)';
        }
    }
}

// Start heartbeat and status checking
setInterval(() => { sendHeartbeat(); updateOnlineStatus(); }, 30000);
sendHeartbeat();
setTimeout(updateOnlineStatus, 1000);

// ===== MESSAGE SEARCH FUNCTIONALITY =====
let searchActive = false;
let searchResults = [];
let currentSearchIndex = 0;

function searchMessages(query) {
    if (!query.trim()) {
        clearSearch();
        return;
    }

    searchActive = true;
    searchResults = [];
    currentSearchIndex = 0;

    const messages = document.querySelectorAll('.message');
    messages.forEach((msg, index) => {
        const text = msg.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            searchResults.push(index);
            msg.style.backgroundColor = '#fff3cd';
        } else {
            msg.style.backgroundColor = '';
        }
    });

    if (searchResults.length > 0) {
        scrollToSearchResult(0);
    }
}

function scrollToSearchResult(index) {
    if (searchResults.length === 0) return;
    currentSearchIndex = index;
    const messages = document.querySelectorAll('.message');
    const targetIndex = searchResults[currentSearchIndex];
    messages[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    messages[targetIndex].style.backgroundColor = '#ffc107';
}

function clearSearch() {
    searchActive = false;
    document.querySelectorAll('.message').forEach(msg => {
        msg.style.backgroundColor = '';
    });
}

// ===== UNREAD MESSAGE INDICATORS =====
async function getUnreadCount(senderId) {
    try {
        const response = await fetch(`${API_BASE}/chat/unread-count/${senderId}/${currentRecipientId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Failed to get unread count:', error);
    }
    return 0;
}

async function markMessagesAsRead(senderId) {
    try {
        await fetch(`${API_BASE}/chat/mark-read/${senderId}/${currentRecipientId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Failed to mark messages as read:', error);
    }
}

// ===== FILE UPLOAD FUNCTIONALITY =====
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', senderId);

    try {
        const response = await fetch(`${API_BASE}/chat/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('File upload error:', error);
        alert('Failed to upload file');
        return null;
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    // Show upload progress
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    uploadFile(file).then(data => {
        if (data) {
            // Send message with attachment
            const content = file.type.startsWith('image/')
                ? `<img src="${data.url}" style="max-width: 100%; border-radius: 8px;" alt="${data.filename}"/>`
                : `<a href="${data.url}" download="${data.filename}"><i class="fas fa-file"></i> ${data.filename}</a>`;

            sendMessageWithAttachment(content, data.url, data.type);
        }

        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-paperclip"></i>';
        }
        event.target.value = ''; // Reset file input
    });
}

// Extended sendMessage to support attachments
function sendMessageWithAttachment(content, attachmentUrl = null, attachmentType = null) {
    if (!content.trim() && !attachmentUrl) return;
    if (!stompClient || !currentRecipientId) {
        alert('Select a contact first or check connection.');
        return;
    }

    const chatMessage = {
        senderId: senderId,
        recipientId: currentRecipientId,
        content: content,
        timestamp: new Date().toISOString(),
        attachmentUrl: attachmentUrl,
        attachmentType: attachmentType
    };

    // Display the message immediately on sender's screen
    const bubble = document.createElement('div');
    bubble.className = 'message msg-sent';
    bubble.innerHTML = `
        <div>${content}</div>
        <div class="message-timestamp">${formatMessageTime(new Date().toISOString())}</div>
    `;
    messagesArea.appendChild(bubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Send via WebSocket
    stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
    if (messageInput) messageInput.value = '';
}
// Add this to chat.js for receiving video call notifications

// Listen for video call notifications via WebSocket
if (stompClient) {
    stompClient.subscribe(`/topic/video-call/${senderId}`, (notification) => {
        const callData = JSON.parse(notification.body);
        showIncomingVideoCallNotification(callData);
    });
}

function showIncomingVideoCallNotification(callData) {
    // Create notification popup
    const notification = document.createElement('div');
    notification.id = 'video-call-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 50px; height: 50px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-video" style="color: white; font-size: 1.5rem;"></i>
            </div>
            <div>
                <div style="font-weight: 600; font-size: 1rem;">Incoming Video Call</div>
                <div style="color: var(--text-muted); font-size: 0.85rem;">${callData.callerName}</div>
            </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
            <button onclick="declineVideoCall()" style="flex: 1; padding: 10px; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                <i class="fas fa-times"></i> Decline
            </button>
            <button onclick="acceptVideoCall()" style="flex: 1; padding: 10px; border: none; background: var(--success); color: white; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                <i class="fas fa-video"></i> Join Call
            </button>
        </div>
    `;

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 30 seconds if not answered
    setTimeout(() => {
        const notif = document.getElementById('video-call-notification');
        if (notif) notif.remove();
    }, 30000);
}

function acceptVideoCall() {
    const notification = document.getElementById('video-call-notification');
    if (notification) notification.remove();

    // Navigate to video call page
    window.location.href = 'video.html';
}

function declineVideoCall() {
    const notification = document.getElementById('video-call-notification');
    if (notification) notification.remove();

    // Optionally send decline signal to caller
    // (would need to be implemented)
}
