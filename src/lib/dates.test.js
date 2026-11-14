import { describe, expect, test } from "vitest";
import { compareDue, formatDate, isThisWeek, isValidISODate, todayISO, weekRange } from "./dates.js";

describe("todayISO", () => {
  test("formats the local date as YYYY-MM-DD", () => {
    expect(todayISO(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(todayISO(new Date(2026, 10, 18, 0, 0))).toBe("2026-11-18");
  });
});

describe("weekRange (S6: Monday to Sunday, local time)", () => {
  test("a Monday starts its own week", () => {
    expect(weekRange("2026-11-16")).toEqual({ start: "2026-11-16", end: "2026-11-22" });
  });

  test("a Wednesday", () => {
    expect(weekRange("2026-11-18")).toEqual({ start: "2026-11-16", end: "2026-11-22" });
  });

  test("a Sunday ends its week (it is not the start of the next one)", () => {
    expect(weekRange("2026-11-22")).toEqual({ start: "2026-11-16", end: "2026-11-22" });
  });

  test("a week across the year boundary", () => {
    expect(weekRange("2026-12-31")).toEqual({ start: "2026-12-28", end: "2027-01-03" });
    expect(weekRange("2027-01-03")).toEqual({ start: "2026-12-28", end: "2027-01-03" });
  });

  test("a week across a month boundary and a leap day", () => {
    expect(weekRange("2028-03-01")).toEqual({ start: "2028-02-28", end: "2028-03-05" });
  });
});

describe("isThisWeek", () => {
  const today = "2026-11-18";

  test("true for Monday and Sunday of the current week", () => {
    expect(isThisWeek("2026-11-16", today)).toBe(true);
    expect(isThisWeek("2026-11-22", today)).toBe(true);
  });

  test("false for the Sunday before and the Monday after", () => {
    expect(isThisWeek("2026-11-15", today)).toBe(false);
    expect(isThisWeek("2026-11-23", today)).toBe(false);
  });

  test("false with no due date", () => {
    expect(isThisWeek(null, today)).toBe(false);
  });
});

describe("compareDue", () => {
  test("earliest first, no due date last", () => {
    const dates = [null, "2026-12-02", "2026-11-17", null, "2026-11-20"];
    expect([...dates].sort(compareDue)).toEqual(["2026-11-17", "2026-11-20", "2026-12-02", null, null]);
  });
});

describe("isValidISODate and formatDate", () => {
  test("validates real calendar dates", () => {
    expect(isValidISODate("2026-11-18")).toBe(true);
    expect(isValidISODate("2026-02-30")).toBe(false);
    expect(isValidISODate("18/11/2026")).toBe(false);
    expect(isValidISODate(20261118)).toBe(false);
  });

  test("formats dates in English", () => {
    expect(formatDate("2026-11-17")).toBe("Tue 17 Nov 2026");
  });
});
