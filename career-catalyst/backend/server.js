const dns = require('dns');
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
require('dotenv').config();

// Fix DNS resolution for Google APIs on some networks
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Import agents
const skillsAnalyzer = require('./agents/skills-analyzer');
const salaryIntelligence = require('./agents/salary-intelligence');
const jobScout = require('./agents/job-scout');
const applicationOptimizer = require('./agents/application-optimizer');
const networkStrategist = require('./agents/network-strategist');
const qualityAssessor = require('./agents/quality-assessor');

// ========== API Routes ==========

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Career Catalyst AI is running!' });
});

/**
 * Parse resume file (PDF/DOCX/TXT)
 * POST /api/parse-resume
 * Body: multipart/form-data with 'resume' file
 */
app.post('/api/parse-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const text = await skillsAnalyzer.parseResume(filePath);

        // Clean up uploaded file
        await fs.unlink(filePath).catch(() => { });

        res.json({ text });
    } catch (error) {
        console.error(error);
        // Clean up on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * Analyze resume
 * POST /api/analyze-resume
 * Body: { resumeText: string }
 */
app.post('/api/analyze-resume', async (req, res) => {
    try {
        const { resumeText } = req.body;

        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        const analysis = await skillsAnalyzer.analyzeResumeText(resumeText);
        res.json(analysis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Validate salary expectations
 * POST /api/validate-salary
 * Body: { position: string, desiredSalary: number, skillsAnalysis: object }
 */
app.post('/api/validate-salary', async (req, res) => {
    try {
        const { position, desiredSalary, skillsAnalysis, location } = req.body;

        if (!position || !desiredSalary || !skillsAnalysis) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const validation = await salaryIntelligence.validateExpectations(
            position,
            desiredSalary,
            skillsAnalysis,
            location || '' // Pass location if provided
        );

        res.json(validation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Search for jobs
 * POST /api/search-jobs
 * Body: { queries: string[], location: string, skills: string[] }
 */
app.post('/api/search-jobs', async (req, res) => {
    try {
        const { queries, location = '', skills = [] } = req.body;

        if (!queries || !Array.isArray(queries) || queries.length === 0) {
            return res.status(400).json({ error: 'Job queries are required' });
        }

        const jobs = await jobScout.searchJobs(queries, location, {
            includeRemote: true,
            maxResults: 50,
            skillsToMatch: skills
        });

        res.json({ total: jobs.length, jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Customize application for specific job
 * POST /api/customize-application
 * Body: { resume: string, jobPosting: object }
 */
app.post('/api/customize-application', async (req, res) => {
    try {
        const { resume, jobPosting } = req.body;

        if (!resume || !jobPosting) {
            return res.status(400).json({ error: 'Resume and job posting are required' });
        }

        const application = await applicationOptimizer.generateCompleteApplication(
            resume,
            jobPosting
        );

        res.json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate networking strategy
 * POST /api/networking-strategy
 * Body: { job: object, userResume: string }
 */
app.post('/api/networking-strategy', async (req, res) => {
    try {
        const { job, userResume } = req.body;

        if (!job) {
            return res.status(400).json({ error: 'Job details are required' });
        }

        const strategy = await networkStrategist.createNetworkingPlan(job, userResume);
        res.json(strategy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Assess credential quality
 * POST /api/assess-quality
 * Body: { credentials: { github, portfolio, linkedin, writing, design }, targetRole: string }
 */
app.post('/api/assess-quality', async (req, res) => {
    try {
        const { credentials, targetRole } = req.body;

        if (!credentials || !targetRole) {
            return res.status(400).json({ error: 'Credentials and target role are required' });
        }

        const assessment = await qualityAssessor.assessCredentials(credentials, targetRole);
        res.json(assessment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get salary range for position
 * GET /api/salary-range?position=Software+Engineer&location=New+York
 */
app.get('/api/salary-range', async (req, res) => {
    try {
        const { position, location = '' } = req.query;

        if (!position) {
            return res.status(400).json({ error: 'Position is required' });
        }

        const salaryRange = await salaryIntelligence.getSalaryRange(position, location);
        res.json(salaryRange);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ========== Error Handling ==========

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ========== Start Server ==========

/**
 * Career Coach Chat
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userContext } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const careerCoach = require('./agents/career-coach');

        // Use a simple session ID (in production, use proper auth)
        const userId = req.ip || 'default-user';

        const response = await careerCoach.chat(userId, message, userContext || {});

        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`
🚀 Career Catalyst AI Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${PORT}
🌐 Frontend: http://localhost:${PORT}
🔧 API: http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = app;
