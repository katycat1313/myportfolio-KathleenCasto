const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Friendly runtime check for required environment variables
(() => {
        const required = ['SUPABASE_URL', 'SUPABASE_KEY', 'ANTHROPIC_API_KEY'];
        const missing = required.filter(k => !process.env[k]);
        if (missing.length) {
                console.warn(`\n[ATLAS] Warning: Missing environment variables: ${missing.join(', ')}\nSome features (DB writes, AI calls) may be disabled until these are set.\n`);
        }
})();

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
          marketSim: {
                  title: "MarketSim — Adaptive Agentic Learning SaaS",
                  description: "Full-stack learning environment featuring an Agentic AI Mentor (ZOOMi) that analyzes user behavior and dynamically modifies content difficulty.",
                  challenge: "Users learning AI enablement skills face steep learning curves with static, one-size-fits-all training content.",
                  solution: "Built an Agentic AI Mentor (ZOOMi) that analyzes user behavior in real-time and dynamically modifies content difficulty, delivering personalized coaching logic.",
                  impact: "40% learning curve reduction through personalized, real-time coaching logic. Full Stripe integration for monetization.",
                  tech: ["Gemini API", "ElevenLabs", "Stripe", "n8n", "Supabase"],
                  image: "https://github.com/user-attachments/assets/37b4a893-6511-46c8-92c5-e1528e7c2db2"
          },
          rawBlocksAI: {
                  title: "Raw Blocks AI (Countdown Studio) — Agentic Creative Pipeline",
                  description: "Professional-grade video production platform using Modular Box Architecture and a 5-agent autonomous team.",
                  challenge: "Creative teams spend excessive time on repetitive video production tasks with no way to ensure AI output stays ethical and brand-aligned.",
                  solution: "Built a 5-agent autonomous team with Modular Box Architecture that automates creative workflows from product URL to finished video short. Engineered Validation Gates for ethical output.",
                  impact: "50+ remix formats with zero technical friction. Automates end-to-end creative workflows while maintaining brand integrity.",
                  tech: ["Agentic AI", "Video Production", "Modular Architecture"]
          },
          ccpractice: {
                  title: "ccpractice — AI Conversational Skill-Builder",
                  description: "Voice-to-voice training application using ElevenLabs and Gemini for soft-skill roleplay and communication upskilling.",
                  challenge: "Professionals need realistic practice environments for communication and soft-skills without high-cost coaching sessions.",
                  solution: "Built a voice-to-voice training app using ElevenLabs and Gemini to facilitate soft-skill roleplay with n8n automated backend testing.",
                  impact: "35% reduction in manual dev-ops overhead. Provides accessible, scalable communication upskilling.",
                  tech: ["ElevenLabs", "Gemini", "n8n", "Voice AI"]
          },
          nexusOmniAgent: {
                  title: "Nexus Omni Agent — Hands-Free AI Personal Assistant",
                  description: "Conversational AI assistant that learns through dialogue, stores tasks in structured JSON for recall, and works autonomously.",
                  challenge: "Users need a conversational AI that maintains context across multi-turn dialogues and responds intelligently in real-time.",
                  solution: "Multi-modal AI orchestration with Deepgram STT, context-aware LLM reasoning, and Google Cloud TTS. Modular architecture maintains conversation history.",
                  impact: "Hands-free operation, low-latency conversational flow, session persistence across interactions.",
                  tech: ["React 19", "Deepgram", "Google Cloud TTS", "Claude/Gemini", "Supabase", "TypeScript"]
          },
          conversionFlowAI: {
                  title: "ConversionFlow AI — Autonomous Campaign Engine",
                  description: "Campaign-in-a-Box engine that takes a product idea, performs deep market research, and generates high-converting UGC videos with optimized posting schedules.",
                  challenge: "Affiliate marketers struggle creating authentic UGC, understanding market sentiment, and optimizing posting schedules for conversion.",
                  solution: "Deep market psychography analysis with Gemini vision models generating hyper-realistic UGC. Real-time sentiment mapping from Reddit, Twitter, TikTok.",
                  impact: "Eliminates awareness phase, goes straight to conversion. Multiple video/image variations optimized per platform with affiliate link integration.",
                  tech: ["Google Gemini 3.1", "Google Veo", "Node.js", "Sentiment Analysis", "Affiliate Integration"]
          },
          infoCraftPlex: {
                  title: "InfoCraft Plex — Agentic Knowledge Architect",
                  description: "Transforms unstructured web content into structured JSON knowledge bases optimized for RAG performance with multi-LLM orchestration.",
                  challenge: "RAG systems suffer from context degradation when feeding raw unstructured data, causing LLM hallucinations.",
                  solution: "Transforms messy HTML/text into validated JSON entries. Toggles between Gemini, GPT-4, and Claude for varying complexity. Uses Supabase Edge Functions.",
                  impact: "Reduces LLM hallucinations by up to 40%. Provides foundation for agentic systems and structured data pipelines.",
                  tech: ["React 18", "TypeScript", "Supabase Edge Functions", "Vertex AI", "OpenAI", "Anthropic API"]
          },
          gadgetsAndThose: {
                  title: "Gadgets and Those — AI-Powered Product Discovery",
                  description: "Affiliate product discovery platform with dual-mode AI Scout combining text and real-time voice chat for the @GadgetsAndThose TikTok community.",
                  challenge: "TikTok community members need personalized gadget recommendations via natural conversation without manual browsing.",
                  solution: "Dual-mode AI Discovery Scout with text and real-time voice chat. Agentically analyzes user setups and provides intelligent product reasoning.",
                  impact: "Seamless text-to-voice switching, proactive engagement, community-driven product discovery with automated CMS integration.",
                  tech: ["React", "Gemini Flash", "Decap CMS", "Netlify", "TTS/STT", "Tailwind CSS"],
                  image: "https://github.com/user-attachments/assets/7a941dd0-4c67-4871-8bb0-e3e43a2aafcf"
          },
          geminiVoiceChat: {
                  title: "Gemini Voice Chat — Real-Time Voice AI",
                  description: "Browser-based real-time voice chat powered by Gemini 2.5 Flash native audio with live audio visualization.",
                  challenge: "Voice chat applications require seamless real-time audio processing with minimal latency, which is technically complex.",
                  solution: "Native WebRTC and Web Audio API integration with Gemini 2.5 Flash. Captures 16kHz PCM audio, streams to Gemini, plays back 24kHz with canvas visualization.",
                  impact: "Zero-installation browser-based voice chat with low latency, dynamic audio visualization, cross-platform support.",
                  tech: ["React", "TypeScript", "Web Audio API", "Gemini 2.5 Flash", "Canvas", "WebRTC"]
          }
    },
    about: {
          name: "Kathleen",
          role: "AI Enablement Specialist & Technical Product Lead",
          expertise: ["Agentic AI Systems", "AI Upskilling & Coaching", "Full-Stack SaaS Platforms", "Creative Automation Pipelines", "Data Pipeline Engineering"],
          approach: "20 years bridging Operational Excellence and Creative Enablement. Deploy functional, human-centric solutions in 7-day development cycles. Helping creative teams adopt AI as a high-performance tool for Transformation."
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
