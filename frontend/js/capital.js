// CAPITAL PAGE – Members × Clan Relationship Dashboard
document.addEventListener("DOMContentLoaded", () => {
    console.log("🏛️ Capital page loaded");

    // DOM
    const loadingEl = document.getElementById("loading");
    const errorEl = document.getElementById("error");
    const errorMsgEl = document.getElementById("errorMessage");
    const contentEl = document.getElementById("capitalContent");

    const headerEl = document.getElementById("capitalHeader");
    const overviewEl = document.getElementById("capitalOverview");
    const relationshipBarsEl = document.getElementById("relationshipBars");
    const topContributorsEl = document.getElementById("topContributors");
    const topDonorsEl = document.getElementById("topDonors");
    const topTrophyPushersEl = document.getElementById("topTrophyPushers");
    const membersRelationshipEl = document.getElementById("membersRelationship");

    init();

    async function init() {
        try {
            showLoading(true);

            const [clan, members] = await Promise.all([
                api.getClanSquad(),
                loadMembersSafe()
            ]);

            if (!clan) throw new Error("Clan data not available");

            const enriched = enrichMembers(members || []);

            renderHeader(clan, enriched);
            renderOverview(clan, enriched);
            renderRelationshipBars(enriched);
            renderLeaderboards(enriched);
            renderMemberCards(enriched);
            renderNoticeBoard(enriched);

            showLoading(false);
        } catch (err) {
            console.error("❌ Capital error:", err);
            showError(err?.message || "Failed to load capital data");
        }
    }

    function showLoading(isLoading) {
        if (isLoading) {
            loadingEl.classList.remove("hidden");
            errorEl.classList.add("hidden");
            contentEl.classList.add("hidden");
        } else {
            loadingEl.classList.add("hidden");
            contentEl.classList.remove("hidden");
        }
    }

    function showError(msg) {
        loadingEl.classList.add("hidden");
        errorEl.classList.remove("hidden");
        errorMsgEl.textContent = msg;
    }

    async function loadMembersSafe() {
    try {
        const result = await api.getMembers();

        // result = { items: [...], paging: {...} }
        if (result && Array.isArray(result.items)) {
            return result.items;
        }

        console.warn("Members not array in capital:", result);
        return [];
    } catch (err) {
        console.warn("Members fetch failed in capital:", err);
        return [];
    }
}



    // Compute scores per member
    function enrichMembers(members) {
        return members.map(m => {
            const donations = m.donations || 0;
            const received = m.donationsReceived || 0;
            const trophies = m.trophies || 0;
            const level = m.expLevel || 0;
            const rank = m.clanRank || 50;

            const contributionScore =
                donations * 2 +
                received +
                Math.round(trophies / 100) +
                level;

            const supportScore = donations + received;

            const loyaltyScore =
                (51 - rank) * 3 + level; // better rank = higher loyalty

            const totalScore = contributionScore + loyaltyScore + supportScore;

            const badge = getMemberBadge({ donations, received, trophies, totalScore });

            return {
                ...m,
                contributions: {
                    contributionScore,
                    supportScore,
                    loyaltyScore,
                    totalScore,
                    badge
                }
            };
        });
    }

    function getMemberBadge({ donations, received, trophies, totalScore }) {
        const support = donations + received;

        if (support > 1000 && support >= trophies / 10) return { label: "Supporter", color: "bg-emerald-100 text-emerald-700" };
        if (trophies >= 6500) return { label: "Trophy Pusher", color: "bg-purple-100 text-purple-700" };
        if (totalScore >= 400) return { label: "Core Member", color: "bg-blue-100 text-blue-700" };
        if (support > 200) return { label: "Helping Hand", color: "bg-rose-100 text-rose-700" };
        return { label: "Clan Member", color: "bg-gray-100 text-gray-700" };
    }

    // HEADER
    function renderHeader(clan, members) {
        const clanScore = clan.clanScore || clan.clanPoints || 0;
        const badge =
            clan.badgeUrls?.large ||
            clan.badgeUrls?.medium ||
            clan.badgeUrls?.small ||
            "images/clan-logo.png";

        const totalMembers = members.length || clan.members || 0;
        const avgTrophies = totalMembers
            ? Math.round(
                members.reduce((sum, m) => sum + (m.trophies || 0), 0) /
                totalMembers
            )
            : 0;

        headerEl.innerHTML = `
        <div class="bg-gradient-to-r from-royale-blue to-blue-700 rounded-2xl text-white shadow-xl p-6 md:p-8 relative overflow-hidden">
            <div class="absolute right-0 top-0 opacity-10">
                <img src="images/cr-logo.png" class="w-56" />
            </div>

            <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

                <div class="flex items-center gap-5">
                    <img src="${badge}" class="w-20 h-20 rounded-2xl border-4 border-white/40 shadow-md">
                    <div>
                        <h2 class="text-3xl md:text-4xl font-extrabold">${clan.name}</h2>
                        <p class="text-sm text-white/80 mt-1">${clan.tag}</p>
                        <p class="text-xs text-white/70 mt-1">
                            Capital = Member Contribution + Loyalty + Clan Strength
                        </p>
                    </div>
                </div>

                <div class="text-center md:text-right">
                    <p class="text-xs uppercase tracking-wide text-white/70">Clan Score</p>
                    <p class="text-3xl md:text-4xl font-extrabold">
                        ${api.formatNumber(clanScore)}
                    </p>
                    <p class="mt-3 text-xs text-white/75">
                        Members: <span class="font-bold">${clan.members || totalMembers}/50</span> •
                        Avg Trophies: <span class="font-bold">${api.formatNumber(avgTrophies)}</span>
                    </p>
                </div>
            </div>
        </div>
        `;
    }

    // OVERVIEW CARDS
    function renderOverview(clan, members) {
        const memberCount = members.length || clan.members || 0;

        const totalTrophies = members.reduce((sum, m) => sum + (m.trophies || 0), 0);
        const totalDonations = members.reduce((sum, m) => sum + (m.donations || 0), 0);
        const totalSupport = members.reduce(
            (sum, m) => sum + (m.donations || 0) + (m.donationsReceived || 0),
            0
        );
        const avgContribution = memberCount
            ? Math.round(
                members.reduce((sum, m) => sum + m.contributions.contributionScore, 0) /
                memberCount
            )
            : 0;

        overviewEl.innerHTML = `
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p class="text-xs text-gray-500 mb-1">Contribution Index</p>
                <p class="text-2xl font-extrabold text-royale-blue">${avgContribution}</p>
                <p class="text-xs text-gray-500 mt-1">Avg member contribution score (donations + trophies + level)</p>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p class="text-xs text-gray-500 mb-1">Total Donations</p>
                <p class="text-2xl font-extrabold text-emerald-600">${api.formatNumber(totalDonations)}</p>
                <p class="text-xs text-gray-500 mt-1">Combined donations given by all members</p>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p class="text-xs text-gray-500 mb-1">Total Support (Give + Receive)</p>
                <p class="text-2xl font-extrabold text-rose-500">${api.formatNumber(totalSupport)}</p>
                <p class="text-xs text-gray-500 mt-1">Overall support interactions inside the clan</p>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <p class="text-xs text-gray-500 mb-1">Members Count</p>
                <p class="text-2xl font-extrabold text-gray-900">${memberCount}</p>
                <p class="text-xs text-gray-500 mt-1">Total members considered for capital stats</p>
            </div>
        `;
    }

    // RELATIONSHIP BARS (Clan Capital Index)
    function renderRelationshipBars(members) {
        if (!members.length) {
            relationshipBarsEl.innerHTML = `<p class="text-sm text-gray-500">No member data available.</p>`;
            return;
        }

        const memberCount = members.length;

        const avgContribution =
            members.reduce((sum, m) => sum + m.contributions.contributionScore, 0) /
            memberCount;

        const avgSupport =
            members.reduce((sum, m) => sum + m.contributions.supportScore, 0) /
            memberCount;

        const avgLoyalty =
            members.reduce((sum, m) => sum + m.contributions.loyaltyScore, 0) /
            memberCount;

        const overallIndex = Math.round(
            (normalize(avgContribution, 0, 400) +
                normalize(avgSupport, 0, 500) +
                normalize(avgLoyalty, 0, 400)) /
            3
        );

        relationshipBarsEl.innerHTML = `
            <p class="text-sm text-gray-600 mb-4">
                This index shows how strong the relationship is between members and the clan,
                based on contribution (trophies + donations), support, and loyalty (rank & level).
            </p>

            ${renderBarRow("Overall Clan Capital Index", overallIndex, "bg-gradient-to-r from-emerald-400 to-emerald-600")}
            ${renderBarRow("Contribution Strength", normalize(avgContribution, 0, 400), "bg-gradient-to-r from-royale-blue to-blue-700")}
            ${renderBarRow("Support & Donations", normalize(avgSupport, 0, 500), "bg-gradient-to-r from-rose-400 to-rose-600")}
            ${renderBarRow("Loyalty & Core Stability", normalize(avgLoyalty, 0, 400), "bg-gradient-to-r from-amber-400 to-amber-500")}
        `;
    }

    function renderBarRow(label, value, barClass) {
        const pct = Math.max(5, Math.min(100, Math.round(value)));
        return `
        <div>
            <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 font-medium">${label}</span>
                <span class="text-gray-900 font-semibold">${pct}/100</span>
            </div>
            <div class="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div class="h-full ${barClass}" style="width:${pct}%;"></div>
            </div>
        </div>
        `;
    }

    function normalize(value, min, max) {
        if (max === min) return 0;
        const v = (value - min) / (max - min);
        return Math.max(0, Math.min(100, v * 100));
    }

    // LEADERBOARDS
    function renderLeaderboards(members) {
        if (!members.length) {
            topContributorsEl.innerHTML = `<p class="text-sm text-gray-500">No data.</p>`;
            topDonorsEl.innerHTML = `<p class="text-sm text-gray-500">No data.</p>`;
            topTrophyPushersEl.innerHTML = `<p class="text-sm text-gray-500">No data.</p>`;
            return;
        }

        const topContrib = [...members]
            .sort((a, b) => b.contributions.totalScore - a.contributions.totalScore)
            .slice(0, 5);

        const topDonors = [...members]
            .sort((a, b) => (b.donations || 0) - (a.donations || 0))
            .slice(0, 5);

        const topTrophies = [...members]
            .sort((a, b) => (b.trophies || 0) - (a.trophies || 0))
            .slice(0, 5);

        topContributorsEl.innerHTML = topContrib
            .map((m, i) => leaderboardRow(m, i, m.contributions.totalScore, "score"))
            .join("");

        topDonorsEl.innerHTML = topDonors
            .map((m, i) => leaderboardRow(m, i, m.donations || 0, "donations"))
            .join("");

        topTrophyPushersEl.innerHTML = topTrophies
            .map((m, i) => leaderboardRow(m, i, m.trophies || 0, "trophies"))
            .join("");
    }

    function leaderboardRow(member, index, value, type) {
        let label = "";
        let icon = "";
        let valueText = "";

        if (type === "score") {
            label = "Relationship Score";
            icon = `<i class="fa-solid fa-fire text-orange-500"></i>`;
            valueText = value;
        } else if (type === "donations") {
            label = "Donations";
            icon = `<i class="fa-solid fa-hand-holding-heart text-rose-500"></i>`;
            valueText = api.formatNumber(value);
        } else {
            label = "Trophies";
            icon = `<i class="fa-solid fa-trophy text-yellow-400"></i>`;
            valueText = api.formatNumber(value);
        }

        const rankColors = ["bg-yellow-400", "bg-gray-300", "bg-orange-300"];

        return `
        <div class="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-900
                        ${rankColors[index] || "bg-gray-100"}">
                #${index + 1}
            </div>
            <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    ${member.name}
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        ${member.role || member.clanRank ? formatRole(member.role) : "Member"}
                    </span>
                </p>
                <p class="text-xs text-gray-500 flex items-center gap-1">
                    ${icon}
                    <span class="font-semibold">${valueText}</span>
                    <span class="text-[11px] text-gray-400">• ${label}</span>
                </p>
            </div>
        </div>
        `;
    }

    function formatRole(role) {
        if (!role) return "Member";
        if (role === "leader") return "Leader";
        if (role === "coLeader") return "Co-Leader";
        if (role === "elder") return "Elder";
        return "Member";
    }

    // MEMBER RELATIONSHIP CARDS
    function renderMemberCards(members) {
        if (!members.length) {
            membersRelationshipEl.innerHTML = `<p class="text-sm text-gray-500">No members to display.</p>`;
            return;
        }

        const sorted = [...members]
            .sort((a, b) => b.contributions.totalScore - a.contributions.totalScore)
            .slice(0, 9); // top 9 relationship cards

        membersRelationshipEl.innerHTML = sorted
            .map(m => memberCard(m))
            .join("");
    }

    function memberCard(member) {
        const { contributionScore, loyaltyScore, supportScore, badge } = member.contributions;
        const trophies = member.trophies || 0;
        const donations = member.donations || 0;
        const received = member.donationsReceived || 0;

        return `
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3">

            <!-- Header -->
            <div class="flex items-start justify-between gap-3">
                <div>
                    <p class="text-base font-bold text-gray-900">${member.name}</p>
                    <p class="text-xs text-gray-500">${member.tag}</p>
                    <p class="text-[11px] text-gray-500 mt-1">
                        Role: <span class="font-semibold">${formatRole(member.role)}</span> • Rank #${member.clanRank || "?"}
                    </p>
                </div>
                <span class="text-[11px] font-semibold px-3 py-1 rounded-full ${badge.color}">
                    ${badge.label}
                </span>
            </div>

            <!-- Scores -->
            <div class="grid grid-cols-3 gap-3 text-center mt-2">
                <div>
                    <p class="text-sm font-bold text-royale-blue">${contributionScore}</p>
                    <p class="text-[11px] text-gray-500">Contribution</p>
                </div>
                <div>
                    <p class="text-sm font-bold text-emerald-600">${supportScore}</p>
                    <p class="text-[11px] text-gray-500">Support</p>
                </div>
                <div>
                    <p class="text-sm font-bold text-amber-600">${loyaltyScore}</p>
                    <p class="text-[11px] text-gray-500">Loyalty</p>
                </div>
            </div>

            <!-- Trophies / Donations -->
            <div class="grid grid-cols-2 gap-3 text-xs mt-2">
                <div class="bg-gray-50 rounded-xl p-3">
                    <p class="text-[11px] text-gray-500 mb-1">Trophies</p>
                    <p class="text-sm font-bold text-gray-900">${api.formatNumber(trophies)}</p>
                </div>
                <div class="bg-gray-50 rounded-xl p-3">
                    <p class="text-[11px] text-gray-500 mb-1">Donations (G / R)</p>
                    <p class="text-sm font-bold text-gray-900">
                        ${donations} / ${received}
                    </p>
                </div>
            </div>

        </div>
        `;
    }
});

/* ---------------------------------------------------------
   NOTICE BOARD SYSTEM (Automatic Kick & Warning Rules)
--------------------------------------------------------- */

function renderNoticeBoard(members) {
    const board = document.getElementById("noticeBoard");
    if (!board) return;

    if (!members.length) {
        board.innerHTML = `<p class="text-gray-500">No member data available.</p>`;
        return;
    }

    // ▶️ EXCLUDE Leader & Co-Leader
    const filtered = members.filter(m =>
        m.role !== "leader" && m.role !== "coLeader"
    );

    // Clan averages
    const avgTrophies = Math.round(
        filtered.reduce((s, m) => s + (m.trophies || 0), 0) / filtered.length
    );

    const avgDonations = Math.round(
        filtered.reduce((s, m) => s + (m.donations || 0), 0) / filtered.length
    );

    const avgSupport = Math.round(
        filtered.reduce((s, m) => s + ((m.donations || 0) + (m.donationsReceived || 0)), 0) / filtered.length
    );

    const avgContribution = Math.round(
        filtered.reduce((s, m) => s + (m.contributions?.contributionScore || 0), 0) / filtered.length
    );

    // Calculate violation score
    const flagged = filtered.map(m => {
        let score = 0;
        let reasons = [];

        // RULE 1: Donations
        if ((m.donations || 0) === 0) {
            score += 3;
            reasons.push("No Donations");
        } else if (m.donations < avgDonations / 2) {
            score += 1;
            reasons.push("Low Donations");
        }

        // RULE 2: Received
        if ((m.donationsReceived || 0) === 0) {
            score += 1;
            reasons.push("No Donations Received");
        }

        // RULE 3: Trophies
        if ((m.trophies || 0) < avgTrophies * 0.7) {
            score += 2;
            reasons.push("Very Low Trophies");
        } else if ((m.trophies || 0) < avgTrophies) {
            score += 1;
            reasons.push("Below Average Trophies");
        }

        // RULE 4: Contribution Score
        if ((m.contributions?.contributionScore || 0) < avgContribution * 0.6) {
            score += 2;
            reasons.push("Low Contribution");
        }

        // RULE 5: Support Score
        const supportScore = (m.donations || 0) + (m.donationsReceived || 0);
        if (supportScore < avgSupport / 2) {
            score += 1;
            reasons.push("Low Support Activity");
        }

        return {
            ...m,
            violationScore: score,
            violationReasons: reasons
        };
    });

    // Nomination (Week 1)
    const offenders = flagged
        .filter(m => m.violationScore > 2)
        .sort((a, b) => {
            if (b.violationScore !== a.violationScore) {
                return b.violationScore - a.violationScore;
            }
            return b.clanRank - a.clanRank;
        });


    // Kick List (Week 2)
    const kickList = [...flagged]
        .sort((a, b) => {
            if (b.violationScore !== a.violationScore) {
                return b.violationScore - a.violationScore; // violation first
            }
            return b.clanRank - a.clanRank; // worse rank first
        })
        .slice(0, 5);


    board.innerHTML = `
        <div class="bg-red-50 border border-red-200 p-4 rounded-xl">
            <h3 class="text-lg font-bold text-red-600 flex items-center gap-2">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Members Under Nomination (Week 1)
            </h3>
            <p class="text-sm text-red-500 mb-2">These members failed contribution rules:</p>
            ${renderNominationList(offenders)}
        </div>

        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mt-4">
            <h3 class="text-lg font-bold text-yellow-700 flex items-center gap-2">
                <i class="fa-solid fa-user-xmark"></i>
                Demote and Kick List (Week 2)
            </h3>
            <p class="text-sm text-yellow-600 mb-2">These are the lowest-performing 5 members:</p>
            ${renderKickList(kickList)}
        </div>
    `;
}


function renderNominationList(list) {
    if (!list.length)
        return `<p class="text-gray-500 text-sm">No members nominated.</p>`;

    return `
        <ul class="space-y-3">
            ${list.map(m => `
                <li class="text-sm text-gray-700">
                    <strong>${m.name}</strong> (${m.tag})  
                    — Score: <span class="font-bold text-red-600">${m.violationScore}</span>  
                    <br>
                    <span class="text-xs text-gray-500">
                        Reasons: ${m.violationReasons.join(", ")}
                    </span>
                </li>
            `).join("")}
        </ul>
    `;
}

function renderKickList(list) {
    if (!list.length)
        return `<p class="text-gray-500 text-sm">No kickable members.</p>`;

    return `
        <ul class="space-y-3">
            ${list.map(m => `
                <li class="text-sm text-gray-800">
                    <strong>${m.name}</strong> — Violations:
                    <span class="font-bold text-red-600">${m.violationScore}</span>
                    <br>
                    <span class="text-xs text-gray-500">
                        Reasons: ${m.violationReasons.join(", ")}
                    </span>
                </li>
            `).join("")}
        </ul>
    `;
}
