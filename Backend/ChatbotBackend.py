from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from langchain_ollama import OllamaLLM

app = Flask(__name__)
CORS(app)  
llm = OllamaLLM(model="qwen2.5:0.5b")  

@app.route('/api/chat', methods=['POST'])  
def chat():
    user_input = request.json.get('input', '')  
    response = llm.invoke(input=user_input)  
    return jsonify({'response': response})  

if __name__ == '__main__':
    app.run(port=5002)  
