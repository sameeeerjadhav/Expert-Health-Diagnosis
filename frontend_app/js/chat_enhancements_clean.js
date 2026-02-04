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
