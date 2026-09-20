import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
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
 * A rocking 3/4 support: one bass root per bar where the harmony just holds,
 * thickened to a dyad at the turn to IV, at the dominant, and at the cadence.
 */
const risingBar = () =>
  polyBar3(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [6])),
      voiceOf("harmony", ev(h, [1, -1]), ev(q, [4, -1], [6, -1])),
    ],
    [region(h, 1), region(q, 4)],
  );
const holdingBar = () =>
  polyBar3(
    [
      voiceOf("melody", ev(h, [5]), ev(q, [3])),
      voiceOf("harmony", ev(dh, [1, -1])),
    ],
    [region(dh, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
    ],
    [region(dh, 5)],
  );
const cadenceBar = () =>
  polyBar3(
    [
      voiceOf("melody", ev(dh, [1])),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const rockAByeBaby: CorpusMelody = melody(
  "rock-a-bye-baby",
  "Rock-a-bye Baby",
  80,
  "traditional",
  "Traditional English-language lullaby tune, published in the nineteenth century.",
  [
    phrase(
      [
        risingBar(),
        holdingBar(),
        dominantBar(ev(q, [4]), ev(q, [2]), ev(q, [7, -1])),
        cadenceBar(),
        risingBar(),
        holdingBar(),
        dominantBar(ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
        cadenceBar(),
      ],
      "independent",
      "Both halves begin on 1 and cadence through lower 7 to a sustained 1.",
      "independent",
    ),
  ],
);
