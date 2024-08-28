# src/run_llm.py
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load the tokenizer and model from the cache
model_name = "microsoft/Phi-3.5-mini-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

def generate_text(prompt):
    # Define clear boundaries and context
    conversation = f"User: {prompt}\nAI:"
    
    inputs = tokenizer(conversation, return_tensors="pt")
    
    # Generate a response with controlled length
    outputs = model.generate(
        **inputs,
        max_length=len(inputs['input_ids'][0]) + 50,  # Control response length
        temperature=0.7,  # Adjust for creativity control
        top_p=0.9,        # Use nucleus sampling
        do_sample=True    # Sampling for varied responses
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Post-processing: Clean up response without removing everything
    if "AI:" in response:
        response = response.split("AI:")[1].strip()
    
    # Ensure we're not returning a blank response
    if not response:
        response = "I'm sorry, I didn't understand that. Could you please rephrase?"

    return response

if __name__ == "__main__":
    import sys
    prompt = sys.argv[1] if len(sys.argv) > 1 else ""
    print(generate_text(prompt))
