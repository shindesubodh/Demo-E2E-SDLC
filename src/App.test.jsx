import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { STORAGE_KEY } from "./lib/storage.js";
import { fixToday, member, renderApp, seed, stored, task } from "./test/utils.jsx";

const members = [member("m1", "Priya"), member("m2", "Tom"), member("m3", "Aisha")];
const tasks = [
  task("t1", "Renew licences", { assigneeId: "m3", dueDate: "2026-12-02" }),
  task("t2", "Book team room", { assigneeId: "m1", dueDate: "2026-11-17" }),
  task("t3", "Update checklist", { dueDate: "2026-11-22" }),
  task("t4", "Collect feedback", { assigneeId: "removed-member" }),
  task("t5", "Order toner", { assigneeId: "m1", dueDate: "2026-11-16", status: "Done" }),
  task("t6", "Plan social", { assigneeId: "m2", status: "Done" }),
];

function titles() {
  return screen.queryAllByText(/.+/, { selector: ".t" }).map((el) => el.textContent);
}

beforeEach(fixToday);

test("renders the header, navigation and the Tasks screen", async () => {
  const { user } = renderApp();
  expect(screen.getByRole("heading", { level: 1, name: "Team To-Do Tracker" })).toBeInTheDocument();
  const nav = screen.getByRole("navigation", { name: "Main" });
  expect(within(nav).getByRole("button", { name: "Tasks" })).toHaveAttribute("aria-current", "page");

  await user.click(within(nav).getByRole("button", { name: "Settings" }));
  expect(within(nav).getByRole("button", { name: "Settings" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("heading", { name: "Team members (0/10)" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Add a task" })).not.toBeInTheDocument();
});

describe("S6 Default view", () => {
  test("on open, only Pending tasks are listed, earliest due first, no due date last", () => {
    seed({ members, tasks });
    renderApp();
    expect(screen.getByRole("heading", { name: "Pending tasks" })).toBeInTheDocument();
    expect(titles()).toEqual(["Book team room", "Update checklist", "Renew licences", "Collect feedback"]);
    expect(screen.getByText("4 tasks")).toBeInTheDocument();
  });

  test("this week's tasks carry a 'This week' text label", () => {
    seed({ members, tasks });
    renderApp();
    const labelled = screen.getAllByText("This week").map((badge) => badge.closest("li").querySelector(".t").textContent);
    expect(labelled).toEqual(["Book team room", "Update checklist"]);
  });
});

describe("S7 Filter by person and status", () => {
  beforeEach(() => seed({ members, tasks }));

  test("assignee filter: a member, 'Unassigned' and All", async () => {
    const { user } = renderApp();
    const assignee = screen.getByLabelText("Filter by assignee");
    expect(within(assignee).getAllByRole("option").map((o) => o.textContent)).toEqual([
      "All",
      "Unassigned",
      "Priya",
      "Tom",
      "Aisha",
    ]);

    await user.selectOptions(assignee, "Aisha");
    expect(titles()).toEqual(["Renew licences"]);
    expect(screen.getByRole("heading", { name: "Aisha – pending tasks" })).toBeInTheDocument();

    await user.selectOptions(assignee, "Unassigned");
    expect(titles()).toEqual(["Update checklist", "Collect feedback"]);

    await user.selectOptions(assignee, "All");
    expect(titles()).toHaveLength(4);
  });

  test("status filter: Pending, Done and All", async () => {
    const { user } = renderApp();
    const status = screen.getByLabelText("Filter by status");
    expect(within(status).getAllByRole("option").map((o) => o.textContent)).toEqual(["Pending", "Done", "All"]);

    await user.selectOptions(status, "Done");
    expect(titles()).toEqual(["Order toner", "Plan social"]);
    await user.selectOptions(status, "All");
    expect(titles()).toHaveLength(6);
    await user.selectOptions(status, "Pending");
    expect(titles()).toHaveLength(4);
  });

  test("both filters together list only tasks matching both", async () => {
    const { user } = renderApp();
    await user.selectOptions(screen.getByLabelText("Filter by assignee"), "Priya");
    await user.selectOptions(screen.getByLabelText("Filter by status"), "Done");
    expect(titles()).toEqual(["Order toner"]);
    expect(screen.getByRole("heading", { name: "Priya – done tasks" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter by status"), "All");
    expect(titles()).toEqual(["Order toner", "Book team room"]);

    await user.selectOptions(screen.getByLabelText("Filter by assignee"), "Tom");
    await user.selectOptions(screen.getByLabelText("Filter by status"), "Pending");
    expect(titles()).toEqual([]);
    expect(screen.getByText("No tasks match these filters.")).toBeInTheDocument();
  });

  test("filters update the list in place with 500 tasks", async () => {
    const many = Array.from({ length: 500 }, (_, i) =>
      task(`n${i}`, `Task ${i}`, { assigneeId: `m${(i % 3) + 1}`, status: i % 2 ? "Done" : "Pending" }),
    );
    seed({ members, tasks: many });
    const { user } = renderApp();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(screen.getByText("250 tasks")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Filter by assignee"), "Tom");
    expect(screen.getByText("83 tasks")).toBeInTheDocument();
    // Same DOM node: the app did not reload.
    expect(screen.getByRole("heading", { level: 1 })).toBe(heading);
  });
});

describe("S9 Keep data after a reload", () => {
  test("added, edited and deleted tasks and members are the same after a reload", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const first = renderApp();
    const user = first.user;

    await user.click(screen.getByRole("button", { name: "Settings" }));
    for (const name of ["Priya", "Tom", "Aisha"]) {
      await user.type(screen.getByLabelText("New member name"), `${name}{Enter}`);
    }
    await user.click(screen.getByRole("button", { name: "Remove Aisha" }));
    await user.click(screen.getByRole("button", { name: "Tasks" }));

    await user.type(screen.getByLabelText("Title (required)"), "Book team room");
    await user.selectOptions(screen.getByLabelText("Assignee"), "Priya");
    await user.type(screen.getByLabelText("Due date"), "2026-11-20");
    await user.click(screen.getByRole("button", { name: "Add task" }));
    await user.type(screen.getByLabelText("Title (required)"), "Typo task{Enter}");
    await user.type(screen.getByLabelText("Title (required)"), "Delete me{Enter}");

    await user.click(screen.getByRole("button", { name: "Edit Typo task" }));
    await user.clear(screen.getByLabelText("Title (required)"));
    await user.type(screen.getByLabelText("Title (required)"), "Fixed task");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "Delete Delete me" }));
    await user.click(screen.getByRole("checkbox", { name: "Mark Fixed task as done" }));

    first.unmount();
    const { user: again } = renderApp();

    expect(titles()).toEqual(["Book team room"]);
    const row = screen.getByText("Book team room").closest("li");
    expect(within(row).getByText("Priya")).toBeInTheDocument();
    expect(within(row).getByText("This week")).toBeInTheDocument();
    await again.selectOptions(screen.getByLabelText("Filter by status"), "Done");
    expect(titles()).toEqual(["Fixed task"]);

    await again.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("heading", { name: "Team members (2/10)" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name of Priya")).toBeInTheDocument();
    expect(screen.getByLabelText("Name of Tom")).toBeInTheDocument();
  });

  test.each([
    ["no stored data", null],
    ["an empty string", ""],
    ["unreadable JSON", "{oops"],
    ["data of the wrong shape", JSON.stringify({ version: 1, tasks: "nope" })],
  ])("with %s, the app opens on an empty task list without crashing", (_, raw) => {
    if (raw !== null) localStorage.setItem(STORAGE_KEY, raw);
    renderApp();
    expect(screen.getByRole("heading", { name: "Pending tasks" })).toBeInTheDocument();
    expect(screen.getByText("No pending tasks.")).toBeInTheDocument();
    expect(screen.getByText("0 tasks")).toBeInTheDocument();
  });

  test("a failed save shows the storage warning and the app keeps working", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    const { user } = renderApp();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Changes could not be saved in this browser. Export your list to keep a copy.",
    );

    await user.type(screen.getByLabelText("Title (required)"), "Still works{Enter}");
    expect(screen.getByText("Still works")).toBeInTheDocument();

    setItem.mockRestore();
    await user.type(screen.getByLabelText("Title (required)"), "Saved now{Enter}");
    expect(screen.queryByText(/could not be saved/)).not.toBeInTheDocument();
    expect(stored().tasks.map((t) => t.title)).toEqual(["Still works", "Saved now"]);
  });
});
