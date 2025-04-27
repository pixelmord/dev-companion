import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    include: ['tests/**/*.test.ts'],
    setupFiles: [],
  },
  plugins: [tsconfigPaths()],
});