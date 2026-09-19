import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const lightlyRow: CorpusMelody = melody(
  "lightly-row",
  "Lightly Row",
  104,
  "traditional",
  "Traditional German children's tune ‘Hänschen klein’ in its common teaching-song form.",
  [
    phrase(
      [
        bar4([5, h], [3, h]),
        bar4([3, h], [4, q], [2, q]),
        bar4([2, h], [1, q], [2, q]),
        bar4([3, q], [4, q], [5, h]),
        bar4([5, h], [3, h]),
        bar4([3, h], [4, q], [2, q]),
        bar4([2, h], [1, q], [3, q]),
        bar4([1, w]),
      ],
      "independent",
      "The second half repeats the descent and ends with 2–1–3–1 tonic confirmation.",
    ),
  ],
);
