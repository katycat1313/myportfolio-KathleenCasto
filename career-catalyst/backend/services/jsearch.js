const axios = require('axios');
require('dotenv').config();

/**
 * JSearch API Service (via RapidAPI)
 * Aggregates jobs from multiple sources
 */
class JSearchService {
    constructor() {
        this.apiKey = process.env.JSEARCH_API_KEY;
        this.baseUrl = 'https://jsearch.p.rapidapi.com';
    }

    /**
     * Search for jobs
     */
    async searchJobs(query, location = '', page = 1, numPages = 1) {
        try {
            const response = await axios.get(`${this.baseUrl}/search`, {
                params: {
                    query: `${query} ${location}`.trim(),
                    page: page.toString(),
                    num_pages: numPages.toString()
                },
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            });

            if (!response.data || !response.data.data) {
                return [];
            }

            return response.data.data.map(job => ({
                id: job.job_id,
                title: job.job_title,
                company: job.employer_name,
                location: job.job_city || job.job_state || job.job_country || 'Remote',
                description: job.job_description,
                url: job.job_apply_link,
                salary_min: job.job_min_salary,
                salary_max: job.job_max_salary,
                posted_date: job.job_posted_at_datetime_utc,
                employment_type: job.job_employment_type,
                source: 'jsearch'
            }));
        } catch (error) {
            console.error('JSearch API error:', error.message);
            // Return empty array instead of throwing to allow other sources to work
            return [];
        }
    }

    /**
     * Get job details
     */
    async getJobDetails(jobId) {
        try {
            const response = await axios.get(`${this.baseUrl}/job-details`, {
                params: {
                    job_id: jobId
                },
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            });

            return response.data.data[0];
        } catch (error) {
            console.error('JSearch job details error:', error.message);
            return null;
        }
    }
}

module.exports = new JSearchService();
