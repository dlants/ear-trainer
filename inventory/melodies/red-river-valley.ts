import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const redRiverValley: CorpusMelody = melody(
  "red-river-valley",
  "Red River Valley",
  84,
  "traditional",
  "Traditional North American cowboy song, documented in nineteenth-century manuscripts.",
  [
    phrase(
      [
        bar4([5, q, -1], [1, q], [2, q], [3, q]),
        bar4([3, h], [2, q], [1, q]),
        bar4([2, q], [3, q], [4, q], [5, q]),
        bar4([3, h], [1, h]),
        bar4([5, q], [5, q], [6, q], [5, q]),
        bar4([3, h], [2, h]),
        bar4([1, q], [2, q], [7, q, -1], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "The lower-5 pickup reaches 1, the first cadence returns there, and the full strain ends on tonic.",
    ),
  ],
);
