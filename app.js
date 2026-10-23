const lessonsData = {
    1: "ffff jjjj dddd kkkk ssss llll aaaa ;;;; fj dk sl a; fjdk sl a;",
    2: "eiei ruru tutu yyyy eee rrr ttt yyy touch typing mastery",
    3: "vvvv mmmm cccc ,,,, ....\n vmc, .vmc vmc,.",
    4: "1234 5678 9012 3456 7890 1234 5678"
};

let currentText = "";
let currentIndex = 0;
let errorsCount = 0;
let startTime = null;

// Navigation Tab Switching
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        item.classList.add('active');
        const tabId = item.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId).classList.add('active');
    });
});

// Start Lesson Handler
document.querySelectorAll('.btn-start').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const lessonNum = e.target.closest('.lesson-card').getAttribute('data-lesson');
        currentText = lessonsData[lessonNum];
        startPracticeSession(currentText);
    });
});

function startPracticeSession(text) {
    document.querySelector('.lessons-grid').classList.add('hidden');
    document.getElementById('practice-console').classList.remove('hidden');
    
    currentIndex = 0;
    errorsCount = 0;
    startTime = null;
    
    renderText(text);
    
    const hiddenInput = document.getElementById('hidden-input');
    hiddenInput.value = '';
    hiddenInput.focus();
}

function renderText(text) {
    const displayBox = document.getElementById('text-display');
    displayBox.innerHTML = text.split('').map((char, index) => {
        let cls = 'char';
        if (index === 0) cls += ' current';
        return `<span class="${cls}" data-index="${index}">${char === ' ' ? '&nbsp;' : (char === '\n' ? '↵' : char)}</span>`;
    }).join('');
}

const hiddenInput = document.getElementById('hidden-input');
document.getElementById('practice-console').addEventListener('click', () => hiddenInput.focus());

hiddenInput.addEventListener('input', (e) => {
    if (!startTime) startTime = new Date();
    
    const typedVal = e.target.value;
    if (typedVal.length === 0) return;
    
    const charTyped = typedVal[typedVal.length - 1];
    const targetChar = currentText[currentIndex];
    
    const charSpans = document.querySelectorAll('#text-display .char');
    
    if (charTyped === targetChar) {
        charSpans[currentIndex].classList.remove('current', 'incorrect');
        charSpans[currentIndex].classList.add('correct');
        currentIndex++;
        
        highlightKey(targetChar);
        
        if (currentIndex < currentText.length) {
            charSpans[currentIndex].classList.add('current');
        } else {
            alert('🎉 Lesson Completed Successfully!');
            resetToLessons();
        }
    } else {
        errorsCount++;
        charSpans[currentIndex].classList.add('incorrect');
        document.getElementById('stat-err').textContent = errorsCount;
    }
    
    updateStats();
    e.target.value = '';
});

function highlightKey(char) {
    const keyEl = document.querySelector(`.key[data-key="${char.toLowerCase()}"]`);
    if (keyEl) {
        keyEl.classList.add('active-key');
        setTimeout(() => keyEl.classList.remove('active-key'), 150);
    }
}

function updateStats() {
    if (!startTime) return;
    const timeElapsedMinutes = (new Date() - startTime) / 60000;
    if (timeElapsedMinutes <= 0) return;
    
    const wordsTyped = currentIndex / 5;
    const grossWPM = Math.round(wordsTyped / timeElapsedMinutes);
    const netWPM = Math.max(0, Math.round((wordsTyped - (errorsCount / 5)) / timeElapsedMinutes));
    const accuracy = Math.max(0, Math.round(((currentIndex - errorsCount) / currentIndex) * 100));
    
    document.getElementById('stat-wpm').textContent = grossWPM;
    document.getElementById('stat-net').textContent = netWPM;
    document.getElementById('stat-acc').textContent = accuracy + '%';
    
    document.getElementById('best-wpm').textContent = netWPM;
    document.getElementById('best-acc').textContent = accuracy + '%';
    document.getElementById('cert-wpm').textContent = netWPM + ' WPM';
    document.getElementById('cert-acc').textContent = accuracy + '%';
}

document.getElementById('btn-back-lessons').addEventListener('click', resetToLessons);

function resetToLessons() {
    document.getElementById('practice-console').classList.add('hidden');
    document.querySelector('.lessons-grid').classList.remove('hidden');
}

// 1-Minute Speed Test Handler
document.getElementById('start-speed-test').addEventListener('click', () => {
    document.getElementById('start-speed-test').classList.add('hidden');
    document.getElementById('speed-test-arena').classList.remove('hidden');
    
    const testText = "The quick brown fox jumps over the lazy dog. Professional typists achieve high WPM scores by practicing touch typing regularly without looking down at the keyboard.";
    const displayBox = document.getElementById('test-text-display');
    displayBox.innerHTML = testText.split('').map((c, i) => `<span class="char ${i===0?'current':''}" data-index="${i}">${c}</span>`).join('');
    
    let timeLeft = 60;
    const timerEl = document.getElementById('timer-count');
    const testInput = document.getElementById('test-hidden-input');
    testInput.focus();
    
    let testIndex = 0;
    
    const countdown = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            alert('⏰ Test Finished! Check your statistics and certificate tabs.');
            document.getElementById('start-speed-test').classList.remove('hidden');
            document.getElementById('speed-test-arena').classList.add('hidden');
        }
    }, 1000);
    
    testInput.oninput = (e) => {
        const val = e.target.value;
        if (val.length === 0) return;
        const typed = val[val.length - 1];
        const spans = displayBox.querySelectorAll('.char');
        
        if (typed === testText[testIndex]) {
            spans[testIndex].classList.remove('current', 'incorrect');
            spans[testIndex].classList.add('correct');
            testIndex++;
            if (testIndex < testText.length) spans[testIndex].classList.add('current');
        } else {
            spans[testIndex].classList.add('incorrect');
        }
        e.target.value = '';
    };
});
