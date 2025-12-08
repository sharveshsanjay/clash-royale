// Members Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('👥 Members page initialized');
    
    // State variables
    let allMembers = [];
    let filteredMembers = [];
    let currentFilter = 'all';
    
    // DOM Elements
    const loadingEl = document.getElementById('loading');
    const errorStateEl = document.getElementById('errorState');
    const errorMessageEl = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');
    const statsSummaryEl = document.getElementById('statsSummary');
    const membersGridView = document.getElementById('membersGridView');
    const noResultsEl = document.getElementById('noResults');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const refreshBtn = document.getElementById('refreshBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gridContainer = document.getElementById('gridContainer');

    // Initialize
    init();

    // Functions
    function init() {
        // Mobile Menu Toggle
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Setup event listeners
        setupEventListeners();
        
        // Load members data
        loadMembers();
    }

    function setupEventListeners() {
        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', debounce(handleSearch, 300));
        }

        // Sort select
        if (sortSelect) {
            sortSelect.addEventListener('change', handleSort);
        }

        // Refresh button
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadMembers);
        }

        // Retry button
        if (retryBtn) {
            retryBtn.addEventListener('click', loadMembers);
        }

        // Clear filters button
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearFilters);
        }

        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const role = this.dataset.role;
                setFilter(role);
            });
        });
    }

    async function loadMembers() {
        try {
            showLoading();
            
            console.log('📥 Loading members data...');
            const membersData = await api.getMembers();
            
            if (!membersData || !membersData.items) {
                throw new Error('No members data received');
            }
            
            allMembers = membersData.items || [];
            console.log(`✅ Loaded ${allMembers.length} members`);
            
            // Update last updated timestamp
            updateLastUpdated();
            
            // Update role counts
            updateRoleCounts(allMembers);
            
            // Apply current filter
            applyFilter();
            
            // Update stats
            updateStatsSummary(allMembers);
            
            // Show content
            hideLoading();
            
        } catch (error) {
            console.error('❌ Error loading members:', error);
            showError('Failed to load clan members. Please try again.');
        }
    }

    function showLoading() {
        if (loadingEl) loadingEl.classList.remove('hidden');
        if (errorStateEl) errorStateEl.classList.add('hidden');
        if (membersGridView) membersGridView.classList.add('hidden');
        if (noResultsEl) noResultsEl.classList.add('hidden');
        if (statsSummaryEl) statsSummaryEl.classList.add('hidden');
    }

    function hideLoading() {
        if (loadingEl) loadingEl.classList.add('hidden');
        if (errorStateEl) errorStateEl.classList.add('hidden');
        if (membersGridView) membersGridView.classList.remove('hidden');
        if (statsSummaryEl) statsSummaryEl.classList.remove('hidden');
    }

    function showError(message) {
        if (loadingEl) loadingEl.classList.add('hidden');
        if (membersGridView) membersGridView.classList.add('hidden');
        if (statsSummaryEl) statsSummaryEl.classList.add('hidden');
        if (errorStateEl) {
            errorStateEl.classList.remove('hidden');
            errorMessageEl.textContent = message;
        }
    }

    function updateLastUpdated() {
        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (lastUpdatedEl) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = now.toLocaleDateString();
            lastUpdatedEl.textContent = `Last updated: ${dateString} ${timeString}`;
        }
    }

    function updateRoleCounts(members) {
        const counts = {
            all: members.length,
            leader: members.filter(m => m.role === 'leader').length,
            coLeader: members.filter(m => m.role === 'coLeader').length,
            elder: members.filter(m => m.role === 'elder').length,
            member: members.filter(m => m.role === 'member').length
        };

        // Update count badges
        const countAllEl = document.getElementById('countAll');
        const countLeadersEl = document.getElementById('countLeaders');
        const countCoLeadersEl = document.getElementById('countCoLeaders');
        const countEldersEl = document.getElementById('countElders');
        const countMembersEl = document.getElementById('countMembers');

        if (countAllEl) countAllEl.textContent = counts.all;
        if (countLeadersEl) countLeadersEl.textContent = counts.leader;
        if (countCoLeadersEl) countCoLeadersEl.textContent = counts.coLeader;
        if (countEldersEl) countEldersEl.textContent = counts.elder;
        if (countMembersEl) countMembersEl.textContent = counts.member;
    }

    function updateStatsSummary(members) {
        if (members.length === 0) return;

        const totalMembers = members.length;
        const avgTrophies = Math.round(members.reduce((sum, m) => sum + m.trophies, 0) / totalMembers);
        const totalDonations = members.reduce((sum, m) => sum + m.donations, 0);
        
        // Count active members (online in last 24 hours)
        const activeMembers = members.filter(member => {
            if (!member.lastSeen) return false;
            const lastSeen = new Date(member.lastSeen);
            const now = new Date();
            const diffHours = (now - lastSeen) / (1000 * 60 * 60);
            return diffHours < 24;
        }).length;

        // Update stats elements
        const totalMembersEl = document.getElementById('totalMembers');
        const avgTrophiesEl = document.getElementById('avgTrophies');
        const totalDonationsEl = document.getElementById('totalDonations');
        const activeMembersEl = document.getElementById('activeMembers');

        if (totalMembersEl) totalMembersEl.textContent = api.formatNumber(totalMembers);
        if (avgTrophiesEl) avgTrophiesEl.textContent = api.formatNumber(avgTrophies);
        if (totalDonationsEl) totalDonationsEl.textContent = api.formatNumber(totalDonations);
        if (activeMembersEl) activeMembersEl.textContent = activeMembers;
    }

    function setFilter(role) {
        // Update active button
        filterButtons.forEach(btn => {
            if (btn.dataset.role === role) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        currentFilter = role;
        applyFilter();
    }

    function applyFilter() {
        let filtered = [...allMembers];

        // Apply role filter
        if (currentFilter !== 'all') {
            filtered = filtered.filter(member => member.role === currentFilter);
        }

        // Apply search filter
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (searchTerm) {
            filtered = filtered.filter(member => 
                member.name.toLowerCase().includes(searchTerm) ||
                (member.tag && member.tag.toLowerCase().includes(searchTerm))
            );
        }

        // Apply sort
        const sortBy = sortSelect ? sortSelect.value : 'rank';
        filtered.sort((a, b) => {
            switch(sortBy) {
                case 'trophies': return b.trophies - a.trophies;
                case 'donations': return b.donations - a.donations;
                case 'level': return b.expLevel - a.expLevel;
                case 'rank':
                default: return a.clanRank - b.clanRank;
            }
        });

        filteredMembers = filtered;
        updateViewTitle();
        displayMembers();
    }

    function updateViewTitle() {
        const titleMap = {
            'all': 'All Members',
            'leader': 'Leaders',
            'coLeader': 'Co-Leaders',
            'elder': 'Elders',
            'member': 'Members'
        };

        const title = titleMap[currentFilter] || 'Members';
        const viewTitleEl = document.getElementById('viewTitle');
        const memberCountBadgeEl = document.getElementById('memberCountBadge');

        if (viewTitleEl) viewTitleEl.textContent = title;
        if (memberCountBadgeEl) memberCountBadgeEl.textContent = filteredMembers.length;
    }

    function handleSearch() {
        applyFilter();
    }

    function handleSort() {
        applyFilter();
    }

    function clearFilters() {
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'rank';
        setFilter('all');
    }

    function displayMembers() {
        if (!gridContainer || !membersGridView || !noResultsEl) return;

        if (filteredMembers.length === 0) {
            membersGridView.classList.add('hidden');
            noResultsEl.classList.remove('hidden');
            return;
        }

        membersGridView.classList.remove('hidden');
        noResultsEl.classList.add('hidden');

        // Display members in grid
        gridContainer.innerHTML = filteredMembers.map(member => {
            const lastSeen = api.formatLastSeen(member.lastSeen);
            const roleInfo = api.getRoleInfo(member.role);
            const arenaName = api.getArenaName(member.trophies);

            return `
            <div class="bg-white rounded-2xl shadow-clash border border-gray-200 hover:shadow-clash-hover transition overflow-hidden">
                <!-- Member Header -->
                <div class="p-5 border-b border-gray-100">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 truncate">${member.name}</h3>
                            <p class="text-gray-500 text-xs truncate">${member.tag}</p>
                        </div>
                        <span class="text-xs font-semibold px-3 py-1 rounded-full ${roleInfo.class}">
                            ${roleInfo.text}
                        </span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 bg-gradient-to-br from-clash-blue to-clash-dark rounded-full flex items-center justify-center text-white font-bold">
                                ${member.expLevel}
                            </div>
                            <div>
                                <div class="text-sm font-semibold text-gray-800">Level ${member.expLevel}</div>
                                <div class="text-xs text-gray-500">${arenaName}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="flex items-center gap-1 text-clash-blue">
                                <i class="fas fa-trophy"></i>
                                <span class="font-bold">${api.formatNumber(member.trophies)}</span>
                            </div>
                            <div class="text-xs text-gray-500">Trophies</div>
                        </div>
                    </div>
                </div>

                <!-- Member Stats -->
                <div class="p-5">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="text-center">
                            <div class="text-xl font-bold text-clash-blue">${member.donations}</div>
                            <div class="text-xs text-gray-600">Donations</div>
                        </div>
                        <div class="text-center">
                            <div class="text-xl font-bold text-clash-blue">${member.donationsReceived}</div>
                            <div class="text-xs text-gray-600">Received</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-600">
                            <i class="fas fa-hashtag mr-1"></i>Rank #${member.clanRank}
                        </span>
                        <span class="${lastSeen.class}">
                            <i class="fas fa-circle mr-1"></i> ${lastSeen.text}
                        </span>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="p-5 pt-0">
                    <button onclick="viewPlayer('${member.tag}')" class="w-full bg-clash-light text-clash-blue hover:bg-clash-blue hover:text-white font-semibold py-2 rounded-lg transition">
                        <i class="fas fa-eye mr-2"></i> View Profile
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    // Utility function
    function debounce(func, wait) {
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

    // Global function for viewing player
    window.viewPlayer = function(playerTag) {
        console.log('👤 Viewing player:', playerTag);
        localStorage.setItem('playerTag', playerTag);
        window.location.href = 'players.html';
    };
});