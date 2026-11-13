import { readFileSync } from "node:fs";
import { URL as NodeURL, fileURLToPath } from "node:url";
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
  await user.clear(screen.getByLabelText("Task title"));
  if (title) await user.type(screen.getByLabelText("Task title"), title);
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

function taskItem(title) {
  return screen.getByRole("checkbox", { name: title }).closest("li");
}

describe("story 1: add a task", () => {
  test("adds a task with a title and an assignee", async () => {
    const { user } = setup();
    await addTask(user, "Book meeting room", "Chen");
    expect(taskTitles()).toEqual(["Book meeting room"]);
    expect(within(taskItem("Book meeting room")).getByText("Chen")).toBeTruthy();
    // form is reset
    expect(screen.getByLabelText("Task title").value).toBe("");
    expect(screen.getByLabelText("Assignee").value).toBe("");
  });

  test("assignee is optional", async () => {
    const { user } = setup();
    await addTask(user, "Order snacks");
    expect(within(taskItem("Order snacks")).getByText("Unassigned")).toBeTruthy();
  });

  test("can add by pressing Enter in the title field", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Task title"), "Keyboard task{Enter}");
    expect(taskTitles()).toEqual(["Keyboard task"]);
  });

  test("the new task appears at the top of the list", async () => {
    const { user } = setup();
    await addTask(user, "First");
    await addTask(user, "Second");
    await addTask(user, "Third");
    expect(taskTitles()).toEqual(["Third", "Second", "First"]);
  });

  test("an empty title is not added and shows the error", async () => {
    const { user } = setup();
    await addTask(user, "");
    expect(screen.getByRole("alert").textContent).toBe("Please enter a task title");
    expect(taskTitles()).toEqual([]);
    expect(screen.getByLabelText("Task title").getAttribute("aria-invalid")).toBe("true");
  });

  test("a whitespace-only title is not added and shows the error", async () => {
    const { user } = setup();
    await addTask(user, "First");
    await addTask(user, "    ");
    expect(screen.getByRole("alert").textContent).toBe("Please enter a task title");
    expect(taskTitles()).toEqual(["First"]);
    expect(screen.getByText("0 of 1 done")).toBeTruthy();
  });

  test("the error clears once a valid task is added", async () => {
    const { user } = setup();
    await addTask(user, "");
    expect(screen.queryByRole("alert")).not.toBeNull();
    await addTask(user, "Now valid");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("story 2: edit or delete a task", () => {
  test("changes a task's title and assignee", async () => {
    const { user } = setup();
    await addTask(user, "Draft agenda", "Asha");
    await user.click(screen.getByRole("button", { name: "Edit Draft agenda" }));
    const form = screen.getByRole("form", { name: "Edit task Draft agenda" });
    const title = within(form).getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Final agenda");
    await user.selectOptions(within(form).getByLabelText("Assignee"), "Dana");
    await user.click(within(form).getByRole("button", { name: "Save" }));

    expect(taskTitles()).toEqual(["Final agenda"]);
    expect(within(taskItem("Final agenda")).getByText("Dana")).toBeTruthy();
  });

  test("can unassign a task when editing", async () => {
    const { user } = setup();
    await addTask(user, "Ship it", "Ben");
    await user.click(screen.getByRole("button", { name: "Edit Ship it" }));
    const form = screen.getByRole("form", { name: "Edit task Ship it" });
    await user.selectOptions(within(form).getByLabelText("Assignee"), "");
    await user.click(within(form).getByRole("button", { name: "Save" }));
    expect(within(taskItem("Ship it")).getByText("Unassigned")).toBeTruthy();
  });

  test("Cancel (and Escape) leave the task unchanged", async () => {
    const { user } = setup();
    await addTask(user, "Keep me", "Ben");
    await user.click(screen.getByRole("button", { name: "Edit Keep me" }));
    await user.type(screen.getByLabelText("Title"), " changed");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(taskTitles()).toEqual(["Keep me"]);

    await user.click(screen.getByRole("button", { name: "Edit Keep me" }));
    await user.type(screen.getByLabelText("Title"), " changed{Escape}");
    expect(taskTitles()).toEqual(["Keep me"]);
  });

  test("editing to an empty title is rejected with the error", async () => {
    const { user } = setup();
    await addTask(user, "Not empty");
    await user.click(screen.getByRole("button", { name: "Edit Not empty" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "   ");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert").textContent).toBe("Please enter a task title");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(taskTitles()).toEqual(["Not empty"]);
  });

  test("delete asks for confirmation; cancelling keeps the task", async () => {
    const { user } = setup();
    await addTask(user, "Maybe delete");
    await user.click(screen.getByRole("button", { name: "Delete Maybe delete" }));
    const confirm = screen.getByRole("group", { name: "Confirm delete Maybe delete" });
    expect(within(confirm).getByText("Delete this task?")).toBeTruthy();
    // not removed yet
    expect(taskTitles()).toEqual(["Maybe delete"]);
    await user.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(taskTitles()).toEqual(["Maybe delete"]);
  });

  test("delete removes the task after confirmation", async () => {
    const { user } = setup();
    await addTask(user, "Keep");
    await addTask(user, "Remove");
    await user.click(screen.getByRole("button", { name: "Delete Remove" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(taskTitles()).toEqual(["Keep"]);
    expect(screen.getByText("0 of 1 done")).toBeTruthy();
  });
});

describe("story 3: mark a task done", () => {
  test("marks a task done (struck through) and undoes it; header shows N of M done", async () => {
    const { user } = setup();
    expect(screen.getByText("0 of 0 done")).toBeTruthy();
    await addTask(user, "Task A");
    await addTask(user, "Task B");
    expect(screen.getByText("0 of 2 done")).toBeTruthy();

    const checkbox = screen.getByRole("checkbox", { name: "Task A" });
    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(taskItem("Task A").classList.contains("done")).toBe(true);
    expect(taskItem("Task B").classList.contains("done")).toBe(false);
    expect(screen.getByText("1 of 2 done")).toBeTruthy();

    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(taskItem("Task A").classList.contains("done")).toBe(false);
    expect(screen.getByText("0 of 2 done")).toBeTruthy();
  });

  test("done tasks are shown struck through", async () => {
    // Vitest stubs CSS imports, so load the real stylesheet into the document.
    const style = document.createElement("style");
    style.textContent = readFileSync(fileURLToPath(new NodeURL("./App.css", import.meta.url)), "utf8");
    document.head.appendChild(style);
    try {
      const { user } = setup();
      await addTask(user, "Strike me");
      const title = () => taskItem("Strike me").querySelector(".task-title");
      expect(getComputedStyle(title()).textDecoration).not.toMatch(/line-through/);
      await user.click(screen.getByRole("checkbox", { name: "Strike me" }));
      expect(getComputedStyle(title()).textDecoration).toMatch(/line-through/);
    } finally {
      style.remove();
    }
  });

  test("can be toggled with the keyboard", async () => {
    const { user } = setup();
    await addTask(user, "Keyboard done");
    screen.getByRole("checkbox", { name: "Keyboard done" }).focus();
    await user.keyboard(" ");
    expect(screen.getByText("1 of 1 done")).toBeTruthy();
  });
});

describe("story 4: filter the list", () => {
  async function seed(user) {
    await addTask(user, "Asha open", "Asha");
    await addTask(user, "Asha done", "Asha");
    await addTask(user, "Ben open", "Ben");
    await addTask(user, "Nobody done");
    await addTask(user, "Nobody open");
    await user.click(screen.getByRole("checkbox", { name: "Asha done" }));
    await user.click(screen.getByRole("checkbox", { name: "Nobody done" }));
  }

  test("offers the required filter options", () => {
    setup();
    const opts = (label) =>
      Array.from(screen.getByLabelText(label).querySelectorAll("option")).map((o) => o.textContent);
    expect(opts("Person")).toEqual(["All", "Asha", "Ben", "Chen", "Dana", "Unassigned"]);
    expect(opts("Status")).toEqual(["All", "Open", "Done"]);
  });

  test("filters by person, including Unassigned", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Person"), "Asha");
    expect(taskTitles()).toEqual(["Asha done", "Asha open"]);
    await user.selectOptions(screen.getByLabelText("Person"), "Unassigned");
    expect(taskTitles()).toEqual(["Nobody open", "Nobody done"]);
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
    await user.selectOptions(screen.getByLabelText("Status"), "Open");
    expect(taskTitles()).toEqual(["Asha open"]);
    await user.selectOptions(screen.getByLabelText("Person"), "Unassigned");
    await user.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(taskTitles()).toEqual(["Nobody done"]);
  });

  test("shows a message when nothing matches", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Person"), "Ben");
    await user.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(screen.getByText("No tasks match these filters")).toBeTruthy();
    expect(taskTitles()).toEqual([]);

    await user.selectOptions(screen.getByLabelText("Person"), "Dana");
    await user.selectOptions(screen.getByLabelText("Status"), "All");
    expect(screen.getByText("No tasks match these filters")).toBeTruthy();
  });

  test("header count still reflects all tasks while filtered", async () => {
    const { user } = setup();
    await seed(user);
    await user.selectOptions(screen.getByLabelText("Person"), "Ben");
    expect(screen.getByText("2 of 5 done")).toBeTruthy();
  });
});

describe("story 5: keep my tasks", () => {
  test("tasks, status and assignee survive a reload", async () => {
    const { user, unmount } = setup();
    await addTask(user, "Persist me", "Dana");
    await addTask(user, "Persist me too");
    await user.click(screen.getByRole("checkbox", { name: "Persist me" }));
    unmount();

    // simulate reload: brand new App reading from localStorage
    setup();
    expect(taskTitles()).toEqual(["Persist me too", "Persist me"]);
    expect(screen.getByRole("checkbox", { name: "Persist me" }).checked).toBe(true);
    expect(screen.getByRole("checkbox", { name: "Persist me too" }).checked).toBe(false);
    expect(within(taskItem("Persist me")).getByText("Dana")).toBeTruthy();
    expect(within(taskItem("Persist me too")).getByText("Unassigned")).toBeTruthy();
    expect(screen.getByText("1 of 2 done")).toBeTruthy();
  });

  test("edits and deletes are saved too", async () => {
    const { user, unmount } = setup();
    await addTask(user, "Rename me", "Asha");
    await addTask(user, "Delete me");
    await user.click(screen.getByRole("button", { name: "Edit Rename me" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Renamed{Enter}");
    await user.click(screen.getByRole("button", { name: "Delete Delete me" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    unmount();

    setup();
    expect(taskTitles()).toEqual(["Renamed"]);
  });

  test("starts with an empty list when localStorage holds bad data", () => {
    window.localStorage.setItem(STORAGE_KEY, "not json");
    setup();
    expect(screen.getByText("No tasks yet. Add one above.")).toBeTruthy();
    expect(screen.getByText("0 of 0 done")).toBeTruthy();
  });
});
