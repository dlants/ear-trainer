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
        // The melody circles 3–1–2–3 inside I and touches its own root twice,
        // so nothing sounds underneath; the silence keeps the held root from
        // becoming the sound of "tonic" for the whole tune.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The tune holds 1 for the whole bar; the bass root simply sustains
        // under it rather than dropping out.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The refrain restates the descent. The melody spells I by itself on
        // the way down, so the root waits and enters under the 3–1, arriving
        // with the line rather than announcing the bar again.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(h), ev(h, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same turn to IV, voiced the other way round: IV has been spelled
        // out once already and takes a bare root, while the return to I — the
        // move the phrase is actually making before the cadence — gets the
        // chordal third beside its root.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1], [3, -1])),
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
        // The cadence lands on a long 1. This is the ending, so the chordal
        // third joins the root to close the mode; a fifth would only thicken
        // what the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
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
