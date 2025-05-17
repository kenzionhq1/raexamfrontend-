const params = new URLSearchParams(window.location.search);
const id = params.get('id');
let result = null;

function goBack() {
  window.location.href = 'admin_results.html';
}

async function loadReview() {
  const res = await fetch(`https://ra-exam.onrender.com/api/result/${id}`);
  const data = await res.json();
  if (data.success) {
    result = data.result;
    document.getElementById('userInfo').textContent =
      `${result.name} (${result.rank}) | ${result.score}/${result.totalQuestions} = ${result.percentage}%`;

    result.answers.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'question-review';
      const q = document.createElement('p');
      q.innerHTML = `<strong>${index + 1}. ${item.question}</strong>`;
      div.appendChild(q);

      item.options.forEach(opt => {
        const label = document.createElement('label');
        label.textContent = opt;
        label.style.display = 'block';

        if (opt === item.correctAnswer) {
          label.style.color = 'green';
          label.style.fontWeight = 'bold';
        }

        if (opt === item.userAnswer && opt !== item.correctAnswer) {
          label.style.color = 'red';
        }

        div.appendChild(label);
      });

      document.getElementById('review').appendChild(div);
    });
  } else {
    alert("Failed to load result.");
  }
}

async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(12);
  doc.text(`User: ${result.name}`, 10, y); y += 6;
  doc.text(`Rank: ${result.rank}`, 10, y); y += 6;
  doc.text(`Score: ${result.score}/${result.totalQuestions}`, 10, y); y += 6;
  doc.text(`Percentage: ${result.percentage}%`, 10, y); y += 10;

  result.answers.forEach((item, i) => {
    doc.setFont(undefined, 'bold');
    doc.text(`${i + 1}. ${item.question}`, 10, y); y += 6;

    item.options.forEach(opt => {
      let prefix = " ";
      if (opt === item.correctAnswer) prefix = "[✓]";
      else if (opt === item.userAnswer) prefix = "[X]";
      doc.setFont(undefined, 'normal');
      doc.text(`${prefix} ${opt}`, 14, y); y += 5;
    });

    y += 5;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save(`${result.name}_${result.rank}_review.pdf`);
}

loadReview();
