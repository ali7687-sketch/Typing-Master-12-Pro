/**
 * Typing Master Ultra 2026 Engine
 * Built with Configurable Practice Durations (2m, 3m, 5m, 10m, 20m)
 */

// Step-by-Step Curriculum Data
const curriculumData = [
    { title: "Class 1: Home Row Mastery", text: "ffff jjjj dddd kkkk ssss llll aaaa ;;;; fj dk sl a; fjdk sl a; ffff jjjj dddd kkkk ssss llll aaaa ;;;; fjdk sl a;" },
    { title: "Class 2: Top Row & Reach", text: "eeee iiii rrrr uuuu tttt yyyy qqqq pppp eir uty qp eiruty eeee iiii rrrr uuuu tttt yyyy qqqq pppp eiruty" },
    { title: "Class 3: Bottom Row Shift", text: "vvvv mmmm cccc ,,,, xxxx .... zzzz //// vm c, x. z/ vm c, x. vvvv mmmm cccc ,,,, xxxx .... zzzz //// vm c, x." },
    { title: "Class 4: Capitalization & Numbers", text: "12345 67890 The Quick Brown Fox Jumps Over The Lazy Dog In Peshawar Pakistan 98765 43210 Capital Shift Drills." },
    { title: "Class 5: Extended Speed Drill", text: "Touch typing requires precise muscle memory and finger positioning. Regular practice builds speed, accuracy, and efficiency across all input environments." }
];

// Lengthy Dictation Data
const dictationData = [
    { 
        title: "Dictation A: Formal Business & IT Essay", 
        text: "The rapid evolution of modern computer technology has transformed the modern workforce. Efficient communication depends heavily on high-speed accurate touch typing skills. Operating an enterprise computer workstation requires mastery over keyboard layouts, punctuation symbols, numbers, and command shortcuts. Developing muscle memory reduces mental overhead and increases daily operational productivity." 
    },
    { 
        title: "Dictation B: Technology & AI Architecture", 
        text: "Artificial intelligence systems rely on scalable software architecture, structured network deployment, and low-latency database engines. Software engineers write thousands of lines of clean code in languages like JavaScript, Python, C++, and Rust. Mastery over complex character sets, brackets, operators, and special symbols is essential for modern technical excellence." 
    }
];

// Code & Symbol Exercises
const codeData = [
    { title: "Code Drill 1: JavaScript Function", text: "function calculateNetWpm(gross, errors, timeMin) { return Math.max(0, Math.round(gross - (errors / timeMin))); }" },
    { title: "Code Drill 2: HTML5 Component", text: "<div class=\"typing-arena\" id=\"mainArena\"><span class=\"char-correct\">Ultra</span></div>" }
];

// Global State
let currentText = curriculumData[0].text;
let currentIndex = 0;
let errors = 0;
let totalKeystrokes = 0;
let correctKeystrokes = 0;
let startTime = null;
let timer = null;
let selectedDuration = 180; // Default 3 minutes in seconds
let timeRemaining = 180;
let isTesting = false;
let aiTimer = null;
let aiProgress = 0;

// Audio Synthesizer
function playKeySound(isError = false) {
    if (!document.getElementById('soundToggle')?.checked) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = isError ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(isError ? 110 : 580, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.048);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
}

// DOM Elements
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

// Time Format Helper (e.g., 180s -> 3m, 1200s -> 20m)
function formatTimeDisplay(sec) {
    const mins = Math.floor(sec / 60);
    const remSec = sec % 60;
    if (mins > 0 && remSec === 0) return `${mins}m`;
    if (mins > 0) return `${mins}m ${remSec}s`;
    return `${sec}s`;
}

// Duration Selection Button Listeners
document.querySelectorAll('.dur-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDuration = parseInt(btn.getAttribute('data-time'));
        initTest();
        btn.blur();
    });
});

// Navigation Tabs
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        
        if (tabId === 'curriculum') {
            loadModule(curriculumData[0].title, curriculumData[0].text);
        } else if (tabId === 'dictation') {
            loadModule(dictationData[0].title, dictationData[0].text);
        } else if (tabId === 'codeTyping') {
            loadModule(codeData[0].title, codeData[0].text);
        }

        const targetTab = document.getElementById(`tab-${tabId}`);
        if (targetTab) targetTab.classList.add('active');
        
        const ghostTrack = document.getElementById('ghostTrack');
        if (ghostTrack) {
            if (tabId === 'ghostRacer') ghostTrack.classList.remove('hidden');
            else ghostTrack.classList.add('hidden');
        }
    });
});

// Module Selector
document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.module-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const type = card.getAttribute('data-type');
        const idx = parseInt(card.getAttribute('data-lesson'));
        
        if (type === 'curriculum' && curriculumData[idx]) {
            loadModule(curriculumData[idx].title, curriculumData[idx].text);
        } else if (type === 'dictation' && dictationData[idx]) {
            loadModule(dictationData[idx].title, dictationData[idx].text);
        }
    });
});

function loadModule(title, text) {
    currentText = text;
    if (levelDisplay) levelDisplay.textContent = title;
    initTest();
}

// Reset Arena
function initTest() {
    currentIndex = 0;
    errors = 0;
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    timeRemaining = selectedDuration;
    isTesting = false;
    startTime = null;
    aiProgress = 0;
    
    clearInterval(timer);
    clearInterval(aiTimer);
    
    if (timeEl) timeEl.textContent = formatTimeDisplay(timeRemaining);
    if (grossWpmEl) grossWpmEl.textContent = '0';
    if (netWpmEl) netWpmEl.textContent = '0';
    if (accuracyEl) accuracyEl.textContent = '100%';
    if (errorEl) errorEl.textContent = '0';
    
    const aiCar = document.getElementById('aiCar');
    const userCar = document.getElementById('userCar');
    if (aiCar) aiCar.style.left = '0%';
    if (userCar) userCar.style.left = '0%';

    renderText();
    updateFingerGuide();
}

// Render Character Stream
function renderText() {
    if (!displayEl) return;
    displayEl.innerHTML = '';
    
    const normalized = currentText.replace(/\r?\n|\r|\t/g, ' ');
    
    normalized.split('').forEach((char, idx) => {
        const span = document.createElement('span');
        span.textContent = char;
        if (idx === 0) span.classList.add('char-current');
        displayEl.appendChild(span);
    });
}

// Timer & AI Race
function startTimer() {
    if (isTesting) return;
    isTesting = true;
    startTime = Date.now();
    
    timer = setInterval(() => {
        timeRemaining--;
        if (timeEl) timeEl.textContent = formatTimeDisplay(timeRemaining);
        calculateStats();
        
        if (timeRemaining <= 0) {
            finishTest();
        }
    }, 1000);

    aiTimer = setInterval(() => {
        if (!isTesting) return;
        aiProgress += 1;
        const aiPercent = Math.min(100, (aiProgress / currentText.length) * 100);
        const aiCar = document.getElementById('aiCar');
        if (aiCar) aiCar.style.left = `${aiPercent}%`;
    }, 900);
}

// Real-Time Stats
function calculateStats() {
    if (!startTime) return;
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    if (elapsedMinutes <= 0) return;
    
    const grossWpm = Math.round((totalKeystrokes / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round((correctKeystrokes / 5) / elapsedMinutes - (errors / elapsedMinutes)));
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
    
    if (grossWpmEl) grossWpmEl.textContent = grossWpm;
    if (netWpmEl) netWpmEl.textContent = netWpm;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    if (errorEl) errorEl.textContent = errors;
}

// Finger Guidance
function updateFingerGuide() {
    if (currentIndex >= currentText.length) return;
    const key = currentText[currentIndex].toLowerCase();
    
    const leftKeys = { 'a':'Pinky', 's':'Ring', 'd':'Middle', 'f':'Index', 'g':'Index', 'q':'Pinky', 'w':'Ring', 'e':'Middle', 'r':'Index', 't':'Index', 'z':'Pinky', 'x':'Ring', 'c':'Middle', 'v':'Index' };
    const rightKeys = { 'j':'Index', 'k':'Middle', 'l':'Ring', ';':'Pinky', 'h':'Index', 'u':'Index', 'i':'Middle', 'o':'Ring', 'p':'Pinky', 'm':'Index', ',':'Middle', '.':'Ring', '/':'Pinky' };
    
    if (key === ' ') {
        if (leftFingerLabel) leftFingerLabel.textContent = "Thumb (Spacebar)";
        if (rightFingerLabel) rightFingerLabel.textContent = "Thumb (Spacebar)";
        return;
    }

    if (leftFingerLabel) leftFingerLabel.textContent = leftKeys[key] ? `Left ${leftKeys[key]}` : "Resting (A S D F)";
    if (rightFingerLabel) rightFingerLabel.textContent = rightKeys[key] ? `Right ${rightKeys[key]}` : "Resting (J K L ;)";

    document.querySelectorAll('.key-3d').forEach(k => k.classList.remove('active-target'));
    const targetKey = key === ' ' ? 'space' : key;
    const activeCap = document.querySelector(`.key-3d[data-key="${targetKey}"]`);
    if (activeCap) activeCap.classList.add('active-target');
}

// Keydown Engine
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Tab' || e.key === 'CapsLock') return;
    
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
    }
    
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') {
        return;
    }

    if (!isTesting && e.key.length === 1) {
        startTimer();
    }
    
    if (isTesting && currentIndex < currentText.length) {
        totalKeystrokes++;
        const targetChar = currentText[currentIndex];
        const spanNodes = displayEl.querySelectorAll('span');
        
        const isMatch = (e.key === targetChar);

        if (isMatch) {
            playKeySound(false);
            correctKeystrokes++;
            if (spanNodes[currentIndex]) spanNodes[currentIndex].className = 'char-correct';
            currentIndex++;
        } else {
            playKeySound(true);
            errors++;
            if (spanNodes[currentIndex]) spanNodes[currentIndex].className = 'char-wrong';
        }
        
        if (spanNodes[currentIndex]) {
            spanNodes[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }

        const userPercent = (currentIndex / currentText.length) * 100;
        const userCar = document.getElementById('userCar');
        if (userCar) userCar.style.left = `${userPercent}%`;
        
        if (currentIndex < currentText.length) {
            if (spanNodes[currentIndex]) spanNodes[currentIndex].classList.add('char-current');
            updateFingerGuide();
        } else {
            finishTest();
        }
        
        calculateStats();
    }
});

function finishTest() {
    clearInterval(timer);
    clearInterval(aiTimer);
    isTesting = false;
    calculateStats();
    alert(`Test Complete!\nGross WPM: ${grossWpmEl.textContent}\nNet WPM: ${netWpmEl.textContent}\nAccuracy: ${accuracyEl.textContent}`);
}

// Button Handlers
if (startBtn) {
    startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startBtn.blur();
        initTest();
        startTimer();
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetBtn.blur();
        initTest();
    });
}

// Universal Hub Actions
const hubLoadBtn = document.getElementById('hubLoadBtn');
if (hubLoadBtn) {
    hubLoadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const hubTxt = document.getElementById('hubTextInput')?.value;
        if (hubTxt && hubTxt.trim().length > 0) {
            loadModule("Universal Power Practice", hubTxt.trim());
            hubLoadBtn.blur();
        }
    });
}

const hubRandomGenBtn = document.getElementById('hubRandomGenBtn');
if (hubRandomGenBtn) {
    hubRandomGenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const sampleWords = ["system", "architecture", "deployment", "monetization", "accuracy", "cybersecurity", "performance", "interface", "protocol", "engine"];
        let mix = "";
        for (let i = 0; i < 30; i++) {
            mix += sampleWords[Math.floor(Math.random() * sampleWords.length)] + " ";
        }
        document.getElementById('hubTextInput').value = mix.trim();
        loadModule("Random Generated Mix", mix.trim());
        hubRandomGenBtn.blur();
    });
}

const hubFileUploader = document.getElementById('hubFileUploader');
if (hubFileUploader) {
    hubFileUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('fileNameDisplay').textContent = file.name;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const text = evt.target.result.trim();
                document.getElementById('hubTextInput').value = text;
                loadModule(`File: ${file.name}`, text);
            };
            reader.readAsText(file);
        }
    });
}

// Render 3D Keyboard
function buildKeyboard() {
    const kb = document.getElementById('keyboard');
    if (!kb) return;
    kb.innerHTML = '';
    const layout = [
        ["q","w","e","r","t","y","u","i","o","p"],
        ["a","s","d","f","g","h","j","k","l",";"],
        ["z","x","c","v","b","n","m",",",".","/"],
        ["space"]
    ];
    layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'key-row';
        row.forEach(k => {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key-3d';
            if (k === 'space') {
                keyDiv.style.minWidth = '220px';
                keyDiv.textContent = 'SPACEBAR';
            } else {
                keyDiv.textContent = k.toUpperCase();
            }
            keyDiv.setAttribute('data-key', k);
            rowDiv.appendChild(keyDiv);
        });
        kb.appendChild(rowDiv);
    });
}

// Initialize Application Engine
buildKeyboard();
initTest();
