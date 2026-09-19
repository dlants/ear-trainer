import { expect, test } from "@playwright/test";
import type { Score } from "../music/melody.ts";
import { fakeTimers } from "../test/support.ts";
import {
  type Instrument,
  type InstrumentStartEvent,
  SamplerAudioEngine,
  SCORE_ARTICULATION_GAP_SECONDS,
  scheduleScore,
} from "./engine.ts";

const phrase: Score = {
  context: "major-cadence",
  harmony: [],
  tempoBpm: 120,
  durationTicks: 168,
  measures: [
    { startTicks: 0, endTicks: 24, beatDurationsTicks: [24] },
    { startTicks: 24, endTicks: 120, beatDurationsTicks: [24, 24, 24, 24] },
    { startTicks: 120, endTicks: 168, beatDurationsTicks: [24, 24] },
  ],
  voices: [
    {
      id: "melody",
      events: [
        {
          notes: [{ degree: 1, alteration: 0, octave: 0 }],
          onsetTicks: 0,
          durationTicks: 12,
        },
        {
          notes: [
            { degree: 3, alteration: 0, octave: 0 },
            { degree: 5, alteration: 0, octave: 0 },
          ],
          onsetTicks: 12,
          durationTicks: 12,
        },
        {
          notes: [{ degree: 2, alteration: 0, octave: 0 }],
          onsetTicks: 48,
          durationTicks: 48,
        },
        {
          notes: [{ degree: 1, alteration: 0, octave: 1 }],
          onsetTicks: 120,
          durationTicks: 24,
        },
      ],
    },
    {
      id: "bass",
      events: [
        {
          notes: [{ degree: 1, alteration: 0, octave: -1 }],
          onsetTicks: 24,
          durationTicks: 72,
        },
        {
          notes: [{ degree: 5, alteration: 0, octave: -1 }],
          onsetTicks: 120,
          durationTicks: 48,
        },
      ],
    },
  ],
};

class FakeInstrument implements Instrument {
  readonly started: InstrumentStartEvent[] = [];
  readonly stops: number[] = [];

  start(event: InstrumentStartEvent): () => void {
    this.started.push(event);
    return () => this.stops.push(event.note);
  }
}

test.describe("score scheduling", () => {
  test("maps concrete score ticks across chords, gaps, measures, and voices", () => {
    const schedule = scheduleScore(phrase, 60);

    expect(schedule.durationSeconds).toBe(3.5);
    expect(
      schedule.notes.map(({ note, time, duration }) => [note, time, duration]),
    ).toEqual([
      [60, 0, 0.25 - SCORE_ARTICULATION_GAP_SECONDS],
      [64, 0.25, 0.25 - SCORE_ARTICULATION_GAP_SECONDS],
      [67, 0.25, 0.25 - SCORE_ARTICULATION_GAP_SECONDS],
      [62, 1, 1 - SCORE_ARTICULATION_GAP_SECONDS],
      [72, 2.5, 0.5 - SCORE_ARTICULATION_GAP_SECONDS],
      [48, 0.5, 1.5 - SCORE_ARTICULATION_GAP_SECONDS],
      [55, 2.5, 1 - SCORE_ARTICULATION_GAP_SECONDS],
    ]);
    expect(schedule.cues).toEqual([
      { eventIndex: 0, onsetMs: 0, endMs: 220 },
      { eventIndex: 1, onsetMs: 250, endMs: 470 },
      { eventIndex: 2, onsetMs: 1000, endMs: 1970 },
      { eventIndex: 3, onsetMs: 2500, endMs: 2970 },
    ]);
  });

  test("rebases ranged playback while preserving source melody cue indexes", () => {
    const schedule = scheduleScore(phrase, 60, {
      startTicks: 48,
      endTicks: 144,
    });

    expect(schedule.durationSeconds).toBe(2);
    expect(
      schedule.notes.map(({ note, time, duration }) => [note, time, duration]),
    ).toEqual([
      [62, 0, 1 - SCORE_ARTICULATION_GAP_SECONDS],
      [72, 1.5, 0.5 - SCORE_ARTICULATION_GAP_SECONDS],
      [55, 1.5, 0.5 - SCORE_ARTICULATION_GAP_SECONDS],
    ]);
    expect(schedule.cues).toEqual([
      { eventIndex: 2, onsetMs: 0, endMs: 970 },
      { eventIndex: 3, onsetMs: 1500, endMs: 1970 },
    ]);
  });

  test("plays from the shared zero-based timeline through trailing silence", async () => {
    const instrument = new FakeInstrument();
    const engine = new SamplerAudioEngine(async () => ({
      instrument,
      currentTime: () => 10,
      drone: { start() {}, stop() {} },
    }));
    await engine.unlock();
    const timers = fakeTimers();
    try {
      const handle = engine.playScore(phrase, 60);
      let end: string | undefined;
      void handle.ended.then((result) => {
        end = result;
      });

      expect(handle.durationMs).toBe(3550);
      expect(handle.cues[0]).toEqual({
        eventIndex: 0,
        onsetMs: 50,
        endMs: 270,
      });
      expect(instrument.started[0]?.time).toBe(10.05);
      expect(instrument.started[3]?.time).toBe(11.05);
      expect(instrument.started[5]?.time).toBe(10.55);
      await timers.advance(3549);
      expect(end).toBeUndefined();
      await timers.advance(1);
      expect(end).toBe("completed");
    } finally {
      timers.restore();
    }
  });
});
