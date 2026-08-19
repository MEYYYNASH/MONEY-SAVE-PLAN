const KEY = "my-money-v1";
const EXCHANGE_RATE = 4000; // $1 = 4000 ៛

const EXPENSE_CATEGORIES = [
  "ម្ហូបអាហារ",
  "WiFi / Internet",
  "YouTube Premium",
  "ទូរស័ព្ទ / កាត",
  "កាហ្វេ",
  "បាយ",
  "ទំនាក់ទំនង",
  "ដឹកជញ្ជូន",
  "ផ្ទះ / ឈ្នួល",
  "ផ្សេងៗ"
];

const INCOME_CATEGORIES = [
  "ប្រាក់ខែ",
  "អាជីវកម្ម / លក់ដូរ",
  "ផ្ដើមការងារ / Freelance",
  "ការវិនិយោគ",
  "លើកទឹកចិត្ត / Bonus",
  "ផ្សេងៗ"
];

function getTodayLocalStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

let data = JSON.parse(localStorage.getItem(KEY) || "null") || {
  currency: "៛",
  theme: "dark",
  budget: 500000,
  selectedMonth: getTodayLocalStr().slice(0, 7),
  aiPresets: [
    { id: 1, label: "កាហ្វេ 2$", text: "កាហ្វេ 2$" },
    { id: 2, label: "WiFi 15$", text: "បង់ WiFi 15$" },
    { id: 3, label: "ប្រាក់ខែ 400$", text: "ប្រាក់ខែ 400$" },
    { id: 4, label: "បាយ 3.5$", text: "បាយថ្ងៃត្រង់ 3.5$" }
  ],
  transactions: [
    { id: 1, title: "ប្រាក់ខែ", amount: 1600000, type: "income", category: "ប្រាក់ខែ", date: getTodayLocalStr(), note: "ប្រាក់ខែប្រចាំខែ ($400)" },
    { id: 2, title: "បង់ WiFi", amount: 60000, type: "expense", category: "WiFi / Internet", date: getTodayLocalStr(), note: "បង់សេវាអ៊ិនធឺណិត ($15)" },
    { id: 3, title: "កាហ្វេ", amount: 8000, type: "expense", category: "កាហ្វេ", date: getTodayLocalStr(), note: "$2" },
    { id: 4, title: "បាយថ្ងៃត្រង់", amount: 14000, type: "expense", category: "ម្ហូបអាហារ", date: getTodayLocalStr(), note: "$3.5" }
  ],
  savingPlans: [
    {
      id: 1,
      name: "ទិញទូរស័ព្ទថ្មី (New Phone)",
      goal: 2000000,
      saved: 480000,
      targetDate: "2026-12-31",
      category: "បច្ចេកវិទ្យា",
      note: "សន្សំទិញ iPhone"
    }
  ],
  savingsDeposits: [
    {
      id: 101,
      planId: 1,
      amount: 480000,
      date: getTodayLocalStr(),
      source: "ABA Bank",
      note: "សន្សំលើកដំបូង"
    }
  ]
};

if (!data.aiPresets || !data.aiPresets.length) {
  data.aiPresets = [
    { id: 1, label: "កាហ្វេ 2$", text: "កាហ្វេ 2$" },
    { id: 2, label: "WiFi 15$", text: "បង់ WiFi 15$" },
    { id: 3, label: "ប្រាក់ខែ 400$", text: "ប្រាក់ខែ 400$" },
    { id: 4, label: "បាយ 3.5$", text: "បាយថ្ងៃត្រង់ 3.5$" }
  ];
}

data.savingPlans = data.savingPlans || [
  {
    id: 1,
    name: "ទិញទូរស័ព្ទថ្មី (New Phone)",
    goal: 2000000,
    saved: 480000,
    targetDate: "2026-12-31",
    category: "បច្ចេកវិទ្យា",
    note: "សន្សំទិញ iPhone"
  }
];

data.savingsDeposits = data.savingsDeposits || [
  {
    id: 101,
    planId: 1,
    amount: 480000,
    date: getTodayLocalStr(),
    source: "ABA Bank",
    note: "សន្សំលើកដំបូង"
  }
];

let currentType = "expense";
let editingPlanId = null;
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Top Progress Bar & Floating Rolling Loader ("Loading Roll")
function startTopLoader() {
  const bar = $("#topLoadingBar");
  const rollLoader = $("#globalRollingLoader");

  if (bar) {
    bar.classList.add("active");
    bar.style.width = "30%";
    setTimeout(() => { if (bar) bar.style.width = "70%"; }, 80);
    setTimeout(() => { if (bar) bar.style.width = "100%"; }, 200);
    setTimeout(() => {
      if (bar) {
        bar.style.opacity = "0";
        setTimeout(() => {
          bar.classList.remove("active");
          bar.style.width = "0%";
          bar.style.opacity = "1";
        }, 250);
      }
    }, 350);
  }

  if (rollLoader) {
    rollLoader.classList.add("show");
    setTimeout(() => rollLoader.classList.remove("show"), 400);
  }
}

// Button Loading State Helper with Rolling Ring Loader ("Loading Roll")
function setButtonLoading(btn, isLoading, loadingText = "កំពុងដំណើរការ...") {
  if (!btn) return;
  if (isLoading) {
    if (!btn.classList.contains("btn-loading")) {
      btn.dataset.originalHtml = btn.innerHTML;
    }
    btn.classList.add("btn-loading");
    btn.innerHTML = `
      <i class="roll-ring"></i>
      <span>${loadingText}</span>
    `;
  } else {
    btn.classList.remove("btn-loading");
    if (btn.dataset.originalHtml) {
      btn.innerHTML = btn.dataset.originalHtml;
      delete btn.dataset.originalHtml;
    }
  }
}

// Save & Render
function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
  render();
}

// Format Money ($1 = 4000 ៛)
function money(rielAmount) {
  const val = Number(rielAmount) || 0;
  if (data.currency === "$") {
    const usdVal = val / EXCHANGE_RATE;
    return "$" + usdVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return "៛" + val.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// Current Selected Month Transactions
function getMonthTx() {
  const targetMonth = data.selectedMonth || getTodayLocalStr().slice(0, 7);
  return data.transactions.filter(x => (x.date || "").slice(0, 7) === targetMonth);
}

const KHMER_MONTHS = [
  { km: "មករា", en: "Jan", val: "01" },
  { km: "កុម្ភៈ", en: "Feb", val: "02" },
  { km: "មីនា", en: "Mar", val: "03" },
  { km: "មេសា", en: "Apr", val: "04" },
  { km: "ឧសភា", en: "May", val: "05" },
  { km: "មិថុនា", en: "Jun", val: "06" },
  { km: "កក្កដា", en: "Jul", val: "07" },
  { km: "សីហា", en: "Aug", val: "08" },
  { km: "កញ្ញា", en: "Sep", val: "09" },
  { km: "តុលា", en: "Oct", val: "10" },
  { km: "វិច្ឆិកា", en: "Nov", val: "11" },
  { km: "ធ្នូ", en: "Dec", val: "12" }
];

let currentPickerYear = new Date().getFullYear();

function getFormattedMonthText(yearMonthStr) {
  if (!yearMonthStr) return "";
  const [y, m] = yearMonthStr.split("-");
  const monthObj = KHMER_MONTHS.find(x => x.val === m) || KHMER_MONTHS[0];
  return `${monthObj.km} ${y}`;
}

function formatDateKhmer(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const year = parts[0];
  const monthNum = parts[1];
  const day = parseInt(parts[2], 10);
  const monthObj = KHMER_MONTHS.find(x => x.val === monthNum) || KHMER_MONTHS[0];
  return `ថ្ងៃទី ${day} ${monthObj.km} ${year}`;
}

// Toast Notification
function showToast(msg, type = "success") {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast-notification show ${type === "loading" ? "toast-loading" : ""}`;
  if (type !== "loading") {
    setTimeout(() => toast.classList.remove("show"), 2500);
  }
}

// Main Render Function
function render() {
  // Apply theme
  document.documentElement.setAttribute("data-theme", data.theme || "dark");
  const themeLabel = $("#themeSettingLabel");
  if (themeLabel) themeLabel.textContent = data.theme === "light" ? "Light Mode" : "Dark Glassmorphic";

  // Month Picker sync
  const monthTextSpan = $("#monthPickerText");
  if (monthTextSpan) {
    monthTextSpan.textContent = getFormattedMonthText(data.selectedMonth || getTodayLocalStr().slice(0, 7));
  }

  const tx = getMonthTx();
  const inc = tx.filter(x => x.type === "income").reduce((a, x) => a + x.amount, 0);
  const exp = tx.filter(x => x.type === "expense").reduce((a, x) => a + x.amount, 0);
  const balance = inc - exp;

  $("#balance").textContent = money(balance);
  $("#income").textContent = money(inc);
  $("#expense").textContent = money(exp);
  $("#count").textContent = tx.length;
  
  const heroNet = $("#heroNetSavings");
  if (heroNet) {
    heroNet.textContent = `សន្សំ ${balance >= 0 ? "+" : ""}${money(balance)}`;
    heroNet.className = `badge ${balance >= 0 ? "badge-income" : "badge-expense"}`;
  }

  // Budget summary
  $("#budgetTotal").textContent = `${money(exp)} / ${money(data.budget || 0)}`;
  const pct = Math.min(100, data.budget ? (exp / data.budget) * 100 : 0);
  const bgProgress = $("#budgetProgress");
  if (bgProgress) {
    bgProgress.style.width = pct + "%";
    if (pct > 85) bgProgress.classList.add("warning");
    else bgProgress.classList.remove("warning");
  }
  $("#budgetText").textContent = Math.round(pct) + "%";

  renderBars(tx);
  renderRecent();
  renderList();
  renderBudgetCats();
  renderAIPresets();
  renderSettingsPresets();
  renderSavingsPage();
}

// Plan Metrics Calculation Helper
function calcPlanMetrics(plan) {
  const goal = Number(plan.goal) || 0;
  const saved = Number(plan.saved) || 0;
  const remaining = Math.max(0, goal - saved);
  const progressPct = goal > 0 ? Math.min(100, Math.round((saved / goal) * 100)) : 0;
  const isCompleted = saved >= goal;

  const today = new Date(getTodayLocalStr());
  const target = new Date(plan.targetDate || getTodayLocalStr());
  const diffTime = target - today;
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30.4));
  const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));

  const reqDaily = remaining / daysRemaining;
  const reqWeekly = remaining / weeksRemaining;
  const reqMonthly = remaining / monthsRemaining;

  return {
    goal,
    saved,
    remaining,
    progressPct,
    isCompleted,
    daysRemaining,
    monthsRemaining,
    reqDaily,
    reqWeekly,
    reqMonthly
  };
}

// Render Savings Page & Plan Cards
function renderSavingsPage() {
  const plans = data.savingPlans || [];
  const deposits = data.savingsDeposits || [];

  // Summary Metrics
  const totalSavings = plans.reduce((a, p) => a + (Number(p.saved) || 0), 0);
  const activeCount = plans.filter(p => (Number(p.saved) || 0) < (Number(p.goal) || 0)).length;
  const completedCount = plans.filter(p => (Number(p.saved) || 0) >= (Number(p.goal) || 0)).length;

  const currentMonthStr = getTodayLocalStr().slice(0, 7);
  const savedThisMonth = deposits
    .filter(d => (d.date || "").slice(0, 7) === currentMonthStr)
    .reduce((a, d) => a + (Number(d.amount) || 0), 0);

  const totalGoals = plans.reduce((a, p) => a + (Number(p.goal) || 0), 0);
  const overallPct = totalGoals > 0 ? Math.min(100, Math.round((totalSavings / totalGoals) * 100)) : 0;

  if ($("#savingsTotalAmount")) $("#savingsTotalAmount").textContent = money(totalSavings);
  if ($("#savingsActivePlansCount")) $("#savingsActivePlansCount").textContent = activeCount;
  if ($("#savingsCompletedPlansCount")) $("#savingsCompletedPlansCount").textContent = completedCount;
  if ($("#savingsMonthAmount")) $("#savingsMonthAmount").textContent = money(savedThisMonth);
  if ($("#overallProgressPctText")) $("#overallProgressPctText").textContent = overallPct + "%";
  if ($("#overallProgressBar")) $("#overallProgressBar").style.width = overallPct + "%";

  // Dashboard Savings Widget Sync
  if ($("#dashSavingsTotal")) $("#dashSavingsTotal").textContent = money(totalSavings);
  if ($("#dashActivePlansText")) $("#dashActivePlansText").textContent = `${activeCount} ផែនការសកម្ម (${overallPct}%)`;
  if ($("#dashSavingsBar")) $("#dashSavingsBar").style.width = overallPct + "%";

  // Render Plan Cards Grid
  const plansGrid = $("#savingPlansGrid");
  if (plansGrid) {
    if (!plans.length) {
      plansGrid.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:30px 0; grid-column: 1 / -1;">មិនទាន់មានផែនការសន្សំប្រាក់នៅឡើយទេ។ សូមចុច "+ បង្កើតផែនការសន្សំ" ដើម្បីចាប់ផ្ដើម!</p>`;
    } else {
      plansGrid.innerHTML = plans.map(p => {
        const m = calcPlanMetrics(p);
        return `
          <div class="plan-card ${m.isCompleted ? "completed-plan" : ""}">
            <div>
              <div class="plan-card-header">
                <div class="plan-title-group">
                  <div class="plan-icon-circle">${categorySVG(p.category, 20)}</div>
                  <div>
                    <div class="plan-name">${esc(p.name)}</div>
                    <div class="plan-category-badge">${esc(p.category)} · សម្រេច ${m.daysRemaining} ថ្ងៃទៀត</div>
                  </div>
                </div>
              </div>

              <div class="plan-amounts-row" style="margin-top: 14px;">
                <div>
                  <span style="font-size:11px; color:var(--text-muted);">សន្សំបាន</span>
                  <div class="plan-saved-big">${money(m.saved)}</div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size:11px; color:var(--text-muted);">គោលដៅ: ${money(m.goal)}</span>
                  <div class="plan-goal-text">នៅសល់: <b style="color:var(--accent-expense);">${money(m.remaining)}</b></div>
                </div>
              </div>

              <div style="margin-top: 14px;">
                <div class="plan-progress-header">
                  <span>កម្រិតសម្រេច (Progress)</span>
                  <span style="color:var(--accent-primary);">${m.progressPct}%</span>
                </div>
                <div class="bar-track">
                  <i class="bar-fill" style="width:${m.progressPct}%; background:${m.isCompleted ? "#10b981" : "linear-gradient(90deg, var(--accent-primary), #0066ff)"};"></i>
                </div>
              </div>
            </div>

            <!-- Automatic Calculation Metrics Box -->
            <div class="plan-calculations-grid" style="margin-top: 12px;">
              <div class="calc-box">
                <label>ត្រូវសន្សំ/ថ្ងៃ</label>
                <b>${money(m.reqDaily)}</b>
              </div>
              <div class="calc-box">
                <label>ត្រូវសន្សំ/សប្ដាហ៍</label>
                <b>${money(m.reqWeekly)}</b>
              </div>
              <div class="calc-box">
                <label>ត្រូវសន្សំ/ខែ</label>
                <b>${money(m.reqMonthly)}</b>
              </div>
            </div>

            <div class="plan-actions-row">
              <button class="btn-primary" style="font-size:12px; padding:8px 10px;" onclick="openDepositModal(${p.id})">
                + បន្ថែមប្រាក់
              </button>
              <button class="btn-secondary" style="font-size:12px; padding:8px 10px; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="editPlan(${p.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                <span>កែប្រែ</span>
              </button>
              <button class="btn-secondary" style="font-size:12px; padding:8px 10px; color:var(--accent-expense); display:inline-flex; align-items:center; justify-content:center;" onclick="deletePlan(${p.id})" title="លុបផែនការ">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Update Deposit Filter Dropdown Options
  const historyFilterSelect = $("#savingsHistoryFilter");
  if (historyFilterSelect) {
    historyFilterSelect.innerHTML = `<option value="all">ផែនការទាំងអស់</option>` +
      plans.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
  }

  renderSavingsHistory();
}

// Render Savings Deposit History
function renderSavingsHistory() {
  const container = $("#savingsHistoryList");
  if (!container) return;

  const q = ($("#savingsHistorySearch")?.value || "").toLowerCase();
  const filterPlanId = $("#savingsHistoryFilter")?.value || "all";
  const plans = data.savingPlans || [];
  let deposits = (data.savingsDeposits || []).slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || b.id - a.id);

  deposits = deposits.filter(d => {
    const p = plans.find(x => x.id === d.planId);
    const planName = p ? p.name.toLowerCase() : "";
    const matchesSearch = `${planName} ${d.source || ""} ${d.note || ""}`.toLowerCase().includes(q);
    const matchesFilter = filterPlanId === "all" || String(d.planId) === filterPlanId;
    return matchesSearch && matchesFilter;
  });

  if (!deposits.length) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px;">មិនទាន់មានប្រវត្តិសន្សំប្រាក់ទេ</p>`;
    return;
  }

  container.innerHTML = deposits.map(d => {
    const p = plans.find(x => x.id === d.planId);
    return `
      <div class="deposit-history-item">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="tx-icon-circle" style="background:var(--accent-income-bg); color:var(--accent-income);">
            ${categorySVG(p?.category || "ផ្សេងៗ", 18)}
          </div>
          <div>
            <b style="color:var(--text-main); font-size:14px;">${esc(p?.name || "ផែនការសន្សំ")}</b>
            <div style="font-size:11px; color:var(--text-muted);">${formatDateKhmer(d.date)} · ${esc(d.source || "សាច់ប្រាក់")} ${d.note ? "· " + esc(d.note) : ""}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <b style="color:var(--accent-income); font-size:15px;">+${money(d.amount)}</b>
          <button class="delete-btn" onclick="deleteDeposit(${d.id})" title="លុប">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Render Expense Category Bars
function renderBars(tx) {
  const cats = {};
  tx.filter(x => x.type === "expense").forEach(x => {
    cats[x.category] = (cats[x.category] || 0) + x.amount;
  });
  const arr = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const max = arr[0]?.[1] || 1;

  $("#categoryBars").innerHTML = arr.length
    ? arr.slice(0, 6).map(([c, v]) => `
        <div class="bar-item">
          <div class="bar-info">
            <span style="display:inline-flex; align-items:center; gap:6px;">${categorySVG(c, 16)} ${c}</span>
            <b>${money(v)}</b>
          </div>
          <div class="bar-track">
            <i class="bar-fill" style="width:${(v / max) * 100}%"></i>
          </div>
        </div>
      `).join("")
    : "<p style='color:var(--text-muted); font-size:13px; text-align:center; padding:20px 0;'>មិនទាន់មានចំណាយក្នុងខែនេះទេ</p>";
}

// Category SVG Icon Helper
function categorySVG(c, size = 18) {
  const s = size;
  if (c?.includes("WiFi") || c?.includes("Internet")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.85a10 10 0 0 1 14 0"/><path d="M8.5 16.88a5 5 0 0 1 7 0"/></svg>`;
  }
  if (c?.includes("កាហ្វេ")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`;
  }
  if (c?.includes("បាយ") || c?.includes("ម្ហូប") || c?.includes("អាហារ")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V2"/><path d="M12 2v20"/><path d="M19 15v7"/></svg>`;
  }
  if (c?.includes("YouTube")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="4" rx="2"/><polygon points="10 9 15 11.5 10 14 10 9"/></svg>`;
  }
  if (c?.includes("ទូរស័ព្ទ") || c?.includes("កាត") || c?.includes("បច្ចេកវិទ្យា")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>`;
  }
  if (c?.includes("ទំនាក់ទំនង")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>`;
  }
  if (c?.includes("ដឹកជញ្ជូន") || c?.includes("ឡាន")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.4 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
  }
  if (c?.includes("អាជីវកម្ម") || c?.includes("លក់ដូរ")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/></svg>`;
  }
  if (c?.includes("Freelance") || c?.includes("ការងារ") || c?.includes("សិក្សា")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`;
  }
  if (c?.includes("វិនិយោគ")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`;
  }
  if (c?.includes("Bonus") || c?.includes("លើកទឹកចិត្ត")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`;
  }
  if (c?.includes("ផ្ទះ") || c?.includes("ឈ្នួល")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
  }
  if (c?.includes("ប្រាក់ខែ") || c?.includes("ចំណូល") || c?.includes("សន្សំ")) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v12"/></svg>`;
  }
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>`;
}

// Transaction HTML Generator (Income vs Expense Visual Distinction)
function txHTML(x) {
  const isInc = x.type === "income";
  return `
    <div class="tx-item ${isInc ? "income-type" : "expense-type"}">
      <div class="tx-left">
        <div class="tx-icon-circle">${categorySVG(x.category, 20)}</div>
        <div>
          <div class="tx-title">${esc(x.title)}</div>
          <div class="tx-meta">${x.category} ${x.note ? "· " + esc(x.note) : ""}</div>
        </div>
      </div>
      <div class="tx-right">
        <b class="tx-amount ${isInc ? "plus" : "minus"}">
          ${isInc ? "+" : "-"}${money(x.amount)}
        </b>
        <button class="delete-btn" onclick="deleteTx(${x.id})" title="លុប">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `;
}

// Delete Transaction
window.deleteTx = function(id) {
  if (confirm("តើអ្នកពិតជាចង់លុបប្រតិបត្តិការនេះមែនទេ?")) {
    startTopLoader();
    data.transactions = data.transactions.filter(x => x.id !== id);
    save();
    showToast("បានលុបប្រតិបត្តិការ!");
  }
};

// Day-by-Day Transaction Grouping Renderer
function renderDayGroupedTx(txArray) {
  if (!txArray || !txArray.length) {
    return `<p style='color:var(--text-muted); font-size:13px; text-align:center; padding:24px;'>មិនទាន់មានប្រតិបត្តិការទេ</p>`;
  }

  const groups = {};
  txArray.forEach(tx => {
    const d = tx.date || "ផ្សេងៗ";
    if (!groups[d]) groups[d] = [];
    groups[d].push(tx);
  });

  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return sortedDates.map(dateStr => {
    const items = groups[dateStr];
    const dayInc = items.filter(x => x.type === "income").reduce((a, x) => a + x.amount, 0);
    const dayExp = items.filter(x => x.type === "expense").reduce((a, x) => a + x.amount, 0);

    return `
      <div class="day-group">
        <div class="day-group-header">
          <div class="day-date-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <span>${formatDateKhmer(dateStr)}</span>
          </div>
          <div class="day-totals">
            ${dayInc > 0 ? `<span class="day-total-inc">+${money(dayInc)}</span>` : ""}
            ${dayExp > 0 ? `<span class="day-total-exp">-${money(dayExp)}</span>` : ""}
          </div>
        </div>
        <div class="day-items-list">
          ${items.map(txHTML).join("")}
        </div>
      </div>
    `;
  }).join("");
}

// Render Recent Transactions (Dashboard)
function renderRecent() {
  let monthTxList = getMonthTx();
  if (!monthTxList.length && data.transactions.length) {
    const sortedAll = data.transactions.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || b.id - a.id);
    monthTxList = sortedAll.slice(0, 5);
  }
  $("#recent").innerHTML = renderDayGroupedTx(monthTxList);
}

// Render Full Transaction List with Filter & Search (Day-by-Day)
function renderList() {
  const q = ($("#search")?.value || "").toLowerCase();
  const f = $("#filter")?.value || "all";
  
  let arr = getMonthTx().filter(x => (f === "all" || x.type === f) && (`${x.title} ${x.category} ${x.note || ""}`.toLowerCase().includes(q)));
  if (!arr.length && !q && f === "all" && data.transactions.length) {
    arr = data.transactions.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || b.id - a.id);
  }

  $("#transactionList").innerHTML = renderDayGroupedTx(arr);
}

// Render Dynamic AI Prompts on AI Page
function renderAIPresets() {
  const container = $("#aiPresetsContainer");
  if (!container) return;
  container.innerHTML = (data.aiPresets || []).map(p => `
    <button class="chip-btn" onclick="setAIPrompt('${esc(p.text)}')">
      ${categorySVG(p.label, 14)}
      <span>${esc(p.label)}</span>
    </button>
  `).join("");
}

// Render Settings Presets Manager
function renderSettingsPresets() {
  const container = $("#presetsList");
  if (!container) return;
  container.innerHTML = (data.aiPresets || []).map(p => `
    <div class="preset-chip-item">
      <span>${esc(p.label)}</span>
      <button onclick="deletePreset(${p.id})" title="លុប Preset">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `).join("");
}

window.deletePreset = function(id) {
  startTopLoader();
  data.aiPresets = (data.aiPresets || []).filter(p => p.id !== id);
  save();
  showToast("បានលុប Preset ជោគជ័យ!");
};

const EXPENSE_TITLE_TEMPLATES = [
  { title: "កាហ្វេ", category: "កាហ្វេ" },
  { title: "បាយថ្ងៃត្រង់", category: "ម្ហូបអាហារ" },
  { title: "WiFi / Internet", category: "WiFi / Internet" },
  { title: "កាតទូរស័ព្ទ", category: "ទូរស័ព្ទ / កាត" },
  { title: "ដឹកជញ្ជូន", category: "ដឹកជញ្ជូន" },
  { title: "YouTube Premium", category: "YouTube Premium" },
  { title: "ទិញអីវ៉ាន់", category: "ផ្សេងៗ" }
];

const INCOME_TITLE_TEMPLATES = [
  { title: "ប្រាក់ខែ", category: "ប្រាក់ខែ" },
  { title: "លក់ដូរអនឡាញ", category: "អាជីវកម្ម / លក់ដូរ" },
  { title: "Freelance Project", category: "ផ្ដើមការងារ / Freelance" },
  { title: "ការវិនិយោគ", category: "ការវិនិយោគ" },
  { title: "Bonus / លើកទឹកចិត្ត", category: "លើកទឹកចិត្ត / Bonus" }
];

// Update Modal Category Dropdown & Quick Title Templates based on Expense vs Income Type
function updateModalCategoryOptions(type) {
  const catSelect = $("#category");
  const modalTitle = $("#modalHeaderTitle");
  const titleInput = $("#title");
  const templatesContainer = $("#titleTemplatesContainer");

  if (!catSelect) return;

  const isInc = type === "income";
  const list = isInc ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const templates = isInc ? INCOME_TITLE_TEMPLATES : EXPENSE_TITLE_TEMPLATES;

  if (modalTitle) {
    modalTitle.textContent = isInc ? "បន្ថែមចំណូល (+)" : "បន្ថែមចំណាយ (-)";
  }

  if (titleInput) {
    titleInput.placeholder = isInc ? "ឧ. ប្រាក់ខែខែសីហា, លក់ដូរអនឡាញ..." : "ឧ. កាហ្វេ, WiFi, បាយ...";
  }

  catSelect.innerHTML = list.map(c => `<option value="${c}">${c}</option>`).join("");

  if (templatesContainer) {
    templatesContainer.innerHTML = templates.map(t => `
      <button type="button" class="modal-template-chip" onclick="applyTitleTemplate('${esc(t.title)}', '${esc(t.category)}')">
        ${categorySVG(t.category, 13)}
        <span>${esc(t.title)}</span>
      </button>
    `).join("");
  }
}

window.applyTitleTemplate = function(titleStr, categoryStr) {
  const titleInput = $("#title");
  const catSelect = $("#category");
  const amountInput = $("#amount");

  if (titleInput) titleInput.value = titleStr;
  if (catSelect && categoryStr) catSelect.value = categoryStr;
  if (amountInput) amountInput.focus();
};

// Escape HTML
function esc(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// Smart AI Category Parser
function smartCategory(text) {
  const t = text.toLowerCase();
  if (/wifi|internet|wi-fi/i.test(t)) return "WiFi / Internet";
  if (/youtube|premium/i.test(t)) return "YouTube Premium";
  if (/coffee|កាហ្វេ|cafe/i.test(t)) return "កាហ្វេ";
  if (/rice|បាយ|food|ម្ហូប|អាហារ/i.test(t)) return "ម្ហូបអាហារ";
  if (/phone|tel|កាត|ទូរស័ព្ទ|topup/i.test(t)) return "ទូរស័ព្ទ / កាត";
  if (/transport|grab|tuk|taxi|ដឹក/i.test(t)) return "ដឹកជញ្ជូន";
  if (/salary|ប្រាក់ខែ|income|លក់|អាជីវកម្ម/i.test(t)) return "ប្រាក់ខែ";
  return "ផ្សេងៗ";
}

// Smart Amount Parser ($1 = 4000 ៛ Conversion)
function parseAmount(text) {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(\$|៛|usd)?/i);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  const unit = m[2] || "";
  if (unit === "$" || unit.toLowerCase() === "usd") {
    return num * EXCHANGE_RATE;
  }
  return num;
}

// Set AI Preset Prompt
window.setAIPrompt = function(promptText) {
  const input = $("#quickText");
  if (input) {
    input.value = promptText;
    $("#parseBtn").click();
  }
};

// Toggle Password Visibility Eye Icon
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
  } else {
    input.type = "password";
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
};

// Trigger Account System Coming Soon Notification Modal
window.triggerComingSoon = function(featureName = "Account System") {
  startTopLoader();
  const csModal = $("#comingSoonModal");
  if (csModal) csModal.classList.add("show");
};

function closeComingSoonModal() {
  const csModal = $("#comingSoonModal");
  if (csModal) csModal.classList.remove("show");
}

// Open & Close Auth Modal
window.openAuthModal = function(defaultTab = "login") {
  const modal = $("#authModal");
  if (!modal) return;

  const loginTab = $("#authTabLogin");
  const signUpTab = $("#authTabSignUp");
  const loginView = $("#loginView");
  const signUpView = $("#signUpView");

  if (defaultTab === "signup") {
    if (loginTab) loginTab.classList.remove("active");
    if (signUpTab) signUpTab.classList.add("active");
    if (loginView) loginView.classList.remove("active");
    if (signUpView) signUpView.classList.add("active");
  } else {
    if (loginTab) loginTab.classList.add("active");
    if (signUpTab) signUpTab.classList.remove("active");
    if (loginView) loginView.classList.add("active");
    if (signUpView) signUpView.classList.remove("active");
  }

  modal.classList.add("show");
};

function closeAuthModal() {
  const modal = $("#authModal");
  if (modal) modal.classList.remove("show");
}

// Navigation Control (Desktop & Mobile Sync with Progress Loader)
function go(pageId) {
  startTopLoader();
  $$(".page").forEach(p => p.classList.remove("active-page"));
  const targetPage = $("#" + pageId);
  if (targetPage) targetPage.classList.add("active-page");

  $$(".nav-btn, .mobile-nav-btn").forEach(btn => {
    if (btn.dataset.page === pageId) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  const moreBtn = $("#openMoreNavBtn");
  if (moreBtn) {
    if (pageId === "ai" || pageId === "settings") moreBtn.classList.add("active");
    else moreBtn.classList.remove("active");
  }

  const titles = {
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    transactions: "ប្រតិបត្តិការ",
    budget: "ថវិកាប្រចាំខែ",
    ai: "AI Money Assistant",
    savings: "ផែនការសន្សំប្រាក់ (Saving Plans)",
    settings: "ការកំណត់"
  };
  $("#pageTitle").textContent = titles[pageId] || "SAVE PLAN";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Transaction Modal Handlers
function openModal(defaultType = "expense") {
  currentType = defaultType;
  $("#date").value = getTodayLocalStr();

  $$(".type-btn").forEach(x => {
    if (x.dataset.type === currentType) x.classList.add("active");
    else x.classList.remove("active");
  });

  updateModalCategoryOptions(currentType);

  $("#modal").classList.add("show");
  setTimeout(() => $("#title")?.focus(), 100);
}

function closeModal() {
  $("#modal").classList.remove("show");
}

// Saving Plan Modal Handlers
function openPlanModal(planId = null) {
  editingPlanId = planId;
  const modal = $("#planModal");
  const modalTitle = $("#planModalTitle");

  if (planId) {
    const p = (data.savingPlans || []).find(x => x.id === planId);
    if (p) {
      if (modalTitle) modalTitle.textContent = "កែប្រែផែនការសន្សំប្រាក់";
      $("#planName").value = p.name || "";
      $("#planGoal").value = data.currency === "$" ? (p.goal / EXCHANGE_RATE) : p.goal;
      $("#planSaved").value = data.currency === "$" ? (p.saved / EXCHANGE_RATE) : p.saved;
      $("#planTargetDate").value = p.targetDate || getTodayLocalStr();
      $("#planCategory").value = p.category || "បច្ចេកវិទ្យា";
      $("#planNote").value = p.note || "";
    }
  } else {
    if (modalTitle) modalTitle.textContent = "បង្កើតផែនការសន្សំប្រាក់";
    $("#planName").value = "";
    $("#planGoal").value = "";
    $("#planSaved").value = "0";
    $("#planTargetDate").value = getTodayLocalStr();
    $("#planCategory").value = "បច្ចេកវិទ្យា";
    $("#planNote").value = "";
  }

  if (modal) modal.classList.add("show");
  setTimeout(() => $("#planName")?.focus(), 100);
}

function closePlanModal() {
  const modal = $("#planModal");
  if (modal) modal.classList.remove("show");
  editingPlanId = null;
}

window.editPlan = function(id) {
  openPlanModal(id);
};

window.deletePlan = function(id) {
  if (confirm("តើអ្នកពិតជាចង់លុបផែនការសន្សំប្រាក់នេះមែនទេ?")) {
    startTopLoader();
    data.savingPlans = (data.savingPlans || []).filter(x => x.id !== id);
    data.savingsDeposits = (data.savingsDeposits || []).filter(x => x.planId !== id);
    save();
    showToast("បានលុបផែនការសន្សំប្រាក់!");
  }
};

// Deposit Savings Modal Handlers
window.openDepositModal = function(planId = null) {
  const modal = $("#depositModal");
  const select = $("#depositPlanSelect");
  const plans = data.savingPlans || [];

  if (!plans.length) {
    alert("សូមបង្កើតផែនការសន្សំប្រាក់យ៉ាងហោចណាស់ ១ ជាមុនសិន!");
    return openPlanModal();
  }

  if (select) {
    select.innerHTML = plans.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
    if (planId) select.value = planId;
  }

  $("#depositAmount").value = "";
  $("#depositDate").value = getTodayLocalStr();
  $("#depositNote").value = "";

  if (modal) modal.classList.add("show");
  setTimeout(() => $("#depositAmount")?.focus(), 100);
};

function closeDepositModal() {
  const modal = $("#depositModal");
  if (modal) modal.classList.remove("show");
}

window.deleteDeposit = function(id) {
  if (confirm("តើអ្នកពិតជាចង់លុបប្រវត្តិសន្សំប្រាក់នេះមែនទេ?")) {
    startTopLoader();
    const d = (data.savingsDeposits || []).find(x => x.id === id);
    if (d) {
      const p = (data.savingPlans || []).find(x => x.id === d.planId);
      if (p) {
        p.saved = Math.max(0, p.saved - d.amount);
      }
      data.savingsDeposits = (data.savingsDeposits || []).filter(x => x.id !== id);
      save();
      showToast("បានលុបប្រវត្តិសន្សំ!");
    }
  }
};

// Custom Glassmorphic Month Picker Handler
function initCustomMonthPicker() {
  const container = $("#customMonthPicker");
  if (!container) return;

  const triggerBtn = $("#monthPickerBtn");
  const popover = $("#monthPopover");
  const yearDisplay = $("#pickerYearDisplay");
  const monthsGrid = $("#monthsGrid");

  const selected = data.selectedMonth || getTodayLocalStr().slice(0, 7);
  const [selYear] = selected.split("-");
  currentPickerYear = parseInt(selYear, 10) || new Date().getFullYear();

  function renderPickerGrid() {
    if (yearDisplay) yearDisplay.textContent = currentPickerYear;
    if (monthsGrid) {
      monthsGrid.innerHTML = KHMER_MONTHS.map(m => {
        const isSelected = `${currentPickerYear}-${m.val}` === data.selectedMonth;
        return `
          <button class="month-cell ${isSelected ? "active" : ""}" type="button" data-month="${m.val}">
            <span>${m.km}</span>
            <small>${m.en}</small>
          </button>
        `;
      }).join("");

      $$("#monthsGrid .month-cell").forEach(cell => {
        cell.onclick = (e) => {
          e.stopPropagation();
          startTopLoader();
          const selectedM = cell.dataset.month;
          data.selectedMonth = `${currentPickerYear}-${selectedM}`;
          save();
          closePicker();
          showToast(`បានជ្រើសរើសខែ ${getFormattedMonthText(data.selectedMonth)}`);
        };
      });
    }
  }

  function openPicker() {
    popover.classList.add("show");
    triggerBtn.classList.add("active");
    renderPickerGrid();
  }

  function closePicker() {
    popover.classList.remove("show");
    triggerBtn.classList.remove("active");
  }

  if (triggerBtn) {
    triggerBtn.onclick = e => {
      e.stopPropagation();
      if (popover.classList.contains("show")) closePicker();
      else openPicker();
    };
  }

  if ($("#prevYearBtn")) {
    $("#prevYearBtn").onclick = e => {
      e.stopPropagation();
      currentPickerYear--;
      renderPickerGrid();
    };
  }

  if ($("#nextYearBtn")) {
    $("#nextYearBtn").onclick = e => {
      e.stopPropagation();
      currentPickerYear++;
      renderPickerGrid();
    };
  }

  if ($("#resetThisMonthBtn")) {
    $("#resetThisMonthBtn").onclick = e => {
      e.stopPropagation();
      startTopLoader();
      data.selectedMonth = getTodayLocalStr().slice(0, 7);
      const [y] = data.selectedMonth.split("-");
      currentPickerYear = parseInt(y, 10);
      save();
      closePicker();
      showToast("បានប្តូរទៅខែបច្ចុប្បន្ន!");
    };
  }

  if ($("#closePickerBtn")) {
    $("#closePickerBtn").onclick = e => {
      e.stopPropagation();
      closePicker();
    };
  }

  document.addEventListener("click", e => {
    if (popover && !container.contains(e.target)) {
      closePicker();
    }
  });
}

// Event Listeners Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Custom Month Picker
  initCustomMonthPicker();

  // Navigation clicks
  $$(".nav-btn, .mobile-nav-btn").forEach(b => {
    b.onclick = () => go(b.dataset.page);
  });

  $$("[data-page-jump]").forEach(b => {
    b.onclick = () => go(b.dataset.pageJump);
  });

  // Add Transaction Modal Triggers
  if ($("#addBtn")) $("#addBtn").onclick = () => openModal("expense");
  if ($("#mobileFab")) $("#mobileFab").onclick = () => openModal("expense");
  if ($("#closeModal")) $("#closeModal").onclick = closeModal;

  // Plan Modal Triggers
  if ($("#openCreatePlanBtn")) $("#openCreatePlanBtn").onclick = () => openPlanModal();
  if ($("#closePlanModal")) $("#closePlanModal").onclick = closePlanModal;

  // Deposit Modal Triggers
  if ($("#closeDepositModal")) $("#closeDepositModal").onclick = closeDepositModal;

  // Backdrop click modal close
  $("#modal").onclick = e => { if (e.target.id === "modal") closeModal(); };
  $("#planModal").onclick = e => { if (e.target.id === "planModal") closePlanModal(); };
  $("#depositModal").onclick = e => { if (e.target.id === "depositModal") closeDepositModal(); };
  if ($("#moreNavModal")) $("#moreNavModal").onclick = e => { if (e.target.id === "moreNavModal") closeMoreNav(); };
  if ($("#authModal")) $("#authModal").onclick = e => { if (e.target.id === "authModal") closeAuthModal(); };
  if ($("#comingSoonModal")) $("#comingSoonModal").onclick = e => { if (e.target.id === "comingSoonModal") closeComingSoonModal(); };

  // Auth Modal Triggers
  if ($("#openAuthBtn")) $("#openAuthBtn").onclick = () => openAuthModal("login");
  if ($("#closeAuthModal")) $("#closeAuthModal").onclick = closeAuthModal;
  if ($("#closeComingSoonBtn")) $("#closeComingSoonBtn").onclick = closeComingSoonModal;

  // Auth Tab Switchers
  const authTabLogin = $("#authTabLogin");
  const authTabSignUp = $("#authTabSignUp");
  const loginView = $("#loginView");
  const signUpView = $("#signUpView");

  if (authTabLogin) {
    authTabLogin.onclick = () => {
      authTabLogin.classList.add("active");
      authTabSignUp.classList.remove("active");
      loginView.classList.add("active");
      signUpView.classList.remove("active");
    };
  }

  if (authTabSignUp) {
    authTabSignUp.onclick = () => {
      authTabSignUp.classList.add("active");
      authTabLogin.classList.remove("active");
      signUpView.classList.add("active");
      loginView.classList.remove("active");
    };
  }

  if ($("#switchToSignUp")) $("#switchToSignUp").onclick = () => openAuthModal("signup");
  if ($("#switchToLogin")) $("#switchToLogin").onclick = () => openAuthModal("login");

  // Submit Buttons Trigger Coming Soon Notification
  if ($("#loginSubmitBtn")) $("#loginSubmitBtn").onclick = () => triggerComingSoon("Login");
  if ($("#signUpSubmitBtn")) $("#signUpSubmitBtn").onclick = () => triggerComingSoon("Sign Up");
  if ($("#forgotPassBtn")) $("#forgotPassBtn").onclick = () => triggerComingSoon("Forgot Password");

  // More Nav Sheet Handlers
  function openMoreNav() {
    if ($("#moreNavModal")) $("#moreNavModal").classList.add("show");
  }
  function closeMoreNav() {
    if ($("#moreNavModal")) $("#moreNavModal").classList.remove("show");
  }

  if ($("#openMoreNavBtn")) $("#openMoreNavBtn").onclick = openMoreNav;
  if ($("#closeMoreNavBtn")) $("#closeMoreNavBtn").onclick = closeMoreNav;

  $$("[data-more-page]").forEach(b => {
    b.onclick = () => {
      closeMoreNav();
      go(b.dataset.morePage);
    };
  });

  // Theme Toggle
  const toggleTheme = () => {
    startTopLoader();
    data.theme = data.theme === "light" ? "dark" : "light";
    save();
    showToast(`ប្តូរទៅ ${data.theme === "light" ? "Light Mode" : "Dark Mode"}`);
  };

  if ($("#themeBtn")) $("#themeBtn").onclick = toggleTheme;
  if ($("#themeToggleSetting")) $("#themeToggleSetting").onclick = toggleTheme;

  // Type Selector inside Modal
  $$(".type-btn").forEach(b => {
    b.onclick = () => {
      $$(".type-btn").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      currentType = b.dataset.type;
      updateModalCategoryOptions(currentType);
    };
  });

  // Save Transaction
  const saveTxBtn = $("#saveTx");
  if (saveTxBtn) {
    saveTxBtn.onclick = () => {
      const title = $("#title").value.trim();
      let rawAmount = parseFloat($("#amount").value);
      const selectedCurrency = $("#modalCurrency")?.value || "៛";
      const selectedCategory = $("#category")?.value || (currentType === "income" ? "ប្រាក់ខែ" : "ផ្សេងៗ");
      const txDate = $("#date").value || getTodayLocalStr();

      if (!title || isNaN(rawAmount) || rawAmount <= 0) {
        return alert("សូមបញ្ចូលឈ្មោះ និងចំនួនទឹកប្រាក់ឲ្យបានត្រឹមត្រូវ");
      }

      setButtonLoading(saveTxBtn, true, "កំពុងរក្សាទុក...");
      startTopLoader();

      setTimeout(() => {
        if (selectedCurrency === "$") {
          rawAmount = rawAmount * EXCHANGE_RATE;
        }
        data.selectedMonth = txDate.slice(0, 7);

        data.transactions.push({
          id: Date.now(),
          title,
          amount: rawAmount,
          type: currentType,
          category: selectedCategory,
          date: txDate,
          note: $("#note").value
        });

        save();
        closeModal();
        setButtonLoading(saveTxBtn, false);
        $("#title").value = $("#amount").value = $("#note").value = "";
        showToast("បន្ថែមប្រតិបត្តិការបានជោគជ័យ!");
      }, 300);
    };
  }

  // Save Saving Plan (Create / Edit) - 2.5 Second Multi-step Progress Animation
  const savePlanBtn = $("#savePlanBtn");
  if (savePlanBtn) {
    savePlanBtn.onclick = () => {
      const name = $("#planName").value.trim();
      let rawGoal = parseFloat($("#planGoal").value);
      let rawSaved = parseFloat($("#planSaved").value) || 0;
      const selectedCurrency = $("#planCurrency")?.value || "$";
      const targetDate = $("#planTargetDate").value || getTodayLocalStr();
      const category = $("#planCategory").value;
      const note = $("#planNote").value;

      if (!name || isNaN(rawGoal) || rawGoal <= 0) {
        return alert("សូមបញ្ចូលឈ្មោះ និងចំនួនទឹកប្រាក់គោលដៅឲ្យបានត្រឹមត្រូវ");
      }

      // Step 1 (0.0s - 1.5s): "កំពុងបង្កើតទិន្នន័យ..." (1.5 seconds)
      setButtonLoading(savePlanBtn, true, "កំពុងបង្កើតទិន្នន័យ...");
      startTopLoader();

      setTimeout(() => {
        // Step 2 (1.5s - 2.5s): "កំពុងរក្សាទុក..." (1.0 second)
        setButtonLoading(savePlanBtn, true, "កំពុងរក្សាទុក...");
        const bar = $("#topLoadingBar");
        if (bar) bar.style.width = "85%";

        setTimeout(() => {
          // Step 3 (at 2.5s): Finish & "រួចរាល់"
          if (selectedCurrency === "$") {
            rawGoal = rawGoal * EXCHANGE_RATE;
            rawSaved = rawSaved * EXCHANGE_RATE;
          }

          data.savingPlans = data.savingPlans || [];

          if (editingPlanId) {
            const index = data.savingPlans.findIndex(x => x.id === editingPlanId);
            if (index !== -1) {
              data.savingPlans[index] = {
                ...data.savingPlans[index],
                name,
                goal: rawGoal,
                saved: rawSaved,
                targetDate,
                category,
                note
              };
            }
          } else {
            data.savingPlans.push({
              id: Date.now(),
              name,
              goal: rawGoal,
              saved: rawSaved,
              targetDate,
              category,
              note
            });
          }

          save();
          closePlanModal();
          setButtonLoading(savePlanBtn, false);
          showToast("រួចរាល់! បានរក្សាទុកផែនការសន្សំប្រាក់!", "success");
        }, 1000);
      }, 1500);
    };
  }

  // Save Deposit - 2.5 Second Multi-step Progress Animation
  const saveDepositBtn = $("#saveDepositBtn");
  if (saveDepositBtn) {
    saveDepositBtn.onclick = () => {
      const planId = parseInt($("#depositPlanSelect").value, 10);
      let rawAmount = parseFloat($("#depositAmount").value);
      const selectedCurrency = $("#depositCurrency")?.value || "$";
      const source = $("#depositSource").value;
      const date = $("#depositDate").value || getTodayLocalStr();
      const note = $("#depositNote").value;

      if (isNaN(rawAmount) || rawAmount <= 0) {
        return alert("សូមបញ្ចូលចំនួនទឹកប្រាក់សន្សំឲ្យបានត្រឹមត្រូវ");
      }

      const p = (data.savingPlans || []).find(x => x.id === planId);
      if (!p) return alert("រកមិនឃើញផែនការសន្សំទេ");

      // Step 1 (0.0s - 1.5s): "កំពុងបង្កើតទិន្នន័យ..." (1.5 seconds)
      setButtonLoading(saveDepositBtn, true, "កំពុងបង្កើតទិន្នន័យ...");
      startTopLoader();

      setTimeout(() => {
        // Step 2 (1.5s - 2.5s): "កំពុងរក្សាទុក..." (1.0 second)
        setButtonLoading(saveDepositBtn, true, "កំពុងរក្សាទុក...");
        const bar = $("#topLoadingBar");
        if (bar) bar.style.width = "85%";

        setTimeout(() => {
          // Step 3 (at 2.5s): Finish & "រួចរាល់"
          if (selectedCurrency === "$") {
            rawAmount = rawAmount * EXCHANGE_RATE;
          }

          p.saved = (Number(p.saved) || 0) + rawAmount;

          data.savingsDeposits = data.savingsDeposits || [];
          data.savingsDeposits.push({
            id: Date.now(),
            planId,
            amount: rawAmount,
            source,
            date,
            note
          });

          save();
          closeDepositModal();
          setButtonLoading(saveDepositBtn, false);
          showToast("រួចរាល់! បានបន្ថែមប្រាក់សន្សំ!", "success");
        }, 1000);
      }, 1500);
    };
  }

  // Savings History Search & Filter listeners
  if ($("#savingsHistorySearch")) $("#savingsHistorySearch").oninput = renderSavingsHistory;
  if ($("#savingsHistoryFilter")) $("#savingsHistoryFilter").onchange = renderSavingsHistory;

  // Search & Filter
  if ($("#search")) $("#search").oninput = () => { startTopLoader(); renderList(); };
  if ($("#filter")) $("#filter").onchange = () => { startTopLoader(); renderList(); };

  // Save Budget
  const saveBudgetBtn = $("#saveBudget");
  if (saveBudgetBtn) {
    saveBudgetBtn.onclick = () => {
      let val = parseFloat($("#budgetAmount").value);
      if (val > 0) {
        setButtonLoading(saveBudgetBtn, true, "កំពុងរក្សាទុក...");
        startTopLoader();

        setTimeout(() => {
          if (data.currency === "$") val = val * EXCHANGE_RATE;
          data.budget = val;
          save();
          setButtonLoading(saveBudgetBtn, false);
          $("#budgetAmount").value = "";
          showToast("រក្សាទុកថវិកាបានជោគជ័យ!");
        }, 300);
      }
    };
  }

  // Currency selection
  if ($("#currency")) {
    $("#currency").value = data.currency || "៛";
    $("#currency").onchange = e => {
      startTopLoader();
      data.currency = e.target.value;
      save();
      showToast(`ប្តូររូបិយប័ណ្ណទៅ ${data.currency}`);
    };
  }

  // Preset addition in settings
  const addPresetBtn = $("#addPresetBtn");
  if (addPresetBtn) {
    addPresetBtn.onclick = () => {
      const label = $("#newPresetLabel").value.trim();
      const text = $("#newPresetText").value.trim() || label;
      if (!label) return alert("សូមបញ្ចូលឈ្មោះ Preset");

      setButtonLoading(addPresetBtn, true, "កំពុងបន្ថែម...");
      startTopLoader();

      setTimeout(() => {
        data.aiPresets = data.aiPresets || [];
        data.aiPresets.push({
          id: Date.now(),
          label,
          text
        });

        save();
        setButtonLoading(addPresetBtn, false);
        $("#newPresetLabel").value = "";
        $("#newPresetText").value = "";
        showToast("បន្ថែម AI Preset ថ្មីបានជោគជ័យ!");
      }, 300);
    };
  }

  // Clear data
  if ($("#clearData")) {
    $("#clearData").onclick = () => {
      if (confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យទាំងអស់មែនទេ?")) {
        startTopLoader();
        data.transactions = [];
        data.savingPlans = [];
        data.savingsDeposits = [];
        save();
        showToast("បានលុបទិន្នន័យទាំងអស់!");
      }
    };
  }

  // Smart Save AI Assistant Integration ("MY MONEY AI")
  const parseBtn = $("#parseBtn");
  if (parseBtn) {
    parseBtn.onclick = () => {
      const text = $("#quickText").value.trim();
      if (!text) return;
      
      setButtonLoading(parseBtn, true, "កំពុងវិភាគ...");
      startTopLoader();

      setTimeout(() => {
        const isSavingQuery = /save|សន្សំ|plan|ផែនការ/i.test(text);

        if (isSavingQuery) {
          // Comprehensive MY MONEY AI Analysis
          const currentMonthTx = getMonthTx();
          const inc = currentMonthTx.filter(x => x.type === "income").reduce((a, x) => a + x.amount, 0);
          const exp = currentMonthTx.filter(x => x.type === "expense").reduce((a, x) => a + x.amount, 0);
          const netCapacity = inc - exp;

          const plans = data.savingPlans || [];
          const activePlans = plans.filter(p => (Number(p.saved) || 0) < (Number(p.goal) || 0));
          
          let totalReqMonthly = 0;
          activePlans.forEach(p => {
            const m = calcPlanMetrics(p);
            totalReqMonthly += m.reqMonthly;
          });

          const isHealthy = netCapacity >= totalReqMonthly;

          $("#aiResult").innerHTML = `
            <div style="display:flex; flex-direction:column; gap:10px;">
              <b style="color:var(--accent-primary); font-size:15px;">✦ MY MONEY AI វិភាគផែនការសន្សំ៖</b>
              <div><b>ចំណូលខែនេះ៖</b> ${money(inc)}</div>
              <div><b>ចំណាយខែនេះ៖</b> ${money(exp)}</div>
              <div><b>ប្រាក់សន្សំសល់ (Net Capacity)៖</b> <b style="color:${netCapacity >= 0 ? "var(--accent-income)" : "var(--accent-expense)"}">${money(netCapacity)}</b></div>
              <div><b>ប្រាក់ត្រូវសន្សំសរុបប្រចាំខែ (Required Savings)៖</b> ${money(totalReqMonthly)}</div>
              <div style="margin-top:6px; padding:10px; border-radius:10px; background:${isHealthy ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)"}; border:1px solid ${isHealthy ? "#10b981" : "#f43f5e"}; font-size:12px; line-height:1.5;">
                ${isHealthy 
                  ? `✅ <b>ស្ថានភាពល្អប្រសើរ!</b> ប្រាក់នៅសល់ខែនេះ (${money(netCapacity)}) គ្រប់គ្រាន់សម្រាប់សន្សំក្នុងផែនការទាំងអស់ (${money(totalReqMonthly)}/ខែ)។`
                  : `⚠️ <b>ការព្រមានហិរញ្ញវត្ថុ!</b> ប្រាក់សល់ខែនេះ (${money(netCapacity)}) តិចជាងប្រាក់ត្រូវសន្សំប្រចាំខែ (${money(totalReqMonthly)})។ សូមកាត់បន្ថយចំណាយ ឬពន្យារពេលកំណត់ផែនការ។`
                }
              </div>
              <button class="btn-primary" style="margin-top:8px; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="go('savings')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h2v2h4v-3.5c1-.5 1.5-1 2.5-2 2.5-2.5 2.5-6 1.5-7.5-.7-1-1.2-1.5-2-2z"/><path d="M16 11h.01"/></svg>
                <span>ទៅកាន់ទំព័រ ផែនការសន្សំប្រាក់</span>
              </button>
            </div>
          `;
        } else {
          const amt = parseAmount(text);
          const cat = smartCategory(text);
          const isIncome = /salary|ប្រាក់ខែ|income|លក់|អាជីវកម្ម/i.test(text);

          $("#aiResult").innerHTML = `
            <div style="display:flex; flex-direction:column; gap:8px;">
              <b style="color:var(--accent-primary); font-size:15px;">✦ AI បានវិភាគ៖</b>
              <div><b>ឈ្មោះ៖</b> ${esc(text)}</div>
              <div><b style="display:inline-flex; align-items:center; gap:6px;">ប្រភេទ៖</b> ${categorySVG(cat, 16)} <span>${cat}</span></div>
              <div><b>ចំនួន៖</b> ${amt ? money(amt) : "មិនស្គាល់ចំនួន"}</div>
              <button class="btn-primary" style="margin-top:12px;" onclick="addAITransaction('${esc(text)}', ${amt}, '${cat}', '${isIncome ? "income" : "expense"}')">
                + បន្ថែមទៅក្នុងប្រតិបត្តិការ
              </button>
            </div>
          `;
        }
        setButtonLoading(parseBtn, false);
      }, 350);
    };
  }

  window.addAITransaction = (title, amount, category, txType) => {
    if (!amount) return alert("សូមបញ្ជាក់ចំនួនទឹកប្រាក់");
    startTopLoader();
    const txDate = getTodayLocalStr();
    data.selectedMonth = txDate.slice(0, 7);

    data.transactions.push({
      id: Date.now(),
      title,
      amount,
      type: txType,
      category,
      date: txDate
    });
    save();
    showToast("បានបន្ថែមតាម AI រួចរាល់!");
    $("#quickText").value = "";
    $("#aiResult").innerHTML = `
      <div class="ai-placeholder">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <span>បានបន្ថែមទៅក្នុងប្រតិបត្តិការរួចរាល់!</span>
      </div>
    `;
  };

  // Initial render
  render();
});