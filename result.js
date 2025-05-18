const result = JSON.parse(localStorage.getItem('result'));
const user = JSON.parse(localStorage.getItem('user'));
document.getElementById('userInfo').textContent = `${user.name} (${user.rank}) | Score: ${result.score}/${result.answers.length}`;

const circle = document.getElementById('circle');
const scoreText = document.getElementById('scoreText');
const review = document.getElementById('review');

scoreText.textContent = `${result.percentage}%`;
circle.style.background = `conic-gradient(#00cc66 ${result.percentage}%, #ccc ${result.percentage}%)`;

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
      label.textContent += ' correct 🎉';
    } else if (opt === item.userAnswer && opt !== item.correctAnswer) {
      label.style.color = 'red';
      label.textContent += ' incorrect ❌';
    }
    if (opt === item.userAnswer && opt !== item.correctAnswer) {
      label.style.color = 'red';
    }
    div.appendChild(label);
  });

  review.appendChild(div);
});
