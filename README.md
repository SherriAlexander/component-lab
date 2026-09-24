# Sherri Alexander · Component Lab

A small Storybook showing `AdaptiveTabs`: an accessible React + TypeScript primitive that switches between tabs and an accordion based on its **container** width, plus a branded "Plan Your Adventure" hero built on it.

Rebuilt from my [2018 CodePen original](https://codepen.io/SherriAlexander/pen/GwpZjv).

- **Storybook:** https://sherrialexander.github.io/component-lab/
- **Chromatic:** [published Storybook](https://main--6ab46730157b87223854a229.chromatic.com) · [component library](https://www.chromatic.com/library?appId=6ab46730157b87223854a229)

> Work in progress.

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

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and every push to `dev` or `main`: lint → typecheck → story tests → `build-storybook`.

Pushes to `main` then also run Chromatic visual tests and deploy the built Storybook to GitHub Pages. Everything else skips Chromatic to save snapshots.

## Branches

- `dev` is the integration branch. Feature branches come off `dev`, and PRs merge back into `dev`.
- `main` is the published branch. `dev` merges into `main` (regular merge commit, not squash) when a snapshot run and deploy are wanted.
