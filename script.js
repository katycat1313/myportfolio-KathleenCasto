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
        text: "Hey there! 👋 I'm your guide to Kathleen's UI/UX design work. I'm here to show you around and answer any questions you might have.",
        delay: 500
    };

    addBotMessage(greeting.text, greeting.delay, () => {
        setTimeout(() => {
            const question = "What brings you here today?";
            addBotMessage(question, 800, () => {
                showQuickReplies([
                    { text: "I'm hiring for a UI/UX role", value: "hiring" },
                    { text: "I need design services", value: "client" },
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

    const salesKeywords = ['hire', 'project', 'need designer', 'freelance', 'help with',
        'looking for', 'budget', 'timeline', 'design services'];
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
        addBotMessage("Kathleen is a UI/UX designer with a passion for creating accessible, beautiful, and functional interfaces. She specializes in modern web design, design systems, and interaction design.", 1000, () => {
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
        addBotMessage("Kathleen's skillset includes:<br><br>• UI/UX Design<br>• Interaction Design<br>• Design Systems<br>• Accessibility (WCAG)<br>• Figma, Adobe XD<br>• HTML/CSS/JavaScript<br>• React, Next.js", 1000, () => {
            setTimeout(() => {
                showQuickReplies([
                    { text: "Show me projects", value: "show_projects" },
                    { text: "Contact information", value: "contact" }
                ]);
            }, 1500);
        });
    } else if (lowerInput.includes('contact') || lowerInput.includes('reach out') || lowerInput.includes('email')) {
        addBotMessage("Great! You can reach Kathleen at:<br><br>📧 Email: [email protected]<br>💼 LinkedIn: linkedin.com/in/kathleencasto<br>🌐 Portfolio: portfolio.smartintakesolutions.space", 1000, () => {
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
                    { text: "Website design", value: "website" },
                    { text: "Mobile app", value: "mobile" },
                    { text: "Design system", value: "design_system" },
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
            addBotMessage("Kathleen follows a user-centered design process:<br><br>1. <strong>Research & Discovery</strong> - Understanding users and business goals<br>2. <strong>Ideation & Sketching</strong> - Exploring solutions<br>3. <strong>Prototyping</strong> - Creating interactive mockups<br>4. <strong>Testing & Iteration</strong> - Validating with real users<br>5. <strong>Implementation Support</strong> - Working with developers", 1200);
            break;

        case 'website':
        case 'mobile':
        case 'design_system':
            addBotMessage(`Perfect! ${reply.text} projects are right in Kathleen's wheelhouse. Let me show you some relevant examples.`, 1000, () => {
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
            title: "Neural Analytics Dashboard",
            description: "A real-time analytics interface for AI-powered insights with data visualization and interactive controls.",
            tags: ["UI Design", "Data Viz", "React"],
            image: "assets/projects/neural-dashboard.png",
            challenge: "Users needed to monitor complex AI model performance in real-time while maintaining clarity and avoiding information overload.",
            solution: "Designed a clean, card-based dashboard with progressive disclosure. Key metrics are always visible, while detailed analytics are accessible through intuitive drill-downs. Used color coding and micro-animations to highlight important changes.",
            impact: "Reduced time-to-insight by 40% and increased user engagement by 60%. Users reported the interface made complex data 'actually understandable.'"
        },
        {
            title: "E-commerce Mobile Experience",
            description: "Complete UX redesign of a mobile shopping app focused on conversion optimization and accessibility.",
            tags: ["UX", "Mobile", "A11y"],
            image: "assets/projects/ecommerce-mobile.png",
            challenge: "The existing app had a 65% cart abandonment rate and poor accessibility scores, particularly for users with visual impairments.",
            solution: "Reimagined the entire user flow with a mobile-first approach. Simplified navigation, improved touch targets, implemented WCAG 2.1 AA standards, and streamlined checkout to 3 steps instead of 7.",
            impact: "Cart abandonment dropped to 35%, conversion rate increased 45%, and accessibility score improved from 68 to 94 on Lighthouse audits."
        },
        {
            title: "Design System & Component Library",
            description: "Comprehensive design system with reusable components, tokens, and documentation for a SaaS platform.",
            tags: ["Design System", "Figma", "Documentation"],
            image: "assets/projects/design-system.png",
            challenge: "Multiple teams were creating inconsistent interfaces, leading to poor user experience and slow development cycles.",
            solution: "Built a complete design system from scratch with atomic design principles. Created 60+ components, established design tokens, and provided interactive documentation with code examples.",
            impact: "Development time for new features reduced by 50%, design consistency improved across all products, and onboarding time for new designers decreased from 2 weeks to 3 days."
        }
    ];
}
