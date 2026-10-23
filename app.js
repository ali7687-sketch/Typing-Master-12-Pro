// Typing Master Ultra 2026 Core Engine
const lessons = [
    { title: "Class 1: Home Row Basics", text: "ffff jjjj dddd kkkk ssss llll aaaa ;;;; fj dk sl a; fjdk sl a;" },
    { title: "Class 2: Top Row Vowels", text: "eeee iiii rrrr uuuu tttt yyyy qqqq pppp eir uty qp eiruty" },
    { title: "Class 3: Bottom Row Keys", text: "vvvv mmmm cccc ,,,, xxxx .... zzzz //// vm c, x. z/ vm c, x." },
    { title: "Class 4: Capitalization & Numbers", text: "12345 67890 The Quick Brown Fox Jumps Over The Lazy Dog In Peshawar Pakistan." },
    { title: "Class 5: Speed Building Master", text: "Mastering touch typing requires precise finger placement and steady muscle memory." }
];

let currentLessonIdx = 0;
let currentText = lessons[0].text;
let currentIndex = 0;
let errors = 0;
let totalKeystrokes = 0;
let timer = null;
let timeRemaining = 60;
let isTesting = false;
let aiTimer = null;
let aiProgress = 0;

// Web Audio API Mechanical Sound Synthesizer
function playKeySound(isError = false) {
    if (!document.getElementById('soundToggle')?.checked) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = isError ? 'sawtooth' : 'sine';
        osc.frequency.value = isError ? 120 : 600;
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
}

// Element References
const displayEl = document.getElementById('textDisplay');
const grossWpmEl = document.getElementById('grossWpm');
const netWpmEl = document.getElementById('netWpm');
const accuracyEl = document.getElementById('accuracy');
const timeEl = document.getElementById('timeRemaining');
const errorEl = document.getElementById('errorCount');
const levelDisplay = document.getElementById('levelDisplay');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const leftFingerLabel = document.getElementById('leftFingerLabel');
const rightFingerLabel = document.getElementById('rightFingerLabel');

// Tab Navigation Logic
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        const targetTab = document.getElementById(`tab-${tabId}`);
        if(targetTab) targetTab.classList.add('active');
        
        if (tabId === 'ghostRacer') {
            document.getElementById('ghostTrack').classList.remove('hidden');
        } else {
            document.getElementById('ghostTrack').classList.add('hidden');
        }
    });
});

// Class Module Selector
document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.module-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentLessonIdx = parseInt(card.getAttribute('data-lesson'));
        currentText = lessons[currentLessonIdx].text;
        levelDisplay.textContent = lessons[currentLessonIdx].title;
        initTest();
    });
});

function initTest() {
    currentIndex = 0;
    errors = 0;
    totalKeystrokes = 0;
    timeRemaining = 60;
    isTesting = false;
    aiProgress = 0;
    
    clearInterval(timer);
    clearInterval(aiTimer);
    
    timeEl.textContent = `${timeRemaining}s`;
    if(grossWpmEl) grossWpmEl.textContent = '0';
    netWpmEl.textContent = '0';
    accuracyEl.textContent = '100%';
    errorEl.textContent = '0';
    
    renderText();
    updateFingerGuide();
}

function renderText() {
    displayEl.innerHTML = '';
    // Client-side Sanitization
    const sanitized = currentText.replace(/[<>]/g, '');
    sanitized.split('').forEach((char, idx) => {
        const span = document.createElement('span');
        span.textContent = char;
        if (idx === currentIndex) span.classList.add('char-current');
        displayEl.appendChild(span);
    });
}

function startTimer() {
    if (isTesting) return;
    isTesting = true;
    
    timer = setInterval(() => {
        timeRemaining--;
        timeEl.textContent = `${timeRemaining}s`;
        calculateStats();
        
        if (timeRemaining <= 0) {
            clearInterval(timer);
            clearInterval(aiTimer);
            isTesting = false;
            alert(`Class Complete! Final Net WPM: ${netWpmEl.textContent}`);
        }
    }, 1000);

    // AI Ghost Racer Pace (60 WPM Target)
    aiTimer = setInterval(() => {
        if (!isTesting) return;
        aiProgress += 1;
        const aiPercent = Math.min(100, (aiProgress / currentText.length) * 100);
        const aiCar = document.getElementById('aiCar');
        if (aiCar) aiCar.style.left = `${aiPercent}%`;
    }, 1000);
}

function calculateStats() {
    const elapsedMinutes = (60 - timeRemaining) / 60;
    if (elapsedMinutes <= 0) return;
    
    const grossWpm = Math.round((totalKeystrokes / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(grossWpm - (errors / elapsedMinutes)));
    const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;
    
    if (grossWpmEl) grossWpmEl.textContent = grossWpm;
    netWpmEl.textContent = netWpm;
    accuracyEl.textContent = `${accuracy}%`;
    errorEl.textContent = errors;
}

function updateFingerGuide() {
    if (currentIndex >= currentText.length) return;
    const key = currentText[currentIndex].toLowerCase();
    
    const leftFingerKeys = { 'a': 'Pinky', 's': 'Ring', 'd': 'Middle', 'f': 'Index', 'g': 'Index Stretch', 'q': 'Pinky', 'w': 'Ring', 'e': 'Middle', 'r': 'Index', 't': 'Index Stretch' };
    const rightFingerKeys = { 'j': 'Index', 'k': 'Middle', 'l': 'Ring', ';': 'Pinky', 'h': 'Index Stretch', 'u': 'Index', 'i': 'Middle', 'o': 'Ring', 'p': 'Pinky' };
    
    leftFingerLabel.textContent = leftFingerKeys[key] ? `Left ${leftFingerKeys[key]}` : "Resting (A S D F)";
    rightFingerLabel.textContent = rightFingerKeys[key] ? `Right ${rightFingerKeys[key]}` : "Resting (J K L ;)";
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;
    if (!isTesting && e.key.length === 1) startTimer();
    
    if (isTesting) {
        totalKeystrokes++;
        const targetChar = currentText[currentIndex];
        const spanNodes = displayEl.querySelectorAll('span');
        
        if (e.key === targetChar) {
            playKeySound(false);
            spanNodes[currentIndex].className = 'char-correct';
            currentIndex++;
        } else {
            playKeySound(true);
            spanNodes[currentIndex].className = 'char-wrong';
            errors++;
        }
        
        // Update user car position
        const userPercent = (currentIndex / currentText.length) * 100;
        const userCar = document.getElementById('userCar');
        if (userCar) userCar.style.left = `${userPercent}%`;
        
        if (currentIndex < currentText.length) {
            spanNodes[currentIndex].classList.add('char-current');
            updateFingerGuide();
        } else {
            clearInterval(timer);
            clearInterval(aiTimer);
            isTesting = false;
            alert('Congratulations! Level Cleared Successfully!');
        }
        calculateStats();
    }
});

startBtn.addEventListener('click', () => { initTest(); startTimer(); });
resetBtn.addEventListener('click', initTest);

// Custom Text & File Loader
document.getElementById('loadCustomBtn')?.addEventListener('click', () => {
    const customTxt = document.getElementById('customTextInput').value;
    if (customTxt.trim().length > 0) {
        currentText = customTxt.trim();
        levelDisplay.textContent = "Custom Practice Mode";
        initTest();
    }
});

document.getElementById('fileUploader')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            currentText = evt.target.result.trim();
            document.getElementById('customTextInput').value = currentText;
            levelDisplay.textContent = `File: ${file.name}`;
            initTest();
        };
        reader.readAsText(file);
    }
});

// Render 3D Keycaps
function buildKeyboard() {
    const kb = document.getElementById('keyboard');
    if (!kb) return;
    kb.innerHTML = '';
    const layout = [
        ["q","w","e","r","t","y","u","i","o","p"],
        ["a","s","d","f","g","h","j","k","l",";"],
        ["z","x","c","v","b","n","m",",",".","/"]
    ];
    layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'key-row';
        row.forEach(k => {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key-3d';
            keyDiv.setAttribute('data-key', k);
            keyDiv.textContent = k.toUpperCase();
            rowDiv.appendChild(keyDiv);
        });
        kb.appendChild(rowDiv);
    });
}

buildKeyboard();
initTest();
