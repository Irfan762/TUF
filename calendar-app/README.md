# Wall Calendar Component

A responsive React wall-calendar component inspired by a classic printed wall calendar design.

## Features

- **Month navigation** — prev/next arrows to browse months
- **Day range selection** — click a start date, hover to preview, click end date; range highlights with blue fill and rounded caps
- **Notes** — per-month textarea persisted to `localStorage`; lined-paper background effect
- **Hero image** — full-bleed landscape photo per month (Unsplash, no API key needed)
- **Wave decoration** — SVG wave overlay matching the reference design
- **Responsive** — two-column layout (notes + grid) on desktop, stacks vertically on mobile (≤520px)

## Tech choices

| Choice | Reason |
|---|---|
| Vite + React | Fast dev experience, minimal config |
| CSS Modules | Scoped styles, no runtime overhead |
| localStorage | Client-side persistence, no backend needed |
| Unsplash static URLs | Free, no API key, reliable CDN |

## Run locally

```bash
cd calendar-app
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output goes to `dist/` — deploy to Vercel, Netlify, or GitHub Pages.
