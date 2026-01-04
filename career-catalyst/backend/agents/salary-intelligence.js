const gemini = require('../services/gemini');
const adzuna = require('../services/adzuna');

/**
 * Salary Intelligence Agent
 * Validates salary expectations and provides market insights
 */
class SalaryIntelligenceAgent {
    /**
     * Validate salary expectations with location awareness
     */
    async validateExpect ations(position, desiredSalary, skillsAnalysis, location = '') {
        try {
            const yearsExp = skillsAnalysis.experience_years || 0;
            const skills = skillsAnalysis.skills || [];

            // Get market data from Adzuna
            const salaryData = await adzuna.getSalaryData(position);

            // Get AI analysis with market data AND location
            const aiAnalysis = await gemini.validateSalary(
                position,
                desiredSalary,
                yearsExp,
                skills,
                salaryData, // Pass market data to AI
                location // Pass location for adjustment
            );

            // Combine market data with AI insights
            return {
                verdict: aiAnalysis.verdict,
                confidence: aiAnalysis.confidence,
                your_target: `$${desiredSalary.toLocaleString()}`,
                market_data: salaryData ? {
                    median: `$${Math.round(salaryData.median_salary).toLocaleString()}`,
                    range: `$${Math.round(salaryData.min_salary).toLocaleString()} - $${Math.round(salaryData.max_salary).toLocaleString()}`,
                    data_points: salaryData.job_count
                } : null,
                location_adjusted_range: aiAnalysis.location_adjusted_range,
                location_multiplier: aiAnalysis.location_multiplier,
                recommendation: aiAnalysis.recommendation,
                alternative_roles: aiAnalysis.alternative_roles || [],
                location_strategies: aiAnalysis.location_strategies || [],
                companies_to_target: aiAnalysis.companies_to_target || [],
                action_plan: this.generateActionPlan(aiAnalysis.verdict, desiredSalary, salaryData)
            };
        } catch (error) {
            console.error('Salary validation error:', error);
            throw new Error('Failed to validate salary expectations');
        }
    }

    /**
     * Generate action plan based on verdict
     */
    generateActionPlan(verdict, desiredSalary, marketData) {
        if (verdict === 'undervalued') {
            return [
                `You're selling yourself short! Aim for ${marketData ? '$' + Math.round(marketData.median_salary).toLocaleString() : 'higher'}.`,
                'Emphasize your unique value in negotiations',
                'Research companies known for competitive compensation'
            ];
        } else if (verdict === 'overreaching') {
            return [
                'Consider mid-level positions to gain more experience',
                'Build specific skills that command higher salaries',
                'Target startups or high-growth companies for equity compensation'
            ];
        } else {
            return [
                'Your target is realistic - stick to it!',
                'Be prepared to negotiate with data',
                'Highlight achievements that justify this range'
            ];
        }
    }

    /**
     * Get salary range for a position
     */
    async getSalaryRange(position, location = '') {
        try {
            const salaryData = await adzuna.getSalaryData(position, location);

            if (!salaryData) {
                return {
                    available: false,
                    message: 'Salary data not available for this position'
                };
            }

            return {
                available: true,
                median: Math.round(salaryData.median_salary),
                average: Math.round(salaryData.avg_salary),
                range: {
                    min: Math.round(salaryData.min_salary),
                    max: Math.round(salaryData.max_salary)
                },
                sample_size: salaryData.job_count
            };
        } catch (error) {
            console.error('Salary range error:', error);
            return {
                available: false,
                message: 'Unable to fetch salary data'
            };
        }
    }
}

module.exports = new SalaryIntelligenceAgent();
