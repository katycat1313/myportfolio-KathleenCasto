const gemini = require('../services/gemini');

/**
 * Network Strategist Agent
 * Generates networking strategies and LinkedIn outreach plans
 */
class NetworkStrategistAgent {
    /**
     * Generate networking strategy for a job
     */
    async generateStrategy(job) {
        try {
            const strategy = await gemini.generateNetworkingStrategy(
                job.company,
                job.title
            );

            return {
                company: job.company,
                position: job.title,
                key_contacts: strategy.key_contacts || [],
                connection_message: strategy.connection_message,
                follow_up_message: strategy.follow_up_message,
                overall_strategy: strategy.strategy,
                tips: [
                    'Personalize each connection request',
                    'Reference specific company projects or values',
                    'Follow up 1 week after connecting',
                    'Engage with their content before reaching out'
                ]
            };
        } catch (error) {
            console.error('Networking strategy error:', error);
            throw new Error('Failed to generate networking strategy');
        }
    }

    /**
     * Generate personalized connection message
     */
    async generateConnectionMessage(contact, jobTitle, companyName, userBackground) {
        const prompt = `
Write a personalized LinkedIn connection request message.

Target Contact: ${contact.title} at ${companyName}
Seeking Role: ${jobTitle}
My Background: ${userBackground}

Requirements:
- Maximum 300 characters (LinkedIn limit)
- Mention specific company project or value
- Professional but warm tone
- Clear why you're reaching out

Return only the message text.
    `.trim();

        try {
            const message = await gemini.generate(prompt);
            return message.substring(0, 300); // Enforce LinkedIn limit
        } catch (error) {
            // Fallback template
            return `Hi! I'm interested in the ${jobTitle} role at ${companyName}. Your work in ${contact.title} is impressive. Would love to connect!`;
        }
    }

    /**
     * Identify key decision makers for a role
     */
    identifyDecisionMakers(jobTitle) {
        const titleLower = jobTitle.toLowerCase();
        const contacts = [];

        // Engineering roles
        if (titleLower.includes('engineer') || titleLower.includes('developer')) {
            contacts.push(
                { title: 'VP Engineering', reason: 'Likely final decision maker' },
                { title: 'Engineering Manager', reason: 'Direct hiring manager' },
                { title: 'Recruiter', reason: 'First point of contact' }
            );
        }
        // Product roles
        else if (titleLower.includes('product')) {
            contacts.push(
                { title: 'VP Product', reason: 'Department head' },
                { title: 'Product Manager', reason: 'Potential teammate' },
                { title: 'Recruiter', reason: 'Application facilitator' }
            );
        }
        // Design roles
        else if (titleLower.includes('design') || titleLower.includes('ux')) {
            contacts.push(
                { title: 'Head of Design', reason: 'Design leadership' },
                { title: 'Design Manager', reason: 'Direct manager' },
                { title: 'Senior Designer', reason: 'Team member insight' }
            );
        }
        // Generic fallback
        else {
            contacts.push(
                { title: 'Hiring Manager', reason: 'Direct decision maker' },
                { title: 'Team Lead', reason: 'Team insights' },
                { title: 'Recruiter', reason: 'Application process' }
            );
        }

        return contacts;
    }

    /**
     * Generate LinkedIn search queries
     */
    generateSearchQueries(companyName, contacts) {
        return contacts.map(contact => ({
            contact_type: contact.title,
            search_query: `${contact.title} at ${companyName}`,
            linkedin_url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(contact.title + ' ' + companyName)}`,
            reason: contact.reason
        }));
    }

    /**
     * Create complete networking plan
     */
    async createNetworkingPlan(job, userResume) {
        const decisionMakers = this.identifyDecisionMakers(job.title);
        const searchQueries = this.generateSearchQueries(job.company, decisionMakers);
        const strategy = await this.generateStrategy(job);

        return {
            job: {
                title: job.title,
                company: job.company,
                url: job.url
            },
            target_contacts: decisionMakers,
            search_queries: searchQueries,
            outreach_strategy: strategy,
            timeline: {
                day_1: 'Research company and save 3-5 target contacts',
                day_2: 'Send personalized connection requests (max 3/day)',
                day_3: 'Engage with contacts\' recent posts',
                week_2: 'Follow up with connected contacts',
                ongoing: 'Share relevant content, build relationship'
            }
        };
    }
}

module.exports = new NetworkStrategistAgent();
