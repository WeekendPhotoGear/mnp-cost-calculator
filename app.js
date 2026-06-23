const STORAGE_KEY = "mnp-cost-calculator.estimates.v1";
const LANGUAGE_KEY = "mnp-cost-calculator.language.v1";

const translations = {
  en: {
    pageTitle: "MNP Cost Calculator",
    pageDescription:
      "A local-first calculator for comparing Japanese mobile plan switching costs.",
    eyebrow: "Local-first estimate tool",
    appTitle: "MNP Cost Calculator",
    storageBadge: "Browser-only storage",
    editorTitle: "Estimate",
    newButton: "New",
    nameLabel: "Plan name",
    namePlaceholder: "Carrier A 20GB switch",
    periodLabel: "Comparison period",
    period12: "12 months",
    period24: "24 months",
    period36: "36 months",
    period48: "48 months",
    monthlyFeeLabel: "Monthly fee",
    monthlyDiscountLabel: "Monthly discount",
    devicePriceLabel: "Device price",
    deviceDiscountLabel: "Device discount",
    initialFeesLabel: "Initial fees",
    exitFeesLabel: "Exit or transfer fees",
    cashbackLabel: "Points or cashback",
    tradeInLabel: "Trade-in or resale",
    notesLabel: "Notes",
    notesPlaceholder: "Campaign deadline, family discount, caveats",
    totalLabel: "Total cost",
    effectiveMonthlyLabel: "Effective monthly",
    saveButton: "Save",
    duplicateButton: "Duplicate",
    resultsTitle: "Comparison",
    exportJsonButton: "Export JSON",
    exportCsvButton: "Export CSV",
    importButton: "Import",
    tableCaption: "Saved estimates ranked by total cost",
    tablePlan: "Plan",
    tablePeriod: "Period",
    tableTotal: "Total",
    tableMonthly: "Effective monthly",
    tableDifference: "Difference",
    emptyTitle: "Save plans you want to compare",
    emptyBody:
      "Add device costs, discounts, and points to rank plans by effective total cost.",
    loadSamplesButton: "Load sample estimates",
    clearButton: "Clear browser data",
    noSaved: "No saved estimates yet.",
    summary: ({ count, diff }) =>
      `${count} estimates saved. The gap between the cheapest and highest total is ${diff}.`,
    noNotes: "No notes",
    months: ({ months }) => `${months} months`,
    best: "Best",
    edit: "Edit",
    delete: "Delete",
    copySuffix: " copy",
    confirmClear: "Clear all estimates saved in this browser?",
    importError: "Could not import that JSON file.",
  },
  ja: {
    pageTitle: "MNP総額電卓",
    pageDescription:
      "日本のMNP・回線乗り換え費用をブラウザ内だけで比較するローカルファースト電卓。",
    eyebrow: "Local-first estimate tool",
    appTitle: "MNP総額電卓",
    storageBadge: "ブラウザ内保存",
    editorTitle: "見積もり",
    newButton: "新規",
    nameLabel: "案名",
    namePlaceholder: "A社 20GB 乗り換え",
    periodLabel: "比較月数",
    period12: "12か月",
    period24: "24か月",
    period36: "36か月",
    period48: "48か月",
    monthlyFeeLabel: "月額料金",
    monthlyDiscountLabel: "月額割引",
    devicePriceLabel: "端末代",
    deviceDiscountLabel: "端末割引",
    initialFeesLabel: "初期費用",
    exitFeesLabel: "解約・転出費用",
    cashbackLabel: "ポイント還元",
    tradeInLabel: "下取り・売却見込み",
    notesLabel: "メモ",
    notesPlaceholder: "キャンペーン期限、家族割、注意点など",
    totalLabel: "総額",
    effectiveMonthlyLabel: "実質月額",
    saveButton: "保存",
    duplicateButton: "複製",
    resultsTitle: "比較",
    exportJsonButton: "JSON書き出し",
    exportCsvButton: "CSV書き出し",
    importButton: "読み込み",
    tableCaption: "総額が安い順に並んだ保存済み見積もり",
    tablePlan: "案",
    tablePeriod: "月数",
    tableTotal: "総額",
    tableMonthly: "実質月額",
    tableDifference: "差額",
    emptyTitle: "比較したい案を保存",
    emptyBody:
      "端末代、割引、ポイント還元を入れると、期間内の実質総額で並べられます。",
    loadSamplesButton: "サンプルを読み込む",
    clearButton: "保存データを削除",
    noSaved: "保存された案はまだありません。",
    summary: ({ count, diff }) =>
      `${count}件を比較中。最安と最高額の差は${diff}です。`,
    noNotes: "メモなし",
    months: ({ months }) => `${months}か月`,
    best: "最安",
    edit: "編集",
    delete: "削除",
    copySuffix: " コピー",
    confirmClear: "このブラウザに保存した見積もりを削除しますか？",
    importError: "JSONファイルを読み込めませんでした。",
  },
};

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
const exportJsonButton = document.querySelector("#exportJsonButton");
const exportCsvButton = document.querySelector("#exportCsvButton");
const importInput = document.querySelector("#importInput");
const clearButton = document.querySelector("#clearButton");
const loadSamplesButton = document.querySelector("#loadSamplesButton");
const languageButtons = document.querySelectorAll("[data-language-button]");
const calculator = globalThis.MnpCalculator;

let estimates = loadEstimates();
let currentLanguage = loadLanguage();

function yen(value) {
  const locale = currentLanguage === "ja" ? "ja-JP" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function numberValue(input) {
  const value = Number(input.value);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `estimate-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readForm() {
  return {
    id: fields.id.value || newId(),
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
  return calculator.calculate(estimate);
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

function sampleEstimates() {
  const updatedAt = new Date().toISOString();
  const samples = {
    en: [
      {
        name: "Sample BYOD switch",
        periodMonths: 24,
        monthlyFee: 2970,
        monthlyDiscount: 0,
        devicePrice: 0,
        deviceDiscount: 0,
        initialFees: 3850,
        exitFees: 0,
        cashback: 5000,
        tradeIn: 0,
        notes: "Sample only. Replace with your actual offer terms.",
      },
      {
        name: "Sample device discount",
        periodMonths: 24,
        monthlyFee: 3278,
        monthlyDiscount: 550,
        devicePrice: 22000,
        deviceDiscount: 12000,
        initialFees: 3850,
        exitFees: 0,
        cashback: 10000,
        tradeIn: 0,
        notes: "Shows how device discounts affect the total.",
      },
      {
        name: "Sample resale case",
        periodMonths: 12,
        monthlyFee: 3980,
        monthlyDiscount: 0,
        devicePrice: 44000,
        deviceDiscount: 16000,
        initialFees: 3850,
        exitFees: 0,
        cashback: 8000,
        tradeIn: 18000,
        notes: "Includes an expected trade-in or resale value.",
      },
    ],
    ja: [
      {
        name: "サンプル SIMのみ乗り換え",
        periodMonths: 24,
        monthlyFee: 2970,
        monthlyDiscount: 0,
        devicePrice: 0,
        deviceDiscount: 0,
        initialFees: 3850,
        exitFees: 0,
        cashback: 5000,
        tradeIn: 0,
        notes: "サンプルです。実際の条件に置き換えてください。",
      },
      {
        name: "サンプル 端末割引あり",
        periodMonths: 24,
        monthlyFee: 3278,
        monthlyDiscount: 550,
        devicePrice: 22000,
        deviceDiscount: 12000,
        initialFees: 3850,
        exitFees: 0,
        cashback: 10000,
        tradeIn: 0,
        notes: "端末割引が総額に与える影響を確認できます。",
      },
      {
        name: "サンプル 売却見込みあり",
        periodMonths: 12,
        monthlyFee: 3980,
        monthlyDiscount: 0,
        devicePrice: 44000,
        deviceDiscount: 16000,
        initialFees: 3850,
        exitFees: 0,
        cashback: 8000,
        tradeIn: 18000,
        notes: "下取りや売却見込みを含めた例です。",
      },
    ],
  };

  return samples[currentLanguage].map((estimate) => ({
    ...estimate,
    id: newId(),
    updatedAt,
  }));
}

function loadLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === "en" || saved === "ja") return saved;
  return navigator.language?.toLowerCase().startsWith("ja") ? "ja" : "en";
}

function t(key, params = {}) {
  const value = translations[currentLanguage][key] ?? translations.en[key] ?? key;
  return typeof value === "function" ? value(params) : value;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title = t("pageTitle");
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = t("pageDescription");

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }

  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }

  for (const button of languageButtons) {
    const isActive = button.dataset.languageButton === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
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
    summaryText.textContent = t("noSaved");
    return;
  }

  const worstTotal = calculate(sorted[sorted.length - 1]).total;
  summaryText.textContent = t("summary", {
    count: sorted.length,
    diff: yen(worstTotal - bestTotal),
  });

  for (const estimate of sorted) {
    const result = calculate(estimate);
    const diff = result.total - bestTotal;
    const row = document.createElement("tr");
    row.className = diff === 0 ? "best-row" : "";
    row.innerHTML = `
      <td>
        <div class="row-title">
          <strong>${escapeHtml(estimate.name)}</strong>
          <span>${escapeHtml(estimate.notes || t("noNotes"))}</span>
        </div>
      </td>
      <td>${t("months", { months: result.months })}</td>
      <td>${yen(result.total)}</td>
      <td>${yen(result.effectiveMonthly)}</td>
      <td>${diff === 0 ? t("best") : `+${yen(diff)}`}</td>
      <td>
        <div class="row-actions">
          <button class="icon-button" type="button" data-action="edit" data-id="${
            estimate.id
          }">${t("edit")}</button>
          <button class="icon-button" type="button" data-action="delete" data-id="${
            estimate.id
          }">${t("delete")}</button>
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
  fields.name.value = draft.name ? `${draft.name}${t("copySuffix")}` : "";
  updatePreview();
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.languageButton;
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    applyLanguage();
    updatePreview();
    render();
  });
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

function downloadFile(filename, type, contents) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

exportJsonButton.addEventListener("click", () => {
  const payload = {
    app: "mnp-cost-calculator",
    version: 1,
    exportedAt: new Date().toISOString(),
    estimates,
  };
  downloadFile(
    "mnp-cost-calculator.json",
    "application/json",
    JSON.stringify(payload, null, 2)
  );
});

exportCsvButton.addEventListener("click", () => {
  downloadFile(
    "mnp-cost-calculator.csv",
    "text/csv;charset=utf-8",
    calculator.toCsv(estimates)
  );
});

importInput.addEventListener("change", async () => {
  const file = importInput.files?.[0];
  importInput.value = "";
  if (!file) return;

  let imported;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    imported = Array.isArray(parsed) ? parsed : parsed.estimates;
    if (!Array.isArray(imported)) throw new Error("Invalid import shape");
  } catch {
    window.alert(t("importError"));
    return;
  }

  estimates = imported
    .filter((item) => item && typeof item.name === "string")
    .map((item) => calculator.normalizeEstimate(item, newId));
  saveEstimates();
  render();
});

clearButton.addEventListener("click", () => {
  if (estimates.length === 0) return;
  const confirmed = window.confirm(t("confirmClear"));
  if (!confirmed) return;

  estimates = [];
  saveEstimates();
  setForm();
  render();
});

loadSamplesButton.addEventListener("click", () => {
  if (estimates.length > 0) return;
  estimates = sampleEstimates();
  saveEstimates();
  render();
});

function readFormDefaults() {
  return {
    id: newId(),
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

applyLanguage();
setForm();
render();
