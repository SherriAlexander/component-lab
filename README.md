# Sherri Alexander · Component Lab

A small Storybook showing `AdaptiveTabs`: an accessible React + TypeScript primitive that switches between tabs and an accordion based on its **container** width, plus a branded "Plan Your Adventure" hero built on it.

Rebuilt from my [2018 CodePen original](https://codepen.io/SherriAlexander/pen/GwpZjv).

> Work in progress. Storybook and Chromatic links will be added once deployed.

## Local development

Requires Node 24 (`.nvmrc`).

```sh
npm install            # also installs git hooks (lefthook)
npm run storybook      # dev server with hot reload at http://localhost:6006
npm test               # stories as tests: play functions + a11y, in headless Chromium
npm run lint           # ESLint + Stylelint
npm run typecheck      # tsc --noEmit
npm run build-storybook
```

Git hooks: pre-commit formats and lints staged files; pre-push runs typecheck and tests.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main` and every pull request: lint → typecheck → story tests → `build-storybook`. Then, if those pass, it runs Chromatic visual tests and (on `main` only) deploys the built Storybook to GitHub Pages.
