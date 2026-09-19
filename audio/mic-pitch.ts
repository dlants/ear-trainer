import type { Midi } from "../music/pitch.ts";

export type Pitch = {
  hz: number;
  /** Fractional midi number, so callers can show how far off the nearest note is. */
  midi: number;
};

/**
 * One analysis window. `level` is reported even when no pitch locks, so the UI
 * can tell "I hear nothing" apart from "I hear you but it isn't a steady tone".
 */
export type Reading = {
  /** RMS amplitude of the window, 0..1. */
  level: number;
  /** Meter position, 0..1, auto-ranged against the loudest recent window. */
  meter: number;
  pitch: Pitch | undefined;
  /** Energy per semitone from SPECTROGRAM_MIN_MIDI through MAX, normalized 0..1. */
  spectrum: number[];
};

export const SPECTROGRAM_MIN_MIDI = 36;
export const SPECTROGRAM_MAX_MIDI = 84;
export const SPECTROGRAM_FRAME_INTERVAL_MS = 80;
export const SPECTROGRAM_DURATION_SECONDS = 30;
export const SPECTROGRAM_FRAME_COUNT = Math.round(
  (SPECTROGRAM_DURATION_SECONDS * 1000) / SPECTROGRAM_FRAME_INTERVAL_MS,
);
const SPECTROGRAM_MIN_DB = -100;
const SPECTROGRAM_MAX_DB = -30;

export type MicPitchMsg =
  | { type: "MIC_STARTED" }
  | { type: "MIC_READING"; reading: Reading }
  | { type: "MIC_ERROR"; message: string };

/** Below this normalized autocorrelation peak the buffer is noise, not a sung tone. */
const CLARITY_THRESHOLD = 0.8;
/** Quieter than this is room noise, not someone humming at their phone. */
export const SILENCE_LEVEL = 0.005;
/** A sung fundamental lives well inside this range; anything outside is an artifact. */
const MIN_HZ = 60;
const MAX_HZ = 1200;
const BUFFER_SIZE = 4096;
const SAMPLE_INTERVAL_MS = SPECTROGRAM_FRAME_INTERVAL_MS;

/**
 * Raw input level depends on the device, the browser's capture gain and how
 * close the phone is, so a fixed full-scale reference reads near-empty for a
 * perfectly loud voice. Track a slowly decaying peak and meter against that.
 */
const PEAK_DECAY = 0.98;
const MIN_PEAK = 0.02;

export function peakLevel(previous: number, rms: number): number {
  return Math.max(rms, previous * PEAK_DECAY, MIN_PEAK);
}

export function meterLevel(rms: number, peak: number): number {
  if (rms < SILENCE_LEVEL) return 0;
  return Math.min(1, rms / peak);
}

export function spectrumLevels(
  decibels: Float32Array,
  sampleRate: number,
  fftSize: number,
): number[] {
  const hzPerBin = sampleRate / fftSize;
  const levels: number[] = [];
  for (let midi = SPECTROGRAM_MIN_MIDI; midi <= SPECTROGRAM_MAX_MIDI; midi++) {
    const lowHz = 440 * 2 ** ((midi - 69 - 0.5) / 12);
    const highHz = 440 * 2 ** ((midi - 69 + 0.5) / 12);
    const firstBin = Math.max(0, Math.floor(lowHz / hzPerBin));
    const lastBin = Math.min(
      decibels.length - 1,
      Math.max(firstBin, Math.ceil(highHz / hzPerBin)),
    );
    let strongest = SPECTROGRAM_MIN_DB;
    for (let bin = firstBin; bin <= lastBin; bin++) {
      strongest = Math.max(strongest, decibels[bin] ?? SPECTROGRAM_MIN_DB);
    }
    levels.push(
      Math.max(
        0,
        Math.min(
          1,
          (strongest - SPECTROGRAM_MIN_DB) /
            (SPECTROGRAM_MAX_DB - SPECTROGRAM_MIN_DB),
        ),
      ),
    );
  }
  return levels;
}

export function frequencyToMidi(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}

export function nearestMidi(midi: number): Midi {
  return Math.round(midi);
}

export function centsOff(midi: number): number {
  return Math.round((midi - Math.round(midi)) * 100);
}

/**
 * Normalized square difference autocorrelation (McLeod-style): robust on sung
 * vowels, where the strongest partial is often not the fundamental.
 */
export function detectPitch(
  samples: Float32Array,
  sampleRate: number,
): Reading {
  let power = 0;
  for (const sample of samples) power += sample * sample;
  const level = Math.sqrt(power / samples.length);
  const silent: Reading = { level, meter: 0, pitch: undefined, spectrum: [] };
  if (level < SILENCE_LEVEL) return silent;

  const minLag = Math.floor(sampleRate / MAX_HZ);
  const maxLag = Math.min(Math.floor(sampleRate / MIN_HZ), samples.length - 1);
  if (maxLag <= minLag) return silent;

  let bestLag = -1;
  let bestScore = 0;
  let previousScore = 0;
  let rising = false;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    let energy = 0;
    for (let i = 0; i < samples.length - lag; i++) {
      correlation += samples[i] * samples[i + lag];
      energy += samples[i] * samples[i] + samples[i + lag] * samples[i + lag];
    }
    const score = energy > 0 ? (2 * correlation) / energy : 0;
    // Take the first clear peak rather than the global maximum, which tends to
    // land an octave low on a sustained voice.
    if (rising && score < previousScore && previousScore >= CLARITY_THRESHOLD) {
      bestLag = lag - 1;
      bestScore = previousScore;
      break;
    }
    rising = score > previousScore;
    if (previousScore > bestScore) bestScore = previousScore;
    previousScore = score;
  }
  if (bestLag < 0 || bestScore < CLARITY_THRESHOLD) return silent;
  const hz = sampleRate / bestLag;
  return {
    level,
    meter: 0,
    pitch: { hz, midi: frequencyToMidi(hz) },
    spectrum: [],
  };
}

/**
 * Owns the microphone stream for as long as a view asks to listen, and reports
 * what it hears back into the dispatch loop.
 */
export class MicPitchDetector {
  private context: AudioContext | undefined;
  private stream: MediaStream | undefined;
  private timer: ReturnType<typeof setInterval> | undefined;
  private listening = false;
  private peak = MIN_PEAK;

  constructor(private readonly dispatch: (msg: MicPitchMsg) => void) {}

  /** Fire-and-forget: progress and failures both come back as dispatched messages. */
  start(): void {
    if (this.listening) return;
    this.listening = true;
    this.open().then(undefined, () => this.fail());
  }

  private fail(): void {
    this.stop();
    this.dispatch({
      type: "MIC_ERROR",
      message:
        "Could not use the microphone. Check that this site is allowed to listen.",
    });
  }

  private async open(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    if (!this.listening) {
      for (const track of stream.getTracks()) track.stop();
      return;
    }
    const context = new AudioContext();
    await context.resume();
    const analyser = context.createAnalyser();
    analyser.fftSize = BUFFER_SIZE;
    analyser.minDecibels = SPECTROGRAM_MIN_DB;
    analyser.maxDecibels = SPECTROGRAM_MAX_DB;
    analyser.smoothingTimeConstant = 0.65;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    const frequencies = new Float32Array(analyser.frequencyBinCount);

    this.stream = stream;
    this.context = context;
    this.timer = setInterval(() => {
      analyser.getFloatTimeDomainData(samples);
      analyser.getFloatFrequencyData(frequencies);
      const reading = detectPitch(samples, context.sampleRate);
      this.peak = peakLevel(this.peak, reading.level);
      this.dispatch({
        type: "MIC_READING",
        reading: {
          ...reading,
          meter: meterLevel(reading.level, this.peak),
          spectrum: spectrumLevels(
            frequencies,
            context.sampleRate,
            analyser.fftSize,
          ),
        },
      });
    }, SAMPLE_INTERVAL_MS);
    this.dispatch({ type: "MIC_STARTED" });
  }

  stop(): void {
    this.listening = false;
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    if (this.stream) for (const track of this.stream.getTracks()) track.stop();
    this.stream = undefined;
    this.context?.close().then(undefined, () => {});
    this.context = undefined;
  }
}
