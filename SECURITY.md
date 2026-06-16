# Security Policy

## Supported versions

The public GitHub Pages version on the `main` branch is the supported version.

## Reporting a vulnerability

Please open a GitHub issue if you find a privacy or security problem that does
not expose sensitive private data. If the report includes private information,
contact the repository owner first and avoid posting secrets publicly.

## Current security model

- The app is a static site made of HTML, CSS, and JavaScript.
- It has no backend server and no database.
- It does not send estimate data to external services.
- It stores estimates only in browser `localStorage`.
- Imported JSON is parsed in the browser and not uploaded.

## Repository write access

This repository is public for reading, but public visibility does not grant write
access. Only users with explicit collaborator or owner permissions on the GitHub
repository can push branches or merge changes.

External contributors can propose changes by opening pull requests from forks.
Those changes do not modify the published site unless a maintainer reviews and
merges them.

## Maintainer checklist

Before publishing changes, maintainers should verify:

- No secrets, API keys, private URLs, or credentials are committed.
- No analytics, ad scripts, or external APIs were added unintentionally.
- Local storage schema changes are documented.
- Import/export behavior remains user-controlled.
- The app still works as a static site.
