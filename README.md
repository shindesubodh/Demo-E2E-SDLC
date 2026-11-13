# Demo-E2E-SDLC

Target repo for the **SDLC Orchestrator** demos (POC #13/14). The orchestrator's agents write a
generated app here as a pull request; CI runs the tests; merging to `main` deploys it to GitHub Pages.

- `template` branch: the starter (React + Vite, Vitest, CI, Pages deploy). The orchestrator's
  **Clean up** resets `main` to it after each demo.
- Don't commit here by hand during a demo.
