document.addEventListener('DOMContentLoaded', () => {
    // Global state
    window.isAdminLoggedIn = false;
    window.editingUpdateId = null;

    // Fetch data and initialize
    let portfolioData = null;
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            portfolioData = data;
            renderPortfolio(data);
            initAdmin(data);
        });

    function renderPortfolio(data) {
        // Render Bio
        document.getElementById('hero-title').textContent = data.bio.title;
        document.getElementById('avatar').src = data.bio.avatar;
        document.getElementById('bio-description').textContent = data.bio.description;
        document.getElementById('location').textContent = data.bio.location;
        document.getElementById('email').textContent = data.bio.email;
        document.getElementById('phone').textContent = data.bio.phone;
        document.getElementById('resume-link').href = data.bio.resume_url;

        // Render Social Links
        const socialContainer = document.getElementById('social-links');
        if (data.bio.social) {
            const icons = {
                github: 'fa-github',
                linkedin: 'fa-linkedin',
                leetcode: 'fa-code',
                twitter: 'fa-twitter'
            };
            socialContainer.innerHTML = Object.entries(data.bio.social).map(([platform, url]) => `
                <a href="${url}" target="_blank" style="color: var(--text-secondary); text-decoration: none; font-size: 1.5rem; transition: color 0.3s ease;">
                    <i class="fab ${icons[platform] || 'fa-link'}"></i>
                </a>
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
            <a href="${cert.url}" target="_blank" class="cert-link">
                <div class="cert-card">
                    <h3>${cert.name}</h3>
                    <span class="cert-issuer">${cert.issuer}</span>
                </div>
            </a>
        `).join('');

        // Render Repositories
        const reposContainer = document.getElementById('repos-container');
        reposContainer.innerHTML = data.all_repos.map(repo => `
            <div class="repo-card">
                <div>
                    <h3>${repo.name}</h3>
                    <p>${repo.description}</p>
                </div>
                <a href="${repo.url}" target="_blank" class="repo-link">View Repo →</a>
            </div>
        `).join('');

        // Render Highlights
        document.getElementById('personal-skills-container').innerHTML = data.personal_skills.map(skill => `
            <li class="tech-tag">${skill}</li>
        `).join('');

        document.getElementById('activities-container').innerHTML = data.activities.map(act => `
            <li>${act}</li>
        `).join('');

        document.getElementById('hobbies-container').innerHTML = data.hobbies.map(hobby => `
            <li>${hobby}</li>
        `).join('');

        // Render Updates
        renderUpdates(data.updates);
    }

    function renderUpdates(updates) {
        const updatesContainer = document.getElementById('updates-container');
        const localUpdates = JSON.parse(localStorage.getItem('portfolio_updates') || '[]');
        const deletedIds = JSON.parse(localStorage.getItem('portfolio_deleted_ids') || '[]');
        
        // Filter out deleted static updates
        const filteredStatic = updates.filter(u => !deletedIds.includes(u.id));
        
        const allUpdates = [...localUpdates, ...filteredStatic].sort((a, b) => new Date(b.date) - new Date(a.date));

        updatesContainer.innerHTML = allUpdates.map(update => `
            <div class="update-item" data-id="${update.id}">
                <div class="update-header">
                    <span class="update-date">${new Date(update.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    ${window.isAdminLoggedIn ? `
                        <div class="admin-controls">
                            <button class="edit-btn" onclick="window.editUpdate(${update.id})" title="Edit Update"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" onclick="window.deleteUpdate(${update.id})" title="Delete Update"><i class="fas fa-trash"></i></button>
                        </div>
                    ` : ''}
                </div>
                <p>${update.content}</p>
            </div>
        `).join('');
    }

    // Admin Action Globals
    window.deleteUpdate = (id) => {
        if (!confirm('Are you sure you want to delete this update?')) return;
        
        let localUpdates = JSON.parse(localStorage.getItem('portfolio_updates') || '[]');
        const index = localUpdates.findIndex(u => u.id === id);
        
        if (index !== -1) {
            localUpdates.splice(index, 1);
            localStorage.setItem('portfolio_updates', JSON.stringify(localUpdates));
        } else {
            let deletedIds = JSON.parse(localStorage.getItem('portfolio_deleted_ids') || '[]');
            if (!deletedIds.includes(id)) {
                deletedIds.push(id);
                localStorage.setItem('portfolio_deleted_ids', JSON.stringify(deletedIds));
            }
        }
        renderUpdates(portfolioData.updates);
    };

    window.editUpdate = (id) => {
        const localUpdates = JSON.parse(localStorage.getItem('portfolio_updates') || '[]');
        const allUpdates = [...localUpdates, ...portfolioData.updates];
        const update = allUpdates.find(u => u.id === id);
        
        if (update) {
            window.editingUpdateId = id;
            document.getElementById('admin-panel').style.display = 'block';
            document.getElementById('admin-actions').style.display = 'block';
            document.getElementById('admin-pass').style.display = 'none';
            document.getElementById('update-content').value = update.content;
            document.getElementById('post-update-btn').textContent = 'Update Activity';
        }
    };

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

    // Scroll to Top Logic
    const scrollTopBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            if (window.isAdminLoggedIn) {
                adminActions.style.display = 'block';
                adminPass.style.display = 'none';
            }
        });

        closeAdmin.addEventListener('click', () => {
            adminPanel.style.display = 'none';
            window.editingUpdateId = null;
            postUpdateBtn.textContent = 'Post Update';
            updateContent.value = '';
        });

        adminPass.addEventListener('input', (e) => {
            if (e.target.value === 'adminsurya') {
                window.isAdminLoggedIn = true;
                adminActions.style.display = 'block';
                adminPass.style.display = 'none';
                renderUpdates(data.updates);
            }
        });

        postUpdateBtn.addEventListener('click', () => {
            const content = updateContent.value;
            if (!content) return;

            let localUpdates = JSON.parse(localStorage.getItem('portfolio_updates') || '[]');

            if (window.editingUpdateId) {
                const index = localUpdates.findIndex(u => u.id === window.editingUpdateId);
                if (index !== -1) {
                    localUpdates[index].content = content;
                    localStorage.setItem('portfolio_updates', JSON.stringify(localUpdates));
                } else {
                    // Editing a static update
                    const newUpdate = {
                        id: window.editingUpdateId,
                        date: new Date().toISOString().split('T')[0],
                        content: content,
                        type: 'work'
                    };
                    localUpdates.unshift(newUpdate);
                    localStorage.setItem('portfolio_updates', JSON.stringify(localUpdates));
                    
                    let deletedIds = JSON.parse(localStorage.getItem('portfolio_deleted_ids') || '[]');
                    deletedIds.push(window.editingUpdateId);
                    localStorage.setItem('portfolio_deleted_ids', JSON.stringify(deletedIds));
                }
                window.editingUpdateId = null;
                postUpdateBtn.textContent = 'Post Update';
            } else {
                const newUpdate = {
                    id: Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    content: content,
                    type: 'work'
                };
                localUpdates.unshift(newUpdate);
                localStorage.setItem('portfolio_updates', JSON.stringify(localUpdates));
            }

            renderUpdates(data.updates);
            updateContent.value = '';
            adminPanel.style.display = 'none';
        });
    }
});
