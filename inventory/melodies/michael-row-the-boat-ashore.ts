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

export const michaelRowTheBoatAshore: CorpusMelody = melody(
  "michael-row-the-boat-ashore",
  "Michael, Row the Boat Ashore",
  88,
  "traditional",
  "Traditional African American spiritual first documented in the nineteenth-century Sea Islands.",
  [
    phrase(
      [
        // The tune climbs the tonic triad 1–3–5, so it states I itself and a
        // single held bass root is all the support it needs.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the chordal third of IV, but this is the first turn
        // away from home, so root and third together mark the change before the
        // bass steps back to 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody descends 5–3–2–1 over I; with the tonic already sung, one
        // root underneath is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone sounds at the
        // cadence and the resolution takes a root–fifth dyad under the sung 1.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [5, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The second half opens as the first did: the arpeggiated 1–3–5 states
        // I, so the harmony holds the bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The same turn to IV and back, voiced the same way, so the thicker
        // sound reads as the harmonic move rather than as a pattern.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody circles 2 and 3 and falls to the lower 7, so the harmony
        // sounds the dominant's leading tone first and then holds its root to
        // keep the pull toward the close.
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
        // The tune arrives on a long 1; the root–fifth dyad beneath it settles
        // the final tonic without adding a third the melody does not need.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Both halves start on 1 and descend to it, with a final lower-leading-tone resolution.",
      "independent",
    ),
  ],
);
