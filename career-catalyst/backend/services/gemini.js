const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gemini Service - Centralized AI interaction
 */
class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    }

    /**
     * Generate AI response with retry logic
     */
    async generate(prompt, options = {}) {
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                attempt++;
                if (attempt >= maxRetries) {
                    console.error('Gemini API error after retries:', error);
                    throw new Error('AI service temporarily unavailable');
                }
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    /**
     * Analyze resume and extract skills
     */
    async analyzeResume(resumeText) {
        const prompt = `
Analyze this resume and provide a structured response in JSON format:

${resumeText}

Return ONLY valid JSON with this structure:
{
  "skills": ["skill1", "skill2", ...],
  "experience_years": number,
  "job_titles": ["title1", "title2", ...],
  "suggested_roles": [
    {
      "title": "Job Title",
      "match_score": 0-100,
      "reasoning": "Why this fits"
    }
  ],
  "strengths": ["strength1", ...],
  "transferable_skills": ["skill1", ...]
}
    `.trim();

        const response = await this.generate(prompt);

        // Parse JSON response
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                response.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Failed to parse Gemini response:', error);
            throw new Error('Failed to analyze resume');
        }
    }

    /**
     * Validate salary expectations with knowledge base data and location adjustments
     */
    async validateSalary(position, desiredSalary, yearsExperience, skills, marketData = null, location = '') {
        // Load salary benchmarks from knowledge base
        const fs = require('fs');
        const path = require('path');
        const benchmarksPath = path.join(__dirname, '../data/salary-benchmarks.json');
        const progressionsPath = path.join(__dirname, '../data/skill-progressions.json');
        const locationPath = path.join(__dirname, '../data/location-adjustments.json');

        let benchmarks = {};
        let progressions = {};
        let locationData = {};

        try {
            benchmarks = JSON.parse(fs.readFileSync(benchmarksPath, 'utf8'));
            progressions = JSON.parse(fs.readFileSync(progressionsPath, 'utf8'));
            locationData = JSON.parse(fs.readFileSync(locationPath, 'utf8'));
        } catch (error) {
            console.warn('Could not load knowledge base data:', error.message);
        }

        const prompt = `
You are a BRUTALLY HONEST career advisor with access to real market data and location-based salary adjustments.

USER'S SITUATION:
- Position: ${position}
- Desired Salary: $${desiredSalary.toLocaleString()}
- Years of Experience: ${yearsExperience}
- Key Skills: ${skills.join(', ')}
${location ? `- Location: ${location}` : ''}

REAL MARKET DATA FROM KNOWLEDGE BASE:
${JSON.stringify(benchmarks, null, 2)}

CAREER PROGRESSION REALITY:
${JSON.stringify(progressions, null, 2)}

LOCATION-BASED SALARY ADJUSTMENTS:
${JSON.stringify(locationData, null, 2)}

${marketData ? `ADDITIONAL MARKET DATA FROM ADZUNA:
Median Salary: $${Math.round(marketData.median_salary).toLocaleString()}
Range: $${Math.round(marketData.min_salary).toLocaleString()} - $${Math.round(marketData.max_salary).toLocaleString()}
Sample Size: ${marketData.job_count} jobs
` : ''}

INSTRUCTIONS:
1. Find the relevant role in the benchmarks data
2. Determine experience level based on years (junior: 0-2, mid: 2-5, senior: 5-10, expert: 10+)
3. Get the base salary range for that level
4. Apply location multiplier if location provided (use location-adjustments data)
5. Compare desired salary to BOTH national average AND location-adjusted amount
6. Check if they have the "typical_skills" for that level
7. Calculate skill gap percentage
8. Provide EVIDENCE-BASED verdict considering location reality

LOCATION REALITY:
- If user is in low-cost area (like West Virginia), most remote companies will adjust down
- Show BOTH numbers: national average and location-adjusted
- Provide strategies from location-adjustments for maximizing salary despite location
- Mention companies that ignore location (GitLab, Zapier, etc.)

RULES:
- If desired salary > location-adjusted median by 30%+ AND missing 50%+ typical skills = "overreaching"
- If desired salary < location-adjusted median by 20%+ = "undervalued"  
- Otherwise = "on-target"
- You MUST show both national and location-adjusted ranges
- Cite specific numbers from the knowledge base
- Show the math: national salary → location adjustment → final range
- List exact skills they're missing
- Provide location-specific strategies

Provide JSON response:
{
  "verdict": "undervalued" | "on-target" | "overreaching",
  "confidence": 0-100,
  "their_level": "junior|mid|senior|expert based on years and skills",
  "national_market_range": "$X - $Y from knowledge base",
  "location_adjusted_range": "$X - $Y after applying multiplier",
  "location_multiplier": 0.55-1.0,
  "salary_gap_vs_location_adjusted": "amount above or below adjusted median",
  "skill_match_percentage": 0-100,
  "missing_skills": ["specific skills from typical_skills they don't have"],
  "recommendation": "Specific advice with both national and adjusted numbers",
  "location_strategies": ["Ways to maximize salary despite location from knowledge base"],
  "companies_to_target": ["Companies that ignore location or use less aggressive adjustments"],
  "reality_check": "Honest assessment if expectations are unrealistic given location",
  "alternative_roles": [
    {
      "title": "Role that matches their actual skill level",
      "national_salary_range": "$X - $Y",
      "location_adjusted_range": "$X - $Y",
      "reasoning": "Why this is more realistic"
    }
  ]
}
    `.trim();

        const response = await this.generate(prompt);
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
            response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
        return JSON.parse(jsonStr);
    }


    /**
     * Customize resume for specific job
     */
    async customizeResume(baseResume, jobDescription) {
        const prompt = `
Customize this resume for the following job posting. Keep the same structure but emphasize relevant skills and rewrite bullet points to match the job requirements.

BASE RESUME:
${baseResume}

JOB DESCRIPTION:
${jobDescription}

Return the customized resume with improved bullet points that highlight relevant experience.
    `.trim();

        return await this.generate(prompt);
    }

    /**
     * Generate cover letter
     */
    async generateCoverLetter(resumeText, jobDescription, companyName, position) {
        const prompt = `
Write a compelling, personalized cover letter for this job application.

CANDIDATE BACKGROUND:
${resumeText}

JOB POSTING:
Company: ${companyName}
Position: ${position}
Description: ${jobDescription}

Write a professional cover letter (3-4 paragraphs) that:
1. Shows genuine interest in the company
2. Highlights 2-3 relevant achievements
3. Explains why they're a perfect fit
4. Has a strong closing

Keep it concise, authentic, and achievement-focused.
    `.trim();

        return await this.generate(prompt);
    }

    /**
     * Generate networking strategy
     */
    async generateNetworkingStrategy(companyName, position) {
        const prompt = `
Create a LinkedIn networking strategy for someone applying to ${companyName} for a ${position} role.

Provide a JSON response:
{
  "key_contacts": [
    {
      "title": "VP Engineering",
      "why": "Likely hiring manager",
      "search_query": "VP Engineering at ${companyName}"
    }
  ],
  "connection_message": "Template for personalized connection request",
  "follow_up_message": "Message to send after connecting",
  "strategy": "Overall approach"
}
    `.trim();

        const response = await this.generate(prompt);
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
            response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
        return JSON.parse(jsonStr);
    }
}

module.exports = new GeminiService();
