import { expect, test } from "@playwright/test";
import { type Context, makePattern, type Pattern } from "../music/note.ts";
import type { Midi } from "../music/pitch.ts";
import type { AudioEngine, PlaybackEnd, PlaybackHandle } from "./engine.ts";
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
