const gemini = require('../services/gemini');

/**
 * Application Optimizer Agent
 * Customizes resumes and generates cover letters
 */
class ApplicationOptimizerAgent {
    /**
     * Customize resume for specific job
     */
    async customizeResume(baseResume, jobPosting) {
        try {
            const customized = await gemini.customizeResume(
                baseResume,
                jobPosting.description
            );

            return {
                original: baseResume,
                customized: customized,
                job_title: jobPosting.title,
                company: jobPosting.company,
                changes_made: this.summarizeChanges(baseResume, customized)
            };
        } catch (error) {
            console.error('Resume customization error:', error);
            throw new Error('Failed to customize resume');
        }
    }

    /**
     * Generate cover letter
     */
    async generateCoverLetter(resume, jobPosting) {
        try {
            const coverLetter = await gemini.generateCoverLetter(
                resume,
                jobPosting.description,
                jobPosting.company,
                jobPosting.title
            );

            return {
                content: coverLetter,
                job_title: jobPosting.title,
                company: jobPosting.company,
                word_count: coverLetter.split(/\s+/).length
            };
        } catch (error) {
            console.error('Cover letter generation error:', error);
            throw new Error('Failed to generate cover letter');
        }
    }

    /**
     * Generate both resume and cover letter
     */
    async generateCompleteApplication(resume, jobPosting) {
        try {
            const [customResume, coverLetter] = await Promise.all([
                this.customizeResume(resume, jobPosting),
                this.generateCoverLetter(resume, jobPosting)
            ]);

            return {
                resume: customResume,
                cover_letter: coverLetter,
                ready_to_apply: true,
                notes: [
                    'Review customized resume for accuracy',
                    'Personalize cover letter if needed',
                    'Ensure all contact information is correct'
                ]
            };
        } catch (error) {
            console.error('Complete application error:', error);
            throw new Error('Failed to generate application materials');
        }
    }

    /**
     * Summarize changes made to resume
     */
    summarizeChanges(original, customized) {
        // Simple word count comparison
        const origWords = original.split(/\s+/).length;
        const customWords = customized.split(/\s+/).length;

        const changes = [];

        if (customWords > origWords) {
            changes.push(`Added ${customWords - origWords} words to emphasize relevant experience`);
        } else if (customWords < origWords) {
            changes.push(`Removed ${origWords - customWords} words for conciseness`);
        }

        changes.push('Rewritten to match job requirements');
        changes.push('Emphasized relevant keywords');

        return changes;
    }

    /**
     * Score application quality
     */
    scoreApplication(resume, jobDescription) {
        let score = 0;
        const jobText = jobDescription.toLowerCase();
        const resumeText = resume.toLowerCase();

        // Extract key terms from job description (simplified)
        const keyTerms = this.extractKeyTerms(jobDescription);

        // Count matching terms
        const matches = keyTerms.filter(term =>
            resumeText.includes(term.toLowerCase())
        );

        // Score based on match percentage
        const matchRate = matches.length / keyTerms.length;
        score = Math.round(matchRate * 100);

        return {
            score: Math.min(100, score),
            matched_terms: matches.length,
            total_key_terms: keyTerms.length,
            recommendations: this.getRecommendations(score)
        };
    }

    /**
     * Extract key terms from job description
     */
    extractKeyTerms(description) {
        const text = description.toLowerCase();
        const terms = [];

        // Common skill patterns
        const patterns = [
            /\b\w+ing\b/g, // -ing words (programming, testing, etc.)
            /\b[A-Z][a-z]+\b/g, // Capitalized words (JavaScript, Python, etc.)
        ];

        // Extract unique terms over 3 characters
        const words = text.match(/\b\w{4,}\b/g) || [];

        // Filter common words
        const commonWords = new Set(['with', 'have', 'that', 'this', 'from', 'will', 'your', 'about', 'team', 'work']);

        return [...new Set(words)].filter(word => !commonWords.has(word)).slice(0, 20);
    }

    /**
     * Get recommendations based on score
     */
    getRecommendations(score) {
        if (score >= 80) {
            return ['Excellent match! Apply with confidence.'];
        } else if (score >= 60) {
            return [
                'Good match. Consider adding more relevant keywords.',
                'Emphasize specific achievements that align with requirements.'
            ];
        } else {
            return [
                'Consider customizing your resume more.',
                'Highlight transferable skills.',
                'Add quantifiable achievements related to this role.'
            ];
        }
    }
}

module.exports = new ApplicationOptimizerAgent();
