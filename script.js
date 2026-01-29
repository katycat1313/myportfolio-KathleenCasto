/* ============================================
   Portfolio Script — Kathleen Casto
   ============================================ */

// ── Particle Canvas Background ──────────────
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;
    const PARTICLE_COUNT = 60;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createParticle() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.5 + 0.1
        };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());

    function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
            ctx.fill();
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > w) p.dx *= -1;
            if (p.y < 0 || p.y > h) p.dy *= -1;
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 150)})`;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }

    // Respect reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        draw();
    }
})();


// ── Scroll Reveal (Intersection Observer) ───
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ── Stat Counter Animation ──────────────────
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            let current = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = current;
            }, 30);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));


// ── Navbar Scroll Effect ────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// ── Hamburger Menu Toggle ───────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});


// ── Project Modal ───────────────────────────
const projectData = [
    {
        title: "MarketSim — Adaptive Agentic Learning SaaS",
        description: "A full-stack learning environment featuring an Agentic AI Mentor (ZOOMi) that analyzes user behavior and dynamically modifies content difficulty.",
        tags: ["Gemini API", "ElevenLabs", "Stripe", "n8n", "Supabase"],
        challenge: "Users learning AI enablement skills face steep learning curves with static, one-size-fits-all training content that doesn't adapt to individual progress.",
        solution: "Built an Agentic AI Mentor (ZOOMi) that analyzes user behavior in real-time and dynamically modifies content difficulty, delivering personalized coaching logic with automated feedback loops.",
        impact: "Designed for AI Enablement, reducing the user learning curve by 40% through personalized, real-time coaching logic. Full Stripe integration for monetization."
    },
    {
        title: "Raw Blocks AI (Countdown Studio) — Agentic Creative Pipeline",
        description: "A professional-grade video production platform using Modular Box Architecture and a 5-agent autonomous team.",
        tags: ["Agentic AI", "Video Production", "Modular Architecture"],
        challenge: "Creative teams spend excessive time on repetitive video production tasks, with no way to ensure AI-generated output stays ethical and brand-aligned.",
        solution: "Built a 5-agent autonomous team with Modular Box Architecture that automates creative workflows from product URL to finished video short. Engineered 'Validation Gates' for ethical, brand-aligned output.",
        impact: "Enables users to remix assets into 50+ formats with zero technical friction. Automates end-to-end creative workflows while maintaining brand integrity."
    },
    {
        title: "ccpractice — AI Conversational Skill-Builder",
        description: "A voice-to-voice training application using ElevenLabs and Gemini for soft-skill roleplay and communication upskilling.",
        tags: ["ElevenLabs", "Gemini", "n8n", "Voice AI"],
        challenge: "Professionals need realistic practice environments for communication and soft-skills without high-cost coaching sessions.",
        solution: "Built a voice-to-voice training app using ElevenLabs and Gemini to facilitate soft-skill roleplay. Utilized n8n for automated backend testing and workflow orchestration.",
        impact: "Reduced manual dev-ops overhead by 35% through n8n automation. Provides accessible, scalable communication upskilling for professionals."
    }
];

function openProjectModal(index) {
    const project = projectData[index];
    if (!project) return;
    const content = document.getElementById('projectContent');
    const tags = project.tags.map(t => `<span class="tag">${t}</span>`).join('');

    content.innerHTML = `
        <h2 class="modal-title gradient-text">${project.title}</h2>
        <div class="project-tags" style="margin-bottom:1.5rem">${tags}</div>
        <p style="color:var(--text-secondary);font-size:1.1rem;margin-bottom:2rem">${project.description}</p>
        <h3>Challenge</h3>
        <p style="margin-bottom:1.5rem;line-height:1.8">${project.challenge}</p>
        <h3>Solution</h3>
        <p style="margin-bottom:1.5rem;line-height:1.8">${project.solution}</p>
        <h3>Impact</h3>
        <p style="line-height:1.8">${project.impact}</p>
    `;

    document.getElementById('projectModal').classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeProjectModal();
        const panel = document.getElementById('chatbotPanel');
        if (panel && panel.classList.contains('active')) toggleChatbot();
    }
});


// ── Resume Download ─────────────────────────
function downloadResume() {
    const resume = `KATHLEEN CASTO
AI Enablement Specialist & Technical Product Lead
Belle, WV (Remote) | casto8586@gmail.com | (304) 543-8135
LinkedIn: linkedin.com/in/kathleencasto | GitHub: github.com/katycat1313
Portfolio: portfolio.smartintakesolutions.space

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Strategic AI Solutions Architect and Enablement Specialist with 20 years of professional experience bridging the gap between Operational Excellence and Creative Enablement. Expert at architecting Agentic AI systems and full-stack SaaS platforms that automate high-volume production while maintaining ethical standards. Specialist in AI Upskilling and Rapid Prototyping, with a proven ability to deploy functional, human-centric solutions in 7-day development cycles. Currently dedicated to helping creative teams adopt AI as a high-performance tool for Transformation, not a crutch.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL CORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AI Enablement & Transformation
  - Agentic Workflows
  - Prompt Engineering (Gemini/OpenAI)
  - AI Coaching Architecture
  - Learning Experience Design

Systems & Automation
  - n8n, Zapier, Webhook Orchestration
  - Stripe API Integration
  - Supabase & Data Pipelines
  - Full-Stack SaaS Architecture

Creative Implementation
  - Automated Video Production Pipelines
  - Behavioral Logic Mapping
  - Conversion Rate Optimization (CRO)
  - Context Management

Product Strategy
  - Modular Architecture Design
  - ROI Alignment & Business Strategy
  - Technical Liaison for Agile Teams
  - Full Product Lifecycle Management

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI PROJECT PORTFOLIO
Proof of Work — Independent AI Product Developer | 2023 – Present
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MarketSim — Adaptive Agentic Learning SaaS
  Tech: Gemini API, ElevenLabs, Stripe, n8n, Supabase
  Built an Agentic AI Mentor (ZOOMi) that analyzes user behavior in
  real-time and dynamically modifies content difficulty.
  Impact: 40% learning curve reduction through personalized coaching.

Raw Blocks AI (Countdown Studio) — Agentic Creative Pipeline
  Tech: Agentic AI, Video Production, Modular Box Architecture
  Built a 5-agent autonomous team that automates creative workflows
  from product URL to finished video short with Validation Gates.
  Impact: 50+ remix formats with zero technical friction.

ccpractice — AI Conversational Skill-Builder
  Tech: ElevenLabs, Gemini, n8n, Voice AI
  Voice-to-voice training app for soft-skill roleplay using
  ElevenLabs and Gemini with n8n automated backend testing.
  Impact: 35% reduction in manual dev-ops overhead.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Independent AI Product Developer & Technical Lead | 2023 – Present
  Architected and shipped a proprietary suite of AI-native enablement
  tools. Built MarketSim, Raw Blocks AI, and ccpractice — full-stack
  platforms with agentic AI systems, automated pipelines, and voice
  integration.

Lead Product Strategist & Digital Marketing Expert | 2013 – 2023
  Directed end-to-end technical and creative strategy for multi-million
  dollar digital campaigns, ensuring strict alignment with business ROI.
  Managed cross-functional Agile teams bridging marketing vision and
  technical execution.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION & CERTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AAS in AI Software Engineering (Accelerated Candidate)
  Maestro College
  Python, Data Structures, Machine Learning Fundamentals,
  Agentic Orchestration

Certifications:
  - Google Ads Measurement
  - Google Analytics
  - AI-Powered Conversion Optimization
`;

    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Kathleen_Casto_Resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// ── Chatbot Widget Toggle ───────────────────
let chatbotInitialized = false;

function toggleChatbot() {
    const panel = document.getElementById('chatbotPanel');
    const toggle = document.getElementById('chatbotToggle');
    panel.classList.toggle('active');
    toggle.classList.toggle('hidden');

    if (!chatbotInitialized) {
        chatbotInitialized = true;
        initializeChatbot();
    }
}

document.getElementById('chatbotToggle').addEventListener('click', toggleChatbot);


// ── Chatbot Logic ───────────────────────────
const chatState = {
    mode: 'portfolio',
    currentStep: 0,
    userName: null,
    userIntent: null,
    conversationHistory: []
};

let chatElements = {};

function initializeChatbot() {
    chatElements = {
        messagesContainer: document.getElementById('messagesContainer'),
        typingIndicator: document.getElementById('typingIndicator'),
        quickReplies: document.getElementById('quickReplies'),
        chatInput: document.getElementById('chatInput'),
        sendButton: document.getElementById('sendButton')
    };

    chatElements.sendButton.addEventListener('click', handleSendMessage);
    chatElements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    startConversation();
}

function startConversation() {
    addBotMessage("Hey there! I'm your guide to Kathleen's AI Enablement work. I'm here to show you around and answer any questions you might have.", 500, () => {
        setTimeout(() => {
            addBotMessage("What brings you here today?", 800, () => {
                showQuickReplies([
                    { text: "I'm hiring for an AI role", value: "hiring" },
                    { text: "I need AI enablement services", value: "client" },
                    { text: "Buy a digital product", value: "buy_product" },
                    { text: "Just exploring", value: "exploring" }
                ]);
            });
        }, 1500);
    });
}

function addBotMessage(text, delay, callback) {
    delay = delay || 1000;
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        const div = document.createElement('div');
        div.className = 'message bot';
        div.innerHTML = `<div class="message-avatar">AI</div><div class="message-content">${text}</div>`;
        chatElements.messagesContainer.appendChild(div);
        scrollToBottom();
        chatState.conversationHistory.push({ role: 'bot', text });
        if (callback) callback();
    }, delay);
}

function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message user';
    div.innerHTML = `<div class="message-avatar">You</div><div class="message-content">${text}</div>`;
    chatElements.messagesContainer.appendChild(div);
    scrollToBottom();
    chatState.conversationHistory.push({ role: 'user', text });
}

function handleSendMessage() {
    const msg = chatElements.chatInput.value.trim();
    if (!msg) return;
    addUserMessage(msg);
    chatElements.chatInput.value = '';
    processUserInput(msg);
}

function processUserInput(input) {
    const lower = input.toLowerCase();
    const salesKeywords = ['hire', 'project', 'need ai', 'freelance', 'help with', 'looking for', 'budget', 'timeline', 'enablement services', 'automation'];
    if (salesKeywords.some(k => lower.includes(k)) && chatState.mode === 'portfolio') {
        chatState.mode = 'sales';
        handleSalesMode(input);
    } else {
        handlePortfolioMode(input);
    }
}

function handlePortfolioMode(input) {
    const lower = input.toLowerCase();
    if (lower.includes('experience') || lower.includes('background')) {
        addBotMessage("Kathleen is an AI Enablement Specialist & Technical Product Lead with 20 years of experience bridging Operational Excellence and Creative Enablement. She architects Agentic AI systems and full-stack SaaS platforms, specializing in AI Upskilling and Rapid Prototyping with 7-day development cycles.", 1000, () => {
            setTimeout(() => {
                addBotMessage("Would you like to see some projects?", 800, () => {
                    showQuickReplies([
                        { text: "Yes, show me projects", value: "show_projects" },
                        { text: "Tell me about skills", value: "skills" }
                    ]);
                });
            }, 1500);
        });
    } else if (lower.includes('skills') || lower.includes('tools')) {
        addBotMessage("Kathleen's Technical Core:<br><br><strong>AI Enablement:</strong> Agentic Workflows, Prompt Engineering (Gemini/OpenAI), AI Coaching Architecture, Learning Experience Design<br><br><strong>Systems & Automation:</strong> n8n, Zapier, Webhook Orchestration, Stripe API, Supabase, Data Pipelines<br><br><strong>Creative Implementation:</strong> Automated Video Production, Behavioral Logic Mapping, CRO, Context Management<br><br><strong>Product Strategy:</strong> Modular Architecture, ROI Alignment, Technical Liaison for Agile Teams", 1000, () => {
            setTimeout(() => {
                showQuickReplies([
                    { text: "Show me projects", value: "show_projects" },
                    { text: "Contact information", value: "contact" }
                ]);
            }, 1500);
        });
    } else if (lower.includes('contact') || lower.includes('reach out') || lower.includes('email')) {
        addBotMessage("Great! You can reach Kathleen at:<br><br>Email: casto8586@gmail.com<br>Phone: (304) 543-8135<br>LinkedIn: <a href='https://linkedin.com/in/kathleencasto' target='_blank'>LinkedIn Profile</a><br>GitHub: <a href='https://github.com/katycat1313' target='_blank'>katycat1313</a><br>Portfolio: <a href='https://portfolio.smartintakesolutions.space' target='_blank'>portfolio.smartintakesolutions.space</a>", 1000, () => {
            setTimeout(() => {
                addBotMessage("Is there anything else you'd like to know?", 800);
            }, 1500);
        });
    } else {
        addBotMessage("I'd love to show you Kathleen's work! Let me walk you through some projects.", 1000, () => {
            setTimeout(() => showChatProjects(), 1200);
        });
    }
}

function handleSalesMode(input) {
    addBotMessage("That's exciting! I'd love to learn more about your project.", 1000, () => {
        setTimeout(() => {
            addBotMessage("What type of project are you working on?", 800, () => {
                showQuickReplies([
                    { text: "AI Automation", value: "website" },
                    { text: "Agentic AI System", value: "mobile" },
                    { text: "AI Enablement/Training", value: "design_system" },
                    { text: "Other", value: "other_project" }
                ]);
            });
        }, 1500);
    });
}

function showChatProjects() {
    addBotMessage("Here are some of Kathleen's projects. Click on any to explore in detail:", 600);
    projectData.forEach((project, i) => {
        setTimeout(() => addChatProjectCard(project, i), 800 + i * 300);
    });
    setTimeout(() => {
        addBotMessage("What would you like to know more about?", 1000, () => {
            showQuickReplies([
                { text: "Design process", value: "process" },
                { text: "See more work", value: "more_work" },
                { text: "Contact info", value: "contact" }
            ]);
        });
    }, 800 + projectData.length * 300 + 1500);
}

function addChatProjectCard(project, index) {
    const tags = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const div = document.createElement('div');
    div.className = 'message bot';
    div.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="project-card-chat" tabindex="0" role="button" aria-label="View ${project.title} details">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tags">${tags}</div>
            </div>
        </div>
    `;
    chatElements.messagesContainer.appendChild(div);
    scrollToBottom();

    const card = div.querySelector('.project-card-chat');
    card.addEventListener('click', () => openProjectModal(index));
    card.addEventListener('keypress', e => { if (e.key === 'Enter') openProjectModal(index); });
}

function showQuickReplies(replies) {
    chatElements.quickReplies.innerHTML = '';
    chatElements.quickReplies.classList.add('active');
    replies.forEach(reply => {
        const btn = document.createElement('button');
        btn.className = 'quick-reply-btn';
        btn.textContent = reply.text;
        btn.addEventListener('click', () => handleQuickReply(reply));
        chatElements.quickReplies.appendChild(btn);
    });
}

function handleQuickReply(reply) {
    addUserMessage(reply.text);
    chatElements.quickReplies.classList.remove('active');

    switch (reply.value) {
        case 'hiring':
            chatState.userIntent = 'hiring';
            addBotMessage("Wonderful! Let me show you Kathleen's work and experience.", 1000, () => {
                setTimeout(() => showChatProjects(), 1200);
            });
            break;
        case 'client':
            chatState.userIntent = 'client';
            chatState.mode = 'sales';
            handleSalesMode('I need design services');
            break;
        case 'exploring':
            chatState.userIntent = 'exploring';
            addBotMessage("Great! Feel free to browse at your own pace. What interests you most?", 1000, () => {
                setTimeout(() => {
                    showQuickReplies([
                        { text: "Show me projects", value: "show_projects" },
                        { text: "Tell me about skills", value: "skills" }
                    ]);
                }, 1500);
            });
            break;
        case 'show_projects':
            showChatProjects();
            break;
        case 'skills':
            processUserInput('skills');
            break;
        case 'contact':
            processUserInput('contact');
            break;
        case 'process':
            addBotMessage("Kathleen follows a rapid AI development process:<br><br>1. <strong>Discovery & ROI Alignment</strong> — Understanding business goals and automation opportunities<br>2. <strong>Agentic Architecture Design</strong> — Mapping workflows and modular system design<br>3. <strong>Rapid Prototyping</strong> — Functional solutions in 7-day development cycles<br>4. <strong>Validation & Ethics Gates</strong> — Ensuring AI output is ethical and brand-aligned<br>5. <strong>Enablement & Upskilling</strong> — Coaching teams to adopt AI as a high-performance tool", 1200);
            break;
        case 'website':
        case 'mobile':
        case 'design_system':
            addBotMessage(`Perfect! ${reply.text} is right in Kathleen's wheelhouse. Let me show you some relevant examples.`, 1000, () => {
                setTimeout(() => showChatProjects(), 1200);
            });
            break;
        case 'buy_product':
            initiatePayment();
            break;
        default:
            addBotMessage("Let me show you some of Kathleen's work!", 800, () => {
                setTimeout(() => showChatProjects(), 1000);
            });
    }
}

async function initiatePayment() {
    addBotMessage("Great! I'm creating a secure payment link for the 'Example Digital Product'...", 1000);
    try {
        const response = await fetch('/.netlify/functions/create-stripe-payment', { method: 'POST' });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        addBotMessage(`Please use the link below to complete your purchase. It will open in a new tab.<br><br><a href="${data.url}" target="_blank" class="payment-link">Pay Now ($10.00)</a>`, 1000);
    } catch (error) {
        console.error('Payment initiation error:', error);
        addBotMessage("I'm sorry, but I was unable to create a payment link at this time. Please try again later.", 1000);
    }
}

function showTypingIndicator() {
    chatElements.typingIndicator.classList.add('active');
    scrollToBottom();
}

function hideTypingIndicator() {
    chatElements.typingIndicator.classList.remove('active');
}

function scrollToBottom() {
    chatElements.messagesContainer.scrollTop = chatElements.messagesContainer.scrollHeight;
}
