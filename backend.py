
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import cohere
from dotenv import load_dotenv

app = Flask(__name__, static_folder="static")
CORS(app)

# Load environment variables
load_dotenv()
api_key = os.getenv("COHERE_API_KEY")

co = cohere.Client(api_key)
MODEL_NAME = "command-r-plus"  # or another Cohere model name


@app.route('/generate-resume', methods=['POST'])
def generate_resume():
    data = request.json
    name = data.get('name', '')
    job_title = data.get('jobTitle', '')
    experience = data.get('experience', '')
    skills = data.get('skills', '')
    education = data.get('education', '')
    qualification = data.get('qualification', '')
    education_details = data.get('educationDetails', '')
    work_details = data.get('workDetails', '')
    custom_sections = data.get('customSections', [])
    email = data.get('email', '')
    phone = data.get('phone', '')
    linkedin = data.get('linkedin', '')
    github = data.get('github', '')
    address = data.get('address', '')
    summary = data.get('summary', '')
    languages = data.get('languages', '')
    interests = data.get('interests', '')
    references = data.get('references', '')

    prompt = f"""
Generate a simple, ATS-optimized resume for the following person:

Name: {name}
Target Job Title: {job_title}
Email: {email}
Phone: {phone}
LinkedIn: {linkedin}
GitHub: {github}
Address: {address}
Summary: {summary}
Skills: {skills}
Languages: {languages}
Interests: {interests}
Experience: {experience}
Work Experience Details: {work_details}
Education: {education}
Education Details: {education_details}
Qualification Details: {qualification}
References: {references}
"""
    if custom_sections:
        for section in custom_sections:
            prompt += f"\n{section.get('title', '')}: {section.get('content', '')}"
    prompt += """

Include sections: Summary, Skills, Languages, Experience, Education, Qualifications, Interests, References, and any custom or qualification sections provided. Use plain formatting.
Do not add tables or columns.
Return only the resume text.
"""
    try:
        response = co.chat(
            model=MODEL_NAME,
            message=prompt,
            temperature=0.3,
            max_tokens=800
        )
        return jsonify({'resume': response.text if hasattr(response, 'text') else response.generations[0].text})
    except Exception as e:
        return jsonify({'resume': f"⚠ Error: {str(e)}"}), 500

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)



# --- Email sending endpoint ---
# This endpoint sends the generated resume to the specified HR email using Gmail SMTP.
# Set environment variables SENDER_EMAIL and SENDER_PASSWORD (Gmail app password) before running.
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

@app.route('/send-resume-email', methods=['POST'])
def send_resume_email():
    data = request.get_json()
    hr_email = data.get('hrEmail')
    resume = data.get('resume')
    sender_email = os.environ.get('SENDER_EMAIL')  # Your Gmail address
    sender_password = os.environ.get('SENDER_PASSWORD')  # App password

    if not hr_email or not resume or not sender_email or not sender_password:
        return jsonify({'success': False, 'error': 'Missing fields'}), 400

    try:
        # Compose the email
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = hr_email
        msg['Subject'] = "Resume from Smart Resume Generator"
        msg.attach(MIMEText(resume, 'plain'))

        # Send the email using Gmail SMTP
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, hr_email, msg.as_string())

        return jsonify({'success': True})
    except Exception as e:
        print("Email error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
