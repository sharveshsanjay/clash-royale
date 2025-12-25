// Clash Squad API Wrapper - Specific for CLASH SQUAD Clan
class ClashSquadAPI {
    constructor() {
        // Backend URL - Your Render backend
        this.baseURL = 'https://clash-squad-backend.onrender.com';

        // Your CLASH SQUAD clan tag
        this.clanTag = '%23RYPUQ8CY'; // #RYPUQ8CY

        console.log('🏰 Clash Squad API Initialized');
        console.log('🌐 Backend URL:', this.baseURL);
        console.log('🏷️  Clan Tag:', this.clanTag);
        console.log('👑 Clan Name: CLASH SQUAD');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        console.log(`📤 Request: ${endpoint}`);

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error (${response.status}):`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || 'API Error'}`);
            }

            const data = await response.json();

            if (data.error) {
                console.error('❌ API returned error:', data);
                throw new Error(data.message || 'API error');
            }

            console.log(`✅ Success: ${endpoint}`);
            return data.data || data;

        } catch (error) {
            console.error(`❌ Failed to fetch ${endpoint}:`, error.message);

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Network Error: Cannot connect to backend server.');
            } else if (error.message.includes('404')) {
                // Return null for missing endpoints (don't break the site)
                console.warn(`⚠️ Endpoint not found: ${endpoint}`);
                return null;
            }

            throw error;
        }
    }

    // ========== CLASH SQUAD CLAN ENDPOINTS ==========
    async getClanSquad() {
        return this.request(`/api/clan/${this.clanTag}`);
    }

    async getClanSquadMembers() {
        return this.request(`/api/clan/${this.clanTag}/members`);
    }

    async getClanSquadWarLog() {
        return this.request(`/api/clan/${this.clanTag}/warlog`);
    }

    async getClanSquadCurrentWar() {
        return this.request(`/api/clan/${this.clanTag}/currentwar`);
    }

    async getClanSquadCapital() {
        return this.request(`/api/clan/${this.clanTag}/capital`);
    }

    async getClan() {
        return this.request(`/api/clan/${this.clanTag}`);
    }

    async getMembers() {
        return this.request(`/api/clan/${this.clanTag}/members`);
    }

    async getClanWarLog() {
        return this.request(`/api/clan/${this.clanTag}/warlog`);
    }

    async getClanWar() {
        return this.request(`/api/clan/${this.clanTag}/currentwar`);
    }

    async getCapital() {
        return this.request(`/api/clan/${this.clanTag}/capital`);
    }

    async getClanAnnouncements() {
        return fetch('data/announcements.json').then(r => r.json());
    }


    // ========== PLAYER ENDPOINTS ==========
    async getPlayer(playerTag) {
        const encodedTag = encodeURIComponent(playerTag);
        return this.request(`/api/player/${encodedTag}`);
    }

    async getPlayerBattleLog(playerTag) {
    const encodedTag = encodeURIComponent(playerTag);
    return this.request(`/api/player/${encodedTag}/battlelog`);
}

async getPlayerUpcomingChests(playerTag) {
    const encodedTag = encodeURIComponent(playerTag);
    return this.request(`/api/player/${encodedTag}/upcomingchests`);
}


    // ========== OTHER ENDPOINTS ==========
    async getCards() {
        return this.request('/api/cards');
    }

    async getTournaments() {
        return this.request('/api/tournaments');
    }

    async getLocations() {
        return this.request('/api/locations');
    }

    async getChallenges() {
        return this.request('/api/challenges');
    }

    async getEvents() {
        return this.request('/api/events');
    }

    async getLeaderboardPlayers(locationId = 'global') {
        return this.request(`/api/leaderboard/players/${locationId}`);
    }

    async getLeaderboardClans(locationId = 'global') {
        return this.request(`/api/leaderboard/clans/${locationId}`);
    }

    async getGlobalTournaments() {
        return this.request('/api/global-tournaments');
    }

    async getBattleLog(playerTag) {
        return this.request(`/api/player/${playerTag}/battlelog`);
    }

    async getUpcomingChests(playerTag) {
        return this.request(`/api/player/${playerTag}/upcomingchests`);
    }



    // ========== UTILITY FUNCTIONS ==========
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

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    formatTimeAgo(dateString) {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

            if (diffHours < 1) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                if (diffMins < 5) return 'Just now';
                return `${diffMins}m ago`;
            }

            if (diffHours < 24) {
                return `${diffHours}h ago`;
            }

            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays}d ago`;
        } catch (e) {
            return dateString;
        }
    }

    getRoleInfo(role) {
        switch (role?.toLowerCase()) {
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

    getRarityColor(rarity) {
        switch (rarity?.toLowerCase()) {
            case 'common': return 'text-gray-600';
            case 'rare': return 'text-blue-500';
            case 'epic': return 'text-purple-500';
            case 'legendary': return 'text-yellow-500';
            case 'champion': return 'text-red-500';
            default: return 'text-gray-500';
        }
    }

    getRarityBgColor(rarity) {
        switch (rarity?.toLowerCase()) {
            case 'common': return 'bg-gray-100';
            case 'rare': return 'bg-blue-50';
            case 'epic': return 'bg-purple-50';
            case 'legendary': return 'bg-yellow-50';
            case 'champion': return 'bg-red-50';
            default: return 'bg-gray-50';
        }
    }

    getCardTypeIcon(type) {
        switch (type?.toLowerCase()) {
            case 'troop': return 'fas fa-user';
            case 'spell': return 'fas fa-bolt';
            case 'building': return 'fas fa-building';
            default: return 'fas fa-question';
        }
    }

    getClanWarStatus(state) {
        switch (state) {
            case 'preparation': return { text: 'Preparation', color: 'text-yellow-500', icon: 'fas fa-clock' };
            case 'inWar': return { text: 'In War', color: 'text-green-500', icon: 'fas fa-shield-alt' };
            case 'warEnded': return { text: 'War Ended', color: 'text-blue-500', icon: 'fas fa-flag-checkered' };
            default: return { text: 'Not in War', color: 'text-gray-500', icon: 'fas fa-ban' };
        }
    }

    // Get battle outcome emoji
    getBattleEmoji(trophyChange) {
        if (trophyChange > 0) return '🟢';
        if (trophyChange < 0) return '🔴';
        return '🟡';
    }
}

// Create global API instance
const api = new ClashSquadAPI();

// Utility functions
const utils = {
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
    },

    showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-12">
                    <div class="loader mx-auto mb-4"></div>
                    <p class="text-gray-600">${message}</p>
                </div>
            `;
            element.classList.remove('hidden');
        }
    },

    showElement(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove("hidden");
    },

    hideElement(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    },

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.classList.add('hidden');
    },

    showError(elementId, title, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-3"></i>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">${title}</h3>
                    <p class="text-gray-600 mb-4">${message}</p>
                    <button onclick="location.reload()" class="btn-primary">
                        Try Again
                    </button>
                </div>
            `;
            element.classList.remove('hidden');
        }
    },

    showNoData(elementId, message = 'No data available') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-info-circle text-3xl text-gray-400 mb-3"></i>
                    <p class="text-gray-500">${message}</p>
                </div>
            `;
            element.classList.remove('hidden');
        }
    }
};