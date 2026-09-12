import { describe, expect, it } from "vitest";
import { PostRenderEventBus } from "./vamp.ts";

type TestEvent = { type: "a" } | { type: "b" };

describe("PostRenderEventBus", () => {
  it("delivers queued events to all subscribers in order on flush, once", () => {
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

    expect(seen1).toEqual([a, b]);
    expect(seen2).toEqual([a, b]);

    bus.flush();
    expect(seen1).toEqual([a, b]);
    expect(seen2).toEqual([a, b]);
  });

  it("stops delivering to an unsubscribed listener", () => {
    const bus = new PostRenderEventBus<TestEvent>();
    const seen: TestEvent[] = [];
    const unsubscribe = bus.subscribe((e) => seen.push(e));

    bus.emit({ type: "a" });
    bus.flush();
    expect(seen).toHaveLength(1);

    unsubscribe();
    bus.emit({ type: "b" });
    bus.flush();
    expect(seen).toHaveLength(1);
  });
});
