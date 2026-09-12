# Objective and Context

Implement v1 of the functional ear trainer described in `docs/design.md`: a phone-first, client-only PWA that drills named functional patterns (short scale-degree sequences) with FSRS scheduling, two self-graded modes, local profiles, and manual pattern introduction.

## Entities

- `Note` — `{ degree: 1..7, alteration: -1 | 0 | 1, octave: number }`. Degree is always measured against the major scale; `octave: 0` is the home register — the band `[tonic, tonic + 12)` established by the context — with `1` above and `-1` below.
- `Event` — `{ notes: Note[] }`. One or more notes sounding together. Melodic patterns are all one-note events.
- `Pattern` — `{ id: PatternId, context: Context, events: Event[] }`. `PatternId` is a branded string derived from `(context, events)`, so identity is independent of where the pattern came from.
- `Context` — open union, `"major-cadence" | "minor-cadence"` in v1. Part of pattern identity.
- `Mode` — open union, `"transcription" | "audiation"` in v1.
- `CardId` — `(PatternId, Mode)`. One `ts-fsrs` `Card` per `CardId`.
- `Profile` — `{ id, name, color, tonicMode: "fixed" | "moving", tonic: Midi }`. Every deck key is scoped by profile id. `tonic` is only used when `tonicMode` is `"fixed"`.
- `Trial` — `{ cardId, confidence: "known" | "unsure", outcome: "got-it" | "missed" }`. Only `known` + `got-it` maps to FSRS `Rating.Good`; everything else is `Rating.Again`.
- `Song` — `{ id, title, patternIds: PatternId[] }`. Songs reference patterns; they never own them.

## Files

Nothing exists yet beyond `docs/design.md` and `README.md`. Planned layout (flat, single package, no workspaces):

- `index.html`, `main.ts` — entry; builds ctx, mounts root view, runs the dispatch loop.
- `vamp.ts`, `vamp.test.ts` — vendored verbatim from `gatherus/main/packages/frontend/`.
- `music/note.ts` — `Note`/`Event`/`Pattern` types, normalization, pattern id derivation.
- `music/format.ts` — formatters (numeric with `♭`/`♯` prefix and `↑`/`↓` suffix; solfège later), the canonical-form serializer used for `PatternId`, and the ASCII input parser.
- `music/pitch.ts` — degree → MIDI given a tonic; cadence voicings per `Context`.
- `audio/engine.ts` — `AudioEngine`: unlock, instrument loading, `playContext()` / `playPattern()`, supersede/cancel.
- `deck/card.ts` — card id, FSRS wrapper, `grade(trial)`.
- `deck/store.ts` — `DeckStore`: in-memory deck + localStorage persistence, scoped by profile.
- `deck/profiles.ts` — `ProfileStore`.
- `inventory/patterns.ts` — generated static inventory (ordered list of patterns + gloss).
- `inventory/songs.ts` — generated static song → pattern-id mapping.
- `scripts/derive-inventory.ts` — offline, run once, emits the two files above.
- `views/` — vamp views: `app.ts`, `profile-picker.ts`, `home.ts`, `trial.ts`, `add-patterns.ts`, `stats.ts`.

# Design

The app is one dispatch loop over a state machine, following the vamp pattern: `dispatch(msg) -> update(state, msg, ctx, dispatch) -> view.sync(state)`. Everything with a lifecycle longer than a view — audio, deck, profiles, post-render bus — lives on `AppCtx` and is threaded down as constructor args.

Three layers, in dependency order:

1. **Music model (pure).** Types, normalization, formatting, parsing, and the degree → MIDI mapping. No DOM, no audio, no time. This is where the majority of the tests live, because it's where the subtle correctness is (octave normalization, accidental spelling, pattern identity).
2. **Stores (impure, injectable).** `AudioEngine` wraps smplr and an `AudioContext`. `DeckStore` wraps `ts-fsrs` and localStorage. Both expose a small message/reducer surface and are mocked in view tests.
3. **Views (vamp).** Screens are slots off a root view switching on `state.page`.

The trial is itself a small state machine, and it is the part worth getting exactly right:

```
idle -> presenting --(commit: known|unsure)--> revealing --(outcome: got-it|missed)--> graded -> next trial
```

Audio is never part of that state beyond "what's currently sounding" — replays don't advance anything, and there's no replay cap.

**Why manual introduction simplifies things:** there is no gating engine, no prerequisite graph, no daily-new cap. The scheduler's only job is "which due card next," and introduction is a user action that creates two FSRS cards. This removes the single largest source of tunable-parameter guesswork from v1.

**Why the inventory is generated offline:** deriving patterns from a corpus is a one-time analysis, not app functionality. `scripts/derive-inventory.ts` reads melodies in degree notation, counts n-grams, crosses that with the theory-derived ordering, and emits a checked-in TS module. The app just imports a constant.

## Interfaces

Nothing is installed yet — the repo currently contains only `docs/` and `README.md`. The versions below are the latest published at time of writing, resolved via `npm show`, and their type declarations were read from the packed tarballs to confirm the API shapes used in this plan: `smplr@1.0.0`, `ts-fsrs@5.4.2`, `vite@8.3.0`, `vitest@5.0.0`, `typescript@7.0.2`, `vite-plugin-pwa@1.3.0`. The Scaffold stage installs them; re-check the resolved versions then, and re-read the `.d.ts` for smplr and ts-fsrs if they've moved, since both are the load-bearing dependencies here.

(Local snag to clear first: `~/.npm` contains root-owned files and `npm install` fails with `EPERM`. Fix with `sudo chown -R $(id -u):$(id -g) ~/.npm`, or pass `--cache` a writable directory.)

```typescript
// music/note.ts
type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Alteration = -1 | 0 | 1;
// octave 0 = the home register, the band [tonic, tonic + 12). So
// { degree: 5, octave: 0 } is the fifth above the tonic, and
// { degree: 1, octave: 0 } is the tonic itself. 1 = the band above, -1 below.
type Note = { degree: Degree; alteration: Alteration; octave: number };
type Event = { notes: Note[] };
type Context = "major-cadence" | "minor-cadence";
type PatternId = string & { readonly __brand: "PatternId" };
type Pattern = { id: PatternId; context: Context; events: Event[] };

// No octave normalization: the context fixes the tonic's register, so octave
// is absolute relative to that tonic and is part of identity. `5↓-1` (rising
// into the tonic from below) and `5-1↑` (rising away from it) are different
// cards. Identity is (context, events) exactly as written.
function makePattern(context: Context, events: Event[]): Pattern;

// music/format.ts
type Formatter = "numeric" | "solfege";
function formatPattern(p: Pattern, f: Formatter): string; // "1-♭3-5", "1+3+5-4↑"
function parsePattern(input: string, context: Context): Result<Pattern>; // accepts b/#/'/,/^/v aliases
function canonicalForm(context: Context, events: Event[]): string; // ASCII only: "major-cadence|1+3+5-4^"

// Notation grammar. Two separators, one per dimension:
//   `-` separates events in time    (solfège/Nashville convention: 1-4-5-1)
//   `+` stacks notes within one event, low to high, and binds tighter than `-`
// So `1+3+5-4+6` is "I triad, then a 4/6 dyad". `-` is unambiguous because
// accidentals are prefixes (♭3, ♯4), octave marks are suffixes (3↑), and
// there are no negative numbers in the grammar. `/` is deliberately unused:
// it means chord-over-bass in music notation, not "then". `,` is unavailable
// as a sequencer because it's the ASCII octave-down alias.

// music/pitch.ts
type Midi = number;
function noteToMidi(note: Note, tonic: Midi): Midi;
function cadenceChords(context: Context, tonic: Midi): Event[]; // voiced I-IV-V-I / i-iv-V-i

// audio/engine.ts
type PlaybackHandle = { cancel(): void };
interface AudioEngine {
  readonly unlocked: boolean;
  unlock(): Promise<void>;            // must be called from a user gesture (iOS)
  playContext(context: Context, tonic: Midi): PlaybackHandle;
  playPattern(pattern: Pattern, tonic: Midi): PlaybackHandle;
}
// Implementation: smplr `Soundfont(ctx, { instrument })`, `await inst.ready`,
// then `inst.start({ note: midi, time, duration })` at absolute AudioContext
// times. Supersede = `inst.stop()` on the previous handle before starting.

// deck/card.ts
type Mode = "transcription" | "audiation";
type CardId = string & { readonly __brand: "CardId" }; // `${patternId}|${mode}`
type Confidence = "known" | "unsure";
type Outcome = "got-it" | "missed";
type DeckCard = { id: CardId; patternId: PatternId; mode: Mode; fsrs: FsrsCard };
type TrialLogEntry = { cardId: CardId; at: number; confidence: Confidence; outcome: Outcome };

function ratingFor(confidence: Confidence, outcome: Outcome): Rating; // Good iff known+got-it

// deck/store.ts
interface DeckStore {
  getState(): { cards: Record<CardId, DeckCard>; log: TrialLogEntry[] };
  addPattern(patternId: PatternId): void;   // idempotent; creates one card per Mode
  nextDue(now: Date): DeckCard | undefined;
  grade(cardId: CardId, confidence: Confidence, outcome: Outcome, now: Date): void;
  exportJson(): string;
}
```

Storage keys: `profiles`, `profile:<id>:cards`, `profile:<id>:log`. Nothing deck-related is stored globally.

## Invariants

- Pattern identity is `(context, events)` and nothing else, octaves included. Adding the same pattern from the theory list, a song, or user input yields the same `PatternId` and must not duplicate a card or reset its scheduling state.
- Octaves are never normalized away. `5-1`, `5-1↑`, and `5↓-1` are three distinct patterns, because the context pins the tonic's register and each sits differently against it.
- The only register freedom is the choice of tonic pitch, and it applies to the **whole trial** — cadence and pattern transposed together, so their relationship is preserved.
- Tonic choice is a user setting, not an automatic behavior: `tonicMode: "fixed" | "moving"`. `fixed` uses the profile's configured tonic for every trial; `moving` randomizes per trial. It is a presentation setting only — it does not enter `PatternId`, `CardId`, or any FSRS state, so switching it never splits or resets scheduling. (Modeling difficulty separately for fixed vs. moving is deferred.)
- `♯4` and `♭5` must never collapse. The model stores degree + alteration precisely so they don't.
- Only `known` + `got-it` is a successful retrieval. The full `(confidence, outcome)` pair is persisted, never collapsed to a boolean.
- Exactly one audio stream sounds at a time. Starting any playback cancels whatever is playing, including mid-note.
- The AudioContext is created and resumed only from a user gesture; no playback is attempted before `unlock()` resolves.
- Every localStorage read is scoped by the active profile. A session must never be logged to the wrong profile.
- Reducers never touch the DOM or audio hardware directly — audio calls go through the injected `AudioEngine` so tests can assert on them.
- Formatting is a pure function of the model; no formatted string is ever persisted as the source of truth (except inside the derived `PatternId`, which is canonical-form-only).
- `PatternId` embeds `canonicalForm`, which is ASCII-only and stable — changing the display formatter must never change an id, or every persisted card orphans.
- Within an event, notes are serialized in ascending pitch order, so `1+5` and `5+1` are the same pattern. Order only carries meaning across `-`.

# Stages

## Scaffold — DONE

Status: complete. Notes/deviations:

- Installed `vite@8.3.0`, `vitest@5.0.0`, `typescript@7.0.2`, `@biomejs/biome@2.5.13`, `jsdom@30.0.1`, `@types/node`. smplr / ts-fsrs / vite-plugin-pwa are not installed yet — they land in the stages that need them.
- `tsconfig.json` needed `"types": ["vite/client", "node"]` for `import.meta.dirname` and `process.env` in the vite/vitest configs.
- `biome.json` excludes `vamp.ts` / `vamp.test.ts` so the vendored files stay byte-identical to the source in `gatherus`. The vamp skill doc is vendored at `.magenta/skills/vamp/skill.md`.
- The trivial view is `views/hello.ts` (+ `views/hello.test.ts`), wired through `main.ts` with the standard dispatch loop. `Binder`'s constructor is `(container, initialState)` — it does not take `dispatch`, despite the skill doc's example.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` all pass.

- Goal: `npm run dev` serves a phone-sized hello-world; `npm run build` emits static files; `npm test` and `npm run typecheck` pass. vamp is vendored and its own test passes unmodified.
- Work: `package.json`, `vite.config.ts` (esnext target, SPA fallback middleware), `vitest.config.ts`, `tsconfig.json` (bundler resolution, DOM lib, `vite/client`), biome with no-floating-promises, copy `vamp.ts` + `vamp.test.ts` + the vamp skill doc into the repo.
- Tests:
  - The vendored `vamp.test.ts` passes as-is — confirms the toolchain runs the code the framework expects.
  - A trivial view mounts into a container, syncs on a state change, and destroys cleanly. This is the integration check that matters: it proves the Binder/ref/sync wiring works under this vite+vitest config, not just that TypeScript compiled.

## Music model — DONE

Status: complete. Notes/deviations:

- `cadenceChords(context)` takes no tonic; `cadenceMidi(context, tonic)` in `music/pitch.ts` does the transposition. Keeping the voicing in model space means the same transposition invariant covers cadence and pattern.
- Voicings are root position: major `I(1,3,5) IV(4↓,6↓,1) V(5↓,7↓,2) I`; minor is the same with `♭3`/`♭6` and a major V.
- `Result<T>` is defined in `music/format.ts` (`{ ok: true; value } | { ok: false; error }`); nothing else in the repo needed it yet.
- Octave marks stack (`1^^` = octave 2) and mixed marks cancel; canonical form always re-emits them in the normalized repeated form.
- Ties in the within-event pitch sort (e.g. `♯4` vs `♭5`) break by degree, so the ordering is total and stable.
- The solfège formatter is implemented (chromatic syllables, falling back to glyph+natural for `♯3`/`♯7`/`♭1`/`♭4`); the parser is numeric-only.
- Tests live in a single `music/music.test.ts` rather than one file per module.

- Goal: patterns can be constructed, normalized, identified, formatted, parsed, and converted to MIDI.
- Tests:
  - `5-1`, `5-1↑`, and `5↓-1` yield three different ids — the case that proves octaves aren't being normalized away.
  - Transposing a trial to a different tonic changes no pattern id, and shifts every MIDI note (cadence included) by the same amount.
  - `♯4` and `♭5` produce different ids and different formatted output, but the same MIDI note — the pair that proves the model isn't secretly pitch-class-based.
  - Round-trip: `parsePattern(formatPattern(p))` is `p`, over a table of patterns covering accidentals, octave marks, and simultaneity.
  - The ASCII aliases (`b3`, `#4`, `1^`, `5v`, `1'`, `5,`) parse to the same notes as the glyph forms.
  - `+` binds tighter than `-`: `1+3-5` parses as two events, not three, and `5+1` and `1+5` yield the same id.
  - `noteToMidi` against a hand-written table for a couple of tonics, including negative octaves.

## Audio — DONE

Status: complete. Notes/deviations:

- `smplr@1.0.0` installed. `audio/engine.ts` holds the scheduling arithmetic (`scheduleGroups`, `scheduleDuration`, `patternMidi`) plus `SamplerAudioEngine`.
- `SamplerAudioEngine` takes an injected `loadInstrument()` returning `{ instrument, currentTime }`, so tests use a fake instrument and the real `AudioContext` is only created inside `unlock()` (the gesture path). `soundfontEngine(instrumentName)` is the production factory.
- `Instrument` is a two-method structural slice of smplr (`start({note,time,duration})`, `stop()`), which is all the engine needs and all the fake has to implement.
- Playback before `unlock()` is a silent no-op returning an inert handle.
- Timing is fixed constants (`CADENCE_TIMING`, `PATTERN_TIMING`) with a 50ms lead-in off `AudioContext.currentTime`. Randomized instrument/rhythm and `tonicMode` wiring are deferred to the trial-flow stage, where the per-trial state that would drive them actually exists.
- On-device verification (iOS autoplay/unlock, sample loading) still pending — there is no trial UI to exercise it from yet.


- Goal: tapping a button plays a cadence, then a pattern, on a real device, and a second tap cuts the first off.
- Work: `AudioEngine` over smplr `Soundfont`; gesture-gated unlock; scheduling via absolute `AudioContext` times; per-trial randomized instrument and rhythm; tonic per the profile's `tonicMode`.
- Tests: mostly manual on an actual iPhone, since the failure modes here (autoplay policy, unlock timing, sample loading over a flaky connection) don't reproduce in jsdom. Automated coverage limited to the scheduling arithmetic:
  - Given a pattern and a tempo, the computed `(note, time, duration)` list has the expected onsets, including simultaneous notes sharing an onset.
  - `playPattern` while a context is sounding calls `stop` on the previous handle before starting — assert against a fake instrument, because "two things sounding at once" is the bug users will actually hit.

## Deck and scheduling — DONE

Status: complete. Notes/deviations:

- `ts-fsrs@5.4.2` installed. `deck/card.ts` holds ids, types and `ratingFor`; `deck/store.ts` holds `DeckStore`.
- `DeckStore` takes `(profileId, storage)` where `storage` is a two-method `KeyValueStore` slice of `Storage`, so tests use a plain in-memory object and profile scoping is structural rather than global.
- `addPattern(patternId, now?)` takes an optional clock so tests are deterministic.
- Dates are revived on load by walking `due` / `last_review` on the persisted FSRS card; nothing else in the card is a `Date`.
- "The other three pairs do not advance the due date" is asserted as *schedules strictly sooner than Good* — on a new card `Again` still schedules a learning step a minute out, so an absolute "no advance" assertion would be wrong.
- Tests live in a single `deck/deck.test.ts`.

- Goal: cards can be added, scheduled, graded, persisted, and reloaded.
- Work: `ts-fsrs` wiring (`createEmptyCard`, `fsrs().next(card, now, rating)`), `DeckStore`, localStorage persistence, JSON export.
- Tests:
  - `addPattern` twice does not duplicate cards or reset scheduling state — the idempotence invariant, stated directly as a test.
  - `known`+`got-it` advances the due date; the other three combinations do not. Table-driven over all four pairs.
  - A graded deck survives a serialize/deserialize round-trip with `Date` fields intact — the classic localStorage bug.
  - `nextDue` returns nothing when all cards are in the future.

## Profiles — DONE

Status: complete. Notes/deviations:

- `deck/profiles.ts` owns the storage-key helpers (`cardsKey`, `logKey`) and `DeckStore` now imports them, so key scoping has exactly one definition.
- `ProfileStore(storage)` takes the same `KeyValueStore` slice as `DeckStore`. Surface: `list`, `get`, `active`, `setActive`, `save` (create-or-replace by id), `exportJson`, `importJson`. The active profile id is persisted under `profile:active`.
- Export is whole-device: `{ profiles: [{ profile, cards, log }] }`, carrying each profile's deck blobs verbatim so import is a true backup restore. Import merges by id and never touches profiles absent from the payload.
- No profile-picker view yet — the app shell is still the stage-1 hello view, so the switching UI lands with the trial-flow stage, built against this store.
- Tests live in `deck/profiles.test.ts`.

- Goal: multiple learners on one device, with switching from the home screen.
- Tests:
  - Grading under profile A leaves profile B's deck untouched, asserted through the store's public surface rather than by inspecting keys.
  - Export contains all profiles; import merges by id without clobbering unrelated profiles.

## Trial flow — DONE

Status: complete. Notes/deviations:

- `views/trial.ts` holds the state machine (`State`, `Msg`, `update`, `nextTrial`, `canPlayPattern`, `showsNotation`) and `TrialView`. Tests in `views/trial.test.ts` run the reducer against a fake `AudioEngine` and an in-memory-backed `DeckStore`.
- The trial is reconstructed from the card: `patternFromId` (new, in `music/format.ts`) parses a `PatternId` back into a `Pattern`, since the id *is* the canonical form. No pattern inventory is needed yet.
- Phases are `presenting | revealing`; grading immediately advances to the next due card, so "graded" is not a resting state.
- Context and pattern playback are separate buttons rather than an automatic cadence-then-pattern sequence: the engine plays exactly one stream at a time, so chaining would need cross-stream scheduling that isn't worth it for v1. The trial does not auto-play on entry — the first tap is also the iOS unlock gesture.
- Unlock is handled in the reducer: a `PLAY_*` on a locked engine calls `unlock()` and re-dispatches itself, so the AudioContext is only ever created inside a gesture. Failures land in `state.error`.
- Audiation gating is symmetric: audiation shows notation and withholds pattern audio until reveal; transcription plays audio and withholds notation.
- `TrialCtx` injects `now()` and `randomTonic()` so tonic selection and scheduling are deterministic in tests. `main.ts` now mounts `TrialView` (auto-creating a default profile) and the stage-1 `views/hello.ts` was removed.
- On-device verification still pending, together with the audio stage's.


- Goal: a full practice session runs end to end on a phone — context plays, prompt is presented, commit, reveal, grade, next.
- Work: `views/trial.ts` as a two-phase view, replay controls, chunky two-button layouts, safe-area and `dvh` handling.
- Tests: the interesting complexity is the state machine and its coupling to audio and the deck, so test the reducer against a fake `AudioEngine` and an in-memory `DeckStore`:
  - The commit → reveal → grade sequence writes exactly one trial log entry with the correct `(confidence, outcome)` pair.
  - Replaying audio any number of times in either phase changes no deck state and logs nothing.
  - A pattern's audio is not playable during presentation in audiation mode, and is after reveal.
  - Under `tonicMode: "moving"`, grading advances to a new trial with a freshly randomized tonic; under `"fixed"`, the tonic is the configured one on every trial.
  - Switching `tonicMode` leaves every card's FSRS state untouched.

## Inventory and the add screen — DONE

Status: complete. Notes/deviations:

- The corpus lives in `inventory/corpus.ts` as twelve nursery/folk melodies in degree notation (`CorpusMelody = { id, title, context, melody }`), parsed with the existing `parsePattern`. The songs stage reuses it directly.
- `scripts/derive-inventory.ts` exports `deriveInventory(corpus, options)` (pure, tested on a fixture) and writes `inventory/patterns.ts` when run as `npm run derive-inventory` (`node --experimental-strip-types`). No new dependency was needed.
- Candidates come from corpus n-grams rather than from an enumerated theory skeleton: theory supplies the *tiers*, frequency ranks within them. v1 keeps `lengths: [2, 3]` and `minCount: 2`; longer patterns are deferred rather than emitted with counts of one.
- `Tier` (0-5) and `InventoryEntry` live in `inventory/entry.ts` so the generated file only contains data. Tier = length rank (2 vs 3 notes) × degree rank (triad tones / stepwise fill / tendency tones or accidentals).
- Repeated-note n-grams (`1-1`) are dropped: they are not intervals and teach nothing.
- `views/add-patterns.ts` is a `bindList` of row child views; `rows(ctx)` re-reads "added" from the deck every rebuild, so known-ness has exactly one source. The inventory is injected through `AddPatternsCtx` so tests drive a fixture list.
- `main.ts` gained a two-button nav that remounts between the trial and add screens, each with its own dispatch loop. This is a placeholder for the `views/app.ts` shell, not a router.

- Goal: a "by theory" list you can add patterns from, backed by a generated inventory.
- Work: `scripts/derive-inventory.ts` (corpus in degree notation → n-gram counts → ranked, tiered inventory), checked-in output, `views/add-patterns.ts`.
- Tests:
  - The derivation script on a small fixture corpus produces the expected ranking — run as a unit test over the fixture, not over the real corpus, so it stays fast and deterministic.
  - Every `PatternId` in the generated inventory round-trips through the parser, catching a generator that emits something the app can't read.
  - Adding from the list marks the pattern known everywhere it appears.

## Songs

- Goal: the "by song" tab — pick a melody, see its patterns with known ones marked, add the rest; full decomposition shown once all are known.
- Tests:
  - A song's decomposition references only pattern ids present in the inventory.
  - Marking a pattern known via the theory list is reflected in every song that references it — the identity invariant, exercised across features rather than restated in a unit test.

## PWA

- Goal: installable to the home screen, opens offline, and the install step is a real first-run screen rather than a dismissible banner.
- Work: `vite-plugin-pwa`, manifest, icons, precache, first-run install explanation.
- Tests: manual, on an actual iOS device — install to home screen, go offline, open, complete a session. The thing being verified is Safari's storage-eviction exemption, which nothing in CI can check.

## Deferred

Out of scope for v1, in rough order of likely value: custom melody entry, the discrimination mode, solfège formatter, staff notation, minor-cadence inventory, rhythmic patterns, accounts and sync.
