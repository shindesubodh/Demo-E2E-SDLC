# Product Backlog: Team To-Do Tracker

This backlog comes from the approved Lite BRD. It has 10 stories in 4 epics, all delivered in one sprint (Sprint 1). Each story traces to one BRD user story (US-01 to US-10) and its business requirements. BR-10 (devices, browsers, accessibility, language) has no story of its own. It is covered by NFR-01 to NFR-04 and checked for every story through the Definition of Done.

## Epic overview

| Epic ID | Epic | Goal | Stories |
|---|---|---|---|
| E1 | Task management | Users can capture, change, assign and tick off tasks | S1, S2, S4, S5 |
| E2 | Team setup | The Admin keeps the assignable member list (max 10) in line with the real team | S3 |
| E3 | Views and filters | The team sees this week's pending work and finds tasks by person and status | S6, S7, S8 |
| E4 | Data persistence and portability | Data survives reloads and can be copied between devices as a JSON file | S9, S10 |

## Stories

| ID | Epic | User story | Acceptance criteria | MoSCoW | T-shirt | Points | Sprint | Status | Depends on | BRD ref |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | E1 | As a Team Member, I want to add a task with a title, optional assignee and optional due date, so that work is captured in one place. | Given the task form, when I save a title of 1-120 characters, then the task appears with status Pending and today's created date.<br>Given an empty or whitespace-only title, when I save, then nothing is saved and an error shows next to the title field.<br>The title field accepts no more than 120 characters.<br>A first-time user adds and assigns a task in under 30 seconds. This is a manual timed test in Phase 6, run at 1280px and at 375px. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | None | US-01 / BR-01, BR-02 |
| S2 | E1 | As a Team Member, I want to edit or delete a task, so that the list stays accurate. | Given a task, when I change its title, assignee or due date and save, then the list shows the new values and the created date is unchanged.<br>Given a task, when I choose Delete and confirm, then it is removed from the list and from storage.<br>Given the delete confirmation, when I cancel, then the task is unchanged. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S1 | US-02 / BR-01 |
| S3 | E2 | As the Team Lead, I want to add, rename and remove team member names on a settings screen, so that the assign list matches my team. | Given fewer than 10 members, when I add a non-empty name, then it appears in the member list and in the assignee dropdown.<br>Given 10 members, when I try to add another, then it is blocked with "Maximum 10 team members".<br>Given a member with tasks, when I rename them, then their tasks show the new name.<br>Given a member with tasks, when I remove them, then those tasks show 'Unassigned'. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | None | US-03 / BR-07 |
| S4 | E1 | As the Team Lead, I want to assign or reassign a task to a team member, so that everyone knows who owns it. | Given a task, when I open the assignee field, then I can choose any current member or 'Unassigned'.<br>Given a task, when I choose a member and save, then the list shows that member's name on the task.<br>Given no members exist, when I add a task, then the assignee field offers only 'Unassigned'. | Must | S | 2 | Sprint 1 | Planned \| Sprint 1 | S1, S3 | US-04 / BR-02 |
| S5 | E1 | As a Team Member, I want to tick off a task when it is finished, and undo it if needed, so that the team sees real progress. | Given a Pending task in the default view, when I mark it Done, then its status is Done and it leaves the default view.<br>Given the status filter set to Done, when I mark a task Pending, then it shows in the default view again.<br>The done control works with the keyboard and has an accessible label that names the task. | Must | S | 2 | Sprint 1 | Planned \| Sprint 1 | S1 | US-05 / BR-03 |
| S6 | E3 | As a Team Member, I want the app to open on all Pending tasks sorted by due date, with this week's tasks highlighted, so that I see what needs doing now. | Given stored tasks, when the app opens, then only Pending tasks are listed.<br>The list is sorted by due date, earliest first, and tasks with no due date come last.<br>A Pending task due Monday to Sunday of the current week (device local time) is highlighted and also carries a "This week" text label.<br>Tasks due outside the current week, or with no due date, are not highlighted. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S1, S5 | US-06 / BR-04 |
| S7 | E3 | As a Team Member, I want to filter tasks by assignee and status, so that I can see only the tasks I care about. | When I choose an assignee (a member, 'Unassigned' or All), then only matching tasks are listed.<br>When I choose a status (Pending, Done or All), then only tasks with that status are listed.<br>When both filters are set, then only tasks matching both are listed.<br>With 500 tasks, the list updates within 100 ms of a filter change, with no page reload. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S4, S5, S6 | US-07 / BR-05 |
| S8 | E3 | As the Team Lead, I want to remove all Done tasks in one action, so that the stored list stays tidy. | Given at least one Done task, when I press 'Clear completed', then a confirmation states the count (e.g. "Remove 3 completed tasks?").<br>When I confirm, then all Done tasks are removed from the list and from storage, and Pending tasks are unchanged.<br>When I cancel, then no tasks are removed.<br>Given no Done tasks, then 'Clear completed' is disabled. | Should | S | 2 | Sprint 1 | Planned \| Sprint 1 | S5 | US-08 / BR-06 |
| S9 | E4 | As a Team Member, I want tasks and members to be saved automatically, so that nothing is lost when the page reloads. | Given I added, edited or deleted tasks or members, when I reload the page, then the list and settings show the same data.<br>Given empty or unreadable stored data, when the app opens, then it shows an empty task list without crashing. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S1, S3 | US-09 / BR-08 |
| S10 | E4 | As a Team Member, I want to export the list to a JSON file and import it on another device, so that I can copy or back up the team's tasks. | When I press Export, then a JSON file with all tasks and members downloads.<br>Given a valid exported file, when I import it and confirm the replace warning, then the current tasks and members are replaced by the file's contents.<br>Given an invalid or non-JSON file, when I import it, then an error shows and the current list is unchanged.<br>An export imported into another browser shows the same tasks and members. | Should | L | 5 | Sprint 1 | Planned \| Sprint 1 | S9 | US-10 / BR-09 |

Jira mapping after the gate: Must maps to High priority and Should maps to Medium priority. Each story's acceptance criteria go in its description, with its points and its epic as parent.

## Estimation

**Method:** Each story was T-shirt sized first, then given a Fibonacci estimate on the scale 1, 2, 3, 5, 8. No story is 1 or 8.

| T-shirt | Points | Stories |
|---|---|---|
| XS | 1 | None |
| S | 2 | S4, S5, S8 |
| M | 3 | S1, S2, S3, S6, S7, S9 |
| L | 5 | S10 |
| XL | 8 | None |

**Totals:**

- Total: 29 points.
- Must Have: 22 points (S1-S7, S9).
- Should Have: 7 points (S8, S10).

**Velocity assumption:** 32 points for Sprint 1. This assumes one developer on a 2-week sprint (10 working days), working on the existing starter template (React 18 + Vite 5, Vitest, GitHub Actions, GitHub Pages). There is no historical velocity, so this figure is an assumption. Sprint 1's actual velocity is recorded at the Phase 8 retrospective.

**Confidence level:** Medium-high (about 75%). The confidence rests on three points:

- The scope is small and fully specified.
- The CI and deployment pipeline already exist in the template.
- There is no server, sign-in or integration.

The main uncertainties are:

- The Monday-to-Sunday week calculation in local time (S6).
- Validating imported JSON files (S10).
- Cross-browser behaviour of date inputs and file download on Safari (S1, S10).
- The 100 ms filter target with 500 tasks (S7).

If time runs short, the Should stories S8 and S10 are dropped first, in that order.

## Sprint 1 plan

**Stories in Sprint 1, in build order:**

| Order | Story | Points | MoSCoW |
|---|---|---|---|
| 1 | S1 Add a task | 3 | Must |
| 2 | S3 Manage team members | 3 | Must |
| 3 | S9 Keep data after a reload | 3 | Must |
| 4 | S4 Assign a task | 2 | Must |
| 5 | S2 Edit and delete a task | 3 | Must |
| 6 | S5 Mark a task done or pending | 2 | Must |
| 7 | S6 See this week's pending work | 3 | Must |
| 8 | S7 Filter by person and status | 3 | Must |
| 9 | S8 Clear completed tasks | 2 | Should |
| 10 | S10 Export and import the task list | 5 | Should |

**Sequencing rationale:**

- Task capture (S1) and the member list (S3) come first, because the other stories depend on them.
- Persistence (S9) follows early, so all later work is saved and testable across reloads.
- The view, filter and clear stories build on the status change (S5).
- Export and import (S10) comes last, because it depends on the storage shape from S9.

**Total:** 29 points against a capacity of 32 points. That leaves 3 points (about 10%) of buffer.

**Sprint goal (demonstrable):** At https://shindesubodh.github.io/Demo-E2E-SDLC/, the Admin can do the following at 1280px and at 375px:

1. Add three team members.
2. Add and assign five tasks with due dates, and see this week's tasks labelled "This week".
3. Tick one task off and filter the list by a member.
4. Clear the completed task.
5. Reload the page and see the same data.
6. Export the list and import it in a second browser, where the same tasks and members appear.

## Definition of Done

A story is "Done \| Sprint 1" only when every item below is true.

**Code and review**
- [ ] Code is merged to `main` in github.com/shindesubodh/Demo-E2E-SDLC through a pull request.
- [ ] Each acceptance criterion of the story has at least one automated test (Vitest + Testing Library + jsdom) in `src/`. The only exception is the timed usability check in S1, which is a manual test.

**Local checks**
- [ ] `npm ci` completes with no errors.
- [ ] `npm test` passes, with no skipped tests for the story.
- [ ] `npm run build` produces `dist/` with no errors.
- [ ] The story's acceptance criteria are checked by hand in `npm run dev` at 375px and 1280px.

**CI and deployment**
- [ ] The GitHub Actions workflow `.github/workflows/ci.yml` (`npm ci`, `npm test`, `npm run build`) is green on the pull request and on `main`.
- [ ] The `.github/workflows/deploy-pages.yml` run on `main` succeeds.
- [ ] https://shindesubodh.github.io/Demo-E2E-SDLC/ loads the new version with no missing asset (404) errors in the browser console.

**Checks on the deployed URL**
- [ ] The story's acceptance criteria are verified at https://shindesubodh.github.io/Demo-E2E-SDLC/ on current Chrome, Safari and Firefox, at 375px and 1280px.
- [ ] There is no horizontal scrolling at 375px.
- [ ] Accessibility basics are met:
  - every action works with the keyboard, with a visible focus indicator
  - every form control has a label
  - text contrast is at least 4.5:1
  - status and "This week" are not shown by colour alone
- [ ] All interface text is in English.
- [ ] The browser network tab shows no requests after the first page load. Data is held only in localStorage.
- [ ] Data survives a reload on the deployed URL.

**Closing the story**
- [ ] The Jira story is moved to Done. The backlog status is updated to "Done \| Sprint 1".
- [ ] For S1, the timed manual test times (laptop 1280px and phone 375px) are recorded for the Phase 6 Test Report.

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Sponsor, Product Owner and approver | The Admin | Pending gate approval | Pending |

**Status:** Pending gate approval
