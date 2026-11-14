// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// Read as plain text: Vitest stubs CSS imports, so "?raw" would give an empty string.
const css = readFileSync(new URL("./App.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// Reads a design token value (e.g. "--color-text") from :root in App.css.
function token(name) {
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Token ${name} not found`);
  return match[1].trim();
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("S5 Readable text and visible focus", () => {
  it.each([
    ["title on page background", "--color-text", "--color-bg"],
    ["label and input text on surface", "--color-text", "--color-surface"],
    ["button text on primary", "--color-on-primary", "--color-primary"],
    ["button text on primary hover", "--color-on-primary", "--color-primary-hover"],
    ["table rows on surface", "--color-text", "--color-surface"],
    ["table rows on alternate stripe", "--color-text", "--color-row-alt"],
    ["error text on error background", "--color-error", "--color-error-bg"],
  ])("%s has a contrast ratio of at least 4.5:1", (_name, fg, bg) => {
    expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it("focus outline colour has at least 3:1 contrast against the surface and page background", () => {
    const focus = token("--color-focus");
    expect(contrast(focus, token("--color-surface"))).toBeGreaterThanOrEqual(3);
    expect(contrast(focus, token("--color-bg"))).toBeGreaterThanOrEqual(3);
  });

  it("gives the input and the Generate button a focus outline at least 2 px thick", () => {
    const ring = token("--focus-ring");
    const width = parseFloat(ring);
    expect(ring).toMatch(/^\d+(\.\d+)?px solid var\(--color-focus\)$/);
    expect(width).toBeGreaterThanOrEqual(2);
    const rule = css.match(/\.number-input:focus-visible,\s*\.generate-button:focus-visible\s*\{([^}]*)\}/);
    expect(rule).not.toBeNull();
    expect(rule[1]).toContain("outline: var(--focus-ring)");
  });

  it("never removes the outline with outline: none or outline: 0", () => {
    expect(css).not.toMatch(/outline:\s*(none|0)\b/);
  });
});

describe("S6 Works on phone and laptop (layout rules)", () => {
  it("sets body text to at least 16 px and never uses a font size below 16 px", () => {
    const body = css.match(/body\s*\{([^}]*)\}/)[1];
    expect(body).toContain("font-size: var(--font-size-md)");
    const sizes = [...css.matchAll(/--font-size-\w+:\s*(\d+)px/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    sizes.forEach((size) => expect(size).toBeGreaterThanOrEqual(16));
    const literalSizes = [...css.matchAll(/font-size:\s*(\d+)px/g)].map((m) => Number(m[1]));
    literalSizes.forEach((size) => expect(size).toBeGreaterThanOrEqual(16));
  });

  it("uses a fluid layout that wraps and stacks the button on narrow screens", () => {
    expect(css).toMatch(/\.app\s*\{[^}]*max-width: 560px/);
    expect(css).toMatch(/\.form-row\s*\{[^}]*flex-wrap: wrap/);
    expect(css).toMatch(/\.number-input\s*\{[^}]*min-width: 0/);
    expect(css).toMatch(/@media \(max-width: 400px\)[\s\S]*\.generate-button\s*\{\s*flex: 1 1 100%/);
    expect(css).not.toMatch(/(?<!max-)width:\s*\d{3,}px/);
  });

  it("index.html sets lang, the viewport meta tag and the page title", () => {
    expect(indexHtml).toContain('<html lang="en">');
    expect(indexHtml).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    expect(indexHtml).toContain("<title>Times Table Generator</title>");
  });
});
