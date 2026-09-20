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
 * A waltz accompaniment held to one sustained bass note per bar, thickened to a
 * dyad only where the harmony turns: the move to IV and the V bars that lead
 * back home.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1)],
  );
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
    ],
    [region(dh, 4)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
    ],
    [region(dh, 5)],
  );
const dominantHoldBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [5, -1]))],
    [region(dh, 5)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const homeOnTheRange: CorpusMelody = melody(
  "home-on-the-range",
  "Home on the Range",
  84,
  "public-domain",
  "Daniel E. Kelley tune with Brewster Higley lyrics, published in the late nineteenth century.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3])),
        tonicBar(ev(h, [5]), ev(q, [3])),
        dominantBar(ev(q, [2]), ev(q, [1]), ev(q, [6, -1])),
        dominantHoldBar(ev(dh, [5, -1])),
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3])),
        subdominantBar(ev(q, [5]), ev(q, [6]), ev(q, [5])),
        dominantBar(ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        cadenceBar(ev(dh, [1])),
      ],
      "independent",
      "The range opens from 1 and the second sentence closes lower 7 to a sustained tonic.",
      "independent",
    ),
  ],
);
