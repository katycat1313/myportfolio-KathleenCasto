const axios = require('axios');

/**
 * RemoteOK API Service
 * No authentication required
 * API: https://remoteok.com/api
 */
class RemoteOKService {
    constructor() {
        this.baseUrl = 'https://remoteok.com/api';
    }

    /**
     * Get remote jobs
     */
    async getRemoteJobs(tags = []) {
        try {
            const response = await axios.get(this.baseUrl, {
                headers: {
                    'User-Agent': 'Career-Catalyst-AI/1.0'
                }
            });

            // First item is metadata, skip it
            const jobs = response.data.slice(1);

            // Filter by tags if provided
            let filteredJobs = jobs;
            if (tags.length > 0) {
                filteredJobs = jobs.filter(job =>
                    tags.some(tag =>
                        job.tags?.includes(tag.toLowerCase()) ||
                        job.position?.toLowerCase().includes(tag.toLowerCase())
                    )
                );
            }

            return filteredJobs.map(job => ({
                id: job.id || job.url,
                title: job.position,
                company: job.company,
                location: 'Remote',
                description: job.description,
                url: job.url,
                salary_min: null,
                salary_max: null,
                posted_date: job.date,
                tags: job.tags,
                source: 'remoteok'
            }));
        } catch (error) {
            console.error('RemoteOK API error:', error.message);
            throw new Error('Failed to fetch remote jobs');
        }
    }

    /**
     * Search jobs by keyword
     */
    async searchJobs(keyword) {
        const allJobs = await this.getRemoteJobs();

        const lowerKeyword = keyword.toLowerCase();
        return allJobs.filter(job =>
            job.title.toLowerCase().includes(lowerKeyword) ||
            job.description?.toLowerCase().includes(lowerKeyword) ||
            job.tags?.some(tag => tag.toLowerCase().includes(lowerKeyword))
        );
    }
}

module.exports = new RemoteOKService();
