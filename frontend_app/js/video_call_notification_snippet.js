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
