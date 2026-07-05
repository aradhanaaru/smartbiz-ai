// ============================================================
// SmartBiz AI — dashboard logic (with Tamil language support)
// ============================================================

let salesData = [];
let salesChart, reportChart;
let currentLang = localStorage.getItem("smartbiz_lang") || "en";

// ---------- Translations ----------
const translations = {
  en: {
    dashboard_nav: "Dashboard",
    add_sale_nav: "Add Sale",
    assistant_nav: "Ask Assistant",
    reports_nav: "Reports",
    greeting: "Good day, Boss!",
    today_total_label: "TODAY'S TOTAL SALES",
    seal_text: "GOOD<br>DAY",
    orders_today: "Orders Today",
    top_product: "Top Product",
    est_profit: "Est. Profit Today",
    margin_note: "~22% margin",
    sales_overview: "Sales overview",
    recent_sales: "Recent sales",
    record_sale_title: "Record a sale",
    record_sale_sub: "Fill this in after every sale — it takes 10 seconds.",
    product_name_label: "Product name",
    product_placeholder: "e.g. Basmati Rice 5kg",
    quantity_label: "Quantity",
    price_label: "Price per unit (₹)",
    total_label: "Total for this sale",
    record_sale_btn: "＋ Record sale",
    confirm_msg: "✓ Sale recorded successfully",
    assistant_header: "Ask your assistant",
    welcome_msg: "Namaste! I'm your business assistant, powered by Gemini. Ask me anything about your sales, stock, or profits — in plain language.",
    q1: "What sold best this week?",
    q2: "How much profit did I make today?",
    q3: "Which items are running low?",
    q4: "Compare today with yesterday",
    chat_placeholder: "Type your question...",
    reports_title: "Sales by product",
    reports_sub: "A quick look at where today's money came from.",
    no_entries: "No sales recorded yet today. Add your first one on the left.",
    entries_title: "Today's entries",
    couldnt_reach: "I couldn't reach the assistant. Check that your Flask server and Gemini API key are working.",
  },
  ta: {
    dashboard_nav: "டாஷ்போர்டு",
    add_sale_nav: "விற்பனை சேர்",
    assistant_nav: "உதவியாளர்",
    reports_nav: "அறிக்கைகள்",
    greeting: "வணக்கம், முதலாளி!",
    today_total_label: "இன்றைய மொத்த விற்பனை",
    seal_text: "நல்ல<br>நாள்",
    orders_today: "இன்றைய ஆர்டர்கள்",
    top_product: "சிறந்த பொருள்",
    est_profit: "இன்றைய மதிப்பு லாபம்",
    margin_note: "~22% லாப வீதம்",
    sales_overview: "விற்பனை கண்ணோட்டம்",
    recent_sales: "சமீபத்திய விற்பனைகள்",
    record_sale_title: "விற்பனையை பதிவு செய்யுங்கள்",
    record_sale_sub: "ஒவ்வொரு விற்பனைக்குப் பிறகும் இதை நிரப்பவும் — 10 வினாடிகள் ஆகும்.",
    product_name_label: "பொருளின் பெயர்",
    product_placeholder: "எ.கா. பாஸ்மதி அரிசி 5 கிலோ",
    quantity_label: "அளவு",
    price_label: "ஒரு அலகுக்கான விலை (₹)",
    total_label: "இந்த விற்பனைக்கான மொத்தம்",
    record_sale_btn: "＋ விற்பனையை பதிவு செய்",
    confirm_msg: "✓ விற்பனை வெற்றிகரமாக பதிவு செய்யப்பட்டது",
    assistant_header: "உங்கள் உதவியாளரிடம் கேளுங்கள்",
    welcome_msg: "வணக்கம்! நான் Gemini AI மூலம் இயங்கும் உங்கள் வணிக உதவியாளர். உங்கள் விற்பனை, இருப்பு, லாபம் பற்றி எதுவும் எளிய தமிழில் கேளுங்கள்.",
    q1: "இந்த வாரம் எது சிறப்பாக விற்றது?",
    q2: "இன்று நான் எவ்வளவு லாபம் ஈட்டினேன்?",
    q3: "எந்த பொருட்கள் குறைவாக உள்ளன?",
    q4: "இன்றையும் நேற்றையும் ஒப்பிடுக",
    chat_placeholder: "உங்கள் கேள்வியை தட்டச்சு செய்யவும்...",
    reports_title: "பொருள் வாரியான விற்பனை",
    reports_sub: "இன்றைய பணம் எங்கிருந்து வந்தது என்பதைப் பார்வையிடவும்.",
    no_entries: "இன்று இதுவரை விற்பனை பதிவு செய்யப்படவில்லை. இடதுபுறத்தில் முதலாவதைச் சேர்க்கவும்.",
    entries_title: "இன்றைய பதிவுகள்",
    couldnt_reach: "உதவியாளரை அணுக முடியவில்லை. உங்கள் Flask சேவையகம் மற்றும் Gemini API சரியாக இயங்குகிறதா எனச் சரிபார்க்கவும்.",
  }
};

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations.en[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(key));
  });
  document.body.classList.toggle("lang-ta", currentLang === "ta");
  // re-render dynamic bits that aren't tagged
  if (document.getElementById("entries-title")) renderEntries();
  document.getElementById("today-date").textContent = new Date().toLocaleDateString(
    currentLang === "ta" ? "ta-IN" : "en-IN",
    { weekday: "long", day: "numeric", month: "long" }
  );
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("smartbiz_lang", lang);
  document.querySelectorAll(".lang-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
  applyTranslations();
}

document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

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
  const profit = Math.round(total * 0.22);

  document.getElementById("total-sales").textContent = currency(total);
  document.getElementById("order-count-text").textContent =
    currentLang === "ta" ? `இன்று பதிவு செய்யப்பட்ட ${orders} விற்பனைகளிலிருந்து` : `from ${orders} sales recorded today`;
  document.getElementById("orders-count").textContent = orders;
  document.getElementById("est-profit").textContent = currency(profit);

  const byProduct = {};
  salesData.forEach(s => { byProduct[s.product] = (byProduct[s.product] || 0) + s.quantity; });
  const top = Object.entries(byProduct).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("top-product").textContent = top ? top[0] : "—";

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
  document.getElementById("entries-title").textContent = `${t("entries_title")} (${salesData.length})`;
  entriesList.innerHTML = "";
  if (salesData.length === 0) {
    entriesList.innerHTML = `<div class="card-sub">${t("no_entries")}</div>`;
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
      body: JSON.stringify({ question, language: currentLang })
    });
    const data = await res.json();
    addMessage("assistant", data.answer || "Sorry, I couldn't get an answer right now.");
  } catch (err) {
    console.error("Assistant error:", err);
    addMessage("assistant", t("couldnt_reach"));
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

// ---------- Voice input (Tamil / English) for Add Sale ----------
const micBtn = document.getElementById("mic-btn");
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognitionAPI && micBtn) {
  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    recognition.lang = currentLang === "ta" ? "ta-IN" : "en-IN";
    micBtn.classList.add("listening");
    micBtn.textContent = "●";
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    productInput.value = transcript;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = () => {
    micBtn.classList.remove("listening");
    micBtn.textContent = "🎤";
  };
} else if (micBtn) {
  micBtn.addEventListener("click", () => {
    alert("Voice input isn't supported in this browser. Try Chrome on desktop or Android.");
  });
}

// ---------- Init ----------
updateLiveTotal();
setLanguage(currentLang);
loadSales();
