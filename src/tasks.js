export const PEOPLE = ["Asha", "Ben", "Chen", "Dana"];
export const UNASSIGNED = "Unassigned";
export const ALL = "All";
export const STATUSES = ["All", "Open", "Done"];
export const STORAGE_KEY = "team-todo-tracker.tasks";
export const EMPTY_TITLE_ERROR = "Please enter a task title";

let counter = 0;
function makeId() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

// Returns an error message, or null when the title is usable.
export function validateTitle(title) {
  return typeof title === "string" && title.trim() !== "" ? null : EMPTY_TITLE_ERROR;
}

export function createTask(title, assignee = "") {
  return { id: makeId(), title: title.trim(), assignee: assignee || "", done: false };
}

// New tasks go to the top of the list.
export function addTask(tasks, task) {
  return [task, ...tasks];
}

export function updateTask(tasks, id, changes) {
  return tasks.map((t) => (t.id === id ? { ...t, ...changes } : t));
}

export function deleteTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

export function toggleDone(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function countDone(tasks) {
  return tasks.filter((t) => t.done).length;
}

export function filterTasks(tasks, { person = ALL, status = ALL } = {}) {
  return tasks.filter((t) => {
    const personOk =
      person === ALL || (person === UNASSIGNED ? !t.assignee : t.assignee === person);
    const statusOk = status === ALL || (status === "Done" ? t.done : !t.done);
    return personOk && statusOk;
  });
}

function isTask(t) {
  return (
    t !== null &&
    typeof t === "object" &&
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.assignee === "string" &&
    typeof t.done === "boolean"
  );
}

// Reads saved tasks; anything missing or malformed yields an empty list.
export function loadTasks(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    return [];
  }
}

export function saveTasks(storage, tasks) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage full or blocked (e.g. private mode): keep working in memory.
  }
}
