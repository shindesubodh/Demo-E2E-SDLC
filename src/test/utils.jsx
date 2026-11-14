import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "../App.jsx";
import { STORAGE_KEY } from "../lib/storage.js";
import { StoreProvider } from "../state/StoreContext.jsx";

// Wednesday 18 Nov 2026, local time. Its week runs Mon 16 to Sun 22 Nov 2026.
export const TODAY = "2026-11-18";

export function fixToday() {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 18, 10, 0, 0));
}

export function member(id, name) {
  return { id, name };
}

export function task(id, title, extra = {}) {
  return { id, title, assigneeId: null, dueDate: null, status: "Pending", createdDate: "2026-11-10", ...extra };
}

export function seed({ members = [], tasks = [] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, members, tasks }));
}

export function stored() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

export function renderWithStore(ui) {
  const user = userEvent.setup();
  const result = render(<StoreProvider>{ui}</StoreProvider>);
  return { user, ...result };
}

export function renderApp() {
  return renderWithStore(<App />);
}
