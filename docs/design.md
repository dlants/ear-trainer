# Functional Ear Trainer — Design Notes

## Motivation

The goal is to hear a piece of music, know what I'm hearing, and play it back. Concretely: pick out a melody without hunting for it on an instrument.

Current state: I've done a lot of static scale-degree training. Given a major cadence and then a single note, I can identify the degree reliably. I have a well-internalized feel for how each degree sounds against a tonic.

Where it breaks down: melodies. Trying to work out *Happy Birthday*, I could feel direction and tension, but couldn't assign syllables without trial-and-error on the keyboard. The degrees sound different in motion than they do in isolation — a 4 approached from 2 doesn't feel like a 4 held against a drone, and the step down into 3 changes both notes' character.

Diagnostic detail worth recording: my trial-and-error answer was 1-1-2-1-4-3. The intervals were right; the tonic was wrong by a fifth (it's 5-5-6-5-1-7). That's the characteristic failure of instrument-hunting — it gives you relative motion and never tells you where home is.

## Diagnosis

The context-dependence isn't noise to be filtered out. It's the actual signal experienced transcribers use. The problem is that I trained one cue (degree against a static tonic) and am trying to apply it to a task that runs on a different representation: functional patterns in motion.

The naive framing — "now I have to recognize 7×6 = 42 two-note combinations, then hundreds for three notes" — is wrong, because the space is nowhere near uniform. Tonal melody is dominated by stepwise motion and a small set of tendency gestures (7→1, 4→3, 6→5, 2→1, 2→3). Those are exactly the things I already report hearing as "tension, then it settles." The compression is real and already partly present; what's missing is labels attached to it.

So: **the unit of training is the named functional pattern, not the note and not the interval.**

A second factorization exists at the harmonic level — most melody notes are chord tones, so knowing the implied chord cuts candidates from ~7 to ~3. Worth pursuing eventually, but it's a layer on top, not the starting point. (Bass tracking, often recommended as the entry point here, is not my bottleneck — I played bass; extracting and singing back a bass note has never been the problem. The problem is mapping a pitch to a function.)

## Design

### Cards

Each card is a **named functional pattern**: a short scale-degree sequence, e.g. `1-4-3`, `5-6-5`, `3-2-1`, `7-1`, `1-2-3`.

A pattern is drilled in several **modes**, each tracked as an **independent card** with its own scheduling state (same as Anki's forward/reverse model). Card identity is `(patternId, mode)`, where a pattern is itself `(context, degrees)` (see below), and `Mode` is an open string union — `"transcription" | "audiation"` in v1, with discrimination and anything else addable without disturbing the id scheme. Two in v1:

- **Transcription** — hear tonic/cadence, hear the pattern, name the degrees to yourself, reveal and compare.
- **Audiation** — see the written form, hear the tonic, sing it internally, reveal and compare.

Both are self-graded, under the two-phase commit described in Trial flow.

They fail differently and shouldn't be averaged: transcription errors cluster by acoustic similarity (5-6-5 vs 1-2-1), audiation errors cluster by interference from adjacent cards. A card can be solid one way and shaky the other.

### Note representation

A note is `{ degree: 1..7, alteration: -1 | 0 | 1, octave: number }` — diatonic degree, chromatic inflection, and register offset. Not a pitch-class offset from the tonic (0–11): that collapses `♯4` and `♭5`, which are functionally distinct (`♯4` leads up into 5, `♭5` doesn't), and it loses the letter needed to spell staff notation later. Not a string: the parsed structure is what the answer input, the decoy generator, and every renderer need.

Note that a degree has no major/minor *quality* — quality is a property of chords, not of scale degrees. The third in a minor tonic is a lowered third, `alteration: -1`.

#### Octave

`octave` is an integer offset from the pattern's home register, not an absolute octave: `0` is home, `1` is the octave above, `-1` below. There is no degree `8` — the octave above the tonic is `{ degree: 1, octave: 1 }`, which is the same function as `1` and should be modeled as such. Degree numbers above 7 (the jazz `9`/`11`/`13` convention) would put the same function under two different names, and that's exactly the thing the whole design is trying to avoid.

**Octave is absolute relative to the tonic, and part of the pattern's identity.** It's tempting to normalize it away — to treat only the internal contour as meaningful and let register float — but that's wrong, because the context fixes the tonic's register before the pattern sounds. `5↓-1` rises a fourth *into* the tonic from below (the *Happy Birthday* opening); `5-1↑` rises a fifth away from an already-established tonic. Same interval, different gesture, different thing to learn. `5-1`, `5-1↑`, and `5↓-1` are three cards.

The register freedom that *is* nuisance variation is the choice of tonic pitch — and it applies to the whole trial, cadence and pattern transposed together, so the pattern's position against the tonic is preserved.

Display suffix: `↑` for up, `↓` for down — `1-3-5-1↑`, `5↓-1`. Marks stack (`1↑↑`) though nothing in practice will need it.

Two things ruled out. `^` collides with established usage: a caret over a numeral is the standard notation for *scale degree* itself (`3̂` = scale degree 3), so `^3` reads as the degree, not the register. And `v` breaks the solfège formatter — `5↓` is fine but `solv` and `mev` are not, and a suffix that only works with numerals has to be replaced the moment a second formatter exists. Arrows work in every formatter, carry no prior meaning, and stay legible at a glance on a phone in a way that `'` / `,` (the ABC / Tonic Sol-fa convention) does not — a comma is nearly invisible at small type, and mid-drill glanceability matters more than matching a convention nothing else here reads.

Accept `'` / `,` and `^` / `v` as ASCII input aliases for typed melody entry, and normalize to arrows for display.

#### Simultaneity

A pattern is a sequence of **events**, each holding one or more notes: `Pattern = { notes: Note[] }[]`. A single-note event is a one-element array, so melodic patterns fall out of the same type with no special case.

Display: `-` separates events in time, `+` joins notes sounding together — `1+3-5+1↑` is two dyads.

The model supports this from the start because retrofitting it means touching every function that walks a pattern. But *drilling* dyads is a different perceptual skill — hearing two pitches at once is interval-quality recognition, not melodic function — so it's a separate track in the inventory, not mixed into the melodic progression. It also needs an answer input that can commit several degrees per event, which the simple 7-button pad doesn't do.

**Display is a pure formatter over that model**, so the written form is a preference, not a commitment. Default form puts the accidental *before* the numeral: `1-♭3-5`, `4-♯4-5`. This is the universal convention — the Nashville number system, jazz extensions (`♭9`, `♯11`), and general theory writing all prefix the accidental, and it matches staff notation's reading order. `b` and `#` are accepted as typed input and normalized to glyphs for display.

A suffix form (`3m`) was considered and rejected: `m3` already means *minor third*, an interval rather than a degree; `m` elsewhere marks chord quality (`Am`), quietly reintroducing the category error above; and it doesn't generalize, since `♭2` and `♭6` are obvious where `2m` and `6m` read as nothing.

Alternate formatters worth adding behind a setting, once the model is in place:

- **Movable-do solfège** (`do-me-sol`) — the argument is singability: one syllable per chromatic pitch (do di re ri mi fa fi sol si la li ti), where `♭3` is "flat three," two syllables, which is exactly wrong in the audiation mode where you're vocalizing. If audiation proves the harder direction, revisit.
- **Staff notation** — the real-world payoff of transcription is writing things down, and it exercises the spelling that `alteration` preserves. Needs a rendering dependency (VexFlow / abcjs) and a key commitment. Later.

**Fixed note names (`C-E-G`) are rejected** — they pin the display to one key, contradicting transposition, and train pitch → letter instead of pitch → function.

#### There is no key, and no mode — only context

Key is not in the model. A pattern is degrees relative to a tonic; the actual tonic pitch is chosen at playback and randomized, like timbre and rhythm. Mode isn't in the model either: degrees are *always* measured against the major scale, because that's the only reference the system has. A minor-sounding pattern is simply one containing `♭3`, `♭6`, `♭7`. So `3` never means "the third degree of whatever scale we're in" — it means the major third, unconditionally.

What *is* in the model is **context**: the cadence or drone played before the pattern to establish the tonic. Unlike key, this cannot be randomized, because it changes what the same degrees mean:

- Major cadence, then `1-♭3-5` — the `♭3` is borrowed, a blue third bent against an established major context. Audibly tense.
- Minor cadence, then `1-♭3-5` — the `♭3` is the stable tonic third. Home, no tension at all.

Identical pitches, opposite functions, and entirely different to identify. So **context is part of card identity**: a card is `(context, degrees, mode)`. `1-♭3-5` in major context and `1-♭3-5` in minor context are two different cards that happen to share a degree sequence — correctly, because they are two different skills.

`Context` starts as `"major-cadence" | "minor-cadence"` and is an open union like `Mode`, leaving room for a sustained drone, a modal context, or a single-chord vamp later. V1 inventory is major-cadence only; minor is an inventory expansion that needs no model change.

### Rhythm is nuisance variation, not a card dimension

A pitch pattern should fire regardless of how it's rhythmed. Splitting `1-2-1` into rhythm variants would bind pitch to rhythm and make transcription brittle. Instead, **randomize rhythm within a card** — varying the irrelevant dimension is what produces invariance. Same for timbre and for the tonic pitch (the whole trial transposes together — see Octave, below; the pattern's register *relative* to the tonic is not nuisance variation).

(Rhythmic patterns are a legitimate separate deck — dotted-eighth-sixteenth, triplets, syncopated anticipation — drilled on a single pitch. Out of scope for v1. Note that rhythm isn't purely irrelevant at the functional level: downbeat notes are far likelier to be chord tones. That's a prior to exploit later, not a reason to expand the deck.)

### Progression

Cards introduced in **frequency order**, one new card at a time, mixed with all previously learned cards in random order.

Rough ordering:
1. Two-note patterns within 1-3-5
2. Add 2 (stepwise motion into the triad)
3. Add 4 and 7 last — these carry the strongest tendency cues, which I already partly hear
4. Three-note patterns
5. Longer patterns / common phrase shapes

#### Deriving the inventory

Two sources, crossed:

- **Theory** gives the skeleton and the ordering rationale: triad tones first (1-3-5 and its permutations), then stepwise fill (2, 6), then the tendency tones last (7→1, 4→3), since those carry the strongest pull and are the easiest to hear once the stable degrees are anchored. This produces a clean, well-motivated progression but says nothing about which patterns actually *occur*.
- **Repertoire** gives frequency and validates the skeleton. Take a corpus of simple, universally-known melodies — nursery rhymes, folk songs, hymns, the things a kid already has in their ear — transcribe them to degrees, and count n-grams. A pattern earns its place by how often it shows up.

The crossing matters in both directions. Repertoire frequency alone would surface patterns that are common but pedagogically out of order; theory alone would drill patterns that are elegant and rare. Use frequency to rank within the theory-derived tiers, and use it to catch omissions — if a two-note pattern is everywhere in the corpus and isn't in the skeleton, the skeleton is wrong.

The corpus is also directly reusable as **worked examples**: once a learner knows the patterns in *Twinkle* or *Happy Birthday*, showing that the song decomposes into cards they already have is the payoff that makes the drilling feel connected to the goal. Worth keeping the song → pattern-sequence mapping around, not just the aggregate counts.

Practical note: this is a one-time offline analysis, not app functionality. A script that reads a corpus of melodies in some simple degree notation and emits ranked n-grams, run once, output checked into the repo as a static inventory. ABC notation or MIDI of public-domain nursery songs is easy to source; the transcription-to-degrees step needs a key per song, which for this repertoire is unambiguous.

**New patterns are added manually, not automatically.** There's no daily new-card cap and no unlock threshold; a separate "add patterns" screen lists the inventory in frequency order and you add one when you feel ready. The ordering above is a suggestion presented in that list, not a gate.

This avoids guessing at an introduction rate — the thing an automatic gate would need to get right, and the thing there's no data to tune. The learner already knows whether the current set feels solid, and for the shared-device case a parent can pace a kid directly. Reviews of everything already added still come from the scheduler; only *introduction* is manual.

The list can show a readiness hint (recent accuracy on related patterns) to inform the choice without enforcing it.

#### Two ways to add

The add screen has two tabs, backed by the same operation (`addPattern(patternId)`) and the same inventory:

- **By theory** — the ranked list described above, in pedagogical order, with a short gloss on what each pattern is and why it comes where it does. This is the default path: steady, ordered, no decisions beyond "am I ready for the next one."
- **By song** — pick a melody, see it decomposed into its constituent patterns with the ones you already know marked, and add the missing ones. The motivation is legible: *these four patterns are what stands between you and being able to transcribe this song.* It also front-loads whatever that particular song needs rather than following the global frequency order, which is the right trade when there's a specific melody you want.

**Card identity is the pattern, full stop.** `5-3-1` in major context is one pattern no matter where it came from — the theory list, a song, or user input. Source is not part of the id and never affects scheduling.

Consequences worth stating, because they're easy to violate later:

- Songs *reference* patterns; they don't own or contain them. A song is a list of pattern ids (plus the order they occur in), and the same id appears in many songs.
- Adding a pattern is idempotent. Adding `5-3-1` from *Twinkle* when it's already in the deck from the theory list is a no-op, not a duplicate card and not a reset of its scheduling state.
- Whether a pattern is "known" is a property of the deck, so it reads the same in every view — the song decomposition, the theory list, and the stats screen all ask the same question.
- No per-source stats. There's no such thing as "how am I doing on Twinkle's cards" beyond aggregating over the patterns it references, and that aggregate is derived, never stored.

#### Bring your own melody

The natural extension: let the user enter a melody and derive the patterns from it. Same decomposition machinery as the song view, applied to user input rather than the bundled corpus — so it's mostly an input problem, not a new feature.

Input options, cheapest first: type degrees directly (`5-5-6-5-1-7`, no key inference needed, but requires you to already be able to transcribe — useful for a teacher, not a learner); tap it on an on-screen keyboard and pick the tonic; paste ABC notation. Mic/audio input is out of scope for the same reasons it's rejected for grading.

Worth building, but after the bundled corpus works — it shares all the hard parts with it and none of them are the input widget. Note it makes the app useful to a teacher preparing material for a student, which is a real second user for the shared-device case.

Expect collisions (5-6-5 vs 1-2-1 will feel similar before they don't). **Don't avoid the collisions** — that's where discrimination actually gets built. Decoy selection in any future discrimination mode should draw from confusable neighbors in the same deck for exactly this reason.

### Trial flow

Every trial is two screens, and the shape is the same in every mode.

**1. Presentation.** The context is played, then the prompt — the pattern's audio in transcription, its written form in audiation.

Audio controls are explicit and separate: one button replays the context, another replays the pattern (in audiation there's nothing to replay until reveal, so that control is absent). Either can be pressed as many times as you like. **Playback supersedes:** starting one cuts off the other immediately, so there's never overlapping audio and never a queue to wait through. No limit on replays — a replay cap would grade fluency, which is a different variable and not one FSRS models.

Before advancing you must commit: **"I know it"** or **"not sure"**. This is the confidence tap, and it's mandatory rather than the optional mitigation it was earlier in this document, because it's what makes the self-grade meaningful.

**Self-report in both directions, no answer entry.** Transcription does not ask you to type or tap out the degrees — you name them to yourself, commit, and check at reveal. Entering an answer would be slow and annoying on a phone, and the whole point of the two-phase commit is that it already catches the failure mode that objective entry was there to prevent. This removes the degree pad from the trial screen entirely; it survives only in the custom-melody input, where you actually are transcribing something.

**2. Reveal.** The answer is shown, and both audio controls are now available — context and pattern, replayable freely, same supersede rule. In audiation this is the first time the pattern's audio exists; in transcription it's the same audio, now labeled.

Two buttons: **"got it"** or **"didn't get it."**

**Only "I know it" → "got it" counts as a successful retrieval.** Every other combination is a failure for scheduling purposes:

- *not sure → got it* is a guess that landed, and the whole reason for the two-phase commit is that it must not be allowed to look like knowledge. This is the specific case hindsight bias would otherwise swallow.
- *I know it → didn't get it* is a confident error, which is the most informative failure there is and should certainly come back soon.
- *not sure → didn't get it* is an honest miss.

Mapped onto FSRS: the success case is `Good`; everything else is `Again`. No `Hard` / `Easy` in v1 — four-way self-grading asks for a judgment the learner isn't well placed to make mid-drill, and the extra resolution isn't worth the extra decision on every card.

The `(confidence, outcome)` pair is logged in full, not collapsed to pass/fail. The four-cell distribution over time is the calibration diagnostic: a healthy deck has *not sure → got it* shrinking as patterns consolidate, and a persistently large *I know it → didn't get it* cell points at a specific confusable pair worth looking at directly.

### Grading

Both directions are **self-report, with an explicit standard** — mark correct only if you were certain *before* the reveal. Not "that sounded about right in retrospect."

Audiation is the harder case to hold yourself to, since the thing being compared is an internal image rather than a set of names.

The risk being managed is hindsight bias: hearing the answer makes a vague internal image feel like it matched. It's strongest exactly when the image was weakest, which is the case most worth catching. For a single disciplined user, holding the standard is sufficient.

The mitigation — a confidence tap before reveal — is **not optional**; it's the presentation-screen commitment in Trial flow above. "Unsure but turned out right" never counts silently as a success. Two taps instead of one, on every trial, in every mode.

**Rejected for v1:**
- *Mic-based pitch detection.* Doesn't work for the actual use case — people practice in transit and will subvocalize. Can't measure what wasn't sung.
- *Tap-it-on-a-keyboard-before-reveal.* Doesn't test anything: the notation is the prompt, so tapping it back tests transposition, not audiation.

**Possible later mode — discrimination:** show the notation, play either the correct pattern or a near-miss decoy (5-6-4, 5-7-5 — right contour, wrong degree), user answers match / no-match. Objective, silent, one tap. You can only detect a near-miss if your internal image was specific, so a vague image passes both and shows up in the stats. Decoy distance becomes a difficulty knob. It's the only objectively-graded mode on the table, which makes it the obvious addition if the self-report numbers start looking inflated — and the obvious default for a user who doesn't trust their own discipline.

### Diagnostic to keep

Log transcription and audiation accuracy separately over time, along with the `(confidence, outcome)` distribution for each. With no objectively-graded direction left, the calibration signal is that distribution rather than a comparison between the two modes: a *not sure → got it* cell that never shrinks means guessing is carrying the deck, and an accuracy curve that climbs while *I know it* commitments stay rare means the self-grade is drifting.

## Implementation

### Platform

Progressive web app. Browser-based, installable, works on iOS without touching the App Store or Android tooling.

**TypeScript, and entirely client-side.** The build output is static files — HTML, JS, a manifest, a service worker — deployable to any static host (GitHub Pages, Netlify, Cloudflare Pages) with no server, no API, no runtime config. Everything (audio synthesis, scheduling, storage) runs in the browser. This is what makes the app free to run and fully offline-capable; it's also why accounts are deferred, since adding them means adding a backend.

Since a static site costs nothing to host and nothing to operate, **assume it goes public.** That's not a v1 feature — no accounts, no analytics, no onboarding beyond the install prompt — but it does set a standing constraint: prefer standard music conventions over personal shorthand wherever the two conflict, since a second user arrives with theory background and no explanation from me. Profiles already make the shared-device case work; a public URL is the same app with a wider audience.

### UI

**Phone-first.** The practice context is a commute or a spare ten minutes, one hand, earbuds in. Desktop is an accident of the same codebase, not a target — layouts are sized for a phone viewport and simply center on wider screens rather than reflowing into a second column.

Consequences for the design:

- **Chunky targets.** The 44px accessibility floor is a floor, not a goal. Primary controls (degree buttons, replay, grade) should be ~64–72px tall and fill the available width in their row — a kid's aim is worse than an adult's, and a mis-hit that grades a card wrong is a corrupted data point, not just an annoyance. Generous gaps between adjacent buttons (12px+) matter as much as the size: adjacent targets with no gutter are the main source of fat-finger errors, and the degree pad is seven buttons in a row.
- **Touch, not click.** No hover-dependent affordances, no tooltips, no right-click, no tiny icon buttons. Use `pointerdown` for anything that should feel immediate (answer buttons) to skip the ~300ms click delay, and `touch-action: manipulation` to kill double-tap zoom. Every button gets a visible pressed state — for a young kid, confirmation that the tap registered is most of the interface.
- **Thumb-reachable controls.** Answer input and grading buttons live in the bottom third of the screen; the prompt (notation, replay button) sits above them. Never put a primary action in a top corner.
- **Two buttons per screen.** The trial screens need no answer entry at all — "I know it" / "not sure", then "got it" / "didn't get it". Two large side-by-side buttons across the bottom, which is the easiest possible target to hit one-handed and leaves plenty of room to be chunky. The degree pad exists only in the custom-melody input, which isn't time-pressured.
- **Viewport handling.** `viewport-fit=cover` plus `env(safe-area-inset-*)` padding for the notch and home indicator; `dvh` units rather than `vh` so the collapsing browser chrome doesn't clip controls.
- **No scrolling during a trial.** A trial screen fits in the smallest supported viewport. Session summaries and settings can scroll.

**Buttons only.** Every action is a labeled, visible button — replay, degree entry, reveal, grade, next. No swipes, no long-press, no tap-anywhere-to-continue, no gesture shortcuts of any kind. Gestures are invisible, need to be taught, are easy to fire accidentally mid-trial (a mis-swipe that grades a card is a corrupted data point, not just an annoyance), and they optimize speed at a volume where speed isn't the constraint. Revisit only if a specific interaction proves demonstrably too slow in practice.

### Profiles

Multiple learners share one device — a kid practicing on a parent's phone is the motivating case, not a hypothetical. **Build this in from the start**, because it's the one decision that's expensive to retrofit: every storage key, every export, and every stats query is scoped by profile, and adding that scope later is a data migration on the only copy of the data.

- A profile is `{ id, name, color }` and nothing else. No passwords, no accounts, no per-profile settings in v1 — the device is already the trust boundary, and a lock screen on a kid's practice app is friction with no threat model behind it.
- All scheduling state lives under the profile: storage is `profiles` (the list) plus `profile:<id>:cards` and `profile:<id>:log`. Nothing card-related is stored globally.
- Launch goes to a profile picker when more than one profile exists, and straight into practice when there's only one. Switching is a visible control on the home screen, not buried in settings — for a shared device it's a frequent action, and a session logged to the wrong profile poisons both learners' scheduling.
- Progression is per-profile by construction, which is the point: a kid working through two-note patterns and an adult on three-note patterns don't interfere.
- Export writes all profiles in one JSON file; import merges by profile id.

### Storage

**localStorage.** The state is a small map: card ID → review history, scheduling state, last-seen timestamp. A few KB.

Eviction is the one real concern — Safari's ITP clears script-writable storage after 7 days without interaction with the site, which is precisely the "missed a week of practice" pattern. **Content added to the home screen as a PWA is exempt from that cap.** So the mitigation is the install prompt, not the storage API. Make installation a first-run step with a clear explanation, not a dismissible banner.

(IndexedDB would additionally allow `navigator.storage.persist()`, and `idb-keyval` gives an almost-localStorage API over it. Worth revisiting only if eviction turns out to bite in practice.)

**Export to JSON, early.** Ten lines, and it means device loss isn't data loss before accounts exist.

No accounts in v1. If multi-device sync becomes worth it later, Supabase (Postgres + magic-link auth + one RLS policy) is currently the default recommendation for new web apps; Firebase remains viable and its auth tier is free for effectively unlimited users. Either is an afternoon; both imply a migration, which is the cost of deferring.

### Audio

**smplr** for playback. Sampled instruments over the Web Audio API with no setup; `soundfont-player` is archived and points to smplr as its replacement. Factory functions take an AudioContext; includes a Sequencer for scheduling notes on a shared clock, which covers cadence-then-melody timing.

Tone.js isn't needed for this.

Timbre variation comes free by swapping General MIDI instruments — this satisfies the "eventually use real recordings for timbre variety" goal without sourcing recordings. Randomize instrument per trial so surface matching can't substitute for pitch comparison.

**iOS gotcha:** AudioContext must be unlocked by a user gesture. Gate first playback behind an explicit tap.

### View layer

**Vamp**, vendored from gatherus (`packages/frontend/vamp.ts` + `vamp.test.ts`, and the `vamp` skill doc as the coding guide). Copy the three files in rather than depending on the other repo; it's ~570 lines with no dependencies.

Elm-style: a state machine per view (`State`, `Msg`, `update`), a single dispatch loop (`dispatch -> update -> view.sync`), and a `Binder` that declares DOM bindings once in the constructor and re-evaluates them on every `sync`. Child views mount through `bindSlot` / `bindList` (keyed), styles through `cls` + `mountStyle`, DOM handles through `ref` + `data-ref`. No framework, no build-time templating, no virtual DOM — plain TS and `innerHTML` at mount.

Why it fits here: the trainer is essentially one long-running state machine (pick card → play audio → collect answer → grade → schedule next), and the explicit `Msg` union makes the trial lifecycle legible and testable. Audio playback, FSRS, and localStorage all go in the ctx as injected stores (`audio`, `deck`, `storage`), so views declare the slice they touch and unit tests mock it. The post-render bus handles anything that must happen after the DOM settles (focus the answer input, scroll).

Note the skill doc is slightly ahead of/behind the code in places (e.g. `Binder<State>` takes `(container, initialState)` — dispatch is captured by the view, not the binder). Trust `vamp.ts`.

### Build and test

**Vite** for dev server and build; **Vitest** for unit tests — same as gatherus, and vamp was written against them. Flat single-package layout (no workspaces here), so one `vite.config.ts` at the root with `build.target: "esnext"` and a small SPA-fallback middleware plugin (rewrite html requests to `/index.html`) since there's no backend to serve routes. `vitest.config.ts` with `include: ["**/*.test.ts"]`; tests sit next to the code (`vamp.test.ts` style), no separate `tests/` tree. TypeScript with `moduleResolution: "bundler"`, `lib: ["DOM", "ESNext"]`, `types: ["vite/client"]`, `tsc --noEmit` as the typecheck step. Biome for lint/format, with `no-floating-promises` on — the vamp store contract depends on it.

PWA bits (manifest, service worker) go through `vite-plugin-pwa` rather than hand-rolled — the only real requirement is a precache manifest so the app opens offline.

Unit-testable without a browser: the `update` reducers and the scheduling/gating layer are pure functions over state, so most of the logic tests as plain data in and data out, no DOM. View tests only where a binding is worth pinning down.

### Scheduling

**Don't write the scheduler.** Use `ts-fsrs` (FSRS, current standard, open source).

One FSRS card per `(pattern, mode)` pair — this is exactly how Anki models forward/reverse, so independent tracking falls out of the standard design rather than needing custom work.

FSRS only schedules cards that exist. Introduction sits above it and is manual (see Progression): adding a pattern creates its FSRS cards, one per mode, and from then on it's an ordinary review item. No prerequisite graph, no unlock thresholds — the pattern inventory is just an ordered list with an "add" button.

### Open questions

- Which corpus, concretely, and in what source format — see Deriving the inventory
- Whether patterns should be key-fixed initially or transposed from the start
- How long the cadence/key-establishment should be, and whether a sustained drone is offered as an option
