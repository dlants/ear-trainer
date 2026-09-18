# Objective and Context

“Make the ‘identify the tonic notes’ exercise more general to ‘identify the notes’; it supersedes ‘sing the tonic’, so drop that activity. Before practice, the learner toggles a flat collection of musical situations. The selected situations determine both which phrases are sampled and which scale-degree answers are available. Situations may overlap or be supersets of one another; do not encode a prerequisite hierarchy yet.”

The initial situation catalog is:

1. **Tonic** — natural degree `1`.
2. **Dominant adjacent to tonic** — a direct `1 ↔ 5` move, with 5 above or below tonic.
3. **3 adjacent to tonic** — a direct `1 ↔ 3` move, with 3 above or below tonic.
4. **Movement within the tonic triad** — a contiguous run containing only natural `1`, `3`, and `5`, with all three degrees represented at least once; runs such as `1–3–5–3–5–1` qualify.
5. **Stepwise 2** — a three-event window centered on `2`, with each neighbor chosen from `1` and `3`: `1–2–3`, `3–2–1`, `1–2–1`, or `3–2–3`.
6. **Stepwise 4** — the analogous windows around `4`, bounded by `3` and `5`.
7. **7 adjacent to tonic** — a direct scalar-step `7 ↔ 1` move.
8. **Stepwise 6** — windows around `6`, bounded by `5` and `7`.
9. **Stepwise 7** — windows around `7`, bounded by `6` and `1`.
10. **Stepwise tonic** — windows around `1`, bounded by `7` and `2`.
11. **Stepwise 3** — windows around `3`, bounded by `2` and `4`.
12. **Stepwise 5** — windows around `5`, bounded by `4` and `6`.

The current implementation has two activity-specific state machines in `views/tonic-practice.ts`, two views in `views/tonic-practice-view.ts`, and two routes and catalog entries. Identification trials already support multiple `promptDegrees`, per-event answers, note playback, reveal, and a scrolling measure viewport. Phrase selection currently uses authored `tonicPractice` suitability and ignores melodic content beyond phrase length. The timed corpus already provides concrete, tonic-relative, octave-preserving melody events suitable for deriving situation occurrences at runtime.

Relevant files:

- `music/note.ts`: authoritative `Degree`, `Note`, and register-aware `noteOffset` definitions.
- `music/melody.ts`: normalized `Phrase`, melody-voice lookup, and current tonic-specific phrase suitability metadata.
- `inventory/melodies.ts`: authored timed corpus and phrase suitability classifications.
- `views/tonic-practice.ts`: current phrase selection, sing-tonic reducer, and identify-tonic reducer.
- `views/tonic-practice-view.ts`: current sing and note-identification views, answer palette, reveal, and playback UI.
- `views/activity-catalog.ts`, `views/app.ts`, `router.ts`, and `main.ts`: activity catalog, application composition, routing, and initial activity startup.
- `test/tonic-practice-harness.ts` and `test/app-harness.ts`: browser fixtures for activity views and application integration.
- `views/tonic-practice.test.ts`, `views/tonic-practice-view.test.ts`, `views/app.test.ts`, `router.test.ts`, and `inventory/melodies.test.ts`: focused reducer, view, integration, routing, and corpus coverage tests.

# Design

Replace the two tonic activities with one **Identify the notes** activity. Entering its route shows a situation-selection screen rather than immediately selecting or playing a phrase. Situations are independent toggles; the initial selection is tonic only. The learner can enable cumulative practice, select one situation for focused practice, or choose any other combination. No mastery, ordering, prerequisites, DAG, or persisted learner progression is introduced.

Situations are checked-in definitions backed by pure matchers over consecutive sounded events in a phrase’s `"melody"` voice. Matchers use only monophonic, unaltered notes. An altered note or chord cannot participate in an occurrence and breaks a candidate run or window. Degree-pair situations match the stated degree classes in either temporal direction and retain octave/register information. Stepwise situations additionally require the neighboring pitches to be genuinely adjacent in register, so an octave-displaced `1–2` does not qualify merely because its degree labels are adjacent. Situation 4 accepts a maximal or partial contiguous triad-only run of any length once all of `1`, `3`, and `5` have appeared.

Situation occurrences are derived from normalized phrases at runtime; the corpus does not acquire manually authored pattern tags. The existing phrase suitability remains an authored tonal-clarity gate but is renamed away from `tonicPractice` to reflect its use by the general identification activity. Initially, only `"independent"` phrases of at least two measures are searchable. Add corpus-wide coverage tests before relying on all twelve toggles; if a situation has no eligible example, fix the corpus classification/transcription deliberately rather than weakening the matcher silently.

The enabled situations determine the answer vocabulary by taking the sorted union of their degrees. `"other"` remains available for every note outside that union, including altered notes and chords. Reveal remains note-by-note and judges only the learner’s selected degree or `"other"`; it does not score whether a note belonged to the occurrence that caused the phrase to be selected. Situation metadata drives sampling, not annotation or correctness.

To prevent common situations from dominating cumulative practice, phrase selection first chooses uniformly among enabled situations that have eligible matches, then chooses a phrase from that situation’s candidates using the existing melody-first immediate-repeat avoidance. Store the chosen situation on the trial as selection provenance only. A phrase may match several enabled situations and may contain additional occurrences not used for selection. Selecting a single toggle therefore produces focused practice; selecting many toggles gives each selected situation an equal opportunity to drive the next phrase regardless of corpus frequency.

The selection screen lists all situations with a short description/example, current selected state, and the resulting answer choices. Start is disabled when no situations are selected or none of the selected situations has an eligible phrase. Starting selects and autoplays a phrase. A “change situations” action returns to the selector, stops playback, and preserves the current toggles but not the abandoned trial. The existing key, drone, playback, cursor, viewport, answer, reveal, and next-melody behavior remains in the practice screen. All dynamic UI is Binder-driven, toggles use `onPress`, audible actions remain `PlayButtonView` controls, and styling uses existing semantic theme tokens.

Remove the sing-tonic state, reducer, view, harness, route, catalog card, and integration branches. Rename the remaining activity, messages, state, and visible copy from tonic identification to note identification. Use `/activities/identify-notes` as the sole activity path; obsolete `/activities/sing-tonic` and `/activities/identify-tonic-notes` paths fall back to the catalog rather than preserving hidden activity aliases. Keep the existing source files unless a direct rename is useful during implementation; do not duplicate them into parallel “new” versions.

## Interfaces

```ts
export type SituationId =
  | "tonic"
  | "dominant-adjacent-tonic"
  | "third-adjacent-tonic"
  | "tonic-triad-movement"
  | "stepwise-2"
  | "stepwise-4"
  | "seventh-adjacent-tonic"
  | "stepwise-6"
  | "stepwise-7"
  | "stepwise-1"
  | "stepwise-3"
  | "stepwise-5";

export type SituationDefinition = {
  id: SituationId;
  label: string;
  description: string;
  degrees: readonly Degree[];
};

export type SituationOccurrence = {
  situationId: SituationId;
  eventIndexes: readonly number[];
};

export const SITUATIONS: readonly SituationDefinition[];

export function findSituationOccurrences(
  phrase: Phrase,
  situationId: SituationId,
): SituationOccurrence[];

export function phraseMatchesSituation(
  phrase: Phrase,
  situationId: SituationId,
): boolean;

export function promptDegreesForSituations(
  situationIds: readonly SituationId[],
): Degree[];
```

`SITUATIONS` uses these degree sets:

```ts
{
  tonic: [1],
  "dominant-adjacent-tonic": [1, 5],
  "third-adjacent-tonic": [1, 3],
  "tonic-triad-movement": [1, 3, 5],
  "stepwise-2": [1, 2, 3],
  "stepwise-4": [3, 4, 5],
  "seventh-adjacent-tonic": [1, 7],
  "stepwise-6": [5, 6, 7],
  "stepwise-7": [1, 6, 7],
  "stepwise-1": [1, 2, 7],
  "stepwise-3": [2, 3, 4],
  "stepwise-5": [4, 5, 6],
}
```

Rename the tonic-specific phrase suitability without changing its three authored values:

```ts
export type IdentificationPhraseSuitability =
  | "independent"
  | "context-required"
  | "exclude";

export type Phrase = Score & {
  id: string;
  melodyId: string;
  phraseIndex: number;
  noteIdentification: IdentificationPhraseSuitability;
  rationale: string;
};

export type CorpusMeasure = {
  durationTicks: number;
  beatDurationsTicks: number[];
  voices: CorpusMeasureVoice[];
  phraseEnd?: {
    noteIdentification: IdentificationPhraseSuitability;
    rationale: string;
  };
};
```

The activity becomes one state machine:

```ts
export type Activity = "identify-notes";
export type IdentifyNotesScreen = "situations" | "practice";
export type IdentifyNotesPhase = "answering" | "revealed";
export type MelodySlotAnswer = Degree | "other" | undefined;

export type IdentifyNotesTrial = {
  phrase: Phrase;
  targetSituationId: SituationId;
  phase: IdentifyNotesPhase;
  promptDegrees: Degree[];
  answers: MelodySlotAnswer[];
  selectedSlotIndex?: number;
  cursorEventIndex: number;
  firstVisibleMeasureIndex: number;
};

export type IdentifyNotesState = {
  screen: IdentifyNotesScreen;
  selectedSituationIds: SituationId[];
  trial: IdentifyNotesTrial | undefined;
  droneOn: boolean;
};

export type IdentifyNotesMsg =
  | { type: "TOGGLE_SITUATION"; situationId: SituationId }
  | { type: "BEGIN" }
  | { type: "CHANGE_SITUATIONS" }
  | { type: "PLAY_CONTEXT" }
  | { type: "TOGGLE_DRONE" }
  | { type: "PLAY_PAUSE" }
  | { type: "PLAY_FROM_BEGINNING" }
  | { type: "PLAY_EVENT"; eventIndex: number }
  | { type: "SELECT_SLOT"; eventIndex: number }
  | { type: "SET_ANSWER"; answer: MelodySlotAnswer }
  | { type: "REVEAL" }
  | { type: "SCROLL"; delta: -1 | 1 }
  | { type: "SYNC_PLAYBACK" }
  | { type: "NEXT" };

export type PhraseSelection = {
  phrase: Phrase;
  targetSituationId: SituationId;
};

export function selectIdentifyNotesPhrase(
  melodies: Melody[],
  selectedSituationIds: readonly SituationId[],
  previous: Phrase | undefined,
  random: () => number,
): PhraseSelection | undefined;
```

`initialIdentifyNotesState()` selects only `"tonic"`, starts on the `"situations"` screen, and has no trial. `BEGIN` and `NEXT` call `selectIdentifyNotesPhrase`; `BEGIN` changes to the practice screen only when selection succeeds. `CHANGE_SITUATIONS` stops playback, turns off the drone, clears the trial, and returns to the selector. Route entry and audio unlock mount the selector without dispatching an automatic start action.

## Invariants

- Situations are a flat toggleable collection. The model contains no prerequisite, parent, difficulty, mastery, or supersession relationship.
- Situation matching is pure and deterministic over the concrete `"melody"` voice. It does not inspect titles, rationales, answer state, accompaniment, or learner history.
- Only natural monophonic notes participate in occurrences. Altered notes and chords remain revealable events but are answered as `"other"` unless a later design explicitly expands the vocabulary.
- Stepwise matching respects register and actual pitch adjacency; degree labels alone cannot make an octave leap qualify.
- A situation occurrence may overlap another occurrence, and one phrase may satisfy any number of situations.
- Every enabled situation with corpus coverage has equal probability of being selected as the target before phrase selection. Corpus frequency must not silently weight cumulative practice.
- The trial’s `targetSituationId` records why the phrase was sampled but never changes slot labels, reveal output, or correctness.
- The answer palette is exactly `?`, the ascending union of enabled situation degrees, and `other`. Vocabulary is never independently configured.
- Every sounded melody event retains one note-level answer slot. Notes outside the enabled vocabulary are not hidden; they can be marked `other` and reveal their actual note afterward.
- Changing toggles affects subsequent trials. It does not rewrite an active trial’s prompt degrees or answers.
- The activity starts no audio until the learner presses Start. Key and drone support remain opt-in and begin off.
- Phrase selection continues to require authored independent tonal context and at least two complete measures, avoids immediate repetition where alternatives exist, and returns no trial cleanly when no candidate exists.
- The sing-tonic activity has no route, catalog entry, state, reducer, view, harness, or runtime dependency after this work.
- The selector and practice screen follow existing Vamp and design-system conventions: state-derived DOM through Binder, stable keys for situation controls and note slots, `onPress` for toggles/actions, semantic theme tokens, and `PlayButtonView` for every audible action.

# Stages

## Situation model and corpus coverage

- Goal: Add the twelve situation definitions and pure occurrence matchers, rename tonic-specific phrase suitability to note-identification suitability throughout normalization and corpus authoring, and verify that the current independent phrase corpus supports every situation.
- Tests:
  - Table-driven fixtures detect every accepted pattern and both temporal directions of pair situations.
  - Tonic-triad movement accepts `1–3–5–3–5–1` and other triad-only runs containing all three degrees, but rejects runs missing a degree or interrupted by a non-triad, altered, or polyphonic event.
  - Each stepwise matcher accepts all four combinations of its two bounding neighbors and finds qualifying windows inside longer melodies.
  - Octave-displaced degree sequences, altered notes, chords, and wrong central degrees do not produce false stepwise occurrences.
  - Prompt vocabulary is the sorted unique union of selected situation degree sets and is independent of toggle order.
  - Corpus tests report at least one independent phrase for each of the twelve situations and continue validating phrase length, tonal clarity, rationale, and normalized score structure after the metadata rename.

### Stage 1 progress (completed 2026-09-18)

- [x] Added the twelve flat situation definitions, pure occurrence matching, phrase matching, and sorted prompt-degree union logic in `music/situations.ts`.
- [x] Added table-driven matcher coverage for pair directions, all stepwise neighbor combinations, overlapping tonic-triad runs, and altered, polyphonic, interrupted, wrong-center, and register-invalid rejection cases.
- [x] Renamed phrase and corpus metadata from `tonicPractice`/`TonicPhraseSuitability` to `noteIdentification`/`IdentificationPhraseSuitability` throughout normalization, authoring, consumers, fixtures, and tests without changing the three authored values.
- [x] Added corpus-wide coverage proving every situation has at least one independent phrase of at least two measures; the current corpus needed no transcription or classification changes.
- Decision: pair situations match consecutive natural monophonic degree classes in either direction at any authored register. The three-event `stepwise-*` situations additionally require adjacent diatonic pitch positions, including the register crossing between 7 and 1.
- Decision: tonic-triad matching returns every qualifying contiguous subrun within a triad-only run once 1, 3, and 5 have all appeared, preserving overlapping occurrences for future sampling metadata.

## Situation-driven trial selection

- Goal: Collapse `views/tonic-practice.ts` to the identify-notes state machine. Add selector state and transitions, derive prompt degrees from toggles, select a target situation before selecting a matching phrase, and preserve the existing playback, answer, reveal, viewport, and immediate-repeat behavior.
- Tests:
  - Initial state shows the selector with only tonic enabled and no trial or playback.
  - Toggling situations adds and removes them without a separate vocabulary setting; the last situation may be removed, but Begin cannot start until at least one eligible situation is selected.
  - Deterministic randomness proves target situations are chosen before phrases, so a rare situation receives the same target probability as a common one.
  - Every selected trial matches its stored target situation, carries the union vocabulary, and may also match other enabled situations without changing its target.
  - Focus mode with one enabled situation selects only matching phrases; cumulative mode can select each enabled situation.
  - Immediate melody and phrase repetition avoidance remains deterministic and loop-free inside each target’s candidate pool.
  - Note answers outside the derived vocabulary are rejected, while `other`, unanswered, reveal locking, playback cursor synchronization, scrolling, next, and empty-corpus behavior remain correct.
  - Returning to situation selection stops playback and drone support, clears the trial, and preserves toggle choices.

### Stage 2 progress (completed 2026-09-18)

- [x] Added the single Identify Notes selector/practice state, tonic-only initial selection, toggle transitions, situation-derived prompt vocabulary, and clean return-to-selector behavior.
- [x] Added target-situation-first phrase selection over covered situations, followed by melody-first and phrase-level immediate-repeat avoidance within the chosen target's candidate pool.
- [x] Preserved note playback, cursor synchronization, answer validation, reveal locking, viewport scrolling, drone, context, and next-trial behavior in the generalized reducer.
- [x] Added deterministic tests for focused and cumulative practice, equal target opportunity despite unequal corpus frequency, empty and uncovered selections, vocabulary snapshots, repeat avoidance, and playback/drone cleanup.
- Decision: target sampling excludes selected situations with no eligible phrase, so each selected situation that can currently produce a trial receives one equal slot in the target pool.
- Decision: the old identify-tonic exports remain thin compatibility adapters for existing Stage 3/4 consumers; all identification behavior delegates to the new Identify Notes state machine, while sing-tonic remains untouched until its planned integration removal.

## Situation selector and generalized exercise view

- Goal: Replace the sing-tonic and identify-tonic views with one Identify the notes view containing a Binder-driven situation selector and the existing note-level practice screen. Update copy, palette labels, empty states, and controls for multi-degree identification without exposing the target occurrence as a special annotation.
- Tests:
  - The selector renders all twelve stable situation IDs, concise examples, tonic selected by default, and a live summary of the resulting answer choices.
  - Pointer and keyboard activation toggle only the chosen situation, preserve keyed control identity, and enable or disable Start based on eligibility.
  - Starting practice autoplays one matching phrase and renders one answer slot for every sounded melody event, not only events belonging to a matched occurrence.
  - A combined situation selection produces the expected ordered palette plus `?` and `other`; selecting, clearing, and replacing an answer changes only the active slot.
  - Reveal displays every actual note and correct/incorrect attention marker using the existing semantic treatments, without marking or naming the target situation inside the phrase.
  - “Change situations” returns to the same toggle selection; “next melody” keeps the current selection and chooses another target/phrase.
  - Existing viewport geometry, keyed slot stability, note tapping, cursor persistence, playback controls, scrolling, and narrow mobile layout continue to work.

## Remove sing-tonic and integrate the sole activity

- Goal: Remove sing-tonic runtime code and tests; expose only Identify the notes at `/activities/identify-notes`; simplify app state, messages, startup, catalog, harnesses, and route handling; and update design documentation to describe situations as the flat practice-selection unit.
- Tests:
  - The catalog contains one Identify the notes card and no sing-tonic copy or link.
  - Router round-trips `/activities/identify-notes`; both obsolete tonic activity paths fall back to the catalog, and browser back/forward restores the selector and catalog correctly.
  - App integration mounts the selector without autoplay, preserves the explicit audio-unlock gate, starts playback only after Begin, synchronizes playback cues during practice, and stops playback/drone on navigation.
  - No production or test import references sing-tonic state, messages, reducer, view, or harness after removal.
  - Existing options, navigation, startup, corpus playback, and disconnected legacy SRS behavior remain unchanged.
  - Update `docs/v2-design.md` and About copy where they still describe two tonic activities or defer contextual note identification; bump `APP_VERSION` as required.
  - `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` pass.
