/**
 * Browser-side fixtures for the startup spec. The spec runs its body inside
 * `page.evaluate`, so the audio stub has to live in a module the page can
 * import rather than in the Node-side test file.
 */
import type {
  AudioEngine,
  PlaybackEnd,
  PlaybackHandle,
} from "../audio/engine.ts";

const completedHandle = (): PlaybackHandle => ({
  durationMs: 0,
  cues: [],
  ended: Promise.resolve<PlaybackEnd>("completed"),
  cancel() {},
});

/** Unlock never settles on its own, so a startup unlock attempt is observable. */
export class FakeAudio implements AudioEngine {
  unlocked = false;
  readonly attempts: (() => void)[] = [];
  readonly played: number[] = [];

  unlock(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.attempts.push(resolve);
    }).then(() => {
      this.unlocked = true;
    });
  }

  setDrone(): void {}

  playContext(): PlaybackHandle {
    return completedHandle();
  }

  playPattern(): PlaybackHandle {
    return completedHandle();
  }

  playScore(): PlaybackHandle {
    return completedHandle();
  }

  playNotes(notes: number[]): PlaybackHandle {
    this.played.push(...notes);
    return completedHandle();
  }
}
