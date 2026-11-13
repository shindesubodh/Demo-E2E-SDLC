export const TEAM = ["Asha", "Ben", "Chen", "Dana"];
export const UNASSIGNED = "Unassigned";
export const ALL = "All";
export const STATUSES = ["All", "Open", "Done"];
export const STORAGE_KEY = "team-todo-tracker.tasks";
export const EMPTY_TITLE_ERROR = "Please enter a task title";

let counter = 0;
function newId() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

export function validateTitle(title) {
  return typeof title === "string" && title.trim() !== "" ? null : EMPTY_TITLE_ERROR;
}

// Returns { tasks, error }. New tasks go to the top of the list.
export function addTask(tasks, { title, assignee = "" }) {
  const error = validateTitle(title);
  if (error) return { tasks, error };
  const task = { id: newId(), title: title.trim(), assignee: assignee || "", done: false };
  return { tasks: [task, ...tasks], error: null };
}

// Returns { tasks, error }. Only title and assignee can be changed.
export function updateTask(tasks, id, { title, assignee = "" }) {
  const error = validateTitle(title);
  if (error) return { tasks, error };
  return {
    tasks: tasks.map((t) => (t.id === id ? { ...t, title: title.trim(), assignee: assignee || "" } : t)),
    error: null,
  };
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
    // Storage may be full or disabled (e.g. private mode); the app keeps working in memory.
  }
}
