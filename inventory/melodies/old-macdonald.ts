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

/**
 * The left hand holds a single root under the tonic bars and thickens only at
 * the first turn to IV and at the half cadence that closes the first strain.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [5, -1])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const refrainBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [6, -1]), ev(q, [6, -1]), ev(h, [5, -1])),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
    ],
    [region(h, 4), region(h, 5)],
  );
const descentBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );

export const oldMacdonald: CorpusMelody = melody(
  "old-macdonald",
  "Old MacDonald Had a Farm",
  108,
  "traditional",
  "Traditional American cumulative song, documented in early twentieth-century collections from older oral forms.",
  [
    phrase(
      [
        openingBar(),
        refrainBar(),
        descentBar(),
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
      ],
      "independent",
      "Repeated opening 1s and the 2–1 motion establish tonic before the refrain pickup.",
      "independent",
    ),
    phrase(
      [
        openingBar(),
        refrainBar(),
        descentBar(),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The repeated tonic opening returns and the complete strain closes on a full-measure 1.",
      "independent",
    ),
  ],
);
