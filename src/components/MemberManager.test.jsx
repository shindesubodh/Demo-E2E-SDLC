import { screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { member, renderApp, renderWithStore, seed, stored, task } from "../test/utils.jsx";
import MemberManager from "./MemberManager.jsx";

async function openSettings(user) {
  await user.click(screen.getByRole("button", { name: "Settings" }));
}

async function openTasks(user) {
  await user.click(screen.getByRole("button", { name: "Tasks" }));
}

function taskRow(title) {
  return screen.getByText(title, { selector: ".t" }).closest("li");
}

describe("S3 Manage team members", () => {
  test("adding a name shows it in the member list and in the assignee dropdown", async () => {
    const { user } = renderApp();
    await openSettings(user);
    await user.type(screen.getByLabelText("New member name"), "  Priya  ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByLabelText("Name of Priya")).toHaveValue("Priya");
    expect(screen.getByRole("heading", { name: "Team members (1/10)" })).toBeInTheDocument();
    expect(screen.getByLabelText("New member name")).toHaveValue("");
    expect(stored().members).toEqual([{ id: expect.any(String), name: "Priya" }]);

    await openTasks(user);
    const options = within(screen.getByLabelText("Assignee")).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Unassigned", "Priya"]);
    expect(within(screen.getByLabelText("Filter by assignee")).getByRole("option", { name: "Priya" })).toBeInTheDocument();
  });

  test("an empty or duplicate name is blocked with a message", async () => {
    seed({ members: [member("m1", "Priya")] });
    const { user } = renderWithStore(<MemberManager />);
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name (1–40 characters).");

    await user.type(screen.getByLabelText("New member name"), "priya{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent("priya is already a team member.");
    expect(stored().members).toHaveLength(1);
  });

  test("with 10 members, adding another is blocked with 'Maximum 10 team members'", async () => {
    const ten = Array.from({ length: 10 }, (_, i) => member(`m${i}`, `Person ${i}`));
    seed({ members: ten });
    const { user } = renderWithStore(<MemberManager />);
    expect(screen.getByRole("heading", { name: "Team members (10/10)" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("New member name"), "Hannah");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Maximum 10 team members");
    expect(screen.queryByLabelText("Name of Hannah")).not.toBeInTheDocument();
    expect(stored().members).toHaveLength(10);
  });

  test("renaming a member with tasks shows the new name on their tasks", async () => {
    seed({ members: [member("m1", "Priya")], tasks: [task("t1", "Book room", { assigneeId: "m1" })] });
    const { user } = renderApp();
    expect(within(taskRow("Book room")).getByText("Priya")).toBeInTheDocument();

    await openSettings(user);
    const input = screen.getByLabelText("Name of Priya");
    await user.clear(input);
    await user.type(input, "Priya Shah");
    await user.click(screen.getByRole("button", { name: "Rename Priya" }));
    expect(screen.getByLabelText("Name of Priya Shah")).toBeInTheDocument();

    await openTasks(user);
    expect(within(taskRow("Book room")).getByText("Priya Shah")).toBeInTheDocument();
    expect(stored().members).toEqual([{ id: "m1", name: "Priya Shah" }]);
  });

  test("renaming to an empty name is blocked", async () => {
    seed({ members: [member("m1", "Priya")] });
    const { user } = renderWithStore(<MemberManager />);
    await user.clear(screen.getByLabelText("Name of Priya"));
    await user.click(screen.getByRole("button", { name: "Rename Priya" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name");
    expect(stored().members[0].name).toBe("Priya");
  });

  test("removing a member with tasks shows those tasks as 'Unassigned'", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    seed({
      members: [member("m1", "Priya"), member("m2", "Tom")],
      tasks: [task("t1", "Book room", { assigneeId: "m1" }), task("t2", "Toner", { assigneeId: "m2" })],
    });
    const { user } = renderApp();
    await openSettings(user);
    await user.click(screen.getByRole("button", { name: "Remove Priya" }));
    expect(confirm).toHaveBeenCalledWith("Remove Priya? Their tasks will show as Unassigned.");
    expect(screen.queryByLabelText("Name of Priya")).not.toBeInTheDocument();

    await openTasks(user);
    expect(within(taskRow("Book room")).getByText("Unassigned")).toBeInTheDocument();
    expect(within(taskRow("Toner")).getByText("Tom")).toBeInTheDocument();
    expect(stored().members).toEqual([{ id: "m2", name: "Tom" }]);
  });

  test("cancelling the remove confirmation keeps the member", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    seed({ members: [member("m1", "Priya")] });
    const { user } = renderWithStore(<MemberManager />);
    await user.click(screen.getByRole("button", { name: "Remove Priya" }));
    expect(screen.getByLabelText("Name of Priya")).toBeInTheDocument();
    expect(stored().members).toHaveLength(1);
  });
});
