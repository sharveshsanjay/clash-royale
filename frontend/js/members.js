// Members Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    async function getPlayerDetails(tag) {
    try {
        // IMPORTANT: Do NOT encode tag here
        return await api.getPlayer(tag);
    } catch (err) {
        console.warn("Player API failed for tag:", tag);
        return null;
    }
}

function updateMemberCardInDOM(member) {
    const el = document.querySelector(`[data-tag="${member.tag}"]`);
    if (!el) return;

    el.outerHTML = renderMemberCard(member);
}


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
            // Load full player details safely with rate limit
            loadFullPlayerData(allMembers);

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

    async function loadFullPlayerData(members) {
    for (let i = 0; i < members.length; i++) {

        const m = members[i];

        // Avoid API rate limit (250ms between requests)
        await new Promise(res => setTimeout(res, 250));

        const player = await getPlayerDetails(m.tag);

        if (!player) continue;

        // Merge details
        m.bestTrophies = player.bestTrophies;
        m.challengeMaxWins = player.challengeMaxWins;
        m.cardsFound = player.cards?.length || 0;
        m.starPoints = player.starPoints || 0;
        m.favouriteCard = player.currentFavouriteCard?.name || "None";
        m.battleWins = player.wins ?? "—";
        m.threeCrownWins = player.threeCrownWins ?? "—";

        // Update card in UI
        updateMemberCardInDOM(m);
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
        gridContainer.innerHTML = filteredMembers
    .map(member => renderMemberCard(member))
    .join('');

    }

    function renderMemberCard(member) {
        
    
    const roleInfo = api.getRoleInfo(member.role);
    const arenaName = api.getArenaName(member.trophies);

    let lastSeen;

if (!member.lastSeen || member.lastSeen === "" || member.lastSeen === null) {
    lastSeen = {
        text: "Active",
        class: "text-green-600"
    };
} else {
    try {
        // Clash Royale LastSeen Format Example:
        // 20250206T104422.000Z
        const dateStr = member.lastSeen.replace(".000Z", "Z");

        const last = new Date(dateStr);
        const now = new Date();

        const diffMs = now - last;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (isNaN(diffDays)) {
            lastSeen = {
                text: "Active",
                class: "text-green-600"
            };
        } else if (diffDays === 0) {
            lastSeen = {
                text: "Active today",
                class: "text-green-600"
            };
        } else {
            lastSeen = {
                text: `${diffDays}d ago`,
                class: diffDays <= 3 ? "text-yellow-600" :
                       diffDays <= 7 ? "text-orange-600" :
                                       "text-red-600"
            };
        }

    } catch (err) {
        lastSeen = {
            text: "Active",
            class: "text-green-600"
        };
    }
}


    return `
<div data-tag="${member.tag}" 
     class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5">

    <!-- PROFILE SECTION -->
    <div class="flex items-center gap-4 mb-5">
        <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
            <img src="images/profile-icon.png" class="w-full h-full object-cover">
        </div>

        <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 leading-tight">${member.name}</h3>
            <p class="text-gray-500 text-xs">${member.tag}</p>

            <span class="inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full ${roleInfo.class}">
                ${roleInfo.text}
            </span>
        </div>
    </div>

    <!-- LEVEL + TROPHIES -->
    <div class="flex justify-between items-center mb-5">
        
        <!-- Level Block -->
        <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-royale-blue text-white rounded-xl flex items-center justify-center font-bold">
                ${member.expLevel}
            </div>
            <div>
                <div class="text-sm font-semibold text-gray-900">Level ${member.expLevel}</div>
                <div class="text-xs text-gray-500">${arenaName}</div>
            </div>
        </div>

        <!-- Trophies -->
        <div class="text-right">
            <div class="flex items-center justify-end gap-1 text-royale-blue font-semibold text-lg">
                <i class="fas fa-trophy text-base"></i> ${member.trophies}
            </div>
            <div class="text-xs text-gray-500">Current</div>
        </div>
    </div>

    <div class="border-t border-gray-200 my-4"></div>

    <!-- PLAYER STATS -->
    <div class="grid grid-cols-2 gap-4 mb-2">

        <div class="flex flex-col items-start">
            <div class="text-gray-500 text-xs flex items-center gap-1">
                <i class="fas fa-crown text-gray-400"></i> Best Trophies
            </div>
            <div class="font-semibold text-gray-900 text-sm">${member.bestTrophies ?? "—"}</div>
        </div>

        <div class="flex flex-col items-start">
            <div class="text-gray-500 text-xs flex items-center gap-1">
                <i class="fas fa-medal text-gray-400"></i> Max Wins
            </div>
            <div class="font-semibold text-gray-900 text-sm">${member.challengeMaxWins ?? "—"}</div>
        </div>

        <div class="flex flex-col items-start">
            <div class="text-gray-500 text-xs flex items-center gap-1">
                <i class="fas fa-clone text-gray-400"></i> Cards Found
            </div>
            <div class="font-semibold text-gray-900 text-sm">${member.cardsFound ?? "—"}</div>
        </div>

        <div class="flex flex-col items-start">
            <div class="text-gray-500 text-xs flex items-center gap-1">
                <i class="fas fa-star text-gray-400"></i> Star Points
            </div>
            <div class="font-semibold text-gray-900 text-sm">${member.starPoints ?? "—"}</div>
        </div>
    </div>

    <div class="border-t border-gray-200 my-4"></div>

    <!-- DONATIONS -->
    <div class="grid grid-cols-2 gap-4 mb-2">
        <div class="flex flex-col items-start">
            <div class="text-gray-500 text-xs flex items-center gap-1">
                <i class="fas fa-hand-holding-heart text-gray-400"></i> Donations
            </div>
            <div class="font-bold text-royale-blue text-lg">${member.donations}</div>
        </div>

        <div class="flex flex-col items-start">
            <div class="text-gray-500 text-xs flex items-center gap-1">
                <i class="fas fa-arrow-down text-gray-400"></i> Received
            </div>
            <div class="font-bold text-royale-blue text-lg">${member.donationsReceived}</div>
        </div>
    </div>

    <div class="border-t border-gray-200 my-4"></div>

    <!-- FAVOURITE CARD -->
    <div class="mb-4">
        <div class="text-gray-500 text-xs flex items-center gap-1">
            <i class="fas fa-heart text-gray-400"></i> Favourite Card
        </div>
        <div class="font-semibold text-gray-900 text-sm">${member.favouriteCard ?? "—"}</div>
    </div>

    <div class="border-t border-gray-200 my-4"></div>

    <!-- RANK + LAST SEEN -->
    <div class="flex justify-between items-center text-sm mb-4">
        <span class="text-gray-700 font-medium">
            <i class="fas fa-hashtag mr-1"></i> Rank #${member.clanRank}
        </span>
        <span class="${lastSeen.class}">
            <i class="fas fa-circle mr-1"></i>${lastSeen.text}
        </span>
    </div>

    <!-- BUTTON -->
    <button onclick="viewPlayer('${member.tag}')" 
        class="w-full bg-white border border-royale-blue text-royale-blue hover:bg-royale-blue hover:text-white font-semibold py-2 rounded-lg transition">
        <i class="fas fa-eye mr-2"></i> View Profile
    </button>

</div>`;

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