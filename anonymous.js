document.addEventListener("DOMContentLoaded", function () {
    const messageStream = document.getElementById("message-stream");
    const emptyState = document.getElementById("empty-state");
    const searchBar = document.getElementById("feed-search-bar");

    // 10 GENERIC ANONYMOUS TOPICS (No names included)
    let initialMockData = [
        { id: "24/05/26 #001", text: "How do I stay consistent with my morning devotion when I have such a busy school schedule?", replies: [] },
        { id: "24/05/26 #002", text: "Is it wrong to feel like I’m losing interest in things I used to enjoy? How do I get back my zeal?", replies: [] },
        { id: "24/05/26 #003", text: "I struggle with comparing my progress to others on social media. Any advice on how to stop?", replies: [] },
        { id: "24/05/26 #004", text: "How can I share the gospel with my friends without coming across as being too pushy or religious?", replies: [] },
        { id: "24/05/26 #005", text: "I often feel overwhelmed by the state of the world. How do I maintain peace of mind?", replies: [] },
        { id: "24/05/26 #006", text: "What are some practical ways to serve in my local church as a student?", replies: [] },
        { id: "24/05/26 #007", text: "How do I handle the pressure to fit in when my values are different from my peers?", replies: [] },
        { id: "24/05/26 #008", text: "I find it hard to forgive myself for past mistakes. Any tips on walking in grace?", replies: [] },
        { id: "24/05/26 #009", text: "What does it mean to truly listen to God's voice in a world full of noise?", replies: [] },
        { id: "24/05/26 #010", text: "How can I cultivate a heart of gratitude when things aren't going as planned?", replies: [] }
    ];

    let anonymousFeed = JSON.parse(localStorage.getItem("jds_anon_feed"));
    if (!anonymousFeed) {
        anonymousFeed = initialMockData;
        localStorage.setItem("jds_anon_feed", JSON.stringify(anonymousFeed));
    }

    function renderFeed(filterText = "") {
        const existingCards = messageStream.querySelectorAll(".anon-feed-card");
        existingCards.forEach(card => card.remove());

        const cleanedFilter = filterText.toLowerCase().trim();
        const matchingMessages = anonymousFeed.filter(item => 
            item.id.toLowerCase().includes(cleanedFilter) || 
            item.text.toLowerCase().includes(cleanedFilter)
        );

        if (matchingMessages.length === 0) {
            emptyState.style.display = "flex";
            return;
        }

        emptyState.style.display = "none";

        matchingMessages.forEach(item => {
            const card = document.createElement("div");
            card.className = "anon-feed-card";

            let repliesHTML = "";
            if (item.replies && item.replies.length > 0) {
                repliesHTML = `<div class="replies-box-container">`;
                item.replies.forEach(rep => {
                    repliesHTML += `
                        <div class="reply-row">
                            <span class="reply-header-title">Rep-${rep.date}</span>
                            <p class="reply-body-text">${rep.text}</p>
                        </div>
                    `;
                });
                repliesHTML += `</div>`;
            }

            card.innerHTML = `
                <div class="anon-card-header">
                    <span class="anon-id-tag">${item.id}</span>
                </div>
                <p class="anon-msg-text">${item.text}</p>
                <div class="card-actions-bar">
                    <button class="toggle-reply-btn" data-id="${item.id}">💬 Add Reply</button>
                </div>
                <div class="reply-form-tray" id="tray-${CSS.escape(item.id)}" style="display: none;">
                    <textarea class="reply-textarea" rows="2" placeholder="Write an edifying word..." id="input-${CSS.escape(item.id)}"></textarea>
                    <button class="submit-reply-btn" data-id="${item.id}">Submit Reply</button>
                </div>
                ${repliesHTML}
            `;
            messageStream.appendChild(card);
        });

        attachActionListeners();
    }

    function attachActionListeners() {
        document.querySelectorAll(".toggle-reply-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const targetId = this.getAttribute("data-id");
                const tray = document.getElementById(`tray-${targetId}`);
                if (tray) { tray.style.display = tray.style.display === "none" ? "flex" : "none"; }
            });
        });

        document.querySelectorAll(".submit-reply-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const targetId = this.getAttribute("data-id");
                const textarea = document.getElementById(`input-${targetId}`);
                const replyText = textarea.value.trim();
                if (!replyText) return;

                const now = new Date();
                const dateString = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`;

                const targetItem = anonymousFeed.find(item => item.id === targetId);
                if (targetItem) {
                    if (!targetItem.replies) targetItem.replies = [];
                    targetItem.replies.push({ date: dateString, text: replyText });
                    localStorage.setItem("jds_anon_feed", JSON.stringify(anonymousFeed));
                    renderFeed(searchBar.value);
                }
            });
        });
    }

    searchBar.addEventListener("input", function (e) { renderFeed(e.target.value); });
    renderFeed();
});