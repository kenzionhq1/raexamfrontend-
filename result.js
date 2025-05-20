const result = JSON.parse(localStorage.getItem('result'));
const user = JSON.parse(localStorage.getItem('user'));

if (!result || !user) {
  document.body.innerHTML = `<h3 style="color:red;text-align:center">No result to show. Please complete an exam first.</h3>`;
  throw new Error("Missing result or user");
}

// Display user info
document.getElementById('userInfo').textContent = `${user.name} (${user.rank}) — Score: ${result.score}/${result.answers.length}`;

// Update percentage circle
const percent = result.percentage;
document.getElementById('scoreText').textContent = `${percent}%`;
document.getElementById('circle').style.background = `conic-gradient(#27ae60 ${percent}%, #dcdde1 ${percent}%)`;

// Render answer review
const reviewDiv = document.getElementById('review');
reviewDiv.innerHTML = result.answers.map((q, i) => {
  let className = '';
  let userLabel = '';

  if (!q.userAnswer) {
    className = 'skipped';
    userLabel = `<span class="skipped-label">Not Answered</span>`;
  } else if (q.userAnswer === q.correctAnswer) {
    className = 'correct';
    userLabel = `<span class="correct-label">${q.userAnswer} ✔</span>`;
  } else {
    className = 'wrong';
    userLabel = `<span class="wrong-label">${q.userAnswer} ✘</span>`;
  }

  return `
    <div class="review-block ${className}">
      <p><strong>${i + 1}. ${q.question}</strong></p>
      ${q.options.map(opt => {
        const isCorrect = opt === q.correctAnswer;
        return `<p style="margin-left:20px;${isCorrect ? 'color:green' : ''}">${opt}</p>`;
      }).join('')}
      <p style="margin-left:20px">${userLabel}</p>
    </div>
  `;
}).join('');


function downloadPDF() {
  const element = document.body;
  // Hide the button before generating the PDF
  const downloadButton = document.getElementById('downloadButton');
  if (downloadButton) downloadButton.style.display = 'none';

  const opt = {
    margin:       0.5,
    filename:     `${user.name}_result.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save().finally(() => {
    // Show the button again after generating the PDF
    if (downloadButton) downloadButton.style.display = 'block';
  });
  html2pdf().from(element).set(opt).save();
}

