import { describe, expect, it } from "vitest";
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
  it("does nothing before unlock", () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    expect(engine.unlocked).toBe(false);
    engine.playContext("major-cadence", 60);
    expect(inst.calls).toEqual([]);
  });

  it("stops the previous stream before starting the next", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    await engine.unlock();
    engine.playContext("major-cadence", 60);
    inst.calls.length = 0;
    engine.playPattern(makePattern("major-cadence", [{ notes: [n(5)] }]), 60);
    expect(inst.calls[0]).toBe("stop");
  });

  it("schedules a pattern at absolute times from the audio clock", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst, () => 100);
    await engine.unlock();
    engine.playPattern(
      makePattern("major-cadence", [
        { notes: [n(1)] },
        { notes: [n(3), n(5)] },
      ]),
      60,
    );
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
  });
});
