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

export const mulberryBush: CorpusMelody = melody(
  "mulberry-bush",
  "Here We Go Round the Mulberry Bush",
  112,
  "traditional",
  "Traditional English singing-game tune documented in the nineteenth century.",
  [
    phrase(
      [
        // The tune outlines I on its own, so a single bass root is all the
        // harmony needs to add.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 4 and held 2 leave V open, so the harmony thickens to a
        // 5-7 dyad where the tune first turns to the dominant.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // A scalar climb through the tonic triad states I clearly; one bass
        // root under it is enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody holds 5, which belongs to both I and V, so the leading
        // tone sounds again to fix the dominant.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune arpeggiates 5-3-1-3, so the bass root alone supports it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody supplies the leading tone itself here, so the harmony
        // stands on a bare dominant root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [7, -1])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The bar turns from I to V mid-measure; the dyad marks the turn where
        // the cadence is being set up.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody arrives on a sustained 1; a root-fifth dyad gives the
        // close its weight without adding a new pitch class.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The closing strain uses 1 twice and resolves lower 7 to a sustained tonic.",
      "independent",
    ),
  ],
);
