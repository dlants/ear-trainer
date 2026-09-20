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
 * A waltz accompaniment in the left hand: a single root on the downbeat while
 * the harmony holds, thickened to a dyad where the tune turns to V and at the
 * closing cadence. The bass sits just under the melody's low 5 so it moves by
 * small intervals.
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
      voiceOf("harmony", ev(dh, [5, -2], [7, -2])),
    ],
    [region(dh, 5)],
  );
const holdingDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [5, -2]))],
    [region(dh, 5)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -2], [7, -2]), ev(q, [1, -1])),
    ],
    [region(h, 5), region(q, 1)],
  );
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const clementine: CorpusMelody = melody(
  "clementine",
  "Oh My Darling, Clementine",
  88,
  "public-domain",
  "Percy Montrose song, published in 1884, drawing on earlier American folk material.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(q, [5, -1]), ev(q, [5, -1])),
        tonicBar(ev(h, [1]), ev(q, [3])),
        tonicBar(ev(q, [3]), ev(q, [3]), ev(q, [1])),
        dominantBar(ev(dh, [5, -1])),
        holdingDominantBar(ev(q, [5, -1]), ev(q, [5, -1]), ev(q, [5, -1])),
        tonicBar(ev(h, [1]), ev(q, [3])),
        cadenceBar(ev(q, [5]), ev(q, [5]), ev(q, [3])),
        finalBar(ev(dh, [1])),
      ],
      "independent",
      "Repeated lower 5s resolve to 1 in both halves, and the final 5–3–1 outlines the tonic triad.",
      "independent",
    ),
  ],
);
