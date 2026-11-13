import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import App from "./App.jsx";
import { STORAGE_KEY } from "./tasks.js";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

function setup() {
  const user = userEvent.setup();
  const utils = render(<App />);
  return { user, ...utils };
}

async function addTask(user, title, assignee) {
  await user.type(screen.getByLabelText("Task title"), title);
  if (assignee) await user.selectOptions(screen.getByLabelText("Assignee"), assignee);
  await user.click(screen.getByRole("button", { name: "Add task" }));
}

function taskTitles() {
  const list = screen.queryByRole("list", { name: "Tasks" });
  if (!list) return [];
  return within(list)
    .getAllByRole("listitem")
    .map((li) => li.querySelector(".task-title").textContent);
}

function itemFor(title) {
  return screen.getByRole("checkbox", { name: title }).closest("li");
}

describe("Story 1: add a task", () => {
  test("adds a task with an assignee and shows it at the top of the list", async () => {
    const { user } = setup();
    await addTask(user, "Write report", "Asha");
    await addTask(user, "Book room");

    expect(taskTitles()).toEqual(["Book room", "Write report"]);
    expect(within(itemFor("Write report")).getByText("Asha")).toBeTruthy();
    expect(within(itemFor("Book room")).getByText("Unassigned")).toBeTruthy();
    // Form resets for the next task.
    expect(screen.getByLabelText("Task title").value).toBe("");
    expect(screen.getByLabelText("Assignee").value).toBe("");
  });

  test("pressing Enter in the title field adds the task", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Task title"), "Keyboard task{Enter}");
    expect(taskTitles()).toEqual(["Keyboard task"]);
  });

  test("an empty title is not added and shows an error", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByRole("alert").textContent).toBe("Please enter a task title");
    expect(taskTitles()).toEqual([]);
    expect(screen.getByText("0 of 0 done")).toBeTruthy();
  });

  test("a whitespace-only title is not added and shows an error", async () => {
    const { user } = setup();
    await addTask(user, "    ");
    expect(screen.getByRole("alert").textContent).toBe("Please enter a task title");
    expect(screen.getByLabelText("Task title").getAttribute("aria-invalid")).toBe("true");
    expect(taskTitles()).toEqual([]);
  });

  test("the error clears after a valid task is added", async () => {
    const { user } = setup();
    await addTask(user, " ");
    expect(screen.getByRole("alert")).toBeTruthy();
    await addTask(user, "Real task");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(taskTitles()).toEqual(["Real task"]);
  });
});

describe("Story 2: edit or delete a task", () => {
  test("edits a task's title and assignee", async () => {
    const { user } = setup();
    await addTask(user, "Write report", "Asha");

    await user.click(screen.getByRole("button", { name: "Edit Write report" }));
    const title = screen.getByLabelText("Edit title");
    await user.clear(title);
    await user.type(title, "Write final report");
    await user.selectOptions(screen.getByLabelText("Edit assignee"), "Dana");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(taskTitles()).toEqual(["Write final report"]);
    expect(within(itemFor("Write final report")).getByText("Dana")).toBeTruthy();
  });

  test("cancelling an edit keeps the original task", async () => {
    const { user } = setup();
    await addTask(user, "Write report", "Asha");
    await user.click(screen.getByRole("button", { name: "Edit Write report" }));
    await user.type(screen.getByLabelText("Edit title"), " changed");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(taskTitles()).toEqual(["Write report"]);
    expect(within(itemFor("Write report")).getByText("Asha")).toBeTruthy();
  });

  test("an edit with a blank title is rejected", async () => {
    const { user } = setup();
    await addTask(user, "Write report");
    await user.click(screen.getByRole("button", { name: "Edit Write report" }));
    await user.clear(screen.getByLabelText("Edit title"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert").textContent).toBe("Please enter a task title");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(taskTitles()).toEqual(["Write report"]);
  });

  test("delete asks for confirmation before removing the task", async () => {
    const { user } = setup();
    await addTask(user, "Keep me");
    await addTask(user, "Remove me");

    await user.click(screen.getByRole("button", { name: "Delete Remove me" }));
    // Not removed yet: a confirmation is shown.
    expect(taskTitles()).toEqual(["Remove me", "Keep me"]);
    const confirm = screen.getByRole("group", { name: "Confirm delete of Remove me" });
    expect(within(confirm).getByText("Delete this task?")).toBeTruthy();

    await user.click(within(confirm).getByRole("button", { name: "Yes, delete" }));
    expect(taskTitles()).toEqual(["Keep me"]);
  });

  test("cancelling the delete confirmation keeps the task", async () => {
    const { user } = setup();
    await addTask(user, "Keep me");
    await user.click(screen.getByRole("button", { name: "Delete Keep me" }));
    const confirm = screen.getByRole("group", { name: "Confirm delete of Keep me" });
    // Focus moves to Cancel so Enter/Space is the safe choice.
    expect(document.activeElement).toBe(within(confirm).getByRole("button", { name: "Cancel" }));
    await user.keyboard("{Enter}");
    expect(taskTitles()).toEqual(["Keep me"]);
    expect(screen.queryByRole("group", { name: /Confirm delete/ })).toBeNull();
  });
});

describe("Story 3: mark a task done", () => {
  test("marking done strikes the task through and updates the header; undo reverses it", async () => {
    const { user } = setup();
    await addTask(user, "Task A");
    await addTask(user, "Task B");
    await addTask(user, "Task C");
    expect(screen.getByText("0 of 3 done")).toBeTruthy();

    const checkbox = screen.getByRole("checkbox", { name: "Task B" });
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(itemFor("Task B").classList.contains("done")).toBe(true);
    expect(itemFor("Task A").classList.contains("done")).toBe(false);
    expect(screen.getByText("1 of 3 done")).toBeTruthy();

    await user.click(screen.getByRole("checkbox", { name: "Task A" }));
    expect(screen.getByText("2 of 3 done")).toBeTruthy();

    // Undo
    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(itemFor("Task B").classList.contains("done")).toBe(false);
    expect(screen.getByText("1 of 3 done")).toBeTruthy();
  });

  test("done state can be toggled from the keyboard", async () => {
    const { user } = setup();
    await addTask(user, "Task A");
    screen.getByRole("checkbox", { name: "Task A" }).focus();
    await user.keyboard(" ");
    expect(screen.getByText("1 of 1 done")).toBeTruthy();
  });

  test("the header count updates when a done task is deleted", async () => {
    const { user } = setup();
    await addTask(user, "Task A");
    await addTask(user, "Task B");
    await user.click(screen.getByRole("checkbox", { name: "Task A" }));
    expect(screen.getByText("1 of 2 done")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Delete Task A" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(screen.getByText("0 of 1 done")).toBeTruthy();
  });
});

describe("Story 4: filter the list", () => {
  async function seed(user) {
    await addTask(user, "Asha open", "Asha");
    await addTask(user, "Asha done", "Asha");
    await addTask(user, "Ben open", "Ben");
    await addTask(user, "Nobody open");
    await addTask(user, "Nobody done");
    await user.click(screen.getByRole("checkbox", { name: "Asha done" }));
    await user.click(screen.getByRole("checkbox", { name: "Nobody done" }));
  }

  test("offers the expected person and status options", () => {
    setup();
    const personOptions = within(screen.getByLabelText("Person"))
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(personOptions).toEqual(["All", "Asha", "Ben", "Chen", "Dana", "Unassigned"]);
    const statusOptions = within(screen.getByLabelText("Status"))
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(statusOptions).toEqual(["All", "Open", "Done"]);
  });

  test("filters by person, including Unassigned", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Person"), "Asha");
    expect(taskTitles()).toEqual(["Asha done", "Asha open"]);
    await user.selectOptions(screen.getByLabelText("Person"), "Unassigned");
    expect(taskTitles()).toEqual(["Nobody done", "Nobody open"]);
    await user.selectOptions(screen.getByLabelText("Person"), "All");
    expect(taskTitles()).toHaveLength(5);
  });

  test("filters by status", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Status"), "Open");
    expect(taskTitles()).toEqual(["Nobody open", "Ben open", "Asha open"]);
    await user.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(taskTitles()).toEqual(["Nobody done", "Asha done"]);
  });

  test("person and status filters combine", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Person"), "Asha");
    await user.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(taskTitles()).toEqual(["Asha done"]);
    await user.selectOptions(screen.getByLabelText("Person"), "Unassigned");
    await user.selectOptions(screen.getByLabelText("Status"), "Open");
    expect(taskTitles()).toEqual(["Nobody open"]);
  });

  test("shows a message when nothing matches", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Person"), "Ben");
    await user.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(screen.getByText("No tasks match these filters")).toBeTruthy();
    expect(taskTitles()).toEqual([]);

    await user.selectOptions(screen.getByLabelText("Person"), "Chen");
    await user.selectOptions(screen.getByLabelText("Status"), "All");
    expect(screen.getByText("No tasks match these filters")).toBeTruthy();

    await user.selectOptions(screen.getByLabelText("Person"), "All");
    expect(screen.queryByText("No tasks match these filters")).toBeNull();
  });

  test("the header count is for all tasks, not just the filtered ones", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Person"), "Ben");
    expect(screen.getByText("2 of 5 done")).toBeTruthy();
  });
});

describe("Story 5: keep my tasks", () => {
  test("tasks, status and assignee survive a reload", async () => {
    const { user, unmount } = setup();
    await addTask(user, "Older task", "Chen");
    await addTask(user, "Newer task");
    await user.click(screen.getByRole("checkbox", { name: "Older task" }));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toHaveLength(2);

    // Simulate a page reload: unmount and render a fresh App.
    unmount();
    render(<App />);

    expect(taskTitles()).toEqual(["Newer task", "Older task"]);
    expect(screen.getByRole("checkbox", { name: "Older task" }).checked).toBe(true);
    expect(screen.getByRole("checkbox", { name: "Newer task" }).checked).toBe(false);
    expect(within(itemFor("Older task")).getByText("Chen")).toBeTruthy();
    expect(within(itemFor("Newer task")).getByText("Unassigned")).toBeTruthy();
    expect(screen.getByText("1 of 2 done")).toBeTruthy();
  });

  test("edits and deletes are saved too", async () => {
    const { user, unmount } = setup();
    await addTask(user, "Edit me", "Asha");
    await addTask(user, "Delete me");
    await user.click(screen.getByRole("button", { name: "Edit Edit me" }));
    await user.selectOptions(screen.getByLabelText("Edit assignee"), "Ben");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "Delete Delete me" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    unmount();
    render(<App />);

    expect(taskTitles()).toEqual(["Edit me"]);
    expect(within(itemFor("Edit me")).getByText("Ben")).toBeTruthy();
  });

  test("starts empty and still works when stored data is corrupt", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{oops");
    const { user } = setup();
    expect(screen.getByText("No tasks yet. Add one above.")).toBeTruthy();
    await addTask(user, "Fresh start");
    expect(taskTitles()).toEqual(["Fresh start"]);
  });
});
