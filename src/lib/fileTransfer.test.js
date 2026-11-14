import { describe, expect, test, vi } from "vitest";
import { member, task } from "../test/utils.jsx";
import { IMPORT_ERROR, buildExport, exportToFile, readImportFile } from "./fileTransfer.js";

const state = {
  members: [member("m1", "Priya")],
  tasks: [task("t1", "Book team room", { assigneeId: "m1", dueDate: "2026-11-21" })],
};

function jsonFile(content, name = "team-todo-2026-11-18.json") {
  return new File([content], name, { type: "application/json" });
}

describe("export (S10)", () => {
  test("buildExport has version 1, an ISO exportedAt, all tasks and members", () => {
    const data = buildExport(state, new Date("2026-11-20T09:15:00.000Z"));
    expect(data).toEqual({ version: 1, exportedAt: "2026-11-20T09:15:00.000Z", ...state });
  });

  test("exportToFile downloads a JSON Blob named team-todo-YYYY-MM-DD.json", async () => {
    let blob;
    URL.createObjectURL = vi.fn((b) => {
      blob = b;
      return "blob:fake";
    });
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
      expect(this.download).toBe("team-todo-2026-11-20.json");
      expect(this.href).toBe("blob:fake");
    });

    exportToFile(state, new Date(2026, 10, 20, 9, 15));

    expect(click).toHaveBeenCalledTimes(1);
    expect(blob.type).toBe("application/json");
    const parsed = JSON.parse(await blob.text());
    expect(parsed.version).toBe(1);
    expect(parsed.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(parsed.members).toEqual(state.members);
    expect(parsed.tasks).toEqual(state.tasks);
  });
});

describe("readImportFile (S10)", () => {
  test("a valid export parses, dropping exportedAt", async () => {
    const file = jsonFile(JSON.stringify(buildExport(state)));
    expect(await readImportFile(file)).toEqual({ ok: true, data: state });
  });

  test("a non-JSON file returns the import error", async () => {
    expect(await readImportFile(jsonFile("hello, world"))).toEqual({ ok: false, error: IMPORT_ERROR });
  });

  test("JSON with an invalid shape returns the import error", async () => {
    const file = jsonFile(JSON.stringify({ version: 1, members: [], tasks: [{ id: "x" }] }));
    expect(await readImportFile(file)).toEqual({ ok: false, error: IMPORT_ERROR });
  });
});
