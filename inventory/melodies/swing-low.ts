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

export const swingLow: CorpusMelody = melody(
  "swing-low",
  "Swing Low, Sweet Chariot",
  84,
  "traditional",
  "Traditional African American spiritual, documented in the nineteenth century.",
  [
    phrase(
      [
        // The melody's own 5–3–1 descent spells I, so the harmony only holds a
        // single bass root underneath.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The turn to IV is where the harmony moves, so the bass widens to a
        // root-and-third dyad there; the return to I needs only its root.
        polyBar(
          [
            voiceOf("melody", ev(h, [6]), ev(h, [5])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody circles 3–1–2–3 inside I, so a single held root is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The tune holds 1 for the whole bar; the bass root simply sustains
        // under it rather than dropping out.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The refrain restates the descent, voiced the same way: the melody
        // supplies I on its own over a lone root.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same turn to IV, with the dyad again marking where the harmony
        // moves before settling back onto I.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody's 2 and lower 7 leave V open, so the leading tone sounds
        // on the downbeat where the pull to the cadence matters most.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The cadence lands on a long 1; a root-fifth under it gives the close
        // its weight without adding a third the melody already implies.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The opening 5–3–1 descent and both long tonic cadences establish home.",
      "independent",
    ),
  ],
);
