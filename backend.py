from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv

app = Flask(__name__, static_folder="static")
CORS(app)

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)
MODEL_NAME = "gemini-1.5-pro-latest"

@app.route('/generate-resume', methods=['POST'])
def generate_resume():
    data = request.json
    name = data.get('name', '')
    job_title = data.get('jobTitle', '')
    experience = data.get('experience', '')
    skills = data.get('skills', '')
    education = data.get('education', '')
    prompt = f"""
Generate a simple, ATS-optimized resume for the following person:

Name: {name}
Target Job Title: {job_title}
Skills: {skills}
Experience: {experience}
Education: {education}

Include sections: Summary, Skills, Experience, and Education. Use plain formatting.
Do not add tables or columns.
Return only the resume text.
"""
    try:
        model = genai.GenerativeModel(model_name=MODEL_NAME)
        response = model.generate_content(prompt)
        return jsonify({'resume': response.text if response else "⚠ No response from Gemini AI."})
    except Exception as e:
        return jsonify({'resume': f"⚠ Error: {str(e)}"}), 500

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True)
