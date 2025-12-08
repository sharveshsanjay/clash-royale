const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Clash Royale API configuration
const CLASH_API_URL = 'https://api.clashroyale.com/v1';
const API_KEY = process.env.CLASH_API_KEY;

// Validate API key on startup
if (!API_KEY) {
    console.error('ERROR: CLASH_API_KEY is not set in environment variables');
    console.error('Please set your Clash Royale API key in the .env file or environment variables');
    process.exit(1);
}

// API key middleware for all requests
const apiKeyMiddleware = (req, res, next) => {
    req.apiKey = API_KEY;
    next();
};

// Helper function to make API requests
const makeClashRequest = async (endpoint, res) => {
    try {
        const url = `${CLASH_API_URL}${endpoint}`;
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error.message);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).json({
                error: true,
                message: error.response.data.message || 'Clash Royale API error',
                status: error.response.status
            });
        } else if (error.request) {
            // The request was made but no response was received
            res.status(503).json({
                error: true,
                message: 'Clash Royale API is not responding. Please try again later.'
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({
                error: true,
                message: error.message
            });
        }
        return null;
    }
};

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Clash Squad Backend API',
        endpoints: {
            clan: '/api/clan/:tag',
            members: '/api/clan/:tag/members',
            player: '/api/player/:tag',
            capital: '/api/clan/:tag/capital'
        },
        status: 'online'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get clan info
app.get('/api/clan/:tag', apiKeyMiddleware, async (req, res) => {
    const clanTag = encodeURIComponent(req.params.tag);
    const data = await makeClashRequest(`/clans/${clanTag}`, res);
    if (data) {
        res.json({ error: false, data });
    }
});

// Get clan members
app.get('/api/clan/:tag/members', apiKeyMiddleware, async (req, res) => {
    const clanTag = encodeURIComponent(req.params.tag);
    const data = await makeClashRequest(`/clans/${clanTag}/members`, res);
    if (data) {
        res.json({ error: false, data });
    }
});

// Get player info
app.get('/api/player/:tag', apiKeyMiddleware, async (req, res) => {
    const playerTag = encodeURIComponent(req.params.tag);
    const data = await makeClashRequest(`/players/${playerTag}`, res);
    if (data) {
        res.json({ error: false, data });
    }
});

// Get clan capital info
app.get('/api/clan/:tag/capital', apiKeyMiddleware, async (req, res) => {
    const clanTag = encodeURIComponent(req.params.tag);
    const data = await makeClashRequest(`/clans/${clanTag}`, res);
    if (data) {
        // Extract capital info from clan data
        const capitalInfo = {
            capitalHallLevel: data.clanCapital ? data.clanCapital.capitalHallLevel : 0,
            districts: data.clanCapital ? data.clanCapital.districts : [],
            clanCapitalTrophies: data.clanCapitalPoints || 0,
            clanCapitalLeague: data.clanCapitalLeague || { name: 'Unranked' }
        };
        res.json({ error: false, data: capitalInfo });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        error: true,
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}`);
    console.log(`🌐 Clash Royale API Status: ${API_KEY ? 'Connected' : 'No API Key'}`);
});