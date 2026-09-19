import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const michaelRowTheBoatAshore: CorpusMelody = melody(
  "michael-row-the-boat-ashore",
  "Michael, Row the Boat Ashore",
  88,
  "traditional",
  "Traditional African American spiritual first documented in the nineteenth-century Sea Islands.",
  [
    phrase(
      [
        bar4([1, q], [3, q], [5, h]),
        bar4([6, q], [5, q], [3, h]),
        bar4([5, q], [3, q], [2, q], [1, q]),
        bar4([2, h], [1, h]),
        bar4([1, q], [3, q], [5, h]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "Both halves start on 1 and descend to it, with a final lower-leading-tone resolution.",
    ),
  ],
);
