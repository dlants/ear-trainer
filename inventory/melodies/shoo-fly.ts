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

export const shooFly: CorpusMelody = melody(
  "shoo-fly",
  "Shoo, Fly, Don't Bother Me",
  112,
  "public-domain",
  "American popular and folk song first published in the 1860s.",
  [
    phrase(
      [
        // The melody arpeggiates 1-3-5, so the harmony only walks a single
        // held root beneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The 6 is a neighbor rather than a change of chord, so the bass holds
        // its single root through the bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The descent passes from I into the approach to the half cadence, so
        // the bass thickens to root and leading tone where the harmony turns.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune itself lands on lower 5, so a bare held root is enough for
        // the half cadence.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [5, -1])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The repeat takes the same single root under the tonic arpeggio.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The neighbor bar again needs no more than its held root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [6]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same descent, but ending on lower 7: the dyad of root and
        // leading tone doubles the tune's pull toward the close.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [4]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds a long 1; root and fifth underneath make the final
        // tonic sound settled rather than thin.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The melody starts on 1, descends through 1, and ends with lower 7 resolving to tonic.",
      "independent",
    ),
  ],
);
