# Business Requirements (Lite BRD): Team To-Do Tracker

## Executive summary

Team To-Do Tracker is a small web app. A team of up to 10 people uses it to add, assign and tick off tasks, so everyone can see what is pending this week. It is a static front end deployed to GitHub Pages. It has no server, database or sign-in. Tasks and team members are saved in the browser's localStorage, so the data survives a page reload.

The team shares one view by using one shared device, such as a team laptop. People can copy the list between devices by exporting and importing a JSON file (Should Have). Real-time sync is out of scope.

The app is built in one sprint of 10 user stories. It must work on current Chrome, Safari and Firefox at phone width (375px) and laptop width (1280px), and meet WCAG 2.1 AA basics.

## Business objectives

| ID | Objective | Success measure |
|---|---|---|
| BO-01 | Make it fast to capture and assign work | A user can add a task and assign it in under 30 seconds, measured by a timed manual test in Phase 6 |
| BO-02 | Give the team one clear view of pending work this week | The default view lists all Pending tasks sorted by due date and highlights tasks due Monday to Sunday of the current week; verified by acceptance criteria in Phase 6 |
| BO-03 | Let people find tasks by person and status | Assignee and status filters update the list instantly (within 100 ms for up to 500 tasks) with no page reload |
| BO-04 | Keep the team's data without a server | Tasks and members survive a page reload; the JSON export and import round-trip restores the same list |
| BO-05 | Work for everyone on the devices they use | The app passes all acceptance criteria on current Chrome, Safari and Firefox at 375px and 1280px, with keyboard use, labels and colour contrast meeting WCAG 2.1 AA basics |
| BO-06 | Deliver a working, tested release in one sprint | All Must Have acceptance criteria pass in Phase 6 and the app is live on GitHub Pages in Phase 7 |

## User personas

| Persona | Description | Goals | Pain points |
|---|---|---|---|
| P1: Team Lead (the Admin) | Runs a small team of up to 10 people. Sets up the shared team laptop. Acts as Sponsor, Product Owner and approver. | Keep the member list current. Assign work quickly. See what is still open this week. | Tasks live in chats and notes. Nobody knows who owns what or what is overdue. |
| P2: Team Member | One of up to 10 people on the team. Uses the shared laptop or their own phone or laptop with an imported copy of the list. | See their own pending tasks. Mark work done. Add tasks they discover. | Has to ask the lead what is assigned to them. Finished work is not visible to others. |

## Scope (in and out)

### In scope

- Add, edit and delete tasks. Each task has:
  - a required title (max 120 characters)
  - an optional assignee
  - an optional due date
  - a status (Pending or Done)
  - an automatic created date
- Assign a task to a team member chosen from the team member list.
- Mark a task Done or back to Pending.
- A default view that lists all Pending tasks sorted by due date, with tasks due this week (Monday to Sunday) highlighted.
- Filter the task list by assignee and by status (Pending, Done, All). The list updates instantly.
- A 'Clear completed' button that removes all Done tasks after a confirmation.
- A settings screen where the Admin adds, renames and removes up to 10 team member names. Tasks of a removed member show as 'Unassigned'.
- Tasks and members saved in browser localStorage, so data survives a page reload.
- Export the task list to a JSON file and import it from a JSON file (Should Have).
- A responsive, accessible layout:
  - works at 375px and 1280px on current Chrome, Safari and Firefox
  - meets WCAG 2.1 AA basics (keyboard use, labels, colour contrast)
  - English only

### Out of scope

- Real-time sync or sharing of tasks between devices (needs a server).
- Server, database, user accounts, sign-in or per-user permissions.
- Automatic backup or recovery of data lost when browser storage is cleared. This risk is mitigated only by the manual JSON export.
- Task priority and notes fields.
- Automatic weekly reset of tasks.
- Notifications, reminders or emails for due tasks.
- More than 10 team members, multiple teams or multiple task lists.
- Merging imported data with existing data. Import replaces the current list.
- Languages other than English, and accessibility beyond WCAG 2.1 AA basics.
- Offline install as a PWA, native mobile apps and support for older browsers.

## Business requirements

| BR ID | Description | Persona | MoSCoW | Rationale |
|---|---|---|---|---|
| BR-01 | Users can add, edit and delete tasks. Each task has a required title (max 120 characters), an optional assignee, an optional due date, a status (Pending or Done) and an automatic created date. | P1, P2 | Must | Core task capture; the confirmed task fields for this sprint |
| BR-02 | Users can assign a task to a member from the team member list, or leave it unassigned. | P1, P2 | Must | Everyone must see who owns each task |
| BR-03 | Users can mark a task Done, or set it back to Pending. | P1, P2 | Must | Ticking off work is the main daily action |
| BR-04 | The default view lists all Pending tasks sorted by due date and highlights tasks due this week (Monday to Sunday). | P1, P2 | Must | Answers "what is pending this week" without a weekly reset |
| BR-05 | Users can filter the list by assignee and by status (Pending, Done, All). The list updates instantly. | P1, P2 | Must | Members find their own work; Done tasks stay reachable |
| BR-06 | A 'Clear completed' button removes all Done tasks after a confirmation. | P1 | Should | Keeps the stored list tidy; the confirmation prevents accidental loss |
| BR-07 | The Admin can add, rename and remove up to 10 team member names on a settings screen. Tasks of a removed member show as 'Unassigned'. | P1 | Must | The assign list must match the real team; without sign-in, names are managed manually |
| BR-08 | Tasks and members are saved in browser localStorage and survive a page reload. | P1, P2 | Must | There is no server; data must persist on the shared device |
| BR-09 | Users can export the task list to a JSON file and import it from a JSON file. Import replaces the current list. | P1, P2 | Should | The only way to copy the list between devices and to back up against storage being cleared |
| BR-10 | The app works at 375px and 1280px on current Chrome, Safari and Firefox, and meets WCAG 2.1 AA basics, in English. | P1, P2 | Must | The team uses phones and laptops. Verified through NFR-01 to NFR-04 rather than a separate story. |

## User stories

### US-01: Add a task

As a Team Member, I want to add a task with a title, optional assignee and optional due date, so that work is captured in one place.

**Serves:** BR-01, BR-02

**Acceptance criteria:**

- Given the task form, when I enter a title of 1-120 characters and save, then the task appears in the list:
  - with status Pending
  - with the created date set to today
- Given the task form, when I try to save with an empty or whitespace-only title, then the task is not saved and an error message is shown next to the title field.
- Given the title field, when I type, then no more than 120 characters can be entered.
- Given a first-time user with no instructions, when they add a task and assign it to a member, then it takes under 30 seconds (NFR-07). This is a usability measure, so it is not covered by unit or integration tests. It is checked in Phase 6 by a timed manual test: one run on a laptop at 1280px and one on a phone at 375px, timed from opening the app to the assigned task showing in the list, with the times recorded in the Test Report.

### US-02: Edit and delete a task

As a Team Member, I want to edit or delete a task, so that the list stays accurate.

**Serves:** BR-01

**Acceptance criteria:**

- Given an existing task, when I change its title, assignee or due date and save, then the list shows the new values.
- When I edit a task, then the created date does not change.
- Given an existing task, when I choose Delete and confirm, then the task is removed from the list and from storage.
- Given the delete confirmation, when I cancel, then the task is unchanged.

### US-03: Manage team members

As the Team Lead, I want to add, rename and remove team member names on a settings screen, so that the assign list matches my team.

**Serves:** BR-07

**Acceptance criteria:**

- Given the settings screen with fewer than 10 members, when I add a non-empty name, then it appears in the member list and in the assignee dropdown.
- Given 10 members, when I try to add another, then the app blocks it and shows the message "Maximum 10 team members".
- Given a member with assigned tasks, when I rename them, then their tasks show the new name.
- Given a member with assigned tasks, when I remove them, then those tasks show as 'Unassigned'.

### US-04: Assign a task

As the Team Lead, I want to assign or reassign a task to a team member, so that everyone knows who owns it.

**Serves:** BR-02

**Acceptance criteria:**

- Given a task, when I open the assignee field, then I can choose any current team member or 'Unassigned'.
- Given a task, when I choose a member and save, then the task shows that member's name in the list.
- Given no team members exist, when I add a task, then the assignee field offers only 'Unassigned'.

### US-05: Mark a task done or pending

As a Team Member, I want to tick off a task when it is finished, and undo it if needed, so that the team sees real progress.

**Serves:** BR-03

**Acceptance criteria:**

- Given a Pending task in the default view, when I mark it Done, then its status becomes Done and it disappears from the default view.
- Given the status filter set to Done, when I mark a task back to Pending, then its status becomes Pending and it appears in the default view again.
- The done control can be operated with the keyboard and has an accessible label that names the task.

### US-06: See this week's pending work

As a Team Member, I want the app to open on all Pending tasks sorted by due date, with this week's tasks highlighted, so that I see what needs doing now.

**Serves:** BR-04

**Acceptance criteria:**

- Given stored tasks, when the app opens, then only Pending tasks are listed.
- The list is sorted by due date, earliest first. Tasks with no due date come last.
- Given a Pending task due between Monday and Sunday of the current week (device local time), then it is visibly highlighted, and the highlight also carries a text label such as "This week", so it is not shown by colour alone.
- Given a Pending task due outside the current week, or with no due date, then it is not highlighted.

### US-07: Filter by person and status

As a Team Member, I want to filter tasks by assignee and status, so that I can see only the tasks I care about.

**Serves:** BR-05

**Acceptance criteria:**

- When I choose an assignee (a member name, 'Unassigned' or All), then the list shows only matching tasks.
- When I choose a status (Pending, Done or All), then the list shows only tasks with that status.
- When both filters are set, then the list shows only tasks that match both.
- With up to 500 tasks, the list updates within 100 ms of a filter change, without a page reload.

### US-08: Clear completed tasks

As the Team Lead, I want to remove all Done tasks in one action, so that the stored list stays tidy.

**Serves:** BR-06

**Acceptance criteria:**

- Given at least one Done task, when I press 'Clear completed', then a confirmation states how many tasks will be removed (for example, "Remove 3 completed tasks?").
- Given the confirmation, when I confirm, then all Done tasks are removed from the list and from storage, and Pending tasks are unchanged.
- Given the confirmation, when I cancel, then no tasks are removed.
- Given no Done tasks, then 'Clear completed' is disabled.

### US-09: Keep data after a reload

As a Team Member, I want tasks and members to be saved automatically, so that nothing is lost when the page reloads.

**Serves:** BR-08

**Acceptance criteria:**

- Given I have added, edited or deleted tasks or members, when I reload the page, then the list and settings show the same data.
- Given empty or unreadable stored data, when the app opens, then it shows an empty task list without crashing.

### US-10: Export and import the task list

As a Team Member, I want to export the list to a JSON file and import it on another device, so that I can copy or back up the team's tasks.

**Serves:** BR-09

**Acceptance criteria:**

- When I press Export, then a JSON file containing all tasks and team members is downloaded.
- Given a valid exported file, when I import it and confirm the replace warning, then the current tasks and members are replaced with the file's contents.
- Given an invalid or non-JSON file, when I import it, then an error message is shown and the current list is unchanged.
- Given an export followed by an import of that file on another browser, then the same tasks and members appear.

## Non-functional requirements

| NFR ID | Category | Requirement |
|---|---|---|
| NFR-01 | Accessibility | Meets WCAG 2.1 AA basics. All actions can be done with the keyboard, with a visible focus indicator. Every form control has a label. Text contrast is at least 4.5:1. Status and the "this week" highlight are not shown by colour alone. |
| NFR-02 | Browser and device support | Works on current versions of Chrome, Safari and Firefox at 375px and 1280px wide. There is no horizontal scrolling at 375px. |
| NFR-03 | Performance | The first load on a laptop over broadband completes in under 2 seconds. Filter, add, edit and status changes show in under 100 ms with up to 500 tasks. |
| NFR-04 | Language | All interface text is in English. |
| NFR-05 | Privacy of browser storage | Data is stored only in this browser's localStorage. It is not sent anywhere. It is not encrypted, and anyone using the device can read it. Users should not store sensitive personal data in tasks. The app makes no network calls after loading. |
| NFR-06 | Data durability | Data survives page reloads and browser restarts. Clearing browser storage deletes the data. This is an accepted risk, mitigated by the JSON export. |
| NFR-07 | Usability | A first-time user can add and assign a task in under 30 seconds without instructions. Verified in Phase 6 by the timed manual test described in US-01 (laptop at 1280px and phone at 375px), with results recorded in the Test Report. |
| NFR-08 | Quality | All acceptance criteria are covered by automated tests, except the timed usability check in US-01 (NFR-07), which is a manual test in Phase 6. Unit and integration tests pass in CI before deployment. |

## Assumptions and constraints

### Constraints

- The app is a static front end deployed to GitHub Pages:
  - no server, database, sign-in or secrets
  - data lives only in browser localStorage
- It is delivered in one sprint (Sprint 1) of 10 user stories.
- It is built on the demo repo's starter template:
  - React 18 + Vite 5
  - tests with Vitest
  - CI on GitHub Actions
  - the final stack is confirmed in Phase 3
- The team is limited to 10 members, one team and one task list.
- Without sign-in, anyone with access to the device can use the settings screen. "Admin" is a role by agreement, not an enforced permission.

### Assumptions

- The team shares one device (a team laptop) as the main copy of the list. Other devices hold copies made by export and import.
- "This week" means Monday 00:00 to Sunday 23:59 in the device's local time zone.
- Tasks without a due date are sorted after tasks with a due date.
- Import replaces the current list of tasks and members after a confirmation. It does not merge.
- Member names are unique (case-insensitive) and at most 40 characters. This limit is assumed and was not specified in the intake.
- MoSCoW priorities are assumed and should be confirmed by the Admin at the gate:
  - Export and import is Should Have, as confirmed in the intake answers.
  - 'Clear completed' is set to Should Have.
  - All other requirements are Must Have.
- Performance targets assume up to 500 stored tasks.
- The timed usability test in Phase 6 is run by the Admin or a tester who has not used the app before.

## Dependencies

- GitHub repository with the starter template, GitHub Actions for CI, and GitHub Pages for hosting.
- Browser localStorage enabled. Private or restricted browsing modes may block or clear it.
- Browser support for file download and file selection, for the JSON export and import.
- The Admin's availability to answer questions and approve each phase gate.
- Phase 3 (Solution design) to define the storage keys, the JSON shape and versioning, and the component structure.
- Phase 4 (UI design) mockup approval before frontend build begins.

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Sponsor, Product Owner and approver | The Admin | Pending gate approval | Pending |

**Status:** Pending gate approval
