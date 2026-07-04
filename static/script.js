// ============================================================
// SmartBiz AI — dashboard logic
// Talks to your Flask backend via fetch().
// Expected endpoints (add these to app.py — see the snippet
// provided separately):
//   GET  /api/sales            -> [{id, product, quantity, price}, ...]
//   POST /api/sales            -> body {product, quantity, price}
//   DELETE /api/sales/<id>     -> deletes one entry
//   POST /api/ask              -> body {question}  ->  {answer}
// ============================================================

let salesData = [];
let salesChart, reportChart;

document.getElementById("today-date").textContent = new Date().toLocaleDateString(
  "en-IN", { weekday: "long", day: "numeric", month: "long" }
);

// ---------- Tab switching ----------
function setActiveTab(tab) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
  document.getElementById("tab-" + tab).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".mnav-item").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
}
document.querySelectorAll(".nav-item, .mnav-item").forEach(btn => {
  btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
});

// ---------- Helpers ----------
function currency(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

// ---------- Fetch sales from backend ----------
async function loadSales() {
  try {
    const res = await fetch("/api/sales");
    salesData = await res.json();
  } catch (err) {
    console.error("Could not load sales:", err);
    salesData = [];
  }
  renderDashboard();
  renderEntries();
  renderReport();
}

// ---------- Dashboard rendering ----------
function renderDashboard() {
  const total = salesData.reduce((sum, s) => sum + s.quantity * s.price, 0);
  const orders = salesData.length;
  const profit = Math.round(total * 0.22); // TODO: replace with real margin logic

  document.getElementById("total-sales").textContent = currency(total);
  document.getElementById("order-count-text").textContent = `from ${orders} sales recorded today`;
  document.getElementById("orders-count").textContent = orders;
  document.getElementById("est-profit").textContent = currency(profit);

  const byProduct = {};
  salesData.forEach(s => { byProduct[s.product] = (byProduct[s.product] || 0) + s.quantity; });
  const top = Object.entries(byProduct).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("top-product").textContent = top ? top[0] : "—";

  // Recent list (last 8)
  const list = document.getElementById("recent-list");
  list.innerHTML = "";
  salesData.slice().reverse().slice(0, 8).forEach(s => {
    const row = document.createElement("div");
    row.className = "recent-item";
    row.innerHTML = `
      <div class="ritem-left">
        <div class="dot"></div>
        <div>
          <div class="ritem-name">${s.product}</div>
          <div class="ritem-meta">${s.quantity} × ${currency(s.price)}</div>
        </div>
      </div>
      <div class="ritem-amount">${currency(s.quantity * s.price)}</div>`;
    list.appendChild(row);
  });

  // Chart: sales per product (simple bar chart from live data)
  const ctx = document.getElementById("salesChart");
  const labels = Object.keys(byProduct);
  const values = labels.map(l => byProduct[l] * (salesData.find(s => s.product === l)?.price || 0));
  if (salesChart) salesChart.destroy();
  salesChart = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: values, backgroundColor: "#2F6F4E", borderRadius: 6 }] },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: v => "₹" + v } } }
    }
  });
}

// ---------- Add Sale tab ----------
const productInput = document.getElementById("product-input");
const qtyInput = document.getElementById("qty-input");
const priceInput = document.getElementById("price-input");
const liveTotal = document.getElementById("live-total");

function updateLiveTotal() {
  const qty = Number(qtyInput.value) || 0;
  const price = Number(priceInput.value) || 0;
  liveTotal.textContent = currency(qty * price);
}
qtyInput.addEventListener("input", updateLiveTotal);
priceInput.addEventListener("input", updateLiveTotal);

document.getElementById("sale-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    product: productInput.value,
    quantity: Number(qtyInput.value),
    price: Number(priceInput.value)
  };
  try {
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    productInput.value = "";
    qtyInput.value = 1;
    priceInput.value = "";
    updateLiveTotal();
    const msg = document.getElementById("confirm-msg");
    msg.classList.remove("hidden");
    setTimeout(() => msg.classList.add("hidden"), 2000);
    await loadSales();
  } catch (err) {
    console.error("Could not save sale:", err);
    alert("Could not save sale. Check that your Flask server is running.");
  }
});

function renderEntries() {
  const entriesList = document.getElementById("entries-list");
  document.getElementById("entries-title").textContent = `Today's entries (${salesData.length})`;
  entriesList.innerHTML = "";
  if (salesData.length === 0) {
    entriesList.innerHTML = `<div class="card-sub">No sales recorded yet today. Add your first one on the left.</div>`;
    return;
  }
  salesData.slice().reverse().forEach(s => {
    const row = document.createElement("div");
    row.className = "entry-item";
    row.innerHTML = `
      <div>
        <div class="ritem-name">${s.product}</div>
        <div class="ritem-meta">${s.quantity} × ${currency(s.price)}</div>
      </div>
      <div style="display:flex;align-items:center;">
        <span class="ritem-amount">${currency(s.quantity * s.price)}</span>
        <button class="delete-btn" data-id="${s.id}">🗑</button>
      </div>`;
    entriesList.appendChild(row);
  });
  entriesList.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await fetch(`/api/sales/${btn.dataset.id}`, { method: "DELETE" });
        await loadSales();
      } catch (err) {
        console.error("Could not delete sale:", err);
      }
    });
  });
}

// ---------- Reports tab ----------
function renderReport() {
  const byProduct = {};
  salesData.forEach(s => { byProduct[s.product] = (byProduct[s.product] || 0) + s.quantity * s.price; });
  const ctx = document.getElementById("reportChart");
  if (reportChart) reportChart.destroy();
  reportChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(byProduct),
      datasets: [{ data: Object.values(byProduct), backgroundColor: "#B8863D", borderRadius: 6 }]
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { callback: v => "₹" + v } } }
    }
  });
}

// ---------- Assistant tab ----------
const chatMessages = document.getElementById("chat-messages");

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function askAssistant(question) {
  addMessage("user", question);
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    addMessage("assistant", data.answer || "Sorry, I couldn't get an answer right now.");
  } catch (err) {
    console.error("Assistant error:", err);
    addMessage("assistant", "I couldn't reach the assistant. Check that your Flask server and Gemini API key are working.");
  }
}

document.getElementById("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  if (!input.value.trim()) return;
  askAssistant(input.value.trim());
  input.value = "";
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => askAssistant(chip.textContent));
});

// ---------- Init ----------
updateLiveTotal();
loadSales();
