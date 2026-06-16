# MNP Cost Calculator

MNP Cost Calculator is a small local-first browser tool for comparing mobile
plan switching costs.

It calculates total cost and effective monthly cost across a chosen comparison
period. Estimates are saved only in the browser with `localStorage`; there is no
server, login, analytics, or external API.

## Features

- Compare 12, 24, 36, or 48 month totals
- Include monthly fees, monthly discounts, device costs, fees, points, and trade-in
- Save multiple estimates in the browser
- Export and import estimates as JSON
- Works as a static site by opening `index.html`

## Development

No build step is required.

```bash
open index.html
```

## Privacy

All estimate data stays in the current browser unless you export it manually.
Clearing site data or browser storage removes saved estimates.

## License

MIT
