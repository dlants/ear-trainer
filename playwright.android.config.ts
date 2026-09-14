import { defineConfig } from "@playwright/test";

const port = Number(process.env.VITE_PORT ?? 5174);

/**
 * Real Android Chrome over adb. Desktop Chromium — even with touch emulation —
 * grants user activation on `pointerdown` and ignores the autoplay policy, so
 * activation-gated behavior (audio unlock, mic permission) can only be verified
 * here. Requires a booted emulator or attached device; see docs/testing.md.
 */
export default defineConfig({
  testDir: "./android",
  testMatch: "**/*.android.ts",
  // The emulator reaches the host dev server through `adb reverse`, so the
  // device-side origin is the same localhost URL.
  use: { baseURL: `http://localhost:${port}` },
  workers: 1,
  timeout: 60_000,
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    env: { VITE_PORT: String(port) },
  },
});
