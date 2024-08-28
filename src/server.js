const express = require('express');
const path = require('path');
const { setupSignalingServer } = require('./p2p');
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
    try {
        const result = await runLLMTask(prompt);
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'LLM task failed' });
    }
});
