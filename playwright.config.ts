import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.VITE_PORT ?? 5174);

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.test.ts",
  testIgnore: ["node_modules/**", "dist/**"],
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      testIgnore: "**/*.activation.test.ts",
      use: {
        ...devices["Pixel 7"],
        baseURL: `http://localhost:${port}`,
      },
    },
    {
      name: "webkit-activation",
      testMatch: "**/*.activation.test.ts",
      use: {
        ...devices["iPhone 13"],
        baseURL: `http://localhost:${port}`,
        serviceWorkers: "block",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    env: { VITE_PORT: String(port) },
  },
});
