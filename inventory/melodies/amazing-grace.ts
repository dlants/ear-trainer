import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  e,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

/**
 * The left hand is a single sustained root under each bar of held tonic, and
 * thickens into a dyad only at the turn to IV and at the two V–I cadences,
 * filling out a full tonic triad at the first V–I arrival.
 */
export const amazingGrace: CorpusMelody = melody(
  "amazing-grace",
  "Amazing Grace",
  84,
  "public-domain",
  "Words by John Newton with the early nineteenth-century American tune New Britain.",
  [
    phrase(
      [
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -2])),
          ],
          [region(dh, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(e, [3]), ev(e, [1]), ev(h, [3])),
            voiceOf("harmony", ev(dh, [1, -2])),
          ],
          [region(dh, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [6, -1])),
            voiceOf("harmony", ev(q, [1, -2]), ev(h, [4, -2], [6, -2])),
          ],
          [region(q, 1), region(h, 4)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(q, [5, -2]), ev(h, [1, -2], [3, -2], [5, -2])),
          ],
          [region(q, 5), region(h, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(e, [3]), ev(e, [1]), ev(h, [3])),
            voiceOf("harmony", ev(dh, [1, -2])),
          ],
          [region(dh, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -2], [7, -2]), ev(q, [1, -2])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -2], [7, -2]), ev(q, [1, -2])),
          ],
          [region(h, 5), region(q, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -2], [5, -2])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The lower-5 pickup repeatedly resolves to 1, and the strain closes on a sustained tonic.",
      "independent",
    ),
  ],
);
