# Release Notes: Times Table Generator 1.0.0

## Release

| Version | Planned deployment date | Live URL | Pull request |
|---|---|---|---|
| 1.0.0 | 2026-11-14 | https://shindesubodh.github.io/Demo-E2E-SDLC/ | [#5](https://github.com/shindesubodh/Demo-E2E-SDLC/pull/5) |

This is the Sprint 1 release of a proof of concept (POC) for a demo. It is not a production system.

## What's new

**E1 Table lookup**
- S1: Type a whole number from 1 to 100 and press Generate or Enter to see 10 rows, from "7 × 1 = 7" to "7 × 10 = 70". Spaces around the number are ignored.
- S2: A new valid number replaces the old table, and any error disappears.

**E2 Input validation and errors**
- S3: An empty, decimal, negative, zero, too-large, letter or symbol entry shows "Please enter a whole number from 1 to 100." The table is cleared and your typed text stays in the box so you can fix it.

**E3 Accessible, readable layout**
- S4: The input has a visible label. The error is announced to screen readers. The app works with Tab, typing, Enter and Space alone.
- S5: The input and the Generate button show a clear focus outline at least 2 px thick.
- S6: The screen shows only the title, input, button, error area and table. Text is at least 16 px, and the layout is built for phones and laptops.

**E4 CI and deployment**
- S7: Every change runs `npm ci`, `npm test` and `npm run build` in GitHub Actions. A merge to main publishes the app to GitHub Pages.

## How it was verified

The CI run on pull request #5 succeeded on the first attempt, with 0 fix attempts. It ran 4 test files and 81 tests, all passed, and `vite build` succeeded. Unit tests in `timesTable.test.js` check the validation and table logic. Integration tests in `App.test.jsx` drive the screen in jsdom. Static checks in `styles.test.js` and `build.test.js` cover the CSS, the npm scripts, the `/Demo-E2E-SDLC/` base path and the absence of storage or network calls. Automated tests cover 17 of 21 acceptance criteria, and none failed. Acceptance sign-off is the Admin's Gate 6 approval (the UAT sign-off); the Test Report provided here records it as "Pending gate approval", so this release assumes Gate 6 is approved before Gate 7.

## Known issues

1. **S5, text contrast of at least 4.5:1 for every text pair: not covered by a test.** Check the pairs by hand.
2. **S6, the deployed URL shows the input and button: not covered.** Check this by hand after the deploy.
3. **S6, no horizontal scroll at 360 px for the table for 100: not covered.** Only the CSS rules are tested. Check this on a 360 px screen.
4. **S7, Pages publishes `dist/` and the URL serves the app: not covered.** The deployment record will confirm it.
5. **Minor review notes:**
   - `aria-describedby` points at an empty alert region when no error is shown.
   - Conformance to the SDD and mockup was not verified.
   - A real screen reader was not tested.
6. **CI warnings:** The log shows Node deprecation warnings and a notice that the Node 20 actions ran on Node 24. These did not affect the result.

## Dependencies and environment changes

- **Runtime:** React 18, built with Vite 5 into static files in `dist/`. There are no other runtime services.
- **Hosting:** GitHub Pages free tier, under the base path `/Demo-E2E-SDLC/`. Availability is best effort, with no SLA, monitoring or on-call.
- **Browsers:** Current versions of Chrome, Edge, Firefox and Safari on phones and laptops. This is an assumption; only jsdom was tested in CI.
- **Data:** The app stores no data. It uses no localStorage, sessionStorage or cookies, and makes no network calls.
- **Infrastructure:** No server, database, sign-in or secrets. There are no environment variables.
- **Rollback:** Redeploy the previous commit on main.

## Go-live sign-off

| Role | Name | Decision | Date | Version |
|---|---|---|---|---|
| Approver (Sponsor, Product Owner) | Admin | Pending gate approval | — | 1.0.0 |

Status: **Pending gate approval** (Gate 7: Go-live sign-off). Approving runs the Pages workflow on main and deploys version 1.0.0 to the live URL. The app then adds the deployment record.

## Deployment record

| Live URL | Deployed (UTC) | Workflow run | Commit | Check |
|---|---|---|---|---|
| https://shindesubodh.github.io/Demo-E2E-SDLC/ | 2026-11-14 12:01 | [run](https://github.com/shindesubodh/Demo-E2E-SDLC/actions/runs/43592734510) | `3b18249` | HTTP 200 |
