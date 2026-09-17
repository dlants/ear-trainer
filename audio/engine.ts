import { Soundfont } from "smplr";
import { type Score, TICKS_PER_QUARTER } from "../music/melody.ts";
import type { Context, Pattern } from "../music/note.ts";
import { cadenceMidi, type Midi, noteToMidi } from "../music/pitch.ts";

export type ScheduledNote = {
  note: Midi;
  time: number;
  duration: number;
  velocity: number;
};

export type PlaybackCue = {
  eventIndex: number;
  onsetMs: number;
  endMs: number;
};

export type ScoreSchedule = {
  notes: ScheduledNote[];
  cues: PlaybackCue[];
  durationSeconds: number;
};

/** Seconds. `spacing` is onset-to-onset; `duration` is how long each note rings. */
export type CadenceSpeed = "slow" | "medium" | "fast";
export type Timing = { spacing: number; duration: number };

export const CADENCE_TIMINGS: Record<CadenceSpeed, Timing> = {
  slow: { spacing: 0.45, duration: 0.65 },
  medium: { spacing: 0.2, duration: 0.4 },
  fast: { spacing: 0.075, duration: 0.275 },
};
export const PATTERN_TIMING: Timing = { spacing: 0.5, duration: 0.55 };
export const NOTE_TIMING: Timing = { spacing: 0, duration: 0.75 };

const DEFAULT_VELOCITY = 100;
const CONTEXT_BASS_VELOCITY = 120;
const CONTEXT_UPPER_VELOCITY = 80;
export const SCORE_ARTICULATION_GAP_SECONDS = 0.03;
const SCHEDULING_LEAD_SECONDS = 0.05;

/**
 * Groups are simultaneity groups in time order: every note in a group shares an
 * onset. Times are absolute AudioContext times.
 */
export function scheduleGroups(
  groups: Midi[][],
  startTime: number,
  timing: Timing,
  velocityForNote: (noteIndex: number) => number = () => DEFAULT_VELOCITY,
): ScheduledNote[] {
  return groups.flatMap((group, i) =>
    group.map((note, noteIndex) => ({
      note,
      time: startTime + i * timing.spacing,
      duration: timing.duration,
      velocity: velocityForNote(noteIndex),
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

export function scheduleScore(score: Score, tonic: Midi): ScoreSchedule {
  const secondsPerTick = 60 / score.tempoBpm / TICKS_PER_QUARTER;
  const notes = score.voices.flatMap((scoreVoice) =>
    scoreVoice.events.flatMap((event) => {
      const duration = Math.max(
        0,
        event.durationTicks * secondsPerTick - SCORE_ARTICULATION_GAP_SECONDS,
      );
      return event.notes.map((note) => ({
        note: noteToMidi(note, tonic),
        time: event.onsetTicks * secondsPerTick,
        duration,
        velocity: DEFAULT_VELOCITY,
      }));
    }),
  );
  const melody = score.voices.find((candidate) => candidate.id === "melody");
  const cues = (melody?.events ?? []).map((event, eventIndex) => {
    const onsetSeconds = event.onsetTicks * secondsPerTick;
    const soundingSeconds = Math.max(
      0,
      event.durationTicks * secondsPerTick - SCORE_ARTICULATION_GAP_SECONDS,
    );
    return {
      eventIndex,
      onsetMs: Math.round(onsetSeconds * 1000),
      endMs: Math.round((onsetSeconds + soundingSeconds) * 1000),
    };
  });
  return {
    notes,
    cues,
    durationSeconds: score.durationTicks * secondsPerTick,
  };
}

export type PlaybackEnd = "completed" | "cancelled";

export type PlaybackHandle = {
  readonly durationMs: number;
  readonly cues: PlaybackCue[];
  readonly ended: Promise<PlaybackEnd>;
  cancel(): void;
};

/** The slice of an smplr instrument this engine depends on. */
export interface Instrument {
  /** Returns a stopper for just the voices this call started. */
  start(event: {
    note: number;
    time: number;
    duration: number;
    velocity: number;
  }): () => void;
}

/** A sustained tonic reference that outlives any individual playback. */
export interface DroneSource {
  start(note: Midi): void;
  stop(): void;
}

export interface AudioEngine {
  readonly unlocked: boolean;
  /** Must be called from a user gesture (iOS autoplay policy). */
  unlock(): Promise<void>;
  playContext(
    context: Context,
    tonic: Midi,
    speed: CadenceSpeed,
  ): PlaybackHandle;
  playPattern(pattern: Pattern, tonic: Midi): PlaybackHandle;
  playScore(score: Score, tonic: Midi): PlaybackHandle;
  playNote(note: Midi): PlaybackHandle;
  /** `undefined` silences the drone. */
  setDrone(tonic: Midi | undefined): void;
}

const NOOP_HANDLE: PlaybackHandle = {
  durationMs: 0,
  cues: [],
  ended: Promise.resolve("completed"),
  cancel() {},
};

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
      drone: DroneSource;
    }>,
  ) {}

  private clock: (() => number) | undefined;
  private drone: DroneSource | undefined;
  private droneNote: Midi | undefined;

  get unlocked(): boolean {
    return this.instrument !== undefined;
  }

  async unlock(): Promise<void> {
    if (this.instrument) return;
    const { instrument, currentTime, drone } = await this.loadInstrument();
    this.instrument = instrument;
    this.clock = currentTime;
    this.drone = drone;
  }

  playContext(
    context: Context,
    tonic: Midi,
    speed: CadenceSpeed,
  ): PlaybackHandle {
    return this.play(
      cadenceMidi(context, tonic),
      CADENCE_TIMINGS[speed],
      (noteIndex) =>
        noteIndex === 0 ? CONTEXT_BASS_VELOCITY : CONTEXT_UPPER_VELOCITY,
    );
  }

  playPattern(pattern: Pattern, tonic: Midi): PlaybackHandle {
    return this.play(patternMidi(pattern, tonic), PATTERN_TIMING);
  }

  playScore(score: Score, tonic: Midi): PlaybackHandle {
    const schedule = scheduleScore(score, tonic);
    return this.startPlayback(
      schedule.notes,
      schedule.durationSeconds,
      schedule.cues,
    );
  }

  playNote(note: Midi): PlaybackHandle {
    return this.play([[note]], NOTE_TIMING);
  }

  setDrone(tonic: Midi | undefined): void {
    if (this.droneNote === tonic) return;
    this.droneNote = tonic;
    if (tonic === undefined) this.drone?.stop();
    else this.drone?.start(tonic);
  }

  private play(
    groups: Midi[][],
    timing: Timing,
    velocityForNote?: (noteIndex: number) => number,
  ): PlaybackHandle {
    return this.startPlayback(
      scheduleGroups(groups, 0, timing, velocityForNote),
      scheduleDuration(groups, timing),
      [],
    );
  }

  /** Exactly one stream sounds at a time: starting anything cancels the rest. */
  private startPlayback(
    notes: ScheduledNote[],
    durationSeconds: number,
    cues: PlaybackCue[],
  ): PlaybackHandle {
    const instrument = this.instrument;
    const clock = this.clock;
    if (!instrument || !clock) return NOOP_HANDLE;

    this.current?.cancel();
    const startTime = clock() + SCHEDULING_LEAD_SECONDS;
    const stoppers = notes.map((note) =>
      instrument.start({ ...note, time: startTime + note.time }),
    );
    const durationMs = Math.round(
      (SCHEDULING_LEAD_SECONDS + durationSeconds) * 1000,
    );
    const handleCues = cues.map((cue) => ({
      ...cue,
      onsetMs: cue.onsetMs + SCHEDULING_LEAD_SECONDS * 1000,
      endMs: cue.endMs + SCHEDULING_LEAD_SECONDS * 1000,
    }));
    let resolveEnded: (end: PlaybackEnd) => void;
    const ended = new Promise<PlaybackEnd>((resolve) => {
      resolveEnded = resolve;
    });
    let settled = false;
    const completionTimer = setTimeout(() => {
      settled = true;
      if (this.current === handle) this.current = undefined;
      resolveEnded("completed");
    }, durationMs);
    const handle: PlaybackHandle = {
      durationMs,
      cues: handleCues,
      ended,
      cancel: () => {
        if (settled) return;
        settled = true;
        clearTimeout(completionTimer);
        for (const stop of stoppers) stop();
        if (this.current === handle) this.current = undefined;
        resolveEnded("cancelled");
      },
    };
    this.current = handle;
    return handle;
  }
}

const DRONE_GAIN = 0.085;
const DRONE_FADE = 0.3;
/** Tonic octaves only: adding a fifth would color the degrees being tested. */
const DRONE_VOICES = [
  { semitones: -12, detune: 0 },
  { semitones: 0, detune: -5 },
  { semitones: 0, detune: 5 },
];

function midiToFrequency(note: Midi): number {
  return 440 * 2 ** ((note - 69) / 12);
}

/**
 * Synthesized rather than sampled: soundfont notes decay after a few seconds,
 * so they cannot hold a tonal reference under a whole trial.
 */
function oscillatorDrone(context: AudioContext): DroneSource {
  let active: { oscillators: OscillatorNode[]; gain: GainNode } | undefined;

  function stop(): void {
    const current = active;
    if (!current) return;
    active = undefined;
    const now = context.currentTime;
    current.gain.gain.cancelScheduledValues(now);
    current.gain.gain.setValueAtTime(current.gain.gain.value, now);
    current.gain.gain.linearRampToValueAtTime(0, now + DRONE_FADE);
    for (const oscillator of current.oscillators) {
      oscillator.stop(now + DRONE_FADE);
    }
  }

  return {
    start(note) {
      stop();
      const now = context.currentTime;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      filter.connect(context.destination);
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(DRONE_GAIN, now + DRONE_FADE);
      gain.connect(filter);
      const oscillators = DRONE_VOICES.map(({ semitones, detune }) => {
        const oscillator = context.createOscillator();
        oscillator.type = "triangle";
        oscillator.frequency.value = midiToFrequency(note + semitones);
        oscillator.detune.value = detune;
        oscillator.connect(gain);
        oscillator.start(now);
        return oscillator;
      });
      active = { oscillators, gain };
    },
    stop,
  };
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
      drone: oscillatorDrone(context),
    };
  });
}
