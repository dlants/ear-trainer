import type { CorpusMelody } from "../../music/melody.ts";
import {
  dq,
  e,
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
 * A plain I–V reading of the theme: the left hand holds the tonic under the
 * opening ascent and thickens into a dyad only at the two cadence bars.
 */
const risingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const fallingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(q, [3]), ev(q, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const returnBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const halfCadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(dq, [3]), ev(e, [2]), ev(h, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const fullCadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(dq, [2]), ev(e, [1]), ev(h, [1])),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1], [5, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );

export const odeToJoy: CorpusMelody = melody(
  "ode-to-joy",
  "Ode to Joy",
  112,
  "public-domain",
  "Ludwig van Beethoven, Symphony No. 9 finale theme, 1824.",
  [
    phrase(
      [risingBar(), fallingBar(), returnBar(), halfCadenceBar()],
      "independent",
      "The balanced stepwise line clearly reaches 1 and returns through 2–3–2.",
      "independent",
    ),
    phrase(
      [risingBar(), fallingBar(), returnBar(), fullCadenceBar()],
      "independent",
      "Repeated 1s prepare a final 2–1 cadence with a sustained tonic.",
      "independent",
    ),
  ],
);
