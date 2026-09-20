import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
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

/**
 * The left hand is a mostly single-note bass that thickens only at the turns:
 * the half cadence on V, the first move to IV, and the closing V–I.
 */
const tonicRiseBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );

export const yankeeDoodle: CorpusMelody = melody(
  "yankee-doodle",
  "Yankee Doodle",
  116,
  "traditional",
  "Traditional Anglo-American tune widely printed during the eighteenth century.",
  [
    phrase(
      [
        tonicRiseBar(),
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        tonicRiseBar(),
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [7, -1]), ev(q, [1])),
            voiceOf(
              "harmony",
              ev(h, [1, -1]),
              ev(q, [5, -1], [7, -1]),
              ev(q, [1, -1], [5, -1]),
            ),
          ],
          [region(h, 1), region(q, 5), region(q, 1)],
        ),
      ],
      "independent",
      "Both sentences begin on 1 and the second resolves lower 7 back to 1.",
      "independent",
    ),
    phrase(
      [
        tonicRiseBar(),
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(q, [4, -1], [6, -1]), ev(dh, [1, -1])),
          ],
          [region(q, 4), region(dh, 1)],
        ),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [7, -1]),
              ev(q, [5, -1]),
              ev(q, [6, -1]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The descending line reaches 1 and the lower leading-tone ascent closes on a long tonic.",
      "independent",
    ),
  ],
);
