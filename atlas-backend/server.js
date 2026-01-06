const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Anthropic and Supabase
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

// ATLAS Knowledge Base
const atlasKnowledge = {
    projects: {
          nexusOmniLink: {
                  title: "Nexus Omni-Link",
                  description: "AI agent platform that learns your workflows and automates them across platforms",
                  challenge: "Multi-platform automation is fragmented and requires complex coding",
                  solution: "Built multi-modal skill teaching engine with Puppeteer, Gemini, and n8n integration",
                  impact: "Supports unlimited custom skills, maintains session persistence, integrates 500+ tools",
                  tech: ["React", "Express.js", "Puppeteer", "Google Gemini", "n8n"]
          },
          ccpractice: {
                  title: "CCPractice - Sales Practice Platform",
                  description: "AI-powered cold calling practice with real-time feedback",
                  challenge: "Sales reps need realistic practice without risking real client calls",
                  solution: "Real-time voice AI with Deepgram, multiple prospect personalities, instant feedback",
                  impact: "4 apps (Cold Calling, Interview, Meeting, Presentation), zero recurring costs",
                  tech: ["React", "Google Gemini", "Deepgram", "Supabase", "Real-time Audio"]
          },
          smartIntakeSolutions: {
                  title: "Smart Intake Solutions",
                  description: "Form builder for contractors to customize intake forms without coding",
                  challenge: "Contractors spend hours on intake forms, missing critical information",
                  solution: "Drag-drop builder, AI-suggested questions, mobile optimization, one-click deploy",
                  impact: "40% reduction in follow-up calls, live at smartintakesolutions.space",
                  tech: ["Form Builder", "AI", "Low-Code"]
          },
          marketSim: {
                  title: "MarketSim",
                  description: "Interactive business simulation for teaching marketing strategy",
                  challenge: "Students struggle to apply marketing theory to real decisions",
                  solution: "Interactive simulation with AI competitors, real-time feedback, market dynamics",
                  impact: "2+ hour engagement per session, validated simulation-based learning",
                  tech: ["React", "Simulation Engine", "Game Mechanics"]
          }
    },
    about: {
          name: "Kathleen",
          role: "AI-Assisted Developer",
          expertise: ["AI Integration", "Full-Stack Development", "Automation", "Real-time Systems"],
          approach: "Build products that actually work. Ship early, iterate based on feedback."
    }
};

// ATLAS Conversation Handler
async function atlasRespond(userMessage, conversationHistory, visitorId) {
    try {
          // Detect intent
      const intentMessages = [
        {
                  role: 'user',
                  content: `Analyze visitor intent from this conversation (respond with JSON only): ${JSON.stringify(conversationHistory)} Latest message: ${userMessage}`
        }
            ];

      const intentResponse = await anthropic.messages.create({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 300,
              system: 'You are an intent detection system. Analyze conversations and return JSON: {intent: "hiring_manager"|"client"|"explorer"|"technical"|"unknown", confidence: 0-1}',
              messages: intentMessages
      });

      let intent = 'unknown';
          try {
                  const parsed = JSON.parse(intentResponse.content[0].text);
                  intent = parsed.intent || 'unknown';
          } catch (e) {
                  intent = 'unknown';
          }

      // Build ATLAS system prompt
      const systemPrompt = `You are ATLAS, Kathleen's intelligent portfolio guide. 

      Your personality: Intelligent but approachable. Smart, witty humor (never goofy). Clear explanations without jargon. Genuinely curious about visitor needs. Authentic.

      About Kathleen: ${JSON.stringify(atlasKnowledge.about)}

      Her projects: ${JSON.stringify(Object.values(atlasKnowledge.projects))}

      Visitor intent detected: ${intent}

      Your approach:
      1. Listen deeply to understand what they actually need
      2. Be proactive - suggest projects before being asked if relevant
      3. Be honest - don't oversell
      4. Ask clarifying questions when needed
      5. Reference specific projects that match their interests

      Respond conversationally, with intelligence and wit. Show genuine interest in helping them.`;

      // Generate ATLAS response
      const messages = [
              ...conversationHistory.map(msg => ({
                        role: msg.role,
                        content: msg.content
              })),
        { role: 'user', content: userMessage }
            ];

      const response = await anthropic.messages.create({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 800,
              system: systemPrompt,
              messages: messages
      });

      const atlasResponse = response.content[0].text;

      // Track conversation for learning
      if (visitorId) {
              await supabase.from('conversations').insert({
                        visitor_id: visitorId,
                        message: userMessage,
                        response: atlasResponse,
                        detected_intent: intent,
                        created_at: new Date().toISOString()
              });
      }

      return {
              response: atlasResponse,
              intent: intent
      };
    } catch (error) {
          console.error('ATLAS Error:', error);
          return {
                  response: "I'm having trouble connecting right now. Try again in a moment?",
                  intent: 'error'
          };
    }
}

// API Endpoints

// Chat endpoint
app.post('/api/atlas/chat', async (req, res) => {
    const { message, conversationHistory = [], visitorId } = req.body;

           if (!message) {
                 return res.status(400).json({ error: 'Message required' });
           }

           const result = await atlasRespond(message, conversationHistory, visitorId);
    res.json(result);
});

// Get projects
app.get('/api/atlas/projects', (req, res) => {
    res.json(atlasKnowledge.projects);
});

// Get about
app.get('/api/atlas/about', (req, res) => {
    res.json(atlasKnowledge.about);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ATLAS is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`ATLAS Backend running on port ${PORT}`);
    console.log(`Connected to Supabase: ${process.env.SUPABASE_URL ? 'Yes' : 'No'}`);
});
