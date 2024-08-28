const express = require('express');
const path = require('path');
const { setupSignalingServer, getContributingPeers } = require('./p2p');
const { runLLMTask } = require('./llm');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

setupSignalingServer(server);

app.post('/llm-task', async (req, res) => {
    const { prompt } = req.body;
    const contributingPeers = getContributingPeers();
    const numPeers = contributingPeers.length;

    if (numPeers === 0) {
        return res.status(500).json({ error: 'No contributing peers available' });
    }

    // Split the prompt into chunks based on the number of contributing peers
    const chunkSize = Math.ceil(prompt.length / numPeers);
    const tasks = [];

    for (let i = 0; i < numPeers; i++) {
        const peerId = contributingPeers[i].peerId;
        const chunk = prompt.slice(i * chunkSize, (i + 1) * chunkSize);
        tasks.push(runLLMTask(peerId, chunk));
    }

    try {
        // Run all tasks in parallel
        const results = await Promise.all(tasks);
        const combinedResult = results.join(' ');
        res.json({ result: combinedResult });
    } catch (error) {
        console.error('Error during task processing:', error);
        res.status(500).json({ error: 'LLM task failed' });
    }
});

app.get('/stats', (req, res) => {
    const contributingPeers = getContributingPeers();
    res.json({
        contributingPeers: contributingPeers.length,
        peers: contributingPeers
    });
});

// Add a route for devices to join the network
app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/join.html'));
});
