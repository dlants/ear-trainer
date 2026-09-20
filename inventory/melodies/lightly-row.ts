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
 * A left hand that mostly holds a single root: one bass note while the harmony
 * sits still, widened to a dyad only where the tune turns to V and at the
 * closing cadence.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [5]), ev(h, [3])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const turnBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [3]), ev(q, [4]), ev(q, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const dominantBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [2]), ev(q, [1]), ev(q, [2])),
      voiceOf("harmony", ev(w, [5, -1])),
    ],
    [region(w, 5)],
  );
const riseBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const cadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [2]), ev(q, [1]), ev(q, [3])),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const lightlyRow: CorpusMelody = melody(
  "lightly-row",
  "Lightly Row",
  104,
  "traditional",
  "Traditional German children's tune ‘Hänschen klein’ in its common teaching-song form.",
  [
    phrase(
      [
        openingBar(),
        turnBar(),
        dominantBar(),
        riseBar(),
        openingBar(),
        turnBar(),
        cadenceBar(),
        finalBar(),
      ],
      "independent",
      "The second half repeats the descent and ends with 2–1–3–1 tonic confirmation.",
      "independent",
    ),
  ],
);
