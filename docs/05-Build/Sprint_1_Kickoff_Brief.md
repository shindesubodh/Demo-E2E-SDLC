# Sprint Kickoff Brief: Team To-Do Tracker

## Sprint goal

At https://shindesubodh.github.io/Demo-E2E-SDLC/, at 1280px and 375px, the Admin adds three members, adds and assigns five dated tasks with this week's tasks labelled "This week", ticks one off, filters by a member, clears the completed task, reloads with the data intact, then exports the list and imports it in a second browser with the same tasks and members.

## Stories in this sprint

| ID | Story | MoSCoW | Points |
|---|---|---|---|
| S1 | Add a task | Must | 3 |
| S3 | Manage team members | Must | 3 |
| S9 | Keep data after a reload | Must | 3 |
| S4 | Assign a task | Must | 2 |
| S2 | Edit and delete a task | Must | 3 |
| S5 | Mark a task done or pending | Must | 2 |
| S6 | See this week's pending work | Must | 3 |
| S7 | Filter by person and status | Must | 3 |
| S8 | Clear completed tasks | Should | 2 |
| S10 | Export and import the task list | Should | 5 |

**Total:** 29 points (Must 22, Should 7) against a capacity of 32 points. Build order follows the table.

## How it will be built

- **Stack:** the starter template (React 18 + Vite 5). `vite.config.js` sets `base: '/Demo-E2E-SDLC/'` and the jsdom test environment. The npm scripts and both workflows stay unchanged. The only runtime dependencies are `react` and `react-dom`.
- **State:** `StoreProvider` in `src/state/StoreContext.jsx` runs `useReducer(reducer, undefined, loadState)` and exposes `useStore()`. `reducer.js` is pure. `actions.js` (`addTask`, `addMember`) generates ids with `crypto.randomUUID()` and dates with `todayISO()`.
- **Logic modules:**
  - `selectors.js` provides `selectVisibleTasks` and `memberName`, memoised in `TaskListScreen`.
  - `dates.js` provides `weekRange` and `isThisWeek`, using Monday to Sunday in local time.
- **UI components:** `TaskForm`, `TaskItem`, `FilterBar`, `ClearCompletedButton`, `MemberManager`, `ExportImport`, `StorageWarning`, and two screens switched through app state in `App.jsx`. There is no router.
- **Storage contract:**
  - One localStorage key, `teamTodo.v1`, holds `{ version: 1, members, tasks }`. `storage.js` is the only module that touches it.
  - The export file has the same shape, plus `exportedAt`.
  - `validateData` checks loaded data and imports. It rejects bad fields, more than 10 members, duplicate ids, and versions other than 1.
  - Load never throws. A failed save shows the `StorageWarning` banner.
- **Design tokens:** the CSS custom properties from the Phase 4 mockup's Design notes go into `src/styles.css`. Component names match the mockup. Focus styles and the "This week" text badge make sure meaning is not shown by colour alone.
- **Tests:**
  - Vitest + Testing Library + jsdom.
  - Unit tests cover actions, reducer, selectors (including a 500-task filter under 100 ms), dates, storage and fileTransfer.
  - Integration tests act through labels and roles in the component test files and `App.test.jsx`.
  - Tests use an injected `today` and id, or `vi.setSystemTime`.

## Definition of Done

- [ ] The story is merged to `main` of github.com/shindesubodh/Demo-E2E-SDLC through a pull request.
- [ ] Every acceptance criterion has at least one automated test in `src/`. The only exception is the S1 timed test, which is manual.
- [ ] `npm ci`, `npm test` (with no skipped tests for the story) and `npm run build` all pass locally.
- [ ] The acceptance criteria are checked by hand in `npm run dev` at 375px and 1280px.
- [ ] `ci.yml` is green on the pull request and on `main`, and the `deploy-pages.yml` run succeeds.
- [ ] The deployed URL loads the new version with no 404 asset errors.
- [ ] The acceptance criteria are verified on the deployed URL in current Chrome, Safari and Firefox, at 375px and 1280px.
- [ ] There is no horizontal scrolling at 375px.
- [ ] Keyboard access works with a visible focus indicator. Every control has a label. Text contrast is at least 4.5:1. Nothing is shown by colour alone.
- [ ] All interface text is in English.
- [ ] The network tab shows no requests after the first load.
- [ ] Data survives a reload on the deployed URL.
- [ ] The Jira story is moved to Done, and the backlog status is set to "Done | Sprint 1".
- [ ] For S1, the timed test results at 1280px and 375px are recorded for the Phase 6 Test Report.

## Risks and assumptions

- **Risk:** the Monday-to-Sunday week calculation in local time (S6) and year boundaries. **Mitigation:** dedicated `dates.test.js` cases.
- **Risk:** Safari's date input and file download behaviour (S1, S10). **Mitigation:** check it by hand early, not at sprint end.
- **Assumption:** one developer, 10 working days, 32-point velocity, with no historical data behind it. If time runs short, S8 is dropped first, then S10.
- **Assumption:** the SDD's Q1 entry says "Production MVP". The app is built and described as a POC for a demo, with best-effort hosting on GitHub Pages and no SLA, monitoring or scale targets. The versioned storage shape is kept as designed.

## Not in this sprint

All 10 backlog stories are planned. No story is left in "Backlog | Future" or "Backlog | Could Have". The following stay out of scope under the approved BRD:

- Real-time sync, a server, accounts and sign-in. These need a backend.
- Priority and notes fields, and an automatic weekly reset.
- Notifications.
- More than 10 members, or more than one team or list.
- Merging on import. Import replaces the current list.
- Automatic backup. The JSON export is the only mitigation for data loss.
- PWA install, native apps and older browsers.
- Languages other than English.