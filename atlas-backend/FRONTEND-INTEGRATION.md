# Frontend Integration Guide - Connecting to ATLAS Backend

This guide explains how to integrate your portfolio frontend with the ATLAS backend API.

## Overview

The ATLAS backend is a separate Node.js server running on port 3001 that handles:
- Intelligent conversation processing
- - Intent detection
  - - Project recommendations
    - - Conversation history tracking
     
      - Your frontend chatbot UI should call the ATLAS API endpoints instead of processing messages locally.
     
      - ## Architecture
     
      - ```
        Portfolio Frontend (HTML/CSS/JS)
                ↓
           Chat Interface
                ↓
          ATLAS Backend API (Express.js)
                ↓
           Claude API + Supabase
        ```

        ## Integration Steps

        ### Step 1: Update Your Chat Handler

        **Before (Static Approach):**
        ```javascript
        function handleUserMessage(message) {
          // Old: Process locally with keywords
          const response = getStaticResponse(message);
          displayMessage(response);
        }
        ```

        **After (ATLAS Approach):**
        ```javascript
        async function handleUserMessage(message) {
          // New: Call ATLAS backend
          const response = await fetch('http://localhost:3001/api/atlas/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: message,
              visitorId: getOrCreateVisitorId(),
              conversationHistory: getCurrentConversationHistory()
            })
          });

          const data = await response.json();
          displayMessage(data.response);

          // Optional: Display detected intent
          console.log('Detected Intent:', data.detectedIntent);
          console.log('Recommended Projects:', data.recommendedProjects);
        }
        ```

        ### Step 2: Visitor ID Management

        Create a unique visitor ID to track conversations:

        ```javascript
        function getOrCreateVisitorId() {
          let visitorId = sessionStorage.getItem('atlas_visitor_id');

          if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('atlas_visitor_id', visitorId);
          }

          return visitorId;
        }
        ```

        ### Step 3: Track Conversation History

        Maintain conversation history to send with each request:

        ```javascript
        let conversationHistory = [];

        function getCurrentConversationHistory() {
          return conversationHistory;
        }

        function addToConversationHistory(role, content) {
          conversationHistory.push({ role, content });
        }

        async function handleUserMessage(message) {
          // Add user message to history
          addToConversationHistory('user', message);

          const response = await fetch('http://localhost:3001/api/atlas/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: message,
              visitorId: getOrCreateVisitorId(),
              conversationHistory: getCurrentConversationHistory()
            })
          });

          const data = await response.json();

          // Add assistant response to history
          addToConversationHistory('assistant', data.response);

          displayMessage(data.response);
        }
        ```

        ### Step 4: Update Your HTML

        Replace your static chatbot with dynamic API calls:

        ```html
        <div id="chat-container" class="chat">
          <div id="messages" class="messages"></div>

          <div class="input-area">
            <input
              id="message-input"
              type="text"
              placeholder="Ask me about my work..."
              onkeypress="handleKeyPress(event)"
            />
            <button onclick="sendMessage()">Send</button>
          </div>
        </div>

        <script>
        async function sendMessage() {
          const input = document.getElementById('message-input');
          const message = input.value.trim();

          if (!message) return;

          // Display user message
          displayMessage(message, 'user');
          input.value = '';

          try {
            // Show loading indicator
            displayLoadingIndicator();

            const response = await fetch('http://localhost:3001/api/atlas/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: message,
                visitorId: getOrCreateVisitorId(),
                conversationHistory: getCurrentConversationHistory()
              })
            });

            if (!response.ok) {
              throw new Error(`ATLAS API error: ${response.status}`);
            }

            const data = await response.json();

            // Remove loading indicator
            removeLoadingIndicator();

            // Add to conversation history
            addToConversationHistory('user', message);
            addToConversationHistory('assistant', data.response);

            // Display response
            displayMessage(data.response, 'assistant', data);

          } catch (error) {
            removeLoadingIndicator();
            console.error('Error calling ATLAS API:', error);
            displayMessage('Sorry, I encountered an error. Please try again.', 'error');
          }
        }

        function displayMessage(message, role, metadata = null) {
          const messagesDiv = document.getElementById('messages');
          const messageElement = document.createElement('div');
          messageElement.className = `message ${role}`;
          messageElement.textContent = message;

          // Optional: Display metadata like intent or recommendations
          if (metadata && metadata.detectedIntent) {
            const metaElement = document.createElement('div');
            metaElement.className = 'message-meta';
            metaElement.textContent = `[Intent: ${metadata.detectedIntent}]`;
            messageElement.appendChild(metaElement);
          }

          messagesDiv.appendChild(messageElement);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function handleKeyPress(event) {
          if (event.key === 'Enter') {
            sendMessage();
          }
        }
        </script>
        ```

        ### Step 5: CORS Configuration (Important!)

        If your frontend and backend are on different domains, update CORS in server.js:

        ```javascript
        // In atlas-backend/server.js
        const cors = require('cors');

        app.use(cors({
          origin: ['http://localhost:3000', 'https://yourdomain.com'],
          credentials: true
        }));
        ```

        ### Step 6: Deploy Considerations

        **Development:**
        - Frontend: http://localhost:3000
        - - Backend: http://localhost:3001
         
          - **Production:**
          - - Update API URL in your frontend:
            - ```javascript
              const ATLAS_API_URL = process.env.NODE_ENV === 'production'
                ? 'https://your-atlas-backend-domain.com'
                : 'http://localhost:3001';

              // Then use:
              const response = await fetch(`${ATLAS_API_URL}/api/atlas/chat`, { ... });
              ```

              ## API Reference

              ### POST /api/atlas/chat

              **Request:**
              ```json
              {
                "message": "Tell me about your web development experience",
                "visitorId": "visitor_123456789",
                "conversationHistory": [
                  { "role": "user", "content": "Hi!" },
                  { "role": "assistant", "content": "Hello! Welcome to my portfolio..." }
                ]
              }
              ```

              **Response:**
              ```json
              {
                "response": "I specialize in full-stack web development with React and Node.js...",
                "detectedIntent": "technical",
                "recommendedProjects": ["Nexus Omni-Link", "CCPractice"],
                "conversationId": "conv_abc123def456"
              }
              ```

              ### GET /api/atlas/projects

              Returns all projects in the knowledge base.

              **Response:**
              ```json
              {
                "projects": [
                  {
                    "name": "Nexus Omni-Link",
                    "description": "...",
                    "technologies": ["React", "Node.js", "MongoDB"],
                    "link": "..."
                  }
                ]
              }
              ```

              ### GET /api/atlas/about

              Returns Kathleen's background information.

              **Response:**
              ```json
              {
                "background": "...",
                "skills": ["JavaScript", "React", "Node.js", ...],
                "experience": "..."
              }
              ```

              ### GET /api/health

              Health check endpoint.

              **Response:**
              ```json
              { "status": "ok" }
              ```

              ## Error Handling

              ```javascript
              async function handleUserMessage(message) {
                try {
                  const response = await fetch('http://localhost:3001/api/atlas/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: message,
                      visitorId: getOrCreateVisitorId(),
                      conversationHistory: getCurrentConversationHistory()
                    }),
                    timeout: 30000 // 30 second timeout
                  });

                  if (!response.ok) {
                    if (response.status === 429) {
                      displayMessage('Too many requests. Please wait a moment.', 'error');
                    } else if (response.status === 500) {
                      displayMessage('Server error. Please try again later.', 'error');
                    } else {
                      displayMessage(`Error: ${response.status}`, 'error');
                    }
                    return;
                  }

                  const data = await response.json();
                  displayMessage(data.response, 'assistant');

                } catch (error) {
                  if (error.name === 'AbortError') {
                    displayMessage('Request timed out. Please try again.', 'error');
                  } else {
                    console.error('Chat error:', error);
                    displayMessage('Connection error. Please refresh and try again.', 'error');
                  }
                }
              }
              ```

              ## Testing the Integration

              1. **Start the ATLAS backend:**
              2. ```bash
                 cd atlas-backend
                 npm install
                 npm run dev
                 ```

                 2. **Test health endpoint:**
                 3. ```bash
                    curl http://localhost:3001/api/health
                    ```

                    3. **Test chat endpoint:**
                    4. ```bash
                       curl -X POST http://localhost:3001/api/atlas/chat \
                         -H "Content-Type: application/json" \
                         -d '{
                           "message": "What do you do?",
                           "visitorId": "test_visitor",
                           "conversationHistory": []
                         }'
                       ```

                       4. **Integrate with your frontend and test:**
                       5. - Open your portfolio in browser
                          - - Try chatting with ATLAS
                            - - Check browser console for errors
                              - - Monitor ATLAS server logs
                               
                                - ## Performance Tips
                               
                                - 1. **Cache conversation history** - Don't re-send entire history if not needed
                                  2. 2. **Debounce API calls** - Don't send on every keystroke
                                     3. 3. **Show loading state** - User feedback during API call
                                        4. 4. **Handle offline gracefully** - Fall back to static responses if API is down
                                          
                                           5. ## Common Issues
                                          
                                           6. **Issue:** CORS errors
                                           7. - **Solution:** Ensure CORS is configured correctly in server.js with your frontend domain
                                             
                                              - **Issue:** "Cannot POST /api/atlas/chat"
                                              - - **Solution:** Make sure ATLAS backend is running on port 3001
                                               
                                                - **Issue:** Timeout errors
                                                - - **Solution:** ATLAS backend may be slow, increase timeout or check API key
                                                 
                                                  - **Issue:** Empty responses from API
                                                  - - **Solution:** Check that ANTHROPIC_API_KEY and SUPABASE_URL are set correctly
                                                   
                                                    - ## Next Steps
                                                   
                                                    - 1. ✅ Integrate chat endpoint into your frontend
                                                      2. 2. ✅ Deploy ATLAS backend to production
                                                         3. 3. ✅ Update API URL for production domain
                                                            4. 4. ✅ Test end-to-end flow
                                                               5. 5. ✅ Monitor conversation analytics in Supabase
                                                                  6. 6. ✅ Refine knowledge base based on visitor questions
