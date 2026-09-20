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

export const goodKingWenceslas: CorpusMelody = melody(
  "good-king-wenceslas",
  "Good King Wenceslas",
  108,
  "public-domain",
  "Traditional spring carol melody ‘Tempus adest floridum’, printed in 1582.",
  [
    phrase(
      [
        // The tune states 1 outright, so the harmony only holds a single bass
        // root under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's held 5 is open between I and V, but the phrase has just
        // stated the key, so a bare root moving 1 to 5 is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The turn to IV is the first move away from home, so the bass widens
        // to root and third there while I keeps its lone root.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The melody sits on 2 and 1 over V, which says little about the
        // chord, so the leading tone sounds at the half cadence before the
        // bass settles back to a bare 5.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody outlines 5 and 3 of I on its own; one held bass root
        // supports it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // Both chords turn here and the melody's 4 and 2 are shared between
        // them, so IV takes its third and V takes the leading tone.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf(
              "harmony",
              ev(h, [4, -1], [6, -1]),
              ev(h, [5, -1], [7, -1]),
            ),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The tune itself supplies the leading tone on the last beat, so plain
        // roots are enough under the approach to the cadence.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The final 1 is doubled by a root-fifth below, giving the close its
        // weight.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s and the final lower-7-to-1 cadence strongly establish home.",
      "independent",
    ),
  ],
);
