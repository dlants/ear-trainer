import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "../test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test("emits PRESS with its stable id", async ({ page }) => {
  const dispatched = await page.evaluate(async () => {
    const { PlayButtonView } = await import("/views/play-button.ts");
    const container = document.createElement("div");
    document.body.append(container);
    const calls: unknown[] = [];
    new PlayButtonView(container, (msg) => calls.push(msg), {
      id: "trial:context",
      label: "key",
      ariaLabel: "play key",
      icon: "key",
      variant: "trial",
      visible: true,
      playing: false,
      durationMs: undefined,
    });
    container.querySelector("button")?.click();
    return calls;
  });
  expect(dispatched).toEqual([{ type: "PRESS", id: "trial:context" }]);
});

test("binds active duration and accessibility state", async ({ page }) => {
  const snapshots = await page.evaluate(async () => {
    const { PlayButtonView } = await import("/views/play-button.ts");
    const container = document.createElement("div");
    document.body.append(container);
    const base = {
      id: "trial:context" as const,
      label: "key",
      ariaLabel: "play key",
      icon: "key" as const,
      variant: "trial" as const,
      visible: true,
      playing: false,
      durationMs: undefined as number | undefined,
    };
    const view = new PlayButtonView(container, () => {}, base);
    const button = container.querySelector("button");
    const snapshot = () => ({
      className: button?.className ?? "",
      duration: button?.style.getPropertyValue("--play-duration") ?? "",
      pressed: button?.getAttribute("aria-pressed"),
      busy: button?.hasAttribute("aria-busy"),
    });
    view.sync({ ...base, playing: true, durationMs: 1250 });
    const playing = snapshot();
    view.sync(base);
    return { playing, idle: snapshot() };
  });
  expect(snapshots.playing.className).toContain("play-button-playing");
  expect(snapshots.playing.duration).toBe("1250ms");
  expect(snapshots.playing.pressed).toBe("true");
  expect(snapshots.playing.busy).toBe(true);
  expect(snapshots.idle.className).not.toContain("play-button-playing");
  expect(snapshots.idle.duration).toBe("");
  expect(snapshots.idle.pressed).toBe("false");
  expect(snapshots.idle.busy).toBe(false);
});

test("mounts a reduced-motion active treatment", async ({ page }) => {
  const styles = await page.evaluate(async () => {
    await import("/views/play-button.ts");
    return [...document.head.querySelectorAll("style")]
      .map((element) => element.textContent)
      .join("\n");
  });
  expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  expect(styles).toContain("background: var(--color-playback-active)");
});
