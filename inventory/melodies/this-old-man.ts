import type { CorpusMelody } from "../../music/melody.ts";
import {
  ev,
  h,
  melody,
  phrase,
  polyBar,
  q,
  region,
  voiceOf,
  w,
} from "../melody-builders.ts";

export const thisOldMan: CorpusMelody = melody(
  "this-old-man",
  "This Old Man",
  112,
  "traditional",
  "Traditional English-language nursery and counting song, collected in the nineteenth century.",
  [
    phrase(
      [
        // The melody's 5–3–5 spells the tonic triad outright, so the harmony
        // only has to name the root. The tune stays at 3 and above, so that
        // root sounds in its own octave rather than down in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The bar repeats note for note and the harmony has not moved, so the
        // accompaniment steps aside instead of restating the root: the melody
        // is still arpeggiating I on its own.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The descent 6–5–4–3 is the first place the harmony turns, and 6 over
        // IV is the chord's sixth rather than its root, so IV gets root and
        // third; the return to I is left to the melody's own 3 over a plain
        // root back up in its octave.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The strain pauses on 4, the root of IV, and the previous bar has
        // already spelled that chord with its third, so bare roots carry both
        // halves and the bass moves by step rather than reaching.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [4])),
            voiceOf("harmony", ev(h, [1]), ev(h, [4, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
      ],
      "context-required",
      "The opening strain avoids 1 and pauses on 4, so it does not independently establish tonic.",
      "context-required",
    ),
    phrase(
      [
        // Repeated 1s state the tonic outright; the melody occupying its own 1
        // pushes the bass into the octave below, where a single held root is
        // plenty under a line that is already climbing 1–2–3.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // IV comes back, but the melody now sings its root on the downbeat and
        // the first strain has already sounded the chord's third, so a bare 4
        // is enough; the tune's held 3 supplies I's third over a plain root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody sings the leading tone itself on the way to the cadence,
        // so doubling it would tell the listener nothing new: the dominant
        // takes a bare root, and the bass steps 1–5 below the low line.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The long 1 ends the tune rather than passing through, so the chordal
        // third joins the root to close it; a fifth would only thicken what
        // the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated 1s and the final 2–lower-7–2–1 figure make the tonic arrival explicit.",
      "independent",
    ),
  ],
);
