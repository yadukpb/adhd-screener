import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @adhd-screener/core ships TS source with no build step; alias
      // straight to its entry so Vite transpiles it like any other source
      // file instead of trying to pre-bundle it as a package.
      "@adhd-screener/core": fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
