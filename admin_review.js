const resultId = localStorage.getItem("selectedResultId");

if (!resultId) {
  alert("No result selected.");
  window.location.href = "admin_results.html";
}

fetch(`https://ra-exam.onrender.com/api/result/${resultId}`)
  .then(res => res.json())
  .then(data => {
    if (data.success && data.result) {
      const result = data.result;
      document.getElementById("userInfo").textContent = `${result.name} (${result.rank}) — Score: ${result.score}/${result.totalQuestions}`;

      const percent = result.percentage;
      document.getElementById("scoreText").textContent = `${percent}%`;
      document.getElementById("circle").style.background = `conic-gradient(#27ae60 ${percent}%, #dcdde1 ${percent}%)`;

      const reviewDiv = document.getElementById("review");
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
    } else {
      alert("Failed to load result details.");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error loading result");
  });

function goBack() {
  window.location.href = "admin_results.html";
}

function exportToPDF() {
  html2pdf().from(document.body).save("result_review.pdf");
}
