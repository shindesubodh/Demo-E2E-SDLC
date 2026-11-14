import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { fixToday, member, renderWithStore, seed, stored } from "../test/utils.jsx";
import TaskListScreen from "./TaskListScreen.jsx";

function list() {
  return screen.getByRole("list");
}

describe("S1 Add a task", () => {
  beforeEach(fixToday);

  test("saving a title adds a Pending task with today's created date", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.type(screen.getByLabelText("Title (required)"), "Book team room");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    const row = within(list()).getByText("Book team room").closest("li");
    expect(within(row).getByText("Pending")).toBeInTheDocument();
    expect(within(row).getByText("Created Wed 18 Nov 2026")).toBeInTheDocument();
    expect(stored().tasks).toEqual([
      expect.objectContaining({ title: "Book team room", status: "Pending", createdDate: "2026-11-18" }),
    ]);
  });

  test("the form clears and focus returns to the title; Enter also submits", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    const title = screen.getByLabelText("Title (required)");
    await user.type(title, "First{Enter}");
    expect(title).toHaveValue("");
    expect(title).toHaveFocus();
    await user.type(title, "Second{Enter}");
    expect(within(list()).getAllByRole("listitem")).toHaveLength(2);
  });

  test.each([[""], ["    "]])("an empty or whitespace-only title (%j) saves nothing and shows an error", async (text) => {
    const { user } = renderWithStore(<TaskListScreen />);
    const title = screen.getByLabelText("Title (required)");
    if (text) await user.type(title, text);
    await user.click(screen.getByRole("button", { name: "Add task" }));

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Enter a title (1–120 characters).");
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAccessibleDescription("Enter a title (1–120 characters).");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText("No pending tasks.")).toBeInTheDocument();
    expect(stored().tasks).toEqual([]);
  });

  test("the error clears after a valid save", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Title (required)"), "Now valid{Enter}");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("the title field accepts no more than 120 characters", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    const title = screen.getByLabelText("Title (required)");
    expect(title).toHaveAttribute("maxLength", "120");
    await user.type(title, "x".repeat(130));
    expect(title).toHaveValue("x".repeat(120));
    expect(screen.getByText("120/120")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(stored().tasks[0].title).toHaveLength(120);
  });

  test("a due date can be set and is shown on the task", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.type(screen.getByLabelText("Title (required)"), "Send summary");
    await user.type(screen.getByLabelText("Due date"), "2026-11-20");
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(within(list()).getByText("Due Fri 20 Nov 2026")).toBeInTheDocument();
    expect(stored().tasks[0].dueDate).toBe("2026-11-20");
  });
});

describe("S4 Assign a task (add form)", () => {
  test("with no members, the assignee field offers only 'Unassigned'", () => {
    renderWithStore(<TaskListScreen />);
    const options = within(screen.getByLabelText("Assignee")).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Unassigned"]);
  });

  test("the assignee field offers every current member and 'Unassigned'", () => {
    seed({ members: [member("m1", "Priya"), member("m2", "Tom")] });
    renderWithStore(<TaskListScreen />);
    const options = within(screen.getByLabelText("Assignee")).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Unassigned", "Priya", "Tom"]);
  });

  test("choosing a member shows their name on the new task", async () => {
    seed({ members: [member("m1", "Priya"), member("m2", "Tom")] });
    const { user } = renderWithStore(<TaskListScreen />);
    await user.type(screen.getByLabelText("Title (required)"), "Book team room");
    await user.selectOptions(screen.getByLabelText("Assignee"), "Tom");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    const row = within(list()).getByText("Book team room").closest("li");
    expect(within(row).getByText("Tom")).toBeInTheDocument();
    expect(stored().tasks[0].assigneeId).toBe("m2");
  });

  test("a task left unassigned shows 'Unassigned'", async () => {
    const { user } = renderWithStore(<TaskListScreen />);
    await user.type(screen.getByLabelText("Title (required)"), "Loose end{Enter}");
    const row = within(list()).getByText("Loose end").closest("li");
    expect(within(row).getByText("Unassigned")).toBeInTheDocument();
  });
});
