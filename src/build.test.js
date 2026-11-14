// @vitest-environment node
import { describe, expect, it } from "vitest";
import pkg from "../package.json";
import viteConfig from "../vite.config.js";
import { readFileSync } from "node:fs";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const sources = import.meta.glob(["./*.js", "./*.jsx", "!./*.test.*"], {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("S7 Tested builds deployed to a public link", () => {
  it("keeps the npm scripts CI runs: npm test (vitest run) and npm run build (vite build)", () => {
    expect(pkg.scripts.test).toBe("vitest run");
    expect(pkg.scripts.build).toBe("vite build");
  });

  it("builds for the GitHub Pages path /Demo-E2E-SDLC/ with jsdom tests", () => {
    expect(viteConfig.base).toBe("/Demo-E2E-SDLC/");
    expect(viteConfig.test.environment).toBe("jsdom");
  });

  it("pins every dependency to an exact version", () => {
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    Object.values(all).forEach((version) => expect(version).toMatch(/^\d+\.\d+\.\d+$/));
  });

  it("app source makes no storage, cookie or network calls (NFR-04)", () => {
    const files = Object.values(sources);
    expect(files.length).toBeGreaterThan(0);
    const code = files.join("\n") + indexHtml;
    expect(code).not.toMatch(/localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest|WebSocket|sendBeacon/);
    expect(indexHtml).not.toMatch(/<script[^>]+src="https?:/);
  });
});
