// API Configuration
class ClashAPI {
    constructor() {
        // Update this with your backend URL after deployment
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000'
            : 'https://your-backend-url.onrender.com'; // Update this after deployment
        
        // Clan Tag - Replace with your clan tag
        this.clanTag = '%23RYPUQ8CY'; // URL encoded clan tag
    }

    // Format tag for display
    formatTag(tag) {
        return decodeURIComponent(tag).replace('#', '');
    }

    // Make API request
    async request(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.message || 'API error');
            }
            
            return data.data;
        } catch (error) {
            console.error('API Request Error:', error);
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

    // Helper functions
    formatNumber(num) {
        return num?.toLocaleString() || '0';
    }

    formatLastSeen(lastSeen) {
        if (!lastSeen) return { text: 'Unknown', class: 'text-gray-500' };
        
        const now = new Date();
        const last = new Date(lastSeen);
        const diffHours = Math.floor((now - last) / (1000 * 60 * 60));
        
        if (diffHours < 1) return { text: 'Online', class: 'text-green-500' };
        if (diffHours < 24) return { text: `${diffHours}h ago`, class: 'text-yellow-500' };
        
        const diffDays = Math.floor(diffHours / 24);
        return { text: `${diffDays}d ago`, class: 'text-red-500' };
    }

    getRoleInfo(role) {
        switch(role) {
            case 'leader': return { text: 'Leader', class: 'role-leader' };
            case 'coLeader': return { text: 'Co-Leader', class: 'role-coLeader' };
            case 'elder': return { text: 'Elder', class: 'role-elder' };
            default: return { text: 'Member', class: 'role-member' };
        }
    }

    getArenaName(trophies) {
        if (trophies >= 7500) return 'Champion';
        if (trophies >= 6000) return 'Master';
        if (trophies >= 5000) return 'Challenger';
        if (trophies >= 4000) return 'Legendary';
        if (trophies >= 3000) return 'Gold';
        if (trophies >= 2000) return 'Silver';
        if (trophies >= 1000) return 'Bronze';
        return 'Training';
    }
}

// Create global API instance
const api = new ClashAPI();

// Utility functions
const utils = {
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8">
                    <div class="loader mx-auto mb-4"></div>
                    <p class="text-gray-600">Loading...</p>
                </div>
            `;
        }
    },

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-3"></i>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">Error</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="window.location.reload()" class="bg-clash-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                        Retry
                    </button>
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