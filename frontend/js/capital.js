// Capital Page Script
document.addEventListener('DOMContentLoaded', async function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Load capital data
    await loadCapitalData();
});

async function loadCapitalData() {
    try {
        const capitalData = await api.getCapital();
        displayCapitalInfo(capitalData);
        
    } catch (error) {
        console.error('Error loading capital data:', error);
        showError('Failed to load clan capital data. Please try again.');
    }
}

function displayCapitalInfo(capital) {
    // Hide loading, show content
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('capitalInfo').classList.remove('hidden');

    // Generate districts HTML
    const districtsHtml = capital.districts ? capital.districts.map(district => `
        <div class="bg-white rounded-xl p-5 shadow-clash border border-gray-200 hover:shadow-clash-hover transition">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-bold text-gray-800">${district.name}</h3>
                <span class="bg-clash-blue text-white text-sm font-bold px-3 py-1 rounded-full">
                    Level ${district.level}
                </span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-map-marker-alt text-clash-blue"></i>
                <span>District ${district.id}</span>
            </div>
        </div>
    `).join('') : '<p class="text-gray-500">No districts available</p>';

    document.getElementById('capitalInfo').innerHTML = `
        <div class="max-w-6xl mx-auto">
            <!-- Capital Header -->
            <div class="bg-gradient-to-r from-clash-blue to-clash-dark text-white rounded-2xl p-6 mb-8 shadow-clash">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">Capital Hall</h2>
                        <div class="flex items-center gap-4">
                            <div class="text-5xl font-bold">${capital.capitalHallLevel}</div>
                            <div class="text-lg opacity-90">Level</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-bold">${api.formatNumber(capital.clanCapitalTrophies)}</div>
                        <div class="opacity-90">Capital Trophies</div>
                    </div>
                </div>
            </div>

            <!-- Capital Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white rounded-xl p-6 text-center shadow-clash border border-gray-200">
                    <div class="w-16 h-16 bg-gradient-to-br from-clash-blue to-clash-dark rounded-full flex items-center justify-center text-white text-2xl mb-4 mx-auto">
                        <i class="fas fa-chess-rook"></i>
                    </div>
                    <h3 class="text-xl font-bold text-clash-blue mb-2">Capital Hall</h3>
                    <div class="text-3xl font-bold text-gray-800 mb-2">Level ${capital.capitalHallLevel}</div>
                    <p class="text-gray-500">Main Capital Building</p>
                </div>

                <div class="bg-white rounded-xl p-6 text-center shadow-clash border border-gray-200">
                    <div class="w-16 h-16 bg-gradient-to-br from-clash-blue to-clash-dark rounded-full flex items-center justify-center text-white text-2xl mb-4 mx-auto">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3 class="text-xl font-bold text-clash-blue mb-2">Capital Trophies</h3>
                    <div class="text-3xl font-bold text-gray-800 mb-2">${api.formatNumber(capital.clanCapitalTrophies)}</div>
                    <p class="text-gray-500">Total Trophies</p>
                </div>

                <div class="bg-white rounded-xl p-6 text-center shadow-clash border border-gray-200">
                    <div class="w-16 h-16 bg-gradient-to-br from-clash-blue to-clash-dark rounded-full flex items-center justify-center text-white text-2xl mb-4 mx-auto">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="text-xl font-bold text-clash-blue mb-2">Capital League</h3>
                    <div class="text-3xl font-bold text-gray-800 mb-2">${capital.clanCapitalLeague?.name || 'Unranked'}</div>
                    <p class="text-gray-500">Current League</p>
                </div>
            </div>

            <!-- Districts -->
            <div class="mb-8">
                <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <i class="fas fa-map-marked-alt text-clash-blue"></i> Districts
                    <span class="text-sm bg-clash-light text-clash-blue px-3 py-1 rounded-full">
                        ${capital.districts?.length || 0} Total
                    </span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${districtsHtml}
                </div>
            </div>

            <!-- Capital Info -->
            <div class="bg-clash-light rounded-xl p-6 border border-clash-blue/20">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i class="fas fa-info-circle text-clash-blue"></i> About Clan Capital
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-bold text-gray-800 mb-2">What is Clan Capital?</h4>
                        <p class="text-gray-600">
                            The Clan Capital is a shared village where clan members work together to build and upgrade structures, 
                            then attack other clan capitals during Raid Weekends.
                        </p>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 mb-2">How to Participate</h4>
                        <ul class="text-gray-600 space-y-1">
                            <li>• Donate Capital Gold to upgrade buildings</li>
                            <li>• Attack during Raid Weekends (Fridays to Mondays)</li>
                            <li>• Earn Capital Trophies for your clan</li>
                            <li>• Unlock new districts as you progress</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('capitalInfo').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    
    document.getElementById('errorMessage').textContent = message;
}