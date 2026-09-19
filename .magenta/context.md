# Project context

## Frontend

Use the project-local Vamp skill at `.magenta/skills/vamp/skill.md` whenever changing views, components, state management, or routing. Treat `vamp.ts` as authoritative when the skill and implementation differ.
Use the project-local design-system skill at `.magenta/skills/design-system/skill.md` whenever changing frontend colors, controls, icons, or other visual styling.

## Versioning

Every code or content change must include a minor bump to the displayed `APP_VERSION` in `version.ts` (for example, `0.1` → `0.2`).

## Testing

Read `docs/testing.md` before changing or running tests. Tests are colocated as `*.test.ts` and run with Playwright via `npm test`. Pure logic is imported directly; DOM tests execute real modules in the browser against `test/blank.html`, with shared browser fixtures in `test/*-harness.ts` and helpers in `test/support.ts`. The focused `*.activation.test.ts` suite runs in WebKit. Real Android coverage lives in `android/` and runs with `npm run test:android`.

## Directory layout

- `audio/`: playback scheduling and synthesis, playback orchestration, and microphone pitch detection.
- `deck/`: cards, profiles, persistence, and scheduling state.
- `inventory/`: the bundled pattern and song corpus.
- `music/`: core note, pitch, and formatting types and functions.
- `views/`: Vamp views and their reducers; view tests live beside them.
- `test/`: browser harness pages, fixtures, and shared test helpers.
- `android/`: Playwright tests and fixtures for attached Android devices or emulators.
- `pwa/`: install and offline/PWA behavior.
- `scripts/`: offline generation scripts.
- `docs/`: product, design, and testing documentation.
- `main.ts`: composition root for stores, controllers, audio, microphone, routing, and the root dispatch loop.

## Audio playback

`audio/engine.ts` defines `AudioEngine` and the Web Audio implementation. `soundfontEngine()` creates an `AudioContext` lazily during `AudioEngine.unlock()`, loads a `smplr` soundfont, schedules cadence/pattern/note playback on the context clock, and synthesizes the sustained tonic drone with oscillators. Audio unlock must remain behind an explicit user `click`/`onActivate` gesture; do not move it to `pointerdown`. `views/activity-catalog.ts` requests unlock from the landing-page activity link, and the situation start action in `views/tonic-practice-view.ts` provides the deep-link fallback; `views/app.ts` owns the unlock lifecycle and defers beginning a trial until unlock completes.

`audio/play-controller.ts` is the application-facing playback layer. `PlayController` toggles individual controls, replaces active playback, sequences autoplay steps, keeps the drone outside the playback queue, and reports completion through dispatched `PlayMsg`s. It is created in `main.ts` and injected through view context; views should request playback through it rather than using Web Audio directly.

## Microphone

`audio/mic-pitch.ts` owns microphone access and pitch analysis. `MicPitchDetector.start()` requests `getUserMedia()` with browser audio processing disabled, creates and resumes an `AudioContext`, samples an `AnalyserNode`, detects sung pitch, and dispatches `MicPitchMsg` progress/readings/errors. `stop()` clears sampling, stops every media track, and closes the context.

`main.ts` creates the detector and injects it into the options context. `views/options.ts` owns the microphone UI and reducer state, starts/stops the detector from an `onActivate` gesture, consumes dispatched readings, and may use the nearest detected MIDI note as the profile's home note. Keep microphone lifecycle in the detector and UI state transitions in the view reducer.
