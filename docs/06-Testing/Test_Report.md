# Test Report: Times Table Generator

## Summary

**Verdict:** Ready to go to Phase 7 (Deployment), with 4 of 21 acceptance criteria not covered by an automated test. These 4 must be checked by hand or confirmed after deployment. No test failed.

- **CI result:** success on pull request #5. There were 0 CI fix attempts.
- **Test files:** 4 passed (4). **Tests:** 81 passed (81), from the CI log.
- **Named tests:** the verbose CI log names each of the 81 test runs, all passed. Some test-file entries are `it.each` tables that expand into several runs, so this report quotes only the CI count.
- **Acceptance criteria:** 17 of 21 covered and passing. 4 are Not covered:
  - S5: text contrast for every text pair
  - S6: deployed URL shows the input
  - S6: no horizontal scroll at 360 px
  - S7: Pages publishes `dist/`

## Test approach

- **Tools:** Vitest 2 with Testing Library and jsdom, as set in the starter template. CI runs on GitHub Actions for the pull request: `npm ci`, `npm test` and `npm run build`. The verbose reporter was added in `vite.config.js` so the CI log names every test.
- **Unit tests:** `src/timesTable.test.js` covers the pure logic: `ERROR_MESSAGE`, `formatRow`, `buildTable` and `parseTableNumber`. It checks valid entries and the S3 invalid entries.
- **Integration tests:** `src/App.test.jsx` renders the `App` screen in jsdom and drives it with typing, the Generate button, Enter, Tab and Space.
- **Static checks:**
  - `src/styles.test.js` reads the CSS tokens and rules: focus contrast, outline thickness, no `outline: none`, font sizes and fluid layout rules. It also checks the `index.html` meta tags.
  - `src/build.test.js` checks the npm scripts, the Vite `base` path, pinned dependencies and the absence of storage, cookie and network calls (NFR-04).
- **Not automated:**
  - Real layout at 360 px. jsdom does not compute layout.
  - Loading the deployed GitHub Pages URL.
  - Real screen reader announcement.
  - Text contrast for every text pair. The PR says this is tested, but no test with that name appears in the evidence.

## Acceptance criteria coverage

| Story | Acceptance criterion | Test(s) that verify it (file: test name) | Result |
|---|---|---|---|
| S1 | "7" + Generate shows exactly 10 rows, "7 × 1 = 7" to "7 × 10 = 70" | App.test.jsx: shows exactly 10 rows from "7 × 1 = 7" to "7 × 10 = 70" when 7 is entered and Generate is pressed; timesTable.test.js: returns exactly 10 rows for 7, from "7 × 1 = 7" to "7 × 10 = 70" | Pass |
| S1 | "7" + Enter shows the same 10 rows | App.test.jsx: shows the same 10 rows when 7 is entered and Enter is pressed in the input | Pass |
| S1 | "1" or "100" shows 10 rows ending in "1 × 10 = 10" or "100 × 10 = 1000" | App.test.jsx: shows 10 rows for "1" ending in "1 × 10 = 10"; shows 10 rows for "100" ending in "100 × 10 = 1000"; timesTable.test.js: returns 10 rows for 1 / for 100 | Pass |
| S1 | " 12 " shows the table for 12 | App.test.jsx: shows the table for 12 when " 12 " is entered | Pass |
| S2 | Table for 7, then "9": exactly 10 rows for 9, none for 7 | App.test.jsx: replaces the table for 7 with exactly 10 rows for 9 and no rows for 7 remain | Pass |
| S2 | After an error, a valid entry removes the error and shows the table | App.test.jsx: removes the error and shows the new table after a valid entry | Pass |
| S3 | Each of the 9 invalid entries shows "Please enter a whole number from 1 to 100." | App.test.jsx: shows the exact error message for "", "   ", "2.5", "-3", "0", "101", "abc", "+5", "7!" (9 tests); timesTable.test.js: parseTableNumber (S3 validation); is the exact approved wording | Pass |
| S3 | An invalid entry clears a shown table | App.test.jsx: clears a shown table when an invalid entry is submitted | Pass |
| S3 | The input keeps exactly what was typed | App.test.jsx: keeps exactly what was typed ("abc", " 2.5 ", "   ", "+5") in the input after an invalid entry | Pass |
| S4 | Visible, linked label "Enter a number from 1 to 100" | App.test.jsx: finds the input by its visible, linked label "Enter a number from 1 to 100" | Pass |
| S4 | Error is inside an aria-live or role="alert" region | App.test.jsx: shows the error inside a role="alert" region | Pass |
| S4 | Tab, typing and Enter or Space generate a table | App.test.jsx: generates a table using only Tab, typing and Enter; …Tab to reach the Generate button and Enter; …and Space | Pass |
| S5 | Every text/background pair is at least 4.5:1 | No named test in the evidence | Not covered |
| S5 | Focus outline at least 2 px with at least 3:1 contrast | styles.test.js: gives the input and the Generate button a focus outline at least 2 px thick; focus outline colour has at least 3:1 contrast against the surface and page background | Pass |
| S5 | No `outline: none` without a replacement | styles.test.js: never removes the outline with outline: none or outline: 0 | Pass |
| S6 | Deployed GitHub Pages URL shows the input and button | None: this happens after deployment | Not covered |
| S6 | At 360 px the table for 100 has no horizontal scroll | styles.test.js: uses a fluid layout that wraps and stacks the button on narrow screens (CSS rules only, no rendered layout) | Not covered |
| S6 | Body text at least 16 px; only title, input, button, error area and table | styles.test.js: sets body text to at least 16 px and never uses a font size below 16 px; App.test.jsx: shows only the title, input, button, error area and table | Pass |
| S7 | CI runs `npm ci`, `npm test`, `npm run build`; all pass | build.test.js: keeps the npm scripts CI runs; CI run status success, log shows tests passed and `vite build` succeeded | Pass |
| S7 | CI log lists validation and table tests as passed | CI log: verbose lines for parseTableNumber (S3 validation) and S1 tests, all ✓ | Pass |
| S7 | On merge, Pages publishes `dist/` and the URL serves the app | build.test.js: builds for the GitHub Pages path /Demo-E2E-SDLC/ with jsdom tests (base path only) | Not covered |

## Requirements traceability

| BR ID | Story | Code module(s) | Test file(s) | Status |
|---|---|---|---|---|
| BR-01 | S1 | src/timesTable.js, src/App.jsx | timesTable.test.js, App.test.jsx | Pass |
| BR-02 | S1, S2 | src/timesTable.js, src/App.jsx | timesTable.test.js, App.test.jsx | Pass |
| BR-03 | S3 | src/timesTable.js, src/App.jsx | timesTable.test.js, App.test.jsx | Pass |
| BR-04 | S4, S5 | src/App.jsx, src/App.css | App.test.jsx, styles.test.js | Partial: S5 text contrast is Not covered |
| BR-05 | S6 | src/App.css, src/App.jsx, index.html | styles.test.js, App.test.jsx | Partial: the 360 px check and the deployed load are manual |
| BR-06 | S7 | vite.config.js, package.json, .github/workflows/ci.yml, deploy-pages.yml | build.test.js | Partial: the Pages publish is checked in Phase 7 |

Every BR has at least one test. There are no tests without a BR. NFR-04 (no storage or network calls) is checked by build.test.js: app source makes no storage, cookie or network calls (NFR-04).

## CI run

- **Result:** success
- **Link:** https://github.com/shindesubodh/Demo-E2E-SDLC/actions/runs/43591985459/job/132438464589
- **Test summary lines from the log:**

```
Test Files  4 passed (4)
     Tests  81 passed (81)
  Duration  1.98s
```

- **Build:** `vite v5.4.11` transformed 32 modules and built in 553 ms. It produced `dist/index.html` (0.43 kB), a CSS file (2.73 kB) and a JS file (144.60 kB, 46.65 kB gzip).
- **Warnings:** The log has Node deprecation warnings (`punycode`, `url.parse()`). It also warns that the Node.js 20 actions (`actions/checkout@v4`, `actions/setup-node@v4`) were forced to run on Node.js 24. None of these affected the result.
- **Encoding:** In the raw log, the "×" sign appears as mojibake. This is a display issue in the log text only; the unit test formats 7 and 3 as "7 × 3 = 21" using the U+00D7 sign and passed.

## Code review

Findings from the Reviewer at Gate 5:

| Check | Result | Notes |
|---|---|---|
| Every Sprint 1 Must story is implemented | Pass | S1, S2, S3, S6 and S7 are implemented. |
| Each AC is covered by at least one test | Needs attention | The S6 360 px check and deployed-URL check, and the S7 deployed-URL check, are not covered in CI. This report lists them as Not covered. The PR's manual-check list was cut off. |
| Follows the approved design | Needs attention | The SDD and mockup were not given to the Reviewer, so component names and the look were not verified against them. |
| No external network calls, secrets or tracking | Pass | build.test.js asserts this. |
| Accessible: labels, keyboard, visible focus | Needs attention | A CSS comment states 4.3:1 focus contrast for #b35c00. The CI test of 3:1 focus contrast passed, which meets the AC. The `aria-describedby` link points at an empty alert region when there is no error; this is minor. |
| CI passed | Pass | Success. The PR summary was written before CI ran; the CI run confirms 81 passing. |
| Workflows and Vite base unchanged | Pass | `base` stays `/Demo-E2E-SDLC/`. |

## Defects and known issues

No test failed and no defect was logged. The known issues are:

1. **S5, text contrast at least 4.5:1 for every text pair: Not covered.** The PR says styles.test.js checks this, but no test with that name appears in the evidence. Before release, confirm it in the test file or check the pairs by hand.
2. **S6, the deployed URL shows the input and button: Not covered.** Check by hand after the Phase 7 deploy.
3. **S6, no horizontal scroll at 360 px for the table for 100: Not covered.** Only the CSS rules are tested. Check by hand at 360 px on the deployed site.
4. **S7, Pages publishes `dist/` and the URL serves the app: Not covered.** This will be confirmed by the Phase 7 deployment record.
5. **Minor review notes:**
   - The empty alert region is referenced by `aria-describedby`.
   - The SDD and mockup conformance was not verified.
   - Real screen reader announcement was not tested.

## UAT sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Approver (Sponsor, Product Owner) | Admin | Pending gate approval | — |

Status: **Pending gate approval** (Gate 6: UAT sign-off). Approval confirms that the Must stories S1, S2 and S3 pass in full, and that S6 and S7 pass except for their 3 Not covered ACs (known issues 2–4), which are manual checks around the Phase 7 deployment. The Should story S5 text-contrast AC (known issue 1) is also checked by hand.
