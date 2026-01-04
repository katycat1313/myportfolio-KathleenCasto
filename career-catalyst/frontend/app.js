// Career Catalyst AI - Frontend Application

const API_BASE = 'http://localhost:3000/api';

// State Management
const state = {
    resumeText: '',
    skillsAnalysis: null,
    jobs: [],
    currentJob: null,
    salaryValidation: null
};

// DOM Elements
const sections = {
    hero: document.getElementById('hero-section'),
    onboarding: document.getElementById('onboarding-section'),
    dashboard: document.getElementById('dashboard-section')
};

const elements = {
    startBtn: document.getElementById('start-btn'),
    analyzeBtn: document.getElementById('analyze-btn'),
    resumeInput: document.getElementById('resume-input'),
    resumeFile: document.getElementById('resume-file'),
    uploadResumeBtn: document.getElementById('upload-resume-btn'),
    fileName: document.getElementById('file-name'),
    desiredPosition: document.getElementById('desired-position'),
    desiredSalary: document.getElementById('desired-salary'),
    currentLocation: document.getElementById('current-location'),
    desiredLocation: document.getElementById('desired-location'),
    githubUsername: document.getElementById('github-username'),
    portfolioUrl: document.getElementById('portfolio-url'),
    linkedinUrl: document.getElementById('linkedin-url'),
    otherUrl: document.getElementById('other-url'),
    credentialContext: document.getElementById('credential-context'),
    loading: document.getElementById('loading'),
    jobsGrid: document.getElementById('jobs-grid'),
    jobCount: document.getElementById('job-count'),
    salaryCard: document.getElementById('salary-card'),
    salaryDetails: document.getElementById('salary-details'),
    salaryVerdict: document.getElementById('salary-verdict'),
    qualityCard: document.getElementById('quality-card'),
    qualityDetails: document.getElementById('quality-details'),
    qualityRating: document.getElementById('quality-rating'),
    modal: document.getElementById('application-modal'),
    newSearchBtn: document.getElementById('new-search-btn')
};

// Navigation
function showSection(sectionName) {
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    sections[sectionName].classList.add('active');
}

// Event Listeners
elements.startBtn.addEventListener('click', () => {
    showSection('onboarding');
});

elements.analyzeBtn.addEventListener('click', handleAnalyze);
elements.newSearchBtn.addEventListener('click', () => {
    showSection('onboarding');
});

// File Upload Handling
elements.uploadResumeBtn.addEventListener('click', () => {
    elements.resumeFile.click();
});

elements.resumeFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    elements.fileName.textContent = `📄 ${file.name}`;

    try {
        const text = await parseResumeFile(file);
        elements.resumeInput.value = text;
    } catch (error) {
        alert('Failed to parse resume file. Please try copy-pasting the text instead.');
        console.error(error);
    }
});

// Parse resume file (PDF, DOCX, TXT)
async function parseResumeFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'txt') {
        return await file.text();
    } else if (extension === 'pdf') {
        // For PDF, we'll send to backend to parse
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch(`${API_BASE}/parse-resume`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to parse PDF');
        const data = await response.json();
        return data.text;
    } else if (extension === 'docx') {
        // For DOCX, we'll send to backend to parse
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch(`${API_BASE}/parse-resume`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to parse DOCX');
        const data = await response.json();
        return data.text;
    } else {
        throw new Error('Unsupported file format');
    }
}

// Main Analysis Flow
async function handleAnalyze() {
    const resumeText = elements.resumeInput.value.trim();
    const position = elements.desiredPosition.value.trim();
    const salary = parseInt(elements.desiredSalary.value);
    const currentLocation = elements.currentLocation.value.trim();
    const desiredLocation = elements.desiredLocation.value.trim();

    // Collect credentials
    const credentials = {
        github: elements.githubUsername.value.trim(),
        portfolio: elements.portfolioUrl.value.trim(),
        linkedin: elements.linkedinUrl.value.trim(),
        other: elements.otherUrl.value.trim(),
        context: elements.credentialContext.value.trim()
    };

    if (!resumeText) {
        alert('Please provide your resume or background information');
        return;
    }

    if (!position || !salary) {
        alert('Please provide desired position and salary');
        return;
    }

    state.resumeText = resumeText;

    // Show loading
    elements.analyzeBtn.disabled = true;
    elements.loading.classList.remove('hidden');

    try {
        // Step 1: Analyze Resume
        const skillsAnalysis = await analyzeResume(resumeText);
        state.skillsAnalysis = skillsAnalysis;

        // Step 2: Validate Salary
        const salaryValidation = await validateSalary(position, salary, skillsAnalysis, currentLocation);
        state.salaryValidation = salaryValidation;

        // Step 3: Assess Quality (if credentials provided)
        if (credentials.github || credentials.portfolio || credentials.linkedin || credentials.other) {
            const qualityAssessment = await assessQuality(credentials, position);
            state.qualityAssessment = qualityAssessment;
        }

        // Step 4: Search Jobs
        const searchQueries = skillsAnalysis.suggested_roles.map(role => role.title);
        const jobs = await searchJobs(searchQueries, desiredLocation || 'Remote', skillsAnalysis.skills);
        state.jobs = jobs;

        // Show Dashboard
        showDashboard();
    } catch (error) {
        console.error('Analysis error:', error);
        alert('Something went wrong. Please try again.');
    } finally {
        elements.analyzeBtn.disabled = false;
        elements.loading.classList.add('hidden');
    }
}

// API Calls
async function analyzeResume(resumeText) {
    const response = await fetch(`${API_BASE}/analyze-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
    });

    if (!response.ok) throw new Error('Failed to analyze resume');
    return await response.json();
}

async function validateSalary(position, desiredSalary, skillsAnalysis, location = '') {
    const response = await fetch(`${API_BASE}/validate-salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, desiredSalary, skillsAnalysis, location })
    });

    if (!response.ok) throw new Error('Failed to validate salary');
    return await response.json();
}

async function searchJobs(queries, location, skills) {
    const response = await fetch(`${API_BASE}/search-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries, location, skills })
    });

    if (!response.ok) throw new Error('Failed to search jobs');
    const data = await response.json();
    return data.jobs;
}

async function customizeApplication(job) {
    const response = await fetch(`${API_BASE}/customize-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            resume: state.resumeText,
            jobPosting: job
        })
    });

    if (!response.ok) throw new Error('Failed to customize application');
    return await response.json();
}

async function getNetworkingStrategy(job) {
    const response = await fetch(`${API_BASE}/networking-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            job: job,
            userResume: state.resumeText
        })
    });

    if (!response.ok) throw new Error('Failed to get networking strategy');
    return await response.json();
}

async function assessQuality(credentials, targetRole) {
    const response = await fetch(`${API_BASE}/assess-quality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials, targetRole })
    });

    if (!response.ok) throw new Error('Failed to assess quality');
    return await response.json();
}

// Dashboard Rendering
function showDashboard() {
    showSection('dashboard');
    renderSalaryCard();
    renderQualityCard();
    renderJobs();
}

function renderSalaryCard() {
    if (!state.salaryValidation) return;

    const { verdict, your_target, market_data, recommendation, alternative_roles } = state.salaryValidation;

    elements.salaryCard.classList.remove('hidden');
    elements.salaryVerdict.textContent = verdict.replace('-', ' ').toUpperCase();
    elements.salaryVerdict.className = `badge ${verdict}`;

    let html = `
        <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 8px;">Your Target: ${your_target}</h4>
            ${market_data ? `
                <p style="color: var(--text-secondary); margin-bottom: 4px;">
                    Market Median: ${market_data.median}
                </p>
                <p style="color: var(--text-secondary); margin-bottom: 4px;">
                    Market Range: ${market_data.range}
                </p>
                <p style="font-size: 12px; color: var(--text-secondary);">
                    Based on ${market_data.data_points} data points
                </p>
            ` : ''}
        </div>
        
        <p style="margin-bottom: 16px;">${recommendation}</p>
    `;

    if (alternative_roles && alternative_roles.length > 0) {
        html += `
            <h4 style="margin-top: 20px; margin-bottom: 12px;">Consider These Roles:</h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${alternative_roles.map(role => `
                    <div style="background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: 12px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${role.title}</div>
                        <div style="color: #4ade80; font-size: 14px; margin-bottom: 8px;">${role.salary_range}</div>
                        <div style="color: var(--text-secondary); font-size: 14px;">${role.reasoning}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    elements.salaryDetails.innerHTML = html;
}

function renderQualityCard() {
    if (!state.qualityAssessment) return;

    const { overall_rating, overall_level, should_share, strengths, critical_issues,
        honest_verdict, action_plan, realistic_salary_range } = state.qualityAssessment;

    elements.qualityCard.classList.remove('hidden');
    elements.qualityRating.textContent = `${overall_rating}/10 - ${overall_level.toUpperCase()}`;
    elements.qualityRating.className = 'badge ' + (overall_rating >= 7 ? 'on-target' : overall_rating >= 5 ? 'undervalued' : 'overreaching');

    let html = `
        <div style="background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid ${overall_rating >= 7 ? '#4ade80' : overall_rating >= 5 ? '#fbbf24' : '#f87171'};">
            <h4 style="font-size: 16px; margin-bottom: 12px;">💡 Honest Verdict</h4>
            <p style="font-size: 15px; font-style: italic;">${honest_verdict}</p>
        </div>
    `;

    if (strengths && strengths.length > 0) {
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 12px;">✅ Strengths</h4>
                <ul style="list-style: none; padding: 0;">
                    ${strengths.map(s => `<li style="padding: 8px 0; color: #4ade80;">• ${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (critical_issues && critical_issues.length > 0) {
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 12px;">⚠️ Critical Issues</h4>
                <ul style="list-style: none; padding: 0;">
                    ${critical_issues.map(i => `<li style="padding: 8px 0; color: #f87171;">• ${i}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (should_share) {
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 12px;">📎 Should You Share?</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${should_share.github !== undefined ? `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 20px;">${should_share.github ? '✅' : '❌'}</span>
                            <span>GitHub: ${should_share.github ? 'Yes, share it!' : 'Not yet - fix issues first'}</span>
                        </div>
                    ` : ''}
                    ${should_share.portfolio !== undefined ? `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 20px;">${should_share.portfolio ? '✅' : '❌'}</span>
                            <span>Portfolio: ${should_share.portfolio ? 'Yes, share it!' : 'Not yet - needs work'}</span>
                        </div>
                    ` : ''}
                    ${should_share.linkedin !== undefined ? `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 20px;">${should_share.linkedin ? '✅' : '❌'}</span>
                            <span>LinkedIn: ${should_share.linkedin ? 'Yes, share it!' : 'Improve first'}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    if (realistic_salary_range) {
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 8px;">💰 Realistic Salary Range</h4>
                <p style="color: #4ade80; font-size: 18px; font-weight: 600;">${realistic_salary_range}</p>
            </div>
        `;
    }

    if (action_plan) {
        html += `
            <div>
                <h4 style="margin-bottom: 16px;">📋 Action Plan</h4>
                ${action_plan.urgent ? `
                    <div style="margin-bottom: 16px;">
                        <h5 style="color: #f87171; margin-bottom: 8px;">🚨 URGENT (This Week)</h5>
                        <ul style="list-style: none; padding-left: 0;">
                            ${action_plan.urgent.map(a => `<li style="padding: 4px 0;">• ${a}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${action_plan.short_term ? `
                    <div style="margin-bottom: 16px;">
                        <h5 style="color: #fbbf24; margin-bottom: 8px;">📅 Short-term (This Month)</h5>
                        <ul style="list-style: none; padding-left: 0;">
                            ${action_plan.short_term.map(a => `<li style="padding: 4px 0;">• ${a}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${action_plan.long_term ? `
                    <div>
                        <h5 style="color: #3b82f6; margin-bottom: 8px;">🎯 Long-term (3-6 Months)</h5>
                        <ul style="list-style: none; padding-left: 0;">
                            ${action_plan.long_term.map(a => `<li style="padding: 4px 0;">• ${a}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    elements.qualityDetails.innerHTML = html;
}

function renderJobs() {
    elements.jobCount.textContent = `${state.jobs.length} jobs found`;

    elements.jobsGrid.innerHTML = state.jobs.map(job => `
        <div class="job-card" onclick="openJobModal('${job.id}')">
            <div class="job-card-header">
                <div>
                    <h4>${job.title}</h4>
                    <div class="company">${job.company}</div>
                </div>
                <div class="match-score">${job.match_score}%</div>
            </div>
            
            <div class="location">📍 ${job.location}</div>
            
            ${job.salary_min || job.salary_max ? `
                <div class="salary">
                    ${job.salary_min ? `$${Math.round(job.salary_min / 1000)}K` : ''}
                    ${job.salary_min && job.salary_max ? ' - ' : ''}
                    ${job.salary_max ? `$${Math.round(job.salary_max / 1000)}K` : ''}
                </div>
            ` : ''}
            
            <div class="job-tags">
                <span class="tag">${job.source}</span>
                ${job.employment_type ? `<span class="tag">${job.employment_type}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Modal Handling
async function openJobModal(jobId) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;

    state.currentJob = job;

    // Show modal
    elements.modal.classList.remove('hidden');
    document.getElementById('modal-job-title').textContent = job.title;

    // Show loading in tabs
    document.getElementById('resume-content').innerHTML = '<div class="loading"><div class="spinner"></div><p>Customizing your resume...</p></div>';
    document.getElementById('cover-content').innerHTML = '<div class="loading"><div class="spinner"></div><p>Writing cover letter...</p></div>';
    document.getElementById('network-content').innerHTML = '<div class="loading"><div class="spinner"></div><p>Building networking strategy...</p></div>';

    // Load content
    try {
        const [application, networking] = await Promise.all([
            customizeApplication(job),
            getNetworkingStrategy(job)
        ]);

        // Render Resume
        document.getElementById('resume-content').innerHTML = `
            <div style="background: rgba(255, 255, 255, 0.03); padding: 24px; border-radius: 12px; white-space: pre-wrap; line-height: 1.8;">
                ${application.resume.customized}
            </div>
        `;

        // Render Cover Letter
        document.getElementById('cover-content').innerHTML = `
            <div style="background: rgba(255, 255, 255, 0.03); padding: 24px; border-radius: 12px; white-space: pre-wrap; line-height: 1.8;">
                ${application.cover_letter.content}
            </div>
        `;

        // Render Networking Strategy
        document.getElementById('network-content').innerHTML = `
            <h3 style="margin-bottom: 16px;">🎯 Target Contacts</h3>
            ${networking.target_contacts.map(contact => `
                <div style="background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">${contact.title}</div>
                    <div style="color: var(--text-secondary); font-size: 14px;">${contact.reason}</div>
                </div>
            `).join('')}

            <h3 style="margin: 24px 0 16px;">💬 Connection Message Template</h3>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                ${networking.outreach_strategy.connection_message}
            </div>

            <h3 style="margin: 24px 0 16px;">📅 Action Timeline</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${Object.entries(networking.timeline).map(([key, value]) => `
                    <div style="display: flex; gap: 16px;">
                        <div style="font-weight: 600; min-width: 80px;">${key.replace('_', ' ')}:</div>
                        <div style="color: var(--text-secondary);">${value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Modal loading error:', error);
        alert('Failed to load application materials. Please try again.');
    }
}

// Modal Tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        // Update tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panes
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Modal Close
document.getElementById('close-modal').addEventListener('click', () => {
    elements.modal.classList.add('hidden');
});

// Copy Buttons
document.getElementById('copy-resume').addEventListener('click', () => {
    const text = document.getElementById('resume-content').innerText;
    navigator.clipboard.writeText(text);
    alert('Resume copied to clipboard!');
});

document.getElementById('copy-cover').addEventListener('click', () => {
    const text = document.getElementById('cover-content').innerText;
    navigator.clipboard.writeText(text);
    alert('Cover letter copied to clipboard!');
});

// Mark as Applied
document.getElementById('mark-applied').addEventListener('click', () => {
    if (state.currentJob) {
        alert(`Marked as applied: ${state.currentJob.title} at ${state.currentJob.company}`);
        elements.modal.classList.add('hidden');
        // TODO: Save to tracking system
    }
});

// Initialize
console.log('🚀 Career Catalyst AI loaded and ready!');

// ========== Chat Interface ==========
const chatElements = {
    toggle: document.getElementById('chat-toggle'),
    interface: document.getElementById('chat-interface'),
    close: document.getElementById('close-chat'),
    messages: document.getElementById('chat-messages'),
    input: document.getElementById('chat-input'),
    send: document.getElementById('send-chat')
};

// Show chat toggle when dashboard is visible
function enableChat() {
    if (chatElements.toggle) {
        chatElements.toggle.classList.remove('hidden');
    }
}

// Toggle chat interface
if (chatElements.toggle) {
    chatElements.toggle.addEventListener('click', () => {
        chatElements.interface.classList.remove('hidden');
        chatElements.toggle.classList.add('hidden');
        chatElements.input.focus();
    });
}

if (chatElements.close) {
    chatElements.close.addEventListener('click', () => {
        chatElements.interface.classList.add('hidden');
        chatElements.toggle.classList.remove('hidden');
    });
}

// Send message
async function sendChatMessage() {
    const message = chatElements.input.value.trim();
    if (!message) return;

    // Add user message to UI
    addChatMessage(message, 'user');
    chatElements.input.value = '';

    // Show typing indicator
    const typingEl = showTypingIndicator();

    try {
        // Prepare full user context
        const userContext = {
            resume: state.resumeText,
            skillsAnalysis: state.skillsAnalysis,
            salaryValidation: state.salaryValidation,
            qualityAssessment: state.qualityAssessment,
            position: elements.desiredPosition.value,
            location: elements.currentLocation.value
        };

        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, userContext })
        });

        if (!response.ok) throw new Error('Chat failed');

        const data = await response.json();

        // Remove typing indicator
        typingEl.remove();

        // Add AI response
        addChatMessage(data.message, 'ai');
    } catch (error) {
        console.error('Chat error:', error);
        typingEl.remove();
        addChatMessage('Sorry, I encountered an error. Please try again.', 'ai');
    }
}

function addChatMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    chatElements.messages.appendChild(messageDiv);

    // Scroll to bottom
    chatElements.messages.scrollTop = chatElements.messages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatElements.messages.appendChild(typingDiv);
    chatElements.messages.scrollTop = chatElements.messages.scrollHeight;
    return typingDiv;
}

// Event listeners
if (chatElements.send) {
    chatElements.send.addEventListener('click', sendChatMessage);
}

if (chatElements.input) {
    chatElements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

// Override showDashboard to enable chat
const originalShowDashboard = showDashboard;
showDashboard = function () {
    originalShowDashboard();
    enableChat();
};
