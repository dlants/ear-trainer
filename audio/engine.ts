import { Soundfont } from "smplr";
import type { Context, Pattern } from "../music/note.ts";
import { cadenceMidi, type Midi, noteToMidi } from "../music/pitch.ts";

export type ScheduledNote = { note: Midi; time: number; duration: number };

/** Seconds. `spacing` is onset-to-onset; `duration` is how long each note rings. */
export type Timing = { spacing: number; duration: number };

export const CADENCE_TIMING: Timing = { spacing: 0.6, duration: 0.75 };
export const PATTERN_TIMING: Timing = { spacing: 0.5, duration: 0.55 };

/**
 * Groups are simultaneity groups in time order: every note in a group shares an
 * onset. Times are absolute AudioContext times.
 */
export function scheduleGroups(
  groups: Midi[][],
  startTime: number,
  timing: Timing,
): ScheduledNote[] {
  return groups.flatMap((group, i) =>
    group.map((note) => ({
      note,
      time: startTime + i * timing.spacing,
      duration: timing.duration,
    })),
  );
}

export function scheduleDuration(groups: Midi[][], timing: Timing): number {
  if (groups.length === 0) return 0;
  return (groups.length - 1) * timing.spacing + timing.duration;
}

export function patternMidi(pattern: Pattern, tonic: Midi): Midi[][] {
  return pattern.events.map((e) => e.notes.map((n) => noteToMidi(n, tonic)));
}

export type PlaybackHandle = { cancel(): void };

/** The slice of an smplr instrument this engine depends on. */
export interface Instrument {
  start(event: { note: number; time: number; duration: number }): unknown;
  stop(): void;
}

export interface AudioEngine {
  readonly unlocked: boolean;
  /** Must be called from a user gesture (iOS autoplay policy). */
  unlock(): Promise<void>;
  playContext(context: Context, tonic: Midi): PlaybackHandle;
  playPattern(pattern: Pattern, tonic: Midi): PlaybackHandle;
}

const NOOP_HANDLE: PlaybackHandle = { cancel() {} };

/**
 * `loadInstrument` is injected so tests can supply a fake and so the real
 * implementation can defer creating an AudioContext until the unlock gesture.
 */
export class SamplerAudioEngine implements AudioEngine {
  private instrument: Instrument | undefined;
  private current: PlaybackHandle | undefined;

  constructor(
    private readonly loadInstrument: () => Promise<{
      instrument: Instrument;
      currentTime: () => number;
    }>,
  ) {}

  private clock: (() => number) | undefined;

  get unlocked(): boolean {
    return this.instrument !== undefined;
  }

  async unlock(): Promise<void> {
    if (this.instrument) return;
    const { instrument, currentTime } = await this.loadInstrument();
    this.instrument = instrument;
    this.clock = currentTime;
  }

  playContext(context: Context, tonic: Midi): PlaybackHandle {
    return this.play(cadenceMidi(context, tonic), CADENCE_TIMING);
  }

  playPattern(pattern: Pattern, tonic: Midi): PlaybackHandle {
    return this.play(patternMidi(pattern, tonic), PATTERN_TIMING);
  }

  /** Exactly one stream sounds at a time: starting anything cancels the rest. */
  private play(groups: Midi[][], timing: Timing): PlaybackHandle {
    const instrument = this.instrument;
    const clock = this.clock;
    if (!instrument || !clock) return NOOP_HANDLE;
    this.current?.cancel();
    for (const n of scheduleGroups(groups, clock() + 0.05, timing)) {
      instrument.start(n);
    }
    const handle: PlaybackHandle = {
      cancel: () => {
        instrument.stop();
        if (this.current === handle) this.current = undefined;
      },
    };
    this.current = handle;
    return handle;
  }
}

export function soundfontEngine(instrumentName: string): SamplerAudioEngine {
  return new SamplerAudioEngine(async () => {
    const context = new AudioContext();
    await context.resume();
    const instrument = Soundfont(context, { instrument: instrumentName });
    await instrument.ready;
    return {
      instrument: instrument as Instrument,
      currentTime: () => context.currentTime,
    };
  });
}
