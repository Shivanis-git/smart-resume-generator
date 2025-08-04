document.getElementById('resumeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const experience = document.getElementById('experience').value.trim();
    const skills = document.getElementById('skills').value.trim();
    const education = document.getElementById('education').value.trim();

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
            body: JSON.stringify({ name, jobTitle, experience, skills, education })
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
