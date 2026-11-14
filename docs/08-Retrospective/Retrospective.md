# Retrospective: Times Table Generator

## The run in numbers

| Phase | Minutes | Minutes waiting for the Admin | Cost | Automatic revisions |
|---|---|---|---|---|
| 0 Discovery | 11.4 | 7.4 | $0.84 | 1 |
| 2 Backlog & planning | 5.0 | 3.5 | $0.38 | 0 |
| 3 Solution design | 7.9 | 5.4 | $0.87 | 1 |
| 4 UI design | 2.7 | 0.7 | $0.61 | 1 |
| 5 Build | 15.6 | 4.0 | $0.86 | 0 |
| 6 Testing | 4.9 | 3.0 | $0.60 | 1 |
| 7 Deployment | 2.2 | 0.7 | $0.27 | 1 |
| 8 Retrospective | in progress | — | — | — |
| **Total** | **49.7** | **24.7** | **$4.43** | **5** |

- The run reports 42.6 minutes and $4.42 in total. The phase rows add up to 49.7 minutes and $4.43. The minutes gap is probably overlap or rounding in how phase time is counted; this is an assumption.
- Cost cap: $7.00. The run used about 63% of it, and the cap was raised 0 times.
- Waiting for the Admin: 24.7 of 49.7 phase minutes (about 50%).
- Other figures: 12 decisions, 11 Jira issues, 18 files changed, 4 test files, 0 CI fix attempts, 0 failed steps, 0 uploads, 0 change requests and 0 edited questionnaire answers.

## What went well

1. **The build passed CI on the first attempt.** There were 0 CI fix attempts. The Test Report shows 81 of 81 tests passing in 4 test files, and `vite build` succeeded.
2. **The run stayed well under budget with no failures.** It cost $4.42 against a $7.00 cap, with 0 cap raises and an empty failed-steps list.
3. **The early documents passed review cleanly.**
   - The Product Backlog scored 8/8 on its first version.
   - The Charter went from 6/7 to 7/7 after one revision.
   - The BRD went from 10/11 to 11/11 after one revision.
4. **The Admin made no change requests and edited 0 questionnaire answers.** This suggests the Discovery answers produced documents the Admin accepted as written.
5. **The deployment worked first time.** The deployment record shows commit `3b18249` live at 2026-11-14 12:01 UTC, with an HTTP 200 check, in a 2.2-minute phase.

## What didn't go well

1. **The Code review scored 4/7, and only one version was produced.** Three checks were "Needs attention":
   - AC coverage.
   - Conformance to the approved design.
   - Accessibility.
2. **4 of 21 acceptance criteria were Not covered by tests** (S5 text contrast, the S6 deployed URL, S6 at 360 px, and the S7 Pages publish). The PR claimed a text-contrast test that does not exist in the evidence.
3. **Two artefacts finished below full marks after a revision.**
   - The SDD stayed at 11/12 across 2 versions.
   - The Hi-Fi Mockups stayed at 8/9 across 2 versions.
   - So those revisions cost money but did not raise the score.
4. **Release Notes needed 3 versions** (5/6 to 6/6). The Test Report needed 2 versions and finished at 6/7.
5. **Discovery was the slowest phase to wait on.** It had 7.4 of its 11.4 minutes waiting for the Admin. Build was the longest phase overall at 15.6 minutes.

## Root causes

- **Code 4/7 on design conformance:** the Test Report states the SDD and mockup were not given to the Reviewer. The Reviewer could not check against them.
- **Uncovered ACs:**
  - Three of them (the deployed URL, real 360 px layout and the Pages publish) cannot run in jsdom CI. Yet they were written as CI-verifiable ACs in the backlog.
  - The contrast gap: the Test Report states the PR summary was written before CI ran. Its claims were not checked against the test names.
- **The PR's manual-check list was cut off:** the Test Report records the cut-off but not its cause. Assumption: a length limit on the Builder's PR output.
- **SDD and mockup revisions that did not raise the score:** the revision feedback likely did not target the failed check, or the check needs input the agent lacked. This is an assumption; the failed check is not named in the facts.
- **Release Notes 3 versions:** the facts do not say why. Assumption: one version may be the post-deploy addition of the deployment record, which the framework expects; the other revision raised the score from 5/6 to 6/6.
- **Discovery wait time:** the facts give only the 7.4 waiting minutes. Assumption: most of it was the Admin answering the Discovery clarifying questions, the main human input of the run.

## Action items

| Action | Owner | Due |
|---|---|---|
| Pass the approved SDD and Hi-Fi mockup to the Reviewer agent at Gate 5 | Orchestrator agent | Before the next run |
| Mark ACs as "manual / post-deploy" in the backlog when jsdom cannot verify them | Backlog agent | Before the next run |
| Write the PR summary after CI, listing only test names found in the test files | Builder agent | Before the next run |
| Stop truncation of the PR manual-check list | Builder agent | Before the next run |
| Do the 4 manual checks on the live URL (contrast pairs, 360 px, input and button visible, Pages serves the app) and record the results | Admin | Before the 1.0.0 demo |
| Make revision feedback name the failed gate check so the revision targets it | Reviewer agent | Before the next run |

## Process improvements for the next project

1. **Add a test type to every AC in the backlog** (unit, integration, static or manual). The Test Report can then expect "manual" items instead of reporting them as gaps.
2. **Add a Gate 5 check that every test the PR claims exists by name in the test files.** This catches the kind of missing contrast test seen in this run.
3. **Add a contrast test helper to the starter template.** It should compute the ratio of each CSS token pair, so S5-style contrast ACs can be automated.
4. **Skip an automatic revision when the failed check cannot be fixed by text.** Missing inputs, as with the SDD 11/12 and mockups 8/9, should trigger a note to the Admin instead.
5. **Add a post-deploy smoke step to the Phase 7 workflow.** It checks that the page HTML contains the input label. This would close the S6 deployed-URL AC automatically.
