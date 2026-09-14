import { execFileSync } from "node:child_process";
import { test as base } from "@playwright/test";
import { _android as android, type Page } from "playwright";

const ADB =
  process.env.ADB ??
  "/opt/homebrew/share/android-commandlinetools/platform-tools/adb";

/**
 * A page in the device's real Chrome. `adb reverse` maps the device's
 * localhost to the host's dev server so `baseURL` works unchanged.
 */
export const test = base.extend<{ androidPage: Page }>({
  androidPage: async ({ baseURL }, use) => {
    const port = new URL(baseURL ?? "http://localhost:5174").port;
    execFileSync(ADB, ["reverse", `tcp:${port}`, `tcp:${port}`]);
    const [device] = await android.devices();
    if (!device) throw new Error("no adb device: boot the emulator first");
    const context = await device.launchBrowser({ baseURL, hasTouch: true });
    const page = await context.newPage();
    await use(page);
    await context.close();
    await device.close();
  },
});

export { expect } from "@playwright/test";

/**
 * Real OS-level touch. `page.tap()` goes through CDP, which is synthesized
 * input and behaves differently from a finger; `adb shell input tap` is the
 * only thing that exercises the device's real input pipeline.
 */
export async function tapElement(page: Page, label: string): Promise<void> {
  // Chrome's toolbar sits above the viewport, and the device reports no offset
  // for it, so its height is measured once against a known tap.
  const TOOLBAR_CSS_PX = 104;
  const box = (await page.evaluate(`(() => {
    const button = [...document.querySelectorAll("button")]
      .find((el) => el.textContent?.includes(${JSON.stringify(label)}));
    if (!button) throw new Error("no button labelled " + ${JSON.stringify(label)});
    button.scrollIntoView({ block: "center" });
    const rect = button.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, dpr: devicePixelRatio };
  })()`)) as { x: number; y: number; dpr: number };
  execFileSync(ADB, [
    "shell",
    "input",
    "tap",
    String(Math.round(box.x * box.dpr)),
    String(Math.round((box.y + TOOLBAR_CSS_PX) * box.dpr)),
  ]);
}
