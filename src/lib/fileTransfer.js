import { todayISO } from "./dates.js";
import { VERSION, validateData } from "./storage.js";

export const IMPORT_ERROR = "This file is not a valid Team To-Do export.";

export function buildExport(state, now = new Date()) {
  return {
    version: VERSION,
    exportedAt: now.toISOString(),
    members: state.members,
    tasks: state.tasks,
  };
}

export function exportFileName(now = new Date()) {
  return `team-todo-${todayISO(now)}.json`;
}

// Downloads the whole list as a JSON file.
export function exportToFile(state, now = new Date()) {
  const json = JSON.stringify(buildExport(state, now), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName(now);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function readImportFile(file) {
  try {
    const result = validateData(JSON.parse(await file.text()));
    return result.ok ? result : { ok: false, error: IMPORT_ERROR };
  } catch {
    return { ok: false, error: IMPORT_ERROR };
  }
}
