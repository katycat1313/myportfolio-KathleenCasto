import React, { useState } from 'react';
import { Github, Linkedin, Mail, Phone, MapPin, Download, Code, Rocket, Lightbulb, Target } from 'lucide-react';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('hero');

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const downloadResume = () => {
    const resume = `KATHLEEN CASTO
AI Application Developer

Belle, WV | (304) 410-8850 | casto8586@gmail.com
LinkedIn: linkedin.com/in/katy-casto-b0b48327b | GitHub: github.com/katycat1313

PROFESSIONAL SUMMARY
AI-focused developer with hands-on experience building and deploying AI-powered applications. Proven ability to integrate AI APIs, design complex system architectures, and ship functional products. Currently pursuing formal CS education while seeking opportunities to contribute to innovative AI teams.

TECHNICAL SKILLS
• AI & Automation: AI chatbot integration, API integration, prompt engineering, workflow automation
• Programming: Python (learning), HTML, CSS, JavaScript
• Tools & Platforms: Git/GitHub, Stripe API, Zapier, n8n, Twilio, Google Analytics, Gemini, ElevenLabs
• Development: System architecture, debugging, responsive design, user authentication, payment processing

PROJECT EXPERIENCE

Founder & Developer | MarketSim - AI-Powered Learning Platform
November 2024 - May 2025

Built and deployed a comprehensive marketing education platform featuring AI-powered personalization and interactive simulations.

Key Achievements:
• Designed full-stack SaaS application with multi-feature architecture
• Integrated AI chatbot for personalized learning guidance and real-time user support
• Developed interactive simulations: SEO audits, analytics dashboards, customer persona builder, data visualization tools
• Implemented user authentication, subscription management, and payment processing (Stripe integration)
• Deployed live production application and managed real-world technical challenges
• Debugged complex issues including authentication workflows and API integrations

Technical Implementation:
• Built responsive UI with modern design patterns and intuitive navigation
• Designed modular system supporting multiple independent feature sets
• Implemented real-time data processing and user state management
• Integrated multiple third-party APIs and services
• Created gamification system with progress tracking and achievements

Learning Outcomes:
• Gained practical experience with full product lifecycle: concept → design → development → deployment
• Learned production debugging and problem-solving under real constraints
• Identified knowledge gaps, leading to decision to pursue formal CS education
• Developed ability to learn new technologies quickly and independently

EDUCATION

Associate of Applied Science - AI Software Engineering (In Progress)
Maestro College | Expected Graduation: 2027
Currently studying: Python, data structures, algorithms, machine learning fundamentals

High School Diploma
Chesterfield Community High School | 2003

CERTIFICATIONS
• Google Analytics Certification
• Google Ads Measurement Certification  
• AI-Powered Shopping Ads Certification
• Conversion Optimization Certification

WHAT I'M LOOKING FOR
Remote position with a team that values builders and problem-solvers. Seeking opportunities to contribute immediately while continuing to grow technical skills. Eager to work with AI-powered products and learn from experienced developers.

Available for: Full-time remote positions starting immediately
Salary target: $50,000 - $70,000`;

    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Kathleen_Casto_Resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-white font-bold text-xl">KC</div>
          <div className="flex gap-4">
            {['About', 'Project', 'Skills', 'Contact'].map(section => (
              <button
                key={section}
                onClick={() => scrollToSection(section.toLowerCase())}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-4xl text-center">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Code size={64} className="text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Kathleen Casto
            </h1>
            <p className="text-2xl md:text-3xl text-blue-300 mb-6">
              AI Application Developer
            </p>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              I build AI-powered applications. From concept to deployment, I ship products that solve real problems.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a
              href="https://github.com/katycat1313"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all border border-white/20"
            >
              <Github size={20} />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/katy-casto-b0b48327b/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all"
            >
              <Linkedin size={20} />
              LinkedIn
            </a>
            <button
              onClick={downloadResume}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-all"
            >
              <Download size={20} />
              Download Resume
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              Belle, WV (Remote)
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} />
              casto8586@gmail.com
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} />
              (304) 410-8850
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">My Story</h2>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 mb-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-white/90 text-lg leading-relaxed mb-4">
                I'm not your typical developer. I don't have a CS degree yet (working on it), but I have something better: 
                <span className="text-blue-300 font-semibold"> I've shipped a product.</span>
              </p>
              
              <p className="text-white/80 leading-relaxed mb-4">
                When I wanted to learn digital marketing, I hit a wall. Everything taught theory, but nothing gave me hands-on practice. 
                Employers wanted experience, but wouldn't hire me to get it. So I thought: <em>"What if I built a platform where people could 
                practice marketing in realistic simulations?"</em>
              </p>

              <p className="text-white/80 leading-relaxed mb-4">
                That became <strong>MarketSim</strong> - a full-featured learning platform with AI-powered personalization, interactive simulations, 
                analytics dashboards, and more. I built it, deployed it, debugged it, and learned more in those months than any course could teach me.
              </p>

              <p className="text-white/80 leading-relaxed mb-4">
                But I also learned what I <em>didn't</em> know. When production issues hit, I realized I was learning reactively instead of systematically. 
                That's when I made the decision to pursue formal CS education - not because I couldn't build, but because I wanted to build <em>better</em>.
              </p>

              <p className="text-white/90 text-lg leading-relaxed font-semibold">
                Now I'm looking for a team that values what I bring: proven ability to ship, hunger to learn, and the humility to know I'm still growing.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-lg p-6 border border-blue-400/30">
              <Rocket className="text-blue-300 mb-4" size={32} />
              <h3 className="text-white font-bold text-lg mb-2">Builder First</h3>
              <p className="text-white/70 text-sm">I learn by building. Theory is great, but shipping products teaches you what really matters.</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-lg p-6 border border-green-400/30">
              <Lightbulb className="text-green-300 mb-4" size={32} />
              <h3 className="text-white font-bold text-lg mb-2">Problem Solver</h3>
              <p className="text-white/70 text-sm">Bugs don't scare me. Production issues teach me. I debug, I learn, I improve.</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-lg p-6 border border-orange-400/30">
              <Target className="text-orange-300 mb-4" size={32} />
              <h3 className="text-white font-bold text-lg mb-2">Always Learning</h3>
              <p className="text-white/70 text-sm">Currently studying AI/ML formally because I want to go from good to great.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Section */}
      <section id="project" className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Featured Project</h2>
          <p className="text-blue-200 text-center mb-12 text-lg">What I built when I decided to solve my own problem</p>

          <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">MarketSim</h3>
                  <p className="text-blue-300 text-lg">AI-Powered Marketing Education Platform</p>
                  <p className="text-white/60 text-sm mt-2">November 2024 - May 2025</p>
                </div>
                <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold">
                  Deployed & Live
                </div>
              </div>

              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                A comprehensive learning platform that teaches digital marketing through interactive, AI-guided simulations. 
                Users progress through hands-on projects ranging from basic SEO to advanced campaign management, 
                with personalized AI assistance every step of the way.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-white font-bold mb-4 text-lg">Key Features Built:</h4>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">▸</span>
                      <span><strong>AI Chatbot Integration</strong> - Personalized learning assistant using AI APIs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">▸</span>
                      <span><strong>SEO Simulation Engine</strong> - Real-time issue detection and feedback system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">▸</span>
                      <span><strong>Analytics Dashboard</strong> - Interactive data visualization and insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">▸</span>
                      <span><strong>Dynamic Scenarios</strong> - AI-powered challenge generation system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">▸</span>
                      <span><strong>Customer Persona Builder</strong> - Template-based creation tool</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">▸</span>
                      <span><strong>Progress Tracking</strong> - Gamification with levels, achievements, skills</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">▸</span>
                      <span><strong>User Authentication</strong> - Secure login and subscription management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">▸</span>
                      <span><strong>Payment Processing</strong> - Stripe integration for subscriptions</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-4 text-lg">Technical Implementation:</h4>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Full-stack SaaS architecture</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>AI API integration (conversational interfaces)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Responsive UI with modern design patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Modular system supporting multiple features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Real-time data processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>User state management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Third-party service integration (Stripe, analytics)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Production deployment and debugging</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-6 mb-6">
                <h4 className="text-yellow-200 font-bold mb-3 flex items-center gap-2">
                  <Lightbulb size={20} />
                  What I Learned:
                </h4>
                <p className="text-yellow-100/80 leading-relaxed">
                  Building MarketSim taught me more than just how to code - it taught me how real products are built. I learned about 
                  system architecture, API integration, user experience, debugging production issues, and the importance of solid fundamentals. 
                  Most importantly, I learned when to push through challenges and when to step back and learn properly. That's why I'm now 
                  pursuing formal CS education while looking for opportunities to apply what I've learned.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">AI Integration</span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">API Development</span>
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">System Architecture</span>
                <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm">Payment Processing</span>
                <span className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm">Authentication</span>
                <span className="bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-sm">Data Visualization</span>
                <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">UX Design</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Technical Skills</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-blue-300 mb-4">AI & Development</h3>
              <ul className="space-y-2 text-white/80">
                <li>• AI API Integration (chatbots, conversational AI)</li>
                <li>• Prompt Engineering</li>
                <li>• Python (currently learning through coursework)</li>
                <li>• HTML, CSS, JavaScript</li>
                <li>• System Architecture Design</li>
                <li>• Debugging & Problem Solving</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-green-300 mb-4">Tools & Platforms</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Git/GitHub (version control)</li>
                <li>• Stripe API (payment processing)</li>
                <li>• Zapier, n8n (automation)</li>
                <li>• Google Analytics</li>
                <li>• AI Tools: Gemini, ElevenLabs, Twilio</li>
                <li>• Responsive Web Design</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Product Skills</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Full Product Lifecycle (concept → deployment)</li>
                <li>• User Experience Design</li>
                <li>• Feature Prioritization</li>
                <li>• Technical Documentation</li>
                <li>• Problem Discovery & Solving</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4">Currently Learning</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Advanced Python Programming</li>
                <li>• Data Structures & Algorithms</li>
                <li>• Machine Learning Fundamentals</li>
                <li>• System Design Patterns</li>
                <li>• Software Engineering Best Practices</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-black/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Let's Work Together</h2>
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            I'm actively seeking remote opportunities with teams building AI-powered products. 
            If you're looking for someone who ships, learns fast, and brings proven problem-solving skills, let's talk.
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 mb-8">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="text-white font-bold mb-4">What I'm Looking For:</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• Remote position (full-time preferred)</li>
                  <li>• AI/ML product development roles</li>
                  <li>• Teams that value builders</li>
                  <li>• Mentorship opportunities</li>
                  <li>• Salary range: $50-70k</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-4">What I Bring:</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• Proven ability to ship products</li>
                  <li>• AI integration experience</li>
                  <li>• Fast learner and self-starter</li>
                  <li>• Problem-solving mindset</li>
                  <li>• Hunger to grow and contribute</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:casto8586@gmail.com"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg transition-all text-lg font-medium"
            >
              <Mail size={24} />
              Email Me
            </a>
            <a
              href="https://www.linkedin.com/in/katy-casto-b0b48327b/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg transition-all text-lg font-medium border border-white/20"
            >
              <Linkedin size={24} />
              LinkedIn
            </a>
            <button
              onClick={downloadResume}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg transition-all text-lg font-medium"
            >
              <Download size={24} />
              Resume
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-white/60 text-sm">
          <p>© 2025 Kathleen Casto. Built with React. Designed to ship.</p>
          <p className="mt-2">Available for remote opportunities • Belle, WV</p>
        </div>
      </footer>
    </div>
  );
}