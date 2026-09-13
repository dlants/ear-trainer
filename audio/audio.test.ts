import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makePattern } from "../music/note.ts";
import {
  CADENCE_TIMINGS,
  type Instrument,
  PATTERN_TIMING,
  SamplerAudioEngine,
  type ScheduledNote,
  scheduleDuration,
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
  readonly started: ScheduledNote[] = [];
  readonly calls: string[] = [];
  start(event: ScheduledNote) {
    this.started.push(event);
    this.calls.push(`start:${event.note}`);
    return () => this.calls.push(`stop:${event.note}`);
  }
}

function engineWith(instrument: Instrument, now = () => 0) {
  return new SamplerAudioEngine(async () => ({
    instrument,
    currentTime: now,
    drone: { start() {}, stop() {} },
  }));
}

describe("scheduleGroups", () => {
  it("gives simultaneous notes a shared onset and spaces groups evenly", () => {
    const scheduled = scheduleGroups([[60, 64, 67], [69], [71]], 10, {
      spacing: 0.5,
      duration: 0.4,
    });
    expect(
      scheduled.map((s) => [s.note, s.time, s.duration, s.velocity]),
    ).toEqual([
      [60, 10, 0.4, 100],
      [64, 10, 0.4, 100],
      [67, 10, 0.4, 100],
      [69, 10.5, 0.4, 100],
      [71, 11, 0.4, 100],
    ]);
  });
});

describe("playback", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns an inert, already-completed handle before unlock", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);

    const handle = engine.playContext("major-cadence", 60, "medium");

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
    expect(inst.started).toEqual([
      { note: 62, time: 20.05, duration: 0.75, velocity: 100 },
    ]);
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
      {
        note: 60,
        time: 100.05,
        duration: PATTERN_TIMING.duration,
        velocity: 100,
      },
      {
        note: 64,
        time: 100.05 + PATTERN_TIMING.spacing,
        duration: PATTERN_TIMING.duration,
        velocity: 100,
      },
      {
        note: 67,
        time: 100.05 + PATTERN_TIMING.spacing,
        duration: PATTERN_TIMING.duration,
        velocity: 100,
      },
    ]);
    await vi.advanceTimersByTimeAsync(handle.durationMs);
    await expect(handle.ended).resolves.toBe("completed");
  });

  it("uses the selected cadence speed", async () => {
    expect(CADENCE_TIMINGS.slow).toEqual({ spacing: 0.45, duration: 0.65 });
    expect(CADENCE_TIMINGS.medium).toEqual({ spacing: 0.2, duration: 0.4 });
    expect(CADENCE_TIMINGS.fast).toEqual({ spacing: 0.075, duration: 0.275 });
    const cadence = [[60], [53], [55], [60]];
    expect(scheduleDuration(cadence, CADENCE_TIMINGS.slow)).toBe(2);
    expect(scheduleDuration(cadence, CADENCE_TIMINGS.medium)).toBe(1);
    expect(scheduleDuration(cadence, CADENCE_TIMINGS.fast)).toBe(0.5);
    const inst = new FakeInstrument();
    const engine = engineWith(inst, () => 10);
    await engine.unlock();

    engine.playContext("major-cadence", 60, "fast");

    expect(inst.started[3]?.time).toBe(10.05 + CADENCE_TIMINGS.fast.spacing);
    expect(inst.started[3]?.duration).toBe(CADENCE_TIMINGS.fast.duration);
  });

  it("emphasizes the bass note in each context chord", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    await engine.unlock();

    engine.playContext("major-cadence", 60, "medium");

    expect(inst.started.map(({ note, velocity }) => [note, velocity])).toEqual([
      [48, 120],
      [64, 80],
      [53, 120],
      [57, 80],
      [55, 120],
      [59, 80],
      [48, 120],
      [60, 80],
    ]);
  });

  it("cancels explicitly once and stops only its own notes", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    await engine.unlock();
    const handle = engine.playNote(60);

    handle.cancel();
    handle.cancel();

    await expect(handle.ended).resolves.toBe("cancelled");
    expect(inst.calls.filter((call) => call === "stop:60")).toHaveLength(1);
    await vi.runAllTimersAsync();
    await expect(handle.ended).resolves.toBe("cancelled");
  });

  it("cancels the previous stream before starting the next", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    await engine.unlock();
    const first = engine.playContext("major-cadence", 60, "medium");
    inst.calls.length = 0;

    const second = engine.playPattern(
      makePattern("major-cadence", [{ notes: [n(5)] }]),
      60,
    );

    await expect(first.ended).resolves.toBe("cancelled");
    expect(inst.calls.slice(0, 8)).toEqual([
      "stop:48",
      "stop:64",
      "stop:53",
      "stop:57",
      "stop:55",
      "stop:59",
      "stop:48",
      "stop:60",
    ]);
    expect(inst.calls[8]).toBe("start:67");
    second.cancel();
  });
});
