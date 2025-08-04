import os
import google.generativeai as genai
import streamlit as st
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Check if API key is set
if not api_key:
    st.error("❌ Gemini API key is missing! Set it using environment variables.")
    st.stop()

# Configure Gemini with the API key
genai.configure(api_key=api_key)

# Define the correct model
MODEL_NAME = "gemini-1.5-pro-latest"

# Streamlit app configuration
st.set_page_config(page_title="Gemini Resume Generator", layout="centered")

# UI Styling
st.markdown("""
    <style>
        .title {text-align: center; font-size: 2.5em; font-weight: bold; color: #4CAF50;}
        .subtitle {font-size: 1.2em; color: #555;}
        .footer {text-align: center; font-size: 0.9em; color: #999; margin-top: 50px;}
    </style>
""", unsafe_allow_html=True)

# UI Title
st.markdown('<div class="title">🤖 Gemini Resume Generator</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Fill in your information to generate an ATS-optimized resume</div>', unsafe_allow_html=True)

# Input Fields
name = st.text_input("Full Name")
job_title = st.text_input("Job Title")
experience = st.text_area("Work Experience", height=150)
skills = st.text_area("Skills", height=100)
education = st.text_input("Education (e.g., B.Tech in CSE, XYZ University)")

# Resume generator function
def generate_resume(name, job_title, experience, skills, education):
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
        return response.text if response else "⚠ No response from Gemini AI."
    except Exception as e:
        return f"⚠ Error: {str(e)}"

# Generate and display resume
if st.button("🚀 Generate Resume"):
    if name and job_title:
        output = generate_resume(name, job_title, experience, skills, education)
        st.subheader("📄 Generated Resume")
        st.text_area("Resume", output, height=350)
        st.download_button("📥 Download Resume", output, file_name=f"{name}_resume.txt", mime="text/plain")
    else:
        st.warning("⚠ Please enter at least your name and job title.")

# Footer
st.markdown('<div class="footer">Made with ❤️ using Gemini & Streamlit</div>', unsafe_allow_html=True)
