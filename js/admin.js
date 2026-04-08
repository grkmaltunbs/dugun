// ============================================================
//  ADMIN PANELİ
// ============================================================

const CFG = window.WEDDING_CONFIG;

firebase.initializeApp(CFG.firebase);
const auth = firebase.auth();
const db = firebase.firestore();

const loginView = document.getElementById("loginView");
const dashView = document.getElementById("dashView");

// ---------- State ----------
let ALL = [];           // tüm kayıtlar
let FILTERED = [];      // filtrelenmiş
let page = 1;
const PAGE_SIZE = 20;
let sortKey = "createdAt";
let sortDir = -1; // yeni -> eski

let chartAttending, chartSide, chartTimeline;

// ---------- AUTH ----------
auth.onAuthStateChanged((user) => {
  if (user) {
    loginView.style.display = "none";
    dashView.classList.add("active");
    document.getElementById("adminEmail").textContent = user.email;
    loadData();
  } else {
    loginView.style.display = "flex";
    dashView.classList.remove("active");
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  const err = document.getElementById("loginError");
  err.textContent = "";
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (ex) {
    err.textContent = "Giriş başarısız: " + (ex.message || "Hatalı bilgi");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());

// ---------- DATA ----------
async function loadData() {
  try {
    // Realtime listener
    db.collection("rsvps").orderBy("createdAt", "desc").onSnapshot((snap) => {
      ALL = [];
      snap.forEach((doc) => {
        const d = doc.data();
        ALL.push({
          id: doc.id,
          name: d.name || "",
          phone: d.phone || "",
          attending: d.attending || "",
          guestCount: d.guestCount || 0,
          side: d.side || "",
          note: d.note || "",
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(0)
        });
      });
      applyFilters();
      updateStats();
      updateCharts();
    }, (err) => {
      console.error(err);
      alert("Veri çekilemedi: " + err.message);
    });
  } catch (e) {
    console.error(e);
  }
}

// ---------- STATS ----------
function updateStats() {
  const total = ALL.length;
  const yes = ALL.filter(r => r.attending === "evet").length;
  const no = ALL.filter(r => r.attending === "hayir").length;
  const guests = ALL.filter(r => r.attending === "evet").reduce((a, r) => a + (r.guestCount || 1), 0);

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statYes").textContent = yes;
  document.getElementById("statNo").textContent = no;
  document.getElementById("statGuests").textContent = guests;
  document.getElementById("statYesPct").textContent = total ? `%${Math.round(yes/total*100)}` : "—";
  document.getElementById("statNoPct").textContent = total ? `%${Math.round(no/total*100)}` : "—";
}

// ---------- CHARTS ----------
function updateCharts() {
  const yes = ALL.filter(r => r.attending === "evet").length;
  const no = ALL.filter(r => r.attending === "hayir").length;

  // Pie: katılım
  const dataAtt = {
    labels: ["Katılacak", "Katılamayacak"],
    datasets: [{ data: [yes, no], backgroundColor: ["#5cb85c", "#d9534f"], borderWidth: 0 }]
  };
  if (chartAttending) chartAttending.destroy();
  chartAttending = new Chart(document.getElementById("chartAttending"), {
    type: "doughnut",
    data: dataAtt,
    options: { plugins: { legend: { position: "bottom" } }, cutout: "65%" }
  });

  // Pie: taraf
  const sides = { gelin: 0, damat: 0, ortak: 0 };
  ALL.forEach(r => { if (sides[r.side] !== undefined) sides[r.side]++; });
  if (chartSide) chartSide.destroy();
  chartSide = new Chart(document.getElementById("chartSide"), {
    type: "doughnut",
    data: {
      labels: ["Gelin Tarafı", "Damat Tarafı", "Her İkisi"],
      datasets: [{ data: [sides.gelin, sides.damat, sides.ortak], backgroundColor: ["#d4a5a5", "#c9a961", "#a58bc4"], borderWidth: 0 }]
    },
    options: { plugins: { legend: { position: "bottom" } }, cutout: "65%" }
  });

  // Timeline: günlük cevap sayısı
  const byDay = {};
  ALL.forEach(r => {
    if (!r.createdAt) return;
    const key = r.createdAt.toISOString().substring(0, 10);
    byDay[key] = (byDay[key] || 0) + 1;
  });
  const sortedDays = Object.keys(byDay).sort();
  if (chartTimeline) chartTimeline.destroy();
  chartTimeline = new Chart(document.getElementById("chartTimeline"), {
    type: "line",
    data: {
      labels: sortedDays.map(d => {
        const [y, m, day] = d.split("-");
        return `${day}.${m}`;
      }),
      datasets: [{
        label: "Cevap sayısı",
        data: sortedDays.map(d => byDay[d]),
        borderColor: "#b07878",
        backgroundColor: "rgba(212, 165, 165, 0.2)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

// ---------- FILTERS & TABLE ----------
function applyFilters() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const att = document.getElementById("filterAttending").value;
  const side = document.getElementById("filterSide").value;

  FILTERED = ALL.filter(r => {
    if (att && r.attending !== att) return false;
    if (side && r.side !== side) return false;
    if (q) {
      const hay = `${r.name} ${r.phone} ${r.note}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  sortData();
  page = 1;
  renderTable();
}

function sortData() {
  FILTERED.sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (va instanceof Date) { va = va.getTime(); vb = vb.getTime(); }
    if (typeof va === "string") return sortDir * va.localeCompare(vb, "tr");
    return sortDir * ((va || 0) - (vb || 0));
  });
}

function renderTable() {
  const tbody = document.getElementById("guestTbody");
  const empty = document.getElementById("emptyState");
  tbody.innerHTML = "";

  if (FILTERED.length === 0) {
    empty.style.display = "block";
    document.getElementById("pageInfo").textContent = "Sayfa 0 / 0";
    return;
  }
  empty.style.display = "none";

  const totalPages = Math.max(1, Math.ceil(FILTERED.length / PAGE_SIZE));
  if (page > totalPages) page = totalPages;
  const start = (page - 1) * PAGE_SIZE;
  const slice = FILTERED.slice(start, start + PAGE_SIZE);

  slice.forEach(r => {
    const tr = document.createElement("tr");
    const attBadge = r.attending === "evet"
      ? '<span class="badge yes">✓ Katılacak</span>'
      : r.attending === "hayir"
        ? '<span class="badge no">✗ Katılmayacak</span>'
        : "—";
    const sideText = r.side === "gelin" ? "Gelin" : r.side === "damat" ? "Damat" : r.side === "ortak" ? "Her İkisi" : "—";
    const dateText = r.createdAt ? r.createdAt.toLocaleDateString("tr-TR") + " " + r.createdAt.toLocaleTimeString("tr-TR", {hour:"2-digit",minute:"2-digit"}) : "—";
    const phoneFmt = r.phone.length >= 10 ? `0${r.phone.substring(0,3)} ${r.phone.substring(3,6)} ${r.phone.substring(6,8)} ${r.phone.substring(8,10)}` : r.phone;

    tr.innerHTML = `
      <td><strong>${escapeHtml(r.name)}</strong></td>
      <td>${escapeHtml(phoneFmt)}</td>
      <td>${attBadge}</td>
      <td>${r.attending === "evet" ? r.guestCount : "—"}</td>
      <td><span class="side-badge">${sideText}</span></td>
      <td title="${escapeHtml(r.note)}">${escapeHtml((r.note || "").substring(0, 40))}${r.note && r.note.length > 40 ? "..." : ""}</td>
      <td>${dateText}</td>
      <td><button class="delete-btn" data-id="${r.id}">Sil</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (confirm("Bu kaydı silmek istediğinizden emin misiniz?")) {
        await db.collection("rsvps").doc(btn.dataset.id).delete();
      }
    });
  });

  document.getElementById("pageInfo").textContent = `Sayfa ${page} / ${totalPages} (${FILTERED.length} kayıt)`;
  document.getElementById("prevPage").disabled = page <= 1;
  document.getElementById("nextPage").disabled = page >= totalPages;
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// ---------- EVENTS ----------
document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("filterAttending").addEventListener("change", applyFilters);
document.getElementById("filterSide").addEventListener("change", applyFilters);

document.getElementById("prevPage").addEventListener("click", () => { if (page > 1) { page--; renderTable(); } });
document.getElementById("nextPage").addEventListener("click", () => { page++; renderTable(); });

document.querySelectorAll("th[data-sort]").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    if (sortKey === key) sortDir = -sortDir; else { sortKey = key; sortDir = 1; }
    document.querySelectorAll("th").forEach(t => t.classList.remove("sorted"));
    th.classList.add("sorted");
    sortData();
    renderTable();
  });
});

// ---------- CSV EXPORT ----------
document.getElementById("exportBtn").addEventListener("click", () => {
  const header = ["Ad Soyad", "Telefon", "Katılım", "Kişi Sayısı", "Taraf", "Not", "Tarih"];
  const rows = FILTERED.map(r => [
    r.name,
    r.phone,
    r.attending === "evet" ? "Katılacak" : "Katılmayacak",
    r.attending === "evet" ? r.guestCount : 0,
    r.side === "gelin" ? "Gelin" : r.side === "damat" ? "Damat" : "Her İkisi",
    (r.note || "").replace(/\n/g, " "),
    r.createdAt ? r.createdAt.toLocaleString("tr-TR") : ""
  ]);
  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `misafir-listesi-${new Date().toISOString().substring(0,10)}.csv`;
  a.click();
});
