const user = JSON.parse(localStorage.getItem('user'));
const form = document.getElementById('examForm');
const timerDisplay = document.getElementById('timer');
let timeLeft = 30 * 60;
let questions = [];
let currentIndex = 0;

// Timer logic
const timer = setInterval(() => {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  if (timeLeft === 5 * 60) timerDisplay.style.color = 'red';
  if (timeLeft <= 0) {
    clearInterval(timer);
    submitExam();
  }
  timeLeft--;
}, 1000);

// Load questions from backend
async function loadQuestions() {
  const res = await fetch(`https://ra-exam.onrender.com/api/questions?rank=${encodeURIComponent(user.rank)}`);
  const data = await res.json();

  if (data.success && data.questions && data.questions.length > 0) {
    questions = data.questions;
    renderQuestion(currentIndex);
  } else {
    form.innerHTML = `<p style="color: red;">Failed to load questions for rank: ${user.rank}</p>`;
    document.getElementById('navigation').style.display = 'none';
  }
}

// Render one question at a time
function renderQuestion(index) {
  if (!questions || !questions[index]) {
    console.warn('Question not found at index:', index);
    return;
  }

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

// Save the selected answer to localStorage
function saveAnswer() {
  const q = questions[currentIndex];
  if (!q || !q._id) return;
  const selected = document.querySelector(`input[name="${q._id}"]:checked`);
  if (selected) {
    localStorage.setItem(q._id, selected.value);
  }
}

// Navigation buttons
document.getElementById('prevBtn').onclick = () => {
  saveAnswer();
  currentIndex--;
  renderQuestion(currentIndex);
};

document.getElementById('nextBtn').onclick = () => {
  const q = questions[currentIndex];
  const selected = document.querySelector(`input[name="${q._id}"]:checked`);
  if (!selected) return alert("Please answer this question before continuing.");
  saveAnswer();
  currentIndex++;
  renderQuestion(currentIndex);
};

document.getElementById('submitBtn').onclick = async () => {
  if (!questions.length) {
    alert("No questions loaded. Please try again.");
    return;
  }

  saveAnswer();

  const answers = {};
  questions.forEach(q => {
    const val = localStorage.getItem(q._id);
    if (val) answers[q._id] = val;
  });

  const unanswered = questions.length - Object.keys(answers).length;
  if (unanswered > 0) {
    const confirmSubmit = confirm(`You skipped ${unanswered} question(s). Submit anyway?`);
    if (!confirmSubmit) return;
  }

  const res = await fetch(`https://ra-exam.onrender.com/api/submit-exam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: user.name, rank: user.rank, answers })
  });

  const result = await res.json();
  if (result.success) {
    localStorage.setItem('result', JSON.stringify(result));
    window.location.href = 'result.html';
  } else {
    alert("Error submitting exam.");
  }
};

// Show/hide Next/Prev/Submit buttons
function updateButtons() {
  document.getElementById('prevBtn').disabled = currentIndex === 0;
  document.getElementById('nextBtn').style.display = currentIndex < questions.length - 1 ? 'inline-block' : 'none';
  document.getElementById('submitBtn').style.display = currentIndex === questions.length - 1 ? 'inline-block' : 'none';
}

loadQuestions();
