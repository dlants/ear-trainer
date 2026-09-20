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
 * A bell-like left hand: a single root under the bars that simply hold the
 * tonic, widened to a dyad at the first turn to IV and at each V–I cadence.
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
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
    ],
    [region(h, 1), region(h, 4)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const approachBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );

export const orangesAndLemons: CorpusMelody = melody(
  "oranges-and-lemons",
  "Oranges and Lemons",
  104,
  "traditional",
  "Traditional English singing-game tune associated with London church bells.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [1])),
        subdominantBar(ev(q, [2]), ev(q, [3]), ev(h, [4])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
        cadenceBar(ev(h, [2]), ev(h, [1])),
        tonicBar(ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
        dominantBar(ev(q, [4]), ev(q, [2]), ev(h, [2])),
        approachBar(ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The opening and midpoint use 1, while the final lower-7-to-1 cadence confirms the tonic.",
      "independent",
    ),
  ],
);
