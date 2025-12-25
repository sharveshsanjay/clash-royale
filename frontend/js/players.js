document.addEventListener("DOMContentLoaded", () => {
    /* ---------- NAV ---------- */
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
            const icon = mobileMenuBtn.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-bars");
                icon.classList.toggle("fa-xmark");
            }
        });
    }

    /* ---------- ELEMENTS ---------- */
    const form = document.getElementById("playerSearchForm");
    const tagInput = document.getElementById("playerTagInput");

    const loadingEl = document.getElementById("playerLoading");
    const errorEl = document.getElementById("playerError");
    const errorMsgEl = document.getElementById("playerErrorMessage");
    const retryBtn = document.getElementById("playerRetryBtn");
    const playerView = document.getElementById("playerView");

    const playerNameEl = document.getElementById("playerName");
    const playerTagEl = document.getElementById("playerTag");
    const playerAvatarEl = document.getElementById("playerAvatar");
    const playerClanEl = document.getElementById("playerClan");
    const playerRoleEl = document.getElementById("playerRole");
    const playerLevelEl = document.getElementById("playerLevel");
    const playerTrophiesEl = document.getElementById("playerTrophies");
    const playerBestTrophiesEl = document.getElementById("playerBestTrophies");
    const playerArenaEl = document.getElementById("playerArena");

    const playerWinsEl = document.getElementById("playerWins");
    const playerLossesEl = document.getElementById("playerLosses");
    const playerThreeCrownsEl = document.getElementById("playerThreeCrowns");
    const playerStarPointsEl = document.getElementById("playerStarPoints");

    const favouriteCardNameEl = document.getElementById("playerFavouriteCard");
    const favouriteCardImageWrapper = document.getElementById("favoriteCardImageWrapper");

    const deckContainer = document.getElementById("deckContainer");
    const avgElixirWrapper = document.getElementById("averageElixir");
    const avgElixirValueEl = document.getElementById("averageElixirValue");

    const battleLogContainer = document.getElementById("battleLogContainer");
    const chestContainer = document.getElementById("chestContainer");


    /* ---------- CARD JSON INDEX ---------- */
    let cardsData = [];
    let cardsIndex = null;

    async function loadCardsData() {
        if (cardsIndex) return cardsIndex;

        try {
            const res = await fetch("js/cr-cards.json");
            const data = await res.json();

            cardsData = Array.isArray(data.items) ? data.items : [];
            cardsIndex = {};

            cardsData.forEach(card => {
                if (!card || !card.name) return;
                const key = normalizeCardName(card.name);
                cardsIndex[key] = card;
            });

            console.log("Cards loaded:", cardsData.length);
            return cardsIndex;
        } catch (err) {
            console.error("Failed to load cr-cards.json", err);
            cardsData = [];
            cardsIndex = {};
            return cardsIndex;
        }
    }

    function normalizeCardName(name) {
        return name.toLowerCase().replace(/\./g, "").replace(/[^a-z0-9]+/g, "");
    }

    function getCardMetaByName(name) {
        if (!name || !cardsIndex) return null;
        const key = normalizeCardName(name);
        return cardsIndex[key] || null;
    }

    /* ---------- UI HELPERS ---------- */
    function setLoading(isLoading) {
        if (!loadingEl || !playerView || !errorEl) return;

        if (isLoading) {
            loadingEl.classList.remove("hidden");
            playerView.classList.add("hidden");
            errorEl.classList.add("hidden");
        } else {
            loadingEl.classList.add("hidden");
        }
    }

    function showError(message) {
        if (!errorEl || !errorMsgEl || !playerView) return;
        errorMsgEl.textContent = message || "Unknown error";
        errorEl.classList.remove("hidden");
        playerView.classList.add("hidden");
        loadingEl.classList.add("hidden");
    }

    function showPlayerView() {
        if (!playerView || !errorEl || !loadingEl) return;
        playerView.classList.remove("hidden");
        errorEl.classList.add("hidden");
        loadingEl.classList.add("hidden");
    }

    /* ---------- RENDER PLAYER INFO ---------- */
    function renderPlayerInfo(player) {
        playerNameEl.textContent = player.name || "Unknown";
        playerTagEl.textContent = player.tag || "";

        // Avatar – you can later change this to favourite card or league image
        playerAvatarEl.src = "images/profile-icon.png";

        // Clan
        if (player.clan) {
            playerClanEl.textContent = player.clan.name;
            playerClanEl.className =
                "inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs";
        } else {
            playerClanEl.textContent = "No Clan";
            playerClanEl.className =
                "inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs";
        }

        // Role
        const roleRaw = player.clan?.role;
        if (roleRaw) {
            const prettyRole = roleRaw
                .replace("coLeader", "Co-Leader")
                .replace("elder", "Elder")
                .replace("leader", "Leader")
                .replace("member", "Member");
            playerRoleEl.textContent = prettyRole;
            playerRoleEl.className =
                "inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs";
        } else {
            playerRoleEl.textContent = "—";
            playerRoleEl.className =
                "inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs";
        }

        playerLevelEl.textContent = player.expLevel ?? "—";
        playerTrophiesEl.textContent = player.trophies ?? "—";
        playerBestTrophiesEl.textContent = player.bestTrophies ?? "—";
        playerArenaEl.textContent = player.arena?.name || "—";

        playerWinsEl.textContent = player.wins ?? "—";
        playerLossesEl.textContent = player.losses ?? "—";
        playerThreeCrownsEl.textContent = player.threeCrownWins ?? "—";
        playerStarPointsEl.textContent = player.starPoints ?? "—";
    }

    /* ---------- RENDER BATTLE LOG ---------- */
    function renderBattleLog(battles = []) {
        battleLogContainer.innerHTML = "";

        if (!battles.length) {
            battleLogContainer.innerHTML =
                `<p class="text-sm text-gray-500 text-center">No recent battles.</p>`;
            return;
        }

        battles.slice(0, 10).forEach(battle => {
            const team = battle.team?.[0];
            const opp = battle.opponent?.[0];
            const isWin = team && opp && team.crowns > opp.crowns;

            const div = document.createElement("div");
            div.className =
                "flex justify-between items-center border border-gray-200 rounded-xl p-3";

            div.innerHTML = `
            <div>
                <div class="text-sm font-semibold">
                    ${battle.gameMode?.name || "Battle"}
                </div>
                <div class="text-xs text-gray-500">
                    ${battle.arena?.name || "—"}
                </div>
            </div>

            <div class="text-right">
                <div class="text-sm font-bold ${isWin ? "text-emerald-600" : "text-red-600"
                }">
                    ${isWin ? "WIN" : "LOSS"}
                </div>
                ${typeof battle.trophyChange === "number"
                    ? `<div class="text-xs text-gray-500">
                            ${battle.trophyChange > 0 ? "+" : ""}${battle.trophyChange}
                          </div>`
                    : ""
                }
            </div>
        `;
            battleLogContainer.appendChild(div);
        });
    }



    function renderUpcomingChests(data) {
        chestContainer.innerHTML = "";

        const chests = data?.items || [];

        if (!chests.length) {
            chestContainer.innerHTML =
                `<p class="text-sm text-gray-500 col-span-full text-center">
                No chest data available.
             </p>`;
            return;
        }

        chests.slice(0, 10).forEach(chest => {
            const div = document.createElement("div");
            div.className =
                "border border-gray-200 rounded-xl p-3 text-center";

            div.innerHTML = `
            <div class="text-sm font-semibold text-gray-900">
                ${chest.name}
            </div>
            <div class="text-xs text-gray-500 mt-1">
                In ${chest.index + 1} battles
            </div>
        `;
            chestContainer.appendChild(div);
        });
    }


    /* ---------- RENDER FAVOURITE CARD ---------- */
    function renderFavouriteCard(player) {
        favouriteCardNameEl.textContent = "—";
        favouriteCardImageWrapper.innerHTML = "";

        if (!player.currentFavouriteCard) return;

        const favName = player.currentFavouriteCard.name;
        favouriteCardNameEl.textContent = favName;

        const meta = getCardMetaByName(favName);
        const imageUrl = meta?.iconUrls?.medium || null;

        if (imageUrl) {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = favName;
            img.className = "w-full h-full object-contain";
            favouriteCardImageWrapper.innerHTML = "";
            favouriteCardImageWrapper.appendChild(img);
        } else {
            favouriteCardImageWrapper.innerHTML = `
                <span class="text-xs font-bold text-gray-500">
                    ${favName.charAt(0).toUpperCase()}
                </span>
            `;
        }
    }

    /* ---------- RENDER DECK (B1 - PREMIUM VERTICAL) ---------- */
    function renderDeck(player) {
        deckContainer.innerHTML = "";

        const deck = Array.isArray(player.currentDeck) ? player.currentDeck : [];

        if (!deck.length) {
            deckContainer.innerHTML = `
                <p class="text-sm text-gray-500 col-span-full text-center">
                    This player has no active deck.
                </p>
            `;
            avgElixirWrapper.classList.add("hidden");
            return;
        }

        let totalElixir = 0;
        let elixirCount = 0;

        deck.forEach(card => {
            const name = card.name || "Unknown Card";
            const meta = getCardMetaByName(name) || {};
            const imageUrl = meta.iconUrls?.medium || null;

            // elixir cost
            const elixir =
                meta.elixirCost ??
                meta.elixir ??
                card.elixirCost ??
                null;

            if (typeof elixir === "number") {
                totalElixir += elixir;
                elixirCount++;
            }

            const cardDiv = document.createElement("div");
            cardDiv.className =
                "bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition p-3 flex flex-col";

            cardDiv.innerHTML = `
                <div class="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-3">
                    ${imageUrl
                    ? `<img src="${imageUrl}" alt="${name}" class="w-full h-full object-contain" />`
                    : `<span class="text-xl font-bold text-gray-500">${name.charAt(0)}</span>`
                }
                </div>
                <div class="flex-1 flex flex-col">
                    <div class="text-sm font-semibold text-gray-900 truncate">${name}</div>
                    <div class="mt-1 flex items-center justify-between text-xs text-gray-600">
                        <span>Level ${card.level ?? "?"}</span>
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            <i class="fas fa-droplet text-[10px]"></i>
                            ${elixir ?? "?"}
                        </span>
                    </div>
                </div>
            `;

            deckContainer.appendChild(cardDiv);
        });

        if (elixirCount > 0) {
            const avg = (totalElixir / elixirCount).toFixed(1);
            avgElixirValueEl.textContent = avg;
            avgElixirWrapper.classList.remove("hidden");
        } else {
            avgElixirWrapper.classList.add("hidden");
        }
    }

    /* ---------- FETCH PLAYER ---------- */
    async function fetchAndRenderPlayer(tag) {
        if (!tag) {
            showError("Please enter a valid player tag.");
            return;
        }

        setLoading(true);

        try {
            const cleanTag = tag.trim().toUpperCase();

            // Load card data (once)
            await loadCardsData();

            // Let api.js handle encoding (# → %23 and backend URL)
            const player = await api.getPlayer(cleanTag);

            renderPlayerInfo(player);
            renderFavouriteCard(player);
            renderDeck(player);

            api.getPlayerBattleLog(cleanTag)
                .then(renderBattleLog)
                .catch(() => renderBattleLog([]));

            api.getPlayerUpcomingChests(cleanTag)
                .then(renderUpcomingChests)
                .catch(() => renderUpcomingChests(null));



            showPlayerView();
        } catch (err) {
            console.error("Failed to load player:", err);
            showError(err?.message || "Unable to load player data.");
        } finally {
            setLoading(false);
        }
    }

    /* ---------- EVENTS ---------- */
    if (form && tagInput) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const tag = tagInput.value;
            fetchAndRenderPlayer(tag);
        });
    }

    if (retryBtn && tagInput) {
        retryBtn.addEventListener("click", () => {
            const tag = tagInput.value;
            fetchAndRenderPlayer(tag);
        });
    }

    // Optional: auto-load if ?tag= in URL
    const params = new URLSearchParams(window.location.search);
    const autoTag = params.get("tag");
    if (autoTag) {
        tagInput.value = autoTag;
        fetchAndRenderPlayer(autoTag);
    }
    const storedTag = localStorage.getItem("playerTag");
    if (storedTag && !autoTag) {   // avoid double loading
        tagInput.value = storedTag;
        fetchAndRenderPlayer(storedTag);
    }
});
