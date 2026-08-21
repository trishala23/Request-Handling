# Java Backend — HTTP Request Lifecycle

A static React + TypeScript + Vite study guide for beginners learning Java backend HTTP request handling. Phase 1 requires no backend, database, authentication, paid service, or real HTTP execution.

## Project structure

- `src/data/lessons.ts` — structured lesson content for all 8 lessons.
- `src/data/quiz.ts` — 20-question quiz covering Phase 1 topics.
- `src/lib/` — progress, quiz scoring, and request-builder logic.
- `src/components/` — reusable UI and interactive learning components.
- `src/test/` — Vitest unit tests.


## Project structure guidelines

See [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) for the contributor-facing directory map, placement rules, progress-state contract, static-hosting rules, and pull request checklist.

## Prerequisites

- Node.js 20+
- npm

## Local setup

```bash
npm install
```

## Development command

```bash
npm run dev
```

Open the Vite URL shown in your terminal.

## Test command

```bash
npm run test
```

## Production build command

```bash
npm run build
```

## GitHub Pages deployment instructions

This project is configured with a relative Vite base (`base: './'`) so it can be served from a GitHub Pages project path.

1. Push the branch to GitHub.
2. In the repository, open **Settings → Pages**.
3. Choose **GitHub Actions** as the Pages source.
4. Add a workflow that installs dependencies and uploads `dist/`, or use any static hosting action.
5. The minimum build commands are:

```bash
npm ci
npm run build
```

6. Publish the generated `dist/` directory.

## Cloudflare Pages deployment

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Pull request guidelines

- Use a feature branch for new changes.
- Keep commits focused and descriptive.
- Include a summary, test evidence, and screenshots for perceptible UI changes.
- Do not add backend, database, authentication, AI integration, payments, cloud APIs, or real HTTP calls in Phase 1.

## Known limitations

- Progress is browser-local via `localStorage`, so it does not sync across devices.
- The request builder only renders example HTTP text and intentionally performs no network calls.
