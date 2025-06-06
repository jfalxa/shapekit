import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const f = (path) => resolve(__dirname, `src/${path}`);

export default defineConfig({
  emptyOutDir: true,

  plugins: [
    dts({
      rollupTypes: false, //
      outDir: "dist/types",
    }),
  ],

  build: {
    minify: false,
    lib: {
      name: "ShapeKit",
      entry: {
        core: f("index.ts"),
        bounds: f("bounds/index.ts"),
        transforms: f("transforms/index.ts"),
      },
    },
  },
});
