const STORAGE_KEY = "mnp-cost-calculator.estimates.v1";

const fields = {
  id: document.querySelector("#estimateId"),
  name: document.querySelector("#estimateName"),
  periodMonths: document.querySelector("#periodMonths"),
  monthlyFee: document.querySelector("#monthlyFee"),
  monthlyDiscount: document.querySelector("#monthlyDiscount"),
  devicePrice: document.querySelector("#devicePrice"),
  deviceDiscount: document.querySelector("#deviceDiscount"),
  initialFees: document.querySelector("#initialFees"),
  exitFees: document.querySelector("#exitFees"),
  cashback: document.querySelector("#cashback"),
  tradeIn: document.querySelector("#tradeIn"),
  notes: document.querySelector("#notes"),
};

const estimateForm = document.querySelector("#estimateForm");
const estimateRows = document.querySelector("#estimateRows");
const emptyState = document.querySelector("#emptyState");
const summaryText = document.querySelector("#summaryText");
const previewTotal = document.querySelector("#previewTotal");
const previewMonthly = document.querySelector("#previewMonthly");
const resetFormButton = document.querySelector("#resetFormButton");
const duplicateButton = document.querySelector("#duplicateButton");
const exportButton = document.querySelector("#exportButton");
const importInput = document.querySelector("#importInput");
const clearButton = document.querySelector("#clearButton");

let estimates = loadEstimates();

function yen(value) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function numberValue(input) {
  const value = Number(input.value);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function readForm() {
  return {
    id: fields.id.value || crypto.randomUUID(),
    name: fields.name.value.trim(),
    periodMonths: numberValue(fields.periodMonths),
    monthlyFee: numberValue(fields.monthlyFee),
    monthlyDiscount: numberValue(fields.monthlyDiscount),
    devicePrice: numberValue(fields.devicePrice),
    deviceDiscount: numberValue(fields.deviceDiscount),
    initialFees: numberValue(fields.initialFees),
    exitFees: numberValue(fields.exitFees),
    cashback: numberValue(fields.cashback),
    tradeIn: numberValue(fields.tradeIn),
    notes: fields.notes.value.trim(),
    updatedAt: new Date().toISOString(),
  };
}

function calculate(estimate) {
  const months = Math.max(1, estimate.periodMonths || 1);
  const monthlyNet = Math.max(0, estimate.monthlyFee - estimate.monthlyDiscount);
  const recurringTotal = monthlyNet * months;
  const oneTimeTotal =
    estimate.devicePrice + estimate.initialFees + estimate.exitFees;
  const discountTotal =
    estimate.deviceDiscount + estimate.cashback + estimate.tradeIn;
  const total = Math.max(0, recurringTotal + oneTimeTotal - discountTotal);

  return {
    months,
    total,
    effectiveMonthly: total / months,
  };
}

function loadEstimates() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEstimates() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
}

function setForm(estimate) {
  fields.id.value = estimate?.id || "";
  fields.name.value = estimate?.name || "";
  fields.periodMonths.value = String(estimate?.periodMonths || 24);
  fields.monthlyFee.value = String(estimate?.monthlyFee ?? 2970);
  fields.monthlyDiscount.value = String(estimate?.monthlyDiscount ?? 0);
  fields.devicePrice.value = String(estimate?.devicePrice ?? 0);
  fields.deviceDiscount.value = String(estimate?.deviceDiscount ?? 0);
  fields.initialFees.value = String(estimate?.initialFees ?? 3850);
  fields.exitFees.value = String(estimate?.exitFees ?? 0);
  fields.cashback.value = String(estimate?.cashback ?? 0);
  fields.tradeIn.value = String(estimate?.tradeIn ?? 0);
  fields.notes.value = estimate?.notes || "";
  updatePreview();
}

function updatePreview() {
  const draft = readForm();
  const result = calculate(draft);
  previewTotal.textContent = yen(result.total);
  previewMonthly.textContent = yen(result.effectiveMonthly);
}

function render() {
  const sorted = [...estimates].sort(
    (a, b) => calculate(a).total - calculate(b).total
  );
  const bestTotal = sorted.length > 0 ? calculate(sorted[0]).total : null;

  estimateRows.innerHTML = "";
  emptyState.style.display = sorted.length === 0 ? "block" : "none";

  if (sorted.length === 0) {
    summaryText.textContent = "保存された案はまだありません。";
    return;
  }

  const worstTotal = calculate(sorted[sorted.length - 1]).total;
  summaryText.textContent = `${sorted.length}件を比較中。最安と最高額の差は${yen(
    worstTotal - bestTotal
  )}です。`;

  for (const estimate of sorted) {
    const result = calculate(estimate);
    const diff = result.total - bestTotal;
    const row = document.createElement("tr");
    row.className = diff === 0 ? "best-row" : "";
    row.innerHTML = `
      <td>
        <div class="row-title">
          <strong>${escapeHtml(estimate.name)}</strong>
          <span>${escapeHtml(estimate.notes || "メモなし")}</span>
        </div>
      </td>
      <td>${result.months}か月</td>
      <td>${yen(result.total)}</td>
      <td>${yen(result.effectiveMonthly)}</td>
      <td>${diff === 0 ? "最安" : `+${yen(diff)}`}</td>
      <td>
        <div class="row-actions">
          <button class="icon-button" type="button" data-action="edit" data-id="${
            estimate.id
          }">編集</button>
          <button class="icon-button" type="button" data-action="delete" data-id="${
            estimate.id
          }">削除</button>
        </div>
      </td>
    `;
    estimateRows.appendChild(row);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

estimateForm.addEventListener("input", updatePreview);

estimateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const estimate = readForm();
  if (!estimate.name) return;

  const index = estimates.findIndex((item) => item.id === estimate.id);
  if (index >= 0) {
    estimates[index] = estimate;
  } else {
    estimates.push(estimate);
  }

  saveEstimates();
  setForm();
  render();
});

resetFormButton.addEventListener("click", () => setForm());

duplicateButton.addEventListener("click", () => {
  const draft = readForm();
  fields.id.value = "";
  fields.name.value = draft.name ? `${draft.name} コピー` : "";
  updatePreview();
});

estimateRows.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const estimate = estimates.find((item) => item.id === button.dataset.id);
  if (!estimate) return;

  if (button.dataset.action === "edit") {
    setForm(estimate);
    fields.name.focus();
  }

  if (button.dataset.action === "delete") {
    estimates = estimates.filter((item) => item.id !== estimate.id);
    saveEstimates();
    render();
  }
});

exportButton.addEventListener("click", () => {
  const payload = {
    app: "mnp-cost-calculator",
    version: 1,
    exportedAt: new Date().toISOString(),
    estimates,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "mnp-cost-calculator.json";
  anchor.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", async () => {
  const file = importInput.files?.[0];
  importInput.value = "";
  if (!file) return;

  const text = await file.text();
  const parsed = JSON.parse(text);
  const imported = Array.isArray(parsed) ? parsed : parsed.estimates;
  if (!Array.isArray(imported)) return;

  estimates = imported
    .filter((item) => item && typeof item.name === "string")
    .map((item) => ({
      ...readFormDefaults(),
      ...item,
      id: item.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    }));
  saveEstimates();
  render();
});

clearButton.addEventListener("click", () => {
  if (estimates.length === 0) return;
  const confirmed = window.confirm("このブラウザに保存した見積もりを削除しますか？");
  if (!confirmed) return;

  estimates = [];
  saveEstimates();
  setForm();
  render();
});

function readFormDefaults() {
  return {
    id: crypto.randomUUID(),
    name: "",
    periodMonths: 24,
    monthlyFee: 0,
    monthlyDiscount: 0,
    devicePrice: 0,
    deviceDiscount: 0,
    initialFees: 0,
    exitFees: 0,
    cashback: 0,
    tradeIn: 0,
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

setForm();
render();
