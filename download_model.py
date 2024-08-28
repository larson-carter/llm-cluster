# download_phi_model.py
from transformers import AutoModelForCausalLM, AutoTokenizer

# Specify the model name
model_name = "microsoft/Phi-3.5-mini-instruct"

# Load and cache the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Test the model with a simple prompt to ensure it's working
inputs = tokenizer("Hello, how are you?", return_tensors="pt")
outputs = model.generate(**inputs, max_length=50)
print("Generated text:", tokenizer.decode(outputs[0], skip_special_tokens=True))

print("Model downloaded and ready to use!")
