# Product Backlog: Times Table Generator

## Epic overview

| Epic ID | Epic | Goal | Stories |
|---|---|---|---|
| E1 | Table lookup | A student enters a whole number from 1 to 100 and sees its 10-row times table; a new entry replaces the old table. | S1, S2 |
| E2 | Input validation and errors | Every invalid entry shows one plain error, clears the table and keeps the typed text. | S3 |
| E3 | Accessible, readable layout | The screen works with keyboard and screen reader, has good contrast and fits phones and laptops. | S4, S5, S6 |
| E4 | CI and deployment | Every change is tested in CI and deployed to the public GitHub Pages URL. | S7 |

## Stories

| ID | Epic | User story | Acceptance criteria | MoSCoW | T-shirt | Points | Sprint | Status | Depends on | BRD ref |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | E1 | As a student, I want to type a number and see its times table, so that I can practise or check my answers. | Given "7", when I press Generate, then exactly 10 rows appear, from "7 × 1 = 7" to "7 × 10 = 70".<br>Given "7", when I press Enter in the input, then the same 10 rows appear.<br>Given "1" or "100", when I press Generate, then 10 rows appear, ending in "1 × 10 = 10" or "100 × 10 = 1000".<br>Given " 12 ", when I press Generate, then the table for 12 appears. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | — | US-01 / BR-01, BR-02 |
| S2 | E1 | As a student, I want a new number to replace the old table, so that I only see the table I asked for. | Given the table for 7 is shown, when I enter "9" and press Generate, then exactly 10 rows for 9 are shown and no rows for 7 remain.<br>Given an error is shown, when I enter a valid number and press Generate, then the error disappears and the new table is shown. | Must | XS | 1 | Sprint 1 | Planned \| Sprint 1 | S1, S3 | US-02 / BR-02 |
| S3 | E2 | As a student, I want a simple message when my entry is wrong, so that I know what to type instead. | Given any of "", "   ", "2.5", "-3", "0", "101", "abc", "+5" or "7!", when I press Generate, then "Please enter a whole number from 1 to 100." is shown.<br>Given a table is shown, when I submit an invalid entry, then the table is cleared and no rows are shown.<br>Given I submit an invalid entry, then the input still contains exactly what I typed. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S1 | US-03 / BR-03 |
| S4 | E3 | As a student who uses the keyboard or a screen reader, I want the app to be fully usable without a mouse, so that I can look up tables in the way I need. | The input has a visible, linked label "Enter a number from 1 to 100"; a test finds the input by this label.<br>The error is shown inside an aria-live (or role="alert") region.<br>Using only Tab, typing and Enter or Space, I can reach the input and button and generate a table. | Should | S | 2 | Sprint 1 | Planned \| Sprint 1 | S1, S3 | US-04 / BR-04 |
| S5 | E3 | As a student, I want text that is easy to read and a clear mark on the control I am using, so that I can see what to do and where I am. | Every text/background pair (title, label, input text, button text, table rows, error) has a contrast ratio of at least 4.5:1.<br>On Tab, the input and the Generate button show a visible focus outline at least 2 px thick with at least 3:1 contrast.<br>No `outline: none` without a visible replacement on the input or the button. | Should | S | 2 | Sprint 1 | Planned \| Sprint 1 | S1 | US-05 / BR-04 |
| S6 | E3 | As a student, I want to open the app from a link on my phone or laptop, so that I can use it on the device I have. | Given the app is deployed, when I open the GitHub Pages URL, then the input and Generate button appear.<br>At 360 px width, the table for 100 shows with no horizontal scrolling and every row fully visible.<br>Body text is at least 16 px; the screen shows only the title, input, button, error area and table. | Must | S | 2 | Sprint 1 | Planned \| Sprint 1 | S1, S7 | US-06 / BR-05 |
| S7 | E4 | As the Admin, I want every change tested in CI and deployed to a public GitHub Pages URL, so that I can run the demo from a working link with evidence. | On a pull request or push to main, CI runs `npm ci`, `npm test` and `npm run build`; all three must pass before deployment.<br>The CI log lists the validation and table-generation tests, each marked as passed.<br>On a merge to main with CI passing, the Pages workflow publishes `dist/` and the URL serves the app. | Must | S | 2 | Sprint 1 | Planned \| Sprint 1 | — | US-07 / BR-06 |

There are no Could stories: the BRD has no Could requirements, and no scope is added.

## Estimation

- **Scale:** Fibonacci points (1, 2, 3, 5, 8), sized by T-shirt first: XS = 1, S = 2, M = 3, L = 5, XL = 8.
- **Per story:** S1 = 3 (input, button, Enter key, table rendering and tests for 1, 7, 100 and trimming). S2 = 1 (replace state; mostly falls out of S1 and S3). S3 = 3 (validation function with 9 invalid cases, clearing the table, keeping the text). S4 = 2 (label, live region, keyboard test). S5 = 2 (colour tokens, contrast checks, focus styles). S6 = 2 (responsive CSS, 16 px text, check at 360 px). S7 = 2 (the starter template already has `ci.yml` and `deploy-pages.yml`; work is confirming the scripts, test names and the Vite `base` path for `/Demo-E2E-SDLC/`).
- **Total:** 15 points.
- **Velocity assumption:** 20 points for one sprint, delivered by the orchestrator's build agent with the Admin approving gates. No historical velocity exists, so this is an assumption.
- **Confidence:** High (about 85%). The app is one screen with pure logic, no storage, no server and a ready starter template with CI and Pages workflows. The main risk is the Pages `base` path and the 360 px layout check, which are small and well understood.

## Sprint 1 plan

| Story | Points | MoSCoW |
|---|---|---|
| S1 Generate a times table | 3 | Must |
| S3 Clear error for an invalid entry | 3 | Must |
| S2 Replace the table with a new number | 1 | Must |
| S4 Keyboard and screen reader use | 2 | Should |
| S5 Readable text and visible focus | 2 | Should |
| S6 Works on phone and laptop | 2 | Must |
| S7 Tested builds deployed to a public link | 2 | Must |
| **Total** | **15** | |

- **Capacity:** 20 points. Committed: 15 points (75%), leaving 5 points of buffer for CI fixes and review changes.
- **Suggested order:** S1 → S3 → S2 → S4 → S5 → S6 → S7. Validation and table logic first, then accessibility and layout, then the deployed check.
- **Sprint goal (demonstrable):** At the demo, the Admin opens https://shindesubodh.github.io/Demo-E2E-SDLC/ on one phone and one laptop, types "7" and sees 10 correct rows from "7 × 1 = 7" to "7 × 10 = 70", types "abc" and sees "Please enter a whole number from 1 to 100." with the table cleared, and shows a green CI run listing the passing validation and table tests.

## Definition of Done

A story is Done | Sprint 1 only when every item below is true:

- [ ] Code is in the repo github.com/shindesubodh/Demo-E2E-SDLC, built on the starter template (React 18 + Vite 5), and merged to `main` through a pull request.
- [ ] Each acceptance criterion of the story has at least one automated Vitest + Testing Library test (unit for validation and table logic, integration for the `App` screen in jsdom).
- [ ] The GitHub Actions CI workflow (`.github/workflows/ci.yml`) passes on the pull request: `npm ci`, `npm test` (Vitest) and `npm run build` all succeed.
- [ ] The CI log lists the story's tests by name, each passed.
- [ ] No localStorage, sessionStorage, cookies, analytics, third-party scripts or network calls are added (NFR-04).
- [ ] Error text is exactly "Please enter a whole number from 1 to 100." and rows use "×" (U+00D7) in the format "n × m = p".
- [ ] The code has been reviewed and review comments are resolved.
- [ ] After the merge, the Pages workflow (`.github/workflows/deploy-pages.yml`) publishes `dist/`, and https://shindesubodh.github.io/Demo-E2E-SDLC/ loads the app (assets load correctly under the `/Demo-E2E-SDLC/` base path).
- [ ] On the deployed URL, the story's acceptance criteria are checked by hand: "7" shows 10 correct rows, "abc" shows the error, and the layout fits a 360 px wide screen and a laptop screen.
- [ ] The story's Jira issue is updated to Done with its points unchanged.

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Approver (Sponsor, Product Owner) | Admin | Pending gate approval | — |

Status: **Pending gate approval** (Gate 2: Backlog groomed). After approval, the 4 epics and 7 stories are created in the demo Jira project with their acceptance criteria, priority, points and epic link.
