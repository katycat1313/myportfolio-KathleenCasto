const gemini = require('../services/gemini');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

/**
 * Skills Analyzer Agent
 * Analyzes resumes and identifies matching job opportunities
 */
class SkillsAnalyzerAgent {
    /**
     * Parse resume file
     */
    async parseResume(filePath) {
        const extension = filePath.toLowerCase().split('.').pop();

        try {
            if (extension === 'pdf') {
                const dataBuffer = await fs.readFile(filePath);
                const data = await pdfParse(dataBuffer);
                return data.text;
            } else if (extension === 'docx') {
                const result = await mammoth.extractRawText({ path: filePath });
                return result.value;
            } else if (extension === 'txt') {
                return await fs.readFile(filePath, 'utf-8');
            } else {
                throw new Error('Unsupported file format. Use PDF, DOCX, or TXT.');
            }
        } catch (error) {
            console.error('Resume parsing error:', error);
            throw new Error('Failed to parse resume');
        }
    }

    /**
     * Analyze resume text directly
     */
    async analyzeResumeText(resumeText) {
        try {
            const analysis = await gemini.analyzeResume(resumeText);

            // Ensure all required fields exist
            return {
                skills: analysis.skills || [],
                experience_years: analysis.experience_years || 0,
                job_titles: analysis.job_titles || [],
                suggested_roles: analysis.suggested_roles || [],
                strengths: analysis.strengths || [],
                transferable_skills: analysis.transferable_skills || []
            };
        } catch (error) {
            console.error('Skills analysis error:', error);
            throw new Error('Failed to analyze skills');
        }
    }

    /**
     * Analyze resume from file path
     */
    async analyzeResumeFile(filePath) {
        const resumeText = await this.parseResume(filePath);
        return await this.analyzeResumeText(resumeText);
    }

    /**
     * Get job search queries from analysis
     */
    getSearchQueries(analysis) {
        const queries = [];

        // Add suggested roles
        if (analysis.suggested_roles) {
            queries.push(...analysis.suggested_roles.map(role => role.title));
        }

        // Add current job titles
        if (analysis.job_titles) {
            queries.push(...analysis.job_titles);
        }

        // Remove duplicates
        return [...new Set(queries)];
    }
}

module.exports = new SkillsAnalyzerAgent();
