# Sprint Kickoff Brief: Times Table Generator

## Sprint goal

At the demo, the Admin opens https://shindesubodh.github.io/Demo-E2E-SDLC/ on a phone and a laptop, types "7" and sees 10 correct rows from "7 × 1 = 7" to "7 × 10 = 70", then types "abc" and sees "Please enter a whole number from 1 to 100." with the table cleared. A green CI run lists the passing validation and table tests by name.

## Stories in this sprint

| ID | Story | MoSCoW | Points |
|---|---|---|---|
| S1 | Generate a times table (Generate button or Enter, 10 rows, trimmed input) | Must | 3 |
| S3 | Clear error for an invalid entry (table cleared, typed text kept) | Must | 3 |
| S2 | Replace the table with a new number | Must | 1 |
| S4 | Keyboard and screen reader use | Should | 2 |
| S5 | Readable text and visible focus | Should | 2 |
| S6 | Works on phone and laptop | Must | 2 |
| S7 | Tested builds deployed to a public link | Must | 2 |
| **Total** | | | **15** |

Capacity is 20 points, so 5 points remain as buffer for CI fixes and review changes. Build order: S1 → S3 → S2 → S4 → S5 → S6 → S7.

## How it will be built

- **Pure logic in `src/timesTable.js`:** named exports `parseTableNumber(text)`, `buildTable(n)`, `formatRow(n, m)` and `ERROR_MESSAGE`. `parseTableNumber` trims the text, checks `/^[0-9]+$/` and the range 1–100, and never throws. `buildTable` returns 10 `TableRow` objects (`multiplier`, `product`, `text`) and throws `RangeError` outside 1–100.
- **One screen in `src/App.jsx`:** three `useState` values (`inputValue`, `rows`, `error`). A `<form noValidate>` holds a text input (`id="number-input"`, `inputMode="numeric"`) with the linked label "Enter a number from 1 to 100" and a Generate button. `onSubmit` calls `preventDefault()`. A valid entry replaces `rows`. An invalid one sets `rows` to `[]` and shows the error. `inputValue` is never trimmed.
- **Accessibility:** the error renders in a `role="alert"` region and rows render in an `<ol>`. `index.html` sets `lang="en"` and the viewport meta tag.
- **Storage contract:** none. The app makes no localStorage, sessionStorage, cookie or network calls (ADR-3, NFR-04).
- **Styling in `src/App.css`:** the design tokens from the approved mockup are reused as CSS custom properties (`--color-*`, `--font-size-*`, `--space-*`, `--focus-ring`). Body text is at least 16 px, focus outlines are 2 px, and the layout is responsive from 360 px.
- **Build configuration:** in `vite.config.js`, `base: '/Demo-E2E-SDLC/'` and `test.environment: 'jsdom'`. The npm scripts stay unchanged. The only new dev dependency is `@testing-library/user-event`. The template `ci.yml` and `deploy-pages.yml` are unchanged.
- **Tests:** unit tests in `src/timesTable.test.js` cover 1, 7, 100, " 12 ", "007" and the 9 invalid cases (via `it.each`), plus `formatRow` and `RangeError`. Integration tests in `src/App.test.jsx` cover Generate, Enter, replacement, the error flow, the label, the alert region, and Tab/Enter/Space with `user-event`. Contrast, the 360 px layout and the deployed URL are checked by hand.

## Definition of Done

- [ ] Code is in github.com/shindesubodh/Demo-E2E-SDLC, on the starter template (React 18 + Vite 5), and merged to `main` through a pull request.
- [ ] Each acceptance criterion has at least one automated Vitest + Testing Library test (unit or jsdom integration).
- [ ] `.github/workflows/ci.yml` passes on the PR: `npm ci`, `npm test` and `npm run build` all succeed.
- [ ] The CI log lists the story's tests by name, each passed.
- [ ] No storage, cookies, analytics, third-party scripts or network calls are added.
- [ ] The error text is exactly "Please enter a whole number from 1 to 100." and rows use "×" (U+00D7) as "n × m = p".
- [ ] The code is reviewed and review comments are resolved.
- [ ] After the merge, `deploy-pages.yml` publishes `dist/` and https://shindesubodh.github.io/Demo-E2E-SDLC/ loads with its assets.
- [ ] On the deployed URL, the acceptance criteria are checked by hand: "7" shows 10 rows, "abc" shows the error, and the layout fits 360 px and a laptop screen.
- [ ] The Jira issue is moved to Done with its points unchanged.

## Risks and assumptions

- **Risk:** a wrong Vite `base` path breaks asset loading on Pages. **Mitigation:** set `'/Demo-E2E-SDLC/'` and check the deployed URL after the first merge.
- **Risk:** contrast and the 360 px layout cannot be tested in jsdom. **Mitigation:** check them by hand against the mockup tokens before closing S5 and S6.
- **Assumption:** leading zeros are valid ("007" becomes 7, per A-02), and a leading "+" is rejected.
- **Assumption:** velocity is 20 points with no history. The 15 committed points leave a 5-point buffer.

## Not in this sprint

- **No Could stories exist.** The BRD has no Could requirements, so the backlog has no deferred items.
- **Out of scope by design (not backlog items):**
  - quiz or practice features
  - multipliers beyond ×10
  - saving or history
  - sign-in or a server
  - printing or export
  - other languages
  - dashboards
  - production-grade targets or a WCAG audit