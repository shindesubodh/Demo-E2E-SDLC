import { describe, expect, test } from "vitest";
import { member, task } from "../test/utils.jsx";
import { countDone, memberName, selectVisibleTasks } from "./selectors.js";

const state = {
  members: [member("m1", "Priya"), member("m2", "Tom")],
  tasks: [
    task("a", "No date, Priya", { assigneeId: "m1" }),
    task("b", "Late Nov, Tom", { assigneeId: "m2", dueDate: "2026-11-30" }),
    task("c", "Done, Priya", { assigneeId: "m1", dueDate: "2026-11-17", status: "Done" }),
    task("d", "Early Nov, unassigned", { dueDate: "2026-11-02" }),
    task("e", "Removed member", { assigneeId: "gone", dueDate: "2026-11-20" }),
    task("f", "Done, unassigned", { status: "Done" }),
  ],
};

const ids = (tasks) => tasks.map((t) => t.id);

describe("selectVisibleTasks (S6, S7)", () => {
  test("default view: only Pending tasks, earliest due first, no due date last", () => {
    expect(ids(selectVisibleTasks(state, { status: "Pending", assignee: "All" }))).toEqual(["d", "e", "b", "a"]);
  });

  test("status Done and All", () => {
    expect(ids(selectVisibleTasks(state, { status: "Done", assignee: "All" }))).toEqual(["c", "f"]);
    expect(ids(selectVisibleTasks(state, { status: "All", assignee: "All" }))).toEqual(["d", "c", "e", "b", "a", "f"]);
  });

  test("assignee filter by member", () => {
    expect(ids(selectVisibleTasks(state, { status: "All", assignee: "m1" }))).toEqual(["c", "a"]);
  });

  test("'Unassigned' includes null and removed-member ids", () => {
    expect(ids(selectVisibleTasks(state, { status: "All", assignee: "Unassigned" }))).toEqual(["d", "e", "f"]);
  });

  test("both filters together", () => {
    expect(ids(selectVisibleTasks(state, { status: "Pending", assignee: "m1" }))).toEqual(["a"]);
    expect(ids(selectVisibleTasks(state, { status: "Done", assignee: "Unassigned" }))).toEqual(["f"]);
  });

  test("does not mutate the stored task order", () => {
    selectVisibleTasks(state, { status: "All", assignee: "All" });
    expect(ids(state.tasks)).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  test("filters 500 tasks in under 100 ms", () => {
    const members = Array.from({ length: 10 }, (_, i) => member(`m${i}`, `Name ${i}`));
    const tasks = Array.from({ length: 500 }, (_, i) =>
      task(`t${i}`, `Task ${i}`, {
        assigneeId: i % 11 === 0 ? null : `m${i % 10}`,
        status: i % 3 === 0 ? "Done" : "Pending",
        dueDate: i % 7 === 0 ? null : `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      }),
    );
    const big = { members, tasks };
    const start = performance.now();
    const result = selectVisibleTasks(big, { status: "Pending", assignee: "m3" });
    selectVisibleTasks(big, { status: "All", assignee: "Unassigned" });
    selectVisibleTasks(big, { status: "Done", assignee: "All" });
    const elapsed = performance.now() - start;
    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(100);
  });
});

describe("memberName and countDone (S3, S8)", () => {
  test("memberName returns the name, or 'Unassigned' for null and unknown ids", () => {
    expect(memberName(state, "m2")).toBe("Tom");
    expect(memberName(state, null)).toBe("Unassigned");
    expect(memberName(state, "gone")).toBe("Unassigned");
  });

  test("countDone counts Done tasks", () => {
    expect(countDone(state)).toBe(2);
    expect(countDone({ members: [], tasks: [] })).toBe(0);
  });
});
