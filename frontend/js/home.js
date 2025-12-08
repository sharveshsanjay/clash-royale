// Home Page Script
document.addEventListener('DOMContentLoaded', async function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Load clan data
    try {
        const clanData = await api.getClan();
        const membersData = await api.getMembers();
        
        updateClanInfo(clanData, membersData);
        updateStats(clanData, membersData);
        
        // Hide loading, show content
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('statsSection').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loading').innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-3"></i>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Connection Error</h3>
                <p class="text-gray-600 mb-4">Unable to connect to the backend server.</p>
                <p class="text-sm text-gray-500 mb-4">Make sure the backend server is running.</p>
                <button onclick="window.location.reload()" class="bg-clash-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                    Retry
                </button>
            </div>
        `;
    }
});

function updateClanInfo(clanData, membersData) {
    // Update clan tag
    const clanTagElement = document.getElementById('clanTagDisplay');
    if (clanTagElement) {
        clanTagElement.textContent = `#${clanData.tag.replace('#', '')}`;
    }

    // Update hero section
    const heroTitle = document.getElementById('heroTitle');
    const heroDesc = document.getElementById('heroDesc');
    
    if (heroTitle) heroTitle.textContent = clanData.name;
    if (heroDesc) heroDesc.textContent = clanData.description || 'An elite Clash Royale clan';
}

function updateStats(clanData, membersData) {
    // Update clan score
    const clanScore = document.getElementById('clanScore');
    if (clanScore) clanScore.textContent = api.formatNumber(clanData.clanScore);

    // Update war trophies
    const warTrophies = document.getElementById('warTrophies');
    if (warTrophies) {
        warTrophies.textContent = api.formatNumber(clanData.clanWarTrophies || 0);
    }

    // Update war league
    const warLeague = document.getElementById('warLeague');
    if (warLeague) {
        warLeague.textContent = clanData.warLeague?.name || 'Unranked';
    }

    // Update members count
    const membersCount = document.getElementById('membersCount');
    if (membersCount) {
        membersCount.textContent = `${clanData.members}/50`;
    }

    // Update members status
    const membersStatus = document.getElementById('membersStatus');
    if (membersStatus) {
        membersStatus.textContent = clanData.type === 'open' ? 'Open to Join' : 'Invite Only';
    }

    // Calculate and update weekly donations
    const weeklyDonations = document.getElementById('weeklyDonations');
    if (weeklyDonations && membersData.items) {
        const totalDonations = membersData.items.reduce((sum, member) => sum + (member.donations || 0), 0);
        weeklyDonations.textContent = api.formatNumber(totalDonations);
    }

    // Update clan rank
    const clanRank = document.getElementById('clanRank');
    if (clanRank) {
        clanRank.textContent = `War Trophies: ${api.formatNumber(clanData.clanWarTrophies || 0)}`;
    }
}