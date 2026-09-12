# Functional Ear Trainer — Design Notes

## Motivation

The goal is to hear a piece of music, know what I'm hearing, and play it back. Concretely: pick out a melody without hunting for it on an instrument.

Current state: I've done a lot of static scale-degree training. Given a major cadence and then a single note, I can identify the degree reliably. I have a well-internalized feel for how each degree sounds against a tonic.

Where it breaks down: melodies. Trying to work out *Happy Birthday*, I could feel direction and tension, but couldn't assign syllables without trial-and-error on the keyboard. The degrees sound different in motion than they do in isolation — a 4 approached from 2 doesn't feel like a 4 held against a drone, and the step down into 3 changes both notes' character.

Diagnostic detail worth recording: my trial-and-error answer was 1-1-2-1-4-3. The intervals were right; the tonic was wrong by a fifth (it's 5-5-6-5-1-7). That's the characteristic failure of instrument-hunting — it gives you relative motion and never tells you where home is.

## Diagnosis

The context-dependence isn't noise to be filtered out. It's the actual signal experienced transcribers use. The problem is that I trained one cue (degree against a static tonic) and am trying to apply it to a task that runs on a different representation: functional cells in motion.

The naive framing — "now I have to recognize 7×6 = 42 two-note combinations, then hundreds for three notes" — is wrong, because the space is nowhere near uniform. Tonal melody is dominated by stepwise motion and a small set of tendency gestures (7→1, 4→3, 6→5, 2→1, 2→3). Those are exactly the things I already report hearing as "tension, then it settles." The compression is real and already partly present; what's missing is labels attached to it.

So: **the unit of training is the named functional cell, not the note and not the interval.**

A second factorization exists at the harmonic level — most melody notes are chord tones, so knowing the implied chord cuts candidates from ~7 to ~3. Worth pursuing eventually, but it's a layer on top, not the starting point. (Bass tracking, often recommended as the entry point here, is not my bottleneck — I played bass; extracting and singing back a bass note has never been the problem. The problem is mapping a pitch to a function.)

## Design

### Cards

Each card is a **named functional cell**: a short scale-degree sequence, e.g. `1-4-3`, `5-6-5`, `3-2-1`, `7-1`, `1-2-3`.

Two directions, tracked as **independent cards** with independent scheduling state (same as Anki's forward/reverse model):

- **Recognition** — hear tonic/cadence, hear the cell, name the degrees. Objectively graded.
- **Production** — see the notation, hear the tonic, sing it internally, reveal and compare. Self-graded.

They fail differently and shouldn't be averaged: recognition errors cluster by acoustic similarity (5-6-5 vs 1-2-1), production errors cluster by interference from adjacent cards. A card can be solid one way and shaky the other.

### Rhythm is nuisance variation, not a card dimension

A pitch cell should fire regardless of how it's rhythmed. Splitting `1-2-1` into rhythm variants would bind pitch to rhythm and make recognition brittle. Instead, **randomize rhythm within a card** — varying the irrelevant dimension is what produces invariance. Same for timbre and octave.

(Rhythmic cells are a legitimate separate deck — dotted-eighth-sixteenth, triplets, syncopated anticipation — drilled on a single pitch. Out of scope for v1. Note that rhythm isn't purely irrelevant at the functional level: downbeat notes are far likelier to be chord tones. That's a prior to exploit later, not a reason to expand the deck.)

### Progression

Cards introduced in **frequency order**, one new card at a time, mixed with all previously learned cards in random order.

Rough ordering:
1. Two-note cells within 1-3-5
2. Add 2 (stepwise motion into the triad)
3. Add 4 and 7 last — these carry the strongest tendency cues, which I already partly hear
4. Three-note cells
5. Longer cells / common phrase shapes

Gated addition: a card unlocks when its prerequisites reach some stability threshold. Branching rather than strictly linear, since several sub-tracks are independent.

Expect collisions (5-6-5 vs 1-2-1 will feel similar before they don't). **Don't avoid the collisions** — that's where discrimination actually gets built. Decoy selection in any future discrimination mode should draw from confusable neighbors in the same deck for exactly this reason.

### Grading

Recognition: objective.

Production: **self-report, with an explicit standard** — mark correct only if I was certain *before* the reveal that I sang it accurately. Not "that sounded about right in retrospect."

The risk being managed is hindsight bias: hearing the answer makes a vague internal image feel like it matched. It's strongest exactly when the image was weakest, which is the case most worth catching. For a single disciplined user, holding the standard is sufficient.

Cheap mitigation if it proves necessary: a confidence tap before reveal (committed / unsure), so "unsure but turned out right" stops counting silently as a success. Two taps instead of one.

**Rejected for v1:**
- *Mic-based pitch detection.* Doesn't work for the actual use case — people practice in transit and will subvocalize. Can't measure what wasn't sung.
- *Tap-it-on-a-keyboard-before-reveal.* Doesn't test anything: the notation is the prompt, so tapping it back tests transposition, not audiation.

**Possible later mode — discrimination:** show the notation, play either the correct cell or a near-miss decoy (5-6-4, 5-7-5 — right contour, wrong degree), user answers match / no-match. Objective, silent, one tap. You can only detect a near-miss if your internal image was specific, so a vague image passes both and shows up in the stats. Decoy distance becomes a difficulty knob. Good option for users who don't trust their own discipline.

### Diagnostic to keep

Log recognition and production accuracy separately over time. Recognition is objectively graded. If production tracks it, self-grading is calibrated. If production sits consistently higher, that's inflation, visible without building anything to detect it.

## Implementation

### Platform

Progressive web app. Browser-based, installable, works on iOS without touching the App Store or Android tooling.

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

### Scheduling

**Don't write the scheduler.** Use `ts-fsrs` (FSRS, current standard, open source).

Two FSRS cards per cell, one per direction — this is exactly how Anki models forward/reverse, so independent tracking falls out of the standard design rather than needing custom work.

The gating layer sits *above* FSRS: FSRS handles when to show a known card; a separate prerequisite graph handles when a new card becomes eligible for introduction. Unlock condition is a stability threshold on parent cards.

### Open questions

- Cell inventory and exact frequency ordering — needs a pass over actual repertoire (nursery songs, folk melodies) rather than intuition
- Whether cells should be key-fixed initially or transposed from the start
- How long the cadence/key-establishment should be, and whether a sustained drone is offered as an option
- Session length and daily new-card cap
