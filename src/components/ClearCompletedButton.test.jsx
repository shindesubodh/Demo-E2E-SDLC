import { screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { renderWithStore, seed, stored, task } from "../test/utils.jsx";
import TaskListScreen from "./TaskListScreen.jsx";

const tasks = [
  task("p1", "Pending one"),
  task("d1", "Done one", { status: "Done" }),
  task("p2", "Pending two", { dueDate: "2026-11-20" }),
  task("d2", "Done two", { status: "Done" }),
  task("d3", "Done three", { status: "Done" }),
];

function clearButton() {
  return screen.getByRole("button", { name: "Clear completed" });
}

describe("S8 Clear completed tasks", () => {
  test("is disabled when there are no Done tasks", () => {
    seed({ tasks: [task("p1", "Pending one")] });
    renderWithStore(<TaskListScreen />);
    expect(clearButton()).toBeDisabled();
  });

  test("the confirmation states the count; confirming removes Done tasks only", async () => {
    seed({ tasks });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user } = renderWithStore(<TaskListScreen />);
    await user.selectOptions(screen.getByLabelText("Filter by status"), "All");
    expect(clearButton()).toBeEnabled();

    await user.click(clearButton());

    expect(confirm).toHaveBeenCalledWith("Remove 3 completed tasks? This cannot be undone.");
    const listed = screen.getAllByText(/.+/, { selector: ".t" }).map((el) => el.textContent);
    expect(listed).toEqual(["Pending two", "Pending one"]);
    expect(stored().tasks).toEqual([tasks[0], tasks[2]]);
    expect(clearButton()).toBeDisabled();
  });

  test("uses the singular for one Done task", async () => {
    seed({ tasks: [task("d1", "Done one", { status: "Done" })] });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(clearButton());
    expect(confirm).toHaveBeenCalledWith("Remove 1 completed task? This cannot be undone.");
  });

  test("cancelling removes no tasks", async () => {
    seed({ tasks });
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = renderWithStore(<TaskListScreen />);
    await user.click(clearButton());
    expect(stored().tasks).toEqual(tasks);
    await user.selectOptions(screen.getByLabelText("Filter by status"), "Done");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
