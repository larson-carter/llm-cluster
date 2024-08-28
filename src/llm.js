const { execFile } = require('child_process');
const path = require('path');

function runLLMTask(prompt) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'run_llm.py');

        execFile('python3', [scriptPath, prompt], (error, stdout, stderr) => {
            if (error) {
                reject(stderr || error.message);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

module.exports = { runLLMTask };
