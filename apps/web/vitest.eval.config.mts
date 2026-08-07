import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.eval.ts"],
    testTimeout: 21_600_000,
    silent: false,
  },
});
