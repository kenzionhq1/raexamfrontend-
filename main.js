document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const rank = document.getElementById('rank').value;

  const btn = e.submitter;
  btn.disabled = true;
  btn.textContent = "Checking...";

  await fetch("https://ra-exam.onrender.com/api/ping").catch(() => {});

  const res = await fetch('https://ra-exam.onrender.com/api/start-exam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, rank })
  });

  const data = await res.json();

  if (data.success && data.allowed) {
    localStorage.setItem('user', JSON.stringify({ name, rank }));
    window.location.href = 'exam.html';
  } else if (data.success && data.alreadySubmitted) {
    localStorage.setItem('result', JSON.stringify(data.result));
    window.location.href = 'result.html';
  } else {
    alert("Access denied.");
    btn.disabled = false;
    btn.textContent = "Start Exam";
  }
});
