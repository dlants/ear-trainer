import { expect, test } from "@playwright/test";
import { HARNESS_URL } from "./test/support.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(HARNESS_URL);
});

test("Binder drives canvas rendering from state", async ({ page }) => {
  const seen = await page.evaluate(async () => {
    const { Binder, ref } = await import("/vamp.ts");
    const container = document.createElement("div");
    const canvasRef = ref("canvas");
    container.innerHTML = `<canvas data-ref="${canvasRef}"></canvas>`;
    const binder = new Binder(container, 1);
    const values: number[] = [];
    binder.bindCanvas(canvasRef, (_context, _canvas, state) => {
      values.push(state);
    });
    binder.sync(2);
    return values;
  });

  expect(seen).toEqual([1, 2]);
});

test.describe("PostRenderEventBus", () => {
  test("delivers queued events to all subscribers in order on flush, once", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const { PostRenderEventBus } = await import("/vamp.ts");
      type TestEvent = { type: "a" } | { type: "b" };
      const bus = new PostRenderEventBus<TestEvent>();
      const seen1: TestEvent[] = [];
      const seen2: TestEvent[] = [];
      bus.subscribe((e) => seen1.push(e));
      bus.subscribe((e) => seen2.push(e));

      const a: TestEvent = { type: "a" };
      const b: TestEvent = { type: "b" };
      bus.emit(a);
      bus.emit(b);
      bus.flush();

      const afterFirstFlush = { seen1: [...seen1], seen2: [...seen2] };

      bus.flush();
      return {
        afterFirstFlush,
        afterSecondFlush: { seen1: [...seen1], seen2: [...seen2] },
      };
    });

    const expected = [{ type: "a" }, { type: "b" }];
    expect(result.afterFirstFlush.seen1).toEqual(expected);
    expect(result.afterFirstFlush.seen2).toEqual(expected);
    expect(result.afterSecondFlush.seen1).toEqual(expected);
    expect(result.afterSecondFlush.seen2).toEqual(expected);
  });

  test("stops delivering to an unsubscribed listener", async ({ page }) => {
    const counts = await page.evaluate(async () => {
      const { PostRenderEventBus } = await import("/vamp.ts");
      type TestEvent = { type: "a" } | { type: "b" };
      const bus = new PostRenderEventBus<TestEvent>();
      const seen: TestEvent[] = [];
      const unsubscribe = bus.subscribe((e) => seen.push(e));

      bus.emit({ type: "a" });
      bus.flush();
      const afterFirst = seen.length;

      unsubscribe();
      bus.emit({ type: "b" });
      bus.flush();
      return { afterFirst, afterUnsubscribe: seen.length };
    });

    expect(counts.afterFirst).toBe(1);
    expect(counts.afterUnsubscribe).toBe(1);
  });
});
