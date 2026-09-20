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
 * A waltz-like left hand: one held root per bar, thickened to a dyad only
 * where the carol turns to V and at the closing cadence. The subdominant bar
 * carries 4 under the melody's 6 so the chord is unmistakable.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
    ],
    [region(dh, 5)],
  );

export const weWishYouAMerryChristmas: CorpusMelody = melody(
  "we-wish-you-a-merry-christmas",
  "We Wish You a Merry Christmas",
  104,
  "traditional",
  "Traditional English carol from the West Country.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(q, [1]), ev(q, [1])),
        dominantBar(ev(q, [2]), ev(q, [1]), ev(q, [7, -1])),
        polyBar3(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [6, -1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(q, [5, -1])),
          ],
          [region(h, 4), region(q, 5)],
        ),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2])),
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [7, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h, [5, -1])),
          ],
          [region(q, 1), region(h, 5)],
        ),
        tonicBar(ev(q, [3]), ev(q, [4]), ev(q, [3])),
        dominantBar(ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The pickup reaches repeated 1s, and the final lower-7 neighbor figure resolves to sustained tonic.",
      "independent",
    ),
  ],
);
