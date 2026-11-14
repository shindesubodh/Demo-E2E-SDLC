import { describe, expect, test, vi } from "vitest";
import { member, task } from "../test/utils.jsx";
import { STORAGE_KEY, loadState, saveState, validateData } from "./storage.js";

const state = {
  members: [member("m1", "Priya")],
  tasks: [task("t1", "Book team room", { assigneeId: "m1", dueDate: "2026-11-21" })],
};

describe("saveState and loadState (S9)", () => {
  test("round-trips tasks and members under teamTodo.v1 with version 1", () => {
    expect(saveState(state)).toEqual({ ok: true });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({ version: 1, ...state });
    expect(loadState()).toEqual(state);
  });

  test("missing data loads as an empty state", () => {
    expect(loadState()).toEqual({ members: [], tasks: [] });
  });

  test("corrupt JSON loads as an empty state without throwing", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadState()).toEqual({ members: [], tasks: [] });
  });

  test("a wrong version loads as an empty state", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, ...state }));
    expect(loadState()).toEqual({ members: [], tasks: [] });
  });

  test("a throwing getItem loads as an empty state", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(loadState()).toEqual({ members: [], tasks: [] });
  });

  test("a throwing setItem is caught and reported", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(saveState(state)).toEqual({ ok: false, error: "QuotaExceededError" });
  });

  test("exportedAt is dropped on load and never saved", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, exportedAt: "2026-11-20T09:15:00.000Z", ...state }));
    const loaded = loadState();
    expect(loaded).toEqual(state);
    saveState(loaded);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).not.toHaveProperty("exportedAt");
  });
});

describe("validateData (S9, S10)", () => {
  const valid = { version: 1, ...state };

  test("accepts valid data, including hand-edited non-UUID ids", () => {
    expect(validateData(valid)).toEqual({ ok: true, data: state });
  });

  test.each([
    ["not an object", "hello"],
    ["null", null],
    ["an array", []],
    ["version 2", { ...valid, version: 2 }],
    ["a missing version", { members: [], tasks: [] }],
    ["members not a list", { ...valid, members: {} }],
    ["11 members", { ...valid, members: Array.from({ length: 11 }, (_, i) => member(`m${i}`, `Name ${i}`)) }],
    ["an empty member name", { ...valid, members: [member("m1", " ")] }],
    ["a member name over 40 characters", { ...valid, members: [member("m1", "x".repeat(41))] }],
    ["duplicate member ids", { ...valid, members: [member("m1", "A"), member("m1", "B")] }],
    ["duplicate member names", { ...valid, members: [member("m1", "Priya"), member("m2", "priya")] }],
    ["duplicate task ids", { ...valid, tasks: [task("t1", "A"), task("t1", "B")] }],
    ["an empty task id", { ...valid, tasks: [task("", "A")] }],
    ["an empty title", { ...valid, tasks: [task("t1", "  ")] }],
    ["a title over 120 characters", { ...valid, tasks: [task("t1", "x".repeat(121))] }],
    ["a bad status", { ...valid, tasks: [task("t1", "A", { status: "Later" })] }],
    ["a bad due date", { ...valid, tasks: [task("t1", "A", { dueDate: "2026-13-01" })] }],
    ["a missing created date", { ...valid, tasks: [task("t1", "A", { createdDate: undefined })] }],
    ["a numeric assignee id", { ...valid, tasks: [task("t1", "A", { assigneeId: 7 })] }],
  ])("rejects %s", (_, data) => {
    const result = validateData(data);
    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe("string");
  });
});
