const { execFile } = require('child_process');
const path = require('path');

function runLLMTask(peerId, prompt) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'run_llm.py');

        console.log(`Assigning task to peer ${peerId}: "${prompt}"`);

        execFile('python3', [scriptPath, prompt], (error, stdout, stderr) => {
            if (error) {
                console.error(`Error from peer ${peerId}:`, stderr || error.message);
                reject(stderr || error.message);
            } else {
                console.log(`Result received from peer ${peerId}: "${stdout.trim()}"`);
                resolve(stdout.trim());
            }
        });
    });
}

module.exports = { runLLMTask };
