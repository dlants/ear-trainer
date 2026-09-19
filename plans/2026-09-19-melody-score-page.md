# Objective and Context

> For viewing the melody, I want to be able to see the whole song on a dedicated page, with individual notes / chords, like they would appear in the "reveal" view. Let's generalize that view and reuse it for this purpose.

The "reveal" display is the note/chord grid in the identify-notes activity. Today it lives entirely inside `views/tonic-practice-view.ts` and is welded to `IdentifyNotesTrial`: cells and harmony regions render answers, guesses, correct/incorrect results, selection and cursor state, and the grid only shows a `VISIBLE_MEASURE_COUNT`-sized window of one phrase. We want the same visual grid, fully revealed and non-interactive with respect to answers, for an entire melody on its own page.

## Key entities

- `Score` (`music/melody.ts:57`) — `{ context, tempoBpm, durationTicks, voices, measures, harmony }`. Both `Melody` (`:86`) and `Phrase` (`:71`) extend it, so the grid can be defined over `Score` and serve both.
- `Measure` (`:23`), `HarmonyRegion` (`:44`), `Chord` (`:31`).
- Derived display structures: `Cell` (`:439`, has `laneIndex`), `Onset` (`:450`), `Lane` (`:456`), built by `cells(score)` (`:512`) and `lanes(score)` (`:504`). These already take a `Score`, not a `Phrase`.
- `IdentifyNotesTrial` (`views/tonic-practice.ts:51`) caches `cells`, `onsets`, `lanes` plus practice state (`phase`, `selection`, `cursorOnsetIndex`, `firstVisibleMeasureIndex`, answers).
- Grid views in `views/tonic-practice-view.ts`: `spanStyle` (`:314`), `CellState`/`CellView` (`:326`/`:367`), `StackState`/`StackButtonView` (`:449`/`:459`), `RegionState`/`HarmonyRegionView` (`:499`/`:517`), `MeasureState`/`MelodyMeasureView` (`:605`/`:618`), and the measure `bindList` at `:1131`.
- `Route` (`router.ts:3`), `parseRoute` (`:13`), `routeToPath` (`:25`).

## Files touched

- `views/tonic-practice-view.ts` — source of the grid; becomes a consumer of the extracted module.
- `views/score-grid.ts` (new) — the generalized presentational grid.
- `views/melody-page.ts` (new) — dedicated per-melody page.
- `views/melodies.ts` — list page; links each melody to its page.
- `router.ts` — new route.
- `main.ts` / `views/app.ts` — mount the new page.
- `version.ts` — version bump.

# Design

Split the grid into a purely presentational module that knows about a `Score` and its derived cells/onsets/lanes, and a thin per-use-case "annotation" layer supplying the practice-specific decoration.

`views/score-grid.ts` exports `ScoreGridView`, which renders a list of `MeasureView`s, each with the existing three tracks (stack track, cell track, harmony track) and the existing absolute `spanStyle` positioning. It takes the score plus precomputed `cells`/`onsets`/`laneCount`, a measure window, and a `mode` discriminant. It emits structural messages only: `CELL`, `ONSET`, `REGION`.

The two modes are hard-coded in the view:

- `reveal` — every cell and harmony region shows its true note/chord label. No answers, no guesses, no result icons, no selection or cursor highlighting. Carries no extra data.
- `guess` — the identify-notes behavior: labels come from the recorded answer until the trial is revealed, and the revealed state additionally renders the struck wrong guess, the correct/incorrect icons, the selected cell/region, and the onset cursor. Carries the practice data it needs.

The identify-notes view keeps ownership of the practice state and just hands the grid a `guess` mode payload built from the trial, mapping the grid's structural messages onto `PLAY_CELL`/`SELECT_CELL`/`PLAY_ONSET`/`PLAY_REGION`/`SELECT_REGION` exactly as today. The measure-window slicing also stays in the practice view; the grid just accepts `firstMeasureIndex` + `measureCount`.

The melody page renders the whole melody score with `mode: { kind: "reveal" }`, `firstMeasureIndex: 0`, and `measureCount: score.measures.length`. Its grid messages map to playback only (play a cell, play a stack, play a chord region), through `ctx.play` the same way `views/melodies.ts` already plays melodies and phrases.

CSS currently lives in the practice view's stylesheet scoped under `pageClass`. The grid's styles (measure, tracks, cell button, stack button, harmony segment, result icons, struck guess, selected/correct/incorrect modifiers) move into `score-grid.ts` behind its own `mountStyle` and class names, scoped to a `scoreGridClass` root instead of `pageClass`. Practice-only chrome (palette, viewport controls, page padding) stays behind.

Reasoning for a `Score`-shaped grid rather than a `Phrase`-shaped one: `cells()`/`lanes()` already accept `Score`, and a melody is exactly a score, so nothing needs to be faked or wrapped. Reasoning for callback annotations rather than precomputed per-cell arrays: the practice view already recomputes decoration on every sync from the trial, and callbacks avoid building a parallel array that has to stay index-aligned with `cells`.

## Interfaces

`views/score-grid.ts`:

```ts
/** `Selection`, `CellAnswer`, `ChordAnswer` are reused from the practice modules. */
export type ScoreGridMode =
  | { kind: "reveal" }
  | {
      kind: "guess";
      /** True once the trial is revealed; drives result icons and true labels. */
      revealed: boolean;
      chordAnswerable: boolean;
      cellAnswers: Record<CellId, CellAnswer>;
      chordAnswers: Record<RegionId, ChordAnswer>;
      selection: Selection | undefined;
      cursorOnsetIndex: number;
    };

export type ScoreGridState = {
  /** Stable prefix for keyed measure children, e.g. the phrase or melody id. */
  key: string;
  score: Score;
  cells: Cell[];
  onsets: Onset[];
  laneCount: number;
  firstMeasureIndex: number;
  measureCount: number;
  promptDegrees: Degree[];
  mode: ScoreGridMode;
};

export type ScoreGridMsg =
  | { type: "CELL"; cellId: CellId }
  | { type: "ONSET"; onsetIndex: number }
  | { type: "REGION"; regionId: RegionId };

export class ScoreGridView implements View<ScoreGridState, ScoreGridMsg> {}
```

`views/melody-page.ts`:

```ts
export type MelodyPageCtx = { play: PlayController; profile: Profile; melodies: Melody[] };
export type State = { melodyId: string };
export type Msg =
  | { type: "PLAY_MELODY" }
  | { type: "GRID"; msg: ScoreGridMsg };
export function initialState(melodyId: string): State;
export function update(state: State, msg: Msg, ctx: MelodyPageCtx): void;
export function melodyPageMsgNeedsAudio(msg: Msg): boolean; // always true
export class MelodyPageView implements View<State, Msg, MelodyPageCtx> {}
```

`router.ts`:

```ts
| { page: "melody"; melodyId: string }   // path: /melodies/{melodyId}
```

`parseRoute` gains a `/melodies/{id}` match ahead of the existing `/melodies` case; `routeToPath` returns `/melodies/${melodyId}`. An unknown id falls through to the melody list page rather than erroring.

## Invariants

- Extracting the grid must not change the rendered DOM of the identify-notes view: same element structure, same `data-ref`/`data-part`/`data-result` attributes, same keyed measure identities, so the existing `views/tonic-practice-view.test.ts` suite passes unchanged apart from class-name renames.
- The practice view must continue to derive `revealed` from `trial.phase === "revealed"` and `chordAnswerable` from `chordAnswerable(phrase)`; the grid never decides these, it only branches on the mode it is given.
- In `reveal` mode the grid must render no result icons, no struck guesses, and no selected/cursor styling, regardless of what else is in state.
- The grid renders measures `[firstMeasureIndex, firstMeasureIndex + measureCount)`; the melody page passes the full range and therefore must not depend on `VISIBLE_MEASURE_COUNT`.
- Cell `laneIndex` is assigned relative to the whole score's lanes, so the melody page must pass `laneCount` from `lanes(melody).length` and give the cell track that full height; a melody with many voices gets a taller track, not clipped rows.
- Grid keys must include the score key, so navigating between melodies fully rebuilds measure children.
- Melody-page playback still goes through `PlayController` and must be gated by the app's audio-unlock path like every other playback entry point.

# Stages

## extract the score grid — DONE

- Goal: `views/score-grid.ts` exists and owns the measure/cell/stack/harmony rendering and its CSS; `views/tonic-practice-view.ts` renders its grid through `ScoreGridView` with trial-derived annotations, and behaves identically.
- Done. Notes and deviations:
  - `views/score-grid.ts` owns the grid rendering (`CellView`, `StackButtonView`, `HarmonyRegionView`, `MeasureView`, `ScoreGridView`), the label/result helpers (`cellResult`, `chordResult`, `diatonicRoman`, note/chord labels), `spanStyle`, the lane constants, and the CSS, now scoped under `scoreGridClass` instead of `pageClass`.
  - `diatonicRoman` is exported from `score-grid.ts` because the practice view's answer palette still needs it.
  - The per-measure slicing of cells/stacks/regions moved *into* the grid (it takes `cells`/`onsets`/`laneCount` plus `firstMeasureIndex`/`measureCount`), so the melody page will not have to repeat it. The practice view still owns `firstVisibleMeasureIndex` and passes `VISIBLE_MEASURE_COUNT`.
  - The practice view mounts the grid with `bindSlot` into the existing viewport element, so there is one extra wrapper `<div class="score-grid…">` between the viewport and the measures. All existing tests query by descendant selectors, so they pass unchanged.
  - `MeasureState` no longer carries the trial: it carries `hasHarmony`, `promptDegrees` and the `mode`, and cell/region annotations are derived by `cellAnnotation`/`regionAnnotation`.
- Tests:
  - The whole existing `views/tonic-practice-view.test.ts` suite passes with no behavioral edits — this is the real proof the extraction was faithful.
  - A new `views/score-grid.test.ts` DOM test mounts `ScoreGridView` directly on a corpus melody in `reveal` mode and asserts one button per cell with the right note labels, harmony segments with chord labels, stack buttons only at onsets with more than one sounding note, and no result icons or guess spans anywhere.
  - Mounting the grid with a measure window smaller than the score renders only the windowed measures.
  - Added a third case: harmony segments in reveal mode show the real chord label, are `data-answerable="false"`, and emit `REGION`.

## melody page — DONE

- Goal: `/melodies/{id}` renders the melody title, source, a play button, and the full revealed grid for the whole melody.
- Done. Notes and deviations:
  - `views/melody-page.ts` holds `State = { melodyId }`, `Msg = PLAY_MELODY | GRID`, `update`, `melodyPageMsgNeedsAudio` (always true), and `MelodyPageView` (title, source, compact play button, full-score `ScoreGridView` in `reveal` mode).
  - The page keeps no state of its own beyond the id, so `views/app.ts` derives it straight from the route instead of storing a `melodyPage` slice; only `pendingMelodyPageMsg` was added to app state, wired through the existing unlock/`AUDIO_UNLOCKED` path.
  - `sameRoute` now also compares `melodyId`, so melody→melody navigation stops playback and rebuilds the page.
  - Grid playback: `CELL`/`ONSET` autoplay a `notes` step under the shared `melodies:note` button id; `REGION` autoplays the melody score with the region's tick `range` (same mechanism the practice view uses).
  - The unknown-id fallback lives in the app's page slot (`case "melody"` renders `MelodiesView` when the id is not in the corpus), so `parseRoute` stays corpus-agnostic.
  - `ctx.melodyPage` added to `AppCtx` in `main.ts` and `test/app-harness.ts`.
  - Bumped `APP_VERSION` to `0.67` here rather than waiting for stage 3.
- Tests:
  - Navigating to `/melodies/twinkle` renders every measure of twinkle (count matches `melody.measures.length`) with all notes labeled, no guess/result icons present.
  - Pressing a cell asks the `PlayController` to play that note; pressing a harmony segment plays that chord; the recording play fixture in `test/app-harness.ts` verifies the requests.
  - `parseRoute("/melodies/twinkle")` and `routeToPath` round-trip; an unknown id renders the melody list instead of crashing.

## link it up

- Goal: the melody list links each entry to its page, and the app mounts the route.
- Tests:
  - Clicking a melody title in the melody browser navigates to that melody's page (the router link interception path, not a direct dispatch).
  - A back link from the melody page returns to `/melodies`.
- Also: bump `APP_VERSION` in `version.ts` (already at `0.67` from stage 2; bump again).
