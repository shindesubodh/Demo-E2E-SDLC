import { describe, expect, test } from "vitest";
import {
  EMPTY_TITLE_ERROR,
  STORAGE_KEY,
  addTask,
  countDone,
  deleteTask,
  filterTasks,
  loadTasks,
  saveTasks,
  toggleDone,
  updateTask,
} from "./tasks.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    data,
  };
}

const sample = [
  { id: "1", title: "Write report", assignee: "Asha", done: false },
  { id: "2", title: "Book room", assignee: "Ben", done: true },
  { id: "3", title: "Order cake", assignee: "", done: true },
  { id: "4", title: "Call client", assignee: "Asha", done: true },
  { id: "5", title: "Tidy desk", assignee: "", done: false },
];

describe("addTask (story 1)", () => {
  test("adds a trimmed task at the top, open, with assignee", () => {
    const { tasks, error } = addTask(sample, { title: "  Plan sprint  ", assignee: "Chen" });
    expect(error).toBeNull();
    expect(tasks).toHaveLength(sample.length + 1);
    expect(tasks[0]).toMatchObject({ title: "Plan sprint", assignee: "Chen", done: false });
    expect(typeof tasks[0].id).toBe("string");
  });

  test("assignee is optional", () => {
    const { tasks } = addTask([], { title: "Solo" });
    expect(tasks[0].assignee).toBe("");
  });

  test("gives each task a unique id", () => {
    const a = addTask([], { title: "A" }).tasks;
    const b = addTask(a, { title: "B" }).tasks;
    expect(b[0].id).not.toBe(b[1].id);
  });

  test.each(["", "   ", "\t\n"])("rejects empty/whitespace title %j", (title) => {
    const { tasks, error } = addTask(sample, { title });
    expect(error).toBe(EMPTY_TITLE_ERROR);
    expect(error).toBe("Please enter a task title");
    expect(tasks).toBe(sample);
  });
});

describe("updateTask and deleteTask (story 2)", () => {
  test("changes title and assignee of one task only", () => {
    const { tasks, error } = updateTask(sample, "1", { title: " Final report ", assignee: "Dana" });
    expect(error).toBeNull();
    expect(tasks[0]).toEqual({ id: "1", title: "Final report", assignee: "Dana", done: false });
    expect(tasks.slice(1)).toEqual(sample.slice(1));
  });

  test("can unassign a task", () => {
    const { tasks } = updateTask(sample, "1", { title: "Write report", assignee: "" });
    expect(tasks[0].assignee).toBe("");
  });

  test("keeps done status when edited", () => {
    const { tasks } = updateTask(sample, "2", { title: "Book big room", assignee: "Ben" });
    expect(tasks[1].done).toBe(true);
  });

  test("rejects a blank title on edit", () => {
    const { tasks, error } = updateTask(sample, "1", { title: "  ", assignee: "Ben" });
    expect(error).toBe(EMPTY_TITLE_ERROR);
    expect(tasks).toBe(sample);
  });

  test("deletes only the given task", () => {
    const tasks = deleteTask(sample, "3");
    expect(tasks.map((t) => t.id)).toEqual(["1", "2", "4", "5"]);
  });
});

describe("toggleDone and countDone (story 3)", () => {
  test("marks done and undoes", () => {
    const once = toggleDone(sample, "1");
    expect(once[0].done).toBe(true);
    const twice = toggleDone(once, "1");
    expect(twice[0].done).toBe(false);
  });

  test("counts done tasks", () => {
    expect(countDone(sample)).toBe(3);
    expect(countDone([])).toBe(0);
  });
});

describe("filterTasks (story 4)", () => {
  const ids = (list) => list.map((t) => t.id);

  test("All/All returns everything", () => {
    expect(ids(filterTasks(sample, { person: "All", status: "All" }))).toEqual(["1", "2", "3", "4", "5"]);
  });

  test("filters by person", () => {
    expect(ids(filterTasks(sample, { person: "Asha", status: "All" }))).toEqual(["1", "4"]);
    expect(ids(filterTasks(sample, { person: "Ben", status: "All" }))).toEqual(["2"]);
    expect(ids(filterTasks(sample, { person: "Unassigned", status: "All" }))).toEqual(["3", "5"]);
  });

  test("filters by status", () => {
    expect(ids(filterTasks(sample, { person: "All", status: "Open" }))).toEqual(["1", "5"]);
    expect(ids(filterTasks(sample, { person: "All", status: "Done" }))).toEqual(["2", "3", "4"]);
  });

  test("person and status combine", () => {
    expect(ids(filterTasks(sample, { person: "Asha", status: "Done" }))).toEqual(["4"]);
    expect(ids(filterTasks(sample, { person: "Unassigned", status: "Open" }))).toEqual(["5"]);
    expect(filterTasks(sample, { person: "Ben", status: "Open" })).toEqual([]);
    expect(filterTasks(sample, { person: "Chen", status: "All" })).toEqual([]);
  });
});

describe("loadTasks and saveTasks (story 5)", () => {
  test("round-trips tasks with status and assignee", () => {
    const storage = memoryStorage();
    saveTasks(storage, sample);
    expect(loadTasks(storage)).toEqual(sample);
  });

  test("returns [] when nothing is stored", () => {
    expect(loadTasks(memoryStorage())).toEqual([]);
  });

  test("returns [] for corrupt or non-array data", () => {
    expect(loadTasks(memoryStorage({ [STORAGE_KEY]: "{not json" }))).toEqual([]);
    expect(loadTasks(memoryStorage({ [STORAGE_KEY]: '{"a":1}' }))).toEqual([]);
  });

  test("drops malformed entries", () => {
    const stored = JSON.stringify([sample[0], { id: 2 }, null, "x"]);
    expect(loadTasks(memoryStorage({ [STORAGE_KEY]: stored }))).toEqual([sample[0]]);
  });

  test("save does not throw when storage fails", () => {
    const broken = {
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
    };
    expect(() => saveTasks(broken, sample)).not.toThrow();
  });
});
