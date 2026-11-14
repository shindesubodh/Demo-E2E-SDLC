import { describe, expect, test, vi } from "vitest";
import { addMember, addTask } from "./actions.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("addTask (S1)", () => {
  test("builds a Pending task with a UUID id and today's created date", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 18, 10));
    const action = addTask({ title: "  Book team room  ", assigneeId: "", dueDate: "" });
    expect(action.type).toBe("task/add");
    expect(action.payload.task).toEqual({
      id: expect.stringMatching(UUID),
      title: "Book team room",
      assigneeId: null,
      dueDate: null,
      status: "Pending",
      createdDate: "2026-11-18",
    });
  });

  test("uses an injected id and date", () => {
    const action = addTask({ title: "A", assigneeId: "m1", dueDate: "2026-11-21" }, { id: "t1", today: "2026-01-02" });
    expect(action.payload.task).toEqual({
      id: "t1",
      title: "A",
      assigneeId: "m1",
      dueDate: "2026-11-21",
      status: "Pending",
      createdDate: "2026-01-02",
    });
  });

  test("ids are unique", () => {
    const a = addTask({ title: "A" }).payload.task.id;
    const b = addTask({ title: "A" }).payload.task.id;
    expect(a).not.toBe(b);
  });
});

describe("addMember (S3)", () => {
  test("builds a member with a UUID id and a trimmed name", () => {
    const action = addMember("  Priya ");
    expect(action).toEqual({ type: "member/add", payload: { member: { id: expect.stringMatching(UUID), name: "Priya" } } });
  });

  test("uses an injected id", () => {
    expect(addMember("Tom", { id: "m2" }).payload.member).toEqual({ id: "m2", name: "Tom" });
  });
});
