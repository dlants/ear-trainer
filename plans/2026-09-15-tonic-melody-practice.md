# Objective and Context

“Having a large corpus of simple songs is going to be a good starting point. Let's just start by doing that, without committing to fragmenting them any particular way. With a small enough corpus we can generate exercises on the fly—we just need them in a form that we can extract the relevant information (degree, beats, phrases) quickly. From there we can start with some very simple exercises: hear a tune, sing the tonic; hear a tune, identify the tonic notes.”

The first increment will make complete, rhythmically represented melodies the source material and make an activity catalog the primary product surface. The existing SRS implementation may remain in the repository, but its practice, cards, and song-library views are removed from routing and navigation rather than migrated to the new model. This increment does not add a scheduler, infer learner mastery, or persist progression. Its purpose is to establish useful corpus infrastructure and test two representative tasks before committing to a larger learning model.

The current `CorpusMelody` stores only an unmetered degree string. `deriveInventory` parses that string into fixed-duration patterns, while `Song` stores only the resulting pattern tiling. `AudioEngine.playPattern` applies one fixed spacing to every event. The new corpus representation must preserve the existing `Note`/`Event` pitch model while adding rhythm, authored beat grouping, bars, phrase boundaries, and source provenance.

Relevant files:

- `music/note.ts`: authoritative scale-degree, alteration, octave, event, and context types.
- `music/format.ts`: existing parser for degree/chord tokens.
- `inventory/corpus.ts` and `scripts/derive-inventory.ts`: existing SRS source and derivation pipeline, left unchanged and disconnected from the new activity routes.
- `inventory/melodies.ts`: new complete timed-song corpus for activity-based practice.
- `audio/engine.ts`: schedules cadence, pattern, and note playback.
- `audio/play-controller.ts`: application-facing playback queue and button ownership.
- `views/app.ts`, `router.ts`, `views/nav.ts`, `main.ts`: route, state, dependency, and navigation composition.
- `docs/testing.md`: Playwright conventions for pure logic and browser view tests.

# Design

Store each song once as a complete authored score. Phrase boundaries remain compact metadata in the checked-in corpus, but normalization materializes each phrase as a concrete standalone score with its own rebased measures, voices, and events. Exercises pass these concrete phrases around rather than repeatedly combining a melody with a tick range.

Corpus entries use structured TypeScript rather than a custom notation DSL. Authored scores are nested into measures and voices; events within one voice and measure are sequential and carry integer tick durations. Existing `Note`/`Event` values remain authoritative for pitch, octave, and simultaneity. An explicit rest is an authored event with `notes: []`; normalization uses it to advance that voice's cursor and represents the resulting silence as a gap between sounded events.

Each authored measure declares its actual tick length and an array of positive beat-group durations whose sum equals that length. This directly represents the boundaries needed by the rhythmic display without modeling a time-signature denominator or inferring perceived beats. Pickups, shortened final measures, changing beat groupings, compound meter, and intentionally mixed measure lengths require no special measure category.

A normalized melody uses absolute tick positions from the beginning of the song. Each materialized phrase is a separate zero-based score: its first measure starts at tick `0`, every included voice has events rebased to that phrase timeline, and its duration and measures are directly available. The initial corpus may contain only a `"melody"` voice, but melodies, phrases, and the playback scheduler support additional independent voices. Chords remain one event containing multiple simultaneous notes.
The corpus should grow to at least 50 simple, singable, public-domain melodies or traditional tunes. Each transcription must include a source note and be checked for tonic-relative pitch, rhythm, beat grouping, pickup, bar boundaries, and musically meaningful phrase boundaries. Famous songs remain useful material; selection only avoids immediate repetition and does not claim that every song is unfamiliar.

Phrase segmentation and tonic-exercise suitability are separate authored decisions. Each phrase is classified as `"independent"`, `"context-required"`, or `"exclude"`. Initial tonic-identification exercises select only `"independent"` phrases: conservative candidates in the song's declared key with enough sounded material, at least one natural tonic event, and clear tonic evidence such as repeated tonic emphasis or a tonic arrival. Phrases with altered notes, local tonicization, dominant emphasis, unresolved endings, or insufficient tonal evidence are marked `"context-required"` or `"exclude"` rather than treated as beginner examples.

An LLM may propose phrase boundaries and suitability for these simple, well-known tunes when given the complete scale-degree score, rhythm, bar and beat grouping, declared key, and a fixed rubric. It must provide a brief note-level rationale for each classification. This is corpus-authoring assistance, not runtime inference or an authoritative musical judgment: uncertain cases default to exclusion, classifications remain editable, and learner reports can identify examples that should be retired or reclassified later.

The landing page is an activity catalog. It lists **Sing the tonic** and **Identify the tonic notes** as direct activity links and is designed to accept additional activities later. Activities do not live in the hamburger menu. The existing SRS practice, cards, and song-library views have no routes or navigation links; their source can remain untouched until removing it becomes useful.

- **Sing the tonic:** randomly select and play an eligible authored melody fragment of at least two complete measures, ask the learner to sing home, then reveal by playing the profile's home tonic. Two- and three-measure fragments are expected to be common, but longer musically complete fragments remain eligible. The learner self-checks and either repeats the same fragment or presses next to have the app randomly select another. Cadence and drone controls remain available as optional support, but the activity never starts either automatically.
- **Identify the tonic notes:** randomly select an eligible authored melody fragment of at least two complete measures, play it, and render a pitch-neutral rhythmic display. Each measure is a distinct horizontal row with explicit bar boundaries and beat divisions; sounded melody events appear as selectable slots positioned within that grid, with duration-proportional width. Rests remain visible as empty time. Slots never move vertically or otherwise encode pitch. Repeat keeps the same fragment; next asks the app to randomly select another eligible fragment.

Every identification slot begins unanswered and visibly displays `?`. Pressing a slot selects it and exposes a shared answer palette. For the initial tonic prompt the palette is `?`, `1`, and `not 1`; choosing `not 1` stores the generic `"other"` answer. The interaction is deliberately not a binary toggle: future prompts can offer `?`, `1`, `3`, and `other` without replacing the timeline or slot model. The prompt determines which degree choices appear, while the stored answer remains a degree, `"other"`, or unanswered.

The display is a three-row vertical viewport: it shows at most three consecutive complete measures, one measure per row. Longer fragments remain intact and use labeled up/down controls with shared arrow icons to scroll the viewport by one measure. The controls disable at the first and last valid positions and a text indicator states the visible range, such as “bars 2–4 of 6.” Scrolling changes only the visible measures; answers remain attached to event indexes across the complete fragment.

During fragment playback, the currently sounding melody-event slot receives a non-color-only playing indication. The viewport automatically scrolls by the minimum amount needed to keep that slot's measure visible; replay starts at the first measure. Playback progress comes from the shared playback layer using the same scheduled event timeline as the audio; the view does not run an independent timer. On reveal, each slot retains the learner's answer and additionally shows its expected answer and correct, missed, extra, or unanswered result through text/symbol treatment reinforced by semantic color. Replay remains available before and after reveal.

Both activities use the melody itself as the primary orienting information while leaving optional cadence and drone support under learner control. They do not add grading, history, automatic difficulty, or microphone scoring. Activity-local state only prevents an immediate repeat and supports answer, reveal, repeat, and next actions.

## Interfaces

```ts
export const TICKS_PER_QUARTER = 24;

export type TimedEvent = Event & {
  onsetTicks: number;
  durationTicks: number;
};

export type Voice = {
  id: string;
  events: TimedEvent[];
};

export type Measure = {
  startTicks: number;
  endTicks: number;
  beatDurationsTicks: number[];
};

export type Score = {
  context: Context;
  tempoBpm: number;
  durationTicks: number;
  voices: Voice[];
  measures: Measure[];
};

export type TonicPhraseSuitability =
  | "independent"
  | "context-required"
  | "exclude";

export type Phrase = Score & {
  id: string;
  melodyId: string;
  phraseIndex: number;
  tonicPractice: TonicPhraseSuitability;
  rationale: string;
};

export type MelodySource = {
  description: string;
  status: "public-domain" | "traditional" | "original";
};

export type Melody = Score & {
  id: string;
  title: string;
  phrases: Phrase[];
  source: MelodySource;
};

export type CorpusEvent = Event & {
  durationTicks: number;
};

export type CorpusMeasureVoice = {
  voiceId: string;
  events: CorpusEvent[];
};

export type CorpusMeasure = {
  durationTicks: number;
  beatDurationsTicks: number[];
  voices: CorpusMeasureVoice[];
  phraseEnd?: {
    tonicPractice: TonicPhraseSuitability;
    rationale: string;
  };
};

export type CorpusMelody = Omit<
  Melody,
  "durationTicks" | "voices" | "measures" | "phrases"
> & {
  measures: CorpusMeasure[];
};
```

Authored events are sequential only within their measure and voice. Melody normalization converts them to absolute onsets, carries each voice across measures, removes explicit rests while preserving their time, and validates score structure with errors that include the melody ID. A voice omitted from a measure is silent for that complete measure; a voice present in a measure must account for exactly `durationTicks`, including any leading or internal rests. `phraseEnd` closes a phrase at the measure's end, so authored phrase boundaries cannot split a measure.

During that same load step, normalization materializes each phrase from its consecutive source measures. Phrase measures and events are copied and rebased so the first measure starts at tick `0`; every melody voice appears in the phrase, even when its concrete `events` array is empty. The resulting phrase is self-contained for playback, answer calculation, and display. The source melody remains canonical, but downstream code does not receive or operate on source tick ranges.

```ts
export function normalizeMelody(entry: CorpusMelody): Result<Melody>;
export function voice(phrase: Phrase, voiceId: string): Voice | undefined;
export function tonicEventIndexes(phrase: Phrase, voiceId: string): number[];
```

`tonicEventIndexes` indexes the concrete sounded events in the phrase's selected voice and treats any unaltered degree 1, in any octave, as tonic. Tonic-identification exercises explicitly select the `"melody"` voice; accompaniment voices do not contribute answers.

Extend playback through the existing controller rather than calling `AudioEngine` from the view:

```ts
export interface AudioEngine {
  // existing methods
  playScore(score: Score, tonic: Midi): PlaybackHandle;
}

export type PlaybackCue = {
  eventIndex: number;
  onsetMs: number;
  endMs: number;
};

export type PlayStep =
  | ExistingPlaySteps
  | {
      buttonId: "tonic:melody";
      type: "score";
      score: Score;
      tonic: Midi;
    };
```

Score scheduling converts concrete score ticks to seconds from `tempoBpm`, schedules every voice on the shared zero-based timeline, preserves silent gaps, and gives each sounded note a small articulation gap without changing its onset. A score playback handle exposes cues for the selected `"melody"`-voice events using the same tick-to-time conversion as audio scheduling. `PlayController` owns cancellable cue timers, publishes the active `eventIndex` in `PlayState`, and clears it on gaps, cancellation, completion, or replacement. Views only bind against controller state; they do not estimate playback position. The controller continues to enforce one active stream and owns cancellation/completion.

The activity page uses a top-level discriminated union to select the exercise. Each exercise owns a separate state machine, trial shape, messages, and reducer; shared routing and context do not introduce a combined trial with fields that are irrelevant to one exercise.

```ts
export type TonicActivity = "sing-tonic" | "identify-tonic-notes";

export type SingTonicPhase = "presenting" | "revealing";
export type IdentifyTonicPhase = "answering" | "revealed";

export type MelodySlotAnswer = Degree | "other" | undefined;

export const VISIBLE_MEASURE_COUNT = 3;

export type SingTonicTrial = {
  phrase: Phrase;
  phase: SingTonicPhase;
};

export type IdentifyTonicTrial = {
  phrase: Phrase;
  phase: IdentifyTonicPhase;
  promptDegrees: Degree[];
  answers: MelodySlotAnswer[];
  selectedSlotIndex?: number;
  firstVisibleMeasureIndex: number;
};

export type SingTonicState = {
  activity: "sing-tonic";
  trial: SingTonicTrial | undefined;
};

export type IdentifyTonicState = {
  activity: "identify-tonic-notes";
  trial: IdentifyTonicTrial | undefined;
};

export type TonicPracticeState = SingTonicState | IdentifyTonicState;

export type TonicPracticeCtx = {
  play: PlayController;
  profile: Profile;
  melodies: Melody[];
  random(): number;
};
```

Make `/` the activity catalog and add `/activities/sing-tonic` and `/activities/identify-tonic-notes`. Remove the existing SRS practice, cards, and song-library pages from the `Route` union, route parsing, app composition, and hamburger menu without deleting their implementation files or persisted data. Requests for their former paths fall back to the catalog. The hamburger menu links only home, options, and about; it does not duplicate the activity catalog. Activity routes preserve explicit audio unlock: if audio is still locked, they show the existing start interaction before mounting the activity.

## Invariants

- Complete melodies are the canonical authored corpus records. Normalization materializes concrete zero-based `Phrase` scores in memory; phrases are derived values, not separately authored or persisted pattern identities.
- Existing `Note`, `Event`, degree spelling, alteration, octave, and `Context` semantics remain authoritative.
- Melody playback never prepends the cadence or enables the drone automatically; the page exposes the existing cadence and drone controls so the learner may use either deliberately.
- All audible controls go through `PlayButtonView` and `PlayController`; views never call `AudioEngine` directly or implement playback or slot-highlight timers.
- The activity catalog is the only routed path into practice. SRS implementation files and persisted data may remain, but no SRS practice, cards, or song-library route or navigation entry remains.
- Identification slots correspond to sounded `"melody"`-voice events, not inferred pitches or equal-width pseudo-notes. Each measure is a separate row with explicit bar and beat boundaries; onset and duration position the slots without encoding pitch, and rests remain gaps.
- Every selected `Phrase` contains at least two complete concrete measures. The identification view shows at most three measure rows and scrolls longer phrases without truncating or consulting the source melody.
- Slot answers are extensible degree labels plus `"other"` and unanswered. The initial tonic activity offers only `1` and `not 1`, while the state model supports later multi-degree prompts.
- The top-level activity discriminator selects either the sing-tonic or identify-tonic-notes state machine. Exercise-specific phases, trial fields, messages, and transitions do not appear in the other exercise's state.
- Playback highlighting uses controller-published cues derived from the audio schedule and is cleared whenever no melody event is sounding. The active cue keeps its measure within the three-row viewport using minimal vertical scrolling.
- A phrase boundary must be a measure boundary. Authored boundaries cover the melody without overlap, and the final phrase ends at the final measure. Every materialized phrase starts at tick `0`, has contiguous zero-based measures, contains concrete rebased voices, and carries its authored tonic-practice suitability and rationale; `"independent"` phrases spanning at least two complete measures are eligible for either initial activity.
- Every measure explicitly declares a positive integer `durationTicks` and nonempty positive-integer `beatDurationsTicks` whose sum equals it. Event durations are positive integer ticks. Beat grouping is authored data and is never inferred from a time signature.
- Melody events have absolute onsets from the start of the melody; phrase events have concrete onsets from the start of the phrase. Events remain within their score and measure and do not overlap other events in the same voice. Independent voices may overlap freely.
- Authored rests advance one voice's cursor but are omitted from normalized sounded events; omitted voices are silent for the complete measure.
- Corpus IDs are stable and unique. Existing song IDs remain unchanged during migration.
- Corpus entries include provenance and only ship when their use status is understood.
- The tonic answer is the profile's home-register tonic. Tonic occurrences in a melody may use any octave.
- The tonic-practice experiment does not write deck cards, trial logs, or new persistent learner state.
- Existing generated inventory, SRS views, and deck persistence are not migrated or deleted; they are disconnected from runtime composition. Audio unlock behavior, profile scoping, and microphone lifecycle continue to work.
- New controls and event markers follow the local Vamp and design-system skills: declarative bindings, `onPress`, existing semantic theme tokens, and shared playback controls.

# Stages

## Structured timed score model

- Status: Completed in Stage 1. Added the authored/normalized score model, pure normalization and lookup helpers, phrase materialization, structural validation, and focused pure tests.
- Decisions: Phrase IDs use the stable form `<melody-id>:phrase-<one-based-number>` while `phraseIndex` remains zero-based. Duplicate declarations of the same voice within one measure are rejected because they would overlap when normalized. Normalized melodies and phrases deep-copy mutable measure, event, note, beat-group, and source data so corpus records, full scores, and phrase scores can be used independently.

- [x] Goal: Add `music/melody.ts` with the structured authored and normalized score interfaces and pure helpers above. Normalize measure-local, sequential voice events into a concrete melody and materialize each authored phrase as a self-contained zero-based `Score` with rebased measures, voices, and events. Validate voice timing, measure lengths, beat groupings, phrase boundaries, phrase rebasing, and final score coverage with descriptive errors including the melody ID.
- Tests:
  - [x] A fixture with short, nominal, and extended declared measure lengths, changing beat groupings, two phrases, octave notes, an authored rest, and two independent voices produces the expected melody onsets plus concrete zero-based phrase measures, voices, events, silent gaps, beat boundaries, IDs, and durations without meter or measure-kind metadata.
  - [x] Invalid duration, overfilled or underfilled voice, overlapping normalized event, empty beat grouping, nonpositive or fractional beat duration, beat durations that do not sum to the measure duration, and missing final phrase boundary report useful errors including the melody ID.
  - [x] Pickup `[24]`, simple triple `[24, 24, 24]`, and compound grouping `[36, 36]` normalize without special cases.
  - [x] Materialized phrases cover the source measures exactly once; mutating neither source nor phrase is required to use the other, and tonic detection on a concrete phrase's `"melody"` voice includes `1`, `1↑`, and `1↓` but excludes altered tonic and accompaniment events.

## Add the timed melody corpus

- Status: Completed in Stage 2. Added a separate 66-melody timed corpus with normalized exports, provenance, authored rhythms and beat groups, measure-boundary phrases, conservative tonic-practice classifications, and corpus-wide tests. The existing SRS corpus, generated inventory, songs, and derivation pipeline were not changed.
- Decisions: Corpus authoring uses small typed constructors for explicit event durations, beat-grouped measures, and phrase metadata while the exported records remain ordinary `CorpusMelody` values. Most clear major-key strains are marked `"independent"`; dominant-ending strains and modal/minor examples default to `"context-required"`. The initial corpus uses only the `"melody"` voice, includes pickups, common/triple/compound groupings, and an authored full-measure rest, and exports both canonical `MELODY_CORPUS` records and load-time-normalized `MELODIES`.

- [x] Goal: Add `inventory/melodies.ts` as a separate structured corpus without changing `inventory/corpus.ts`, generated patterns and songs, or `scripts/derive-inventory.ts`. Transcribe at least 50 simple melodies with rhythm, beat grouping, phrase, tonic-practice suitability, rationale, and source metadata. Existing tune IDs may be reused in this separate namespace where useful. Prefer public-domain or traditional material, make independent transcriptions, and keep a source/provenance note on every entry. Use an LLM with the complete score and fixed conservative rubric to propose phrase classifications where useful; retain the note-level rationale, mark tonally clear phrases of at least two measures as `"independent"`, default uncertain phrases to `"context-required"` or `"exclude"`, and keep all classifications editable. Use one `"melody"` voice initially unless a transcription genuinely needs more; do not create separately stored exercise fragments.
- Tests:
  - [x] Normalizing the complete timed corpus succeeds without runtime errors, while the existing inventory derivation inputs and generated outputs remain byte-for-byte untouched.
  - [x] IDs are unique within the timed corpus; every melody has a `"melody"` voice, at least one phrase, one natural tonic occurrence in that voice, valid measure and voice totals, a nonempty source description, and a supported status.
  - [x] Every phrase has a supported tonic-practice suitability and nonempty rationale; every `"independent"` phrase spans at least two complete measures, contains enough sounded material, and includes at least one natural tonic event.
  - [x] A corpus-level assertion protects the initial breadth target of at least 50 complete melodies.
  - [x] Spot checks pin rhythm, measure lengths, beat groupings, and phrase boundaries for several tunes.

## Rhythm-aware melody playback

- Status: Completed in Stage 3. Added score scheduling and playback on the shared tick timeline, melody-event cues from that same schedule, and controller-owned cancellable cue timers while preserving the existing one-stream cancellation and queued-completion behavior.
- Decisions: Score playback uses the complete score duration, including trailing silence, for completion. Sounded notes receive a 30ms articulation gap without moving their onsets. Playback handles expose melody-voice cue times including the engine's scheduling lead; `PlayController` publishes the active event index and clears it during articulation gaps, cancellation, replacement, and completion.

- [x] Goal: Extend `AudioEngine`, `SamplerAudioEngine`, `PlayController`, test fakes, and button IDs with concrete `Score` playback. Add a pure scheduling function that maps the score's event ticks and tempo to onset/duration seconds, schedules chords and independent voices together, and preserves silent gaps and mixed measure lengths. The playback layer accepts a melody or materialized phrase directly and never receives a source range. Keep the current cancellation and completion contract.
- Tests:
  - [x] Mixed note lengths, silent gaps, pickup timing, changing measure lengths, simultaneous notes, and two independent voices in a concrete zero-based phrase schedule the expected MIDI notes and playback duration without consulting its source melody.
  - [x] Starting another stream cancels score playback exactly once; natural completion advances a queued step once.
  - [x] Existing cadence, pattern, note, drone, unlock, and activation tests remain unchanged and passing.

## Generate tonic exercises from complete melodies

- Status: Completed in Stage 4. Added eligible authored-phrase selection plus separate sing-tonic and identify-tonic-notes state machines with playback, repeat/next, reveal, answers, and bounded viewport transitions.
- Decisions: Selection chooses a melody and then one of its eligible phrases, excludes the previous melody whenever another eligible melody exists, and otherwise excludes the previous phrase when possible without retry loops. Reducers receive only timed melodies, profile, playback, and randomness; they do not depend on deck persistence. Identification answers index the concrete normalized `"melody"` voice, and replay preserves answers while resetting the viewport to the first measure.

- [x] Goal: Add pure random selection functions and separate reducers for the two activity state machines. The top-level activity discriminator selects the reducer; entering an activity and pressing next select an authored phrase of at least two complete measures classified as `"independent"`. `sing-tonic` plays that fragment, while `identify-tonic-notes` also computes its answer indexes and owns answer, selection, reveal, and viewport transitions. Repeat preserves the current exercise's trial. Suitability and length are checked-in corpus metadata, never inferred or truncated at runtime. Avoid the immediately previous melody when alternatives exist, avoid the immediately previous fragment when only same-melody alternatives exist, and return no exercise cleanly when the corpus has no eligible candidate.
- Tests:
  - [x] Deterministic random fixtures select the expected melody and an `"independent"` phrase of at least two measures while ignoring one-measure, `"context-required"`, and `"exclude"` phrases; repeat preserves the trial and next invokes selection again.
  - [x] The top-level discriminator delegates only to the selected exercise reducer; sing-tonic states cannot receive identification-only transitions or contain answer, slot-selection, or viewport fields.
  - [x] Immediate repetition is avoided without looping when the corpus contains one melody.
  - [x] The identification answer is relative to the concrete phrase's `"melody"`-voice events and handles tonic octaves and silent gaps without consulting the source melody or including accompaniment.
  - [x] Selection does not consult or mutate `DeckStore`.

## Add the activity catalog and tonic activity pages

- Status: Completed in Stage 5. Added the activity catalog, separate sing-tonic and identify-tonic-notes views, optional key/drone support, rhythmic measure rows, shared answer palette, reveal results, viewport controls, and controller-driven playback highlighting.
- Decisions: Activity support drones are activity-local and begin off even when the legacy profile preference is on, so neither exercise enables tonal support automatically. Manual audible buttons use controller toggle semantics; pressing the currently active melody button stops it, while pressing it after completion replays it. Playback synchronization reads only the controller's current generation-filtered state, so cancelled cue callbacks cannot highlight or scroll a replacement trial.

- [x] Goal: Add an activity-catalog view and tonic activity views using the project-local Vamp and design-system patterns. The catalog renders direct links for the two activities. The sing-tonic page exposes the existing optional context controls plus fragment, reveal, repeat, and next actions. The identification page renders a three-row vertical measure viewport with explicit beat and bar boundaries, empty rest spans, and one keyed child slot per sounded melody event. Labeled up/down controls with shared arrow icons scroll one measure at a time through longer fragments. Selecting a slot exposes one shared answer palette; all dynamic viewport, selection, answer, reveal, result, and playing states are Binder-driven, and tappable controls use `onPress`.
- Tests:
  - [x] The catalog lists both activities as ordinary links and exposes no SRS practice, cards, or song-library action.
  - [x] Sing-tonic presentation plays only the selected fragment and exposes fragment, cadence, and drone controls but not the tonic answer; cadence and drone activate only on explicit learner input, and reveal enables the answer note and repeat/next controls.
  - [x] Every identification slot starts as `?`; selecting a slot and choosing `1`, `not 1`, or `?` updates only that slot, and the answer model accepts a fixture prompt containing both `1` and `3`.
  - [x] Slot geometry follows authored onset and duration ticks within explicit beat and measure rows while rests produce empty space and no selectable slot; pitch and octave do not affect geometry.
  - [x] Two- and three-measure fixtures render every measure simultaneously; four- and seven-measure fixtures expose scrolling windows `1–3`, `2–4`, and through `5–7`, while a one-measure fixture is rejected by exercise selection.
  - [x] Up/down controls shift the viewport by one measure, disable at its bounds, preserve all answers, and expose the visible bar range in text.
  - [x] Starting replay resets the viewport to the first measure; playback cues minimally scroll it to keep the active measure visible without accepting stale cues from cancelled playback.
  - [x] During playback, cue messages highlight the corresponding slot, clear during rests and after completion, and stale cues from cancelled playback cannot update the replacement trial.
  - [x] Reveal computes correct, missed, extra, and unanswered results, presents a textual or symbolic distinction in addition to semantic color, and prevents further answer edits.
  - [x] View state updates through Binder bindings and keyed child views rather than imperative DOM mutation.

## Route only the activity experience

- Goal: Add catalog and activity routes, remove SRS practice/cards/song-library variants and dependencies from router and app composition, inject the timed corpus from `main.ts`, and stop playback on activity and route changes. Leave the disconnected SRS source files, generated inventory, dependencies, and persisted browser data in place. Update About documentation to describe the activity model, experimental tonic exercises, and the distinction between familiar demonstrations and ordinary corpus material. Bump `APP_VERSION` for each implementation/content change as required.
- Tests:
  - Router round-trips `/`, `/activities/sing-tonic`, `/activities/identify-tonic-notes`, and `/options`; former `/practice`, `/cards`, and `/songs` paths parse to the catalog, and browser back/forward restores the correct catalog or activity.
  - The hamburger menu links home, options, and about only and does not duplicate activity links.
  - App integration mounts the catalog and each tonic activity with injected corpus/profile/play dependencies; locked audio routes through the existing explicit unlock interaction.
  - Navigating between activities or away from them stops melody playback, clears slot highlighting, and silences any pre-existing drone.
  - Existing SRS source remains type-correct without being imported by `main.ts` or mounted by `AppView`.
  - Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`; run Android coverage only if the shared audio-unlock path changes beyond adding the new playback method.
