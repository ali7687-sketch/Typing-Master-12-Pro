// Typing Master Pro Core Engine
const sampleTexts = [
    "The quick brown fox jumps over the lazy dog near the quiet river bank.",
    "Mastering touch typing requires consistent daily practice and concentration.",
    "Clean code always reads like well-written prose in high-performance web systems."
];

let currentText = "";
let currentIndex = 0;
let errors = 0;
let totalKeystrokes = 0;
let timer = null;
let timeRemaining = 60;
let isTesting = false;

const displayEl = document.getElementById('textDisplay');
const netWpmEl = document.getElementById('netWpm');
const accuracyEl = document.getElementById('accuracy');
const timeEl = document.getElementById('timeRemaining');
const errorEl = document.getElementById('errorCount');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

function initTest() {
    currentText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    currentIndex = 0;
    errors = 0;
    totalKeystrokes = 0;
    timeRemaining = parseInt(document.getElementById('timerSelect').value) || 60;
    isTesting = false;

    clearInterval(timer);
    timeEl.textContent = `${timeRemaining}s`;
    netWpmEl.textContent = '0';
    accuracyEl.textContent = '100%';
    errorEl.textContent = '0';

    renderText();
}

function renderText() {
    displayEl.innerHTML = '';
    currentText.split('').forEach((char, idx) => {
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
            isTesting = false;
            alert(`Test Complete! Your WPM: ${netWpmEl.textContent}`);
        }
    }, 1000);
}

function calculateStats() {
    const elapsedMinutes = (parseInt(document.getElementById('timerSelect').value) - timeRemaining) / 60;
    if (elapsedMinutes <= 0) return;

    const grossWpm = (totalKeystrokes / 5) / elapsedMinutes;
    const netWpm = Math.max(0, Math.round(grossWpm - (errors / elapsedMinutes)));
    const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;

    netWpmEl.textContent = netWpm;
    accuracyEl.textContent = `${accuracy}%`;
    errorEl.textContent = errors;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;
    if (!isTesting && e.key.length === 1) startTimer();

    if (isTesting) {
        totalKeystrokes++;
        const targetChar = currentText[currentIndex];
        const spanNodes = displayEl.querySelectorAll('span');

        if (e.key === targetChar) {
            spanNodes[currentIndex].className = 'char-correct';
            currentIndex++;
        } else {
            spanNodes[currentIndex].className = 'char-wrong';
            errors++;
        }

        if (currentIndex < currentText.length) {
            spanNodes[currentIndex].classList.add('char-current');
        } else {
            clearInterval(timer);
            isTesting = false;
            alert('Lesson completed successfully!');
        }
        calculateStats();
    }
});

startBtn.addEventListener('click', () => {
    initTest();
    startTimer();
});

resetBtn.addEventListener('click', initTest);

// Initialize on page load
initTest();
