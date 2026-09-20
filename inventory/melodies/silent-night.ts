import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  dq,
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
 * The left hand holds a single root under the tonic bars and thickens into a
 * dyad only where the harmony turns: the first move to V, and the IV-V-I
 * cadence that closes the carol.
 */
const openingBar = () =>
  polyBar3(
    [
      voiceOf("melody", ev(dq, [5]), ev(e, [6]), ev(q, [5])),
      voiceOf("harmony", ev(dh, [1, -1])),
    ],
    [region(dh, 1)],
  );
const restingBar = () =>
  polyBar3(
    [voiceOf("melody", ev(dh, [3])), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1)],
  );

export const silentNight: CorpusMelody = melody(
  "silent-night",
  "Silent Night",
  72,
  "public-domain",
  "Franz Xaver Gruber carol melody, composed in 1818.",
  [
    phrase(
      [
        openingBar(),
        restingBar(),
        openingBar(),
        restingBar(),
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5, -1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(h, [4]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
          ],
          [region(dh, 4)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(q, [1, 1]), ev(h, [7])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The later phrase states 1 in two registers and descends 6–5–3–1 to a long tonic.",
      "independent",
    ),
  ],
);
