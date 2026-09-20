# Harmonizing a corpus melody

Rules for adding harmony to a melody in `inventory/melodies/`. Build bars with `polyBar`, giving the tune a `melody` voice and the accompaniment a `harmony` voice; there is deliberately no helper that stamps chords under a melody.

Write every bar out inline, in order, inside the `phrase()` it belongs to. Do not factor repeated bars into named helpers: the shape of the tune should be readable top to bottom, and any bar should be revoiceable on its own without changing another. Put the reasoning for a voicing in a comment on the bar it applies to, saying what the melody already gives the listener and what the harmony therefore supplies.

Repeats do not have to be identical. When a phrase or a bar comes back, voicing it a little differently is usually better than duplicating it, and it keeps the accompaniment from teaching a pattern that is an artifact of the authoring rather than of the music.

- Declare the phrase's `chordIdentification` (the 4th argument to `phrase()`); a phrase that states harmony must have one. Use `"independent"` only when the sounded accompaniment, heard with the melody, pins the chords down on its own; otherwise `"context-required"`. Phrases that are not independent still display their chord track as reference instead of asking for an answer.
- Annotate every measure you can with its chord regions (`region(...)`), even where the sounded accompaniment is thin. The chord track is what the chord-identification exercises read, so `I / IV / I` style annotations should be complete.

## Voicing the accompaniment

There is no formula here. Read each phrase, decide what the melody already tells the listener, and provide support where it's missing. These are our goals:

**Provide context for a novice to hear the harmony.** Ask, for each phrase, whether someone who is in the process of learning could reasonably hear the harmony. The evidence does not have to be immediate or obvious - don't use a triad on every beat. It should be available from the context of the phrase. If the melody established a key, often a chordal root is enough - the ear can intuit the rest (we don't always have to play the chordal third). If we voiced a similar harmony a different way previously, that is context. A leading tone is context, etc.

**Avoid going low.** Low notes are hard to hear and tend to get muddy, which overwhelms a novices ear and simply sounds bad. Voice as high as you can while still sitting under the melody, and drop to the octave below only when the melody is low enough to force it. One well-chosen note usually beats two. The root belongs in the lowest slot; avoid inversions.

**Avoid artificial constraints.** Avoid degenerate cases like always having the tonic be a lone note, or thick only landing on V. The learner will rely on that instead of the quality of what they are hearing. Make sure you attend to ecological validity.

Useful instincts, not rules: spend the extra note where the harmony turns rather than where it is holding; when you do add a second note, the third says far more than the fifth; a root-fifth dyad is a drone-like effect rather than a cheap third; and a bass that moves by small intervals sounds better than one that leaps octaves chasing the melody.

## The house style

Every melody file carries inline comments recording its voicing decisions, bar by bar: what the melody already gives the listener and what the harmony therefore supplies. Those comments are the corpus's record of how we voice things, so before harmonizing a new tune, search them for precedent — `./pkb search "voicing a cadence under a descending melody"` and similar queries turn up the bars that already solved the problem. Match what the corpus does; deviate only when the tune calls for it, and say why in the comment.

`inventory/melodies/twinkle.ts` is the reference example.
