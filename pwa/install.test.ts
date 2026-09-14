import { expect, test } from "@playwright/test";
import { DISMISS_KEY, installEnv, shouldShowInstall } from "./install.ts";

const env = (over: Partial<Parameters<typeof shouldShowInstall>[0]> = {}) => ({
  standalone: false,
  ios: true,
  dismissed: false,
  ...over,
});

test.describe("shouldShowInstall", () => {
  test("shows on a first run in the browser", () => {
    expect(shouldShowInstall(env())).toBe(true);
  });

  test("never shows once launched from the home screen", () => {
    expect(shouldShowInstall(env({ standalone: true, dismissed: false }))).toBe(
      false,
    );
  });

  test("stays dismissed across runs", () => {
    expect(shouldShowInstall(env({ dismissed: true }))).toBe(false);
  });
});

test.describe("installEnv", () => {
  test("reads standalone, platform and the dismissed flag", () => {
    const storage = new Map<string, string>([[DISMISS_KEY, "1"]]);
    const win = {
      navigator: { standalone: true, userAgent: "iPhone" },
      matchMedia: () => ({ matches: false }),
    } as unknown as Window;
    expect(
      installEnv(win, {
        getItem: (k: string) => storage.get(k) ?? null,
      } as Storage),
    ).toEqual({ standalone: true, ios: true, dismissed: true });
  });
});
