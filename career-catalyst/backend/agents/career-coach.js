/**
 * Career Coach - Conversational AI Agent
 * Provides personalized career coaching with full context awareness
 */

const gemini = require('../services/gemini');

class CareerCoachAgent {
    constructor() {
        this.conversationHistory = new Map(); // userId -> messages
    }

    /**
     * Chat with career coach - understands full user context
     */
    async chat(userId, userMessage, userContext = {}) {
        try {
            // Get or create conversation history
            if (!this.conversationHistory.has(userId)) {
                this.conversationHistory.set(userId, []);
            }

            const history = this.conversationHistory.get(userId);

            // Build context-aware prompt
            const systemContext = this.buildSystemContext(userContext);
            const conversationContext = this.buildConversationContext(history);

            const prompt = `
${systemContext}

${conversationContext}

USER: ${userMessage}

INSTRUCTIONS:
- You are a caring but honest career coach
- The user can EXPLAIN context you might have missed
- If they challenge your assessment, LISTEN and re-evaluate
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Reference their actual data (resume, GitHub, portfolio, etc.)
- Help them understand the job market realistically

ASSISTANT:`;

            const response = await gemini.generate(prompt);

            // Update conversation history
            history.push({ role: 'user', content: userMessage });
            history.push({ role: 'assistant', content: response });

            // Keep only last 20 messages to avoid token limits
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }

            return {
                message: response,
                conversation_id: userId
            };
        } catch (error) {
            console.error('Career coach chat error:', error);
            throw new Error('Failed to process chat message');
        }
    }

    /**
     * Build system context from user's assessment data
     */
    buildSystemContext(userContext) {
        const {
            resume,
            skillsAnalysis,
            salaryValidation,
            qualityAssessment,
            position,
            location
        } = userContext;

        let context = `You are an expert career coach with access to this user's complete profile:\n\n`;

        if (position) {
            context += `TARGET ROLE: ${position}\n`;
        }

        if (location) {
            context += `LOCATION: ${location}\n`;
        }

        if (skillsAnalysis) {
            context += `\nSKILLS ANALYSIS:\n`;
            context += `- Experience: ${skillsAnalysis.experience_years || 0} years\n`;
            context += `- Skills: ${(skillsAnalysis.skills || []).join(', ')}\n`;
            context += `- Level: ${skillsAnalysis.overall_level || 'Unknown'}\n`;
        }

        if (salaryValidation) {
            context += `\nSALARY ASSESSMENT:\n`;
            context += `- Their target: ${salaryValidation.your_target}\n`;
            context += `- Verdict: ${salaryValidation.verdict}\n`;
            context += `- Market range: ${salaryValidation.market_data?.range || 'N/A'}\n`;
            if (salaryValidation.location_adjusted_range) {
                context += `- Location-adjusted: ${salaryValidation.location_adjusted_range}\n`;
            }
        }

        if (qualityAssessment) {
            context += `\nCREDENTIALS ASSESSMENT:\n`;
            context += `- Overall rating: ${qualityAssessment.overall_rating}/10\n`;
            context += `- Level: ${qualityAssessment.overall_level}\n`;

            if (qualityAssessment.github) {
                context += `\nGitHub:\n`;
                context += `  - Rating: ${qualityAssessment.github.rating}/10\n`;
                context += `  - Strengths: ${(qualityAssessment.github.strengths || []).join(', ')}\n`;
                context += `  - Issues: ${(qualityAssessment.github.red_flags || []).join(', ')}\n`;
            }

            if (qualityAssessment.portfolio) {
                context += `\nPortfolio:\n`;
                context += `  - Rating: ${qualityAssessment.portfolio.rating}/10\n`;
                context += `  - Type: ${qualityAssessment.portfolio.portfolio_type || 'N/A'}\n`;
            }
        }

        if (resume) {
            context += `\nRESUME SUMMARY:\n${resume.substring(0, 500)}...\n`;
        }

        context += `\n---\n`;

        return context;
    }

    /**
     * Build conversation history context
     */
    buildConversationContext(history) {
        if (history.length === 0) {
            return `This is the start of the conversation.\n`;
        }

        let context = `CONVERSATION HISTORY:\n`;
        history.slice(-10).forEach(msg => {
            const role = msg.role === 'user' ? 'USER' : 'ASSISTANT';
            context += `${role}: ${msg.content}\n\n`;
        });

        return context;
    }

    /**
     * Clear conversation history for a user
     */
    clearHistory(userId) {
        this.conversationHistory.delete(userId);
    }
}

module.exports = new CareerCoachAgent();
