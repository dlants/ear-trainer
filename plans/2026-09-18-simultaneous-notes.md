# Objective and Context

> Right now all of it seems like all of our melodies and everything is set up for a single voice at a time and I want to extend this to capture simultaneous notes: chords, intervals played at the same time.
>
> I want to make adjustments to that, both in terms of our corpus. I want to incorporate more multiple voicings and expand our situations to take into account simultaneous notes being played. I want to look at the input UI and the playback UI and see what we should change there.
>
> When there are multiple notes playing within the same beat, I want to vertically stack them in the playback. Right now we have a single button with a question mark in it. I want vertically stacked buttons, one for each tone of the chord, and clicking each one should be able to allow us to specify that tone that we hear. The display for the guess should similarly stack the guess notes on top of each other with a blank spot. In general we should annotate the guess spot with an underscore maybe for places where we decided not to place a note.
>
> I think playback. I'm thinking about playback in terms of:
> - I could see playing back the notes together, so the full chord
> - maybe being able to click individual notes to play individual notes within the chord
> I think that would be really helpful especially as the person is kind of starting to try to pick apart the notes.
>
> Write up a plan. Focus on the design first, we can iterate on the implementation later.

## What already supports simultaneity

- `music/note.ts:1-13` — `Note`, `Event = { notes: Note[] }`, `canonicalForm()` already joins simultaneous notes with `+`.
- `music/melody.ts:4-12` — `TimedEvent = Event & { onsetTicks, durationTicks }`, `Voice = { id, events }`, `Score.voices: Voice[]`. The schema is already polyphonic in two independent dimensions: several notes per event, and several voices per score.
- `music/melody.ts:normalizeMelody` (118) accepts `CorpusMeasureVoice[]` per measure, so multi-voice corpus entries are already expressible.
- `audio/engine.ts:53-100` — `scheduleGroups()` and `scoreSchedule()` flatten all voices/notes onto one timeline; chords already play correctly.
- `music/pitch.ts:cadenceChords` — the cadence is already two-voice.

## What assumes one voice / one note

- Corpus: every entry in `inventory/melodies.ts` uses a single voice id `"melody"` with one note per event.
- `views/tonic-practice.ts` — trial state is indexed by a flat `eventIndex` into `voice(phrase, "melody").events`; `answers: MelodySlotAnswer[]` is one answer per event; `cursorEventIndex`, `SELECT_SLOT`, `PLAY_EVENT` all speak that index.
- `views/tonic-practice-view.ts:30-46` — `actualAnswer()` returns `"other"` whenever `event.notes.length !== 1`, so a chord is unanswerable by construction; `noteLabel()` joins chord tones with `+` into one cell.
- `views/tonic-practice-view.ts:BeatSlotView` — one tone button + one guess cell per event.
- `music/situations.ts:findSituationOccurrences` (223) walks a single voice's events and only looks at `alteration === 0` notes; all 12 situations are melodic (adjacency/stepwise in time).
- `audio/play-controller.ts:27-52` — `PlayStep` has a `"note"` variant carrying a single `Midi`.

## Relevant files

- `music/note.ts` — note/event primitives.
- `music/melody.ts` — score/voice/phrase model, corpus normalization.
- `music/situations.ts` — situation catalog and occurrence detection.
- `music/pitch.ts` — `noteToMidi`, cadence voicings.
- `inventory/melodies.ts` — the melody corpus.
- `audio/engine.ts` — scheduling and `AudioEngine`.
- `audio/play-controller.ts` — `PlayStep`/`PlayController`, application playback layer.
- `views/tonic-practice.ts` — identify-notes state and reducer.
- `views/tonic-practice-view.ts` — identify-notes rendering, cells, palette.
- `version.ts` — `APP_VERSION`, bumped every change.

# Design

## Core idea: the cell

The whole feature hinges on one new abstraction. Today the UI's unit of interaction is "the Nth event of the melody voice", and answers are stored in a parallel array indexed by that number. That concept dies the moment a phrase has two voices, because two voices produce two independent event streams that share a timeline, and it dies again for chords, because one event is then several answerable things.

Replace it with the **cell**: one cell per note, which is simultaneously the thing displayed, the thing tapped, the thing played, and the thing answered.

```
cells(phrase) -> Cell[]
```

Cells are derived, not authored: one per note of every voice, ordered by onset ascending then by pitch descending. Each carries a `CellId` — `${onsetTicks}:${laneIndex}`, unique because a lane holds one note at a time — and that id is the single handle for everything: `cellAnswers[cellId]`, the selection, the DOM `data-cell-id` attribute, and every play/select message. Ids rather than array positions, because a guess outlives any particular render and must not be re-keyed if the cell list is recomputed. There is no second referencing scheme anywhere, no `(onsetIndex, noteIndex)` pair and no ragged array; a guess is stored on the cell it was entered into, so the guess, the note, the button, and the answer all share one identity.

Two groupings sit on top of cells, both derived and both read-only:

- An **onset** is the set of cells attacking at the same tick: `{ onsetTicks, cellIds }`. `onsets()` is therefore the attack map — onset to the cells starting there — which is what playback schedules against, and what gives cursor position and "play everything here".
- A **lane** is a display row (below). Every cell has a `laneIndex`.

Consequences of deriving rather than authoring:

- A phrase where a harmony note starts mid-way through a held melody note produces its own onset containing just that harmony cell. The held note is one cell, asked once, no matter how many attacks happen underneath it — the UI never needs to model ties or sustains specially.
- Cell identity is `(onsetTicks, pitch)`, stable across re-renders and independent of voice ordering in the corpus.
- The existing single-voice corpus produces exactly one cell per event, in the same order as today's `eventIndex`. This is the key compatibility property: **cells are a strict generalization, and the migration is mechanical for existing content.**

A cell belongs to the onset where it attacks, but it is *sounding* for its whole duration. So three relations, deliberately kept apart: cells answer "what is asked and stored", lanes answer "where it sits and how wide", and `cellsSoundingAt()` answers "what is audible right now". Sustained tones then fall out for free instead of becoming a special case in every layer.

## Layout: tracks, lanes, and spans

Rendering cannot be driven by onsets alone: an onset's stack is only its attacks, so a sustained tone would vanish from every onset after the one it attacks on. The display is instead a time-aligned grid of three tracks, all sharing one horizontal tick axis:

1. **The stack track** — one button per onset where two or more notes are sounding, and nothing at all elsewhere. Sounds that vertical slice. Not answerable.
2. **The cell track** — `lanes.length` rows of cells, one cell per note. Where guesses are entered, and where tapping sounds that single tone.
3. **The harmony track** — one segment per region. Where chord guesses are entered, and where tapping replays the whole span the chord covers.

Reading downward, that is: what is simultaneous here, what are the notes, and what is the harmony — increasing in span and decreasing in resolution.

Tracks are the three bands; **lanes** are the rows *inside* the cell track, one per `(voiceId, chord slot)`. The stack and harmony tracks have no lanes — they are one row each — so `laneIndex` is only ever a coordinate within the cell track. Track is the band, lane is the row, cell is the thing in it.

Within the cell track:

- **Horizontal.** A note's cell starts at `onsetTicks` and spans `durationTicks`, using the same measure-relative percentage geometry `slotStyle()` already computes — extended from events to individual notes. A half note under four arpeggiated sixteenths renders one wide cell over four narrow ones, which is exactly the requested behavior and also the correct visual claim: that button is that one sound, for that whole span.
- **Vertical.** Each note is assigned a **lane**, a horizontal row of the grid. Lanes are derived per phrase: one lane per `(voiceId, slot)` pair, where `slot` is the note's index within its event's pitch-sorted notes. So a single-note voice occupies one lane, a voice that reaches three-note chords occupies three, and lanes are then ordered top-to-bottom by the descending mean pitch of the notes in them.

Deriving lanes from voices rather than packing intervals greedily means the sustained tone keeps its own row for the whole phrase, and the arpeggio's notes all land in one row beneath it, without any layout heuristic. It also means the author controls the picture by choosing how to write the music — which is the same choice they already make for rhythm.

A lane is simply empty wherever no note of that lane is sounding; empty grid area is not a cell and is not answerable. Only notes get cells, so nothing invites the learner to "answer" silence.

A cell is a single button, not a two-row stack, and it carries the guess itself. Today's separate guess row below the melody is removed: with wide sustained cells next to narrow arpeggio cells, a parallel row is hard to align and hard to read, and the answer belongs *in* the thing it answers.

The cell's content is a function of phase and answer:

- Answering, no answer yet — `?`.
- Answering, answered — the guess itself (`1`, `♯2`, `other`), so the learner reads back their own transcription in place.
- Answering, skipped — `_`.
- Revealed, guessed correctly — the note, then a check: `1 ✓`.
- Revealed, not guessed (untouched or skipped) — the note alone, no icon. Declining to answer is not a failure, so it is not marked as one.
- Revealed, guessed wrong — an x, then the wrong guess struck through, then the correct note: `✗ ~~3~~ 1`. The learner's actual confusion is the interesting data, so it stays on screen next to the truth.

Skipped and untouched cells are deliberately indistinguishable after reveal; the distinction only carries during answering and in scoring.

Below the cell rows sits one more row: the **harmony track**, one segment per `HarmonyRegion`, each spanning its region's ticks with the same percentage geometry. The track makes the harmony visible as a thing in its own right — a rhythm of chords underneath a rhythm of notes — and gives progression situations somewhere to highlight.

A harmony-track segment is selectable exactly like a cell, but selecting it swaps the palette: instead of the degree palette the learner gets the **chord palette**, the seven diatonic triads of the context (I, ii, iii, IV, V, vi, vii°) plus `other` and `_`. So one selection model, two answer vocabularies, chosen by what is selected. Quality overrides, sevenths, and inversion entry are deliberately deferred — the first version asks "which chord", not "which voicing", and the realization axis is trained by *which phrases* the situation selects rather than by what the learner types.

Reveal on the harmony track follows the same three rules as a cell: correct shows the chord and a check, unanswered shows the chord alone, wrong shows an x, the struck-through guess, and the correct chord.

The existing `MelodyMeasureView` becomes a grid of these three tracks — one stack-button row, `lanes.length` cell rows, one harmony-track row — and `BeatSlotView` becomes `CellView`, positioned by `(laneIndex, onsetTicks, durationTicks)` rather than by event index.

## Answers

There are two answer maps, keyed the same way as the things they answer: `cellAnswers: Record<CellId, CellAnswer>` and `chordAnswers: Record<RegionId, ChordAnswer>`. Each is written only at the id the learner acted on. Selection is a single tagged value, `{ kind: "cell", cellId } | { kind: "chord", regionId }`, so exactly one thing is selected at a time and the palette is a pure function of it.

`MelodySlotAnswer` is renamed `CellAnswer` now that it has a sibling.

`CellAnswer` gains a `"skip"` member: `Degree | "other" | "skip" | undefined`.

- `undefined` — untouched, the cell shows `?`.
- `"skip"` — the learner deliberately declined this tone; the cell shows `_`. Neutral at reveal: neither correct nor incorrect, and excluded from any score.
- `"other"` — heard something outside the prompt degrees (chromatic).
- a `Degree` — a guess.

The distinction between `undefined` and `"skip"` exists because with chords the learner will very often pick out two of three tones on purpose, and we do not want that to look like an error or like an oversight. The palette gains a `_` button alongside `?` and `other`.

Auto-advance after `SET_ANSWER` is the next cell in `trial.cells`, which by the cell ordering means down the current onset's stack and then on to the next onset — the reading order of the display.

## Grading

`actualAnswer(note, promptDegrees)` moves from operating on an `Event` to operating on a single `Note`: a natural note whose degree is in `promptDegrees` answers as that degree, anything else answers `"other"`. `cellResult` returns `"correct" | "incorrect" | "unanswered"`, where `"unanswered"` covers both `undefined` and `"skip"` and drives the note-only rendering above.

Because the stack height equals the number of simultaneous tones, the display leaks the chord's cardinality before the learner answers. That is intentional and matches the request. Counting voices by ear is a separate skill we are explicitly not training yet; note it as a possible later mode (a fixed-height stack with an "add tone" affordance) rather than building it now.

## Playback

Two levels, mapping onto the two things a learner does with a chord:

- **One cell, one tone.** Tapping a cell always sounds exactly that note and nothing else, whatever else is ringing. Dispatches `PLAY_CELL { cellId }`, resolved via `noteToMidi(cell.note, tonic)`. Tapping also selects the cell, so picking apart a chord is one tap per tone.
- **The stack at one tick.** Where two or more notes are sounding at an onset, a small play button sits above the stack — in a dedicated header row of the grid, aligned to that onset's column. It plays every note *audible* at that tick together: the cells attacking there plus any longer note still ringing from an earlier onset. Dispatches `PLAY_ONSET { onsetIndex }`, resolved via `cellsSoundingAt(cells, tick)`.

  This stays a separate affordance precisely because it is *not* the harmony track. A region can span many onsets, and when it is arpeggiated the vertical slice at a given tick is a different sound from the region as a whole. Hearing "these notes, simultaneously, right here" is the thing that lets a learner pull an arpeggio apart into a chord, and it is also the only one of the three that has nothing to answer — which is why it alone needs a button rather than a tap target.
- **A chord region.** Tapping a harmony-track segment selects it *and* plays that region as written over its tick range — plain score-range playback, so an arpeggiated chord is heard arpeggiated. No separate play button: the rule across the whole display is that tapping an answerable thing selects it and sounds exactly what it represents.

Where only one note is sounding there is no stack and no stack button; the cell itself is the only thing to tap. So the button's presence is itself the signal that something is simultaneous here.

Because "everything sounding" is a set of pitches that do not share a range on the score timeline, score-range playback cannot express it. So `AudioEngine` grows one method, `playNotes(notes: Midi[])`, with `playNote(n)` becoming its single-note case, and `PlayStep`'s `"note"` variant becomes `"notes"` carrying `Midi[]`. Internally this is `scheduleGroups([notes], ...)`, which already exists — the engine is not gaining a capability, only an entry point.

Full-phrase playback, the cursor, and `SYNC_PLAYBACK` change only in that the cursor tracks `onsetIndex` instead of `eventIndex`; `CUE_CHANGED` already reports event boundaries and will need mapping from onset ticks to onset index rather than to a melody-voice event index.

## Harmony: an authored chord track

Vertical-interval detection over cells is the wrong level for anything like ii–V–I. A progression is a property of the *harmony* of the phrase, not of which notes happen to be struck together: a ii chord is a ii whether it is a block chord, an arpeggio, a broken accompaniment figure, or implied by a single bass note under a melody. So add a third derived-from-authored structure alongside voices: a **chord track**.

The chord track is authored, not inferred. Inferring chords from notes means handling passing tones, incomplete voicings, inversions and ambiguity, and getting it wrong silently mislabels the very thing we are teaching. The corpus is small and hand-written, so the author states the harmony directly, the same way they already state phrase boundaries and suitability.

A chord is expressed in scale degrees, not letter names, matching the rest of the model and keeping everything key-agnostic: a root degree with alteration, a quality, and an optional seventh. The chord track states harmonic *identity* only; how that chord is voiced and whether it is blocked or broken is derived from the cells, so the two can be constrained independently. Regions tile the phrase in time — typically one per measure or per half measure — and a measure may be left without harmony when there genuinely is none.

Beyond situations, the chord track pays for itself twice over: it can drive an accompaniment under a phrase, and it gives the reveal something to say about *why* a note was that note.

Harmony is optional, and on two axes that must not be confused:

- **Stated or not.** A melody may have no authored harmony at all, or harmony over only part of it — an unaccompanied folk tune, or a passage where the author does not want to commit. Regions are per measure and gaps are legal, so this is free. Where a phrase has no regions at all, the harmony track is not rendered; an empty band that can never be filled is worse than no band.
- **Stated but not askable.** Harmony can be real yet too ambiguous or too advanced to quiz, exactly as some phrases are unsuitable for note identification today. So phrases gain `chordIdentification?: IdentificationPhraseSuitability` alongside the existing `noteIdentification`, and the track renders read-only — visible, playable, revealed, but not answerable — when harmony is stated and not askable. Reusing the existing suitability vocabulary keeps one authoring concept rather than two.

The default for existing corpus entries is no harmony, so nothing in the current content has to be touched before the rest of the feature works. Harmony arrives melody by melody.

## Situations

Situations split into two families, which is the real structural change here:

- **Cell patterns** (`kind: "cells"`) — anything defined over what is played and when. All 12 existing melodic situations are of this kind, read off the **top cell** of each onset, so single-voice results are unchanged. New ones in this family:
  - `harmonic-third`, `harmonic-fifth`, `harmonic-octave` — that interval sounding, detected over `cellsSoundingAt()` rather than over attack groups, so a held 1 with an arpeggiated 5 above it counts. Attack-only detection would miss exactly the arpeggiated cases.
  - `triad-together` — three notes of one triad struck as a block.
  - `arpeggiated-triad` — the same three notes stated in sequence within one chord region. The pair teaches the same harmony in its two textures, which is the point of the whole feature.
  - `pedal-tone` — one cell sustained while two or more other cells attack beneath or above it.
  - `descending-run` / `ascending-run` — three or more consecutive stepwise top cells in one direction.
- **Progressions** (`kind: "progression"`) — a sequence of chord regions. A progression situation matches on two things kept deliberately separate:
  - **Identity**, authored: the chord sequence itself, `(root, alteration, quality, seventh)` per step, with immediate repeats of the same chord collapsed. This is what makes ii–V–I expressible regardless of how it was played.
  - **Realization**, derived from the cells inside each region: which degree is in the bass, and whether the region is struck as a block, arpeggiated, or mixed. A situation constrains these per step, and `"any"` is an explicit opt-in rather than the default.

  Hearing a root-position V–I is a different skill from hearing the same progression over a moving bass, and an arpeggiated ii–V–I is a different skill again — so the catalog must be able to name them apart, and by default does. Realization is derived from what is actually sounded rather than read from the authored `bass` field, because what the learner hears is the thing being trained; the authored field is intent, the cells are the evidence.

  A small starting catalog, deliberately: `authentic-cadence` (V–I, root position, any texture), `authentic-cadence-inverted` (V–I with either chord not in root position), `two-five-one-block`, `two-five-one-arpeggiated`, `plagal-cadence` (IV–I), `deceptive-cadence` (V–vi), `pop-progression` (I–V–vi–IV). More are just data once the mechanism exists.

Progression situations are phrase *filters*, not a new answering mode: they decide which phrase the learner is given, and the matched region is highlighted, but the learner is still identifying notes cell by cell. Naming chords by ear is a different activity and should stay out of this one.

A `SituationOccurrence` carries `cellIds` in both families — for a progression, the cells sounding within the matched regions — so the view has one highlighting path regardless of kind.

The selector UI groups the catalog into "melodic", "harmony", and "progression" sections; `DEFAULT_SITUATION_IDS` stays `["tonic"]`. Persisted selections are by id, so adding ids is backward compatible.

## Authoring harmony for the existing corpus

Harmony is hand-authored per melody, in the same style as the existing melodies: explicit `CorpusEvent`s in a `voiceId: "harmony"` voice, plus an authored chord track on each measure. No texture generators, no voicing heuristics, no fill machinery — the corpus is small, hand-written content, and each song's accompaniment is a musical decision worth making once and reading back literally. The chord track is authored alongside the notes rather than inferred from them, so identity and realization stay independent as the design requires.

Authoring order per melody: chord track first (one chord per measure or half measure), then the harmony voice realizing it. The existing `measure`/`bar4` helpers extend naturally — a measure gains a second voice's event list and its chord list.

Always keep harmony in its own voice, even when homorhythmic with the melody: it keeps lanes stable, leaves the `melody` voice unchanged, and keeps the top-note reduction below well-defined.

## Keeping the melody-only library

No parallel corpus and no stripping function. The melody is recoverable as the **top note of each onset** — the same "top cell" reduction the melodic situations already use, which means it is a property the model owes us anyway and is tested there. Authoring harmony strictly below the melody (an authoring rule, not a generated one) is what makes that reduction correct, so it becomes an invariant: at every onset, the highest sounding note belongs to the melody voice.

Two authored versions per song is rejected: the harmony is the same harmony either way, so a second authored copy is duplicated content that can disagree with itself, and the simplification wanted is a view of one song, not a second song.
## Corpus

Both authoring forms are already legal and normalize identically into onsets, so the choice is purely about rhythm:

- Homorhythmic harmony (block chords, parallel thirds, cadence-style voicings) is written as a single voice whose `CorpusEvent`s carry several notes. All notes of such an event share one onset and one duration, since `durationTicks` lives on the event.
- Divergent rhythms require a second `CorpusMeasureVoice`. `normalizeMelody` checks each declared voice fills its measure exactly (under- and overfill both fail), forbids a voice id twice in one measure, and forbids overlapping events within a voice — but a voice may be omitted from a measure entirely, so a harmony that enters in bar 3 costs nothing. Rests are `notes: []` events.

Three kinds of additions, in this order:

Every new or touched entry also gets a chord track; entries left without one simply never match a progression situation.

1. **Harmonized versions of existing melodies** — add a second `CorpusMeasureVoice` (`voiceId: "harmony"`) to a handful of entries that already have clean phrase boundaries. Cheapest way to get real content, and it exercises the multi-voice path of `normalizeMelody` end to end.
2. **Purpose-built harmonic drills** — short original entries that are mostly block chords (e.g. a I–IV–V–I in the cadence voicing style of `cadenceChords`), tagged `noteIdentification: "independent"`, for the harmonic situations to draw on.
3. **Arpeggio-against-sustained drills** — a held tone in one voice with the other voice arpeggiating beneath or above it. These are the cases that exercise spans, lanes, and sounding-set detection together, so at least one must exist before the layout work can be judged.
4. **Progression drills** — short entries whose chord track spells the catalog progressions, each written twice where it is cheap to do so: once as block chords and once arpeggiated, so a progression situation can hand the learner the same harmony in both textures.

## Interfaces

```ts
// music/melody.ts
/** `${onsetTicks}:${laneIndex}` — unique because a lane holds one note at a time. */
export type CellId = string & { readonly __brand: "CellId" };

/** One note: the unit of display, tap, playback, and answer. */
export type Cell = {
  id: CellId;
  note: Note;
  voiceId: string;
  onsetTicks: number;
  durationTicks: number;
  /** Row in the display grid; see lanes(). */
  laneIndex: number;
};

/** Cells attacking at this tick, highest-sounding first. */
export type Onset = {
  onsetTicks: number;
  cellIds: CellId[];
};

/** One row of the display grid: one slot of one voice. */
export type Lane = {
  voiceId: string;
  slot: number;
};

/** Ordered by onset ascending, then pitch descending; drives reading and auto-advance order. */
export function cells(score: Score): Cell[];
export function cellsById(cells: Cell[]): ReadonlyMap<CellId, Cell>;
export function lanes(score: Score): Lane[];

/** Attack map: onsets in time order, each listing the cells that start there. */
export function onsets(cells: Cell[]): Onset[];
export function onsetAt(onsets: Onset[], ticks: number): Onset | undefined;

/** Cells audible at `ticks`, including ones attacked earlier and still ringing. Highest first. */
export function cellsSoundingAt(cells: Cell[], ticks: number): CellId[];

/** Authored harmony, in scale degrees so it stays key-agnostic. */
export type ChordQuality = "major" | "minor" | "diminished" | "augmented";
export type Chord = {
  root: Degree;
  alteration: Alteration;
  quality: ChordQuality;
  seventh?: "minor" | "major";
  /** Authored intent for the bass. Matching uses the realization derived from cells instead. */
  bass?: Degree;
};

/** Chord regions tile the phrase; gaps are legal and mean "no stated harmony". */
export type RegionId = string & { readonly __brand: "RegionId" };
export type HarmonyRegion = {
  id: RegionId;
  startTicks: number;
  endTicks: number;
  chord: Chord;
};

export function chordAt(harmony: HarmonyRegion[], ticks: number): Chord | undefined;
/** Regions with immediate repeats of the same chord collapsed; the form progressions match against. */
export function chordSequence(harmony: HarmonyRegion[]): HarmonyRegion[];

/** How a region was actually played, derived from its cells — not from the authored `bass`. */
export type BassPosition = "root" | "first" | "second" | "third" | "non-chord";
export type Texture = "block" | "arpeggiated" | "mixed";
export type Realization = {
  bass: BassPosition;
  texture: Texture;
};
export function realizationOf(cells: Cell[], region: HarmonyRegion): Realization;

// Score gains `harmony: HarmonyRegion[]`; CorpusMeasure gains its authoring form,
// `harmony?: { durationTicks: number; chord: Chord }[]`, tiling the measure like a voice.
```

```ts
// audio/engine.ts — playNote becomes the single-note case of:
playNotes(notes: Midi[]): PlaybackHandle;
// audio/play-controller.ts — PlayStep's "note" variant becomes:
{ buttonId: PlayButtonId; type: "notes"; notes: Midi[] }
```
```ts
// music/situations.ts
export type SituationKind = "cells" | "progression";

/** A progression step: authored identity plus constraints on how it must be heard. */
export type ProgressionStep = {
  root: Degree;
  alteration: Alteration;
  quality: ChordQuality;
  seventh?: "minor" | "major";
  bass?: BassPosition | "any";
  texture?: Texture | "any";
};
export type SituationDefinition = {
  id: SituationId;
  kind: SituationKind;
  label: string;
  description: string;
  degrees: readonly Degree[];
};
export type SituationOccurrence = {
  situationId: SituationId;
  cellIds: readonly CellId[];
};
/** Cell-pattern situations read `cells`; progressions read `phrase.harmony`. */
export function findSituationOccurrences(
  phrase: Phrase,
  cells: Cell[],
  situationId: SituationId,
): SituationOccurrence[];
```

```ts
// views/tonic-practice.ts
export type CellAnswer = Degree | "other" | "skip" | undefined;
/** Diatonic triad of the context, by root degree. */
export type ChordAnswer = Degree | "other" | "skip" | undefined;
export type Selection =
  | { kind: "cell"; cellId: CellId }
  | { kind: "chord"; regionId: RegionId };

export type IdentifyNotesTrial = {
  phrase: Phrase;
  cells: Cell[];
  onsets: Onset[];
  lanes: Lane[];
  targetSituationId: SituationId;
  phase: IdentifyNotesPhase;
  promptDegrees: Degree[];
  /** Parallel to cells. */
  cellAnswers: Record<CellId, CellAnswer>;
  chordAnswers: Record<RegionId, ChordAnswer>;
  selection?: Selection;
  cursorOnsetIndex: number;
  firstVisibleMeasureIndex: number;
};

export type IdentifyNotesMsg =
  | ...
  | { type: "PLAY_ONSET"; onsetIndex: number }
  | { type: "PLAY_CELL"; cellId: CellId }
  | { type: "SELECT_CELL"; cellId: CellId }
  | { type: "SELECT_REGION"; regionId: RegionId }
  | { type: "SET_CHORD_ANSWER"; answer: ChordAnswer }
  | { type: "SET_ANSWER"; answer: CellAnswer };
```

```ts
// views/tonic-practice-view.ts
export type CellResult = "correct" | "incorrect" | "unanswered";
export function cellResult(
  note: Note,
  promptDegrees: Degree[],
  answer: CellAnswer,
): CellResult;
```

`trial.cells`, `trial.onsets`, and `trial.lanes` are cached on the trial rather than recomputed per render, because the view derives grid geometry from them on every sync.

## Invariants

- `cells(score)` is deterministic: ordered by `onsetTicks` ascending, then `noteOffset` descending, ties broken by degree then voice id. This order is the reading and auto-advance order.
- `CellId` is unique within a phrase and stable across re-renders and across recomputation, since it is derived from position (`onsetTicks`, `laneIndex`) rather than from array order. Stored guesses would be corrupted by any id scheme that moves.
- For a single-voice, single-note-per-event phrase, `cells()` yields one cell per event in the same order — existing corpus and existing tests must be unaffected.
- `cellAnswers` and `chordAnswers` have entries only where the learner acted, and every key is the id of a cell or region of the current phrase.
- Exactly one thing is selected at a time, and the palette shown is a pure function of the selection's kind — there is never a state where a degree could be written into a chord slot or vice versa.
- `onsets()` partitions `cells` exactly: every cell appears in exactly one onset's `cellIds`, and no onset is empty.
- `"skip"` never counts as wrong; `undefined` never counts as right.
- The cursor is always a valid onset index; `CUE_CHANGED` cues that fall between onsets map to the most recent onset at or before that tick.
- Audio unlock stays behind an explicit user gesture; the new per-note and per-onset play messages go through the same `identifyNotesMsgNeedsAudio()` gate.
- Every note appears in exactly one onset — the one at its attack — and is therefore asked exactly once, no matter how many later onsets it spans.
- A note's lane is constant for the life of the phrase, so a sustained tone occupies one unbroken row across everything that happens beneath it.
- A cell's rendered span equals `durationTicks`; no two notes in one lane ever overlap in time, which is what makes the row renderable without collisions. This follows from `normalizeMelody` rejecting overlapping events within a voice.
- `cellsSoundingAt(t)` ⊇ the cells of the onset at `t`, with equality exactly when nothing is held across `t`.
- A melodic situation's occurrences on a harmonized phrase equal its occurrences on that phrase's melody voice alone.
- Harmony regions never overlap and are ordered by `startTicks`; gaps are legal and mean "no stated harmony", never "same as the previous chord".
- Harmony is never required: every phrase-level behavior — selection, answering, reveal, playback, scoring — must work on a phrase with an empty harmony track, since that is the state of the entire existing corpus.
- Chord identity comes from the authored track; realization comes from the cells. Neither is ever derived from the other, so a mis-voiced performance of a ii–V–I is still a ii–V–I that simply fails a root-position situation's constraint.
- A progression step with no `bass`/`texture` constraint accepts any realization, but the catalog states them explicitly rather than relying on that default — silently lumping voicings together would erase a distinction the learner is being trained to hear.

# Stages

## Onset model — DONE

- Goal: `onsets()` exists in `music/melody.ts` with the ordering invariant, and is unit tested against multi-voice and chord-in-one-voice scores. Nothing else changes yet.
- Implemented in `music/melody.ts`: `Cell`, `CellId`, `Onset`, `Lane`, plus `cells()`, `cellsById()`, `lanes()`, `onsets()`, `onsetAt()`, `cellsSoundingAt()`. Tests in `music/melody.test.ts` under "cells, lanes, and onsets". Nothing else in the app consumes them yet.
- Decisions: chord slots are numbered highest-pitch-first (slot 0 = top note), so lanes for a voice read top to bottom; lanes are ordered by descending mean `noteOffset`, ties broken by voice id then slot. `onsetAt()` matches an exact attack tick and returns `undefined` between onsets — cue-to-onset mapping is deferred to the playback stage.
- Tests (pure logic, `music/melody.test.ts`):
  - A two-voice score whose voices share onsets yields one onset per shared attack with both notes, highest first.
  - A harmony note attacking during a held melody note yields its own onset containing only the harmony note.
  - Every existing single-voice fixture yields onsets 1:1 with its melody events.
  - A chord authored as one event with three notes yields one onset of three notes, ordered by pitch even when authored out of order.
  - `cellsSoundingAt()` at an arpeggio note's tick includes the tone held over it from an earlier onset, and excludes a note that ended on the preceding tick.
  - `lanes()` gives a sustained voice one lane and a three-note-chord voice three, ordered highest mean pitch first; a note's `laneIndex` is the same at every onset of the phrase.

## Cell-pattern situations — DONE

- Goal: `findSituationOccurrences()` consumes cells; the `"cells"` family is complete (melodic, intervals, triads, pedal tone, runs); the selector groups by kind.
- Implemented in `music/situations.ts`: `SituationKind` (`"cells"` only so far) and `SituationGroup` (`"melodic" | "harmony"`) on `SituationDefinition`; `SituationOccurrence.cellIds` replaces `eventIndexes`; `findSituationOccurrences(phrase, cells, situationId)`. `phraseMatchesSituation()` keeps its two-argument shape and computes `cells(phrase)` itself, so no caller changed. New situations: `ascending-run`, `descending-run` (melodic group), `harmonic-third`/`-fifth`/`-octave`, `triad-together`, `arpeggiated-triad`, `pedal-tone` (harmony group). Selector in `views/tonic-practice-view.ts` renders one list per group under a "Melodic"/"Harmony" heading.
- Decisions and deviations:
  - The triad-together situation is named `triad-together` (per the Interfaces section), not `tonic-triad-harmony`.
  - `arpeggiated-triad` is scoped to three consecutive single-note onsets spelling 1/3/5 rather than to a chord region, since harmony regions arrive in the next stage; re-scope it to the region then.
  - Intervals are measured in scale steps between natural notes over `cellsSoundingAt()` at every attack tick, so held-against-arpeggiated pairs match; `triad-together` likewise requires simultaneity, which keeps it disjoint from `arpeggiated-triad`.
  - Melodic situations now reduce a chord to its top note instead of treating any polyphonic event as opaque. One assertion in `music/situations.test.ts` ("invalid notes break pair candidates") relied on the old opacity and was rewritten.
  - Runs are emitted maximal (one occurrence per maximal stepwise run of three or more), and their degree vocabulary is all seven degrees.
  - `inventory/melodies.test.ts` coverage now requires an eligible phrase only for melodic-group situations; harmony coverage lands with the corpus stage.
- Tests (`music/situations.test.ts`):
  - Every existing melodic situation test passes unchanged after being fed `cells(phrase)`.
  - A melodic situation still matches on a harmonized phrase, driven by the top cell — i.e. adding an inner harmony voice does not destroy or create melodic occurrences.
  - `harmonic-fifth` matches a 1+5 onset and does not match 1 then 5 played sequentially. This is the distinction the whole feature is about, so test it directly.
  - `harmonic-fifth` also matches a held 1 against an arpeggiated 5 in another voice, where the two notes are in different onsets. This is the case attack-grouping would silently miss.
  - `tonic-triad-harmony` matches 1+3+5 in any registral arrangement, including doublings.
  - `arpeggiated-triad` matches 1-3-5 stated in sequence within one chord region and `triad-together` does not, and vice versa for the block-chord case. The two textures must be distinguishable, since teaching the difference is the point.
  - `pedal-tone` matches a sustained cell spanning two or more attacks beneath it.

## Harmony track — DONE

- Goal: `Chord`/`HarmonyRegion` authored on corpus measures, normalized onto `Score`, with `chordAt()` and `chordSequence()`; progression situations detected and selectable.
- Implemented in `music/melody.ts`: `Chord`, `ChordQuality`, `RegionId`, `HarmonyRegion`, `CorpusHarmony`, plus `chordAt()`, `chordSequence()`, `cellsInRegion()`, `realizationOf()` with `BassPosition`/`Texture`/`Realization`. `Score` gains a required `harmony: HarmonyRegion[]`; `CorpusMeasure` gains optional `harmony?: CorpusHarmony[]` that must tile the measure exactly when present. Phrase slicing rebases region ticks and ids. In `music/situations.ts`: `SituationKind` gains `"progression"`, `SituationGroup` gains `"progression"`, `ProgressionStep`, a `PROGRESSIONS` spec table and the seven catalog entries, matched by `findProgressionOccurrences()` over `chordSequence(phrase.harmony)` with realization derived from cells. The selector in `views/tonic-practice-view.ts` renders a third "Progression" group.
- Decisions and deviations:
  - `RegionId` is `harmony:${startTicks}`, unique because regions never overlap, and stable across re-derivation like `CellId`.
  - A `CorpusHarmony` entry may omit its `chord`, which is how a measure states harmony over part of its span and leaves the rest a gap; a measure may also omit `harmony` entirely.
  - `ProgressionStep.bass` accepts `"inverted"` (any bass other than the root) in addition to `BassPosition | "any"`, and a spec may set `requireInversion` so `authentic-cadence-inverted` matches when *at least one* of its chords is inverted — a per-step constraint cannot express that.
  - A region whose cells all attack at one tick is `"block"` (including the single-note case); all-distinct attack ticks is `"arpeggiated"`; anything else is `"mixed"`.
  - `arpeggiated-triad` was left scoped to consecutive single-note onsets rather than re-scoped to a chord region, since the corpus is still unharmonized and region-scoping would strip every existing match; the region-scoped texture distinction is now carried by the progression situations' `texture` constraint.
  - `chordIdentification` on phrases is deferred to the Grid UI stage, which is where it is first read.
  - The corpus is untouched (every entry normalizes with an empty harmony track); authored harmony arrives in the corpus stage, so the `inventory/melodies.test.ts` coverage test still exempts the harmony and progression groups.
- Tests: `music/melody.test.ts` "harmony track" (tick bounds and gaps, under/overfill rejection, `chordSequence()` collapsing, `realizationOf()` bass/texture from cells rather than the authored `bass`); `music/situations.test.ts` "progression situations" (identity across textures, block vs arpeggiated disjointness, ordering/completeness, root-position vs inverted, reported `cellIds`, no harmony means no match).
- Tests (`music/melody.test.ts`, `music/situations.test.ts`, `inventory/melodies.test.ts`):
  - A measure's authored harmony normalizes to regions with absolute tick bounds; a measure with no harmony leaves a gap rather than inventing one.
  - `chordSequence()` collapses a chord repeated across three measures into one region, so a progression spanning slow harmonic rhythm still matches.
  - An identity-only match (no realization constraints) finds a ii-V-I whether it is written as block chords or arpeggiated, confirming the two axes separate cleanly.
  - `two-five-one` does not match ii-V without the resolution, and does not match V-ii-I.
  - A root-position-constrained V–I does not match the same progression played with the third in the bass, while an unconstrained V–I matches both. Voicing is a trained distinction, so the matcher must be able to tell them apart.
  - `two-five-one-block` and `two-five-one-arpeggiated` match disjoint sets of phrases over the same chord track, i.e. identity and realization are genuinely independent axes.
  - `realizationOf()` reports `"arpeggiated"` for a region whose cells attack in sequence and `"block"` when they attack together, and reads the bass from the lowest sounding cell rather than from the authored `bass` field.
  - A progression occurrence reports the `cellIds` sounding inside the matched regions, so highlighting works the same as for cell patterns.

## Trial state — DONE

- Goal: `IdentifyNotesTrial` is keyed by `CellId`; `"skip"` is a first-class answer; auto-advance is the next cell.
- Implemented in `views/tonic-practice.ts`: `MelodySlotAnswer` is now `CellAnswer` (gaining `"skip"`), plus `ChordAnswer` and the tagged `Selection`. The trial caches `cells`/`onsets`/`lanes`, stores `cellAnswers: Record<CellId, CellAnswer>` and `chordAnswers: Record<RegionId, ChordAnswer>`, and replaces `selectedSlotIndex`/`cursorEventIndex` with `selection`/`cursorOnsetIndex`. `SELECT_SLOT` becomes `SELECT_CELL`; `SELECT_REGION` and `SET_CHORD_ANSWER` are new.
- Decisions and deviations:
  - `undefined` deletes its key rather than storing it, so "answers exist only where the learner acted" is a structural property of the map rather than a convention.
  - `cursorOnsetIndex` is derived by mapping the melody event's `onsetTicks` through `trial.onsets`, so `PLAY_EVENT` and `SYNC_PLAYBACK` already track onsets correctly on multi-voice phrases. `PLAY_EVENT`/`SYNC_PLAYBACK` still *address* melody-voice events; converting them to `PLAY_ONSET`/`PLAY_CELL` is the playback stage.
  - The view was adapted, not rebuilt: `BeatSlotView` now renders one `Cell` (span from `cell.durationTicks`, label from `cell.note`) and keys on `cell.id`, and the palette reads the selection. The lane grid, stack buttons, harmony track, and the `_` palette button remain Grid UI work.
  - A `"skip"` answer renders neutral at reveal (no icon, no result class). The third grading state proper — `cellResult` returning `"unanswered"` — lands with the Grid UI stage that introduces it; `slotResult` still returns only `"correct" | "incorrect"` and now takes a `Note` instead of a `TimedEvent`.
  - Test helpers `cellIdAt`, `answerAt`, and `selectedCellIndex` were added to `test/tonic-practice-harness.ts` so DOM tests can address cells by position without duplicating id derivation.
- Tests (`views/tonic-practice.test.ts`, reducer-level):
  - Answering the top tone of a shared onset advances selection to the tone beneath it, and answering the last cell clears the selection.
  - `SET_ANSWER "skip"` records a skip and still advances.
  - Answering a cell writes exactly one key, the id of that cell, leaving the other cell of the same onset untouched.
  - Recomputing `cells()` for the same phrase reproduces the same ids, so a round-trip leaves existing answers attached to the same notes.
  - Selecting a harmony-track segment replaces the cell selection, and `SET_CHORD_ANSWER` writes only into `chordAnswers` — the two vocabularies never bleed into each other.

## Playback

- Goal: whole-onset and single-note playback wired through `PlayController`; cursor tracks onsets.
- Tests (`audio/score-playback.test.ts` + reducer tests):
  - `PLAY_ONSET` on a chord onset schedules all of its notes at one time — verify against the scheduled note list, since "do they actually sound together" is the substance of this stage.
  - `PLAY_ONSET` on an arpeggio note under a sustained tone sounds both, i.e. it plays the sounding set rather than the attack set.
  - `PLAY_CELL` plays exactly one pitch, the one resolved from that cell's note and the trial tonic.
  - During full-phrase playback, `CUE_CHANGED` advances the cursor one onset at a time on a multi-voice phrase (i.e. two voices do not double-advance it).

## Grid UI

- Goal: notes render as duration-spanning cells on a lane grid, each a single button carrying its own guess and reveal; the separate guess row is gone; onset play affordance; palette gains `_`.
- Tests (DOM, `views/tonic-practice-view.test.ts`, per `docs/testing.md`):
  - A three-note chord renders three cells in three lanes, top-to-bottom highest-to-lowest.
  - A sustained tone over four arpeggiated notes renders one cell whose width equals the four cells beneath it combined, and that cell is a single tap target along its whole width. This is the layout claim the user asked for, so assert on geometry, not just on cell count.
  - A lane with nothing sounding at some tick renders no cell there — empty grid area is not answerable.
  - Tapping the second cell of a chord selects it and plays that one pitch — not the chord.
  - A stacked onset renders a stack button above it that plays the sounding set; an onset with one note sounding renders no such button.
  - While answering, a cell shows `?` untouched, the guess once answered, and `_` once skipped — all in the cell itself, with no separate guess row anywhere in the DOM.
  - After reveal: a correct cell shows the note and a check; an unanswered or skipped cell shows the note alone with no icon; an incorrect cell shows an x, the struck-through guess, and the correct note, in that order.
  - The harmony track renders one segment per region, each spanning its region's ticks, and a region-free stretch renders no segment.
  - A phrase with no harmony at all renders no harmony track, and the cell track's layout is unchanged by its absence.
  - A phrase whose `chordIdentification` excludes it renders the track as read-only: tapping plays the region but opens no palette and writes no answer.
  - Selecting a harmony-track segment shows the chord palette (I…vii°, `other`, `_`) and selecting a cell shows the degree palette; the reveal rules on the harmony track match the cell rules.
  - Tapping a harmony-track segment both selects it and sounds that region over its tick range; an arpeggiated region is heard arpeggiated, not blocked.
  - The stack button at a tick inside an arpeggiated region sounds the notes audible at that tick together — a different sound from tapping the region itself, which is the reason both exist.
  - Layout for existing single-note phrases is visually unchanged (one lane, one cell per note).

## Corpus

- Goal: harmonized and chord-drill entries in `inventory/melodies.ts`, reachable by the harmonic situations.
- Tests (`inventory/melodies.test.ts`):
  - Every multi-voice entry normalizes without error and each voice fills its measures.
  - At least one `"independent"` phrase exists for each new situation in both families — otherwise selecting it strands the learner on an empty practice screen.
  - Phrase selection with only harmonic situations selected returns a multi-voice phrase.
  - At least one entry has a voice sustaining across another voice's arpeggio, since that is the shape the grid, the sounding-set detection, and the playback all hinge on.

## Release

- Goal: `APP_VERSION` bumped, `docs/` updated to describe cells, lanes, skips, the harmony track, and both situation families.
