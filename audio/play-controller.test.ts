import { expect, test } from "@playwright/test";
import type { Score } from "../music/melody.ts";
import { type Context, makePattern, type Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import { fakeTimers } from "../test/support.ts";
import type {
  AudioEngine,
  PlaybackCue,
  PlaybackEnd,
  PlaybackHandle,
} from "./engine.ts";
import {
  PlayController,
  type PlayMsg,
  type PlayStep,
} from "./play-controller.ts";

class ControlledHandle implements PlaybackHandle {
  readonly ended: Promise<PlaybackEnd>;
  cancelCount = 0;
  private resolveEnded: (end: PlaybackEnd) => void = () => {};

  constructor(
    readonly durationMs: number,
    private readonly settleOnCancel = true,
    readonly cues: PlaybackCue[] = [],
  ) {
    this.ended = new Promise((resolve) => {
      this.resolveEnded = resolve;
    });
  }

  cancel(): void {
    this.cancelCount += 1;
    if (this.settleOnCancel) this.resolveEnded("cancelled");
  }

  complete(): void {
    this.resolveEnded("completed");
  }
}

class FakeAudio implements AudioEngine {
  unlocked = true;
  readonly calls: string[] = [];
  readonly handles: ControlledHandle[] = [];
  private readonly queuedHandles: ControlledHandle[] = [];

  async unlock(): Promise<void> {}

  drone: Midi | undefined;
  setDrone(tonic: Midi | undefined): void {
    this.drone = tonic;
    this.calls.push(`drone:${tonic ?? "off"}`);
  }
  enqueue(handle: ControlledHandle): void {
    this.queuedHandles.push(handle);
  }

  playContext(context: Context, tonic: Midi): PlaybackHandle {
    this.calls.push(`context:${context}:${tonic}`);
    return this.nextHandle();
  }

  playPattern(pattern: Pattern, tonic: Midi): PlaybackHandle {
    this.calls.push(`pattern:${pattern.id}:${tonic}`);
    return this.nextHandle();
  }

  playScore(score: Score, tonic: Midi): PlaybackHandle {
    this.calls.push(`score:${score.durationTicks}:${tonic}`);
    return this.nextHandle();
  }

  playNote(note: Midi): PlaybackHandle {
    this.calls.push(`note:${note}`);
    return this.nextHandle();
  }

  private nextHandle(): ControlledHandle {
    const handle = this.queuedHandles.shift() ?? new ControlledHandle(800);
    this.handles.push(handle);
    return handle;
  }
}

const pattern = makePattern("major-cadence", [
  { notes: [{ degree: 1, alteration: 0, octave: 0 }] },
]);
const contextStep: PlayStep = {
  buttonId: "trial:context",
  type: "context",
  context: "major-cadence",
  tonic: 60,
  speed: "medium",
};
const patternStep: PlayStep = {
  buttonId: "trial:pattern",
  type: "pattern",
  pattern,
  tonic: 60,
};
const noteStep: PlayStep = {
  buttonId: "options:tonic",
  type: "note",
  note: 55,
};
const score: Score = {
  context: "major-cadence",
  tempoBpm: 120,
  durationTicks: 48,
  measures: [{ startTicks: 0, endTicks: 48, beatDurationsTicks: [24, 24] }],
  voices: [
    {
      id: "melody",
      events: [
        {
          notes: [{ degree: 1, alteration: 0, octave: 0 }],
          onsetTicks: 0,
          durationTicks: 24,
        },
      ],
    },
  ],
};
const scoreStep: PlayStep = {
  buttonId: "tonic:melody",
  type: "score",
  score,
  tonic: 60,
};

function setup(audio = new FakeAudio()) {
  const messages: PlayMsg[] = [];
  const controller = new PlayController(audio, (msg) => messages.push(msg));
  return { audio, controller, messages };
}

async function settlePromises(): Promise<void> {
  await Promise.resolve();
}

test.describe("PlayController", () => {
  test("advances a two-step autoplay only after natural completion", async () => {
    const audio = new FakeAudio();
    audio.enqueue(new ControlledHandle(1250));
    audio.enqueue(new ControlledHandle(900));
    const { controller, messages } = setup(audio);

    controller.autoplay([contextStep, patternStep]);

    expect(audio.calls).toEqual(["context:major-cadence:60"]);
    expect(controller.getState()).toEqual({
      status: "playing",
      buttonId: "trial:context",
      durationMs: 1250,
      queueLength: 1,
    });

    audio.handles[0].complete();
    await settlePromises();
    expect(audio.calls).toHaveLength(1);
    controller.update(messages.shift() as PlayMsg);

    expect(audio.calls).toEqual([
      "context:major-cadence:60",
      `pattern:${pattern.id}:60`,
    ]);
    expect(controller.getState()).toEqual({
      status: "playing",
      buttonId: "trial:pattern",
      durationMs: 900,
      queueLength: 0,
    });
  });

  test("advances once after score playback completes naturally", async () => {
    const audio = new FakeAudio();
    audio.enqueue(new ControlledHandle(1050));
    audio.enqueue(new ControlledHandle(800));
    const { controller, messages } = setup(audio);
    controller.autoplay([scoreStep, noteStep]);

    audio.handles[0].complete();
    await settlePromises();
    controller.update(messages.shift() as PlayMsg);

    expect(audio.calls).toEqual(["score:48:60", "note:55"]);
    expect(controller.getState()).toMatchObject({
      status: "playing",
      buttonId: "options:tonic",
      queueLength: 0,
    });
    controller.update({
      type: "STEP_ENDED",
      generation: 0,
      playbackId: 0,
      end: "completed",
    });
    expect(audio.calls).toEqual(["score:48:60", "note:55"]);
  });

  test("toggles the active button off and discards queued autoplay", async () => {
    const { audio, controller, messages } = setup();
    controller.autoplay([contextStep, patternStep]);

    controller.toggle("trial:context", contextStep);

    expect(audio.handles[0].cancelCount).toBe(1);
    expect(controller.getState()).toEqual({ status: "idle" });
    await settlePromises();
    controller.update(messages.shift() as PlayMsg);
    expect(audio.calls).toEqual(["context:major-cadence:60"]);
    expect(controller.getState()).toEqual({ status: "idle" });
  });

  test("replaces active playback and its queue with a different button", async () => {
    const { audio, controller, messages } = setup();
    controller.autoplay([contextStep, patternStep]);

    controller.toggle("options:tonic", noteStep);

    expect(audio.handles[0].cancelCount).toBe(1);
    expect(audio.calls).toEqual(["context:major-cadence:60", "note:55"]);
    expect(controller.getState()).toEqual({
      status: "playing",
      buttonId: "options:tonic",
      durationMs: 800,
      queueLength: 0,
    });
    await settlePromises();
    controller.update(messages.shift() as PlayMsg);
    expect(audio.calls).toEqual(["context:major-cadence:60", "note:55"]);
    expect(controller.getState()).toMatchObject({
      status: "playing",
      buttonId: "options:tonic",
    });
  });

  test("ignores a superseded handle completion that arrives late", async () => {
    const audio = new FakeAudio();
    const staleHandle = new ControlledHandle(1000, false);
    audio.enqueue(staleHandle);
    audio.enqueue(new ControlledHandle(800));
    const { controller, messages } = setup(audio);
    controller.autoplay([contextStep, patternStep]);
    controller.toggle("options:tonic", noteStep);

    staleHandle.complete();
    await settlePromises();
    controller.update(messages.shift() as PlayMsg);

    expect(audio.calls).toEqual(["context:major-cadence:60", "note:55"]);
    expect(controller.getState()).toMatchObject({
      status: "playing",
      buttonId: "options:tonic",
    });
  });

  test("publishes score cues and clears them during gaps", async () => {
    const timers = fakeTimers();
    try {
      const audio = new FakeAudio();
      audio.enqueue(
        new ControlledHandle(1050, true, [
          { eventIndex: 0, onsetMs: 50, endMs: 470 },
          { eventIndex: 1, onsetMs: 550, endMs: 970 },
        ]),
      );
      const { controller, messages } = setup(audio);
      controller.toggle("tonic:melody", scoreStep);

      await timers.advance(50);
      controller.update(messages.shift() as PlayMsg);
      expect(controller.getState()).toMatchObject({ eventIndex: 0 });

      await timers.advance(420);
      controller.update(messages.shift() as PlayMsg);
      expect(controller.getState()).not.toHaveProperty("eventIndex");
      controller.stop();
    } finally {
      timers.restore();
    }
  });

  test("cancels score cue timers and the handle once when replaced", async () => {
    const timers = fakeTimers();
    try {
      const audio = new FakeAudio();
      const scoreHandle = new ControlledHandle(1000, true, [
        { eventIndex: 0, onsetMs: 500, endMs: 900 },
      ]);
      audio.enqueue(scoreHandle);
      audio.enqueue(new ControlledHandle(800));
      const { controller, messages } = setup(audio);
      controller.toggle("tonic:melody", scoreStep);

      controller.toggle("options:tonic", noteStep);
      expect(scoreHandle.cancelCount).toBe(1);
      expect(audio.calls).toEqual(["score:48:60", "note:55"]);

      await timers.advance(550);
      for (const message of messages) controller.update(message);
      expect(controller.getState()).toMatchObject({
        status: "playing",
        buttonId: "options:tonic",
      });
      expect(controller.getState()).not.toHaveProperty("eventIndex");
    } finally {
      timers.restore();
    }
  });

  test("makes repeated stops idempotent", async () => {
    const { audio, controller, messages } = setup();
    controller.autoplay([contextStep, patternStep]);

    controller.stop();
    controller.stop();

    expect(audio.handles[0].cancelCount).toBe(1);
    expect(controller.getState()).toEqual({ status: "idle" });
    await settlePromises();
    for (const message of messages) controller.update(message);
    controller.stop();
    expect(audio.handles[0].cancelCount).toBe(1);
    expect(audio.calls).toEqual(["context:major-cadence:60"]);
  });
});
