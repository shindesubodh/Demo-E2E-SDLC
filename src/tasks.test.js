import { describe, expect, test } from "vitest";
import {
  STORAGE_KEY,
  addTask,
  cleanTitle,
  deleteTask,
  filterTasks,
  loadTasks,
  progressText,
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
  };
}

const sample = [
  { id: "1", title: "Write report", assignee: "Asha", done: false },
  { id: "2", title: "Book room", assignee: "Ben", done: true },
  { id: "3", title: "Order snacks", assignee: "", done: false },
  { id: "4", title: "Review PR", assignee: "Asha", done: true },
];

describe("Story 1: add a task", () => {
  test("adds a new open task at the top of the list", () => {
    const list = addTask(addTask([], "First", "", "a"), "Second", "Chen", "b");
    expect(list.map((t) => t.title)).toEqual(["Second", "First"]);
    expect(list[0]).toEqual({ id: "b", title: "Second", assignee: "Chen", done: false });
  });

  test("assignee is optional", () => {
    expect(addTask([], "Solo", undefined, "x")[0].assignee).toBe("");
  });

  test("trims the title", () => {
    expect(addTask([], "  Tidy up  ", "", "x")[0].title).toBe("Tidy up");
  });

  test.each(["", "   ", "\t\n", undefined])("does not add a blank title (%j)", (title) => {
    const before = [sample[0]];
    expect(addTask(before, title)).toBe(before);
    expect(cleanTitle(title)).toBeNull();
  });

  test("generates unique ids", () => {
    const list = addTask(addTask([], "A"), "B");
    expect(list[0].id).not.toBe(list[1].id);
  });
});

describe("Story 2: edit or delete a task", () => {
  test("changes title and assignee", () => {
    const list = updateTask(sample, "1", { title: " Final report ", assignee: "Dana" });
    expect(list[0]).toEqual({ id: "1", title: "Final report", assignee: "Dana", done: false });
    expect(list.slice(1)).toEqual(sample.slice(1));
  });

  test("can unassign a task", () => {
    expect(updateTask(sample, "1", { assignee: "" })[0].assignee).toBe("");
  });

  test("ignores a blank title on edit", () => {
    expect(updateTask(sample, "1", { title: "  ", assignee: "Ben" })[0]).toEqual(sample[0]);
  });

  test("deletes only the given task", () => {
    expect(deleteTask(sample, "2").map((t) => t.id)).toEqual(["1", "3", "4"]);
  });
});

describe("Story 3: mark a task done", () => {
  test("toggles done and back", () => {
    const once = toggleDone(sample, "1");
    expect(once[0].done).toBe(true);
    expect(toggleDone(once, "1")[0].done).toBe(false);
  });

  test("progress text is 'N of M done'", () => {
    expect(progressText([])).toBe("0 of 0 done");
    expect(progressText(sample)).toBe("2 of 4 done");
  });
});

describe("Story 4: filter the list", () => {
  const ids = (list) => list.map((t) => t.id);

  test("All/All returns everything", () => {
    expect(ids(filterTasks(sample, "All", "All"))).toEqual(["1", "2", "3", "4"]);
  });

  test("filters by person", () => {
    expect(ids(filterTasks(sample, "Asha", "All"))).toEqual(["1", "4"]);
    expect(ids(filterTasks(sample, "Unassigned", "All"))).toEqual(["3"]);
    expect(ids(filterTasks(sample, "Dana", "All"))).toEqual([]);
  });

  test("filters by status", () => {
    expect(ids(filterTasks(sample, "All", "Open"))).toEqual(["1", "3"]);
    expect(ids(filterTasks(sample, "All", "Done"))).toEqual(["2", "4"]);
  });

  test("person and status filters combine", () => {
    expect(ids(filterTasks(sample, "Asha", "Done"))).toEqual(["4"]);
    expect(ids(filterTasks(sample, "Asha", "Open"))).toEqual(["1"]);
    expect(ids(filterTasks(sample, "Ben", "Open"))).toEqual([]);
  });
});

describe("Story 5: keep my tasks", () => {
  test("saves and loads tasks with status and assignee", () => {
    const storage = memoryStorage();
    saveTasks(sample, storage);
    expect(loadTasks(storage)).toEqual(sample);
  });

  test("returns an empty list when nothing is saved", () => {
    expect(loadTasks(memoryStorage())).toEqual([]);
  });

  test("returns an empty list for corrupt data", () => {
    expect(loadTasks(memoryStorage({ [STORAGE_KEY]: "{not json" }))).toEqual([]);
    expect(loadTasks(memoryStorage({ [STORAGE_KEY]: '{"a":1}' }))).toEqual([]);
  });

  test("drops malformed entries", () => {
    const raw = JSON.stringify([sample[0], { title: 5 }, null]);
    expect(loadTasks(memoryStorage({ [STORAGE_KEY]: raw }))).toEqual([sample[0]]);
  });

  test("does not throw when storage is unavailable", () => {
    const broken = {
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
    };
    expect(() => saveTasks(sample, broken)).not.toThrow();
  });
});
