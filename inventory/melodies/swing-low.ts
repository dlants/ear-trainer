import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const swingLow: CorpusMelody = melody(
  "swing-low",
  "Swing Low, Sweet Chariot",
  84,
  "traditional",
  "Traditional African American spiritual, documented in the nineteenth century.",
  [
    phrase(
      [
        bar4([5, h], [3, q], [1, q]),
        bar4([6, h], [5, h]),
        bar4([3, q], [1, q], [2, q], [3, q]),
        bar4([1, w]),
        bar4([5, h], [3, q], [1, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The opening 5–3–1 descent and both long tonic cadences establish home.",
    ),
  ],
);
