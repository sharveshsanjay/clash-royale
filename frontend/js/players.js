// Players Page Script
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Setup form
    const form = document.getElementById('playerSearchForm');
    form.addEventListener('submit', handlePlayerSearch);

    // Check if player tag is in localStorage
    const savedTag = localStorage.getItem('playerTag');
    if (savedTag) {
        document.getElementById('playerTagInput').value = savedTag;
        searchPlayer(savedTag);
        localStorage.removeItem('playerTag');
    }
});

async function handlePlayerSearch(e) {
    e.preventDefault();
    
    const playerTagInput = document.getElementById('playerTagInput');
    const playerTag = playerTagInput.value.trim();
    
    if (!playerTag) {
        showError('Please enter a player tag');
        return;
    }

    // Ensure tag starts with #
    const formattedTag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`;
    
    await searchPlayer(formattedTag);
}

async function searchPlayer(playerTag) {
    try {
        showLoading();
        
        const playerData = await api.getPlayer(playerTag);
        displayPlayerInfo(playerData);
        
    } catch (error) {
        console.error('Error searching player:', error);
        showError('Player not found or API error. Please check the tag and try again.');
    }
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('playerInfo').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('playerInfo').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    
    document.getElementById('errorTitle').textContent = 'Search Failed';
    document.getElementById('errorMessage').textContent = message;
}

function displayPlayerInfo(player) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('playerInfo').classList.remove('hidden');

    const arenaName = api.getArenaName(player.trophies);
    
    // Get current deck
    const currentDeck = player.currentDeck || [];
    const deckHtml = currentDeck.map(card => `
        <div class="bg-white rounded-lg p-3 shadow-clash border border-gray-200 text-center">
            <div class="text-xs text-gray-500 mb-1">Level ${card.level}</div>
            <div class="font-bold text-gray-800">${card.name}</div>
        </div>
    `).join('') || '<p class="text-gray-500">No deck information available</p>';

    // Get badges
    const badgesHtml = player.badges ? player.badges.map(badge => `
        <div class="bg-white rounded-lg p-3 shadow-clash border border-gray-200 text-center">
            <div class="text-2xl mb-2">${badge.iconUrls?.medium ? `<img src="${badge.iconUrls.medium}" class="w-8 h-8 mx-auto">` : '🏆'}</div>
            <div class="text-xs font-bold text-gray-800">${badge.name || 'Badge'}</div>
            <div class="text-xs text-gray-500">${badge.level || ''}</div>
        </div>
    `).join('') : '<p class="text-gray-500">No badges</p>';

    document.getElementById('playerInfo').innerHTML = `
        <div class="bg-white rounded-2xl shadow-clash overflow-hidden mb-8">
            <!-- Player Header -->
            <div class="bg-gradient-to-r from-clash-blue to-clash-dark text-white p-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                            ${player.expLevel}
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">${player.name}</h2>
                            <p class="opacity-90">${player.tag}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-bold">${api.formatNumber(player.trophies)}</div>
                        <div class="opacity-90">Trophies</div>
                    </div>
                </div>
            </div>

            <!-- Player Stats -->
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-clash-light rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-clash-blue">${api.formatNumber(player.bestTrophies)}</div>
                        <div class="text-sm text-gray-600">Best Trophies</div>
                    </div>
                    <div class="bg-clash-light rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-clash-blue">${player.wins || 0}</div>
                        <div class="text-sm text-gray-600">Wins</div>
                    </div>
                    <div class="bg-clash-light rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-clash-blue">${player.losses || 0}</div>
                        <div class="text-sm text-gray-600">Losses</div>
                    </div>
                    <div class="bg-clash-light rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-clash-blue">${arenaName}</div>
                        <div class="text-sm text-gray-600">Arena</div>
                    </div>
                </div>

                <!-- Clan Info -->
                ${player.clan ? `
                <div class="bg-clash-light rounded-xl p-4 mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i class="fas fa-users text-clash-blue"></i> Clan
                    </h3>
                    <div class="flex items-center gap-3">
                        ${player.clan.badgeUrls?.small ? 
                            `<img src="${player.clan.badgeUrls.small}" class="w-10 h-10 rounded-full">` : 
                            `<div class="w-10 h-10 bg-clash-blue rounded-full flex items-center justify-center text-white">C</div>`
                        }
                        <div>
                            <div class="font-bold text-gray-800">${player.clan.name}</div>
                            <div class="text-sm text-gray-600">${player.clan.tag} • ${player.role || 'Member'}</div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Current Deck -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i class="fas fa-layer-group text-clash-blue"></i> Current Deck
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        ${deckHtml}
                    </div>
                </div>

                <!-- Badges -->
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i class="fas fa-award text-clash-blue"></i> Badges
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        ${badgesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}