import { MAX_MEMBERS, MAX_NAME, MAX_TITLE } from "../lib/storage.js";

export const TITLE_ERROR = `Enter a title (1–${MAX_TITLE} characters).`;
export const NAME_ERROR = `Enter a name (1–${MAX_NAME} characters).`;
export const MAX_MEMBERS_ERROR = `Maximum ${MAX_MEMBERS} team members`;

// Validation shared by the reducer and the forms (which show the messages).

export function titleError(title) {
  const trimmed = typeof title === "string" ? title.trim() : "";
  return trimmed.length >= 1 && trimmed.length <= MAX_TITLE ? null : TITLE_ERROR;
}

export function memberNameError(members, name, ignoreId = null) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (trimmed.length < 1 || trimmed.length > MAX_NAME) return NAME_ERROR;
  const taken = members.some((m) => m.id !== ignoreId && m.name.toLowerCase() === trimmed.toLowerCase());
  return taken ? `${trimmed} is already a team member.` : null;
}

export function addMemberError(members, name) {
  if (members.length >= MAX_MEMBERS) return MAX_MEMBERS_ERROR;
  return memberNameError(members, name);
}

function updateTask(state, id, change) {
  return { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...change } : t)) };
}

// Pure: no ids, dates or storage access. Invalid actions return the same state.
export function reducer(state, action) {
  const p = action.payload;
  switch (action.type) {
    case "task/add": {
      const { task } = p;
      if (titleError(task.title) || !task.id || state.tasks.some((t) => t.id === task.id)) return state;
      return { ...state, tasks: [...state.tasks, task] };
    }
    case "task/update": {
      if (titleError(p.title) || !state.tasks.some((t) => t.id === p.id)) return state;
      return updateTask(state, p.id, {
        title: p.title.trim(),
        assigneeId: p.assigneeId || null,
        dueDate: p.dueDate || null,
      });
    }
    case "task/delete":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== p.id) };
    case "task/setStatus":
      if (p.status !== "Pending" && p.status !== "Done") return state;
      return updateTask(state, p.id, { status: p.status });
    case "task/clearCompleted":
      return { ...state, tasks: state.tasks.filter((t) => t.status !== "Done") };
    case "member/add": {
      const { member } = p;
      if (addMemberError(state.members, member.name) || !member.id) return state;
      if (state.members.some((m) => m.id === member.id)) return state;
      return { ...state, members: [...state.members, { id: member.id, name: member.name.trim() }] };
    }
    case "member/rename": {
      if (memberNameError(state.members, p.name, p.id)) return state;
      return {
        ...state,
        members: state.members.map((m) => (m.id === p.id ? { ...m, name: p.name.trim() } : m)),
      };
    }
    case "member/remove":
      // Tasks keep the old id; it no longer matches a member, so they show 'Unassigned'.
      return { ...state, members: state.members.filter((m) => m.id !== p.id) };
    case "data/replace":
      return { members: p.data.members, tasks: p.data.tasks };
    default:
      return state;
  }
}
