const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Allow ALL origins for now (we'll restrict later)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Clash Royale API configuration
const CLASH_API_URL = 'https://api.clashroyale.com/v1';
const API_KEY = process.env.CLASH_API_KEY;

console.log('🚀 Clash Squad Backend Starting...');
console.log('🔑 API Key:', API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('🌐 CORS: Enabled for all origins');

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Clash Squad Backend API',
        version: '2.0.0',
        status: 'online',
        cors: 'enabled',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            test: '/test',
            clan: '/api/clan/:tag',
            members: '/api/clan/:tag/members',
            player: '/api/player/:tag',
            capital: '/api/clan/:tag/capital'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'clash-squad-backend',
        cors: 'enabled',
        api_key: API_KEY ? 'configured' : 'missing',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint
app.get('/test', async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                error: true,
                message: 'API key not configured on Render',
                fix: '1. Go to https://developer.clashroyale.com/\n2. Create new API key\n3. Add CLASH_API_KEY to Render environment'
            });
        }

        // Test with your clan
        const clanTag = '%23RYPUQ8CY';
        const response = await axios.get(`${CLASH_API_URL}/clans/${clanTag}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        res.json({
            success: true,
            message: '✅ API is working!',
            clan: {
                name: response.data.name,
                tag: response.data.tag,
                members: response.data.members
            },
            backend: 'Render',
            frontend: 'Netlify'
        });

    } catch (error) {
        console.error('Test error:', error.response?.data || error.message);
        
        if (error.response?.status === 403) {
            res.status(403).json({
                error: true,
                message: 'Invalid API key',
                details: 'Please create a new API key at https://developer.clashroyale.com/',
                response: error.response?.data
            });
        } else {
            res.status(error.response?.status || 500).json({
                error: true,
                message: 'API Error',
                details: error.message,
                response: error.response?.data
            });
        }
    }
});

// Get clan info
app.get('/api/clan/:tag', async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                error: true,
                message: 'API key not configured'
            });
        }

        const clanTag = encodeURIComponent(req.params.tag);
        const response = await axios.get(`${CLASH_API_URL}/clans/${clanTag}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        res.json({
            error: false,
            data: response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Clan API error:', error.response?.data || error.message);
        
        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch clan',
            status: error.response?.status,
            details: error.response?.data
        });
    }
});

// Get clan members
app.get('/api/clan/:tag/members', async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                error: true,
                message: 'API key not configured'
            });
        }

        const clanTag = encodeURIComponent(req.params.tag);
        const response = await axios.get(`${CLASH_API_URL}/clans/${clanTag}/members`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        res.json({
            error: false,
            data: response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Members API error:', error.response?.data || error.message);
        
        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch members',
            status: error.response?.status
        });
    }
});

// Get player info
app.get('/api/player/:tag', async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                error: true,
                message: 'API key not configured'
            });
        }

        const playerTag = encodeURIComponent(req.params.tag);
        const response = await axios.get(`${CLASH_API_URL}/players/${playerTag}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        res.json({
            error: false,
            data: response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Player API error:', error.response?.data || error.message);
        
        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch player',
            status: error.response?.status
        });
    }
});

// Get clan capital info
app.get('/api/clan/:tag/capital', async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                error: true,
                message: 'API key not configured'
            });
        }

        const clanTag = encodeURIComponent(req.params.tag);
        const response = await axios.get(`${CLASH_API_URL}/clans/${clanTag}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        const capitalInfo = {
            capitalHallLevel: response.data.clanCapital?.capitalHallLevel || 0,
            districts: response.data.clanCapital?.districts || [],
            clanCapitalTrophies: response.data.clanCapitalPoints || 0,
            clanCapitalLeague: response.data.clanCapitalLeague || { name: 'Unranked' }
        };

        res.json({
            error: false,
            data: capitalInfo,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Capital API error:', error.response?.data || error.message);
        
        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch capital',
            status: error.response?.status
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: 'Endpoint not found',
        requestedUrl: req.url,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /test',
            'GET /api/clan/:tag',
            'GET /api/clan/:tag/members',
            'GET /api/player/:tag',
            'GET /api/clan/:tag/capital'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: true,
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 URL: https://clash-squad-backend.onrender.com`);
    console.log(`🔑 API Key Status: ${API_KEY ? 'CONNECTED' : 'NOT CONNECTED (Will get 403)'}`);
});