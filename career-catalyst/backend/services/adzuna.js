const axios = require('axios');
require('dotenv').config();

/**
 * Adzuna API Service
 * Docs: https://developer.adzuna.com/docs
 */
class AdzunaService {
    constructor() {
        this.appId = process.env.ADZUNA_APP_ID;
        this.appKey = process.env.ADZUNA_APP_KEY;
        this.baseUrl = 'https://api.adzuna.com/v1/api/jobs';
        this.country = 'us'; // Can be made configurable
        this.lastRequestTime = 0;
        this.minRequestInterval = 6000; // 6 seconds between requests (10/min limit)
    }

    /**
     * Rate limiting helper
     */
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Search for jobs
     */
    async searchJobs(query, location = '', page = 1, resultsPerPage = 20) {
        await this.rateLimit();

        try {
            const url = `${this.baseUrl}/${this.country}/search/${page}`;
            const params = {
                app_id: this.appId,
                app_key: this.appKey,
                what: query,
                where: location,
                results_per_page: resultsPerPage
            };

            const response = await axios.get(url, { params });

            return {
                total_results: response.data.count,
                jobs: response.data.results.map(job => ({
                    id: job.id,
                    title: job.title,
                    company: job.company.display_name,
                    location: job.location.display_name,
                    description: job.description,
                    url: job.redirect_url,
                    salary_min: job.salary_min,
                    salary_max: job.salary_max,
                    posted_date: job.created,
                    source: 'adzuna'
                }))
            };
        } catch (error) {
            console.error('Adzuna API error:', error.message);
            throw new Error('Failed to fetch jobs from Adzuna');
        }
    }

    /**
     * Get salary data for a position
     */
    async getSalaryData(jobTitle, location = '') {
        await this.rateLimit();

        try {
            const url = `${this.baseUrl}/${this.country}/history`;
            const params = {
                app_id: this.appId,
                app_key: this.appKey,
                what: jobTitle,
                location0: location,
                months: 6
            };

            const response = await axios.get(url, { params });

            if (response.data && response.data.month) {
                const latestData = response.data.month[0];
                return {
                    median_salary: latestData.median,
                    avg_salary: latestData.average,
                    min_salary: latestData.min,
                    max_salary: latestData.max,
                    job_count: latestData.count
                };
            }

            return null;
        } catch (error) {
            console.error('Adzuna salary API error:', error.message);
            return null; // Return null if salary data unavailable
        }
    }
}

module.exports = new AdzunaService();
