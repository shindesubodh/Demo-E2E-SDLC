import { describe, expect, test } from "vitest";
import {
  EMPTY_TITLE_ERROR,
  STORAGE_KEY,
  addTask,
  countDone,
  createTask,
  deleteTask,
  filterTasks,
  loadTasks,
  saveTasks,
  toggleDone,
  updateTask,
  validateTitle,
} from "./tasks.js";

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    data,
  };
}

const t = (id, title, assignee = "", done = false) => ({ id, title, assignee, done });

describe("story 1: add a task", () => {
  test("validateTitle rejects empty and whitespace-only titles", () => {
    expect(validateTitle("")).toBe(EMPTY_TITLE_ERROR);
    expect(validateTitle("   \t\n")).toBe(EMPTY_TITLE_ERROR);
    expect(EMPTY_TITLE_ERROR).toBe("Please enter a task title");
  });

  test("validateTitle accepts a real title", () => {
    expect(validateTitle("Write report")).toBeNull();
  });

  test("createTask trims the title, defaults to unassigned and open, and has a unique id", () => {
    const a = createTask("  Write report  ");
    const b = createTask("Write report", "Ben");
    expect(a).toMatchObject({ title: "Write report", assignee: "", done: false });
    expect(b.assignee).toBe("Ben");
    expect(a.id).not.toBe(b.id);
  });

  test("addTask puts the new task at the top", () => {
    const list = addTask([t("1", "old")], t("2", "new"));
    expect(list.map((x) => x.id)).toEqual(["2", "1"]);
  });
});

describe("story 2: edit or delete a task", () => {
  test("updateTask changes title and assignee of only the matching task", () => {
    const list = [t("1", "a"), t("2", "b", "Asha")];
    const out = updateTask(list, "2", { title: "b2", assignee: "Chen" });
    expect(out).toEqual([t("1", "a"), t("2", "b2", "Chen")]);
    expect(list[1].title).toBe("b"); // not mutated
  });

  test("deleteTask removes only the matching task", () => {
    expect(deleteTask([t("1", "a"), t("2", "b")], "1")).toEqual([t("2", "b")]);
  });
});

describe("story 3: mark a task done", () => {
  test("toggleDone marks done and undoes", () => {
    const once = toggleDone([t("1", "a")], "1");
    expect(once[0].done).toBe(true);
    expect(toggleDone(once, "1")[0].done).toBe(false);
  });

  test("countDone counts done tasks", () => {
    expect(countDone([])).toBe(0);
    expect(countDone([t("1", "a", "", true), t("2", "b"), t("3", "c", "", true)])).toBe(2);
  });
});

describe("story 4: filter the list", () => {
  const list = [
    t("1", "a", "Asha", false),
    t("2", "b", "Asha", true),
    t("3", "c", "Ben", false),
    t("4", "d", "", true),
    t("5", "e", "", false),
  ];
  const ids = (xs) => xs.map((x) => x.id);

  test("All/All returns everything", () => {
    expect(ids(filterTasks(list, { person: "All", status: "All" }))).toEqual(["1", "2", "3", "4", "5"]);
    expect(ids(filterTasks(list))).toEqual(["1", "2", "3", "4", "5"]);
  });

  test("filters by person, including Unassigned", () => {
    expect(ids(filterTasks(list, { person: "Asha" }))).toEqual(["1", "2"]);
    expect(ids(filterTasks(list, { person: "Unassigned" }))).toEqual(["4", "5"]);
    expect(filterTasks(list, { person: "Dana" })).toEqual([]);
  });

  test("filters by status", () => {
    expect(ids(filterTasks(list, { status: "Open" }))).toEqual(["1", "3", "5"]);
    expect(ids(filterTasks(list, { status: "Done" }))).toEqual(["2", "4"]);
  });

  test("person and status filters combine", () => {
    expect(ids(filterTasks(list, { person: "Asha", status: "Done" }))).toEqual(["2"]);
    expect(ids(filterTasks(list, { person: "Unassigned", status: "Open" }))).toEqual(["5"]);
    expect(filterTasks(list, { person: "Ben", status: "Done" })).toEqual([]);
  });
});

describe("story 5: keep my tasks", () => {
  test("saveTasks then loadTasks round-trips title, status and assignee", () => {
    const storage = fakeStorage();
    const list = [t("1", "a", "Dana", true), t("2", "b")];
    saveTasks(storage, list);
    expect(JSON.parse(storage.data[STORAGE_KEY])).toEqual(list);
    expect(loadTasks(storage)).toEqual(list);
  });

  test("loadTasks returns an empty list when nothing is saved", () => {
    expect(loadTasks(fakeStorage())).toEqual([]);
  });

  test("loadTasks ignores corrupt data and malformed entries", () => {
    expect(loadTasks(fakeStorage({ [STORAGE_KEY]: "{not json" }))).toEqual([]);
    expect(loadTasks(fakeStorage({ [STORAGE_KEY]: '{"a":1}' }))).toEqual([]);
    const mixed = JSON.stringify([t("1", "ok"), { id: 2 }, null, "x"]);
    expect(loadTasks(fakeStorage({ [STORAGE_KEY]: mixed }))).toEqual([t("1", "ok")]);
  });

  test("saveTasks does not throw when storage is unavailable", () => {
    const broken = {
      setItem() {
        throw new Error("QuotaExceededError");
      },
    };
    expect(() => saveTasks(broken, [t("1", "a")])).not.toThrow();
  });
});
