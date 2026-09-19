import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const orangesAndLemons: CorpusMelody = melody(
  "oranges-and-lemons",
  "Oranges and Lemons",
  104,
  "traditional",
  "Traditional English singing-game tune associated with London church bells.",
  [
    phrase(
      [
        bar4([1, q], [2, q], [3, q], [1, q]),
        bar4([2, q], [3, q], [4, h]),
        bar4([5, q], [3, q], [1, q], [3, q]),
        bar4([2, h], [1, h]),
        bar4([5, q], [5, q], [3, q], [3, q]),
        bar4([4, q], [2, q], [2, h]),
        bar4([1, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The opening and midpoint use 1, while the final lower-7-to-1 cadence confirms the tonic.",
    ),
  ],
);
