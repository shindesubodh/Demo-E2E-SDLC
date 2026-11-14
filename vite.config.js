import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this repo at /Demo-E2E-SDLC/.
export default defineConfig({
  base: "/Demo-E2E-SDLC/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    // List every test by name in the CI log (S7).
    reporters: ["verbose"],
  },
});
