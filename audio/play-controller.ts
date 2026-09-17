import type { Score } from "../music/melody.ts";
import type { Context, Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import type {
  AudioEngine,
  CadenceSpeed,
  PlaybackEnd,
  PlaybackHandle,
} from "./engine.ts";

export type PlayButtonId =
  | "trial:drone"
  | "trial:context"
  | "trial:pattern"
  | "tonic:melody"
  | "options:tonic"
  | "options:cadence:slow"
  | "options:cadence:medium"
  | "options:cadence:fast";

export type PlayStep =
  | {
      buttonId: PlayButtonId;
      type: "context";
      context: Context;
      tonic: Midi;
      speed: CadenceSpeed;
    }
  | {
      buttonId: PlayButtonId;
      type: "pattern";
      pattern: Pattern;
      tonic: Midi;
    }
  | {
      buttonId: PlayButtonId;
      type: "score";
      score: Score;
      tonic: Midi;
    }
  | {
      buttonId: PlayButtonId;
      type: "note";
      note: Midi;
    };

export type PlayState =
  | { status: "idle" }
  | {
      status: "playing";
      buttonId: PlayButtonId;
      durationMs: number;
      queueLength: number;
      eventIndex?: number;
    };

export type PlayMsg =
  | {
      type: "STEP_ENDED";
      generation: number;
      playbackId: number;
      end: PlaybackEnd;
    }
  | {
      type: "CUE_CHANGED";
      generation: number;
      playbackId: number;
      eventIndex: number | undefined;
    };

type ActivePlayback = {
  generation: number;
  playbackId: number;
  step: PlayStep;
  handle: PlaybackHandle;
  cueTimers: ReturnType<typeof setTimeout>[];
  eventIndex: number | undefined;
};

export class PlayController {
  private generation = 0;
  private nextPlaybackId = 0;
  private active: ActivePlayback | undefined;
  private queue: PlayStep[] = [];

  constructor(
    private readonly audio: AudioEngine,
    private readonly dispatch: (msg: PlayMsg) => void,
  ) {}

  getState(): PlayState {
    const active = this.active;
    if (!active) return { status: "idle" };
    return {
      status: "playing",
      buttonId: active.step.buttonId,
      durationMs: active.handle.durationMs,
      queueLength: this.queue.length,
      ...(active.eventIndex === undefined
        ? {}
        : { eventIndex: active.eventIndex }),
    };
  }

  autoplay(steps: PlayStep[]): void {
    this.replace(steps);
  }

  toggle(buttonId: PlayButtonId, step: PlayStep): void {
    if (buttonId !== step.buttonId) {
      throw new Error("Play button id must match the requested step");
    }
    if (this.active?.step.buttonId === buttonId) {
      this.stop();
      return;
    }
    this.replace([step]);
  }

  /**
   * The drone is deliberately outside the queue: it must survive the cancels
   * that starting or stopping any other playback performs.
   */
  setDrone(tonic: Midi | undefined): void {
    this.audio.setDrone(tonic);
  }

  stop(): void {
    this.replace([]);
  }

  update(msg: PlayMsg): void {
    const active = this.active;
    if (
      !active ||
      msg.generation !== active.generation ||
      msg.playbackId !== active.playbackId
    ) {
      return;
    }

    if (msg.type === "CUE_CHANGED") {
      active.eventIndex = msg.eventIndex;
      return;
    }

    this.clearCueTimers(active);
    this.active = undefined;
    if (msg.end === "cancelled") {
      this.queue = [];
      return;
    }
    this.startNext(msg.generation);
  }

  private replace(steps: PlayStep[]): void {
    const active = this.active;
    this.generation += 1;
    this.active = undefined;
    this.queue = [...steps];
    if (active) {
      this.clearCueTimers(active);
      active.handle.cancel();
    }
    this.startNext(this.generation);
  }

  private startNext(generation: number): void {
    const step = this.queue.shift();
    if (!step) return;

    let handle: PlaybackHandle;
    try {
      handle = this.play(step);
    } catch (error) {
      this.queue = [];
      throw error;
    }

    const playbackId = this.nextPlaybackId;
    this.nextPlaybackId += 1;
    const active: ActivePlayback = {
      generation,
      playbackId,
      step,
      handle,
      cueTimers: [],
      eventIndex: undefined,
    };
    this.active = active;
    for (const cue of handle.cues) {
      active.cueTimers.push(
        setTimeout(() => {
          this.dispatch({
            type: "CUE_CHANGED",
            generation,
            playbackId,
            eventIndex: cue.eventIndex,
          });
        }, cue.onsetMs),
        setTimeout(() => {
          this.dispatch({
            type: "CUE_CHANGED",
            generation,
            playbackId,
            eventIndex: undefined,
          });
        }, cue.endMs),
      );
    }
    void handle.ended.then(
      (end) => {
        this.dispatch({ type: "STEP_ENDED", generation, playbackId, end });
      },
      () => {
        this.dispatch({
          type: "STEP_ENDED",
          generation,
          playbackId,
          end: "cancelled",
        });
      },
    );
  }

  private clearCueTimers(active: ActivePlayback): void {
    for (const timer of active.cueTimers) clearTimeout(timer);
    active.cueTimers = [];
    active.eventIndex = undefined;
  }

  private play(step: PlayStep): PlaybackHandle {
    switch (step.type) {
      case "context":
        return this.audio.playContext(step.context, step.tonic, step.speed);
      case "pattern":
        return this.audio.playPattern(step.pattern, step.tonic);
      case "score":
        return this.audio.playScore(step.score, step.tonic);
      case "note":
        return this.audio.playNote(step.note);
    }
  }
}
