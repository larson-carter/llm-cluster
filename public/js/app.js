const ws = new WebSocket(`ws://${window.location.host}`);

let peerConnection;
const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case 'welcome':
            console.log('Connected as peer:', message.peerId);
            break;
        case 'offer':
            handleOffer(message);
            break;
        case 'answer':
            handleAnswer(message);
            break;
        case 'candidate':
            handleCandidate(message);
            break;
        case 'task':
            handleIncomingTask(message);
            break;
        case 'taskResult':
            handleTaskResult(message);
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
};

function handleOffer(message) {
    peerConnection = new RTCPeerConnection(config);
    peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
    peerConnection.createAnswer().then(answer => {
        peerConnection.setLocalDescription(answer);
        ws.send(JSON.stringify({
            type: 'answer',
            answer: answer,
            targetPeerId: message.fromPeerId
        }));
    });

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: 'candidate',
                candidate: event.candidate,
                targetPeerId: message.fromPeerId
            }));
        }
    };
}

function handleAnswer(message) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
}

function handleCandidate(message) {
    peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
}

function handleTaskResult(message) {
    displayMessage('LLM', message.result);
}

document.getElementById('send-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;

    displayMessage('User', userInput);
    document.getElementById('user-input').value = '';

    const response = await fetch('/llm-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput }),
    });
    const data = await response.json();
    displayMessage('LLM', data.result);
});

function displayMessage(sender, text) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}
