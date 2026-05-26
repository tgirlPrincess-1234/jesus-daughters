import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";

// PASTE YOUR ACTUAL KEYS INSIDE THIS CONFIG BLOCK:
const firebaseConfig = {
  apiKey: "AIzaSyCAEBHbVXp5IOlQdpl0T-lfAiiyXOxsnus",
  authDomain: "jd-hub.firebaseapp.com",
  projectId: "jd-hub",
  storageBucket: "jd-hub.firebasestorage.app",
  messagingSenderId: "1038919051259",
  appId: "1:1038919051259:web:cbd845cb290452f23fcd5e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
    const messageStream = document.getElementById("message-stream");
    const emptyState = document.getElementById("empty-state");
    const searchBar = document.getElementById("feed-search-bar");

    let anonymousFeed = [];

    // 1. LIVE FIREBASE DATABASE SYNC LISTENER
    const feedQuery = query(collection(db, "anonymous_posts"), orderBy("timestamp", "desc"));

    onSnapshot(feedQuery, (snapshot) => {
        anonymousFeed = [];
        
        snapshot.forEach((doc) => {
            anonymousFeed.push({ docId: doc.id, ...doc.data() });
        });

        // Your 10 beautiful default backup questions if the database is brand new and empty!
        if (anonymousFeed.length === 0) {
            anonymousFeed = [
                { id: "26/05/26 #001", text: "How do I stay consistent with my morning devotion when I have such a busy school schedule?", replies: [], timestamp: Date.now() - 10000 },
                { id: "26/05/26 #002", text: "Is it wrong to feel like I’m losing interest in things I used to enjoy? How do I get back my zeal?", replies: [], timestamp: Date.now() - 20000 },
                { id: "26/05/26 #003", text: "I struggle with comparing my progress to others on social media. Any advice on how to stop?", replies: [], timestamp: Date.now() - 30000 },
                { id: "26/05/26 #004", text: "How can I share the gospel with my friends without coming across as being too pushy or religious?", replies: [], timestamp: Date.now() - 40000 },
                { id: "26/05/26 #005", text: "I often feel overwhelmed by the state of the world. How do I maintain peace of mind?", replies: [], timestamp: Date.now() - 50000 },
                { id: "26/05/26 #006", text: "What are some practical ways to serve in my local church as a student?", replies: [], timestamp: Date.now() - 60000 },
                { id: "26/05/26 #007", text: "How do I handle the pressure to fit in when my values are different from my peers?", replies: [], timestamp: Date.now() - 70000 },
                { id: "26/05/26 #008", text: "I find it hard to forgive myself for past mistakes. Any tips on walking in grace?", replies: [], timestamp: Date.now() - 80000 },
                { id: "26/05/26 #009", text: "What does it mean to truly listen to God's voice in a world full of noise?", replies: [], timestamp: Date.now() - 90000 },
                { id: "26/05/26 #010", text: "How can I cultivate a heart of gratitude when things aren't going as planned?", replies: [], timestamp: Date.now() - 100000 }
            ];
        }

        renderFeed(searchBar.value);
    }, (error) => {
        console.error("Firebase fetch failure, executing safety fallback layout:", error);
    });

    // 2. LIVE INTERACTIVE UI RENDERER
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

            const escapeDomToken = item.id.replace(/[^a-zA-Z0-9]/g, "");

            card.innerHTML = `
                <div class="anon-card-header">
                    <span class="anon-id-tag">${item.id}</span>
                </div>
                <p class="anon-msg-text">${item.text}</p>
                <div class="card-actions-bar">
                    <button class="toggle-reply-btn" data-id="${item.id}" data-dom="${escapeDomToken}">💬 Add Reply</button>
                </div>
                <div class="reply-form-tray" id="tray-${escapeDomToken}" style="display: none;">
                    <textarea class="reply-textarea" rows="2" placeholder="Write an edifying word..." id="input-${escapeDomToken}"></textarea>
                    <button class="submit-reply-btn" data-id="${item.id}" data-dom="${escapeDomToken}">Submit Reply</button>
                </div>
                ${repliesHTML}
            `;
            messageStream.appendChild(card);
        });

        attachActionListeners();
    }

    // 3. INTERACTIVE REPLY ACTION TRAY HANDLERS
    function attachActionListeners() {
        document.querySelectorAll(".toggle-reply-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const domToken = this.getAttribute("data-dom");
                const tray = document.getElementById(`tray-${domToken}`);
                if (tray) { 
                    tray.style.display = tray.style.display === "none" ? "flex" : "none"; 
                }
            });
        });

        document.querySelectorAll(".submit-reply-btn").forEach(btn => {
            btn.addEventListener("click", async function() {
                const targetId = this.getAttribute("data-id");
                const domToken = this.getAttribute("data-dom");
                const textarea = document.getElementById(`input-${domToken}`);
                const replyText = textarea.value.trim();
                if (!replyText) return;

                const now = new Date();
                const dd = String(now.getDate()).padStart(2, '0');
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const yy = String(now.getFullYear()).slice(-2);
                const dateString = `${dd}/${mm}/${yy}`;

                const targetItem = anonymousFeed.find(item => item.id === targetId);
                if (targetItem) {
                    if (!targetItem.replies) targetItem.replies = [];
                    const updatedRepliesList = [...targetItem.replies, { date: dateString, text: replyText }];

                    if (targetItem.docId) {
                        try {
                            const postDocReference = doc(db, "anonymous_posts", targetItem.docId);
                            await updateDoc(postDocReference, {
                                replies: updatedRepliesList
                            });
                        } catch (err) {
                            console.error("Cloud database reply sync error:", err);
                        }
                    } else {
                        targetItem.replies = updatedRepliesList;
                        renderFeed(searchBar.value);
                    }
                }
                textarea.value = "";
            });
        });
    }

    searchBar.addEventListener("input", function (e) { renderFeed(e.target.value); });
});