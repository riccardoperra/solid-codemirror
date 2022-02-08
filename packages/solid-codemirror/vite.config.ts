import {defineConfig} from "vite";
import solid from "solid-start";
import * as path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/public-api.ts'),
      fileName: () => `solid-codemirror.mjs`,
      formats: ["es"]
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
          "solid-js": "SolidJS",
          "solid-js/web": "SolidJs/web",
          "solid-js/store": "SolidJs/store",
          '@codemirror/state': "@codemirror/state",
          '@codemirror/view': "@codemirror/view",
          '@codemirror/commands': "@codemirror/commands'",
          '@codemirror/basic-setup': "@codemirror/basic-setup"
        }
      }
    }
  },
  plugins: [solid(), tsconfigPaths()]
});
