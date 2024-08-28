const WebSocket = require('ws');

const peers = {}; // Store connected peers

function setupSignalingServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        const peerId = generatePeerId();
        peers[peerId] = ws;
        ws.send(JSON.stringify({ type: 'welcome', peerId }));

        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            handleSignalingMessage(peerId, parsedMessage, ws);
        });

        ws.on('close', () => {
            delete peers[peerId];
        });
    });
}

function handleSignalingMessage(peerId, message, ws) {
    switch (message.type) {
        case 'offer':
        case 'answer':
        case 'candidate':
            if (message.targetPeerId && peers[message.targetPeerId]) {
                peers[message.targetPeerId].send(JSON.stringify({
                    ...message,
                    fromPeerId: peerId,
                }));
            }
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
}

function generatePeerId() {
    return Math.random().toString(36).substring(2, 15);
}

module.exports = { setupSignalingServer };
