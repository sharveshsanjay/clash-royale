document.addEventListener("DOMContentLoaded", () => {
    const loadingEl = document.getElementById("loading");
    const errorEl = document.getElementById("error");
    const contentEl = document.getElementById("content");

    const promotionEl = document.getElementById("promotionBoard");
    const nominationEl = document.getElementById("nominationBoard");
    const kickEl = document.getElementById("kickBoard");

    init();

    async function init() {
        try {
            const members = await loadMembersSafe();
            evaluateMembers(members);

            loadingEl.classList.add("hidden");
            contentEl.classList.remove("hidden");
        } catch (err) {
            console.error(err);
            loadingEl.classList.add("hidden");
            errorEl.classList.remove("hidden");
        }
    }

    async function loadMembersSafe() {
        try {
            const result = await api.getMembers();
            return result?.items || [];
        } catch {
            return [];
        }
    }

    function evaluateMembers(members) {

        // ❌ Exclude Leader & Co-Leader (same as capital)
        const filtered = members.filter(
            m => m.role !== "leader" && m.role !== "coLeader"
        );

        // Averages (EXACT same)
        const avgTrophies = avg(filtered, m => m.trophies);
        const avgDonations = avg(filtered, m => m.donations);
        const avgSupport = avg(filtered, m =>
            (m.donations || 0) + (m.donationsReceived || 0)
        );
        const avgContribution = avg(filtered, m =>
            m.donations * 2 +
            (m.donationsReceived || 0) +
            Math.round((m.trophies || 0) / 100) +
            (m.expLevel || 0)
        );

        // Score members (EXACT same rules)
        const evaluated = filtered.map(m => {
            let score = 0;
            let reasons = [];

            if ((m.donations || 0) === 0) {
                score += 3; reasons.push("No Donations");
            } else if (m.donations < avgDonations / 2) {
                score += 1; reasons.push("Low Donations");
            }

            if ((m.donationsReceived || 0) === 0) {
                score += 1; reasons.push("No Donations Received");
            }

            if ((m.trophies || 0) < avgTrophies * 0.7) {
                score += 2; reasons.push("Very Low Trophies");
            } else if ((m.trophies || 0) < avgTrophies) {
                score += 1; reasons.push("Below Average Trophies");
            }

            if ((m.donations || 0) + (m.donationsReceived || 0) < avgSupport / 2) {
                score += 1; reasons.push("Low Support Activity");
            }

            if (
                (m.donations * 2 +
                    (m.donationsReceived || 0) +
                    Math.round((m.trophies || 0) / 100) +
                    (m.expLevel || 0)) < avgContribution * 0.6
            ) {
                score += 2; reasons.push("Low Contribution");
            }

            return { ...m, violationScore: score, violationReasons: reasons };
        });

        renderPromotions(evaluated);
        renderNominations(evaluated);
        renderKickList(evaluated);
    }

    /* ---------------- PROMOTIONS (NEW) ---------------- */

    function renderPromotions(list) {
        const promoted = [...list]
            .filter(m => m.violationScore === 0)
            .sort((a, b) => b.donations - a.donations)
            .slice(0, 5);

        promotionEl.innerHTML = `
            <h3 class="text-lg font-bold text-emerald-700 flex items-center gap-2">
                <i class="fa-solid fa-arrow-up"></i>
                Promotion / Reward List
            </h3>
            <p class="text-sm text-emerald-600 mb-2">
                Members with zero violations and strong support activity.
            </p>
            ${renderList(promoted, "emerald")}
        `;
    }

    /* ---------------- NOMINATION (Week 1) ---------------- */

    function renderNominations(list) {
        const offenders = list
            .filter(m => m.violationScore > 2)
            .sort((a, b) => b.violationScore - a.violationScore);

        nominationEl.innerHTML = `
            <h3 class="text-lg font-bold text-red-600 flex items-center gap-2">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Members Under Nomination (Week 1)
            </h3>
            <p class="text-sm text-red-500 mb-2">
                Failed to meet clan contribution rules.
            </p>
            ${renderList(offenders, "red")}
        `;
    }

    /* ---------------- KICK LIST (Week 2) ---------------- */

    function renderKickList(list) {
    const kickList = [...list]
        .sort((a, b) => {
            // 1️⃣ Higher violations first
            if (b.violationScore !== a.violationScore) {
                return b.violationScore - a.violationScore;
            }

            // 2️⃣ If same violations → lower rank first (worse player)
            return (b.clanRank || 50) - (a.clanRank || 50);
        })
        .slice(0, 5);

    kickEl.innerHTML = `
        <h3 class="text-lg font-bold text-yellow-700 flex items-center gap-2">
            <i class="fa-solid fa-user-xmark"></i>
            Demote / Kick List (Week 2)
        </h3>
        <p class="text-sm text-yellow-600 mb-2">
            Lowest-performing members this week.
        </p>
        ${renderList(kickList, "yellow")}
    `;
}


    /* ---------------- UI HELPERS ---------------- */

    function renderList(list, color) {
        if (!list.length)
            return `<p class="text-sm text-gray-500">No members listed.</p>`;

        return `
            <ul class="space-y-3">
                ${list.map(m => `
                    <li class="bg-white border border-gray-200 rounded-xl p-3 text-sm">
                        <div class="font-semibold text-gray-900">
                            ${m.name}
                            <span class="text-xs text-gray-500">(${m.tag})</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            Violations: <b class="text-${color}-600">${m.violationScore}</b>
                        </div>
                        <div class="text-xs text-gray-500">
                            Reasons: ${m.violationReasons.join(", ")}
                        </div>
                    </li>
                `).join("")}
            </ul>
        `;
    }

    function avg(arr, fn) {
        if (!arr.length) return 0;
        return arr.reduce((s, x) => s + (fn(x) || 0), 0) / arr.length;
    }
});
