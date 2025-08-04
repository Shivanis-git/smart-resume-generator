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

    // Send data to backend for AI-powered resume generation
    document.getElementById('resumeOutput').value = 'Generating resume...';
    document.getElementById('outputSection').style.display = 'block';
    try {
        const response = await fetch('http://localhost:5000/generate-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, jobTitle, experience, skills, education })
        });
        const data = await response.json();
        document.getElementById('resumeOutput').value = data.resume;
    } catch (err) {
        document.getElementById('resumeOutput').value = 'Error generating resume.';
    }
});

document.getElementById('downloadBtn').addEventListener('click', function() {
    const text = document.getElementById('resumeOutput').value;
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
