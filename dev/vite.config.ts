import { defineConfig } from 'vite';
import solidPlugin from '@solidjs/vite-plugin';

export default defineConfig({
  plugins: [solidPlugin()],
  optimizeDeps: {
    // Add both @codemirror/state and @codemirror/view to included deps to optimize
    include: ['@codemirror/state', '@codemirror/view'],
  },
});
