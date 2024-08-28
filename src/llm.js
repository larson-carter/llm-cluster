const { HfInference } = require('@huggingface/inference');
const inference = new HfInference('<YOUR_HUGGING_FACE_API_KEY>');

async function runLLMTask(prompt) {
    const result = await inference.textGeneration({
        model: 'gpt2',
        inputs: prompt,
        parameters: { max_new_tokens: 50 }
    });

    return result.generated_text;
}

module.exports = { runLLMTask };
