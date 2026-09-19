import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, dq, e, h, melody, phrase, q } from "../melody-builders.ts";

export const odeToJoy: CorpusMelody = melody(
  "ode-to-joy",
  "Ode to Joy",
  112,
  "public-domain",
  "Ludwig van Beethoven, Symphony No. 9 finale theme, 1824.",
  [
    phrase(
      [
        bar4([3, q], [3, q], [4, q], [5, q]),
        bar4([5, q], [4, q], [3, q], [2, q]),
        bar4([1, q], [1, q], [2, q], [3, q]),
        bar4([3, dq], [2, e], [2, h]),
      ],
      "independent",
      "The balanced stepwise line clearly reaches 1 and returns through 2–3–2.",
    ),
    phrase(
      [
        bar4([3, q], [3, q], [4, q], [5, q]),
        bar4([5, q], [4, q], [3, q], [2, q]),
        bar4([1, q], [1, q], [2, q], [3, q]),
        bar4([2, dq], [1, e], [1, h]),
      ],
      "independent",
      "Repeated 1s prepare a final 2–1 cadence with a sustained tonic.",
    ),
  ],
);
