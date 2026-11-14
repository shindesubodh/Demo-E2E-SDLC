import { describe, expect, it } from "vitest";
import { ERROR_MESSAGE, buildTable, formatRow, parseTableNumber } from "./timesTable.js";

describe("ERROR_MESSAGE", () => {
  it("is the exact approved wording", () => {
    expect(ERROR_MESSAGE).toBe("Please enter a whole number from 1 to 100.");
  });
});

describe("formatRow", () => {
  it('formats 7 and 3 as "7 × 3 = 21" using the U+00D7 sign', () => {
    const text = formatRow(7, 3);
    expect(text).toBe("7 \u00D7 3 = 21");
    expect(text).toBe("7 × 3 = 21");
    expect(text).not.toContain("x");
  });

  it('formats 100 and 10 as "100 × 10 = 1000"', () => {
    expect(formatRow(100, 10)).toBe("100 × 10 = 1000");
  });
});

describe("buildTable (S1 table generation)", () => {
  it('returns exactly 10 rows for 7, from "7 × 1 = 7" to "7 × 10 = 70"', () => {
    const rows = buildTable(7);
    expect(rows).toHaveLength(10);
    expect(rows.map((r) => r.text)).toEqual([
      "7 × 1 = 7",
      "7 × 2 = 14",
      "7 × 3 = 21",
      "7 × 4 = 28",
      "7 × 5 = 35",
      "7 × 6 = 42",
      "7 × 7 = 49",
      "7 × 8 = 56",
      "7 × 9 = 63",
      "7 × 10 = 70",
    ]);
  });

  it("returns TableRow objects with multiplier, product and text", () => {
    expect(buildTable(7)[2]).toEqual({ multiplier: 3, product: 21, text: "7 × 3 = 21" });
  });

  it('returns 10 rows for 1 ending in "1 × 10 = 10"', () => {
    const rows = buildTable(1);
    expect(rows).toHaveLength(10);
    expect(rows[0].text).toBe("1 × 1 = 1");
    expect(rows[9].text).toBe("1 × 10 = 10");
  });

  it('returns 10 rows for 100 ending in "100 × 10 = 1000"', () => {
    const rows = buildTable(100);
    expect(rows).toHaveLength(10);
    expect(rows[0].text).toBe("100 × 1 = 100");
    expect(rows[9].text).toBe("100 × 10 = 1000");
  });

  it.each([0, 101, -3, 2.5, NaN, "7"])("throws RangeError for %s", (n) => {
    expect(() => buildTable(n)).toThrow(RangeError);
  });
});

describe("parseTableNumber (S1 valid entries)", () => {
  it.each([
    ["1", 1],
    ["7", 7],
    ["100", 100],
    [" 12 ", 12],
    ["007", 7],
  ])('accepts "%s" as %i', (text, value) => {
    expect(parseTableNumber(text)).toEqual({ ok: true, value });
  });
});

describe("parseTableNumber (S3 validation)", () => {
  it.each(["", "   ", "2.5", "-3", "0", "101", "abc", "+5", "7!"])(
    'rejects "%s" with the exact error message',
    (text) => {
      expect(parseTableNumber(text)).toEqual({ ok: false, error: ERROR_MESSAGE });
    }
  );

  it.each(["1 2", "1,0", "1e2", "0x10", "٧"])('also rejects "%s"', (text) => {
    expect(parseTableNumber(text).ok).toBe(false);
  });

  it.each([null, undefined])("treats %s as empty and never throws", (text) => {
    expect(parseTableNumber(text)).toEqual({ ok: false, error: ERROR_MESSAGE });
  });
});
