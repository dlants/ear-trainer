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
 * A waltz-style support: a single bass root while the harmony holds, thickened
 * to a dyad where the tune turns (the V of each half and the reach to IV) and
 * at the closing cadence.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1)],
  );
const tonicToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(q, 5)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
    ],
    [region(dh, 5)],
  );
const tonicToSubdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(q, [4, -1], [6, -1])),
    ],
    [region(h, 1), region(q, 4)],
  );
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const awayInAManger: CorpusMelody = melody(
  "away-in-a-manger",
  "Away in a Manger",
  80,
  "public-domain",
  "Nineteenth-century American carol melody commonly called Mueller.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [4])),
        tonicToDominantBar(ev(h, [3]), ev(q, [2])),
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [5])),
        dominantBar(ev(dh, [4])),
        tonicToSubdominantBar(ev(q, [3]), ev(q, [3]), ev(q, [6])),
        tonicToDominantBar(ev(h, [5]), ev(q, [4])),
        dominantBar(ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(ev(dh, [1])),
      ],
      "independent",
      "Repeated opening 1s and the final 3–2–lower-7–1 descent provide clear tonic evidence.",
      "independent",
    ),
  ],
);
