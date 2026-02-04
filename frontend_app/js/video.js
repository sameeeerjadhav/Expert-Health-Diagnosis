const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const statusText = document.getElementById('status-text');
const connectionDot = document.getElementById('connection-dot');

const recipientId = localStorage.getItem('chatRecipientId') || 1;
const senderId = localStorage.getItem('userId') || 100;
const docName = localStorage.getItem('chatRecipientName') || 'Doctor';

document.getElementById('doc-name').innerText = docName;

// WebRTC Config (Using Google STUN servers for demo)
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

let peerConnection;
let localStream;
let stompClient;

// 1. Initialize
async function init() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        connectSignaling();
    } catch (error) {
        console.error("Error accessing media devices.", error);
        alert("Camera/Mic access denied. Please allow permissions.");
    }
}

// 2. Connect to Signaling Server (WebSocket)
function connectSignaling() {
    const socket = new SockJS('http://localhost:8080/ws-chat');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function (frame) {
        statusText.innerText = 'Server Connected. Ready to Call.';
        connectionDot.style.background = 'green';

        // Subscribe to my own signal channel to receive offers/answers
        stompClient.subscribe(`/topic/video/${senderId}`, function (message) {
            handleSignalMessage(JSON.parse(message.body));
        });

    }, function () {
        statusText.innerText = 'Disconnected';
        connectionDot.style.background = 'red';
    });
}

// 3. Send Signal (Offer/Answer/Candidate)
function sendSignal(type, data) {
    const message = {
        type: type,
        senderId: senderId,
        recipientId: recipientId,
        sdp: data.sdp || null,
        candidate: data.candidate || null
    };
    stompClient.send("/app/video/signal", {}, JSON.stringify(message));
}

// 4. Start Call (Caller Side)
async function startCall() {
    // First, notify the recipient about incoming call
    sendSignal('CALL_NOTIFICATION', {
        callerName: localStorage.getItem('userName') || 'Someone',
        callerId: senderId
    });

    // Then create peer connection and send offer
    createPeerConnection();

    // Create Offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    sendSignal('OFFER', { sdp: JSON.stringify(offer) });
    statusText.innerText = 'Calling...';
}

// 5. Handle Incoming Signals
async function handleSignalMessage(message) {
    if (message.senderId == senderId) return; // Ignore own messages

    if (message.type === 'OFFER') {
        // Receiver Side - Show incoming call modal
        statusText.innerText = 'Incoming Call...';
        showIncomingCallModal(message);

    } else if (message.type === 'ANSWER') {
        // Caller Side receives Answer
        const answer = JSON.parse(message.sdp);
        await peerConnection.setRemoteDescription(answer);
        statusText.innerText = 'Connected';

    } else if (message.type === 'CANDIDATE') {
        // Add ICE Candidate
        if (peerConnection) {
            const candidate = JSON.parse(message.candidate);
            await peerConnection.addIceCandidate(candidate);
        }
    } else if (message.type === 'REJECT') {
        // Call was rejected
        statusText.innerText = 'Call Rejected';
        alert('The call was rejected');
        setTimeout(() => {
            window.location.href = 'chat.html';
        }, 1000);
    }
}

// 6. Create Peer Connection Helper
function createPeerConnection() {
    if (peerConnection) return;

    peerConnection = new RTCPeerConnection(rtcConfig);

    // Add Local Tracks
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle Remote Stream
    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Handle ICE Candidates
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            sendSignal('CANDIDATE', { candidate: JSON.stringify(event.candidate) });
        }
    };
}

// 7. Controls
function toggleMute() {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    document.getElementById('mic-icon').className = audioTrack.enabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
}

function toggleVideo() {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    document.getElementById('video-icon').className = videoTrack.enabled ? 'fas fa-video' : 'fas fa-video-slash';
}

function endCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    window.location.href = 'dashboard.html';
}

// Incoming Call Modal
let pendingOffer = null;

function showIncomingCallModal(message) {
    pendingOffer = message;

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'incoming-call-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 16px; text-align: center; max-width: 400px;">
            <i class="fas fa-video" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
            <h2 style="margin: 1rem 0;">Incoming Video Call</h2>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">${docName} is calling you...</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="rejectCall()" style="padding: 12px 24px; border-radius: 8px; border: none; background: var(--danger); color: white; cursor: pointer; font-size: 1rem;">
                    <i class="fas fa-phone-slash"></i> Reject
                </button>
                <button onclick="acceptCall()" style="padding: 12px 24px; border-radius: 8px; border: none; background: var(--success); color: white; cursor: pointer; font-size: 1rem;">
                    <i class="fas fa-phone"></i> Accept
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function acceptCall() {
    const modal = document.getElementById('incoming-call-modal');
    if (modal) modal.remove();

    if (!pendingOffer) return;

    statusText.innerText = 'Connecting...';
    createPeerConnection();

    const offer = JSON.parse(pendingOffer.sdp);
    await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendSignal('ANSWER', { sdp: JSON.stringify(answer) });
    statusText.innerText = 'Connected';
    pendingOffer = null;
}

function rejectCall() {
    const modal = document.getElementById('incoming-call-modal');
    if (modal) modal.remove();

    // Send rejection signal
    if (pendingOffer) {
        sendSignal('REJECT', {});
    }

    pendingOffer = null;
    statusText.innerText = 'Call Rejected';

    // Return to dashboard after 2 seconds
    setTimeout(() => {
        window.location.href = 'chat.html';
    }, 2000);
}

// Init on load
init();
