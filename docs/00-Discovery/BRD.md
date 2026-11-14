# Business Requirements (Lite BRD): Times Table Generator

## Executive summary

The Times Table Generator is a single-screen web app that shows the multiplication table for a number a student types in. The student enters a whole number from 1 to 100 and presses Generate or Enter. The app then shows 10 rows, from ×1 to ×10, in the format "7 × 3 = 21".

Any other entry shows one plain error message: "Please enter a whole number from 1 to 100." The main users are students aged 8 to 12, so the layout is simple, uncluttered and easy to read on a phone or a laptop.

The app is a proof of concept (POC) for a demo, not a production system. It is a static front end deployed to GitHub Pages, with no server, no storage and no sign-in. It is built in one sprint and has 7 user stories.

## Business objectives

| ID | Objective | Success measure |
|---|---|---|
| OB-01 | Let students look up the times table for any whole number from 1 to 100. | A valid entry shows exactly 10 correct rows (×1 to ×10) straight away. Automated tests check the results for 1, 7 and 100, and they pass in CI. |
| OB-02 | Guide students clearly when an entry is not valid. | Each invalid case shows the exact message "Please enter a whole number from 1 to 100." and no table rows. The cases are empty, spaces only, decimal, negative, zero, above 100, letters and symbols (including a leading '+'). Automated tests cover every case and pass in CI. |
| OB-03 | Make the app ready to demo on common devices. | At the demo, the app loads from its GitHub Pages URL on one phone and one laptop. On both devices, a valid number shows 10 correct rows and an invalid entry shows the error. |
| OB-04 | Give basic accessibility to keyboard and screen reader users. | Automated tests confirm three things: the input is found by its label, the error sits in a live region, and a table can be generated using only the keyboard. |

## User personas

**P1: Student (primary user)**
- Age 8 to 12. Uses a phone or a laptop at home or at school, often alone.
- Goal: quickly see a times table to practise or check an answer.
- Needs: short, plain English messages, a moderate font size and no clutter. Errors must explain what to type.

**P2: Admin (demo owner)**
- Acts as Sponsor, Product Owner and approver for this POC.
- Goal: show at a demo that the app works on a phone and a laptop from its public link.
- Needs: a stable GitHub Pages URL and visible evidence that tests passed in CI.

## Scope (in and out)

**In scope**
- One screen with a labelled number input ("Enter a number from 1 to 100") and a Generate button. Pressing Enter in the input also generates the table.
- Input validation:
  - Leading and trailing spaces are trimmed.
  - After trimming, only a whole number from 1 to 100 is accepted.
  - A leading '+' is treated as a symbol and rejected (see Assumptions and constraints).
- On a valid entry, the app shows the table from ×1 to ×10 as 10 rows in the format "7 × 3 = 21". A new valid entry replaces the previous table.
- On an empty, decimal, negative, zero, too-large, letter or symbol entry, the app:
  - shows one error message: "Please enter a whole number from 1 to 100.";
  - clears the table;
  - keeps the typed text so the user can fix it.
- Accessibility basics:
  - the input has a visible label;
  - the error is announced to screen readers (aria-live region);
  - the app works with the keyboard alone;
  - text has good colour contrast.
- Simple layout for students aged 8 to 12: plain English messages, moderate font size, no clutter, responsive on phone and laptop screens.
- Automated unit and integration tests for validation and table generation, run in CI, and deployment to GitHub Pages.

**Out of scope**
- Practice or quiz features: hiding answers, self-testing, scoring or timers. The user confirmed the app is for lookup only.
- Multipliers beyond ×10 (for example ×12), or a range chosen by the user.
- Numbers above 100, decimals, negatives or zero as valid inputs.
- Saving tables, history or favourites (no browser storage is needed).
- Sign-in, user accounts, progress tracking, or any server, database or backend API.
- Printing or exporting tables (PDF, image or share).
- Languages other than English.
- Teacher or parent dashboards, more than one table on screen at once, sound or animations.
- Production-grade concerns: user-count targets, uptime SLA, monitoring, or formal accessibility certification (WCAG audit).

## Business requirements

| BR ID | Description | Persona | MoSCoW | Rationale |
|---|---|---|---|---|
| BR-01 | The user can enter a number in a labelled input and generate a table with the Generate button or the Enter key. | P1 | Must | This is the core interaction. Enter support makes the app faster to use and supports keyboard use. |
| BR-02 | For a valid number n, the app shows 10 rows from "n × 1 = n" to "n × 10 = 10n". A new valid entry replaces the previous table. | P1 | Must | This is the core purpose of the app: looking up a times table. |
| BR-03 | Leading and trailing spaces are trimmed. Only whole numbers from 1 to 100 are accepted. Any other entry shows "Please enter a whole number from 1 to 100.", clears the table and keeps the typed text. | P1 | Must | Students need one clear message that tells them what to type, and they should not have to retype everything. |
| BR-04 | The input has a visible label, the error is announced to screen readers, all actions work with the keyboard alone, and text has good colour contrast. | P1 | Should | The user asked for basic accessibility. This makes the app usable for more students. |
| BR-05 | The layout is simple and readable on phone and laptop screens: moderate font size, plain English and no clutter. | P1 | Must | Students aged 8 to 12 use both kinds of device, and the demo success measure needs both. |
| BR-06 | The app is tested automatically in CI and deployed to a public GitHub Pages URL. | P2 | Must | The demo depends on a working public link and on evidence that the app behaves correctly. |

## User stories

**US-01: Generate a times table** (serves BR-01, BR-02)

As a student, I want to type a number and see its times table, so that I can practise or check my answers.
- Given the input contains "7", when I press Generate, then exactly 10 rows appear, from "7 × 1 = 7" to "7 × 10 = 70".
- Given the input contains "7", when I press Enter in the input, then the same 10 rows appear.
- Given the input contains "1" or "100", when I press Generate, then 10 rows appear, ending in "1 × 10 = 10" or "100 × 10 = 1000".
- Given the input contains " 12 " (with spaces around it), when I press Generate, then the table for 12 appears.

**US-02: Replace the table with a new number** (serves BR-02)

As a student, I want a new number to replace the old table, so that I only see the table I asked for.
- Given the table for 7 is shown, when I enter "9" and press Generate, then exactly 10 rows for 9 are shown and no rows for 7 remain.
- Given an error message is shown, when I enter a valid number and press Generate, then the error message disappears and the new table is shown.

**US-03: See a clear error for an invalid entry** (serves BR-03)

As a student, I want a simple message when my entry is wrong, so that I know what to type instead.
- Given the input contains any of "", "   ", "2.5", "-3", "0", "101", "abc", "+5" or "7!", when I press Generate, then the message "Please enter a whole number from 1 to 100." is shown.
- Given a table is shown, when I submit an invalid entry, then the table is cleared and no rows are shown.
- Given I submit an invalid entry, then the input still contains exactly what I typed.

**US-04: Use the app with the keyboard and a screen reader** (serves BR-04)

As a student who uses the keyboard or a screen reader, I want the app to be fully usable without a mouse, so that I can look up tables in the way I need.
- The input has a visible label, "Enter a number from 1 to 100", that is linked to it. A test can find the input by this label text.
- The error message is shown inside an aria-live (or role="alert") region, so screen readers announce it.
- Using only Tab, typing and Enter or Space, I can reach the input and the Generate button and generate a table.

**US-05: See the screen and where I am clearly** (serves BR-04)

As a student, I want text that is easy to read and a clear mark on the control I am using, so that I can see what to do and where I am on the screen.
- Given the app's colour tokens, when each text and background pair (title, label, input text, button text, table rows and error message) is checked with a contrast checker, then every pair has a contrast ratio of at least 4.5:1.
- Given I press Tab, when the input or the Generate button receives keyboard focus, then a visible focus indicator appears on it (an outline at least 2 px thick with a contrast ratio of at least 3:1 against the background).
- The focus indicator is never removed (no `outline: none` without a visible replacement) on the input or the Generate button.

**US-06: Open the app on my phone or laptop** (serves BR-05)

As a student, I want to open the app from a link on my phone or laptop, so that I can use it on the device I have.
- Given the app is deployed, when I open its GitHub Pages URL, then the input and the Generate button appear.
- Given a screen 360 px wide, when the table for 100 is shown, then the page has no horizontal scrolling and every row is fully visible.
- Body text is at least 16 px. The screen shows only the title, the input, the button, the error area and the table.

**US-07: Get tested builds deployed to a public link** (serves BR-06)

As the Admin, I want every change tested in CI and deployed to a public GitHub Pages URL, so that I can run the demo from a working link with evidence that the app behaves correctly.
- Given a pull request or a push to main, when CI runs, then `npm ci`, `npm test` and `npm run build` all run, and all three must pass before deployment.
- Given CI has run, when I open the CI log, then it lists the automated tests for validation and table generation, each marked as passed.
- Given a merge to main with CI passing, when the Pages workflow finishes, then the built `dist/` is published and the GitHub Pages URL serves the app.

## Non-functional requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-01 | Accessibility | Follow the WCAG 2.1 AA basics that matter here: text contrast of at least 4.5:1, a visible focus indicator, a labelled input, an announced error and full keyboard operation. There is no formal WCAG audit (out of scope). |
| NFR-02 | Performance | The table or the error appears in under 100 ms after Generate or Enter. Generating a table makes no network calls. |
| NFR-03 | Browser and device support | The latest versions of Chrome, Edge, Firefox and Safari on a laptop, plus Chrome on Android and Safari on iOS. Screen widths from 360 px to 1920 px. |
| NFR-04 | Privacy | No data is stored: no localStorage, sessionStorage, cookies, analytics or third-party scripts. Entered numbers never leave the browser. |
| NFR-05 | Readability | Plain English suitable for ages 8 to 12, body text of at least 16 px, and one task per screen with no extra content. |
| NFR-06 | Availability | Best effort on the GitHub Pages free tier. There is no SLA, RTO, RPO, monitoring or on-call, because this is a demo POC. |
| NFR-07 | Quality | Validation and table generation are covered by automated unit and integration tests that pass in CI. |

## Assumptions and constraints

**Assumptions**
- A-01: A leading '+' (for example "+5") is treated as a symbol and rejected with the standard error message.
- A-02: After trimming, only the digits 0 to 9 are accepted. Commas, exponent forms ("1e2"), inner spaces ("1 2") and other characters are rejected. Leading zeros (for example "007") are read as the number they represent (7). The Admin should confirm this at the gate.
- A-03: A valid entry removes any error message that was shown before.
- A-04: Table rows use the multiplication sign "×" (U+00D7) and the format "n × m = p", with single spaces.
- A-05: The intake asked for 2 to 3 user stories. The framework needs 5 to 10, so the confirmed scope is split into 7 small stories. No features are added.
- A-06: The users are students aged 8 to 12. No other user groups are targeted.

**Constraints**
- C-01: The app is a static front end only, deployed to GitHub Pages: no server, database, sign-in or secrets.
- C-02: It is built in one sprint (Sprint 1).
- C-03: It is built on the demo repo starter template: React 18 + Vite 5, with Vitest 2 + Testing Library + jsdom for tests, and GitHub Actions CI running `npm ci`, `npm test` and `npm run build`.
- C-04: The app is in English only.
- C-05: The app is a POC for a demo with one person or a handful of demo users. It has no production scale or support targets.

## Dependencies

- D-01: The demo GitHub repository and its starter template (React 18 + Vite 5, Vitest 2).
- D-02: GitHub Actions, for CI (tests and build) and for the Pages deployment workflow.
- D-03: GitHub Pages (free tier), for hosting the public URL.
- D-04: The npm registry, for installing dependencies during CI.
- D-05: The demo Jira project, for creating the backlog in Phase 2.
- D-06: The Admin's availability to approve each phase gate and to run the demo on a phone and a laptop.

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Approver (Sponsor, Product Owner) | Admin | Pending gate approval | — |

Status: **Pending gate approval** (Gate 0: Charter and Lite BRD sign-off).
