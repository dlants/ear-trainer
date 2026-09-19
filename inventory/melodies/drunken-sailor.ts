import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, e, h, melody, phrase, q, w } from "../melody-builders.ts";

export const drunkenSailor: CorpusMelody = melody(
  "drunken-sailor",
  "What Shall We Do with a Drunken Sailor?",
  112,
  "traditional",
  "Traditional sea shanty documented in the nineteenth century.",
  [
    phrase(
      [
        bar4([5, q], [5, q], [5, e], [6, e], [5, q]),
        bar4([4, q], [2, q], [2, h]),
        bar4([5, q], [5, q], [5, e], [6, e], [5, q]),
        bar4([4, q], [2, q], [2, h]),
        bar4([1, q], [1, q], [1, e], [2, e], [3, q]),
        bar4([2, q], [1, q], [7, h, -1]),
        bar4([6, q, -1], [5, q, -1], [7, q, -1], [2, q]),
        bar4([1, w]),
      ],
      "context-required",
      "The modal minor-color strain emphasizes 5 and lower 7; its final 1 is clear only with the full context.",
    ),
  ],
  "minor-cadence",
);
