const chatState = {
    mode: 'portfolio',
    currentStep: 0,
    userName: null,
    userIntent: null,
    conversationHistory: []
};

let elements = {};

document.addEventListener('DOMContentLoaded', () => {
    initializeChatbot();
});

function initializeChatbot() {
    elements = {
        welcomeScreen: document.getElementById('welcomeScreen'),
        chatContainer: document.getElementById('chatContainer'),
        messagesContainer: document.getElementById('messagesContainer'),
        typingIndicator: document.getElementById('typingIndicator'),
        quickReplies: document.getElementById('quickReplies'),
        chatInput: document.getElementById('chatInput'),
        sendButton: document.getElementById('sendButton'),
        projectModal: document.getElementById('projectModal'),
        closeModal: document.getElementById('closeModal')
    };

    setTimeout(() => {
        elements.welcomeScreen.style.display = 'none';
        elements.chatContainer.classList.add('active');
        startConversation();
    }, 2000);

    elements.sendButton.addEventListener('click', handleSendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
    elements.closeModal.addEventListener('click', closeProjectModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.projectModal.classList.contains('active')) {
            closeProjectModal();
        }
    });
}

function startConversation() {
    const greeting = {
        text: "Hey there! 👋 I'm your guide to Kathleen's AI Enablement work. I'm here to show you around and answer any questions you might have.",
        delay: 500
    };

    addBotMessage(greeting.text, greeting.delay, () => {
        setTimeout(() => {
            const question = "What brings you here today?";
            addBotMessage(question, 800, () => {
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

function addBotMessage(text, delay = 1000, callback = null) {
    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="message-content">${text}</div>
        `;

        elements.messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        chatState.conversationHistory.push({ role: 'bot', text });

        if (callback) callback();
    }, delay);
}


function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar">You</div>
        <div class="message-content">${text}</div>
    `;

    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();

    chatState.conversationHistory.push({ role: 'user', text });
}


function handleSendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    addUserMessage(message);
    elements.chatInput.value = '';

    processUserInput(message);
}

function processUserInput(input) {
    const lowerInput = input.toLowerCase();

    const salesKeywords = ['hire', 'project', 'need ai', 'freelance', 'help with',
        'looking for', 'budget', 'timeline', 'enablement services', 'automation'];
    const isSalesIntent = salesKeywords.some(keyword => lowerInput.includes(keyword));

    if (isSalesIntent && chatState.mode === 'portfolio') {
        chatState.mode = 'sales';
        handleSalesMode(input);
    } else {
        handlePortfolioMode(input);
    }
}

function handlePortfolioMode(input) {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('experience') || lowerInput.includes('background')) {
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
    } else if (lowerInput.includes('skills') || lowerInput.includes('tools')) {
        addBotMessage("Kathleen's Technical Core:<br><br><strong>AI Enablement:</strong> Agentic Workflows, Prompt Engineering (Gemini/OpenAI), AI Coaching Architecture, Learning Experience Design<br><br><strong>Systems & Automation:</strong> n8n, Zapier, Webhook Orchestration, Stripe API, Supabase, Data Pipelines<br><br><strong>Creative Implementation:</strong> Automated Video Production, Behavioral Logic Mapping, CRO, Context Management<br><br><strong>Product Strategy:</strong> Modular Architecture, ROI Alignment, Technical Liaison for Agile Teams", 1000, () => {
            setTimeout(() => {
                showQuickReplies([
                    { text: "Show me projects", value: "show_projects" },
                    { text: "Contact information", value: "contact" }
                ]);
            }, 1500);
        });
    } else if (lowerInput.includes('contact') || lowerInput.includes('reach out') || lowerInput.includes('email')) {
        addBotMessage("Great! You can reach Kathleen at:<br><br>📧 Email: casto8586@gmail.com<br>📱 Phone: (304) 543-8135<br>💼 LinkedIn: <a href='https://linkedin.com/in/kathleencasto' target='_blank'>LinkedIn Profile</a><br>🐙 GitHub: <a href='https://github.com/katycat1313' target='_blank'>katycat1313</a><br>🌐 Portfolio: <a href='https://portfolio.smartintakesolutions.space' target='_blank'>portfolio.smartintakesolutions.space</a>", 1000, () => {
            setTimeout(() => {
                addBotMessage("Is there anything else you'd like to know?", 800);
            }, 1500);
        });
    } else {
        addBotMessage("I'd love to show you Kathleen's work! Let me walk you through some projects.", 1000, () => {
            setTimeout(() => {
                showProjects();
            }, 1200);
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

function showProjects() {
    const projects = getProjectData();

    addBotMessage("Here are some of Kathleen's projects. Click on any to explore in detail:", 600);

    // Add project cards with slight delays for stagger effect
    projects.forEach((project, index) => {
        setTimeout(() => {
            addProjectCard(project);
        }, 800 + (index * 300));
    });

    setTimeout(() => {
        addBotMessage("What would you like to know more about?", 1000, () => {
            showQuickReplies([
                { text: "Design process", value: "process" },
                { text: "See more work", value: "more_work" },
                { text: "Contact info", value: "contact" }
            ]);
        });
    }, 800 + (projects.length * 300) + 1500);
}

function addProjectCard(project) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'message bot';

    const tags = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    const imageHtml = project.image ? `
        <div class="project-image">
            <img src="${project.image}" alt="${project.title} interface screenshot" loading="lazy">
        </div>
    ` : '';

    cardDiv.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="project-card" tabindex="0" role="button" aria-label="View ${project.title} project details">
                ${imageHtml}
                <div class="project-card-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">${tags}</div>
                </div>
            </div>
        </div>
    `;

    elements.messagesContainer.appendChild(cardDiv);
    scrollToBottom();

    const card = cardDiv.querySelector('.project-card');
    card.addEventListener('click', () => openProjectModal(project));
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') openProjectModal(project);
    });
}

function showQuickReplies(replies) {
    elements.quickReplies.innerHTML = '';
    elements.quickReplies.classList.add('active');

    replies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply.text;
        button.setAttribute('aria-label', reply.text);

        button.addEventListener('click', () => {
            handleQuickReply(reply);
        });

        elements.quickReplies.appendChild(button);
    });
}

function handleQuickReply(reply) {
    addUserMessage(reply.text);
    elements.quickReplies.classList.remove('active');

    switch (reply.value) {
        case 'hiring':
            chatState.userIntent = 'hiring';
            addBotMessage("Wonderful! Let me show you Kathleen's work and experience.", 1000, () => {
                setTimeout(() => showProjects(), 1200);
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
            showProjects();
            break;

        case 'skills':
            processUserInput('skills');
            break;

        case 'contact':
            processUserInput('contact');
            break;

        case 'process':
            addBotMessage("Kathleen follows a rapid AI development process:<br><br>1. <strong>Discovery & ROI Alignment</strong> - Understanding business goals and automation opportunities<br>2. <strong>Agentic Architecture Design</strong> - Mapping workflows and modular system design<br>3. <strong>Rapid Prototyping</strong> - Functional solutions in 7-day development cycles<br>4. <strong>Validation & Ethics Gates</strong> - Ensuring AI output is ethical and brand-aligned<br>5. <strong>Enablement & Upskilling</strong> - Coaching teams to adopt AI as a high-performance tool", 1200);
            break;

        case 'website':
        case 'mobile':
        case 'design_system':
            addBotMessage(`Perfect! ${reply.text} is right in Kathleen's wheelhouse. Let me show you some relevant examples.`, 1000, () => {
                setTimeout(() => showProjects(), 1200);
            });
            break;

        case 'buy_product':
            initiatePayment();
            break;

        default:
            addBotMessage("Let me show you some of Kathleen's work!", 800, () => {
                setTimeout(() => showProjects(), 1000);
            });
    }
}

async function initiatePayment() {
    addBotMessage("Great! I'm creating a secure payment link for the 'Example Digital Product'...", 1000);

    try {
        const response = await fetch('/.netlify/functions/create-stripe-payment', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const paymentUrl = data.url;

        addBotMessage(`Please use the link below to complete your purchase. It will open in a new tab.<br><br><a href="${paymentUrl}" target="_blank" class="payment-link">Pay Now ($10.00)</a>`, 1000);

    } catch (error) {
        console.error('Payment initiation error:', error);
        addBotMessage("I'm sorry, but I was unable to create a payment link at this time. Please try again later.", 1000);
    }
}

function showTypingIndicator() {
    elements.typingIndicator.classList.add('active');
    scrollToBottom();
}

function hideTypingIndicator() {
    elements.typingIndicator.classList.remove('active');
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function openProjectModal(project) {
    const modalContent = document.getElementById('projectContent');

    const tags = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    const imageHtml = project.image ? `
        <div class="project-modal-image">
            <img src="${project.image}" alt="${project.title} full interface screenshot">
        </div>
    ` : '';

    modalContent.innerHTML = `
        <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 1rem; background: linear-gradient(135deg, var(--primary-purple), var(--primary-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${project.title}</h2>
        <div style="margin-bottom: 1.5rem;">
            <div class="project-tags">${tags}</div>
        </div>
        <p style="color: var(--text-secondary); font-size: 1.125rem; margin-bottom: 2rem;">${project.description}</p>
        
        ${imageHtml}
        
        <h3 style="font-size: 1.25rem; margin-bottom: 1rem; margin-top: 2rem;">Challenge</h3>
        <p style="margin-bottom: 2rem; line-height: 1.8;">${project.challenge}</p>
        
        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">Solution</h3>
        <p style="margin-bottom: 2rem; line-height: 1.8;">${project.solution}</p>
        
        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">Impact</h3>
        <p style="margin-bottom: 2rem; line-height: 1.8;">${project.impact}</p>
    `;

    elements.projectModal.classList.add('active');
    elements.closeModal.focus();
}

function closeProjectModal() {
    elements.projectModal.classList.remove('active');
}

function getProjectData() {
    return [
        {
            title: "MarketSim – Adaptive Agentic Learning SaaS",
            description: "A full-stack learning environment featuring an Agentic AI Mentor (ZOOMi) that analyzes user behavior and dynamically modifies content difficulty.",
            tags: ["Gemini API", "ElevenLabs", "Stripe", "n8n", "Supabase"],
            image: "",
            challenge: "Users learning AI enablement skills face steep learning curves with static, one-size-fits-all training content.",
            solution: "Built an Agentic AI Mentor (ZOOMi) that analyzes user behavior in real-time and dynamically modifies content difficulty, delivering personalized coaching logic.",
            impact: "Designed for AI Enablement, reducing the user learning curve by 40% through personalized, real-time coaching logic."
        },
        {
            title: "Raw Blocks AI (Countdown Studio) – Agentic Creative Pipeline",
            description: "A professional-grade video production platform using Modular Box Architecture and a 5-agent autonomous team.",
            tags: ["Agentic AI", "Video Production", "Modular Architecture"],
            image: "",
            challenge: "Creative teams spend excessive time on repetitive video production tasks, with no way to ensure AI-generated output stays ethical and brand-aligned.",
            solution: "Built a 5-agent autonomous team with Modular Box Architecture that automates creative workflows from product URL to finished video short. Engineered 'Validation Gates' for ethical, brand-aligned output.",
            impact: "Enables users to remix assets into 50+ formats with zero technical friction. Automates end-to-end creative workflows."
        },
        {
            title: "ccpractice – AI Conversational Skill-Builder",
            description: "A voice-to-voice training application using ElevenLabs and Gemini for soft-skill roleplay and communication upskilling.",
            tags: ["ElevenLabs", "Gemini", "n8n", "Voice AI"],
            image: "",
            challenge: "Professionals need realistic practice environments for communication and soft-skills without high-cost coaching sessions.",
            solution: "Built a voice-to-voice training app using ElevenLabs and Gemini to facilitate soft-skill roleplay. Utilized n8n for automated backend testing.",
            impact: "Reduced manual dev-ops overhead by 35% through n8n automation. Provides accessible, scalable communication upskilling."
        }
    ];
}
