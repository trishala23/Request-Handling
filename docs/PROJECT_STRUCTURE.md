# Project Structure Guidelines

This document explains how the Phase 1 static Java Backend Study Guide is organized and where future contributors should place changes. The goal is to keep the app beginner-friendly, static-hosting friendly, and easy to extend without introducing backend concerns.

## Guiding principles

- Keep Phase 1 fully static: no backend, database, authentication, server-side APIs, paid services, or real HTTP execution.
- Prefer small, reusable React components over page-specific one-off implementations.
- Keep lesson and quiz content in structured data files when possible.
- Keep pure logic in `src/lib` so it can be unit tested without rendering React.
- Use browser `localStorage` only for progress state.
- Preserve TypeScript strictness and avoid unnecessary global state libraries.
- Use accessible controls with visible focus states and keyboard-friendly interaction patterns.

## Directory map

```text
Request-Handling/
├── README.md
├── docs/
│   └── PROJECT_STRUCTURE.md
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── CodeBlock.tsx
    │   ├── Interactives.tsx
    │   ├── ProgressBar.tsx
    │   └── Sidebar.tsx
    ├── data/
    │   ├── lessons.ts
    │   └── quiz.ts
    ├── lib/
    │   ├── progress.ts
    │   ├── quiz.ts
    │   └── requestBuilder.ts
    └── test/
        └── core.test.ts
```

## Top-level files

| Path | Purpose |
| --- | --- |
| `README.md` | User-facing setup, commands, hosting instructions, and limitations. |
| `docs/PROJECT_STRUCTURE.md` | Contributor-facing guide for organizing future code and content changes. |
| `index.html` | Static HTML entry point for the Vite app. |
| `package.json` | npm scripts and minimal runtime/test dependencies. |
| `vite.config.ts` | Vite configuration, including relative `base` for GitHub Pages compatibility. |
| `tsconfig.json` | TypeScript strict-mode configuration for app source. |
| `tsconfig.node.json` | TypeScript configuration for Node-based config files. |
| `tailwind.config.js` | Tailwind content scanning configuration. |

## `src` organization

### `src/App.tsx`

Owns app-level composition:

- Current page selection.
- Home, lesson, lifecycle, and quiz routing.
- Progress state loading/saving.
- Layout composition with sidebar and mobile navigation.

Keep this file focused on page orchestration. If a page or interaction grows, extract it into `src/components` or a future `src/pages` directory.

### `src/components`

Reusable React UI and interactive learning pieces live here.

Use this folder for:

- Shared presentation components, such as `ProgressBar` and `CodeBlock`.
- Navigation components, such as `Sidebar`.
- Self-contained interactive widgets, such as request builders, matching activities, status quizzes, and lifecycle diagrams.

Do not put lesson text or quiz question data directly in components unless it is tightly coupled to a small interaction. Prefer `src/data` for learning content.

### `src/data`

Structured content belongs here.

Use this folder for:

- Lesson metadata and explanatory text.
- Quiz question definitions.
- Static examples used across multiple components.

When adding a lesson, define the lesson once in `lessons.ts` and render it through the shared lesson UI. Avoid creating a separate React page for every lesson unless the interaction is too custom for the generic lesson renderer.

### `src/lib`

Pure logic belongs here.

Use this folder for:

- Progress calculation and `localStorage` serialization.
- Quiz scoring and answer validation.
- HTTP request text generation.
- Other deterministic helpers that can be tested without the DOM.

Functions in `src/lib` should avoid React imports and should not make network calls.

### `src/test`

Unit tests belong here.

Test priorities:

- Progress calculation.
- `localStorage` progress loading, saving, reset, and lesson completion.
- Quiz scoring and answer validation.
- Request builder output.
- Any future pure helper logic added to `src/lib`.

Prefer fast unit tests for Phase 1. Add browser/component tests only when interactions become complex enough to justify them.

## Adding a new lesson

1. Add the lesson entry to `src/data/lessons.ts`.
2. Reuse an existing interaction type if possible.
3. If a new interaction is needed, add a focused component under `src/components`.
4. Add or update tests if the lesson introduces new pure logic.
5. Update navigation labels only if the learning path changes.
6. Confirm progress calculation still uses the full lesson list length.

## Adding quiz questions

1. Add the question to `src/data/quiz.ts`.
2. Choose the smallest appropriate type: multiple choice, true/false, or matching.
3. Always include an explanation and a correct answer.
4. Update or add tests if answer validation rules change.

## Progress state contract

The app stores this shape in browser `localStorage`:

```ts
type Progress = {
  completedLessons: string[];
  quizBestScore: number;
  lastVisitedLesson: string | null;
};
```

Do not add server persistence in Phase 1. If the shape changes, keep `loadProgress` backward-compatible with previously saved browser data.

## Static hosting rules

- Keep Vite `base` compatible with GitHub Pages project paths.
- Do not require environment variables for Phase 1.
- Do not introduce server-only code or APIs.
- Verify `npm run build` creates a static `dist/` directory suitable for GitHub Pages or Cloudflare Pages.

## Pull request checklist

Before opening a pull request:

- Confirm changes are on a feature branch, not directly on `main`.
- Run `npm run test`.
- Run `npm run build`.
- Include screenshots for visible UI changes when the environment allows it.
- Document any dependency, testing, or environment limitation clearly.
- Keep Phase 1 scope static-only.
