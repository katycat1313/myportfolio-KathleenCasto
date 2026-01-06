# ATLAS - Agentic Learning Tracking Analysis System

ATLAS is an intelligent, agentic AI system for Kathleen's portfolio that autonomously learns from visitor interactions and tailors responses based on detected intent.

## What is ATLAS?

ATLAS is not a simple keyword-matching chatbot. It's an agentic system that:

- **Detects Intent**: Analyzes visitor context to identify whether they're a hiring manager, potential client, technical evaluator, or explorer
- - **Learns & Adapts**: Stores conversation history to improve recommendations over time
  - - **Reasons Beyond Knowledge**: Uses Claude AI to answer unexpected questions intelligently
    - - **Tracks Performance**: Monitors which projects and recommendations convert visitors
      - - **Intelligent Responses**: Generates personalized, context-aware responses with personality
       
        - ## Quick Start
       
        - ### Prerequisites
        - - Node.js 18+
          - - npm or yarn
            - - Anthropic API key (https://console.anthropic.com)
              - - Supabase account (free tier available at https://supabase.com)
               
                - ### Installation
               
                - 1. Clone the repository:
                  2. ```bash
                     git clone https://github.com/katycat1313/myportfolio-KathleenCasto.git
                     cd myportfolio-KathleenCasto/atlas-backend
                     ```

                     2. Install dependencies:
                     3. ```bash
                        npm install
                        ```

                        3. Set up environment variables:
                        4. ```bash
                           cp .env.example .env
                           # Edit .env and add your actual API keys
                           ```

                           4. Start the development server:
                           5. ```bash
                              npm run dev
                              ```

                              The server will start on `http://localhost:3001`

                              ## API Endpoints

                              ### POST /api/atlas/chat
                              Main conversation endpoint. Sends a message and receives an intelligent response.

                              **Request:**
                              ```json
                              {
                                "message": "Tell me about your web development experience",
                                "visitorId": "visitor_123",
                                "conversationHistory": []
                              }
                              ```

                              **Response:**
                              ```json
                              {
                                "response": "I see you're interested in web development...",
                                "detectedIntent": "technical",
                                "recommendedProjects": ["Nexus Omni-Link", "CCPractice"],
                                "conversationId": "conv_abc123"
                              }
                              ```

                              ### GET /api/atlas/projects
                              Retrieves all project information from the knowledge base.

                              ### GET /api/atlas/about
                              Retrieves Kathleen's background and about information.

                              ### GET /api/health
                              Health check endpoint. Returns `{ status: "ok" }` if server is running.

                              ## How Intent Detection Works

                              ATLAS analyzes visitor messages to classify them into categories:

                              - **hiring_manager**: Looking for talent, asks about experience/skills
                              - - **client**: Interested in hiring for a project
                                - - **technical**: Technical depth questions, architecture, implementation
                                  - - **explorer**: General curiosity, learning about work
                                    - - **unknown**: Ambiguous or unclear intent
                                     
                                      - Based on detected intent, ATLAS tailors responses and project recommendations.
                                     
                                      - ## Configuration
                                     
                                      - ### Environment Variables (.env)
                                     
                                      - ```
                                        ANTHROPIC_API_KEY=your_anthropic_key
                                        SUPABASE_URL=your_supabase_url
                                        SUPABASE_KEY=your_supabase_anon_key
                                        PORT=3001
                                        NODE_ENV=development
                                        ```

                                        ### Knowledge Base

                                        The knowledge base is embedded in `server.js` and includes:
                                        - Project descriptions and links
                                        - - Technology stack details
                                          - - Kathleen's background
                                            - - Skills and expertise
                                             
                                              - To update projects, edit the `knowledgeBase` object in `server.js`.
                                             
                                              - ## Database Schema (Supabase)
                                             
                                              - ### conversations table
                                              - Stores all visitor interactions for learning:
                                              - ```sql
                                                CREATE TABLE conversations (
                                                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                  visitor_id TEXT,
                                                  message TEXT,
                                                  response TEXT,
                                                  detected_intent TEXT,
                                                  recommended_projects TEXT[],
                                                  created_at TIMESTAMP DEFAULT NOW()
                                                );
                                                ```

                                                ### learning_metrics table
                                                Tracks performance and learning:
                                                ```sql
                                                CREATE TABLE learning_metrics (
                                                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                  detected_intent TEXT,
                                                  projects_recommended TEXT[],
                                                  conversion BOOLEAN,
                                                  timestamp TIMESTAMP DEFAULT NOW()
                                                );
                                                ```

                                                ## Architecture

                                                ```
                                                ATLAS Backend
                                                ├── Express.js Server (port 3001)
                                                ├── Claude API Integration (agentic reasoning)
                                                ├── Intent Detection Engine
                                                ├── Knowledge Base (embedded project data)
                                                ├── Supabase Client (conversation storage)
                                                └── API Routes
                                                    ├── /api/atlas/chat (main endpoint)
                                                    ├── /api/atlas/projects
                                                    ├── /api/atlas/about
                                                    └── /api/health
                                                ```

                                                ## Development

                                                ### Start development server with auto-reload:
                                                ```bash
                                                npm run dev
                                                ```

                                                ### Lint and format:
                                                ```bash
                                                npm run lint
                                                ```

                                                ### Production build:
                                                ```bash
                                                npm start
                                                ```

                                                ## Deployment

                                                ATLAS can be deployed to:
                                                - **Heroku** (with Procfile)
                                                - - **Railway** (with railway.json)
                                                  - - **Vercel** (serverless)
                                                    - - **Cloud Run** (Google Cloud)
                                                      - - **AWS Lambda** (with handler)
                                                       
                                                        - Each deployment requires setting environment variables through the platform's configuration.
                                                       
                                                        - ## Cost Estimation
                                                       
                                                        - - **Anthropic API**: ~$2-5/month (based on usage)
                                                          - - **Supabase**: Free tier, $25/month for production
                                                            - - **Hosting**: $5-20/month (depending on platform)
                                                              - - **Total**: ~$15-25/month
                                                               
                                                                - ## Learning & Analytics
                                                               
                                                                - ATLAS tracks:
                                                                - - Which intents are most common
                                                                  - - Which projects are most recommended
                                                                    - - Conversion rates by intent type
                                                                      - - Common questions and topics
                                                                        - - System performance metrics
                                                                         
                                                                          - This data helps optimize the knowledge base and response quality over time.
                                                                         
                                                                          - ## Security
                                                                         
                                                                          - - API keys stored securely in environment variables
                                                                            - - Supabase row-level security (RLS) for data isolation
                                                                              - - CORS configured for portfolio domain only
                                                                                - - No sensitive user data stored
                                                                                 
                                                                                  - ## Troubleshooting
                                                                                 
                                                                                  - ### Port 3001 already in use:
                                                                                  - ```bash
                                                                                    lsof -i :3001
                                                                                    kill -9 <PID>
                                                                                    ```

                                                                                    ### Anthropic API key not working:
                                                                                    - Verify key from https://console.anthropic.com
                                                                                    - - Check key doesn't have extra spaces or characters
                                                                                     
                                                                                      - ### Supabase connection issues:
                                                                                      - - Verify SUPABASE_URL and SUPABASE_KEY are correct
                                                                                        - - Check Supabase project is active
                                                                                          - - Verify table schemas are created
                                                                                           
                                                                                            - ## Next Steps
                                                                                           
                                                                                            - 1. Set up Supabase database with conversation tracking
                                                                                              2. 2. Deploy ATLAS backend to production
                                                                                                 3. 3. Update portfolio frontend to call ATLAS API
                                                                                                    4. 4. Test end-to-end conversation flow
                                                                                                       5. 5. Monitor analytics and refine knowledge base
                                                                                                         
                                                                                                          6. ## License
                                                                                                         
                                                                                                          7. MIT
