(function attachCalculator(root) {
  const allowedPeriods = [12, 24, 36, 48];

  function cleanText(value, maxLength) {
    return typeof value === "string" ? value.slice(0, maxLength).trim() : "";
  }

  function cleanNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  }

  function normalizeEstimate(item, createId) {
    const periodMonths = cleanNumber(item?.periodMonths);
    return {
      id: cleanText(item?.id, 120) || createId(),
      name: cleanText(item?.name, 48),
      periodMonths: allowedPeriods.includes(periodMonths) ? periodMonths : 24,
      monthlyFee: cleanNumber(item?.monthlyFee),
      monthlyDiscount: cleanNumber(item?.monthlyDiscount),
      devicePrice: cleanNumber(item?.devicePrice),
      deviceDiscount: cleanNumber(item?.deviceDiscount),
      initialFees: cleanNumber(item?.initialFees),
      exitFees: cleanNumber(item?.exitFees),
      cashback: cleanNumber(item?.cashback),
      tradeIn: cleanNumber(item?.tradeIn),
      notes: cleanText(item?.notes, 240),
      updatedAt: new Date().toISOString(),
    };
  }

  function calculate(estimate) {
    const months = Math.max(1, cleanNumber(estimate?.periodMonths) || 1);
    const monthlyNet = Math.max(
      0,
      cleanNumber(estimate?.monthlyFee) - cleanNumber(estimate?.monthlyDiscount)
    );
    const recurringTotal = monthlyNet * months;
    const oneTimeTotal =
      cleanNumber(estimate?.devicePrice) +
      cleanNumber(estimate?.initialFees) +
      cleanNumber(estimate?.exitFees);
    const discountTotal =
      cleanNumber(estimate?.deviceDiscount) +
      cleanNumber(estimate?.cashback) +
      cleanNumber(estimate?.tradeIn);
    const total = Math.max(0, recurringTotal + oneTimeTotal - discountTotal);

    return {
      months,
      total,
      effectiveMonthly: total / months,
    };
  }

  function csvCell(value) {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) {
      return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
  }

  function toCsv(estimates) {
    const rows = [
      [
        "Plan",
        "Period Months",
        "Monthly Fee",
        "Monthly Discount",
        "Device Price",
        "Device Discount",
        "Initial Fees",
        "Exit Fees",
        "Points Or Cashback",
        "Trade In Or Resale",
        "Total Cost",
        "Effective Monthly",
        "Notes",
      ],
    ];

    for (const estimate of estimates) {
      const result = calculate(estimate);
      rows.push([
        estimate.name,
        result.months,
        estimate.monthlyFee,
        estimate.monthlyDiscount,
        estimate.devicePrice,
        estimate.deviceDiscount,
        estimate.initialFees,
        estimate.exitFees,
        estimate.cashback,
        estimate.tradeIn,
        Math.round(result.total),
        Math.round(result.effectiveMonthly),
        estimate.notes,
      ]);
    }

    return `${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
  }

  const api = {
    allowedPeriods,
    calculate,
    cleanNumber,
    cleanText,
    normalizeEstimate,
    toCsv,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.MnpCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
