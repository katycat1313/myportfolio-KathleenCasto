# ATLAS on Netlify - Quick Start Guide

Deploy ATLAS backend to your Netlify site using serverless functions.
**Your Domain**: `portfolio.smartintakesolutions.space`

## ⚡ Quick Setup (5 Minutes)

### Step 1: Connect Your Repository to Netlify

1. **Go to Netlify Dashboard**
2.    - Visit https://app.netlify.com
      -    - Sign in with your account
       
           - 2. **Connect Repository**
             3.    - Click "Add new site" → "Import an existing project"
                   -    - Select GitHub as provider
                        -    - Choose: `katycat1313/myportfolio-KathleenCasto`
                             -    - Click "Import"
                              
                                  - 3. **Configure Build Settings**
                                    4.    - **Base directory**: Leave blank (root of repo)
                                          -    - **Build command**: `npm install`
                                               -    - **Functions directory**: `atlas-backend`
                                                    -    - **Publish directory**: `public`
                                                     
                                                         -    OR: Netlify will auto-detect from `netlify.toml` if configured correctly
                                                     
                                                         -    ### Step 2: Add Environment Variables
                                                     
                                                         -    In Netlify Dashboard:
                                                         -    1. Go to **Site settings** → **Build & deploy** → **Environment**
                                                              2. 2. Click "Edit variables"
                                                                 3. 3. Add these three variables:
                                                                   
                                                                    4. ```
                                                                       ANTHROPIC_API_KEY = sk-ant-v0c-... (from https://console.anthropic.com)
                                                                       SUPABASE_URL = https://your-project.supabase.co
                                                                       SUPABASE_KEY = your-anon-key
                                                                       NODE_ENV = production
                                                                       ```

                                                                       ### Step 3: Deploy

                                                                       1. **Option A: Auto-Deploy (Easiest)**
                                                                       2.    - Just push to GitHub: `git push origin main`
                                                                             -    - Netlify automatically deploys on every push
                                                                              
                                                                                  - 2. **Option B: Manual Deploy**
                                                                                    3.    - Go to Netlify Dashboard
                                                                                          -    - Click "Trigger deploy" → "Deploy site"
                                                                                           
                                                                                               - ### Step 4: Get Your Backend URL
                                                                                           
                                                                                               - Your ATLAS API will be at:
                                                                                               - ```
                                                                                                 https://portfolio.smartintakesolutions.space/.netlify/functions/atlas-backend/api/
                                                                                                 ```

                                                                                                 ### Step 5: Test the API

                                                                                                 ```bash
                                                                                                 # Test health endpoint
                                                                                                 curl https://portfolio.smartintakesolutions.space/.netlify/functions/atlas-backend/api/health

                                                                                                 # Test chat endpoint
                                                                                                 curl -X POST https://portfolio.smartintakesolutions.space/.netlify/functions/atlas-backend/api/atlas/chat \
                                                                                                   -H "Content-Type: application/json" \
                                                                                                   -d '{
                                                                                                     "message": "What do you do?",
                                                                                                     "visitorId": "test_user",
                                                                                                     "conversationHistory": []
                                                                                                   }'
                                                                                                 ```

                                                                                                 ### Step 6: Update Frontend

                                                                                                 In your portfolio's JavaScript, update the API URL:

                                                                                                 ```javascript
                                                                                                 // Set the ATLAS backend URL
                                                                                                 const ATLAS_API_URL = 'https://portfolio.smartintakesolutions.space/.netlify/functions/atlas-backend';

                                                                                                 // Then use it in fetch calls
                                                                                                 async function sendMessage(userMessage) {
                                                                                                   const response = await fetch(`${ATLAS_API_URL}/api/atlas/chat`, {
                                                                                                     method: 'POST',
                                                                                                     headers: {
                                                                                                       'Content-Type': 'application/json'
                                                                                                     },
                                                                                                     body: JSON.stringify({
                                                                                                       message: userMessage,
                                                                                                       visitorId: getOrCreateVisitorId(),
                                                                                                       conversationHistory: getCurrentConversationHistory()
                                                                                                     })
                                                                                                   });

                                                                                                   const data = await response.json();
                                                                                                   return data.response;
                                                                                                 }
                                                                                                 ```

                                                                                                 ---

                                                                                                 ## 📊 What's Happening?

                                                                                                 ### Netlify Functions (Serverless)
                                                                                                 - Your Express server runs as a Netlify Function
                                                                                                 - - Automatically scales (no server to manage)
                                                                                                   - - Pay only for what you use
                                                                                                     - - Free tier: 125,000 requests/month
                                                                                                      
                                                                                                       - ### netlify.toml Configuration
                                                                                                       - - Tells Netlify how to build your site
                                                                                                         - - Routes `/api/*` requests to serverless function
                                                                                                           - - Sets CORS headers for your domain
                                                                                                             - - Automatic GitHub integration
                                                                                                              
                                                                                                               - ### Cost
                                                                                                               - - **Free tier**: Up to 125,000 function invocations/month
                                                                                                                 - - **No additional cost** for ATLAS if under limit
                                                                                                                   - - Supabase: Free tier for hobby projects
                                                                                                                     - - Anthropic API: Pay-as-you-go (~$2-5/month estimated)
                                                                                                                      
                                                                                                                       - ---
                                                                                                                       
                                                                                                                       ## ✅ Verify Deployment
                                                                                                                       
                                                                                                                       ### 1. Check Build Logs
                                                                                                                       
                                                                                                                       In Netlify Dashboard:
                                                                                                                       1. Go to **Deploys**
                                                                                                                       2. 2. Click latest deploy
                                                                                                                          3. 3. Check "Deploy log" for any errors
                                                                                                                             4. 4. Should see: "Functions bundled and ready"
                                                                                                                               
                                                                                                                                5. ### 2. Test API Health
                                                                                                                               
                                                                                                                                6. ```bash
                                                                                                                                   curl https://portfolio.smartintakesolutions.space/.netlify/functions/atlas-backend/api/health
                                                                                                                                   ```
                                                                                                                                   
                                                                                                                                   Expected response:
                                                                                                                                   ```json
                                                                                                                                   {"status":"ok"}
                                                                                                                                   ```
                                                                                                                                   
                                                                                                                                   ### 3. Test Chat Endpoint
                                                                                                                                   
                                                                                                                                   Send a test message and verify you get back a response with:
                                                                                                                                   - `response` (the AI-generated answer)
                                                                                                                                   - - `detectedIntent` (e.g., "technical", "hiring_manager")
                                                                                                                                     - - `recommendedProjects` (array of project names)
                                                                                                                                      
                                                                                                                                       - ### 4. Check Supabase
                                                                                                                                      
                                                                                                                                       - 1. Go to https://supabase.com
                                                                                                                                         2. 2. Open your project
                                                                                                                                            3. 3. Check "conversations" table
                                                                                                                                               4. 4. You should see test messages stored
                                                                                                                                                 
                                                                                                                                                  5. ---
                                                                                                                                                 
                                                                                                                                                  6. ## 🐛 Troubleshooting
                                                                                                                                                 
                                                                                                                                                  7. ### Issue: "Cannot find module 'express'"
                                                                                                                                                 
                                                                                                                                                  8. **Solution**:
                                                                                                                                                  9. - Make sure `package.json` is in `atlas-backend/` folder
                                                                                                                                                     - - Check that `netlify.toml` has correct function path
                                                                                                                                                       - - Redeploy
                                                                                                                                                        
                                                                                                                                                         - ### Issue: "ANTHROPIC_API_KEY is undefined"
                                                                                                                                                        
                                                                                                                                                         - **Solution**:
                                                                                                                                                         - - Go to Netlify Dashboard → Site settings → Build & deploy → Environment
                                                                                                                                                           - - Verify all three variables are set (case-sensitive!)
                                                                                                                                                             - - Trigger new deploy after adding variables
                                                                                                                                                              
                                                                                                                                                               - ### Issue: 404 error on API endpoint
                                                                                                                                                              
                                                                                                                                                               - **Solution**:
                                                                                                                                                               - - Verify URL is correct: `https://portfolio.smartintakesolutions.space/.netlify/functions/atlas-backend/api/...`
                                                                                                                                                                 - - Check deploy logs for errors
                                                                                                                                                                   - - Ensure `netlify.toml` is at root of repository
                                                                                                                                                                    
                                                                                                                                                                     - ### Issue: CORS errors in browser
                                                                                                                                                                    
                                                                                                                                                                     - **Solution**:
                                                                                                                                                                     - - Netlify.toml already sets CORS headers
                                                                                                                                                                       - - Clear browser cache and try again
                                                                                                                                                                         - - Test with curl first (doesn't require CORS)
                                                                                                                                                                          
                                                                                                                                                                           - ### Issue: "The function you're looking for doesn't exist"
                                                                                                                                                                          
                                                                                                                                                                           - **Solution**:
                                                                                                                                                                           - - Build may have failed
                                                                                                                                                                             - - Check Netlify deploy logs
                                                                                                                                                                               - - Verify `netlify.toml` specifies correct functions directory
                                                                                                                                                                                 - - Make sure `server.js` exists in `atlas-backend/`
                                                                                                                                                                                  
                                                                                                                                                                                   - ---
                                                                                                                                                                                   
                                                                                                                                                                                   ## 📝 Set Up Supabase (One-Time)
                                                                                                                                                                                   
                                                                                                                                                                                   If you haven't created a Supabase project yet:
                                                                                                                                                                                   
                                                                                                                                                                                   1. **Go to Supabase**
                                                                                                                                                                                   2.    - Visit https://supabase.com
                                                                                                                                                                                         -    - Click "New Project"
                                                                                                                                                                                              -    - Select a region (recommended: closest to you)
                                                                                                                                                                                                   -    - Create database
                                                                                                                                                                                                    
                                                                                                                                                                                                        - 2. **Get Credentials**
                                                                                                                                                                                                          3.    - Go to Project Settings
                                                                                                                                                                                                                -    - Copy "Project URL" → This is `SUPABASE_URL`
                                                                                                                                                                                                                     -    - Copy "API Key" (anon/public) → This is `SUPABASE_KEY`
                                                                                                                                                                                                                      
                                                                                                                                                                                                                          - 3. **Initialize Database**
                                                                                                                                                                                                                            4.    - Go to SQL Editor
                                                                                                                                                                                                                                  -    - Paste content from `database-schema.sql`
                                                                                                                                                                                                                                       -    - Click "Run"
                                                                                                                                                                                                                                            -    - Tables are now created!
                                                                                                                                                                                                                                             
                                                                                                                                                                                                                                                 - 4. **Add to Netlify Environment**
                                                                                                                                                                                                                                                   5.    - Copy those two values
                                                                                                                                                                                                                                                         -    - Add to Netlify environment variables (Step 2 above)
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - ---
                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                              ## 🚀 Full Deployment Checklist
                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                              - [ ] Repository pushed to GitHub with all ATLAS files
                                                                                                                                                                                                                                                              - [ ] - [ ] netlify.toml exists in repository root
                                                                                                                                                                                                                                                              - [ ] - [ ] Connected GitHub repository to Netlify
                                                                                                                                                                                                                                                              - [ ] - [ ] Set build directory correctly (auto-detect from netlify.toml)
                                                                                                                                                                                                                                                              - [ ] - [ ] Added environment variables (ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY)
                                                                                                                                                                                                                                                              - [ ] - [ ] Supabase database created and schema initialized
                                                                                                                                                                                                                                                              - [ ] - [ ] Triggered first deploy (auto or manual)
                                                                                                                                                                                                                                                              - [ ] - [ ] Verified build logs show "Functions bundled and ready"
                                                                                                                                                                                                                                                              - [ ] - [ ] Tested health endpoint with curl
                                                                                                                                                                                                                                                              - [ ] - [ ] Updated frontend with correct API URL
                                                                                                                                                                                                                                                              - [ ] - [ ] Tested chat endpoint with curl
                                                                                                                                                                                                                                                              - [ ] - [ ] Checked Supabase for stored conversations
                                                                                                                                                                                                                                                              - [ ] - [ ] Frontend can send messages to ATLAS
                                                                                                                                                                                                                                                              - [ ] - [ ] ATLAS returns intelligent responses
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] ---
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] ## 🎯 Your Next Steps
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] 1. **Push this repository to GitHub** (if not already done)
                                                                                                                                                                                                                                                              - [ ] 2. **Go to netlify.com** → Connect your GitHub repo
                                                                                                                                                                                                                                                              - [ ] 3. **Add environment variables** (3 variables needed)
                                                                                                                                                                                                                                                              - [ ] 4. **Deploy** (automatic on every GitHub push)
                                                                                                                                                                                                                                                              - [ ] 5. **Test with curl** (verify API works)
                                                                                                                                                                                                                                                              - [ ] 6. **Update frontend** (change API URL in JavaScript)
                                                                                                                                                                                                                                                              - [ ] 7. **Launch!** 🎉
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] ---
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] ## 📞 Support & Resources
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] - **Netlify Functions**: https://docs.netlify.com/functions/overview/
                                                                                                                                                                                                                                                              - [ ] - **Netlify Environment Variables**: https://docs.netlify.com/configure-builds/environment-variables/
                                                                                                                                                                                                                                                              - [ ] - **Supabase Docs**: https://supabase.com/docs
                                                                                                                                                                                                                                                              - [ ] - **ATLAS Documentation**: See README.md and FRONTEND-INTEGRATION.md
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] ---
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] ## ⚡ Performance Notes
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] **Cold Starts**: First request may take 1-2 seconds (normal for serverless)
                                                                                                                                                                                                                                                              - [ ] **Subsequent Requests**: Usually respond in <500ms
                                                                                                                                                                                                                                                              - [ ] **Scaling**: Automatic - no need to manage servers
                                                                                                                                                                                                                                                              - [ ] **Uptime**: Netlify provides 99.99% uptime SLA
                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                              - [ ] Your ATLAS backend is now live on Netlify! 🚀
