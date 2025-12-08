// API Configuration for Clash Squad Website
class ClashAPI {
    constructor() {
        // 🔥 IMPORTANT: Update this to your actual backend URL
        this.baseURL = 'https://clash-squad-backend.onrender.com';
        
        // 🔥 IMPORTANT: Update this with your clan tag
        this.clanTag = '%23RYPUQ8CY'; // #RYPUQ8CY URL encoded
        
        console.log('🚀 Clash API Initialized');
        console.log('🌐 Backend URL:', this.baseURL);
        console.log('🏷️  Clan Tag:', this.clanTag);
        console.log('🌍 Frontend:', window.location.origin);
    }

    // Make API request with error handling
    async request(endpoint) {
        const url = `${this.baseURL}${endpoint}`;
        
        console.log(`📤 Request: ${endpoint}`);
        console.log(`🔗 Full URL: ${url}`);
        
        try {
            const startTime = Date.now();
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'omit'
            });
            
            const responseTime = Date.now() - startTime;
            console.log(`📥 Response: ${response.status} (${responseTime}ms)`);
            
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('❌ API Error Data:', errorData);
                } catch (e) {
                    // Couldn't parse JSON error
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.error('❌ API returned error:', data);
                throw new Error(data.message || 'API error');
            }
            
            console.log(`✅ Success: ${endpoint}`);
            return data.data;
            
        } catch (error) {
            console.error(`❌ Failed to fetch ${endpoint}:`, error.message);
            
            // User-friendly error messages
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('🌐 Network Error: Cannot connect to backend server. Please check if the server is running.');
            } else if (error.message.includes('403')) {
                throw new Error('🔑 API Key Error: The backend API key is invalid or expired. Please check Render configuration.');
            } else if (error.message.includes('CORS')) {
                throw new Error('🛡️ CORS Error: The backend is not allowing requests from this domain. Please check CORS configuration.');
            } else if (error.message.includes('404')) {
                throw new Error('🔍 Endpoint not found. Please check the API endpoint.');
            } else if (error.message.includes('429')) {
                throw new Error('⏳ Rate Limit: Too many requests. Please wait a moment and try again.');
            } else if (error.message.includes('500')) {
                throw new Error('⚙️ Server Error: The backend server encountered an error.');
            }
            
            throw error;
        }
    }

    // Get clan information
    async getClan() {
        return this.request(`/api/clan/${this.clanTag}`);
    }

    // Get clan members
    async getMembers() {
        return this.request(`/api/clan/${this.clanTag}/members`);
    }

    // Get player information
    async getPlayer(playerTag) {
        const encodedTag = encodeURIComponent(playerTag);
        return this.request(`/api/player/${encodedTag}`);
    }

    // Get clan capital information
    async getCapital() {
        return this.request(`/api/clan/${this.clanTag}/capital`);
    }

    // Utility functions
    formatNumber(num) {
        if (num === undefined || num === null) return '0';
        return num.toLocaleString();
    }

    formatLastSeen(lastSeen) {
        if (!lastSeen) return { text: 'Never', class: 'text-gray-500' };
        
        try {
            const now = new Date();
            const last = new Date(lastSeen);
            const diffMs = now - last;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            if (diffHours < 1) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                if (diffMins < 5) return { text: 'Online', class: 'text-green-500' };
                return { text: `${diffMins}m ago`, class: 'text-green-500' };
            }
            
            if (diffHours < 24) {
                return { text: `${diffHours}h ago`, class: 'text-yellow-500' };
            }
            
            const diffDays = Math.floor(diffHours / 24);
            return { text: `${diffDays}d ago`, class: 'text-red-500' };
        } catch (e) {
            return { text: 'Unknown', class: 'text-gray-500' };
        }
    }

    getRoleInfo(role) {
        switch(role?.toLowerCase()) {
            case 'leader':
                return { text: 'Leader', class: 'role-leader' };
            case 'coleader':
                return { text: 'Co-Leader', class: 'role-coLeader' };
            case 'elder':
                return { text: 'Elder', class: 'role-elder' };
            case 'member':
            default:
                return { text: 'Member', class: 'role-member' };
        }
    }

    getArenaName(trophies) {
    if (trophies >= 7500) return "Ultimate Champion";
    if (trophies >= 7000) return "Royal Champion";
    if (trophies >= 6600) return "Champion";
    if (trophies >= 6300) return "Grand Champion";
    if (trophies >= 6000) return "Master III";
    if (trophies >= 5500) return "Master II";
    if (trophies >= 5000) return "Master I";
    if (trophies >= 4600) return "League 10";
    if (trophies >= 4200) return "League 9";
    if (trophies >= 3800) return "League 8";
    if (trophies >= 3400) return "League 7";
    if (trophies >= 3000) return "League 6";
    if (trophies >= 2600) return "League 5";
    if (trophies >= 2200) return "League 4";
    if (trophies >= 1800) return "League 3";
    if (trophies >= 1400) return "League 2";
    return "League 1";
}

    
    // Get arena icon class
    getArenaIcon(trophies) {
        if (trophies >= 7500) return 'fas fa-crown';
        if (trophies >= 6000) return 'fas fa-chess-queen';
        if (trophies >= 5000) return 'fas fa-chess-knight';
        if (trophies >= 4000) return 'fas fa-shield-alt';
        if (trophies >= 3000) return 'fas fa-medal';
        if (trophies >= 2000) return 'fas fa-award';
        if (trophies >= 1000) return 'fas fa-star';
        return 'fas fa-graduation-cap';
    }
}

// Create global API instance
const api = new ClashAPI();

// Utility functions
const utils = {
    showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-10">
                    <div class="loader mx-auto mb-4"></div>
                    <p class="text-gray-600">${message}</p>
                </div>
            `;
            element.classList.remove('hidden');
        }
    },

    showError(elementId, title, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-10">
                    <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="location.reload()" class="bg-clash-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                        <i class="fas fa-redo mr-2"></i> Try Again
                    </button>
                </div>
            `;
            element.classList.remove('hidden');
        }
    },

    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-10">
                    <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
                    <p class="text-gray-600">${message}</p>
                </div>
            `;
        }
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};