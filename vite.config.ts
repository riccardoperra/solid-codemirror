import { defineConfig } from "vite";
import solid from "solid-start";
import * as path from "path";
import * as url from "url";
import tsconfigPaths from "vite-tsconfig-paths";
import ts from "rollup-plugin-ts";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "src/index.ts"),
      name: "solid-codemirror",
      fileName: (format: string) => `solid-codemirror.${format}.js`,
      formats: [
        "es",
        "umd",
        "cjs"
      ]
    },
    rollupOptions: {
      external: [
        "solid-js",
        'solid-js/web',
        'solid-js/store',
        '@codemirror/state',
        '@codemirror/view',
        '@codemirror/commands',
        '@codemirror/basic-setup',
      ],
      output: {
        globals: {
          "solid-js": "SolidJS"
        }
      }
    }
  },
  plugins: [solid(), tsconfigPaths(), ts({ transpileOnly: true })]
});
