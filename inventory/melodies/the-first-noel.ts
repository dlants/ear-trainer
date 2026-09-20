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
 * A waltz-like left hand: one held root per measure, thickened to a dyad at the
 * first turn to IV and at the dominant approaches to each tonic arrival.
 */
const heldBar = (root: 1 | 4 | 5, ...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [root, -1]))],
    [region(dh, root)],
  );
const turnToSubdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
    ],
    [region(dh, 4)],
  );
const dominantThenTonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [1, -1])),
    ],
    [region(h, 5), region(q, 1)],
  );
const tonicThenDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1])),
    ],
    [region(h, 1), region(q, 5)],
  );
const cadenceApproachBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(q, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(q, 1), region(h, 5)],
  );
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const theFirstNoel: CorpusMelody = melody(
  "the-first-noel",
  "The First Noel",
  80,
  "traditional",
  "Traditional English carol, published in the early nineteenth century.",
  [
    phrase(
      [
        heldBar(1, ev(q, [3]), ev(q, [2]), ev(q, [1])),
        dominantThenTonicBar(ev(h, [2]), ev(q, [3])),
        turnToSubdominantBar(ev(q, [4]), ev(q, [5]), ev(q, [6])),
        heldBar(5, ev(dh, [5])),
        heldBar(4, ev(q, [6]), ev(q, [5]), ev(q, [4])),
        tonicThenDominantBar(ev(h, [3]), ev(q, [2])),
        cadenceApproachBar(ev(q, [1]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(ev(dh, [1])),
      ],
      "independent",
      "The opening descends to 1 and the complete strain ends with another tonic arrival.",
      "independent",
    ),
  ],
);
