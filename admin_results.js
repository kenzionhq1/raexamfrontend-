async function loadResults() {
  const res = await fetch('https://ra-exam.onrender.com/api/results');
  const data = await res.json();
  const body = document.getElementById('resultBody');

  if (data.success) {
    data.results.forEach(r => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${r.name}</td>
        <td>${r.rank}</td>
        <td>${r.score}/${r.totalQuestions}</td>
        <td>${r.percentage}%</td>
        <td>${new Date(r.createdAt).toLocaleString()}</td>
      `;
      row.style.cursor = 'pointer';
      row.onclick = () => {
        window.location.href = `admin_review.html?id=${r._id}`;
      };
      body.appendChild(row);
    });
  } else {
    body.innerHTML = '<tr><td colspan="5">Error loading results</td></tr>';
  }
}

loadResults();
