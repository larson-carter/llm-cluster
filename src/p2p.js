const WebSocket = require('ws');
const os = require('os');

const peers = {}; // Store connected peers and their specs

function setupSignalingServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        const peerId = generatePeerId();
        ws.peerId = peerId;

        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);
            handleSignalingMessage(peerId, parsedMessage, ws);
        });

        ws.on('close', () => {
            delete peers[peerId];
        });

        // Send a request to the client for its specs
        ws.send(JSON.stringify({ type: 'requestSpecs' }));
    });
}

function handleSignalingMessage(peerId, message, ws) {
    switch (message.type) {
        case 'specs':
            peers[peerId] = { ws, specs: message.specs };
            break;
        case 'offer':
        case 'answer':
        case 'candidate':
            if (message.targetPeerId && peers[message.targetPeerId]) {
                peers[message.targetPeerId].ws.send(JSON.stringify({
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

function getConnectedPeers() {
    return Object.keys(peers).map(peerId => ({
        peerId,
        specs: peers[peerId].specs,
    }));
}

module.exports = { setupSignalingServer, getConnectedPeers };
