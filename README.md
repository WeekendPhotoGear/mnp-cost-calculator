# MNP Cost Calculator

MNP Cost Calculator is a local-first browser tool for comparing Japanese mobile
plan switching costs, including MNP offers, device discounts, fees, points, and
trade-in assumptions.

It calculates total cost and effective monthly cost across a chosen comparison
period. Estimates are saved only in the browser with `localStorage`; there is no
server, login, analytics, tracking, or external API.

Live site: <https://weekendphotogear.github.io/mnp-cost-calculator/>

![MNP Cost Calculator screenshot](assets/screenshot.jpg)

## Why this matters

Japanese mobile carrier switching offers can be hard to compare because the real
cost depends on monthly fees, temporary discounts, device payments, initial
fees, points, cashback, trade-in value, and the period being compared.

Many comparison tools are either spreadsheet-based, ad-heavy, or opaque about
where entered data goes. This project keeps the tool simple and inspectable:
plain static files, no account, and no server-side data collection.

## Features

- Compare 12, 24, 36, or 48 month totals.
- Include monthly fees, monthly discounts, device costs, fees, points, and trade-in.
- Save multiple estimates in the browser.
- Switch between English and Japanese UI.
- Export estimates as JSON or CSV, and import estimates as JSON.
- Works as a static site by opening `index.html`.
- Includes dependency-free calculation tests and a GitHub Actions check.

## Japanese

MNP Cost Calculator is built for people in Japan who want to compare mobile
carrier switching costs without sending their estimates to a service.

The tool compares total cost and effective monthly cost across 12, 24, 36, and
48 months by using monthly plan fees, temporary discounts, device payments,
device discounts, initial fees, points, cashback, and expected trade-in or resale
value.

Estimate data is stored only in the current browser with `localStorage`. The app
does not use login, server-side storage, analytics tags, advertising tags, or
external APIs. Saved estimates can be exported as JSON or CSV.

### 日本語概要

MNP Cost Calculator（MNP総額電卓）は、日本のMNP・回線乗り換え費用を
ブラウザ内だけで比較するローカルファーストなオープンソースツールです。

月額料金、月額割引、端末代、端末割引、初期費用、ポイント還元、
下取り・売却見込みを入力すると、12・24・36・48か月の総額と
実質月額を比較できます。

データは現在のブラウザの `localStorage` にのみ保存されます。ログイン、
サーバー保存、分析タグ、広告タグ、外部APIは使っていません。保存した
見積もりはJSONまたはCSVで書き出せます。

## Development

No build step is required.

```bash
python3 -m http.server 8765
```

Then open <http://127.0.0.1:8765/>.

Run checks:

```bash
npm test
npm run check
```

## Privacy

All estimate data stays in the current browser unless you export it manually.
Clearing site data or browser storage removes saved estimates.

See [PRIVACY.md](PRIVACY.md) for details.

## Feedback and issues

Bug reports and feature requests are tracked in
[GitHub Issues](https://github.com/WeekendPhotoGear/mnp-cost-calculator/issues).
Please remove private plan details, account numbers, and personal information
before posting screenshots or exported estimates.

## Maintainer workflow

- Changes should keep the app dependency-free unless there is a strong reason.
- Privacy-sensitive changes should be reviewed against [SECURITY.md](SECURITY.md).
- Usability and accessibility improvements should work on mobile first.
- Release notes should state whether storage format or import/export behavior changed.

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## License

MIT
