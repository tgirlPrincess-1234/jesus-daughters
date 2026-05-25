/**
 * JESUS' DAUGHTERS ENGINE - CORE CONTROLLER
 */

// 1. DYNAMIC RANDOM VERSE API CONTROLLER WITH DAILY FALLBACKS
async function fetchVerse() {
    try {
        // Fetching from a reliable, free random verse API (JSON format)
        const response = await fetch('https://labs.bible.org/api/?passage=random&type=json'); 
        const data = await response.json();
        
        let finalVerseText = "";
        let finalVerseRef = "";

        // FORMAT 1: Labs Bible API returns an array containing a single verse object
        if (data && data.length > 0) {
            finalVerseText = data[0].text;
            finalVerseRef = `${data[0].bookname} ${data[0].chapter}:${data[0].verse}`;
        } 
        // FORMAT 2: Check if it returns a direct text object (keeping your original parser safety intact)
        else if (data && data.text) {
            finalVerseText = data.text;
            finalVerseRef = data.reference;
        }

        // SMART FALLBACK TRIGGER: If the API fails, is blank, or says "undefined"
        if (!finalVerseText || !finalVerseRef || finalVerseText.includes("undefined")) {
            
            // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
            const dayOfWeek = new Date().getDay();
            
            // A dedicated powerhouse verse for every single day of the week
            const weeklyFallbackBank = [
                {
                    text: "And it shall come to pass afterward, that I will pour out my Spirit upon all flesh; and your sons and your daughters shall prophesy...",
                    ref: "Joel 2:28"
                }, // Sunday
                {
                    text: "Don’t let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.",
                    ref: "1 Timothy 4:12"
                }, // Monday
                {
                    text: "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.",
                    ref: "Jeremiah 29:11"
                }, // Tuesday
                {
                    text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
                    ref: "Zephaniah 3:17"
                }, // Wednesday
                {
                    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
                    ref: "Isaiah 40:31"
                }, // Thursday
                {
                    text: "I can do all this through him who gives me strength.",
                    ref: "Philippians 4:13"
                }, // Friday
                {
                    text: "For God has not given us a spirit of fear and timidity, but of power, love, and self-discipline.",
                    ref: "2 Timothy 1:7"
                }  // Saturday
            ];

            // Assign the verse matching today's exact day of the week
            finalVerseText = weeklyFallbackBank[dayOfWeek].text;
            finalVerseRef = weeklyFallbackBank[dayOfWeek].ref;
        }

        // Clean up any weird HTML tag formatting (like <b> tags) or spacing formats from the API data stream
        finalVerseText = finalVerseText.replace(/<\/?[^>]+(>|$)/g, "").trim().replace(/\s+/g, ' ');

        // Safely project the finalized copy to the UI canvas
        document.getElementById('bible-verse').innerText = `"${finalVerseText}"`;
        document.getElementById('bible-ref').innerText = finalVerseRef;

    } catch (error) {
        // Absolute last-resort emergency backup if the entire system stalls
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
            // Paste your actual Spotify playlist link inside the quotes below
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

            // A. Fetch current timestamp from your mobile device clock
            const now = new Date();
            const yy = String(now.getFullYear()).slice(-2);
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const dateString = `${dd}/${mm}/${yy}`; // Produces exactly "24/05/26"

            // B. Fetch existing database storage array or start fresh
            let currentFeed = JSON.parse(localStorage.getItem("jds_anon_feed")) || [];

            // C. Filter database to check how many topics have been dropped ALREADY today
            const itemsToday = currentFeed.filter(item => item.id.startsWith(dateString)).length;
            
            // D. Increment sequence string by 1 and format into #001 padding syntax
            const nextSequence = String(itemsToday + 1).padStart(3, '0');
            const generatedIdToken = `${dateString} #${nextSequence}`;

            // E. Create the new dynamic object entry
            const newAnonymousEntry = {
                id: generatedIdToken,
                text: msgText,
                replies: [] // Blank placeholder array ready for official manual responses later
            };

            // F. Inject new entry directly to the top of the timeline array
            currentFeed.unshift(newAnonymousEntry);
            localStorage.setItem("jds_anon_feed", JSON.stringify(currentFeed));

            // G. Visual notification toast dropdown feedback on screen
            const toast = document.getElementById('toast-notification');
            if (toast) {
                toast.textContent = `Dropped! Code: ${generatedIdToken} 🤫`;
                toast.classList.add('show');
                setTimeout(() => { toast.classList.remove('show'); }, 5000);
            }

            // H. Wipe textarea clear for subsequent user inputs
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

    if (savedDate === todayStr && savedQuestions) {
        activeSessionQuestions = JSON.parse(savedQuestions);
    } else {
        if (typeof comprehensiveTriviaBank !== 'undefined' && comprehensiveTriviaBank.length >= 3) {
            const shuffled = [...comprehensiveTriviaBank].sort(() => 0.5 - Math.random());
            activeSessionQuestions = shuffled.slice(0, 3);
            
            localStorage.setItem('jd_trivia_date', todayStr);
            localStorage.setItem('jd_trivia_questions', JSON.stringify(activeSessionQuestions));
        } else {
            activeSessionQuestions = [
                { q: "Who was chosen to replace Judas Iscariot?", a: ["Barnabas", "Matthias", "Silas", "Timothy"], c: 1 },
                { q: "Which book contains 'Jesus wept'?", a: ["Matthew", "Luke", "Mark", "John"], c: 3 },
                { q: "What language was the New Testament written in?", a: ["Hebrew", "Latin", "Aramaic", "Greek"], c: 3 }
            ];
        }
    }
    
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