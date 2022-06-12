import {defineConfig} from "vite";
import solidPlugin from 'vite-plugin-solid'
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
    }
  },
  plugins: [solidPlugin(), tsconfigPaths()]
});
