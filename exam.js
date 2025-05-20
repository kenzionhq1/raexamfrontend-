const user = JSON.parse(localStorage.getItem('user'));
const form = document.getElementById('examForm');
const timerDisplay = document.getElementById('timer');
let timeLeft;
let questions = [];
let currentIndex = 0;

// Check stored data
const examStart = localStorage.getItem('examStartTime');
const storedQuestions = localStorage.getItem('currentExam');

// Prevent if already submitted
(async () => {
  const check = await fetch('https://ra-exam.onrender.com/api/check-submitted', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: user.name, rank: user.rank })
  });
  const result = await check.json();
  if (result.submitted) {
    localStorage.setItem('result', JSON.stringify(result.result));
    window.location.href = 'result.html';
  }
})();

// Resume timer if exam started
if (examStart && storedQuestions) {
  const elapsed = Math.floor((Date.now() - parseInt(examStart)) / 1000);
  timeLeft = Math.max(0, 30 * 60 - elapsed);
  questions = JSON.parse(storedQuestions);

  window.addEventListener('DOMContentLoaded', () => {
    renderQuestion(currentIndex);
  });
} else {
  localStorage.setItem('examStartTime', Date.now().toString());
  timeLeft = 30 * 60;
  loadQuestions();
}

// Show loading
form.innerHTML = `<p style="text-align:center">Loading questions...</p>`;

// Timer logic
const timer = setInterval(() => {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (timeLeft === 5 * 60) {
    timerDisplay.style.color = 'red';
    timerDisplay.style.animation = 'blink 1s step-start 0s infinite';
    const style = document.createElement('style');
    style.innerHTML = `@keyframes blink { 50% { opacity: 0; } }`;
    document.head.appendChild(style);
  }

  if (timeLeft <= 0) {
    clearInterval(timer);
    alert("Time is up! Submitting now.");
    submitExam();
  }

  timeLeft--;
}, 1000);

// Load questions
async function loadQuestions() {
  try {
    await fetch('https://ra-exam.onrender.com/api/ping').catch(() => {});
    const res = await fetch(`https://ra-exam.onrender.com/api/questions?rank=${encodeURIComponent(user.rank)}`);
    const data = await res.json();

    if (data.success && data.questions) {
      questions = data.questions;
      localStorage.setItem('currentExam', JSON.stringify(questions));
      renderQuestion(currentIndex);
    } else {
      form.innerHTML = `<p style="color: red;">No questions for this rank.</p>`;
    }
  } catch (err) {
    form.innerHTML = `<p style="color: red;">Error loading questions.</p>`;
  }
}

// Render question
function renderQuestion(index) {
  if (!questions || !questions[index]) return;

  const q = questions[index];
  document.getElementById('progress').textContent = `Question ${index + 1} of ${questions.length}`;

  form.innerHTML = `<div class="question-block">
    <p><strong>${index + 1}. ${q.question}</strong></p>
    ${q.options.map(opt => `
      <label><input type="radio" name="${q._id}" value="${opt}" required> ${opt}</label>
    `).join('')}
  </div>`;

  const saved = localStorage.getItem(q._id);
  if (saved) {
    const input = document.querySelector(`input[name="${q._id}"][value="${saved}"]`);
    if (input) input.checked = true;
  }

  updateButtons();
}

// Save answer
function saveAnswer() {
  const q = questions[currentIndex];
  if (!q || !q._id) return;
  const selected = document.querySelector(`input[name="${q._id}"]:checked`);
  if (selected) localStorage.setItem(q._id, selected.value);
}

// Navigation
document.getElementById('prevBtn').onclick = () => {
  saveAnswer();
  currentIndex--;
  renderQuestion(currentIndex);
};

document.getElementById('nextBtn').onclick = () => {
  saveAnswer();
  currentIndex++;
  if (currentIndex >= questions.length) {
    alert("You have reached the end.");
    return;
  }
  renderQuestion(currentIndex);
};

// Submit
document.getElementById('submitBtn').onclick = submitExam;

async function submitExam() {
  if (!questions.length) {
    alert("No questions loaded.");
    return;
  }

  saveAnswer();

  const answers = {};
  questions.forEach(q => {
    const val = localStorage.getItem(q._id);
    if (val) answers[q._id] = val;
  });

  const res = await fetch(`https://ra-exam.onrender.com/api/submit-exam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: user.name, rank: user.rank, answers })
  });

  const result = await res.json();

  // Already submitted
  if (result.success === false && result.result) {
    alert("You already submitted. Redirecting to result.");
    localStorage.setItem('result', JSON.stringify(result.result));
    return window.location.href = 'result.html';
  }

  if (result.success) {
    questions.forEach(q => localStorage.removeItem(q._id));
    localStorage.removeItem('currentExam');
    localStorage.removeItem('examStartTime');

    localStorage.setItem('result', JSON.stringify(result));
    window.location.href = 'result.html';
  } else {
    alert("Submission failed.");
  }
}

// Buttons
function updateButtons() {
  document.getElementById('prevBtn').disabled = currentIndex === 0;
  document.getElementById('nextBtn').style.display = currentIndex < questions.length - 1 ? 'inline-block' : 'none';
  document.getElementById('submitBtn').style.display = currentIndex === questions.length - 1 ? 'inline-block' : 'none';
}

// Protect exam — only if user actually leaves tab
let blurTimestamp = null;

window.addEventListener('blur', () => {
  blurTimestamp = Date.now();
});

window.addEventListener('focus', () => {
  const timeAway = Date.now() - (blurTimestamp || Date.now());
  if (timeAway > 2000) {
    alert("You left the exam tab. Exam cancelled.");
    localStorage.clear();
    window.location.href = "dashboard.html";
  }
});

window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  e.returnValue = "Warning: leaving will erase your exam.";
});
