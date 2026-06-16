const assert = require("node:assert/strict");
const {
  calculate,
  normalizeEstimate,
  toCsv,
} = require("../calculator.js");

function test(name, run) {
  run();
  console.log(`ok - ${name}`);
}

test("calculates total and effective monthly cost", () => {
  const result = calculate({
    periodMonths: 24,
    monthlyFee: 2970,
    monthlyDiscount: 500,
    devicePrice: 22000,
    deviceDiscount: 10000,
    initialFees: 3850,
    exitFees: 0,
    cashback: 8000,
    tradeIn: 5000,
  });

  assert.equal(result.months, 24);
  assert.equal(result.total, 62130);
  assert.equal(result.effectiveMonthly, 2588.75);
});

test("does not let discounts make monthly or total cost negative", () => {
  const result = calculate({
    periodMonths: 12,
    monthlyFee: 1000,
    monthlyDiscount: 5000,
    devicePrice: 0,
    deviceDiscount: 0,
    initialFees: 0,
    exitFees: 0,
    cashback: 50000,
    tradeIn: 0,
  });

  assert.equal(result.total, 0);
  assert.equal(result.effectiveMonthly, 0);
});

test("normalizes imported estimates into supported periods and bounded text", () => {
  const estimate = normalizeEstimate(
    {
      id: "",
      name: "x".repeat(60),
      periodMonths: 18,
      monthlyFee: "-10",
      notes: "n".repeat(300),
    },
    () => "generated-id"
  );

  assert.equal(estimate.id, "generated-id");
  assert.equal(estimate.name.length, 48);
  assert.equal(estimate.periodMonths, 24);
  assert.equal(estimate.monthlyFee, 0);
  assert.equal(estimate.notes.length, 240);
});

test("exports spreadsheet-safe CSV", () => {
  const csv = toCsv([
    {
      name: 'Carrier "A"',
      periodMonths: 24,
      monthlyFee: 2970,
      monthlyDiscount: 0,
      devicePrice: 0,
      deviceDiscount: 0,
      initialFees: 3850,
      exitFees: 0,
      cashback: 0,
      tradeIn: 0,
      notes: "family, campaign",
    },
  ]);

  assert.match(csv, /^Plan,Period Months,/);
  assert.match(csv, /"Carrier ""A"""/);
  assert.match(csv, /"family, campaign"/);
  assert.match(csv, /75130,3130/);
});
