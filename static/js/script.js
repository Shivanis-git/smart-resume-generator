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
        section.className = 'custom-section input-group';
        section.innerHTML = `
            <label>Section Title <input type="text" class="custom-title" placeholder="e.g. Certifications" style="margin-left:8px;width:60%"></label>
            <textarea class="custom-content" placeholder="Section content..." rows="2"></textarea>
            <button type="button" class="removeSectionBtn secondary-btn" style="margin-top:4px;">Remove</button>
        `;
        section.querySelector('.removeSectionBtn').onclick = function() {
            section.remove();
        };
        customSectionsDiv.appendChild(section);
    });
}

// Email/share resume
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', function() {
        const resumeText = document.getElementById('resumeOutput').value;
        if (!resumeText || resumeText === 'Generating resume...') {
            alert('Please generate your resume first!');
            return;
        }
        const subject = encodeURIComponent('My Resume');
        const body = encodeURIComponent(resumeText);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
