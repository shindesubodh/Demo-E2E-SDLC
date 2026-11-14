import { describe, expect, test } from "vitest";
import { member, task } from "../test/utils.jsx";
import { addMember, addTask } from "./actions.js";
import { MAX_MEMBERS_ERROR, addMemberError, memberNameError, reducer, titleError } from "./reducer.js";

const empty = { members: [], tasks: [] };
const base = {
  members: [member("m1", "Priya"), member("m2", "Tom")],
  tasks: [
    task("t1", "Book team room", { assigneeId: "m1", dueDate: "2026-11-21" }),
    task("t2", "Order toner", { status: "Done" }),
    task("t3", "Plan social", { status: "Done", assigneeId: "m2" }),
  ],
};

describe("task/add (S1)", () => {
  test("stores the payload task unchanged; same input gives the same output", () => {
    const action = addTask({ title: "Write notes", assigneeId: "m1", dueDate: "2026-11-20" }, { id: "n1", today: "2026-11-18" });
    const next = reducer(base, action);
    expect(next.tasks.at(-1)).toEqual(action.payload.task);
    expect(next.tasks.at(-1).status).toBe("Pending");
    expect(next.tasks.at(-1).createdDate).toBe("2026-11-18");
    expect(reducer(base, action)).toEqual(next);
    expect(base.tasks).toHaveLength(3);
  });

  test.each([[""], ["   "], ["x".repeat(121)]])("rejects the title %j", (title) => {
    const action = { type: "task/add", payload: { task: { ...task("n1", "x"), title } } };
    expect(reducer(base, action)).toBe(base);
  });

  test("accepts a title of exactly 120 characters", () => {
    const next = reducer(base, addTask({ title: "x".repeat(120) }, { id: "n1" }));
    expect(next.tasks).toHaveLength(4);
  });

  test("rejects a duplicate id", () => {
    expect(reducer(base, addTask({ title: "Again" }, { id: "t1" }))).toBe(base);
  });

  test("titleError gives the message for empty titles only", () => {
    expect(titleError("  ")).toBe("Enter a title (1–120 characters).");
    expect(titleError("ok")).toBeNull();
  });
});

describe("task/update and task/delete (S2, S4)", () => {
  test("update changes title, assignee and due date, keeping createdDate and status", () => {
    const next = reducer(base, {
      type: "task/update",
      payload: { id: "t1", title: " New title ", assigneeId: "m2", dueDate: "2026-12-01" },
    });
    expect(next.tasks[0]).toEqual({ ...base.tasks[0], title: "New title", assigneeId: "m2", dueDate: "2026-12-01" });
    expect(next.tasks[0].createdDate).toBe("2026-11-10");
  });

  test("update can clear the assignee and due date", () => {
    const next = reducer(base, { type: "task/update", payload: { id: "t1", title: "A", assigneeId: "", dueDate: "" } });
    expect(next.tasks[0]).toMatchObject({ assigneeId: null, dueDate: null });
  });

  test("update with an empty title is ignored", () => {
    expect(reducer(base, { type: "task/update", payload: { id: "t1", title: " ", assigneeId: null, dueDate: null } })).toBe(base);
  });

  test("delete removes only that task", () => {
    const next = reducer(base, { type: "task/delete", payload: { id: "t1" } });
    expect(next.tasks.map((t) => t.id)).toEqual(["t2", "t3"]);
  });
});

describe("task/setStatus (S5) and task/clearCompleted (S8)", () => {
  test("setStatus marks Done and back to Pending", () => {
    const done = reducer(base, { type: "task/setStatus", payload: { id: "t1", status: "Done" } });
    expect(done.tasks[0].status).toBe("Done");
    const pending = reducer(done, { type: "task/setStatus", payload: { id: "t1", status: "Pending" } });
    expect(pending.tasks[0].status).toBe("Pending");
  });

  test("setStatus ignores unknown statuses", () => {
    expect(reducer(base, { type: "task/setStatus", payload: { id: "t1", status: "Later" } })).toBe(base);
  });

  test("clearCompleted removes every Done task and keeps Pending ones unchanged", () => {
    const next = reducer(base, { type: "task/clearCompleted" });
    expect(next.tasks).toEqual([base.tasks[0]]);
  });
});

describe("members (S3)", () => {
  test("adds a member", () => {
    const next = reducer(empty, addMember("Aisha", { id: "m9" }));
    expect(next.members).toEqual([{ id: "m9", name: "Aisha" }]);
  });

  test("blocks the 11th member", () => {
    const ten = { ...empty, members: Array.from({ length: 10 }, (_, i) => member(`m${i}`, `Name ${i}`)) };
    expect(addMemberError(ten.members, "Hannah")).toBe(MAX_MEMBERS_ERROR);
    expect(reducer(ten, addMember("Hannah", { id: "x" }))).toBe(ten);
  });

  test("blocks empty and duplicate names (case-insensitive) and duplicate ids", () => {
    expect(reducer(base, addMember("  ", { id: "x" }))).toBe(base);
    expect(reducer(base, addMember("priya", { id: "x" }))).toBe(base);
    expect(reducer(base, addMember("Mei", { id: "m1" }))).toBe(base);
    expect(memberNameError(base.members, "PRIYA")).toBe("PRIYA is already a team member.");
  });

  test("renames a member; a member may keep their own name with new casing", () => {
    const next = reducer(base, { type: "member/rename", payload: { id: "m1", name: "Priya S" } });
    expect(next.members[0]).toEqual({ id: "m1", name: "Priya S" });
    const recased = reducer(base, { type: "member/rename", payload: { id: "m1", name: "PRIYA" } });
    expect(recased.members[0].name).toBe("PRIYA");
    expect(reducer(base, { type: "member/rename", payload: { id: "m1", name: "Tom" } })).toBe(base);
  });

  test("remove keeps the tasks with the orphaned assignee id", () => {
    const next = reducer(base, { type: "member/remove", payload: { id: "m1" } });
    expect(next.members.map((m) => m.id)).toEqual(["m2"]);
    expect(next.tasks[0].assigneeId).toBe("m1");
  });
});

describe("data/replace (S10)", () => {
  test("replaces all tasks and members", () => {
    const data = { members: [member("x1", "Lukas")], tasks: [task("y1", "Imported")] };
    expect(reducer(base, { type: "data/replace", payload: { data } })).toEqual(data);
  });
});

test("unknown actions return the same state", () => {
  expect(reducer(base, { type: "nope" })).toBe(base);
});
