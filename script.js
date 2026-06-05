import { comprehensiveTriviaBank } from './questions.js';
import { comprehensiveSongBank } from './sotw.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 1. DAILY BIBLE VERSE ENGINE
async function fetchVerse() {
    try {
        const response = await fetch('https://labs.bible.org/api/?passage=random&type=json'); 
        const data = await response.json();
        
        let finalVerseText = "";
        let finalVerseRef = "";

        if (data && data.length > 0) {
            finalVerseText = data[0].text;
            finalVerseRef = `${data[0].bookname} ${data[0].chapter}:${data[0].verse}`;
        } else if (data && data.text) {
            finalVerseText = data.text;
            finalVerseRef = data.reference;
        }

        if (!finalVerseText || !finalVerseRef || finalVerseText.includes("undefined")) {
            const dayOfWeek = new Date().getDay();
            const weeklyFallbackBank = [
                { text: "And it shall come to pass afterward, that I will pour out my Spirit upon all flesh...", ref: "Joel 2:28" },
                { text: "Don’t let anyone look down on you because you are young...", ref: "1 Timothy 4:12" },
                { text: "For I know the plans I have for you,” declares the Lord...", ref: "Jeremiah 29:11" },
                { text: "The Lord your God is with you, the Mighty Warrior who saves...", ref: "Zephaniah 3:17" },
                { text: "But those who hope in the Lord will renew their strength...", ref: "Isaiah 40:31" },
                { text: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
                { text: "For God has not given us a spirit of fear and timidity...", ref: "2 Timothy 1:7" }
            ];
            finalVerseText = weeklyFallbackBank[dayOfWeek].text;
            finalVerseRef = weeklyFallbackBank[dayOfWeek].ref;
        }

        finalVerseText = finalVerseText.replace(/<\/?[^>]+(>|$)/g, "").trim().replace(/\s+/g, ' ');
        
        // Populate front reference, back text, and back reference
        document.getElementById('bible-ref-front').innerText = finalVerseRef;
        document.getElementById('bible-verse').innerText = `"${finalVerseText}"`;
        document.getElementById('bible-ref').innerText = finalVerseRef;

    } catch (error) {
        document.getElementById('bible-ref-front').innerText = "1 Timothy 4:12";
        document.getElementById('bible-verse').innerText = "Don’t let anyone look down on you because you are young, but set an example...";
        document.getElementById('bible-ref').innerText = "1 Timothy 4:12";
    }
}

// 2. FLASHCARD FLIP CONTROLLER
function toggleCardFlip() {
    const cardInner = document.getElementById('verse-card-inner');
    cardInner.classList.toggle('flipped');
}

// 3. CLIPBOARD CONTROLLER
function initializeCopyFeature() {
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast-notification');
    
    if (copyBtn) {
        copyBtn.addEventListener('click', function(e) {
            // CRITICAL: Prevents the card from flipping back over when clicking the copy button!
            e.stopImmediatePropagation(); 
            
            const fullContent = document.getElementById('bible-verse').innerText + " - " + document.getElementById('bible-ref').innerText;
            navigator.clipboard.writeText(fullContent).then(() => {
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => { toast.classList.remove('show'); }, 3000);
                }
            });
        });
    }
}

// 3. SPOTIFY ROUTER & AUTOMATED WEEKLY SPOTLIGHT ENGINE
function getStartOfWeekString() {
    const d = new Date();
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate difference back to the most recent Sunday
    const diff = d.getDate() - day; 
    const sundayDate = new Date(d.setDate(diff));
    
    // Normalize time parameters to prevent mid-day updates
    sundayDate.setHours(0, 0, 0, 0);
    return sundayDate.toDateString();
}

function updateWeeklySongSpotlight() {
    const embedContainer = document.getElementById('sotw-embed-container');
    // Ensure the bank exists and has tracks before moving forward
    if (!embedContainer || !comprehensiveSongBank || comprehensiveSongBank.length === 0) return;

    const currentWeekKey = getStartOfWeekString(); // e.g., "Sun Jun 07 2026"

    // --- NEW: SEEDED PSEUDO-RANDOM ALGORITHM ---
    // This turns the week text into a consistent number unique to this specific week
    let hash = 0;
    for (let i = 0; i < currentWeekKey.length; i++) {
        hash = currentWeekKey.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Force the hash to be a positive index within our song bank length
    const deterministicIndex = Math.abs(hash) % comprehensiveSongBank.length;
    const targetSongUrl = comprehensiveSongBank[deterministicIndex];
    // --------------------------------------------

    // Inject the compact Spotify track player dynamically 
    embedContainer.innerHTML = `
        <iframe 
            style="border-radius:12px" 
            src="${targetSongUrl}" 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>
    `;
}

function initializeSpotifyLink() {
    // Run the automated rotation engine immediately on boot
    updateWeeklySongSpotlight();

    const spotifyCard = document.getElementById('spotify-card');
    if (spotifyCard) {
        spotifyCard.addEventListener('click', () => {
            // Put your full, private playlist link right here below:
            window.open('https://open.spotify.com/playlist/0tBzBze2jVppMi06hro6jz?si=1a5b030f152d4370', '_blank');
        });
    }
}

// 4. CONNECTED ANONYMOUS PLATFORM SUBMISSION
function initializeRealTalkSubmission() {
    const realtalkForm = document.getElementById('realtalk-form');
    
    if (realtalkForm) {
        realtalkForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const textInput = document.getElementById('realtalk-input');
            const msgText = textInput.value.trim();

            if (!msgText) return;

            const now = new Date();
            const yy = String(now.getFullYear()).slice(-2);
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const dateString = `${dd}/${mm}/${yy}`;

            let generatedIdToken = `${dateString} #001`;

            try {
                const postsContainer = collection(db, "anonymous_posts");
                const todayQuery = query(postsContainer, where("dateOnlyString", "==", dateString));
                const querySnapshot = await getDocs(todayQuery);
                
                const itemsToday = querySnapshot.size;
                const nextSequence = String(itemsToday + 1).padStart(3, '0');
                generatedIdToken = `${dateString} #${nextSequence}`;

                await addDoc(postsContainer, {
                    id: generatedIdToken,
                    text: msgText,
                    dateOnlyString: dateString,
                    timestamp: Date.now(),
                    replies: []
                });

                const toast = document.getElementById('toast-notification');
                if (toast) {
                    toast.textContent = `Dropped! Code: ${generatedIdToken} 🤫`;
                    toast.classList.add('show');
                    setTimeout(() => { toast.classList.remove('show'); }, 5000);
                }

                this.reset();

            } catch (error) {
                console.error("Cloud upload blocked or failed:", error);
                alert("Submission dropped locally due to connectivity issues.");
            }
        });
    }
}

// 5. DAY-LOCKED TRIVIA PLATFORM ENGINE
let activeSessionQuestions = [];
let currentQuestionIndex = 0;
let usersEarnedScore = 0;

// STREAK MANAGEMENT ENGINE
function getStreakData() {
    const today = new Date();
    today.setHours(0,0,0,0); // Clear time metadata
    
    let currentStreak = parseInt(localStorage.getItem('jd_streak_count')) || 0;
    let lastCompletedStr = localStorage.getItem('jd_streak_last_date');
    let isLitToday = localStorage.getItem('jd_streak_lit_today') === 'true';
    
    if (lastCompletedStr) {
        const lastDate = new Date(lastCompletedStr);
        lastDate.setHours(0,0,0,0);
        
        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            // Missed a full day -> reset streak
            currentStreak = 0;
            isLitToday = false;
            localStorage.setItem('jd_streak_count', '0');
            localStorage.setItem('jd_streak_lit_today', 'false');
        } else if (diffDays === 1) {
            // New day has dawned -> unlit the badge but save count
            isLitToday = false;
            localStorage.setItem('jd_streak_lit_today', 'false');
        }
    } else {
        // Brand new user profile
        currentStreak = 0;
        isLitToday = false;
    }
    
    return { count: currentStreak, lit: isLitToday };
}

function updateStreakUI() {
    const streakData = getStreakData();
    const badge = document.getElementById('streak-badge');
    const countEl = document.getElementById('streak-count');
    
    if (badge && countEl) {
        countEl.innerText = streakData.count;
        if (streakData.lit) {
            badge.classList.add('lit');
        } else {
            badge.classList.remove('lit');
        }
    }
}

function rewardDailyStreak() {
    const todayStr = new Date().toDateString();
    let currentStreak = parseInt(localStorage.getItem('jd_streak_count')) || 0;
    let lastCompletedStr = localStorage.getItem('jd_streak_last_date');
    
    // Only increment once a day
    if (lastCompletedStr !== todayStr) {
        currentStreak += 1;
        localStorage.setItem('jd_streak_count', currentStreak);
        localStorage.setItem('jd_streak_last_date', todayStr);
    }
    
    localStorage.setItem('jd_streak_lit_today', 'true');
    updateStreakUI();
}

function setupTriviaSession() {
    // Sync and initialize visual streaks immediately on boot
    updateStreakUI();

    const todayStr = new Date().toDateString(); 
    const savedDate = localStorage.getItem('jd_trivia_date');
    const savedQuestions = localStorage.getItem('jd_trivia_questions');

    if (savedDate === todayStr && savedQuestions) {
        activeSessionQuestions = JSON.parse(savedQuestions);
    } else {
        if (typeof comprehensiveTriviaBank !== 'undefined' && comprehensiveTriviaBank.length >= 3) {
            const shuffled = [...comprehensiveTriviaBank].sort(() => 0.5 - Math.random());
            activeSessionQuestions = shuffled.slice(0, 3);
            
            localStorage.setItem('jd_trivia_date', todayStr);
            localStorage.setItem('jd_trivia_questions', JSON.stringify(activeSessionQuestions));
        } else {
            console.error("Trivia Error: comprehensiveTriviaBank array could not be found inside questions.js.");
            activeSessionQuestions = [
                { question: "Esther was crowned queen of which ancient world empire?", options: ["Babylonian", "Persian", "Egyptian", "Roman"], answer: 1 },
                { question: "In the book of Acts, which city did the believers first get called 'Christians'?", options: ["Jerusalem", "Antioch", "Damascus", "Ephesus"], answer: 1 },
                { question: "Which spiritual armor element protects our minds according to Ephesians 6?", options: ["Shield of Faith", "Helmet of Salvation", "Belt of Truth", "Breastplate"], answer: 1 }
            ];
        }
    }
    
    currentQuestionIndex = 0;
    usersEarnedScore = 0;
    renderActiveQuestion();
}

function renderActiveQuestion() {
    const qNumberEl = document.getElementById('question-number');
    const questionEl = document.getElementById('trivia-question');
    const optionsContainer = document.getElementById('trivia-options');
    const dots = document.querySelectorAll('.dot');
    
    if (!questionEl || !optionsContainer) return;
    
    const currentQuiz = activeSessionQuestions[currentQuestionIndex];
    
    qNumberEl.innerText = `Question ${currentQuestionIndex + 1}/3`;
    questionEl.innerText = currentQuiz.question; 
    optionsContainer.innerHTML = "";
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentQuestionIndex);
    });

    let choiceLocked = false;

    currentQuiz.options.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = optionText;
        
        btn.addEventListener('click', () => {
            if (choiceLocked) return;
            choiceLocked = true;
            
            if (index === currentQuiz.answer) {
                btn.classList.add('correct-flash');
                usersEarnedScore++;
            } else {
                btn.classList.add('wrong-flash');
                optionsContainer.children[currentQuiz.answer].classList.add('correct-flash');
            }
            
            setTimeout(() => {
                goToNextStep();
            }, 1500);
        });
        
        optionsContainer.appendChild(btn);
    });
}

function goToNextStep() {
    currentQuestionIndex++;
    if (currentQuestionIndex < 3) {
        renderActiveQuestion();
    } else {
        displayFinalScoreboard();
    }
}

function displayFinalScoreboard() {
    const triviaBox = document.getElementById('trivia-box');
    const scoreScreen = document.getElementById('score-screen');
    const scoreNumEl = document.getElementById('score-num');
    const headlineEl = document.getElementById('score-headline');
    const commentEl = document.getElementById('score-comment');
    
    if (!triviaBox || !scoreScreen) return;
    
    triviaBox.style.display = "none"; 
    scoreScreen.style.display = "flex"; 
    
    scoreNumEl.innerText = usersEarnedScore;
    scoreScreen.classList.remove('green-pass', 'red-fail');
    
    if (usersEarnedScore >= 2) {
        // Ignite the streak flame because they passed the trivia day!
        rewardDailyStreak();

        scoreScreen.classList.add('green-pass');
        headlineEl.innerText = "Scripture Giant! 🔥";
        commentEl.innerText = "Incredible depth. Your spirit is thoroughly edified!";
    } else {
        scoreScreen.classList.add('red-fail');
        headlineEl.innerText = "Keep Growing! 📖";
        commentEl.innerText = "Try again! The word remains unchanged until tomorrow.";
    }
}

// 6. MAIN ENGINE BOOT INITIALIZER
document.addEventListener("DOMContentLoaded", () => {
    fetchVerse();
    initializeCopyFeature();
    initializeSpotifyLink();
    initializeRealTalkSubmission();
    setupTriviaSession();
});

// Force mobile browsers to listen for the tap event
document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('verse-card-inner');
    if (card) {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    }
});