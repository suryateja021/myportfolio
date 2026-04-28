document.addEventListener('DOMContentLoaded', () => {
    // Fetch data and initialize
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderPortfolio(data);
            initAdmin(data);
        });

    function renderPortfolio(data) {
        // Render Bio
        document.getElementById('hero-title').textContent = data.bio.title;
        document.getElementById('avatar').src = data.bio.avatar;
        document.getElementById('bio-description').textContent = data.bio.description;
        document.getElementById('location').textContent = data.bio.location;
        document.getElementById('resume-link').href = data.bio.resume_url;

        // Render Social Links
        const socialContainer = document.getElementById('social-links');
        if (data.bio.social) {
            socialContainer.innerHTML = Object.entries(data.bio.social).map(([platform, url]) => `
                <a href="${url}" target="_blank" style="color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em;">${platform}</a>
            `).join('');
        }

        // Render Skills
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = Object.entries(data.skills).map(([category, items]) => `
            <div class="skill-category">
                <h3>${category}</h3>
                <div class="skill-list">
                    ${items.map(skill => `<span class="tech-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `).join('');

        // Render Education
        const eduContainer = document.getElementById('education-container');
        eduContainer.innerHTML = data.education.map(edu => `
            <div class="edu-item">
                <div class="edu-info">
                    <h3>${edu.degree}</h3>
                    <p style="color: var(--primary-accent);">${edu.institution}</p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${edu.duration}</p>
                </div>
                <div class="edu-score">${edu.score}</div>
            </div>
        `).join('');

        // Render Projects
        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = data.projects.map(project => `
            <div class="project-card">
                <div class="project-img" style="background-image: url('${project.image}')"></div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">${project.description}</p>
                    <div class="project-tech">
                        ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Render Certifications
        const certsContainer = document.getElementById('certs-container');
        certsContainer.innerHTML = data.certifications.map(cert => `
            <div class="cert-card">
                <h3>${cert.name}</h3>
                <span class="cert-issuer">${cert.issuer}</span>
            </div>
        `).join('');

        // Render Updates
        renderUpdates(data.updates);
    }

    function renderUpdates(updates) {
        const updatesContainer = document.getElementById('updates-container');
        const localUpdates = JSON.parse(localStorage.getItem('portfolio_updates') || '[]');
        const allUpdates = [...localUpdates, ...updates].sort((a, b) => new Date(b.date) - new Date(a.date));

        updatesContainer.innerHTML = allUpdates.map(update => `
            <div class="update-item">
                <span class="update-date">${new Date(update.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <p>${update.content}</p>
            </div>
        `).join('');
    }

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        
        setTimeout(() => {
            alert('Thank you! Your message has been sent successfully.');
            btn.textContent = originalText;
            contactForm.reset();
        }, 1500);
    });

    // Admin Logic
    function initAdmin(data) {
        const adminBtn = document.getElementById('admin-btn');
        const adminPanel = document.getElementById('admin-panel');
        const adminPass = document.getElementById('admin-pass');
        const adminActions = document.getElementById('admin-actions');
        const postUpdateBtn = document.getElementById('post-update-btn');
        const updateContent = document.getElementById('update-content');
        const closeAdmin = document.getElementById('close-admin');

        adminBtn.addEventListener('click', () => {
            adminPanel.style.display = 'block';
        });

        closeAdmin.addEventListener('click', () => {
            adminPanel.style.display = 'none';
        });

        adminPass.addEventListener('input', (e) => {
            if (e.target.value === 'admin123') {
                adminActions.style.display = 'block';
                adminPass.style.display = 'none';
            }
        });

        postUpdateBtn.addEventListener('click', () => {
            const content = updateContent.value;
            if (!content) return;

            const newUpdate = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                content: content,
                type: 'work'
            };

            const localUpdates = JSON.parse(localStorage.getItem('portfolio_updates') || '[]');
            localUpdates.unshift(newUpdate);
            localStorage.setItem('portfolio_updates', JSON.stringify(localUpdates));

            renderUpdates(data.updates);
            updateContent.value = '';
            adminPanel.style.display = 'none';
            adminActions.style.display = 'none';
            adminPass.style.display = 'block';
            adminPass.value = '';
        });
    }
});
