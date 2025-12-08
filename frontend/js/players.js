// Players Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Players page initialized');
    
    // DOM Elements
    const playerSearchForm = document.getElementById('playerSearchForm');
    const playerTagInput = document.getElementById('playerTagInput');
    const playerInfoEl = document.getElementById('playerInfo');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const errorTitleEl = document.getElementById('errorTitle');
    const errorMessageEl = document.getElementById('errorMessage');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const recentSearchesEl = document.getElementById('recentSearches');
    const recentSearchesListEl = document.getElementById('recentSearchesList');

    // Recent searches from localStorage
    let recentSearches = JSON.parse(localStorage.getItem('clashRecentSearches') || '[]');

    // Initialize
    init();

    function init() {
        // Mobile Menu Toggle
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Setup form submission
        if (playerSearchForm) {
            playerSearchForm.addEventListener('submit', handlePlayerSearch);
        }

        // Check if player tag is in localStorage (from members page)
        const savedTag = localStorage.getItem('playerTag');
        if (savedTag && playerTagInput) {
            playerTagInput.value = savedTag;
            searchPlayer(savedTag);
            localStorage.removeItem('playerTag');
        }

        // Load recent searches
        loadRecentSearches();
    }

    async function handlePlayerSearch(e) {
        e.preventDefault();
        
        if (!playerTagInput) return;
        
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
            
            console.log('🔍 Searching player:', playerTag);
            const playerData = await api.getPlayer(playerTag);
            
            console.log('✅ Player found:', playerData.name);
            displayPlayerInfo(playerData);
            
            // Save to recent searches
            addToRecentSearches(playerTag, playerData.name);
            
        } catch (error) {
            console.error('❌ Error searching player:', error);
            
            let errorTitle = 'Search Failed';
            let errorMsg = error.message || 'Player not found or API error.';
            
            if (error.message.includes('404')) {
                errorTitle = 'Player Not Found';
                errorMsg = `Player with tag ${playerTag} not found.`;
            } else if (error.message.includes('403')) {
                errorTitle = 'API Error';
                errorMsg = 'API key error. Please try again later.';
            } else if (error.message.includes('Network')) {
                errorTitle = 'Network Error';
                errorMsg = 'Cannot connect to server. Check your internet connection.';
            }
            
            showError(errorTitle, errorMsg);
        }
    }

    function showLoading() {
        if (loadingEl) loadingEl.classList.remove('hidden');
        if (playerInfoEl) playerInfoEl.classList.add('hidden');
        if (errorEl) errorEl.classList.add('hidden');
    }

    function hideLoading() {
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    function showError(title, message) {
        hideLoading();
        if (playerInfoEl) playerInfoEl.classList.add('hidden');
        if (errorEl) {
            errorEl.classList.remove('hidden');
            if (errorTitleEl) errorTitleEl.textContent = title;
            if (errorMessageEl) errorMessageEl.textContent = message;
        }
    }

    function displayPlayerInfo(player) {
        hideLoading();
        if (errorEl) errorEl.classList.add('hidden');
        if (playerInfoEl) {
            playerInfoEl.classList.remove('hidden');
            
            const arenaName = api.getArenaName(player.trophies);
            const arenaIcon = api.getArenaIcon(player.trophies);
            
            // Get current deck
            const currentDeck = player.currentDeck || player.cards || [];
            const deckHtml = currentDeck.slice(0, 8).map(card => `
                <div class="bg-white rounded-lg p-3 shadow-clash border border-gray-200 text-center">
                    <div class="text-xs text-gray-500 mb-1">Level ${card.level || '?'}</div>
                    <div class="font-bold text-gray-800 text-sm">${card.name}</div>
                </div>
            `).join('') || '<p class="text-gray-500 col-span-4">No deck information available</p>';

            // Get badges
            const badgesHtml = player.badges ? player.badges.slice(0, 6).map(badge => `
                <div class="bg-white rounded-lg p-3 shadow-clash border border-gray-200 text-center">
                    <div class="text-lg mb-2">${badge.iconUrls?.medium ? `<img src="${badge.iconUrls.medium}" class="w-8 h-8 mx-auto">` : '🏆'}</div>
                    <div class="text-xs font-bold text-gray-800">${badge.name || 'Badge'}</div>
                    <div class="text-xs text-gray-500">${badge.level || ''}</div>
                </div>
            `).join('') : '<p class="text-gray-500 col-span-2">No badges</p>';

            playerInfoEl.innerHTML = `
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
                        ${player.badges && player.badges.length > 0 ? `
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <i class="fas fa-award text-clash-blue"></i> Badges
                            </h3>
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                ${badgesHtml}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    }

    function addToRecentSearches(tag, name) {
        // Remove if already exists
        recentSearches = recentSearches.filter(search => search.tag !== tag);
        
        // Add to beginning
        recentSearches.unshift({
            tag: tag,
            name: name,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 5
        recentSearches = recentSearches.slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('clashRecentSearches', JSON.stringify(recentSearches));
        
        // Update UI
        loadRecentSearches();
    }

    function loadRecentSearches() {
        if (!recentSearchesEl || !recentSearchesListEl) return;
        
        if (recentSearches.length === 0) {
            recentSearchesEl.classList.add('hidden');
            return;
        }
        
        recentSearchesEl.classList.remove('hidden');
        
        recentSearchesListEl.innerHTML = recentSearches.map(search => `
            <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer" onclick="searchRecent('${search.tag}')">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-clash-blue rounded-full flex items-center justify-center text-white text-sm">
                        ${search.name.charAt(0)}
                    </div>
                    <div>
                        <div class="font-medium text-gray-800">${search.name}</div>
                        <div class="text-xs text-gray-500">${search.tag}</div>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-gray-400"></i>
            </div>
        `).join('');
    }

    // Global function for recent search click
    window.searchRecent = function(tag) {
        if (playerTagInput) {
            playerTagInput.value = tag;
            searchPlayer(tag);
        }
    };
});