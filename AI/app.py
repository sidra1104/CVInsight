# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import re
from nltk.tokenize import TreebankWordTokenizer
from nltk.corpus import stopwords
import nltk

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Load model
MODEL_PATH = 'C:/Users/sidra/OneDrive/Desktop/ResumeAnalyzer/AI/models/resume_classifier.pkl'
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded from {os.path.abspath(MODEL_PATH)}")
except Exception as e:
    print(f"❌ Model loading failed: {e}")
    model = None

# Reuse your cleaning function
def clean_text(text):
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    tokenizer = TreebankWordTokenizer()
    tokens = tokenizer.tokenize(text.lower())
    tokens = [word for word in tokens if word not in stopwords.words('english')]
    return ' '.join(tokens)

# API Routes
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ready"})

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' field"}), 400
            
        cleaned_text = clean_text(data['text'])
        prediction = model.predict([cleaned_text])[0]
        probabilities = model.predict_proba([cleaned_text])[0]
        
        # Get top 5 categories
        categories = model.classes_
        prob_tuples = list(zip(categories, probabilities))
        sorted_probs = sorted(prob_tuples, key=lambda x: x[1], reverse=True)[:5]
        
        return jsonify({
            "predicted_category": prediction,
            "top_matches": [
                {"category": cat, "probability": round(float(prob), 4)} 
                for cat, prob in sorted_probs
            ],
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)