document.getElementById('resumeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const skills = document.getElementById('skills').value.trim();
    const education = document.getElementById('education').value.trim();
    const template = document.getElementById('template').value;
    const qualification = document.getElementById('qualification')?.value.trim() || '';
    const educationDetails = document.getElementById('educationDetails')?.value.trim() || '';
    const workDetails = document.getElementById('workDetails')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const linkedin = document.getElementById('linkedin')?.value.trim() || '';
    const github = document.getElementById('github')?.value.trim() || '';
    const address = document.getElementById('address')?.value.trim() || '';
    const summary = document.getElementById('summary')?.value.trim() || '';
    const languages = document.getElementById('languages')?.value.trim() || '';
    const interests = document.getElementById('interests')?.value.trim() || '';
    const references = document.getElementById('references')?.value.trim() || '';
    // Gather custom sections
    const customSections = [];
    document.querySelectorAll('.custom-section').forEach(section => {
        const title = section.querySelector('.custom-title').value.trim();
        const content = section.querySelector('.custom-content').value.trim();
        if (title && content) customSections.push({ title, content });
    });
    // Profile photo (for preview only, not sent to backend)
    // If you want to send to backend, use FormData and base64 encode

    if (!name || !jobTitle) {
        alert('Please enter at least your name and job title.');
        return;
    }

    // Show output section and set loading state
    const outputSection = document.getElementById('outputSection');
    const resumeOutput = document.getElementById('resumeOutput');
    const downloadBtn = document.getElementById('downloadBtn');
    resumeOutput.value = 'Generating resume...';
    outputSection.style.display = 'block';
    downloadBtn.disabled = true;
    downloadBtn.title = 'Resume not ready yet';
    try {
        const response = await fetch('/generate-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, jobTitle, experience, skills, education, template, customSections, qualification, educationDetails, workDetails,
                email, phone, linkedin, github, address, summary, languages, interests, references
            })
        });
        const data = await response.json();
        if (data.resume && data.resume.length > 0) {
            resumeOutput.value = data.resume;
            downloadBtn.disabled = false;
            downloadBtn.title = 'Download your resume as a .txt file';
        } else {
            resumeOutput.value = 'No resume generated. Please try again.';
            downloadBtn.disabled = true;
            downloadBtn.title = 'Resume not available';
        }
    } catch (err) {
        resumeOutput.value = 'Error generating resume.';
        downloadBtn.disabled = true;
        downloadBtn.title = 'Resume not available';
    }
// Profile photo preview
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');
if (photoInput && photoPreview) {
    photoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            photoPreview.src = '#';
            photoPreview.style.display = 'none';
        }
    });
}

// Add custom section logic
const customSectionsDiv = document.getElementById('customSections');
const addSectionBtn = document.getElementById('addSectionBtn');
if (addSectionBtn && customSectionsDiv) {
    addSectionBtn.addEventListener('click', function() {
        const section = document.createElement('div');
        section.className = 'custom-section';
        section.style = 'background:#fafdff;border:1.5px solid #e3eafc;border-radius:14px;padding:18px 16px 12px 16px;margin-bottom:14px;box-shadow:0 2px 8px #e3eafc;position:relative;';
        section.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span style="font-size:1.1em;color:#2d6cdf;">📝</span>
                <input type="text" class="custom-title" placeholder="Section Title (e.g. Certifications)" style="flex:1 1 0;width:60%;font-weight:600;font-size:1.08em;border:1.5px solid #dbeafe;border-radius:8px;padding:8px 12px;" />
            </div>
            <textarea class="custom-content" placeholder="Section content..." rows="2" style="width:100%;margin-bottom:8px;font-size:1.05em;border-radius:8px;border:1.5px solid #dbeafe;padding:10px 14px;"></textarea>
            <button type="button" class="removeSectionBtn secondary-btn" style="position:absolute;top:10px;right:10px;padding:4px 12px;font-size:0.98em;background:#fff;color:#e25555;border:1.5px solid #e25555;">✖ Remove</button>
        `;
        section.querySelector('.removeSectionBtn').onclick = function() {
            section.remove();
        };
        customSectionsDiv.appendChild(section);
    });
}

// ATS Score logic
const atsBtn = document.getElementById('atsBtn');
const atsSection = document.getElementById('atsSection');
const atsScoreBox = document.getElementById('atsScoreBox');
const atsFeedback = document.getElementById('atsFeedback');
const closeAtsBtn = document.getElementById('closeAtsBtn');
if (atsBtn && atsSection && atsScoreBox && atsFeedback && closeAtsBtn) {
    atsBtn.addEventListener('click', function() {
        const resumeText = document.getElementById('resumeOutput').value;
        if (!resumeText || resumeText === 'Generating resume...') {
            alert('Please generate your resume first!');
            return;
        }
        // Simple ATS scoring: count keywords
        const keywords = [
            'python', 'machine learning', 'sql', 'data', 'project', 'leadership', 'communication', 'bachelor', 'master', 'experience', 'skills', 'education', 'certification', 'analysis', 'team', 'ai', 'cloud', 'aws', 'azure', 'statistics', 'research', 'internship', 'achievement', 'result', 'impact', 'problem', 'solution', 'development', 'design', 'testing', 'deployment', 'presentation', 'stakeholder', 'collaboration', 'agile', 'scrum', 'java', 'c++', 'javascript', 'react', 'node', 'database', 'visualization', 'gpa', 'award', 'honor', 'publication', 'reference'
        ];
        let score = 0;
        let found = [];
        const text = resumeText.toLowerCase();
        keywords.forEach(word => {
            if (text.includes(word)) {
                score++;
                found.push(word);
            }
        });
        const percent = Math.round((score / keywords.length) * 100);
        atsScoreBox.textContent = `ATS Score: ${percent} / 100`;
        atsFeedback.innerHTML = `Matched keywords: <b>${found.join(', ')}</b><br>Tip: Add more relevant keywords for a higher score!`;
        atsSection.style.display = 'block';
    });
    closeAtsBtn.addEventListener('click', function() {
        atsSection.style.display = 'none';
    });
}

// Email/share resume to HR
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', async function() {
        const resumeText = document.getElementById('resumeOutput').value;
        const hrEmail = document.getElementById('hrEmail').value.trim();
        if (!resumeText || resumeText === 'Generating resume...') {
            alert('Please generate your resume first!');
            return;
        }
        if (!hrEmail) {
            alert('Please enter the HR email address.');
            return;
        }
        shareBtn.disabled = true;
        shareBtn.textContent = 'Sending...';
        try {
            const response = await fetch('/send-resume-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hrEmail, resume: resumeText })
            });
            const data = await response.json();
            if (data.success) {
                alert('Resume sent to HR successfully!');
            } else {
                alert('Failed to send resume. Please try again.');
            }
        } catch (err) {
            alert('Error sending resume. Please try again.');
        }
        shareBtn.disabled = false;
        shareBtn.textContent = '📧 Send Resume to HR';
    });
}
});

document.getElementById('downloadBtn').addEventListener('click', function() {
    const text = document.getElementById('resumeOutput').value;
    if (!text || text === 'Generating resume...' || text.startsWith('Error') || text.startsWith('No resume')) {
        return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Auto-select resume text on click for easy copy
document.getElementById('resumeOutput').addEventListener('click', function() {
    this.select();
});