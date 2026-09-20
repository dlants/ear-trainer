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
 * A waltz-like left hand: a single held root under the tonic bars, thickened to
 * a 5–7 dyad where the tune turns to V, so the I–V–I frame is audible without
 * blocking out full triads.
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
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
    ],
    [region(dh, 5)],
  );
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const downInTheValley: CorpusMelody = melody(
  "down-in-the-valley",
  "Down in the Valley",
  76,
  "traditional",
  "Traditional American folk song and Appalachian standard.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(h, [1])),
        tonicBar(ev(h, [3]), ev(q, [2])),
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3])),
        dominantBar(ev(dh, [2])),
        tonicBar(ev(q, [5, -1]), ev(h, [1])),
        tonicBar(ev(q, [3]), ev(q, [5]), ev(q, [3])),
        dominantBar(ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
        finalBar(ev(dh, [1])),
      ],
      "independent",
      "Both lower-5 pickups resolve to 1 and the closing neighbor figure settles on a long tonic.",
      "independent",
    ),
  ],
);
