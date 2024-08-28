const WebSocket = require('ws');

const peers = {}; // Store connected peers and their specs
const contributingPeers = {}; // Store contributing peers

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
            delete contributingPeers[peerId];
        });

        // Add peer to the general peers list
        peers[peerId] = { ws };
        // Send a request to the client for its specs
        ws.send(JSON.stringify({ type: 'requestSpecs' }));
    });
}

function handleSignalingMessage(peerId, message, ws) {
    switch (message.type) {
        case 'specs':
            peers[peerId].specs = message.specs;
            break;
        case 'joinNetwork':
            contributingPeers[peerId] = peers[peerId]; // Add to contributing peers
            console.log(`Peer ${peerId} joined as a contributor`);
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

function getContributingPeers() {
    return Object.keys(contributingPeers).map(peerId => ({
        peerId,
        specs: contributingPeers[peerId].specs,
    }));
}

module.exports = { setupSignalingServer, getContributingPeers };
