import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "./test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
  await page.evaluate(() => {
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
  });
});

test("renders the about page without unlocking audio", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { startStartup } = await import("/startup.ts");
    const { FakeAudio } = await import("/test/startup-harness.ts");
    history.replaceState(null, "", "/about");
    const container = document.getElementById("app");
    if (!container) throw new Error("missing app container");
    const audio = new FakeAudio();

    startStartup({
      container,
      audio,
      window,
      storage: localStorage,
      ready: () => {},
    });

    return {
      text: container.textContent ?? "",
      hasMenu: Boolean(
        container.querySelector('summary[aria-label="open navigation menu"]'),
      ),
      hasCurrent: Boolean(
        container.querySelector('a[href="/about"][aria-current="page"]'),
      ),
      attempts: audio.attempts.length,
    };
  });

  expect(result.text).toContain("My journey with ear training");
  expect(result.hasMenu).toBe(true);
  expect(result.hasCurrent).toBe(true);
  expect(result.attempts).toBe(0);
});

test("continues from the install prompt to the app", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { startStartup } = await import("/startup.ts");
    const { DISMISS_KEY } = await import("/pwa/install.ts");
    const { FakeAudio } = await import("/test/startup-harness.ts");
    history.replaceState(null, "", "/");
    const container = document.getElementById("app");
    if (!container) throw new Error("missing app container");
    const audio = new FakeAudio();
    const readyWith: unknown[] = [];

    startStartup({
      container,
      audio,
      window,
      storage: localStorage,
      ready: (engine) => readyWith.push(engine),
    });

    const promptText = container.textContent ?? "";
    const button = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent === "continue in browser",
    );
    if (!button) throw new Error("missing button: continue in browser");
    button.click();

    return {
      promptText,
      dismissed: localStorage.getItem(DISMISS_KEY),
      readyWithAudio: readyWith.length === 1 && readyWith[0] === audio,
      attempts: audio.attempts.length,
    };
  });

  expect(result.promptText).toContain("install the ecological ear trainer");
  expect(result.dismissed).toBe("1");
  expect(result.readyWithAudio).toBe(true);
  expect(result.attempts).toBe(0);
});

test("takes an installed launch straight to the app", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { startStartup } = await import("/startup.ts");
    const { FakeAudio } = await import("/test/startup-harness.ts");
    history.replaceState(null, "", "/");
    const container = document.getElementById("app");
    if (!container) throw new Error("missing app container");
    const audio = new FakeAudio();
    const readyWith: unknown[] = [];

    startStartup({
      container,
      audio,
      window: {
        navigator: { standalone: true, userAgent: "iPhone" },
        matchMedia: () => ({ matches: true }),
      } as unknown as Window,
      storage: localStorage,
      ready: (engine) => readyWith.push(engine),
    });

    return {
      text: container.textContent ?? "",
      readyWithAudio: readyWith.length === 1 && readyWith[0] === audio,
    };
  });

  expect(result.text).not.toContain("install the ecological ear trainer");
  expect(result.readyWithAudio).toBe(true);
});
