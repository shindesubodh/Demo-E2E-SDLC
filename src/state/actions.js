import { todayISO } from "../lib/dates.js";

// Action creators that need ids or today's date. They generate those values
// here so the reducer stays pure. Tests can inject `id` and `today`.

export function addTask({ title, assigneeId, dueDate }, { id, today } = {}) {
  return {
    type: "task/add",
    payload: {
      task: {
        id: id ?? crypto.randomUUID(),
        title: title.trim(),
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        status: "Pending",
        createdDate: today ?? todayISO(),
      },
    },
  };
}

export function addMember(name, { id } = {}) {
  return {
    type: "member/add",
    payload: { member: { id: id ?? crypto.randomUUID(), name: name.trim() } },
  };
}
