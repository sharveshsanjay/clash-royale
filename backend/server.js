const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// Clash Royale API configuration
const CLASH_API_URL = 'https://api.clashroyale.com/v1';
const API_KEY = process.env.CLASH_API_KEY;

// Debug: Check API key format (first 50 chars only)
console.log('🔑 API Key Status:', API_KEY ? 'Loaded' : 'Missing');
if (API_KEY) {
    console.log('🔑 Key Preview:', API_KEY.substring(0, 50) + '...');
    console.log('🔑 Key Length:', API_KEY.length, 'characters');
    
    // Check for common issues
    if (API_KEY.includes('\n')) {
        console.error('❌ ERROR: API key contains newline character!');
    }
    if (API_KEY.includes(' ')) {
        console.error('❌ ERROR: API key contains spaces!');
    }
    if (API_KEY.length < 600) {
        console.error('❌ ERROR: API key seems too short!');
    }
}

// Helper function to clean and validate API key
function getCleanApiKey() {
    if (!API_KEY) {
        throw new Error('API_KEY_NOT_CONFIGURED');
    }
    
    // Clean the key: remove whitespace, newlines, quotes
    let cleanKey = API_KEY.trim();
    cleanKey = cleanKey.replace(/\n/g, '');
    cleanKey = cleanKey.replace(/\r/g, '');
    cleanKey = cleanKey.replace(/"/g, '');
    cleanKey = cleanKey.replace(/'/g, '');
    
    // Validate format
    if (!cleanKey.startsWith('eyJ')) {
        console.error('❌ Invalid API key format - should start with "eyJ"');
    }
    
    if (cleanKey.length < 600) {
        console.error('❌ API key too short - expected ~700 chars, got:', cleanKey.length);
    }
    
    console.log('🔑 Cleaned Key Preview:', cleanKey.substring(0, 20) + '...');
    console.log('🔑 Cleaned Key Length:', cleanKey.length);
    
    return cleanKey;
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Clash Squad Backend API',
        status: 'online',
        version: '3.0.0',
        api_key_status: API_KEY ? 'configured' : 'missing',
        timestamp: new Date().toISOString()
    });
});

// Health check with API key validation
app.get('/health', (req, res) => {
    try {
        const cleanKey = getCleanApiKey();
        res.json({
            status: 'healthy',
            api_key: {
                configured: true,
                length: cleanKey.length,
                valid_format: cleanKey.startsWith('eyJ')
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            status: 'degraded',
            api_key: 'missing_or_invalid',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Debug endpoint to test API key
app.get('/debug', (req, res) => {
    try {
        const cleanKey = getCleanApiKey();
        
        res.json({
            api_key: {
                preview: cleanKey.substring(0, 20) + '...' + cleanKey.substring(cleanKey.length - 20),
                length: cleanKey.length,
                starts_with_eyJ: cleanKey.startsWith('eyJ'),
                has_spaces: cleanKey.includes(' '),
                has_newlines: cleanKey.includes('\n'),
                is_valid_length: cleanKey.length > 600
            },
            advice: cleanKey.length < 600 ? 'API key seems too short. Get a new one.' : 'Key looks valid',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message,
            fix: 'Set CLASH_API_KEY environment variable on Render'
        });
    }
});

// Helper function for API requests with proper header handling
async function makeClashRequest(endpoint) {
    try {
        const cleanKey = getCleanApiKey();
        
        // Create headers object
        const headers = {
            'Authorization': `Bearer ${cleanKey}`,
            'Accept': 'application/json'
        };
        
        console.log('🌐 Making request to:', endpoint);
        console.log('🔑 Using key (first 20 chars):', cleanKey.substring(0, 20) + '...');
        
        const url = `${CLASH_API_URL}${endpoint}`;
        const response = await axios.get(url, {
            headers: headers,
            timeout: 10000,
            validateStatus: function (status) {
                return status >= 200 && status < 600; // Accept all status codes
            }
        });
        
        console.log('📥 Response status:', response.status);
        
        if (response.status === 403) {
            throw {
                response: {
                    status: 403,
                    data: { 
                        message: 'Invalid API key',
                        reason: 'forbidden'
                    }
                }
            };
        }
        
        if (response.status !== 200) {
            throw {
                response: {
                    status: response.status,
                    data: response.data
                }
            };
        }
        
        return response.data;
    } catch (error) {
        console.error('❌ Clash API Error:', {
            status: error.response?.status,
            message: error.message,
            headers: error.response?.headers
        });
        throw error;
    }
}

// Test endpoint - try to fetch clan data
app.get('/test', async (req, res) => {
    try {
        const cleanKey = getCleanApiKey();
        
        // First, just test the header format
        const testHeaders = {
            'Authorization': `Bearer ${cleanKey}`,
            'Accept': 'application/json'
        };
        
        console.log('🧪 Testing header format...');
        console.log('🔑 Authorization header:', testHeaders.Authorization.substring(0, 50) + '...');
        
        // Now try to make actual request
        const clanTag = '%23RYPUQ8CY';
        const data = await makeClashRequest(`/clans/${clanTag}`);
        
        res.json({
            success: true,
            message: '✅ API is working perfectly!',
            clan: {
                name: data.name,
                tag: data.tag,
                members: data.members
            },
            headers: {
                authorization_length: testHeaders.Authorization.length,
                authorization_starts_with: testHeaders.Authorization.substring(0, 20)
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Test endpoint error:', error.response?.data || error.message);
        
        if (error.response?.status === 403) {
            res.status(403).json({
                error: true,
                message: '❌ API Key Error: Invalid or expired key',
                details: 'Please get a new API key from https://developer.clashroyale.com/',
                header_issue: 'Check if key contains invalid characters',
                fix: '1. Get new key\n2. Copy EXACTLY\n3. Update Render\n4. No spaces!'
            });
        } else if (error.message === 'API_KEY_NOT_CONFIGURED') {
            res.status(500).json({
                error: true,
                message: '❌ API key not configured',
                fix: 'Set CLASH_API_KEY environment variable on Render dashboard'
            });
        } else {
            res.status(error.response?.status || 500).json({
                error: true,
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
                details: 'Check API key format in Render environment variables'
            });
        }
    }
});

// Clan endpoint
app.get('/api/clan/:tag', async (req, res) => {
    try {
        const clanTag = encodeURIComponent(req.params.tag);
        const data = await makeClashRequest(`/clans/${clanTag}`);
        
        res.json({
            error: false,
            data: data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch clan',
            status: error.response?.status
        });
    }
});

// Members endpoint
app.get('/api/clan/:tag/members', async (req, res) => {
    try {
        const clanTag = encodeURIComponent(req.params.tag);
        const data = await makeClashRequest(`/clans/${clanTag}/members`);
        
        res.json({
            error: false,
            data: data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch members',
            status: error.response?.status
        });
    }
});

// Player endpoint
app.get('/api/player/:tag', async (req, res) => {
    try {
        const playerTag = encodeURIComponent(req.params.tag);
        const data = await makeClashRequest(`/players/${playerTag}`);
        
        res.json({
            error: false,
            data: data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch player',
            status: error.response?.status
        });
    }
});

// Capital endpoint
app.get('/api/clan/:tag/capital', async (req, res) => {
    try {
        const clanTag = encodeURIComponent(req.params.tag);
        const data = await makeClashRequest(`/clans/${clanTag}`);
        
        const capitalInfo = {
            capitalHallLevel: data.clanCapital?.capitalHallLevel || 0,
            districts: data.clanCapital?.districts || [],
            clanCapitalTrophies: data.clanCapitalPoints || 0,
            clanCapitalLeague: data.clanCapitalLeague || { name: 'Unranked' }
        };
        
        res.json({
            error: false,
            data: capitalInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch capital',
            status: error.response?.status
        });
    }
});

// Current River Race endpoint
app.get('/api/clan/:tag/currentriverrace', async (req, res) => {
    try {
        const clanTag = encodeURIComponent(req.params.tag);

        const data = await makeClashRequest(`/clans/${clanTag}/currentriverrace`);

        res.json({
            error: false,
            data: data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Current River Race Error:', error.response?.data || error.message);

        res.status(error.response?.status || 500).json({
            error: true,
            message: error.response?.data?.message || 'Failed to fetch current river race',
            status: error.response?.status
        });
    }
});

// Player battle log
app.get('/api/player/:tag/battlelog', async (req, res) => {
    try {
        const tag = encodeURIComponent(req.params.tag);
        const data = await makeClashRequest(`/players/${tag}/battlelog`);
        res.json({ error: false, data });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: 'Failed to fetch battle log'
        });
    }
});

// Player upcoming chests
app.get('/api/player/:tag/upcomingchests', async (req, res) => {
    try {
        const tag = encodeURIComponent(req.params.tag);
        const data = await makeClashRequest(`/players/${tag}/upcomingchests`);
        res.json({ error: false, data });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: 'Failed to fetch upcoming chests'
        });
    }
});


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: 'Endpoint not found',
        requested: req.url,
        available: ['/', '/health', '/debug', '/test', '/api/clan/:tag', '/api/clan/:tag/members', '/api/player/:tag', '/api/clan/:tag/capital']
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════╗
    ║           CLASH SQUAD BACKEND SERVER             ║
    ╠══════════════════════════════════════════════════╣
    ║  ✅ Server running on port: ${PORT}                  
    ║  🔗 URL: https://clash-squad-backend.onrender.com
    ║  🔑 API Key: ${API_KEY ? 'Configured' : 'NOT SET'}  
    ║  🛡️  CORS: Enabled for all origins              
    ║  🐛 Debug: /debug endpoint available            
    ╚══════════════════════════════════════════════════╝
    `);
    
    if (!API_KEY) {
        console.log('\n❌ CRITICAL: No API key configured!');
        console.log('👉 Fix: Set CLASH_API_KEY on Render dashboard');
    }
});