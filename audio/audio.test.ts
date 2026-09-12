import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makePattern } from "../music/note.ts";
import {
  type Instrument,
  PATTERN_TIMING,
  SamplerAudioEngine,
  scheduleGroups,
} from "./engine.ts";

function n(degree: number, octave = 0) {
  return {
    degree: degree as 1,
    alteration: 0 as const,
    octave,
  };
}

class FakeInstrument implements Instrument {
  readonly started: { note: number; time: number; duration: number }[] = [];
  readonly calls: string[] = [];
  start(event: { note: number; time: number; duration: number }) {
    this.started.push(event);
    this.calls.push(`start:${event.note}`);
  }
  stop() {
    this.calls.push("stop");
  }
}

function engineWith(instrument: Instrument, now = () => 0) {
  return new SamplerAudioEngine(async () => ({
    instrument,
    currentTime: now,
  }));
}

describe("scheduleGroups", () => {
  it("gives simultaneous notes a shared onset and spaces groups evenly", () => {
    const scheduled = scheduleGroups([[60, 64, 67], [69], [71]], 10, {
      spacing: 0.5,
      duration: 0.4,
    });
    expect(scheduled.map((s) => [s.note, s.time, s.duration])).toEqual([
      [60, 10, 0.4],
      [64, 10, 0.4],
      [67, 10, 0.4],
      [69, 10.5, 0.4],
      [71, 11, 0.4],
    ]);
  });
});

describe("playback", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns an inert, already-completed handle before unlock", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);

    const handle = engine.playContext("major-cadence", 60);

    expect(engine.unlocked).toBe(false);
    expect(handle.durationMs).toBe(0);
    await expect(handle.ended).resolves.toBe("completed");
    handle.cancel();
    expect(inst.calls).toEqual([]);
  });

  it("reports the scheduling lead plus note duration and completes on time", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst, () => 20);
    await engine.unlock();

    const handle = engine.playNote(62);
    let end: string | undefined;
    void handle.ended.then((result) => {
      end = result;
    });

    expect(handle.durationMs).toBe(800);
    expect(inst.started).toEqual([{ note: 62, time: 20.05, duration: 0.75 }]);
    await vi.advanceTimersByTimeAsync(799);
    expect(end).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(end).toBe("completed");
    expect(inst.calls).not.toContain("stop");
  });

  it("reports a pattern duration through the final scheduled release", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst, () => 100);
    await engine.unlock();

    const handle = engine.playPattern(
      makePattern("major-cadence", [
        { notes: [n(1)] },
        { notes: [n(3), n(5)] },
      ]),
      60,
    );

    expect(handle.durationMs).toBe(1100);
    expect(inst.started).toEqual([
      { note: 60, time: 100.05, duration: PATTERN_TIMING.duration },
      {
        note: 64,
        time: 100.05 + PATTERN_TIMING.spacing,
        duration: PATTERN_TIMING.duration,
      },
      {
        note: 67,
        time: 100.05 + PATTERN_TIMING.spacing,
        duration: PATTERN_TIMING.duration,
      },
    ]);
    await vi.advanceTimersByTimeAsync(handle.durationMs);
    await expect(handle.ended).resolves.toBe("completed");
  });

  it("cancels explicitly once and stops the instrument", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    await engine.unlock();
    const handle = engine.playNote(60);

    handle.cancel();
    handle.cancel();

    await expect(handle.ended).resolves.toBe("cancelled");
    expect(inst.calls.filter((call) => call === "stop")).toHaveLength(1);
    await vi.runAllTimersAsync();
    await expect(handle.ended).resolves.toBe("cancelled");
  });

  it("cancels the previous stream before starting the next", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    await engine.unlock();
    const first = engine.playContext("major-cadence", 60);
    inst.calls.length = 0;

    const second = engine.playPattern(
      makePattern("major-cadence", [{ notes: [n(5)] }]),
      60,
    );

    await expect(first.ended).resolves.toBe("cancelled");
    expect(inst.calls[0]).toBe("stop");
    expect(inst.calls[1]).toBe("start:67");
    second.cancel();
  });
});
