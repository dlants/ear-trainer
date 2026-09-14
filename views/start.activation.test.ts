import { expect, test } from "@playwright/test";

/**
 * WebKit follows the touch activation boundary that exposed the Android bug:
 * touch pointerdown alone does not unlock Web Audio; the completed tap does.
 *
 * The modal holds Playwright's trusted touch input between pointerdown and
 * pointerup long enough to observe the context without another event granting
 * activation. Reading through page.evaluate would itself carry automation's
 * user-gesture flag and invalidate the observation, so results use console.
 */
test("touch pointerdown does not activate an AudioContext", async ({
  page,
}) => {
  const reports: string[] = [];
  page.on("console", (message) => reports.push(message.text()));

  await page.addInitScript(() => {
    let pointerdownContext: AudioContext | undefined;

    addEventListener(
      "pointerdown",
      () => {
        pointerdownContext = new AudioContext();
        void pointerdownContext.resume();
        alert("hold before pointerup");
        console.log(`pointerdown:${pointerdownContext.state}`);
      },
      true,
    );

    addEventListener(
      "click",
      () => {
        console.log(`pointerdown-at-click:${pointerdownContext?.state}`);
        const clickContext = new AudioContext();
        void clickContext
          .resume()
          .then(() => console.log(`click:${clickContext.state}`));
      },
      true,
    );
  });

  await page.route("**/test/audio-activation.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><meta name="viewport" content="width=device-width"><button type="button" style="width:200px;height:100px">activate</button>',
    }),
  );
  await page.goto("/test/audio-activation.html");
  const button = page.getByRole("button", { name: "activate" });
  const box = await button.boundingBox();
  if (!box) throw new Error("activation test button has no bounding box");
  const dialogPromise = page.waitForEvent("dialog");
  const tapPromise = page.touchscreen.tap(
    box.x + box.width / 2,
    box.y + box.height / 2,
  );
  const dialog = await dialogPromise;
  await new Promise((resolve) => setTimeout(resolve, 250));
  await dialog.dismiss();
  await tapPromise;

  await expect.poll(() => reports).toContain("pointerdown:suspended");
  await expect.poll(() => reports).toContain("pointerdown-at-click:suspended");
  await expect.poll(() => reports).toContain("click:running");
});

test("the start view defers audio unlock until click", async ({ page }) => {
  const reports: string[] = [];
  page.on("console", (message) => reports.push(message.text()));

  await page.addInitScript(() => {
    let context: AudioContext | undefined;
    const RealAudioContext = AudioContext;
    window.AudioContext = new Proxy(RealAudioContext, {
      construct(target, args: ConstructorParameters<typeof AudioContext>) {
        context = new target(...args);
        return context;
      },
    });

    addEventListener("pointerdown", () => {
      alert("hold before pointerup");
      console.log(`start-pointerdown:${context?.state ?? "none"}`);
    });
  });

  await page.route("**/test/start-activation.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><meta name="viewport" content="width=device-width"><script type="module" src="/test/start-activation-harness.ts"></script>',
    }),
  );
  await page.goto("/test/start-activation.html");
  const button = page.getByRole("button", { name: "start practicing" });
  const box = await button.boundingBox();
  if (!box) throw new Error("start button has no bounding box");
  const dialogPromise = page.waitForEvent("dialog");
  const tapPromise = page.touchscreen.tap(
    box.x + box.width / 2,
    box.y + box.height / 2,
  );
  const dialog = await dialogPromise;
  await new Promise((resolve) => setTimeout(resolve, 250));
  await dialog.dismiss();
  await tapPromise;

  expect(reports).toContain("start-pointerdown:none");
  await expect.poll(() => reports).toContain("unlock:running");
});
