from flask import Flask, request, jsonify, send_from_directory
import os
import cohere
from dotenv import load_dotenv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Load environment variables from a .env file
load_dotenv()

# Set the static_folder to 'static' where index.html is located
app = Flask(__name__, static_folder='static', static_url_path='/static')

# --- Cohere AI Client Initialization ---
try:
    api_key = os.getenv("COHERE_API_KEY")
    if not api_key:
        raise ValueError("COHERE_API_KEY not found in environment variables.")
    co = cohere.Client(api_key)
    MODEL_NAME = "command-r-plus"
except Exception as e:
    print(f"FATAL: Cohere client could not be initialized. {e}")
    co = None

# --- CORRECTED: Main Route to Serve index.html from the 'static' folder ---
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# --- API Endpoint for Resume Generation ---
@app.route('/generate-resume', methods=['POST'])
def generate_resume():
    if not co:
        return jsonify({'error': "AI service is not configured on the server."}), 500
    try:
        data = request.json
        prompt_parts = [f"**{key.replace('_', ' ').title()}:**\n{value}" for key, value in data.items() if value]
        details_text = "\n\n".join(prompt_parts)

        final_prompt = f"""
Generate a professional, ATS-optimized, plain-text resume based on the following details.
Organize the information into standard sections (Summary, Contact, Skills, Experience, Education, etc.).
Ensure the output is clean, well-formatted, and ready to be copied. Do not add any conversational text, just the resume itself.

Resume Details:
---
{details_text}
---
"""
        response = co.chat(message=final_prompt, model=MODEL_NAME, temperature=0.25)
        return jsonify({'resume': response.text})
    except Exception as e:
        print(f"Error in /generate-resume: {e}")
        return jsonify({'error': f"Could not generate resume. {str(e)}"}), 500

# --- NEW: API Endpoint for AI-Powered ATS Check ---
@app.route('/check-ats', methods=['POST'])
def check_ats():
    if not co:
        return jsonify({'error': "AI service is not configured on the server."}), 500
    try:
        data = request.json
        resume = data.get('resume', '')
        job_description = data.get('jobDescription', '')

        if not resume or not job_description:
            return jsonify({'error': 'Resume and Job Description are both required.'}), 400

        prompt = f"""
Act as an expert ATS (Applicant Tracking System) reviewer. Analyze the provided resume against the job description.

1.  **Match Score:** Provide a percentage score (0-100%) indicating how well the resume aligns with the job's key requirements.
2.  **Keyword Analysis:** Identify critical keywords and skills from the job description. List which are present in the resume and which are MISSING.
3.  **Actionable Feedback:** Provide a concise, bulleted list of specific, actionable suggestions for improving the resume's ATS compatibility for this exact job.

**Resume Text:**
---
{resume}
---

**Job Description:**
---
{job_description}
---

**ATS Analysis:**
"""
        response = co.chat(message=prompt, model=MODEL_NAME, temperature=0.2)
        return jsonify({'analysis': response.text})
    except Exception as e:
        print(f"Error in /check-ats: {e}")
        return jsonify({'error': f"An unexpected error occurred during ATS analysis: {str(e)}"}), 500

# --- NEW: API Endpoint for Sending Email ---
@app.route('/send-resume-email', methods=['POST'])
def send_resume_email():
    try:
        data = request.json
        hr_email = data['hrEmail']
        resume_text = data['resume']
        user_name = data.get('name', 'a candidate')

        sender_email = os.environ.get('SENDER_EMAIL')
        sender_password = os.environ.get('SENDER_PASSWORD')

        if not sender_email or not sender_password:
            return jsonify({'success': False, 'error': 'Email service is not configured on the server.'}), 500

        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = hr_email
        msg['Subject'] = f"Resume Submission from {user_name}"
        
        body = f"Hello,\n\nPlease find my resume included below.\n\nBest regards,\n{user_name}"
        msg.attach(MIMEText(body, 'plain'))
        msg.attach(MIMEText(f"\n\n--- Resume ---\n\n{resume_text}", 'plain'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
            
        return jsonify({'success': True})
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({'success': False, 'error': f"Failed to send email. Check server logs."}), 500

if __name__ == '__main__':
    # Using host='0.0.0.0' is important for services like Render
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))