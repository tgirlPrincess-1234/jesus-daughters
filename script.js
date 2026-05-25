/**
 * JESUS' DAUGHTERS ENGINE - CORE CONTROLLER
 */

// 1. DYNAMIC RANDOM VERSE API CONTROLLER WITH DAILY FALLBACKS
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
        document.getElementById('bible-verse').innerText = `"${finalVerseText}"`;
        document.getElementById('bible-ref').innerText = finalVerseRef;

    } catch (error) {
        document.getElementById('bible-verse').innerText = "Don’t let anyone look down on you because you are young, but set an example...";
        document.getElementById('bible-ref').innerText = "1 Timothy 4:12";
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
            window.open('https://open.spotify.com/playlist/0tBzBze2jVppMi06hro6jz?si=pCB4w8RvRg6xkA2HKX5png&pi=ElpeASrYTBGTZ', '_blank');
        });
    }
}

// 4. CONNECTED ANONYMOUS PLATFORM SUBMISSION (WITH DATE & SEQUENTIAL COUNTING)
function initializeRealTalkSubmission() {
    const realtalkForm = document.getElementById('realtalk-form');
    
    if (realtalkForm) {
        realtalkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const textInput = document.getElementById('realtalk-input');
            const msgText = textInput.value.trim();

            if (!msgText) return;

            const now = new Date();
            const yy = String(now.getFullYear()).slice(-2);
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const dateString = `${dd}/${mm}/${yy}`;

            let currentFeed = JSON.parse(localStorage.getItem("jds_anon_feed")) || [];
            const itemsToday = currentFeed.filter(item => item.id.startsWith(dateString)).length;
            
            const nextSequence = String(itemsToday + 1).padStart(3, '0');
            const generatedIdToken = `${dateString} #${nextSequence}`;

            const newAnonymousEntry = {
                id: generatedIdToken,
                text: msgText,
                replies: []
            };

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

// 5. DAY-LOCKED TRIVIA PLATFORM ENGINE (ANTI-CHEAT MECHANISM)
let activeSessionQuestions = [];
let currentQuestionIndex = 0;
let usersEarnedScore = 0;

function setupTriviaSession() {
    const todayStr = new Date().toDateString(); 
    const savedDate = localStorage.getItem('jd_trivia_date');
    const savedQuestions = localStorage.getItem('jd_trivia_questions');

    // Scenario A: User already opened the site today, pull their saved questions
    if (savedDate === todayStr && savedQuestions) {
        activeSessionQuestions = JSON.parse(savedQuestions);
    } 
    // Scenario B: Fresh day or data cleared, pool fresh items from questions.js
    else {
        if (typeof comprehensiveTriviaBank !== 'undefined' && comprehensiveTriviaBank.length >= 3) {
            // Take the real file bank, scramble it, and slice out exactly 3 questions
            const shuffled = [...comprehensiveTriviaBank].sort(() => 0.5 - Math.random());
            activeSessionQuestions = shuffled.slice(0, 3);
            
            // Lock them into storage for the rest of today
            localStorage.setItem('jd_trivia_date', todayStr);
            localStorage.setItem('jd_trivia_questions', JSON.stringify(activeSessionQuestions));
        } else {
            // Warning guide if questions.js has a spelling/syntax error or is missing
            console.error("Trivia Error: comprehensiveTriviaBank array could not be found or has a syntax typo inside questions.js.");
            
            // Temporary fail-safe backup so your screen layout doesn't crash completely
            activeSessionQuestions = [
                { q: "Esther was crowned queen of which ancient world empire?", a: ["Babylonian", "Persian", "Egyptian", "Roman"], c: 1 },
                { q: "In the book of Acts, which city did the believers first get called 'Christians'?", a: ["Jerusalem", "Antioch", "Damascus", "Ephesus"], c: 1 },
                { q: "Which spiritual armor element protects our minds according to Ephesians 6?", a: ["Shield of Faith", "Helmet of Salvation", "Belt of Truth", "Breastplate"], c: 1 }
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
    questionEl.innerText = currentQuiz.q;
    optionsContainer.innerHTML = "";
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentQuestionIndex);
    });

    let choiceLocked = false;

    currentQuiz.a.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = optionText;
        
        btn.addEventListener('click', () => {
            if (choiceLocked) return;
            choiceLocked = true;
            
            if (index === currentQuiz.c) {
                btn.classList.add('correct-flash');
                usersEarnedScore++;
            } else {
                btn.classList.add('wrong-flash');
                optionsContainer.children[currentQuiz.c].classList.add('correct-flash');
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
        scoreScreen.classList.add('green-pass');
        headlineEl.innerText = "Scripture Giant! 🔥";
        commentEl.innerText = "Incredible depth. Your spirit is thoroughly edified!";
    } else {
        scoreScreen.classList.add('red-fail');
        headlineEl.innerText = "Keep Growing! 📖";
        commentEl.innerText = "Try again! The word remains unchanged until tomorrow.";
    }
}

// BOOT ENGINE
document.addEventListener("DOMContentLoaded", () => {
    fetchVerse();
    initializeCopyFeature();
    initializeSpotifyLink();
    initializeRealTalkSubmission();
    setupTriviaSession();
});