# Objective and Context

> I think I want to centralize the playback in a single controller, with a few changes:
>
> - I want to auto-play the key followed by the prompt (for transcription cards), or the key (for audiation cards)
> - If a button is playing, I want clicking that button again to abort the play (and dump the queue of scheduled plays)
> - If a button is playing, I want clicking a different button to immediately stop what's currently playing and dump the queue, and just play the clicked button (so things don't play simultaneously on top of each other).
>
> Write up a plan for this play controller / play queue, and how it will interact with the PlayButton views.
>
> The reveal for audiation cards should also auto-play in a similar way (sans key).
>
> Audio unlocking should remain an app-startup responsibility. By the time `AppCtx` exists, it should contain a controller that can already play sound.

Playback is currently split between `views/trial.ts` and `views/options.ts`. Those reducers unlock `AudioEngine` and call `playContext`, `playPattern`, or `playNote` directly. `SamplerAudioEngine` already enforces one low-level stream at a time, but its `PlaybackHandle` only exposes `cancel()`, so callers cannot observe natural completion and there is no higher-level queue for context-then-pattern playback.

After startup has unlocked audio, the controller will become the only application-level caller of `AudioEngine`. It will own the active handle, the remaining logical steps, cancellation/supersession, natural step completion, and the observable state used by play buttons. The engine remains responsible for scheduling notes on the audio clock and reporting when its currently scheduled stream has ended. Unlocking remains outside the controller and outside `AppCtx`.

Relevant files:

- `audio/engine.ts` — low-level note scheduling, exclusive instrument playback, and `PlaybackHandle` lifecycle.
- `audio/play-controller.ts` — new application-level controller and logical play queue.
- `views/play-button.ts` — new reusable sound-button view and sweep animation.
- `views/trial.ts` — trial autoplay requests and manual context/pattern controls.
- `views/options.ts` — manual single-note preview controls.
- `views/app.ts` — routes controller messages and threads controller state/context to pages.
- `main.ts` — owns the pre-app audio unlock gate, then constructs the controller and `AppCtx` only after unlock succeeds.
- `views/start.ts` — new minimal startup view that supplies the explicit user gesture required to unlock browser audio before mounting the app.
- `theme.ts` — semantic sweep color tokens.
- `.magenta/skills/design-system/skill.md` — documents `PlayButtonView` as the required sound-control primitive.
- `audio/audio.test.ts`, `audio/play-controller.test.ts`, `views/play-button.test.ts`, `views/trial.test.ts`, and `views/options.test.ts` — lifecycle, queue, UI, and integration coverage.

# Design

Add one `PlayController` instance to `AppCtx`. Trial and options reducers send typed playback requests to it instead of calling `AudioEngine`. The controller accepts either a single manual step or an ordered automatic sequence. A queue is replaced, never appended: the only multi-step queue is the atomic trial autoplay sequence. A manual button interaction always clears that sequence before deciding whether to stop or start the clicked sound.

Each playable operation has a stable `buttonId`. The controller exposes the `buttonId` of the step that is currently sounding plus that step's duration. A `PlayButtonView` compares its own id with that observable state. While they match, it applies a playing class and sets a CSS duration variable; a pseudo-element sweeps across the button from left to right. The view emits only a click message. It does not call audio, own timers, or infer playback duration.

The controller uses generation tokens to make asynchronous completion race-safe. Every replacement or cancellation increments the generation, clears queued steps, and cancels the active engine handle. A completion callback includes the generation and handle identity it belongs to; stale callbacks are ignored. Natural completion advances to the next queued step. Cancellation never advances the queue.

## Playback lifecycle

`PlaybackHandle` should expose completion and the scheduled wall-clock duration:

```ts
export type PlaybackEnd = "completed" | "cancelled";

export type PlaybackHandle = {
  readonly durationMs: number;
  readonly ended: Promise<PlaybackEnd>;
  cancel(): void;
};
```

`SamplerAudioEngine.play(...)` computes `durationMs` from the existing 50 ms scheduling lead plus `scheduleDuration(groups, timing)`. It resolves `ended` with `"completed"` after that duration. `cancel()` is idempotent, clears the completion timer, stops the instrument, and resolves `ended` with `"cancelled"`. Starting another low-level stream still cancels the previous handle defensively. The pre-unlock no-op handle has `durationMs: 0` and an already-resolved `ended` promise.

The controller, rather than views, consumes `ended`. This keeps animation and queue progression aligned with the same timing that scheduled the audio.

## Controller interfaces

Use a serializable discriminated union for steps rather than storing closures in the queue:

```ts
export type PlayButtonId =
  | "trial:context"
  | "trial:pattern"
  | "options:tonic"
  | "options:low"
  | "options:high";

export type PlayStep =
  | {
      buttonId: PlayButtonId;
      type: "context";
      context: Context;
      tonic: Midi;
    }
  | {
      buttonId: PlayButtonId;
      type: "pattern";
      pattern: Pattern;
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
    };

export type PlayMsg = {
  type: "STEP_ENDED";
  generation: number;
  end: PlaybackEnd;
};

export class PlayController {
  constructor(audio: AudioEngine, dispatch: (msg: PlayMsg) => void);
  getState(): PlayState;
  autoplay(steps: PlayStep[]): void;
  toggle(buttonId: PlayButtonId, step: PlayStep): void;
  stop(): void;
  update(msg: PlayMsg): void;
}
```

The constructor requires an already-unlocked `AudioEngine` and should fail fast if `audio.unlocked` is false. This makes the startup/controller boundary executable rather than documentary.

- `autoplay(steps)` replaces all existing work and starts the sequence immediately.
- `toggle(buttonId, step)` implements manual button behavior. If `buttonId` is currently sounding, it calls `stop()` and does not restart. Otherwise it drops the active handle and entire queue, then plays only `step`.
- `stop()` clears active and queued work regardless of origin.

`PlayController` will dispatch only asynchronous lifecycle messages through the root loop. Synchronous calls from a page reducer mutate controller state before the normal `view.sync`, avoiding dispatch-in-dispatch. `AppMsg` gains `{ type: "PLAY_MSG"; msg: PlayMsg }`; that case delegates to `ctx.play.update(msg.msg)`. Every controller completion/error dispatch therefore produces a root sync, allowing mounted `PlayButtonView` instances to observe the new controller state.

## Trial autoplay

Creating a trial must be separated from `initialState`, because initialization should remain free of playback effects. `TrialState` can still contain the initial trial for rendering, but app startup must dispatch an explicit post-construction message that requests its autoplay; alternatively, initialize with no trial and dispatch `NEXT_TRIAL` after `AppView` is mounted. Prefer the latter if it does not introduce a visible empty-state flash.

Whenever `NEXT_TRIAL` selects a card:

- transcription: replace playback with `[contextStep, patternStep]`;
- audiation: replace playback with `[contextStep]`;
- no due card: stop playback and leave the queue empty.

When `COMMIT` transitions an audiation trial from presentation to reveal, replace all current and queued playback with `[patternStep]`. This reveal autoplay intentionally omits the context: the key has already been established during presentation, and the reveal should immediately demonstrate the prompted pattern. A transcription reveal does not trigger another automatic playback because its prompt already sounded during presentation.

The same path runs on initial practice entry, after grading creates the next trial, and when navigating back to practice. Navigating away from practice stops playback so an unmounted page cannot leave sound or queued steps behind.

Browser audio unlocking happens before application construction. `main.ts` creates the `AudioEngine`, mounts a minimal startup view, and calls `audio.unlock()` from that view's explicit button gesture. Only after the promise succeeds does startup destroy the gate and call `startApp(audio)`. `startApp` constructs `PlayController`, then `AppCtx`, state, and `AppView`; therefore trial initialization may request autoplay immediately without a locked or staged controller state. If unlock fails, the startup view displays the error and allows retry. The optional install prompt remains before this gate, so dismissing installation proceeds to audio startup rather than directly constructing the app.

`PLAY_CONTEXT` and `PLAY_PATTERN` remain trial messages, but their reducer cases build a `PlayStep` and call `ctx.play.toggle(...)`. `canPlayPattern` remains the authorization gate: an audiation pattern cannot be requested before reveal. Advancing to another trial or leaving practice cancels any current step before replacing it.

## Options previews

`OptionsCtx` replaces direct `audio` access with `play: PlayController`. A `PREVIEW` message builds the current note step and calls `toggle` with the matching stable id. Slider release and note-button clicks continue to dispatch the same preview intent.

Because each option field has a different id, tapping the currently sounding field stops it, while tapping another field immediately cancels the old note and plays the new one. Navigating away from options stops playback. Changing a slider value does not itself stop audio; releasing it invokes the existing preview behavior and therefore replaces any current work.

## PlayButtonView

```ts
export type PlayButtonIcon = "key" | "play";
export type PlayButtonVariant = "trial" | "compact";

export type PlayButtonState = {
  id: PlayButtonId;
  label: string;
  ariaLabel: string;
  icon: PlayButtonIcon;
  variant: PlayButtonVariant;
  visible: boolean;
  playing: boolean;
  durationMs: number | undefined;
};

export type PlayButtonMsg = { type: "PRESS"; id: PlayButtonId };
```

`PlayButtonView` renders the actual `<button>` and chooses the existing trusted `keyIcon()` or `playIcon()` function. Parents mount it with `bindSlot(show(...))`; they no longer render sound-producing `<button>` elements directly. The parent computes `playing` and `durationMs` from `ctx.play.getState()` inside the binding callback so the value is refreshed on each app sync. The child binds label, accessibility attributes, visibility, variant/playing classes, and `--play-duration` through `Binder` methods.

The button uses `position: relative` and `overflow: hidden`; a non-interactive pseudo-element starts at zero width and sweeps to full width with a linear animation. Label and icon sit above it through stacking order. The sweep restarts only when a real inactive-to-active playback transition occurs. Respect `prefers-reduced-motion`: show a static active fill for the same playback lifetime instead of moving the sweep. Add semantic `--color-playback-sweep` and, if needed, `--color-playback-active` tokens to `theme.ts`; do not add view-local color literals.

Trial layout and compact options layout remain parent concerns through the `variant` classes and slot-container sizing. Confidence and grading buttons remain ordinary buttons.

Document in `.magenta/skills/design-system/skill.md` that every control which starts audible playback must use `PlayButtonView`, use a stable `PlayButtonId`, and derive its active state from `PlayController`; direct audio calls and one-off playback animations in page views are prohibited.

## Invariants

- `PlayController` is the only application-level owner of `AudioEngine`; page reducers never call the engine directly.
- At most one `PlaybackHandle` is active at any time.
- A manual request never appends to existing work; it either toggles the matching active button off or replaces all active/queued work with one step.
- Only controller-driven autoplay may contain multiple steps.
- Cancelling or superseding playback empties the whole queue and cannot accidentally advance it through a stale completion callback.
- A natural completion advances exactly one queued step; a cancellation advances none.
- The active `buttonId` identifies the sound currently audible, including each individual step of autoplay, so only the corresponding button animates.
- The animation lifetime and queue progression come from `PlaybackHandle.durationMs`/`ended`, not duplicated view timers.
- Trial pattern playback remains unavailable during the presentation phase of audiation cards; the transition to reveal is the first point at which its automatic or manual playback may be requested.
- Audiation reveal autoplay contains only the pattern step and replaces any presentation playback still active or queued.
- `AppCtx`, `PlayController`, and trial state are not constructed until startup has successfully unlocked audio from an explicit user gesture.
- `PlayController` never models locked, unlocking, staged, or unlock-error states; its constructor accepts only an engine whose `unlocked` flag is already true.
- Route changes, an empty deck, and controller errors cannot leave an active handle or queued sound behind.

# Stages

## 1. Make low-level playback completion observable — complete

- [x] Goal: `PlaybackHandle` has deterministic natural-completion and cancellation semantics derived from the existing scheduler timing.
- [x] Tests:
  - [x] A note handle reports the scheduling lead plus note duration and completes after that interval.
  - [x] A multi-event pattern reports the final scheduled release, not merely the first event duration.
  - [x] Explicit cancellation resolves once as cancelled and stops the instrument.
  - [x] Starting a second engine stream cancels the first handle before scheduling the second.
  - [x] A pre-unlock handle is inert and already complete.
- Decision: expose durations as integer milliseconds by rounding the scheduling lead plus scheduled stream duration; this matches browser timer precision and avoids floating-point artifacts in controller/UI state.
- Decision: natural completion does not call `Instrument.stop()` because scheduled notes release themselves; cancelling before completion stops the instrument exactly once, while cancelling an already completed handle is inert.

## 2. Add the exclusive play controller and replacement queue

- Goal: one controller owns sequencing, toggle-to-stop behavior, replacement, and observable playback state, assuming startup supplied an unlocked engine.
- Tests:
  - A two-step autoplay request starts context and starts pattern only after context completes.
  - Clicking the currently active button cancels the handle, empties the queued prompt, and leaves the controller idle.
  - Clicking a different button cancels the active handle, discards the old queue, and immediately starts only the clicked step.
  - A cancelled or superseded handle's late completion cannot start stale queued audio.
  - Repeated stop/cancel operations are idempotent.

## 3. Unlock audio before constructing the app

- Goal: startup obtains the required user gesture, unlocks the engine, and only then constructs `PlayController`, `AppCtx`, state, and `AppView`.
- Tests:
  - Before unlock succeeds, neither the controller nor app context is constructed.
  - A successful startup gesture passes an unlocked engine into `startApp` and initial trial autoplay can begin immediately.
  - Unlock failure remains in the startup view, presents a retry path, and never mounts a partially usable app.
  - Completing or dismissing the install prompt proceeds to the audio startup gate.

## 4. Route controller lifecycle through the app

- Goal: `main.ts` constructs one controller, `AppCtx` exposes it, asynchronous controller messages re-enter the root dispatch loop, and route changes stop obsolete playback.
- Tests:
  - A controller completion message causes the app/view sync path to run without dispatch re-entrancy.
  - Leaving practice or options cancels active playback and clears queued work.
  - Entering practice requests exactly one autoplay sequence for the selected trial.

## 5. Integrate automatic trial playback

- Goal: each new transcription trial plays context then prompt; each new audiation presentation plays context only; revealing an audiation trial automatically plays its pattern without replaying context.
- Tests:
  - Initial, post-grade, and re-entered transcription trials request context then pattern in order.
  - Audiation presentation requests context only, while manual pattern playback remains blocked until reveal.
  - Committing an audiation trial requests only its pattern, without context, and replaces any presentation playback still active or queued.
  - Committing a transcription trial does not enqueue redundant reveal playback.
  - Grading while audio is active cancels the old trial before the next trial's sequence starts.
  - No-due state has no active or queued playback.

## 6. Add PlayButtonView and migrate sound controls

- Goal: trial context/pattern and options tonic/low/high controls all use one view and accurately display controller playback.
- Tests:
  - The component emits `PRESS` with its stable id.
  - Active state applies the playing class, duration style, and accessible pressed/busy state; inactive state removes them.
  - Reduced-motion styling retains a visible active treatment without a moving sweep.
  - During autoplay, the context button is active for the context step and the pattern button becomes active only when its step starts.
  - Options controls preserve their note labels, aria labels, slider-release preview behavior, and compact layout.

## 7. Record the design-system contract and validate

- Goal: the design-system skill names `PlayButtonView` and `PlayController` as the mandatory path for audible controls, with semantic theme tokens for the sweep.
- Tests:
  - Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build`.
  - Manually verify on a phone-sized viewport that same-button taps stop immediately, different-button taps replace immediately, autoplay order is audible, sweep timing matches sound, and controls remain readable in normal and reduced-motion modes.
