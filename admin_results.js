let allResults = [];

fetch("https://ra-exam.onrender.com/api/results")
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      allResults = data.results;
      renderTable(allResults);
    } else {
      alert("Failed to fetch results");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error fetching results");
  });

function renderTable(results) {
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  results.forEach(result => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${result.name}</td>
      <td>${result.rank}</td>
      <td>${result.score}/${result.totalQuestions}</td>
      <td>${result.percentage}%</td>
      <td>${new Date(result.createdAt).toLocaleString()}</td>
      <td>
        <button class="view-btn" data-id="${result._id}">View</button>
        <button class="delete-btn" data-id="${result._id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      localStorage.setItem("selectedResultId", id);
      window.location.href = "admin_review.html";
    };
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-id");
      const confirmDel = confirm("Are you sure you want to delete this result?");
      if (!confirmDel) return;

      try {
        const res = await fetch(`https://ra-exam.onrender.com/api/admin/delete-result/${id}`, {

          method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
          alert("Result deleted.");
          location.reload();
        } else {
          alert("Delete failed.");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting result.");
      }
    };
  });
}

document.getElementById("searchInput").addEventListener("input", filterResults);
document.getElementById("rankFilter").addEventListener("change", filterResults);

function filterResults() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const rank = document.getElementById("rankFilter").value;

  const filtered = allResults.filter(r =>
    (r.name.toLowerCase().includes(search) || r.rank.toLowerCase().includes(search)) &&
    (rank === "" || r.rank === rank)
  );

  renderTable(filtered);
}
