document.addEventListener("DOMContentLoaded", async () => {
    console.log("🃏 Cards page initialized");

    // STATE
    let allCards = [];
    let filteredCards = [];
    let displayed = 40;

    let filters = {
        search: "",
        rarity: "all",
        type: "all",
        elixir: "all"
    };

    // DOM
    const loading = document.getElementById("loading");
    const errorEl = document.getElementById("error");
    const errorMsg = document.getElementById("errorMessage");
    const cardsContainer = document.getElementById("cardsContainer");
    const noResults = document.getElementById("noResults");
    const cardCountBadge = document.getElementById("cardCountBadge");
    const filterInfo = document.getElementById("filterInfo");
    const loadMoreBtn = document.getElementById("loadMoreBtn");

    const cardSearch = document.getElementById("cardSearch");
    const rarityFilter = document.getElementById("rarityFilter");
    const typeFilter = document.getElementById("typeFilter");
    const sortFilter = document.getElementById("sortFilter");
    const elixirButtons = document.querySelectorAll("[data-elixir]");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    // Load Cards JSON
    await loadCards();
    setupEvents();

    async function loadCards() {
        try {
            showLoading();

            const res = await fetch("js/cr-cards.json");
            const data = await res.json();

            allCards = data.items || [];
            console.log("Loaded cards:", allCards.length);

            applyFilters();
            hideLoading();

        } catch (err) {
            console.error(err);
            showError("Failed to load card database.");
        }
    }

    function setupEvents() {
        cardSearch.addEventListener("input", () => {
            filters.search = cardSearch.value.toLowerCase().trim();
            applyFilters();
        });

        rarityFilter.addEventListener("change", () => {
            filters.rarity = rarityFilter.value;
            applyFilters();
        });

        typeFilter.addEventListener("change", () => {
            filters.type = typeFilter.value;
            applyFilters();
        });

        sortFilter.addEventListener("change", applyFilters);

        elixirButtons.forEach(btn =>
            btn.addEventListener("click", function () {
                elixirButtons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                filters.elixir = this.dataset.elixir;
                applyFilters();
            })
        );

        clearFiltersBtn.addEventListener("click", () => {
            cardSearch.value = "";
            rarityFilter.value = "all";
            typeFilter.value = "all";
            sortFilter.value = "name";
            elixirButtons.forEach(b => b.classList.remove("active"));
            document.querySelector("[data-elixir='all']").classList.add("active");

            filters = { search: "", rarity: "all", type: "all", elixir: "all" };
            applyFilters();
        });

        loadMoreBtn.addEventListener("click", () => {
            displayed += 40;
            renderCards();
        });
    }

    function applyFilters() {
        filteredCards = [...allCards];

        if (filters.search) {
            filteredCards = filteredCards.filter(c =>
                c.name.toLowerCase().includes(filters.search)
            );
        }

        if (filters.rarity !== "all") {
            filteredCards = filteredCards.filter(c =>
                (c.rarity || "").toLowerCase() === filters.rarity.toLowerCase()
            );
        }

        if (filters.type !== "all") {
            filteredCards = filteredCards.filter(c =>
                (c.type || "").toLowerCase() === filters.type.toLowerCase()
            );
        }

        if (filters.elixir !== "all") {
            if (filters.elixir === "7") {
                filteredCards = filteredCards.filter(c => c.elixir >= 7);
            } else {
                filteredCards = filteredCards.filter(c => c.elixir == filters.elixir);
            }
        }

        sortCards();
        displayed = 40;
        updateInfo();
        renderCards();
    }

    function sortCards() {
        if (sortFilter.value === "name") {
            filteredCards.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortFilter.value === "elixir") {
            filteredCards.sort((a, b) => (a.elixir ?? 0) - (b.elixir ?? 0));
        } else if (sortFilter.value === "rarity") {
            filteredCards.sort((a, b) => (a.rarity || "").localeCompare(b.rarity || ""));
        }
    }

    function updateInfo() {
        cardCountBadge.textContent = filteredCards.length;
        filterInfo.textContent = `Showing ${filteredCards.length} cards`;
    }

    function renderCards() {
        if (!filteredCards.length) {
            noResults.classList.remove("hidden");
            cardsContainer.innerHTML = "";
            return;
        }

        noResults.classList.add("hidden");

        const visible = filteredCards.slice(0, displayed);

        cardsContainer.innerHTML = visible
            .map(c => cardTemplate(c))
            .join("");

        loadMoreBtn.classList.toggle("hidden", displayed >= filteredCards.length);
    }
    

    function cardTemplate(c) {
    return `
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition p-4">

            <h3 class="text-lg font-bold text-gray-800 mb-2 text-center">${c.name}</h3>

            <div class="aspect-square rounded-lg bg-gray-100 overflow-hidden mb-3 flex items-center justify-center">
                <img src="${c.iconUrls?.medium || ''}" class="w-4/5 object-contain" />
            </div>

            <div class="flex justify-center">
                <span class="text-sm font-semibold px-3 py-1 bg-gray-100 border border-gray-300 rounded-full">
                    ${c.rarity || "Card"}
                </span>
            </div>

        </div>
    `;
}


    // UI Helper functions
    function showLoading() { loading.classList.remove("hidden"); }
    function hideLoading() { loading.classList.add("hidden"); }

    function showError(msg) {
        errorEl.classList.remove("hidden");
        errorMsg.textContent = msg;
    }
});
