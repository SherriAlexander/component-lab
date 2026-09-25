# Sherri Alexander · Component Lab

A small Storybook showing `AdaptiveTabs`: an accessible React + TypeScript primitive that switches between tabs and an accordion based on its **container** width, plus a branded "Plan Your Adventure" hero built on it.

Rebuilt from my [2018 CodePen original](https://codepen.io/SherriAlexander/pen/GwpZjv).

- **Storybook:** https://sherrialexander.github.io/component-lab/
- **Chromatic:** [published Storybook](https://main--6ab46730157b87223854a229.chromatic.com) · [component library](https://www.chromatic.com/library?appId=6ab46730157b87223854a229)

> Work in progress.

## AdaptiveTabs

```tsx
<AdaptiveTabs
  label="Plan your adventure"
  defaultValue="experience"
  onValueChange={(value) => console.log(value)}
  items={[
    { value: 'experience', title: 'Experience', content: <ExperiencePanel /> },
    { value: 'inspire', title: 'Inspire', content: <InspirePanel /> },
  ]}
/>
```

Full props, keyboard support, and the styling contract are on the component's Docs page in Storybook.

- **Container, not viewport.** The root is a size container. CSS sets `--adaptive-tabs-mode` in an `@container` rule, and a `ResizeObserver` reads it. The breakpoint lives in one place, and a composition can move it without touching JavaScript.
- **Only one mode in the DOM.** React renders tabs or an accordion, never both with one hidden, so there are no duplicate triggers for assistive tech to find.
- **Switching modes keeps your place.** Several accordion sections can be open. In tabs mode, the most recently opened one is selected. Going back opens only that one. Focus follows to the same item's new trigger.
- **Native where possible.** Accordion mode is `<details>` / `<summary>`, so the browser handles open state, <kbd>Enter</kbd> / <kbd>Space</kbd>, and hiding closed content. Tabs mode follows the WAI-ARIA tabs pattern: roving `tabindex`, arrow keys, automatic or manual activation. Inactive panels are `inert`.
- **Uncontrolled only.** `defaultValue` + `onValueChange`. With several sections open, what a parent-set `value` means is ambiguous, so there's no controlled mode. `useAdaptiveTabs()` gives content inside the component the current `{ mode, value }`.
- **No motion code.** The component exposes state as `data-*` attributes (`data-part`, `data-mode`, `data-value`, `data-state`). All styling and animation is CSS keyed off them. Content and focus update immediately, and motion never delays them.

## Stories

- **Components / AdaptiveTabs** — the neutral primitive, with docs, a live mode/value readout, and one story per behavior (keyboard in both modes, manual activation, resizing).
- **Compositions / Hero / Plan Your Adventure** — the branded hero, one story per tab, plus several containers side by side to show every breakpoint at once.
- **Foundations / Tokens** — the palette, and each accent with its measured contrast.

## Local development

Requires Node 24 (`.nvmrc`).

```sh
npm install            # also installs git hooks (lefthook)
npm run storybook      # dev server with hot reload at http://localhost:6006
npm run tokens         # build design tokens (runs automatically on install, storybook, build, test)
npm test               # token contrast check + stories as tests (play functions + a11y, headless Chromium)
npm run test:wip       # also runs stories tagged `wip` (written test-first, not passing yet)
npm run lint           # ESLint + Stylelint
npm run typecheck      # tsc --noEmit
npm run build-storybook
```

Git hooks: pre-commit formats and lints staged files; pre-push runs typecheck and tests.

## Design tokens

W3C DTCG JSON in `tokens/`: primitives, plus semantic sets that reference them (a `neutral` base skin and per-hue accents). Style Dictionary builds them into CSS custom properties and a resolved JSON file, both generated and not committed. The component reads only its own `--adaptive-tabs-*` role variables (trigger, active trigger, border, panel, focus), which fall back to the neutral set. The hero restyles it by pointing those roles at the current accent, without overriding any component selectors.

White text must reach 4.5:1 against both stops of every accent gradient. Neutral text needs 4.5:1 and borders and focus rings need 3:1 on both neutral surfaces. A unit test checks all of this on every `npm test`. The original's light blue and green ends failed that, so they're darker here. Its yellow failed at both ends, so it's now burnt orange.

## Testing

Stories are the tests. Storybook's Vitest addon runs every story in headless Chromium: play functions cover keyboard use in both modes, activation, resizing, and collapsed states, and every story must pass the axe accessibility check. Behavior stories were written first, as failing specs, and the component was built until they passed. Chromatic handles visual regression, with reduced motion on so snapshots are stable. The only unit test is the token contrast check.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and every push to `dev` or `main`: lint → typecheck → tests (token contrast + stories) → `build-storybook`.

Pushes to `main` then also run Chromatic visual tests and deploy the built Storybook to GitHub Pages. Everything else skips Chromatic to save snapshots.

## Branches

- `dev` is the integration branch. Feature branches come off `dev`, and PRs merge back into `dev`.
- `main` is the published branch. `dev` merges into `main` (regular merge commit, not squash) when a snapshot run and deploy are wanted.

## Credits

Photos from [Unsplash](https://unsplash.com/license), served via [Lorem Picsum](https://picsum.photos):

- Experience: [Abigail Keenan](https://unsplash.com/photos/8jqna7aA-vs)
- Inspire: [Stefanus Martanto Setyo Husodo](https://unsplash.com/photos/GKR1tBkmW3M)
- Explore: [Andrew Ridley](https://unsplash.com/photos/Kt5hRENuotI)
- Connect: [Dmitry Sytnik](https://unsplash.com/photos/bW2vHKCxbx4)

Fonts: Oswald and Montserrat (SIL Open Font License), self-hosted via Fontsource. Icons: Material Icons (Apache 2.0).
