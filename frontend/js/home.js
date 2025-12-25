// Home Page JavaScript for CLASH SQUAD
document.addEventListener('DOMContentLoaded', function () {
    console.log('🏠 CLASH SQUAD Home page initialized');

    // DOM Elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const errorMessageEl = document.getElementById('errorMessage');
    const clanInfoEl = document.getElementById('clanInfo');
    const quickStatsEl = document.getElementById('quickStats');
    const clanDetailsEl = document.getElementById('clanDetails');
    const topMembersEl = document.getElementById('topMembers');

    // Initialize
    init();

    async function init() {

        // Load clan data
        try {
            utils.showLoading('loading', 'Loading CLASH SQUAD data...');

            // Load clan and members data
            const clanData = await api.getClanSquad();

            // wake backend first
            await new Promise(r => setTimeout(r, 800));

            const membersData = await api.getClanSquadMembers();
            

            if (!clanData) {
                throw new Error('Failed to load clan data');
            }

            // Update UI
            updateQuickStats(clanData);
            updateClanDetails(clanData);
            updateTopMembers(membersData);

            // Hide loading, show content
            loadingEl.classList.add('hidden');
            errorEl.classList.add('hidden');
            clanInfoEl.classList.remove('hidden');

        } catch (error) {
            console.error('❌ Error loading data:', error);
            loadingEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
            errorMessageEl.textContent = error.message || 'Failed to load clan data';
        }
    }

    function updateQuickStats(clan) {
        if (!quickStatsEl) return;

        quickStatsEl.innerHTML = `
            <div class="bg-white rounded-xl p-6 text-center shadow-clash border border-gray-100 hover-lift transition">
                <div class="text-3xl font-bold text-clash-blue mb-2">${clan.members || 0}/50</div>
                <div class="text-gray-600">Members</div>
                <div class="text-xs text-gray-500 mt-1">Active Squad</div>
            </div>
            
            <div class="bg-white rounded-xl p-6 text-center shadow-clash border border-gray-100 hover-lift transition">
                <div class="text-3xl font-bold text-clash-blue mb-2">${api.formatNumber(clan.clanScore)}</div>
                <div class="text-gray-600">Clan Score</div>
                <div class="text-xs text-gray-500 mt-1">Total Points</div>
            </div>
            
            <div class="bg-white rounded-xl p-6 text-center shadow-clash border border-gray-100 hover-lift transition">
                <div class="text-3xl font-bold text-clash-blue mb-2">${api.formatNumber(clan.donationsPerWeek || 0)}</div>
                <div class="text-gray-600">Donations</div>
                <div class="text-xs text-gray-500 mt-1">This Week</div>
            </div>
            
            <div class="bg-white rounded-xl p-6 text-center shadow-clash border border-gray-100 hover-lift transition">
                <div class="text-3xl font-bold text-clash-blue mb-2">${api.formatNumber(clan.clanWarTrophies || 0)}</div>
                <div class="text-gray-600">War Trophies</div>
                <div class="text-xs text-gray-500 mt-1">Total Wins</div>
            </div>
        `;
    }

    function updateClanDetails(clan) {
        if (!clanDetailsEl) return;

        clanDetailsEl.innerHTML = `
<div class="space-y-4">

    <!-- Clan Tag -->
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-clash-light rounded-lg flex items-center justify-center text-clash-blue">
            <i class="fas fa-tag"></i>
        </div>
        <div>
            <div class="text-sm text-gray-500">Clan Tag</div>
            <div class="font-bold">${clan.tag}</div>
        </div>
    </div>

    <!-- Location -->
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-clash-light rounded-lg flex items-center justify-center text-clash-blue">
            <i class="fas fa-map-marker-alt"></i>
        </div>
        <div>
            <div class="text-sm text-gray-500">Location</div>
            <div class="font-bold">${clan.location?.name || 'International'}</div>
        </div>
    </div>

    <!-- Required Trophies -->
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-clash-light rounded-lg flex items-center justify-center text-clash-blue">
            <i class="fas fa-trophy"></i>
        </div>
        <div>
            <div class="text-sm text-gray-500">Required Trophies</div>
            <div class="font-bold">${clan.requiredTrophies || 0}</div>
        </div>
    </div>

    <!-- Clan Type -->
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-clash-light rounded-lg flex items-center justify-center text-clash-blue">
            <i class="fas fa-users"></i>
        </div>
        <div>
            <div class="text-sm text-gray-500">Clan Type</div>
            <div class="font-bold">${clan.type === 'open' ? 'Open' : 'Invite Only'}</div>
        </div>
    </div>

</div>

<div class="space-y-4">

    <!-- Clan Score -->
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-clash-light rounded-lg flex items-center justify-center text-clash-blue">
            <i class="fas fa-star"></i>
        </div>
        <div>
            <div class="text-sm text-gray-500">Clan Score</div>
            <div class="font-bold">${clan.clanScore || 0}</div>
        </div>
    </div>

    <!-- Members Count -->
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-clash-light rounded-lg flex items-center justify-center text-clash-blue">
            <i class="fas fa-user-friends"></i>
        </div>
        <div>
            <div class="text-sm text-gray-500">Members</div>
            <div class="font-bold">${clan.members || 0} / 50</div>
        </div>
    </div>

    <!-- Donations Per Week -->
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-clash-light rounded-lg flex items-center justify-center text-clash-blue">
            <i class="fas fa-hand-holding-heart"></i>
        </div>
        <div>
            <div class="text-sm text-gray-500">Donations (Weekly)</div>
            <div class="font-bold">${clan.donationsPerWeek || 0}</div>
        </div>
    </div>

</div>
`;

    }

    function updateTopMembers(membersData) {
        if (!topMembersEl) return;

        const members = membersData.items || membersData;
        if (!members || members.length === 0) {
            topMembersEl.innerHTML = '<p class="text-gray-500 text-center col-span-3">No members found</p>';
            return;
        }

        // Get top 6 members by trophies
        const topMembers = [...members]
            .sort((a, b) => b.trophies - a.trophies)
            .slice(0, 6);

        topMembersEl.innerHTML = topMembers.map((member, index) => {
            const roleInfo = api.getRoleInfo(member.role);
            const arenaName = api.getArenaName(member.trophies);

            return `
                    <div class="bg-white border border-gray-200 rounded-2xl p-4 transition hover:shadow-md">

                        <!-- Header -->
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-sm font-semibold text-gray-400">
                                #${index + 1}
                            </span>
                            <span class="${roleInfo.class} text-xs font-semibold px-2.5 py-1 rounded-full">
                                ${roleInfo.text}
                            </span>
                        </div>

                        <!-- Image -->
                        <div class="flex justify-center mb-4">
                            <img src="images/member-card.png"
                                alt="Member"
                                class="w-20 h-20 object-contain">
                        </div>

                        <!-- Name -->
                        <div class="text-center mb-4">
                            <div class="font-bold text-gray-900 text-lg leading-tight">
                                ${member.name}
                            </div>
                            <div class="text-xs text-gray-500">
                                ${arenaName}
                            </div>
                        </div>

                        <!-- Main Stats -->
                        <div class="grid grid-cols-2 gap-4 text-center mb-4">
                            <div>
                                <div class="text-xl font-extrabold text-gray-900">
                                    ${api.formatNumber(member.trophies)}
                                </div>
                                <div class="text-[11px] uppercase tracking-wide text-gray-500">
                                    Trophies
                                </div>
                            </div>

                            <div>
                                <div class="text-xl font-extrabold text-gray-900">
                                    ${member.expLevel}
                                </div>
                                <div class="text-[11px] uppercase tracking-wide text-gray-500">
                                    Level
                                </div>
                            </div>
                        </div>

                        <!-- Sub Stats -->
                        <div class="flex justify-between text-sm text-gray-600 mb-5">
                            <span>Donated <b class="text-gray-900">${member.donations || 0}</b></span>
                            <span>Received <b class="text-gray-900">${member.donationsReceived || 0}</b></span>
                        </div>

                        <!-- Button -->
                        <button
                            onclick="viewPlayerProfile('${member.tag}')"
                            class="w-full border border-gray-300 text-gray-800 font-semibold py-2.5 rounded-xl hover:bg-gray-100 transition">
                            View Profile
                        </button>

                    </div>
                    `;

        }).join('');
    }

    // Global function for viewing player
    window.viewPlayerProfile = function (playerTag) {
        console.log('👤 Viewing player:', playerTag);
        localStorage.setItem('playerTag', playerTag);
        window.location.href = 'players.html';
    };
});