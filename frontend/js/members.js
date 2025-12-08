// Members Page Script
let allMembers = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Setup event listeners
    setupEventListeners();
    
    // Load members data
    await loadMembers();
});

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce(handleSearch, 300));
    }

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadMembers);
    }
}

async function loadMembers() {
    try {
        utils.showLoading('membersTableBody');
        
        const membersData = await api.getMembers();
        allMembers = membersData.items || [];
        
        updateStatsSummary(allMembers);
        displayMembers(allMembers);
        
    } catch (error) {
        console.error('Error loading members:', error);
        utils.showError('membersTableBody', 'Failed to load clan members. Please try again.');
    }
}

function updateStatsSummary(members) {
    const statsSummary = document.getElementById('statsSummary');
    if (!statsSummary) return;

    // Show stats summary
    statsSummary.classList.remove('hidden');

    // Calculate stats
    const totalMembers = members.length;
    const avgTrophies = Math.round(members.reduce((sum, member) => sum + member.trophies, 0) / totalMembers);
    const totalDonations = members.reduce((sum, member) => sum + member.donations, 0);
    
    // Count active members (online in last 24 hours)
    const activeMembers = members.filter(member => {
        const lastSeen = new Date(member.lastSeen);
        const now = new Date();
        const diffHours = (now - lastSeen) / (1000 * 60 * 60);
        return diffHours < 24;
    }).length;

    // Update stats
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('avgTrophies').textContent = api.formatNumber(avgTrophies);
    document.getElementById('totalDonations').textContent = api.formatNumber(totalDonations);
    document.getElementById('activeMembers').textContent = activeMembers;
}

function displayMembers(members) {
    const tableBody = document.getElementById('membersTableBody');
    const tableContainer = document.getElementById('membersTableContainer');
    const noResults = document.getElementById('noResults');

    if (!members || members.length === 0) {
        tableContainer.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    // Show table, hide no results
    tableContainer.classList.remove('hidden');
    noResults.classList.add('hidden');

    // Generate table rows
    tableBody.innerHTML = members.map((member, index) => {
        const lastSeen = api.formatLastSeen(member.lastSeen);
        const roleInfo = api.getRoleInfo(member.role);
        
        return `
        <tr class="hover:bg-clash-light/30 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : ''}">
            <td class="py-4 px-4">
                <div class="font-bold text-clash-blue">#${member.clanRank}</div>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-clash-blue to-clash-dark rounded-full flex items-center justify-center text-white font-bold">
                        ${member.expLevel}
                    </div>
                    <div>
                        <div class="font-bold text-gray-800">${member.name}</div>
                        <div class="text-xs text-gray-500">${member.tag}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="badge ${roleInfo.class}">${roleInfo.text}</span>
            </td>
            <td class="py-4 px-4 font-bold">${member.expLevel}</td>
            <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                    <i class="fas fa-trophy text-clash-blue"></i>
                    <span class="font-bold">${api.formatNumber(member.trophies)}</span>
                </div>
            </td>
            <td class="py-4 px-4">
                <div class="text-center">
                    <div class="font-bold text-clash-blue">${member.donations}</div>
                    <div class="text-xs text-gray-500">${member.donationsReceived} rec.</div>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="text-xs ${lastSeen.class}">
                    <i class="fas fa-circle mr-1"></i> ${lastSeen.text}
                </span>
            </td>
            <td class="py-4 px-4">
                <button onclick="viewPlayer('${member.tag}')" class="text-clash-blue hover:text-blue-600 transition">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displayMembers(allMembers);
        return;
    }
    
    const filtered = allMembers.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        member.tag.toLowerCase().includes(searchTerm)
    );
    
    displayMembers(filtered);
}

function handleSort() {
    const sortSelect = document.getElementById('sortSelect');
    const sortBy = sortSelect.value;
    
    const sorted = [...allMembers].sort((a, b) => {
        switch(sortBy) {
            case 'trophies':
                return b.trophies - a.trophies;
            case 'donations':
                return b.donations - a.donations;
            case 'level':
                return b.expLevel - a.expLevel;
            case 'rank':
            default:
                return a.clanRank - b.clanRank;
        }
    });
    
    displayMembers(sorted);
}

function viewPlayer(playerTag) {
    localStorage.setItem('playerTag', playerTag);
    window.location.href = 'players.html';
}