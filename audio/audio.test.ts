import { expect, test } from "@playwright/test";
import { makePattern } from "../music/note.ts";
import { fakeTimers } from "../test/support.ts";
import {
  CADENCE_TIMINGS,
  type Instrument,
  type InstrumentStartEvent,
  PATTERN_TIMING,
  SamplerAudioEngine,
  scheduleDuration,
  scheduleGroups,
} from "./engine.ts";
import {
  centsOff,
  detectPitch,
  frequencyToMidi,
  meterLevel,
  peakLevel,
  SPECTROGRAM_MAX_MIDI,
  SPECTROGRAM_MIN_MIDI,
  spectrumLevels,
} from "./mic-pitch.ts";

function n(degree: number, octave = 0) {
  return {
    degree: degree as 1,
    alteration: 0 as const,
    octave,
  };
}

class FakeInstrument implements Instrument {
  readonly started: InstrumentStartEvent[] = [];
  readonly calls: string[] = [];
  start(event: InstrumentStartEvent) {
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

function tone(hz: number, sampleRate: number, length: number): Float32Array {
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const phase = (2 * Math.PI * hz * i) / sampleRate;
    // A vowel-like timbre: partials stronger than the fundamental are the case
    // naive autocorrelation gets wrong.
    samples[i] =
      0.3 * Math.sin(phase) +
      0.5 * Math.sin(2 * phase) +
      0.3 * Math.sin(3 * phase);
  }
  return samples;
}

test.describe("pitch detection", () => {
  test("finds the fundamental of a sung vowel", () => {
    const { pitch } = detectPitch(tone(196, 44100, 4096), 44100);
    expect(pitch).toBeDefined();
    expect(Math.round(frequencyToMidi(pitch?.hz ?? 0))).toBe(55);
  });
  test("reports no pitch for silence", () => {
    expect(detectPitch(new Float32Array(4096), 44100)).toEqual({
      level: 0,
      meter: 0,
      pitch: undefined,
      spectrum: [],
    });
  });
  test("auto-ranges the meter against the loudest recent window", () => {
    const peak = peakLevel(peakLevel(0, 0.04), 0.01);
    expect(meterLevel(0.04, peak)).toBeCloseTo(1);
    expect(meterLevel(0.01, peak)).toBeCloseTo(0.255, 2);
    expect(meterLevel(0.001, peak)).toBe(0);
  });
  test("measures how sharp or flat the reading is", () => {
    expect(centsOff(frequencyToMidi(440))).toBe(0);
    expect(centsOff(frequencyToMidi(448))).toBe(31);
  });
  test("maps FFT energy onto semitone rows", () => {
    const fftSize = 4096;
    const sampleRate = 44100;
    const decibels = new Float32Array(fftSize / 2).fill(-100);
    decibels[Math.round(440 / (sampleRate / fftSize))] = -30;
    const levels = spectrumLevels(decibels, sampleRate, fftSize);
    expect(levels).toHaveLength(
      SPECTROGRAM_MAX_MIDI - SPECTROGRAM_MIN_MIDI + 1,
    );
    expect(levels[69 - SPECTROGRAM_MIN_MIDI]).toBe(1);
  });
});
test.describe("scheduleGroups", () => {
  test("gives simultaneous notes a shared onset and spaces groups evenly", () => {
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

test.describe("playback", () => {
  test("returns an inert, already-completed handle before unlock", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);

    const handle = engine.playContext("major-cadence", 60, "medium");

    expect(engine.unlocked).toBe(false);
    expect(handle.durationMs).toBe(0);
    expect(await handle.ended).toBe("completed");
    handle.cancel();
    expect(inst.calls).toEqual([]);
  });

  test("reports the scheduling lead plus note duration and completes on time", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst, () => 20);
    await engine.unlock();
    const timers = fakeTimers();
    try {
      const handle = engine.playNotes([62]);
      let end: string | undefined;
      void handle.ended.then((result) => {
        end = result;
      });

      expect(handle.durationMs).toBe(800);
      expect(inst.started).toEqual([
        {
          note: 62,
          time: 20.05,
          velocity: 100,
          ampRelease: 0,
          stopId: 0,
        },
      ]);
      await timers.advance(799);
      expect(end).toBeUndefined();
      await timers.advance(1);
      expect(end).toBe("completed");
      expect(inst.calls).toEqual(["start:62", "stop:62"]);
    } finally {
      timers.restore();
    }
  });

  test("reports a pattern duration through the final scheduled release", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst, () => 100);
    await engine.unlock();
    const timers = fakeTimers();
    try {
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
          velocity: 100,
          ampRelease: 0,
          stopId: 0,
        },
        {
          note: 64,
          time: 100.05 + PATTERN_TIMING.spacing,
          velocity: 100,
          ampRelease: 0,
          stopId: 1,
        },
        {
          note: 67,
          time: 100.05 + PATTERN_TIMING.spacing,
          velocity: 100,
          ampRelease: 0,
          stopId: 2,
        },
      ]);
      await timers.runAll();
      expect(await handle.ended).toBe("completed");
    } finally {
      timers.restore();
    }
  });

  test("uses the selected cadence speed", async () => {
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
    expect(inst.started[3]).not.toHaveProperty("duration");
  });

  test("emphasizes the bass note in each context chord", async () => {
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

  test("cancels explicitly once and stops only its own notes", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    await engine.unlock();
    const handle = engine.playNotes([60]);

    handle.cancel();
    handle.cancel();

    expect(await handle.ended).toBe("cancelled");
    expect(inst.calls.filter((call) => call === "stop:60")).toHaveLength(1);
    const timers = fakeTimers();
    try {
      await timers.runAll();
    } finally {
      timers.restore();
    }
    expect(await handle.ended).toBe("cancelled");
  });

  test("cancels the previous stream before starting the next", async () => {
    const inst = new FakeInstrument();
    const engine = engineWith(inst);
    await engine.unlock();
    const first = engine.playContext("major-cadence", 60, "medium");
    inst.calls.length = 0;

    const second = engine.playPattern(
      makePattern("major-cadence", [{ notes: [n(5)] }]),
      60,
    );

    expect(await first.ended).toBe("cancelled");
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
