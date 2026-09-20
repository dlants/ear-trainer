import type { CorpusMelody } from "../../music/melody.ts";
import {
  ev,
  h,
  melody,
  phrase,
  polyBar,
  q,
  region,
  voiceOf,
  w,
} from "../melody-builders.ts";

/**
 * A left hand that mostly holds a single root under the long tonic stretches,
 * and opens into a dyad only where the tune turns to the dominant and at the
 * half cadence and the final cadence.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );
const halfCadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const forHesAJollyGoodFellow: CorpusMelody = melody(
  "for-hes-a-jolly-good-fellow",
  "For He's a Jolly Good Fellow",
  108,
  "traditional",
  "Traditional celebratory song using the eighteenth-century French tune ‘Malbrouck s'en va-t-en guerre’.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(q, [1]), ev(q, [1]), ev(q, [2])),
        tonicBar(ev(q, [1]), ev(q, [7, -1]), ev(h, [1])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [3]), ev(q, [4])),
        halfCadenceBar(ev(h, [3]), ev(h, [2])),
        tonicBar(ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [1])),
        tonicBar(ev(q, [2]), ev(q, [3]), ev(h, [1])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(ev(w, [1])),
      ],
      "independent",
      "The opening repeatedly returns to 1 and the final lower-7-to-1 motion closes decisively.",
      "independent",
    ),
  ],
);
