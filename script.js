/**
 * JESUS' DAUGHTERS ENGINE - CORE CONTROLLER
 */

// 1. DYNAMIC RANDOM VERSE API CONTROLLER
async function fetchVerse() {
    try {
        const response = await fetch(`https://bible-api.com/?random=verse&t=${new Date().getTime()}`);
        const data = await response.json();
        const verseEl = document.getElementById('bible-verse');
        const refEl = document.getElementById('bible-ref');
        
        if (data && data.text && verseEl) {
            verseEl.innerText = `"${data.text.trim().replace(/\s+/g, ' ')}"`;
            refEl.innerText = data.reference;
        }
    } catch (error) {
        console.error("API error:", error);
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
        spotifyCard.addEventListener('click', () => window.open('https://open.spotify.com/', '_blank'));
    }
}

// 4. ANONYMOUS PLATFORM
function initializeRealTalkSubmission() {
    const realtalkForm = document.getElementById('realtalk-form');
    if (realtalkForm) {
        realtalkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const textInput = document.getElementById('realtalk-input');
            const msgText = textInput.value.trim();
            if (!msgText) return;

            const now = new Date();
            const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`;
            let feed = JSON.parse(localStorage.getItem("jds_anon_feed")) || [];
            const id = `${dateStr} #${String(feed.filter(i => i.id.startsWith(dateStr)).length + 1).padStart(3, '0')}`;
            
            feed.unshift({ id, text: msgText, replies: [] });
            localStorage.setItem("jds_anon_feed", JSON.stringify(feed));
            const toast = document.getElementById('toast-notification');
            if (toast) { toast.textContent = `Dropped! ${id}`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
            this.reset();
        });
    }
}

// 5. TRIVIA ENGINE
const comprehensiveTriviaBank = [
    { q: "Who was chosen to replace Judas Iscariot?", a: ["Barnabas", "Matthias", "Silas", "Timothy"], c: 1 },
    { q: "Which book contains 'Jesus wept'?", a: ["Matthew", "Luke", "Mark", "John"], c: 3 },
    { q: "What language was the New Testament written in?", a: ["Hebrew", "Latin", "Aramaic", "Greek"], c: 3 },
    { q: "Who is the oldest man mentioned in the Bible?", a: ["Noah", "Methuselah", "Adam", "Enoch"], c: 1 }
];

let activeSessionQuestions = [];
let currentQuestionIndex = 0;
let usersEarnedScore = 0;

function setupTriviaSession() {
    const today = new Date().toDateString();
    if (localStorage.getItem('jd_trivia_date') !== today) {
        activeSessionQuestions = [...comprehensiveTriviaBank].sort(() => 0.5 - Math.random()).slice(0, 3);
        localStorage.setItem('jd_trivia_date', today);
        localStorage.setItem('jd_trivia_questions', JSON.stringify(activeSessionQuestions));
    } else {
        activeSessionQuestions = JSON.parse(localStorage.getItem('jd_trivia_questions'));
    }
    renderActiveQuestion();
}

function renderActiveQuestion() {
    const qEl = document.getElementById('trivia-question');
    const optEl = document.getElementById('trivia-options');
    if (!qEl || !optEl) return;
    
    const quiz = activeSessionQuestions[currentQuestionIndex];
    qEl.innerText = quiz.q;
    optEl.innerHTML = "";
    document.getElementById('question-number').innerText = `Question ${currentQuestionIndex + 1}/3`;

    quiz.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => {
            if (i === quiz.c) usersEarnedScore++;
            currentQuestionIndex++;
            currentQuestionIndex < 3 ? renderActiveQuestion() : displayFinalScoreboard();
        };
        optEl.appendChild(btn);
    });
}

function displayFinalScoreboard() {
    document.getElementById('trivia-box').style.display = "none";
    const scoreScreen = document.getElementById('score-screen');
    scoreScreen.style.display = "flex";
    document.getElementById('score-num').innerText = usersEarnedScore;
}

document.addEventListener("DOMContentLoaded", () => {
    fetchVerse();
    initializeCopyFeature();
    initializeSpotifyLink();
    initializeRealTalkSubmission();
    setupTriviaSession();
});