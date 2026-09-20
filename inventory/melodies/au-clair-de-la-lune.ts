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

export const auClairDeLaLune: CorpusMelody = melody(
  "au-clair-de-la-lune",
  "Au clair de la lune",
  100,
  "traditional",
  "Traditional French song, printed in the eighteenth century.",
  [
    phrase(
      [
        // The tune hammers 1 itself, so the harmony only needs to hold the bass
        // root under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 3 states I on its own; the turn to 2 leaves V open, so
        // the leading tone joins the root to mark the turn.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The answering figure again leaves the second half on 2, so the
        // dominant takes its leading tone while I keeps a bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds a long 1; the harmony supports it with a root-fifth
        // dyad so the cadence sounds settled rather than thin.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
        // A whole bar of 2 tells the listener nothing about the chord, so the
        // harmony sounds the leading tone before settling on the bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody rests on 5, the fifth of I; a single held bass root is
        // enough to place that 5 inside the tonic.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The answering figure returns; same reading, the leading tone carries
        // the second half back toward the close.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The final long 1 gets the same root-fifth support as the midpoint
        // cadence, closing the song with a full tonic sound.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s and two long tonic cadences make home unmistakable.",
      "independent",
    ),
  ],
);
