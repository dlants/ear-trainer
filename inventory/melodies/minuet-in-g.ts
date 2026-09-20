import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

/**
 * A left hand that mostly holds a single root per measure, thickening to a
 * dyad at the first turn to IV and through the closing V–I cadence.
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
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [5, -1]))],
    [region(dh, 5)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
    ],
    [region(dh, 5)],
  );
const closingBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const minuetInG: CorpusMelody = melody(
  "minuet-in-g",
  "Minuet in G",
  100,
  "public-domain",
  "Christian Petzold, Minuet in G major from the 1725 Notebook for Anna Magdalena Bach.",
  [
    phrase(
      [
        tonicBar(ev(q, [5]), ev(q, [1, 1]), ev(q, [2, 1])),
        tonicBar(ev(q, [3, 1]), ev(q, [4, 1]), ev(q, [5, 1])),
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3])),
        subdominantBar(ev(q, [4]), ev(q, [5]), ev(q, [6])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(q, [1])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [4])),
        cadenceBar(ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        closingBar(ev(dh, [1])),
      ],
      "independent",
      "The closing half descends through the tonic triad and resolves lower 7 to a sustained 1.",
      "independent",
    ),
  ],
);
