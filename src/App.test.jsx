import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App.jsx";

const LABEL = "Enter a number from 1 to 100";
const ERROR = "Please enter a whole number from 1 to 100.";

afterEach(cleanup);

function setup() {
  const user = userEvent.setup();
  render(<App />);
  const input = screen.getByLabelText(LABEL);
  const button = screen.getByRole("button", { name: "Generate" });
  return { user, input, button };
}

function rowTexts() {
  const list = screen.queryByRole("list", { name: "Times table" });
  if (!list) return [];
  return within(list)
    .getAllByRole("listitem")
    .map((li) => li.textContent);
}

async function submitWithButton(user, input, button, text) {
  await user.clear(input);
  if (text) await user.type(input, text);
  await user.click(button);
}

describe("S1 Generate a times table", () => {
  it('shows exactly 10 rows from "7 × 1 = 7" to "7 × 10 = 70" when 7 is entered and Generate is pressed', async () => {
    const { user, input, button } = setup();
    await submitWithButton(user, input, button, "7");
    const rows = rowTexts();
    expect(rows).toHaveLength(10);
    expect(rows[0]).toBe("7 × 1 = 7");
    expect(rows[9]).toBe("7 × 10 = 70");
  });

  it("shows the same 10 rows when 7 is entered and Enter is pressed in the input", async () => {
    const { user, input } = setup();
    await user.type(input, "7{Enter}");
    expect(rowTexts()).toEqual([
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

  it.each([
    ["1", "1 × 10 = 10"],
    ["100", "100 × 10 = 1000"],
  ])('shows 10 rows for "%s" ending in "%s"', async (text, last) => {
    const { user, input, button } = setup();
    await submitWithButton(user, input, button, text);
    const rows = rowTexts();
    expect(rows).toHaveLength(10);
    expect(rows[9]).toBe(last);
  });

  it('shows the table for 12 when " 12 " is entered', async () => {
    const { user, input, button } = setup();
    await submitWithButton(user, input, button, " 12 ");
    const rows = rowTexts();
    expect(rows).toHaveLength(10);
    expect(rows[0]).toBe("12 × 1 = 12");
    expect(rows[9]).toBe("12 × 10 = 120");
  });

  it("shows no rows and no error before anything is submitted", () => {
    setup();
    expect(rowTexts()).toEqual([]);
    expect(screen.getByRole("alert").textContent).toBe("");
  });
});

describe("S3 Clear error for an invalid entry", () => {
  it.each(["", "   ", "2.5", "-3", "0", "101", "abc", "+5", "7!"])(
    'shows the exact error message for "%s"',
    async (text) => {
      const { user, input, button } = setup();
      await submitWithButton(user, input, button, text);
      expect(screen.getByRole("alert").textContent).toBe(ERROR);
      expect(rowTexts()).toEqual([]);
    }
  );

  it("clears a shown table when an invalid entry is submitted", async () => {
    const { user, input, button } = setup();
    await submitWithButton(user, input, button, "7");
    expect(rowTexts()).toHaveLength(10);

    await submitWithButton(user, input, button, "abc");
    expect(screen.getByRole("alert").textContent).toBe(ERROR);
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it.each(["abc", " 2.5 ", "   ", "+5"])(
    'keeps exactly what was typed ("%s") in the input after an invalid entry',
    async (text) => {
      const { user, input, button } = setup();
      await submitWithButton(user, input, button, text);
      expect(input.value).toBe(text);
    }
  );

  it("marks the input as invalid while the error is shown", async () => {
    const { user, input, button } = setup();
    expect(input.getAttribute("aria-invalid")).toBe("false");
    await submitWithButton(user, input, button, "abc");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});

describe("S2 Replace the table with a new number", () => {
  it("replaces the table for 7 with exactly 10 rows for 9 and no rows for 7 remain", async () => {
    const { user, input, button } = setup();
    await submitWithButton(user, input, button, "7");
    await submitWithButton(user, input, button, "9");
    const rows = rowTexts();
    expect(rows).toHaveLength(10);
    expect(rows[0]).toBe("9 × 1 = 9");
    expect(rows[9]).toBe("9 × 10 = 90");
    expect(rows.some((text) => text.startsWith("7 ×"))).toBe(false);
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
  });

  it("removes the error and shows the new table after a valid entry", async () => {
    const { user, input, button } = setup();
    await submitWithButton(user, input, button, "abc");
    expect(screen.getByRole("alert").textContent).toBe(ERROR);

    await submitWithButton(user, input, button, "5");
    expect(screen.getByRole("alert").textContent).toBe("");
    expect(screen.queryByText(ERROR)).toBeNull();
    const rows = rowTexts();
    expect(rows).toHaveLength(10);
    expect(rows[9]).toBe("5 × 10 = 50");
  });
});

describe("S4 Keyboard and screen reader use", () => {
  it('finds the input by its visible, linked label "Enter a number from 1 to 100"', () => {
    render(<App />);
    const label = screen.getByText(LABEL);
    expect(label.tagName).toBe("LABEL");
    const input = screen.getByLabelText(LABEL);
    expect(input.id).toBe("number-input");
    expect(label.getAttribute("for")).toBe("number-input");
  });

  it('shows the error inside a role="alert" region', async () => {
    const { user, input, button } = setup();
    const alert = screen.getByRole("alert");
    await submitWithButton(user, input, button, "abc");
    expect(within(alert).getByText(ERROR)).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
  });

  it("generates a table using only Tab, typing and Enter", async () => {
    const { user, input } = setup();
    await user.tab();
    expect(document.activeElement).toBe(input);
    await user.keyboard("7");
    await user.keyboard("{Enter}");
    expect(rowTexts()).toHaveLength(10);
  });

  it("generates a table using Tab to reach the Generate button and Enter", async () => {
    const { user, input, button } = setup();
    await user.tab();
    await user.keyboard("8");
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard("{Enter}");
    expect(rowTexts()[9]).toBe("8 × 10 = 80");
    expect(input.value).toBe("8");
  });

  it("generates a table using Tab to reach the Generate button and Space", async () => {
    const { user, button } = setup();
    await user.tab();
    await user.keyboard("6");
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard(" ");
    expect(rowTexts()[9]).toBe("6 × 10 = 60");
  });

  it("uses a real submit button and a numeric text input in a form with noValidate", () => {
    const { input, button } = setup();
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("submit");
    expect(input.getAttribute("type")).toBe("text");
    expect(input.getAttribute("inputmode")).toBe("numeric");
    expect(input.form.noValidate).toBe(true);
  });
});

describe("S6 Works on phone and laptop (screen content)", () => {
  it("shows only the title, input, button, error area and table", async () => {
    const { user, input, button } = setup();
    await submitWithButton(user, input, button, "100");
    expect(screen.getByRole("heading", { level: 1, name: "Times Table Generator" })).toBeTruthy();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });
});
