/**
 * JESUS' DAUGHTERS ENGINE - CORE CONTROLLER
 */

// 1. DYNAMIC RANDOM VERSE API CONTROLLER
async function fetchVerse() {
    try {
        // Adding a timestamp "?t=" forces the browser to get a NEW verse, not a cached one
        const response = await fetch(`https://bible-api.com/?random=verse&t=${new Date().getTime()}`);
        const data = await response.json();
        
        let finalVerseText = "";
        let finalVerseRef = "";

        if (data && data.text) {
            finalVerseText = data.text;
            finalVerseRef = data.reference;
        } else {
            throw new Error("No data found");
        }

        // Clean up text
        finalVerseText = finalVerseText.trim().replace(/\s+/g, ' ');

        // Project to UI
        const verseEl = document.getElementById('bible-verse');
        const refEl = document.getElementById('bible-ref');
        if (verseEl) verseEl.innerText = `"${finalVerseText}"`;
        if (refEl) refEl.innerText = finalVerseRef;

    } catch (error) {
        console.error("API failed, using fallback:", error);
        // Fallback to a hardcoded verse if the internet is down
        document.getElementById('bible-verse').innerText = "\"For I know the plans I have for you,\" declares the Lord, \"plans to prosper you and not to harm you, plans to give you hope and a future.\"";
        document.getElementById('bible-ref').innerText = "Jeremiah 29:11";
    }
}

// 2. CLIPBOARD CONTROLLER
function initializeCopyFeature() {
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast-notification');
    
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const fullContent = document.getElementById('bible-verse').innerText + " - " + document.getElementById('bible-ref').innerText;
            navigator.clipboard.writeText(fullContent).then(() => {
                toast.classList.add('show');
                setTimeout(() => { toast.classList.remove('show'); }, 3000);
            });
        });
    }
}

// 3. SPOTIFY ROUTER
function initializeSpotifyLink() {
    const spotifyCard = document.getElementById('spotify-card');
    if (spotifyCard) {
        spotifyCard.addEventListener('click', () => {
            window.open('https://open.spotify.com/', '_blank');
        });
    }
}

// 4. ANONYMOUS PLATFORM SUBMISSION
function initializeRealTalkSubmission() {
    const realtalkForm = document.getElementById('realtalk-form');
    if (realtalkForm) {
        realtalkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const textInput = document.getElementById('realtalk-input');
            const msgText = textInput.value.trim();
            if (!msgText) return;

            const now = new Date();
            const dateString = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`;
            let currentFeed = JSON.parse(localStorage.getItem("jds_anon_feed")) || [];
            const itemsToday = currentFeed.filter(item => item.id.startsWith(dateString)).length;
            const generatedIdToken = `${dateString} #${String(itemsToday + 1).padStart(3, '0')}`;

            const newAnonymousEntry = { id: generatedIdToken, text: msgText, replies: [] };
            currentFeed.unshift(newAnonymousEntry);
            localStorage.setItem("jds_anon_feed", JSON.stringify(currentFeed));

            const toast = document.getElementById('toast-notification');
            if (toast) {
                toast.textContent = `Dropped! Code: ${generatedIdToken} 🤫`;
                toast.classList.add('show');
                setTimeout(() => { toast.classList.remove('show'); }, 5000);
            }
            this.reset();
        });
    }
}

// 5. TRIVIA ENGINE
function setupTriviaSession() {
    const todayStr = new Date().toDateString(); 
    const savedDate = localStorage.getItem('jd_trivia_date');
    const savedQuestions = localStorage.getItem('jd_trivia_questions');

    if (savedDate === todayStr && savedQuestions) {
        activeSessionQuestions = JSON.parse(savedQuestions);
    } else {
        activeSessionQuestions = [
            { q: "Who was chosen to replace Judas Iscariot?", a: ["Barnabas", "Matthias", "Silas", "Timothy"], c: 1 },
            { q: "Which book contains 'Jesus wept'?", a: ["Matthew", "Luke", "Mark", "John"], c: 3 },
            { q: "What language was the New Testament written in?", a: ["Hebrew", "Latin", "Aramaic", "Greek"], c: 3 }
        ];
        localStorage.setItem('jd_trivia_date', todayStr);
        localStorage.setItem('jd_trivia_questions', JSON.stringify(activeSessionQuestions));
    }
    renderActiveQuestion();
}

// ... (Keep your renderActiveQuestion, goToNextStep, and displayFinalScoreboard functions exactly as they were in your code)

// BOOT ENGINE
document.addEventListener("DOMContentLoaded", () => {
    fetchVerse();
    initializeCopyFeature();
    initializeSpotifyLink();
    initializeRealTalkSubmission();
    setupTriviaSession();
});