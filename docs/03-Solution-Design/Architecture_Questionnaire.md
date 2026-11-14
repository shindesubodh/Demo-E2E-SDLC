# Architecture Questionnaire: Times Table Generator

The Solution Architect suggested these answers from the approved BRD and backlog; the Admin confirmed them before the SDD was written.

## Answers

| # | Category | Key questions | Answer | Source |
|---|---|---|---|---|
| Q1 | Application Nature | POC vs production? Lifespan? Multi-tenant? White-labelled? | A proof of concept (POC) for a demo, not a production system, with a lifespan of the demo and one sprint of build (Sprint 1). Single-tenant, not white-labelled: one public static site for students aged 8-12. | BRD |
| Q2 | Users & Scale | Concurrent users at peak? Total users in 12 months? Geography? Devices? Browsers? | One person or a handful of demo users (the Admin at the demo), with no concurrency or 12-month user-count targets; English-speaking students aged 8-12. Devices: phone and laptop, screen widths 360-1920 px; browsers: latest Chrome, Edge, Firefox and Safari on laptop, plus Chrome on Android and Safari on iOS. | BRD |
| Q3 | Availability & Reliability | Uptime SLA? RTO? RPO? Peak usage windows? | Best effort on the GitHub Pages free tier, with no uptime SLA, RTO, RPO, monitoring or on-call. The only peak window is the demo itself; rollback is redeploying the previous commit. | BRD |
| Q4 | Performance | Acceptable page load time? Response time? Real-time vs batch? | The table or error must appear in under 100 ms after Generate or Enter, computed in the browser with no network calls (real-time, client-side). Assumed first page load under 2 seconds on a typical home or school connection, since the bundle is one small React screen. | Assumption |
| Q5 | Security & Compliance | GDPR / other regulation? Auth required? Data residency? PII handling? | No sign-in, no PII collected and nothing stored: no localStorage, sessionStorage, cookies, analytics or third-party scripts, and entered numbers never leave the browser. No GDPR or data-residency work is needed beyond this; accessibility follows WCAG 2.1 AA basics without a formal audit. | BRD |
| Q6 | AI & Model Constraints | AI used in the product? Provider? Can data go to external APIs? | No AI is used in the product, and no data goes to any external API. AI is used only by the orchestrator's agents to build the app, not at runtime. | Assumption |
| Q7 | Integration Landscape | Existing systems to integrate? APIs available? Identity provider? | No runtime integrations, backend APIs or identity provider: the app is a single self-contained static page. Delivery tooling only: GitHub repo shindesubodh/Demo-E2E-SDLC, GitHub Actions, GitHub Pages, the npm registry for CI installs, and the demo Jira project for the backlog. | BRD |
| Q8 | Infrastructure & Deployment | Cloud/hosting mandate? CI/CD in place? | Hosting is mandated as GitHub Pages at https://shindesubodh.github.io/Demo-E2E-SDLC/ (Vite base path /Demo-E2E-SDLC/), built on the starter template (React 18 + Vite 5, Vitest 2 + Testing Library + jsdom). CI/CD is in place: ci.yml runs npm ci, npm test and npm run build on pull requests and pushes to main, and deploy-pages.yml publishes dist/ on merge to main. | Backlog |
| Q9 | Team & Operations | Team size and skills? Who owns operations? Monitoring? | The Admin alone owns the app and approves every gate, with the orchestrator's build agent writing the code; no monitoring or on-call. Operations are limited to the Admin checking CI results and the deployed URL by hand. | Backlog |
| Q10 | Budget & Timeline | Infrastructure budget? Open-source only? Hard deadline? Phased delivery? | Zero infrastructure budget: free GitHub Pages and GitHub Actions, open-source dependencies only (React, Vite, Vitest). One sprint of 15 committed points against 20 capacity, no phased delivery; the hard deadline is the end of Sprint 1 and the demo. | Backlog |

## Assumptions

- Q4 Performance: The table or error must appear in under 100 ms after Generate or Enter, computed in the browser with no network calls (real-time, client-side). Assumed first page load under 2 seconds on a typical home or school connection, since the bundle is one small React screen.
- Q6 AI & Model Constraints: No AI is used in the product, and no data goes to any external API. AI is used only by the orchestrator's agents to build the app, not at runtime.

## Sign-off

Approved by the Admin on 2026-11-14 (Architecture Questionnaire decision card).
