import { isValidISODate } from "./dates.js";

export const STORAGE_KEY = "teamTodo.v1";
export const VERSION = 1;
export const MAX_MEMBERS = 10;
export const MAX_TITLE = 120;
export const MAX_NAME = 40;

export function emptyState() {
  return { members: [], tasks: [] };
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isId(value) {
  return typeof value === "string" && value.length > 0;
}

function isText(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function hasDuplicates(values) {
  return new Set(values).size !== values.length;
}

function validMember(m) {
  return isPlainObject(m) && isId(m.id) && isText(m.name, MAX_NAME);
}

function validTask(t) {
  return (
    isPlainObject(t) &&
    isId(t.id) &&
    isText(t.title, MAX_TITLE) &&
    (t.assigneeId === null || isId(t.assigneeId)) &&
    (t.dueDate === null || isValidISODate(t.dueDate)) &&
    (t.status === "Pending" || t.status === "Done") &&
    isValidISODate(t.createdDate)
  );
}

// Checks stored data and imported files. Never throws.
// Returns only the known fields, so extras such as `exportedAt` are dropped.
export function validateData(obj) {
  const fail = (error) => ({ ok: false, error });
  if (!isPlainObject(obj)) return fail("The data is not an object.");
  if (obj.version !== VERSION) return fail(`Unsupported version: ${String(obj.version)}.`);
  const { members, tasks } = obj;
  if (!Array.isArray(members) || !Array.isArray(tasks)) return fail("Members and tasks must be lists.");
  if (members.length > MAX_MEMBERS) return fail(`More than ${MAX_MEMBERS} team members.`);
  if (!members.every(validMember)) return fail("A team member has an invalid field.");
  if (!tasks.every(validTask)) return fail("A task has an invalid field.");
  if (hasDuplicates(members.map((m) => m.id))) return fail("Two team members share an id.");
  if (hasDuplicates(members.map((m) => m.name.trim().toLowerCase()))) return fail("Two team members share a name.");
  if (hasDuplicates(tasks.map((t) => t.id))) return fail("Two tasks share an id.");

  return {
    ok: true,
    data: {
      members: members.map(({ id, name }) => ({ id, name: name.trim() })),
      tasks: tasks.map(({ id, title, assigneeId, dueDate, status, createdDate }) => ({
        id,
        title: title.trim(),
        assigneeId,
        dueDate,
        status,
        createdDate,
      })),
    },
  };
}

// Never throws: missing, unreadable or invalid data gives an empty state.
export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return emptyState();
    const result = validateData(JSON.parse(raw));
    return result.ok ? result.data : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  try {
    const doc = { version: VERSION, members: state.members, tasks: state.tasks };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}
