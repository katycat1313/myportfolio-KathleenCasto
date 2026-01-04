const gemini = require('../services/gemini');
const axios = require('axios');

/**
 * Quality Assessor Agent
 * Provides honest assessment of user credentials across any profession
 */
class QualityAssessorAgent {
    /**
     * Main assessment function
     */
    async assessCredentials(credentials, targetRole) {
        const assessments = {};

        // Assess each credential type
        if (credentials.github) {
            assessments.github = await this.assessGitHub(credentials.github);
        }

        if (credentials.portfolio) {
            assessments.portfolio = await this.assessPortfolio(credentials.portfolio);
        }

        if (credentials.linkedin) {
            assessments.linkedin = await this.assessLinkedIn(credentials.linkedin);
        }

        if (credentials.writing) {
            assessments.writing = await this.assessWriting(credentials.writing);
        }

        if (credentials.design) {
            assessments.design = await this.assessDesign(credentials.design);
        }

        // Generate comprehensive report
        const report = await this.generateHonestReport(assessments, targetRole);

        return report;
    }

    /**
     * Assess GitHub profile (for developers/engineers)
     */
    async assessGitHub(username) {
        try {
            // Extract username if full URL provided
            let cleanUsername = username;
            if (username.includes('github.com/')) {
                const match = username.match(/github\.com\/([^\/\?#]+)/);
                cleanUsername = match ? match[1] : username;
            }

            // Fetch user repos
            const response = await axios.get(`https://api.github.com/users/${cleanUsername}/repos`, {
                headers: { 'User-Agent': 'Career-Catalyst-AI' },
                timeout: 10000
            });

            const repos = response.data;

            // Analyze repos
            const analysis = {
                total_repos: repos.length,
                languages: this.extractLanguages(repos),
                has_readmes: repos.filter(r => r.has_readme || r.description).length,
                stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
                forks: repos.reduce((sum, r) => sum + r.forks_count, 0),
                recent_activity: this.checkRecentActivity(repos),
                top_repos: repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3)
            };

            // Get AI assessment
            const aiAssessment = await this.getAIGitHubAssessment(analysis, cleanUsername);

            return {
                raw_data: analysis,
                assessment: aiAssessment,
                url: `https://github.com/${cleanUsername}`
            };
        } catch (error) {
            console.error('GitHub assessment error:', error.message);

            // Provide specific error messages
            if (error.response?.status === 404) {
                return {
                    error: 'GitHub profile not found. Please check the username is correct.',
                    details: `Could not find profile: ${username}`,
                    assessment: { rating: 0, should_share: false }
                };
            } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
                return {
                    error: 'Network error - could not connect to GitHub',
                    details: 'Check your internet connection',
                    assessment: { rating: 0, should_share: false }
                };
            } else {
                return {
                    error: 'Failed to assess GitHub profile',
                    details: error.message,
                    assessment: { rating: 0, should_share: false }
                };
            }
        }
    }

    /**
     * Assess portfolio website (for all professions)
     */
    async assessPortfolio(url) {
        try {
            // Validate and fetch URL
            const response = await axios.get(url, {
                timeout: 10000,
                maxRedirects: 5,
                headers: { 'User-Agent': 'Career-Catalyst-AI' }
            });

            const analysis = {
                loads: true,
                status_code: response.status,
                content_length: response.data.length,
                has_https: url.startsWith('https')
            };

            // Get AI to analyze the content
            const aiAssessment = await this.getAIPortfolioAssessment(response.data, url);

            return {
                raw_data: analysis,
                assessment: aiAssessment,
                url: url
            };
        } catch (error) {
            console.error('Portfolio assessment error:', error.message);

            // Provide specific error messages
            let errorMessage = 'Could not access portfolio';
            let details = '';

            if (error.code === 'ENOTFOUND') {
                errorMessage = 'Website does not exist';
                details = 'DNS lookup failed - domain not found';
            } else if (error.code === 'ETIMEDOUT') {
                errorMessage = 'Website took too long to respond';
                details = 'Connection timed out after 10 seconds';
            } else if (error.response?.status === 404) {
                errorMessage = 'Page not found (404)';
                details = 'The URL exists but this specific page does not';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access forbidden (403)';
                details = 'Website blocked automated access';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Website server error';
                details = `Server returned ${error.response.status}`;
            }

            return {
                error: errorMessage,
                details: details,
                url: url,
                assessment: {
                    rating: 0,
                    issues: [errorMessage, details],
                    should_share: false
                }
            };
        }
    }

    /**
     * Assess LinkedIn profile (for all professions)
     */
    async assessLinkedIn(url) {
        // For LinkedIn, we can't scrape easily due to auth
        // So we ask AI to analyze what a good profile should have
        const prompt = `
Analyze this LinkedIn profile URL and provide assessment criteria: ${url}

Give advice on what makes a strong LinkedIn profile for job searching:
- Profile completeness
- Number of connections (estimate if visible)
- Recommendations importance
- Activity/engagement

Return JSON:
{
  "rating": 0-10,
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "should_share": true/false
}
    `;

        try {
            const response = await gemini.generate(prompt);
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
            const assessment = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : response);

            return {
                assessment: assessment,
                url: url
            };
        } catch (error) {
            return {
                assessment: {
                    rating: 5,
                    recommendations: ['Ensure your LinkedIn profile is public and complete'],
                    should_share: true
                }
            };
        }
    }

    /**
     * Assess writing samples (for writers/marketers)
     */
    async assessWriting(url) {
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const content = response.data;

            const prompt = `
Analyze this writing sample and provide honest feedback:

${content.substring(0, 5000)}

Assess:
- Writing quality and clarity
- Grammar and style
- Professionalism
- Engagement level

Return JSON:
{
  "rating": 0-10,
  "strengths": [],
  "weaknesses": [],
  "grammar_issues": [],
  "should_share": true/false,
  "level": "beginner/intermediate/advanced/expert"
}
      `;

            const aiResponse = await gemini.generate(prompt);
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/\{[\s\S]*\}/);
            const assessment = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiResponse);

            return { assessment, url };
        } catch (error) {
            return {
                error: 'Could not assess writing sample',
                assessment: { rating: 0, should_share: false }
            };
        }
    }

    /**
     * Assess design portfolio (for designers)
     */
    async assessDesign(url) {
        const prompt = `
Analyze this design portfolio: ${url}

Provide honest feedback on:
- Visual design quality
- Project variety and complexity
- Presentation/case studies
- Professional polish

Return JSON:
{
  "rating": 0-10,
  "strengths": [],
  "weaknesses": [],
  "should_share": true/false,
  "level": "junior/mid/senior/expert"
}
    `;

        try {
            const response = await gemini.generate(prompt);
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
            const assessment = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : response);

            return { assessment, url };
        } catch (error) {
            return {
                assessment: { rating: 5, should_share: true }
            };
        }
    }

    /**
   * Generate comprehensive honest report
   */
    async generateHonestReport(assessments, targetRole) {
        const userContext = assessments.context || 'No additional context provided';

        const prompt = `
You are a brutally honest career advisor. Analyze these credentials for someone targeting: ${targetRole}

User's Context/Explanation:
"${userContext}"

Credentials assessed:
${JSON.stringify(assessments, null, 2)}

Provide a HONEST assessment in JSON format:
{
  "overall_rating": 0-10,
  "overall_level": "beginner/junior/mid/senior/expert",
  "should_share": {
    "github": true/false,
    "portfolio": true/false,
    "linkedin": true/false
  },
  "strengths": ["specific strengths"],
  "critical_issues": ["things that will hurt their chances"],
  "salary_adjustment": "lower/same/higher",
  "realistic_salary_range": "$X - $Y",
  "target_level": "what level they should target",
  "action_plan": {
    "urgent": ["do this week"],
    "short_term": ["do this month"],
    "long_term": ["3-6 months"]
  },
  "honest_verdict": "One brutal truth sentence"
}

Be HONEST. If their work is poor, say so. If they're not senior-level, tell them.
Consider their context/explanation when assessing.
    `;

        try {
            const response = await gemini.generate(prompt);
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
            const report = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : response);

            report.assessments = assessments;
            return report;
        } catch (error) {
            console.error('Report generation error:', error);
            return {
                overall_rating: 5,
                overall_level: 'mid',
                honest_verdict: 'Unable to generate full assessment. Review your credentials manually.',
                assessments: assessments
            };
        }
    }

    // Helper methods

    extractLanguages(repos) {
        const langCount = {};
        repos.forEach(repo => {
            if (repo.language) {
                langCount[repo.language] = (langCount[repo.language] || 0) + 1;
            }
        });
        return langCount;
    }

    checkRecentActivity(repos) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const recent = repos.filter(r => new Date(r.updated_at) > oneMonthAgo);
        return recent.length > 0;
    }

    async getAIGitHubAssessment(analysis, username) {
        // Load quality rubrics from knowledge base
        const fs = require('fs');
        const path = require('path');
        const rubricsPath = path.join(__dirname, '../data/quality-rubrics.json');

        let rubrics = {};
        try {
            rubrics = JSON.parse(fs.readFileSync(rubricsPath, 'utf8'));
        } catch (error) {
            console.warn('Could not load quality rubrics:', error.message);
        }

        const prompt = `
Analyze this GitHub profile using REAL CODE QUALITY STANDARDS from the knowledge base.

USERNAME: ${username}
PROFILE URL: https://github.com/${username}

RAW DATA:
- Total Repos: ${analysis.total_repos}
- Languages: ${JSON.stringify(analysis.languages)}  
- Repos with READMEs: ${analysis.has_readmes}/${analysis.total_repos}
- Total Stars: ${analysis.stars}
- Total Forks: ${analysis.forks}
- Recent Activity (last month): ${analysis.recent_activity}

TOP REPOS:
${analysis.top_repos.map(r => `- ${r.name} (${r.stargazers_count} stars, ${r.language || 'Unknown'})`).join('\n')}

CODE QUALITY RUBRIC TO USE:
${JSON.stringify(rubrics.github_code_quality, null, 2)}

ASSESSMENT METHODOLOGY:
${JSON.stringify(rubrics.assessment_methodology, null, 2)}

INSTRUCTIONS:
1. Check for RED FLAGS from the rubric
2. Evaluate against "what_to_look_for" criteria
3. Determine level (junior/mid/senior) based on "level_indicators"
4. Provide SPECIFIC EVIDENCE from their actual repos
5. Be brutally honest

Return JSON:
{
  "rating": 0-10,
  "level": "junior|mid|senior|expert",
  "strengths": ["Specific things they do well with repo examples"],
  "red_flags": ["Issues found from the rubric red_flags list"],
  "code_quality_score": {
    "structure": 0-10,
    "documentation": 0-10,
    "best_practices": 0-10,
    "overall": 0-10
  },
  "should_share": true/false,
  "employer_impression": "What a hiring manager would think",
  "specific_improvements": ["Concrete actions with rubric criteria"]
}

Be HONEST. Cite specific repos. Use the rubric criteria, not generic advice.
    `.trim();

        const response = await gemini.generate(prompt);
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : response);
    }

    async getAIPortfolioAssessment(htmlContent, url) {
        // Load quality rubrics from knowledge base
        const fs = require('fs');
        const path = require('path');
        const rubricsPath = path.join(__dirname, '../data/quality-rubrics.json');

        let rubrics = {};
        try {
            rubrics = JSON.parse(fs.readFileSync(rubricsPath, 'utf8'));
        } catch (error) {
            console.warn('Could not load quality rubrics:', error.message);
        }

        const cleanHtml = htmlContent.substring(0, 3000); // Limit size

        const prompt = `
Analyze this portfolio website using MULTI-FIELD QUALITY STANDARDS.

URL: ${url}
HTML Preview:
${cleanHtml}

QUALITY RUBRICS (apply relevant ones based on portfolio type):
${JSON.stringify({
            portfolio_design: rubrics.portfolio_design_quality,
            marketing: rubrics.marketing_portfolio_quality,
            writing: rubrics.writing_samples_quality
        }, null, 2)}

INSTRUCTIONS:
1. Identify the portfolio type (design/development/marketing/writing/multi-discipline)
2. Apply relevant rubric criteria
3. Check for red flags specific to that field
4. Evaluate "what_to_look_for" items
5. Provide evidence-based assessment

Return JSON:
{
  "portfolio_type": "design|development|marketing|writing|multi-discipline",
  "rating": 0-10,
  "field_specific_scores": {
    "visual_design": 0-10,
    "ux_quality": 0-10,
    "technical_execution": 0-10,
    "content_quality": 0-10
  },
  "strengths": ["Specific strengths with examples from site"],
  "critical_issues": ["Problems from relevant rubric red_flags"],
  "should_share": true/false,
  "first_impression": "What an employer sees in first 10 seconds",
  "improvements_by_priority": {
    "urgent": ["Fix these immediately"],
    "important": ["Address soon"],
    "nice_to_have": ["Polish items"]
  }
}

Assess based on the ACTUAL content. Be specific and honest.
    `.trim();

        const response = await gemini.generate(prompt);
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : response);
    }
}

module.exports = new QualityAssessorAgent();
