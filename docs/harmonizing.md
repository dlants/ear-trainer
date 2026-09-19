# Harmonizing a corpus melody

Rules for adding harmony to a melody in `inventory/melodies/`. Build bars with `polyBar`, giving the tune a `melody` voice and the accompaniment a `harmony` voice; there is deliberately no helper that stamps chords under a melody.

- Annotate every measure you can with its chord regions (`region(...)`), even where the sounded accompaniment is thin. The chord track is what the chord-identification exercises read, so `I / IV / I` style annotations should be complete.
- Keep the sounded accompaniment sparse and tasteful, the way a pianist would support a tune. Do not block out every chord as a full triad. A single bass note, or a two-note dyad, is usually enough to establish the harmony.
- Put the chord root in the lowest slot of each harmony event. Avoid inversions.
- Spend the extra note where it clarifies a transition: thicken at the first move away from tonic and at cadences, and stay thin where the harmony is just holding. If the melody sits on a chord tone that is ambiguous on its own (a 6 over IV, say), put the root (4) underneath it so the chord is unmistakable.
- Keep the accompaniment in a consistent register below the melody, close enough that the bass line moves by small intervals rather than leaping octaves.

`inventory/melodies/twinkle.ts` is the reference example.
