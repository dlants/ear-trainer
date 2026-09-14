import { expect, tapElement, test } from "./fixtures.ts";

/**
 * End-to-end smoke test on real Android Chrome. Its job is the audio unlock
 * gate: the emulator does not enforce the autoplay policy, so this cannot prove
 * the gate is correct — it only catches an outright hang or crash on the one
 * flow that has broken on-device before.
 */
test("start practicing unlocks audio and reaches a trial", async ({
  androidPage: page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto("/");
  await page.waitForSelector("button");
  await tapElement(page, "start practicing");
  await expect
    .poll(
      () =>
        page.evaluate(`document.querySelector("button")?.textContent?.trim()`),
      { timeout: 30_000 },
    )
    .not.toBe("starting…");
  expect(failures).toEqual([]);
});
