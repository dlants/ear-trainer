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

export const redRiverValley: CorpusMelody = melody(
  "red-river-valley",
  "Red River Valley",
  84,
  "traditional",
  "Traditional North American cowboy song, documented in nineteenth-century manuscripts.",
  [
    phrase(
      [
        // The pickup climbs lower 5 to 3 through the tonic triad, so one held
        // bass root is enough to plant the key.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [3]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody falls 3-2-1, spelling I itself; the bass just walks its
        // single root underneath.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The scalar rise 2-3-4-5 is ambiguous on its own, but it arrives on 5
        // and the held bass root names the chord without crowding it.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody settles 3 to 1; root and fifth underneath make this read
        // as a cadence rather than a passing tonic.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
        // The second strain turns to IV, and the melody's 5 and 6 leave the
        // chord open, so the bass takes root and third before thinning to the
        // root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [4, -1])),
          ],
          [region(w, 4)],
        ),
        // Melody 3 states I on its own, then 2 leaves V open, so the leading
        // tone joins the bass where the harmony turns.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune's own lower 7 gives the dominant its leading tone, so a bare
        // 5 in the bass is all the support the bar needs.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The whole-note 1 closes the strain; root and fifth beneath it make
        // the arrival final.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The lower-5 pickup reaches 1, the first cadence returns there, and the full strain ends on tonic.",
      "independent",
    ),
  ],
);
