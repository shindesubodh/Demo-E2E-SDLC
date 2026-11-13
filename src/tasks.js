export const TEAM = ["Asha", "Ben", "Chen", "Dana"];
export const UNASSIGNED = "Unassigned";
export const ALL = "All";
export const STATUSES = ["All", "Open", "Done"];
export const STORAGE_KEY = "team-todo-tasks";
export const EMPTY_TITLE_ERROR = "Please enter a task title";

let counter = 0;
function newId() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}`;
}

/** Returns the trimmed title, or null when it is empty or whitespace-only. */
export function cleanTitle(title) {
  const trimmed = (title ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/** Adds a new open task at the top of the list. Returns the list unchanged if the title is blank. */
export function addTask(tasks, title, assignee = "", id = newId()) {
  const clean = cleanTitle(title);
  if (clean === null) return tasks;
  return [{ id, title: clean, assignee, done: false }, ...tasks];
}

/** Updates title and/or assignee. A blank title leaves the task unchanged. */
export function updateTask(tasks, id, changes) {
  return tasks.map((task) => {
    if (task.id !== id) return task;
    const next = { ...task };
    if ("title" in changes) {
      const clean = cleanTitle(changes.title);
      if (clean === null) return task;
      next.title = clean;
    }
    if ("assignee" in changes) next.assignee = changes.assignee;
    return next;
  });
}

export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function toggleDone(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

/** person: "All", "Unassigned" or a team member's name. status: "All", "Open" or "Done". */
export function filterTasks(tasks, person = ALL, status = ALL) {
  return tasks.filter((task) => {
    const personOk =
      person === ALL || (person === UNASSIGNED ? !task.assignee : task.assignee === person);
    const statusOk = status === ALL || (status === "Done" ? task.done : !task.done);
    return personOk && statusOk;
  });
}

export function progressText(tasks) {
  const done = tasks.filter((task) => task.done).length;
  return `${done} of ${tasks.length} done`;
}

function isTask(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.assignee === "string" &&
    typeof value.done === "boolean"
  );
}

/** Reads saved tasks; returns [] if nothing is saved or the data is unreadable. */
export function loadTasks(storage = window.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks, storage = window.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage full or blocked (e.g. private mode): keep working in memory.
  }
}
