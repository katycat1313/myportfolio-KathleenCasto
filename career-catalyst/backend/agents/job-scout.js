const adzuna = require('../services/adzuna');
const remoteok = require('../services/remoteok');
const jsearch = require('../services/jsearch');
const fs = require('fs').promises;
const path = require('path');

/**
 * Job Scout Agent
 * Aggregates jobs from multiple sources and scores them
 */
class JobScoutAgent {
    constructor() {
        this.cacheFile = path.join(__dirname, '../data/jobs.json');
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Search jobs across all sources
     */
    async searchJobs(queries, location = '', options = {}) {
        const {
            includeRemote = true,
            maxResults = 50,
            skillsToMatch = []
        } = options;

        let allJobs = [];

        // Search each query across all sources
        for (const query of queries) {
            try {
                // Adzuna
                const adzunaJobs = await adzuna.searchJobs(query, location, 1, 20);
                allJobs.push(...adzunaJobs.jobs);

                // JSearch
                const jsearchJobs = await jsearch.searchJobs(query, location, 1, 1);
                allJobs.push(...jsearchJobs);

                // RemoteOK (if remote jobs requested)
                if (includeRemote) {
                    const remoteJobs = await remoteok.searchJobs(query);
                    allJobs.push(...remoteJobs.slice(0, 10)); // Limit remote results
                }
            } catch (error) {
                console.error(`Error searching for "${query}":`, error.message);
                continue; // Continue with other queries even if one fails
            }
        }

        // Deduplicate jobs
        const deduped = this.deduplicateJobs(allJobs);

        // Score jobs
        const scored = deduped.map(job => ({
            ...job,
            match_score: this.calculateMatchScore(job, skillsToMatch, queries)
        }));

        // Sort by match score
        scored.sort((a, b) => b.match_score - a.match_score);

        // Limit results
        const limited = scored.slice(0, maxResults);

        // Cache results
        await this.cacheJobs(limited);

        return limited;
    }

    /**
     * Deduplicate jobs by title and company
     */
    deduplicateJobs(jobs) {
        const seen = new Set();
        const unique = [];

        for (const job of jobs) {
            const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;

            if (!seen.has(key)) {
                seen.add(key);
                unique.push(job);
            }
        }

        return unique;
    }

    /**
     * Calculate match score for a job
     */
    calculateMatchScore(job, skills, targetTitles) {
        let score = 50; // Base score

        const jobText = `${job.title} ${job.description || ''}`.toLowerCase();

        // Title match (30 points)
        const titleMatch = targetTitles.some(title =>
            jobText.includes(title.toLowerCase())
        );
        if (titleMatch) score += 30;

        // Skills match (20 points)
        const matchingSkills = skills.filter(skill =>
            jobText.includes(skill.toLowerCase())
        );
        score += Math.min(20, matchingSkills.length * 4);

        // Salary available (10 points)
        if (job.salary_min || job.salary_max) score += 10;

        // Recency (10 points)
        if (job.posted_date) {
            const daysOld = this.getDaysOld(job.posted_date);
            if (daysOld < 7) score += 10;
            else if (daysOld < 30) score += 5;
        }

        // Remote bonus (5 points)
        if (job.location?.toLowerCase().includes('remote')) score += 5;

        return Math.min(100, score);
    }

    /**
     * Get days since job posting
     */
    getDaysOld(postedDate) {
        try {
            const posted = new Date(postedDate);
            const now = new Date();
            const diff = now - posted;
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        } catch {
            return 999; // Unknown date = treat as old
        }
    }

    /**
     * Cache jobs to file
     */
    async cacheJobs(jobs) {
        try {
            const data = {
                cached_at: new Date().toISOString(),
                jobs: jobs
            };

            await fs.writeFile(this.cacheFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to cache jobs:', error);
        }
    }

    /**
     * Load cached jobs
     */
    async loadCachedJobs() {
        try {
            const data = await fs.readFile(this.cacheFile, 'utf-8');
            const parsed = JSON.parse(data);

            // Check if cache is still valid
            const cacheAge = Date.now() - new Date(parsed.cached_at).getTime();

            if (cacheAge < this.cacheDuration) {
                return parsed.jobs;
            }

            return null;
        } catch (error) {
            return null; // No cache available
        }
    }
}

module.exports = new JobScoutAgent();
