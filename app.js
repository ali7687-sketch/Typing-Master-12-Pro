/**
 * Typing Master Ultra 2026 - Master Application Engine
 * Architected for High Precision Input Handling & Real-time WPM Metrics
 */

// Curriculum & Lesson Master Data
const lessons = [
    { title: "Class 1: Home Row Basics", text: "ffff jjjj dddd kkkk ssss llll aaaa ;;;; fj dk sl a; fjdk sl a;" },
    { title: "Class 2: Top Row Vowels", text: "eeee iiii rrrr uuuu tttt yyyy qqqq pppp eir uty qp eiruty" },
    { title: "Class 3: Bottom Row Keys", text: "vvvv mmmm cccc ,,,, xxxx .... zzzz //// vm c, x. z/ vm c, x." },
    { title: "Class 4: Capitalization & Shift", text: "12345 67890 The Quick Brown Fox Jumps Over The Lazy Dog In Peshawar Pakistan." },
    { title: "Class 5: Speed & Accuracy Master", text: "Mastering touch typing requires precise finger placement and steady muscle memory." }
];

// Code & Symbol Master Data
const codeLessons = [
    { title: "Code Drill: JavaScript Syntax", text: "function calculateWpm(keystrokes, timeSec) { return Math.round((keystrokes / 5) / (timeSec / 60)); }" },
    { title: "Code Drill: HTML5 & CSS3", text: "<div class=\"keyboard-3d\" style=\"background: #121820; color: #00E676;\"></div>" },
    { title: "Code Drill: Python Logic", text: "def process_text(input_str):\n    return [char for char in input_str if char != '\\n']" }
];

// Global Engine State
let currentText = lessons[0].text;
let currentIndex = 0;
let errors = 0;
let totalKeystrokes = 0;
let correctKeystrokes = 0;
let startTime = null;
let timer = null;
let timeRemaining = 60;
let isTesting = false;
let aiTimer = null;
let aiProgress = 0;

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

// Mechanical Sound Synthesizer (Web Audio API)
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

// Tab Navigation Logic
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        
        if (tabId === 'codeTyping') {
            currentText = codeLessons[0].text;
            levelDisplay.textContent = codeLessons[0].title;
            initTest();
        } else if (tabId === 'curriculum') {
            currentText = lessons[0].text;
            levelDisplay.textContent = lessons[0].title;
            initTest();
        }

        const targetTab = document.getElementById(`tab-${tabId}`);
        if(targetTab) targetTab.classList.add('active');
        
        const ghostTrack = document.getElementById('ghostTrack');
        if (ghostTrack) {
            if (tabId === 'ghostRacer') ghostTrack.classList.remove('hidden');
            else ghostTrack.classList.add('hidden');
        }
    });
});

// Class Selection Handler
document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.module-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const idx = parseInt(card.getAttribute('data-lesson'));
        if (lessons[idx]) {
            currentText = lessons[idx].text;
            levelDisplay.textContent = lessons[idx].title;
            initTest();
        }
    });
});

// Initialize & Reset Test Arena
function initTest() {
    currentIndex = 0;
    errors = 0;
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    timeRemaining = 60;
    isTesting = false;
    startTime = null;
    aiProgress = 0;
    
    clearInterval(timer);
    clearInterval(aiTimer);
    
    if (timeEl) timeEl.textContent = `${timeRemaining}s`;
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

// Render Input Text with Space Normalization
function renderText() {
    if (!displayEl) return;
    displayEl.innerHTML = '';
    
    // Normalize newlines and tabs to single spaces
    const normalizedText = currentText.replace(/\r?\n|\r|\t/g, ' ');
    
    normalizedText.split('').forEach((char, idx) => {
        const span = document.createElement('span');
        // Render spaces as explicit non-breaking visual blocks
        span.textContent = char === ' ' ? ' ' : char;
        if (idx === 0) span.classList.add('char-current');
        displayEl.appendChild(span);
    });
}

// Start Timer & AI Ghost Race
function startTimer() {
    if (isTesting) return;
    isTesting = true;
    startTime = Date.now();
    
    timer = setInterval(() => {
        timeRemaining--;
        if (timeEl) timeEl.textContent = `${timeRemaining}s`;
        calculateStats();
        
        if (timeRemaining <= 0) {
            finishTest();
        }
    }, 1000);

    // AI Ghost Racing Engine (Paced at 60 WPM)
    aiTimer = setInterval(() => {
        if (!isTesting) return;
        aiProgress += 1;
        const aiPercent = Math.min(100, (aiProgress / currentText.length) * 100);
        const aiCar = document.getElementById('aiCar');
        if (aiCar) aiCar.style.left = `${aiPercent}%`;
    }, 900);
}

// Accurate Real-time Stats Calculation
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

// Finger Guidance Visualiser
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

    // Highlight keycap on 3D keyboard
    document.querySelectorAll('.key-3d').forEach(k => k.classList.remove('active-target'));
    const targetKey = key === ' ' ? 'space' : key;
    const activeCap = document.querySelector(`.key-3d[data-key="${targetKey}"]`);
    if (activeCap) activeCap.classList.add('active-target');
}

// Master Keydown Listener (Fixes Space Reset & Jump Issues)
document.addEventListener('keydown', (e) => {
    // Ignore non-character/system modifier keys
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Tab' || e.key === 'CapsLock') return;
    
    // Prevent Spacebar and Enter from scrolling or resetting button focus
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
    }
    
    // Do not capture typing if focusing on text input box
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
        
        // Normalize typed key comparison
        const typedKey = e.key;
        const isMatch = (typedKey === targetChar) || (targetChar === ' ' && typedKey === ' ');

        if (isMatch) {
            playKeySound(false);
            correctKeystrokes++;
            if (spanNodes[currentIndex]) {
                spanNodes[currentIndex].className = 'char-correct';
            }
            currentIndex++;
        } else {
            playKeySound(true);
            errors++;
            if (spanNodes[currentIndex]) {
                spanNodes[currentIndex].className = 'char-wrong';
            }
        }
        
        // Update User Racecar Position
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
    alert(`Lesson Complete!\nGross WPM: ${grossWpmEl.textContent}\nNet WPM: ${netWpmEl.textContent}\nAccuracy: ${accuracyEl.textContent}`);
}

// Button Listeners
if (startBtn) {
    startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startBtn.blur(); // Remove focus so Spacebar doesn't re-trigger start button
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

// Custom Text & File Loaders
const loadCustomBtn = document.getElementById('loadCustomBtn');
if (loadCustomBtn) {
    loadCustomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const customTxt = document.getElementById('customTextInput')?.value;
        if (customTxt && customTxt.trim().length > 0) {
            currentText = customTxt.trim();
            if (levelDisplay) levelDisplay.textContent = "Custom Practice Mode";
            loadCustomBtn.blur();
            initTest();
        }
    });
}

const fileUploader = document.getElementById('fileUploader');
if (fileUploader) {
    fileUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                currentText = evt.target.result.trim();
                const customTextInput = document.getElementById('customTextInput');
                if (customTextInput) customTextInput.value = currentText;
                if (levelDisplay) levelDisplay.textContent = `File: ${file.name}`;
                initTest();
            };
            reader.readAsText(file);
        }
    });
}

// Render Initial 3D Keyboard
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
