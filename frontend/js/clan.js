// ================================
// CLAN PAGE SCRIPT (COLORFUL EDITION)
// ================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🏰 Clan Page Loaded (Colorful Edition)");

    // DOM SELECTORS
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const errorMsg = document.getElementById("errorMessage");
    const clanContent = document.getElementById("clanContent");

    const clanHeader = document.getElementById("clanHeader");
    const clanStats = document.getElementById("clanStats");
    const warStats = document.getElementById("warStats");
    const clanDescription = document.getElementById("clanDescription");
    const topFiveContainer = document.getElementById("topFive");

    init();

    // MAIN INIT
    async function init() {
        try {
            utils.showLoading("loading", "Loading clan data...");

            const clan = await api.getClanSquad();
            if (!clan) throw new Error("Clan data unavailable");

            renderHeader(clan);
            renderClanStats(clan);
            renderWarStats(clan);
            renderClanDescription(clan);

            const members = await loadMembers();
            if (members.length > 0) renderTopFive(members);

            loading.classList.add("hidden");
            clanContent.classList.remove("hidden");

        } catch (e) {
            console.error(e);
            loading.classList.add("hidden");
            error.classList.remove("hidden");
            errorMsg.textContent = e.message;
        }
    }

    // FETCH MEMBERS (auto endpoint)
    async function loadMembers() {
        let members = [];

        try {
            members = await api.getClanMembers(api.clanTag);
        } catch (err) {
            console.warn("Members endpoint failed:", err);
        }

        if (!Array.isArray(members)) {
            console.warn("⚠️ Members not returned as array.");
            return [];
        }

        return members;
    }

    // ================================
    // COLORFUL HEADER
    // ================================
    function renderHeader(clan) {
        const clanScore = clan.clanScore || clan.clanPoints || 0;

        const badge =
            clan.badgeUrls?.large ||
            clan.badgeUrls?.medium ||
            clan.badgeUrls?.small ||
            "images/clan-logo.png";

        const warFrequency = clan.warFrequency || "96%";

        clanHeader.innerHTML = `
        <div class="rounded-2xl shadow-xl p-8 text-white relative overflow-hidden"
             style="background: linear-gradient(135deg, #0063ff, #003fbb);">

            <!-- Decorative Logo Background -->
            <img src="images/cr-logo.png" 
                 class="absolute right-0 top-0 opacity-10 w-60 pointer-events-none"/>

            <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

                <!-- LEFT: BADGE + NAME -->
                <div class="flex items-center gap-6">
                    <img src="${badge}" 
                         class="w-24 h-24 rounded-2xl border-4 border-white/40 shadow-lg backdrop-blur"/>

                    <div>
                        <h1 class="text-4xl font-extrabold drop-shadow">${clan.name}</h1>

                        <p class="text-white/80 mt-1">${clan.tag}</p>

                        <span class="inline-block mt-2 bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-full shadow">
                            ${clan.requiredTrophies}+ Required
                        </span>
                    </div>
                </div>

                <!-- RIGHT: SCORE -->
                <div class="text-center md:text-right">
                    <p class="text-5xl font-extrabold drop-shadow">${api.formatNumber(clanScore)}</p>
                    <p class="text-white/80">Clan Score</p>
                </div>

            </div>

            <!-- QUICK STATS -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">

                <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20">
                    <p class="text-2xl font-bold drop-shadow">${clan.members}/50</p>
                    <p class="text-white/80 text-xs">Members</p>
                </div>

                <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20">
                    <p class="text-2xl font-bold drop-shadow capitalize">${clan.type}</p>
                    <p class="text-white/80 text-xs">Type</p>
                </div>

                <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20">
                    <p class="text-2xl font-bold drop-shadow">${clan.location?.name || "Global"}</p>
                    <p class="text-white/80 text-xs">Region</p>
                </div>

                <div class="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20">
                    <p class="text-2xl font-bold drop-shadow">${warFrequency}</p>
                    <p class="text-white/80 text-xs">War Frequency</p>
                </div>

            </div>

        </div>`;
    }

    // ================================
    // COLORFUL CLAN STATS
    // ================================
    function renderClanStats(clan) {
        const clanScore = clan.clanScore || clan.clanPoints || 0;

        clanStats.innerHTML = `
            <div class="grid md:grid-cols-2 gap-4">

                <div class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between">
                    <span class="text-gray-600">Clan Score</span>
                    <span class="text-royale-blue font-bold">${api.formatNumber(clanScore)}</span>
                </div>

                <div class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between">
                    <span class="text-gray-600">Required Trophies</span>
                    <span class="text-royale-blue font-bold">${clan.requiredTrophies}</span>
                </div>

                <div class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between">
                    <span class="text-gray-600">Type</span>
                    <span class="text-royale-blue font-bold capitalize">${clan.type}</span>
                </div>

                <div class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between">
                    <span class="text-gray-600">Region</span>
                    <span class="text-royale-blue font-bold">${clan.location?.name || "Global"}</span>
                </div>

            </div>
        `;
    }

    // ================================
    // COLORFUL WAR STATS
    // ================================
    function renderWarStats(clan) {
        const warTrophies = clan.warTrophies || clan.clanWarTrophies || 0;
        const warWins = clan.warWins || clan.wins || "—";
        const warWinStreak = clan.warWinStreak || clan.winStreak || "—";
        const warLeague = clan.warLeague?.name || "Unranked";

        warStats.innerHTML = `
            <div class="grid md:grid-cols-2 gap-4">

                <div class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between">
                    <span class="text-gray-600">War Trophies</span>
                    <span class="text-green-600 font-bold">${warTrophies}</span>
                </div>

                <div class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between">
                    <span class="text-gray-600">War Wins</span>
                    <span class="text-green-600 font-bold">${warWins}</span>
                </div>

                <div class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between">
                    <span class="text-gray-600">Win Streak</span>
                    <span class="text-yellow-500 font-bold">${warWinStreak}</span>
                </div>

                <div class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between">
                    <span class="text-gray-600">War League</span>
                    <span class="text-royale-blue font-bold">${warLeague}</span>
                </div>

            </div>
        `;
    }

    // ================================
    // DESCRIPTION
    // ================================
    function renderClanDescription(clan) {
        clanDescription.innerHTML = `
            <div class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 class="text-xl font-bold mb-3 text-royale-blue">Clan Description</h3>
                <p class="text-gray-700 leading-relaxed">
                    ${clan.description || "No description available."}
                </p>
            </div>
        `;
    }

    // ================================
    // TOP 5 MEMBERS
    // ================================
    function renderTopFive(members) {
        const top = [...members]
            .sort((a,b) => b.trophies - a.trophies)
            .slice(0, 5);

        topFiveContainer.innerHTML = top.map(m => `
            <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow hover:shadow-md transition">
                <img src="images/profile-icon.png" class="w-12 h-12 rounded-full bg-gray-100">
                <div>
                    <p class="font-bold text-gray-900">${m.name}</p>
                    <p class="text-sm text-gray-500">${m.trophies} Trophies</p>
                </div>
            </div>
        `).join("");
    }
});
