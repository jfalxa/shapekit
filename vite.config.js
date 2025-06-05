import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],

  build: {
    lib: {
      name: "Brush",
      fileName: "brush",
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["umd", "es"],
    },
  },
});
