import { compareDue } from "../lib/dates.js";

function isAssigned(task, memberIds) {
  return task.assigneeId !== null && memberIds.has(task.assigneeId);
}

// filters: { status: 'Pending' | 'Done' | 'All', assignee: 'All' | 'Unassigned' | memberId }
export function selectVisibleTasks(state, filters) {
  const memberIds = new Set(state.members.map((m) => m.id));
  return state.tasks
    .filter((t) => filters.status === "All" || t.status === filters.status)
    .filter((t) => {
      if (filters.assignee === "All") return true;
      if (filters.assignee === "Unassigned") return !isAssigned(t, memberIds);
      return t.assigneeId === filters.assignee;
    })
    .sort((a, b) => compareDue(a.dueDate, b.dueDate));
}

export function memberName(state, id) {
  return state.members.find((m) => m.id === id)?.name ?? "Unassigned";
}

export function countDone(state) {
  return state.tasks.filter((t) => t.status === "Done").length;
}
