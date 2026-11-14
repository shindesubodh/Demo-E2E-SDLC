import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { fixToday, member, renderWithStore, seed, stored, task } from "../test/utils.jsx";
import TaskListScreen from "./TaskListScreen.jsx";

const members = [member("m1", "Priya"), member("m2", "Tom")];

function row(title) {
  return screen.getByText(title, { selector: ".t" }).closest("li");
}

function listedTitles() {
  return screen.queryAllByText(/.+/, { selector: ".t" }).map((el) => el.textContent);
}

beforeEach(fixToday);

describe("S2 Edit and delete a task", () => {
  beforeEach(() => {
    seed({
      members,
      tasks: [
        task("t1", "Send sprint summary", { assigneeId: "m1", dueDate: "2026-11-20" }),
        task("t2", "Renew licences", { dueDate: "2026-12-02" }),
      ],
    });
  });

  test("editing title, assignee and due date shows the new values; created date is unchanged", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(screen.getByRole("button", { name: "Edit Send sprint summary" }));

    expect(screen.getByRole("heading", { name: "Edit task" })).toBeInTheDocument();
    const title = screen.getByLabelText("Title (required)");
    expect(title).toHaveValue("Send sprint summary");
    expect(title).toHaveFocus();
    expect(screen.getByLabelText("Assignee")).toHaveValue("m1");
    expect(screen.getByLabelText("Due date")).toHaveValue("2026-11-20");
    expect(screen.getByText("Created Tue 10 Nov 2026 (does not change).")).toBeInTheDocument();

    await user.clear(title);
    await user.type(title, "Send sprint report");
    await user.selectOptions(screen.getByLabelText("Assignee"), "Tom");
    await user.clear(screen.getByLabelText("Due date"));
    await user.type(screen.getByLabelText("Due date"), "2026-11-19");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("heading", { name: "Add a task" })).toBeInTheDocument();
    const edited = row("Send sprint report");
    expect(within(edited).getByText("Tom")).toBeInTheDocument();
    expect(within(edited).getByText("Due Thu 19 Nov 2026")).toBeInTheDocument();
    expect(within(edited).getByText("Created Tue 10 Nov 2026")).toBeInTheDocument();
    expect(screen.queryByText("Send sprint summary")).not.toBeInTheDocument();
    expect(stored().tasks[0]).toEqual({
      id: "t1",
      title: "Send sprint report",
      assigneeId: "m2",
      dueDate: "2026-11-19",
      status: "Pending",
      createdDate: "2026-11-10",
    });
  });

  test("an edit with an empty title is not saved", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(screen.getByRole("button", { name: "Edit Renew licences" }));
    await user.clear(screen.getByLabelText("Title (required)"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a title");
    expect(stored().tasks[1].title).toBe("Renew licences");
  });

  test("cancelling an edit keeps the task unchanged", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(screen.getByRole("button", { name: "Edit Renew licences" }));
    await user.type(screen.getByLabelText("Title (required)"), " changed");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(row("Renew licences")).toBeInTheDocument();
    expect(stored().tasks[1].title).toBe("Renew licences");
  });

  test("Delete then confirm removes the task from the list and from storage", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(screen.getByRole("button", { name: "Delete Send sprint summary" }));

    expect(confirm).toHaveBeenCalledWith('Delete "Send sprint summary"? This cannot be undone.');
    expect(screen.queryByText("Send sprint summary")).not.toBeInTheDocument();
    expect(stored().tasks.map((t) => t.id)).toEqual(["t2"]);
  });

  test("Delete then cancel leaves the task unchanged", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(screen.getByRole("button", { name: "Delete Send sprint summary" }));
    expect(row("Send sprint summary")).toBeInTheDocument();
    expect(stored().tasks).toHaveLength(2);
  });
});

describe("S4 Reassign a task (edit form)", () => {
  test("a task can be reassigned to any member or to 'Unassigned'", async () => {
    seed({ members, tasks: [task("t1", "Book room", { assigneeId: "m1" })] });
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(screen.getByRole("button", { name: "Edit Book room" }));
    const options = within(screen.getByLabelText("Assignee")).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Unassigned", "Priya", "Tom"]);

    await user.selectOptions(screen.getByLabelText("Assignee"), "Unassigned");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(within(row("Book room")).getByText("Unassigned")).toBeInTheDocument();
    expect(stored().tasks[0].assigneeId).toBeNull();
  });
});

describe("S5 Mark a task done or pending", () => {
  beforeEach(() => {
    seed({ members, tasks: [task("t1", "Order toner"), task("t2", "Fix drive permissions", { status: "Done" })] });
  });

  test("the done control has an accessible label naming the task", () => {
    renderWithStore(<TaskListScreen />);
    expect(screen.getByRole("checkbox", { name: "Mark Order toner as done" })).not.toBeChecked();
  });

  test("marking a Pending task Done with the keyboard removes it from the default view", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    const checkbox = screen.getByRole("checkbox", { name: "Mark Order toner as done" });
    checkbox.focus();
    await user.keyboard(" ");

    expect(screen.queryByText("Order toner")).not.toBeInTheDocument();
    expect(stored().tasks[0].status).toBe("Done");
  });

  test("with the Done filter, marking a task Pending brings it back to the default view", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.selectOptions(screen.getByLabelText("Filter by status"), "Done");
    const done = within(row("Fix drive permissions"));
    expect(done.getByText("✓ Done")).toBeInTheDocument();
    await user.click(done.getByRole("checkbox", { name: "Mark Fix drive permissions as pending" }));
    expect(screen.queryByText("Fix drive permissions")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter by status"), "Pending");
    expect(within(row("Fix drive permissions")).getByText("Pending")).toBeInTheDocument();
    expect(stored().tasks[1].status).toBe("Pending");
  });
});

describe("S6 This week's pending work", () => {
  // Today is Wed 18 Nov 2026; this week is Mon 16 to Sun 22 Nov.
  beforeEach(() => {
    seed({
      members,
      tasks: [
        task("none", "No date"),
        task("next", "Next Monday", { dueDate: "2026-11-23" }),
        task("sun", "This Sunday", { dueDate: "2026-11-22" }),
        task("mon", "This Monday", { dueDate: "2026-11-16" }),
        task("prev", "Last Sunday", { dueDate: "2026-11-15" }),
        task("doneWeek", "Done this week", { dueDate: "2026-11-18", status: "Done" }),
      ],
    });
  });

  test("Pending tasks due Monday to Sunday are highlighted and labelled 'This week'", () => {
    renderWithStore(<TaskListScreen />);
    for (const title of ["This Monday", "This Sunday"]) {
      expect(row(title)).toHaveClass("week");
      expect(within(row(title)).getByText("This week")).toBeInTheDocument();
    }
  });

  test("tasks due outside this week or with no due date are not highlighted", () => {
    renderWithStore(<TaskListScreen />);
    for (const title of ["Last Sunday", "Next Monday", "No date"]) {
      expect(row(title)).not.toHaveClass("week");
      expect(within(row(title)).queryByText("This week")).not.toBeInTheDocument();
    }
  });

  test("Done tasks due this week are not highlighted", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.selectOptions(screen.getByLabelText("Filter by status"), "Done");
    expect(row("Done this week")).not.toHaveClass("week");
    expect(within(row("Done this week")).queryByText("This week")).not.toBeInTheDocument();
  });

  test("the list is sorted by due date with no due date last", () => {
    renderWithStore(<TaskListScreen />);
    expect(listedTitles()).toEqual(["Last Sunday", "This Monday", "This Sunday", "Next Monday", "No date"]);
  });
});
