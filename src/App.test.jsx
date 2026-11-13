import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App.jsx";
import { STORAGE_KEY } from "./tasks.js";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setup() {
  const user = userEvent.setup();
  const utils = render(<App />);
  return { user, ...utils };
}

async function addTask(user, title, assignee) {
  await user.type(screen.getByLabelText("Task title"), title);
  if (assignee) {
    await user.selectOptions(screen.getByLabelText("Assignee"), assignee);
  }
  await user.click(screen.getByRole("button", { name: "Add task" }));
}

function taskTitles() {
  const list = screen.queryByRole("list", { name: "Tasks" });
  if (!list) return [];
  return within(list)
    .getAllByRole("listitem")
    .map((li) => li.querySelector(".task-title").textContent);
}

function taskItem(title) {
  return screen.getByRole("checkbox", { name: title }).closest("li");
}

describe("Story 1: add a task", () => {
  test("adds a task with a title and assignee at the top of the list", async () => {
    const { user } = setup();
    await addTask(user, "Write report");
    await addTask(user, "Book room", "Ben");

    expect(taskTitles()).toEqual(["Book room", "Write report"]);
    expect(within(taskItem("Book room")).getByText("Ben")).toBeTruthy();
    expect(within(taskItem("Write report")).getByText("Unassigned")).toBeTruthy();
  });

  test("clears the form after adding", async () => {
    const { user } = setup();
    await addTask(user, "Write report", "Asha");
    expect(screen.getByLabelText("Task title").value).toBe("");
    expect(screen.getByLabelText("Assignee").value).toBe("");
  });

  test("pressing Enter in the title field adds the task", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Task title"), "Keyboard task{Enter}");
    expect(taskTitles()).toEqual(["Keyboard task"]);
  });

  test.each([
    ["empty", ""],
    ["whitespace-only", "   "],
  ])("an %s title is not added and shows an error", async (_label, title) => {
    const { user } = setup();
    if (title) await user.type(screen.getByLabelText("Task title"), title);
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(screen.getByRole("alert").textContent).toBe("Please enter a task title");
    expect(taskTitles()).toEqual([]);
    expect(screen.getByText("0 of 0 done")).toBeTruthy();
  });

  test("the error goes away after a valid task is added", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByRole("alert")).toBeTruthy();
    await addTask(user, "Real task");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("Story 2: edit or delete a task", () => {
  test("changes a task's title and assignee", async () => {
    const { user } = setup();
    await addTask(user, "Write report", "Asha");

    await user.click(screen.getByRole("button", { name: 'Edit "Write report"' }));
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Write final report");
    await user.selectOptions(within(title.closest("form")).getByLabelText("Assignee"), "Dana");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(taskTitles()).toEqual(["Write final report"]);
    expect(within(taskItem("Write final report")).getByText("Dana")).toBeTruthy();
  });

  test("cancel leaves the task unchanged", async () => {
    const { user } = setup();
    await addTask(user, "Write report", "Asha");
    await user.click(screen.getByRole("button", { name: 'Edit "Write report"' }));
    await user.type(screen.getByLabelText("Title"), " changed");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(taskTitles()).toEqual(["Write report"]);
    expect(within(taskItem("Write report")).getByText("Asha")).toBeTruthy();
  });

  test("a blank title cannot be saved when editing", async () => {
    const { user } = setup();
    await addTask(user, "Write report");
    await user.click(screen.getByRole("button", { name: 'Edit "Write report"' }));
    await user.clear(screen.getByLabelText("Title"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert").textContent).toBe("Please enter a task title");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(taskTitles()).toEqual(["Write report"]);
  });

  test("delete asks for confirmation and removes the task when confirmed", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user } = setup();
    await addTask(user, "Keep me");
    await addTask(user, "Remove me");

    await user.click(screen.getByRole("button", { name: 'Delete "Remove me"' }));

    expect(confirm).toHaveBeenCalledWith('Delete "Remove me"?');
    expect(taskTitles()).toEqual(["Keep me"]);
  });

  test("delete keeps the task when confirmation is cancelled", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = setup();
    await addTask(user, "Keep me");

    await user.click(screen.getByRole("button", { name: 'Delete "Keep me"' }));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(taskTitles()).toEqual(["Keep me"]);
  });
});

describe("Story 3: mark a task done", () => {
  test("marks a task done (struck through) and undoes it; header shows N of M done", async () => {
    const { user } = setup();
    await addTask(user, "Write report");
    await addTask(user, "Book room");
    expect(screen.getByText("0 of 2 done")).toBeTruthy();

    const checkbox = screen.getByRole("checkbox", { name: "Write report" });
    await user.click(checkbox);

    expect(checkbox.checked).toBe(true);
    expect(within(taskItem("Write report")).getByText("Write report").tagName).toBe("S");
    expect(within(taskItem("Book room")).getByText("Book room").tagName).not.toBe("S");
    expect(screen.getByText("1 of 2 done")).toBeTruthy();

    await user.click(checkbox);

    expect(checkbox.checked).toBe(false);
    expect(within(taskItem("Write report")).getByText("Write report").tagName).not.toBe("S");
    expect(screen.getByText("0 of 2 done")).toBeTruthy();
  });

  test("the done checkbox works from the keyboard", async () => {
    const { user } = setup();
    await addTask(user, "Write report");
    screen.getByRole("checkbox", { name: "Write report" }).focus();
    await user.keyboard(" ");
    expect(screen.getByText("1 of 1 done")).toBeTruthy();
  });
});

describe("Story 4: filter the list", () => {
  async function seed(user) {
    await addTask(user, "Asha open", "Asha");
    await addTask(user, "Asha done", "Asha");
    await addTask(user, "Ben open", "Ben");
    await addTask(user, "Nobody done");
    await user.click(screen.getByRole("checkbox", { name: "Asha done" }));
    await user.click(screen.getByRole("checkbox", { name: "Nobody done" }));
  }

  test("offers the expected filter options", () => {
    setup();
    const options = (label) =>
      Array.from(screen.getByLabelText(label).querySelectorAll("option")).map((o) => o.textContent);
    expect(options("Person")).toEqual(["All", "Asha", "Ben", "Chen", "Dana", "Unassigned"]);
    expect(options("Status")).toEqual(["All", "Open", "Done"]);
  });

  test("filters by person", async () => {
    const { user } = setup();
    await seed(user);

    await user.selectOptions(screen.getByLabelText("Person"), "Asha");
    expect(taskTitles()).toEqual(["Asha done", "Asha open"]);

    await user.selectOptions(screen.getByLabelText("Person"), "Unassigned");
    expect(taskTitles()).toEqual(["Nobody done"]);
  });

  test("filters by status", async () => {
    const { user } = setup();
    await seed(user);

    await user.selectOptions(screen.getByLabelText("Status"), "Open");
    expect(taskTitles()).toEqual(["Ben open", "Asha open"]);

    await user.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(taskTitles()).toEqual(["Nobody done", "Asha done"]);
  });

  test("person and status filters combine", async () => {
    const { user } = setup();
    await seed(user);

    await user.selectOptions(screen.getByLabelText("Person"), "Asha");
    await user.selectOptions(screen.getByLabelText("Status"), "Open");
    expect(taskTitles()).toEqual(["Asha open"]);

    await user.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(taskTitles()).toEqual(["Asha done"]);
  });

  test("shows a message when nothing matches", async () => {
    const { user } = setup();
    await seed(user);

    await user.selectOptions(screen.getByLabelText("Person"), "Ben");
    await user.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(taskTitles()).toEqual([]);
    expect(screen.getByText("No tasks match these filters")).toBeTruthy();

    await user.selectOptions(screen.getByLabelText("Person"), "Chen");
    await user.selectOptions(screen.getByLabelText("Status"), "All");
    expect(screen.getByText("No tasks match these filters")).toBeTruthy();
  });

  test("header count is for all tasks, not just the filtered ones", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Person"), "Ben");
    expect(screen.getByText("2 of 4 done")).toBeTruthy();
  });
});

describe("Story 5: keep my tasks", () => {
  test("tasks, status and assignee survive a reload", async () => {
    const { user, unmount } = setup();
    await addTask(user, "Write report", "Chen");
    await addTask(user, "Book room");
    await user.click(screen.getByRole("checkbox", { name: "Write report" }));
    unmount();

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(2);

    render(<App />);
    expect(taskTitles()).toEqual(["Book room", "Write report"]);
    expect(screen.getByRole("checkbox", { name: "Write report" }).checked).toBe(true);
    expect(screen.getByRole("checkbox", { name: "Book room" }).checked).toBe(false);
    expect(within(taskItem("Write report")).getByText("Chen")).toBeTruthy();
    expect(screen.getByText("1 of 2 done")).toBeTruthy();
  });

  test("edits and deletes are saved too", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user, unmount } = setup();
    await addTask(user, "Old title");
    await addTask(user, "Goes away");
    await user.click(screen.getByRole("button", { name: 'Edit "Old title"' }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "New title");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: 'Delete "Goes away"' }));
    unmount();

    render(<App />);
    expect(taskTitles()).toEqual(["New title"]);
  });

  test("starts empty when saved data is corrupt", () => {
    localStorage.setItem(STORAGE_KEY, "not json");
    setup();
    expect(taskTitles()).toEqual([]);
    expect(screen.getByText("0 of 0 done")).toBeTruthy();
  });
});
