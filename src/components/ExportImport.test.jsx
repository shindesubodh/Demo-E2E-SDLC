import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { STORAGE_KEY } from "../lib/storage.js";
import { member, renderApp, renderWithStore, seed, stored, task } from "../test/utils.jsx";
import ExportImport from "./ExportImport.jsx";

const current = {
  members: [member("m1", "Priya")],
  tasks: [task("t1", "Current task", { assigneeId: "m1" })],
};

const incoming = {
  members: [member("x1", "Lukas"), member("x2", "Sara")],
  tasks: [
    task("y1", "Imported one", { assigneeId: "x1", dueDate: "2026-11-21" }),
    task("y2", "Imported two", { assigneeId: "x2", status: "Done" }),
  ],
};

function jsonFile(content, name = "team-todo-2026-11-18.json") {
  return new File([content], name, { type: "application/json" });
}

// Captures the Blob that exportToFile hands to the browser for download.
function captureDownloads() {
  const blobs = [];
  URL.createObjectURL = vi.fn((blob) => {
    blobs.push(blob);
    return "blob:fake";
  });
  URL.revokeObjectURL = vi.fn();
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  return { blobs, click };
}

beforeEach(() => seed(current));

describe("S10 Export and import", () => {
  test("Export downloads a JSON file with all tasks and members", async () => {
    const { blobs, click } = captureDownloads();
    const { user } = renderWithStore(<ExportImport />);
    await user.click(screen.getByRole("button", { name: "Export to file" }));

    expect(click).toHaveBeenCalledTimes(1);
    const data = JSON.parse(await blobs[0].text());
    expect(data).toMatchObject({ version: 1, ...current });
    expect(data.exportedAt).toEqual(expect.any(String));
  });

  test("importing a valid file and confirming replaces the current tasks and members", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user } = renderApp();
    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.upload(screen.getByLabelText("Import from file"), jsonFile(JSON.stringify({ version: 1, ...incoming })));

    expect(confirm).toHaveBeenCalledWith(
      "Replace your current list? Importing replaces all 1 task and 1 team member on this device " +
        "with the contents of team-todo-2026-11-18.json. This cannot be undone.",
    );
    expect(await screen.findByText("Imported 2 tasks and 2 team members.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name of Lukas")).toBeInTheDocument();
    expect(screen.queryByLabelText("Name of Priya")).not.toBeInTheDocument();
    expect(stored()).toEqual({ version: 1, ...incoming });

    await user.click(screen.getByRole("button", { name: "Tasks" }));
    expect(screen.getByText("Imported one")).toBeInTheDocument();
    expect(screen.queryByText("Current task")).not.toBeInTheDocument();
  });

  test("cancelling the replace warning keeps the current list", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = renderWithStore(<ExportImport />);
    await user.upload(screen.getByLabelText("Import from file"), jsonFile(JSON.stringify({ version: 1, ...incoming })));
    await vi.waitFor(() => expect(window.confirm).toHaveBeenCalled());
    expect(stored()).toEqual({ version: 1, ...current });
  });

  test.each([
    ["a non-JSON file", "this is not json"],
    ["JSON that is not an export", JSON.stringify({ hello: "world" })],
    ["an export with an unsupported version", JSON.stringify({ version: 2, ...incoming })],
  ])("importing %s shows an error and leaves the list unchanged", async (_, content) => {
    const confirm = vi.spyOn(window, "confirm");
    const { user } = renderApp();
    await user.click(screen.getByRole("button", { name: "Settings" }));
    const input = screen.getByLabelText("Import from file");
    await user.upload(input, jsonFile(content, "notes.json"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("This file is not a valid Team To-Do export. Your current list is unchanged.");
    expect(input).toHaveAccessibleDescription(alert.textContent);
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Name of Priya")).toBeInTheDocument();
    expect(stored()).toEqual({ version: 1, ...current });
  });

  test("an export imported into another browser shows the same tasks and members", async () => {
    // Browser A: export.
    seed(incoming);
    const { blobs } = captureDownloads();
    const first = renderApp();
    await first.user.click(screen.getByRole("button", { name: "Settings" }));
    await first.user.click(screen.getByRole("button", { name: "Export to file" }));
    const exported = await blobs[0].text();
    first.unmount();

    // Browser B: empty storage, then import the file.
    localStorage.removeItem(STORAGE_KEY);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user } = renderApp();
    expect(screen.getByText("No pending tasks.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.upload(screen.getByLabelText("Import from file"), jsonFile(exported));
    await screen.findByText("Imported 2 tasks and 2 team members.");

    expect(screen.getByLabelText("Name of Lukas")).toBeInTheDocument();
    expect(screen.getByLabelText("Name of Sara")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tasks" }));
    await user.selectOptions(screen.getByLabelText("Filter by status"), "All");
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("Imported one")).toBeInTheDocument();
    expect(within(rows[0]).getByText("Lukas")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Imported two")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Sara")).toBeInTheDocument();
    expect(stored()).toEqual({ version: 1, ...incoming });
  });
});
