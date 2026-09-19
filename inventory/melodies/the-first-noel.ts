import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const theFirstNoel: CorpusMelody = melody(
  "the-first-noel",
  "The First Noel",
  80,
  "traditional",
  "Traditional English carol, published in the early nineteenth century.",
  [
    phrase(
      [
        bar3([3, q], [2, q], [1, q]),
        bar3([2, h], [3, q]),
        bar3([4, q], [5, q], [6, q]),
        bar3([5, dh]),
        bar3([6, q], [5, q], [4, q]),
        bar3([3, h], [2, q]),
        bar3([1, q], [2, q], [7, q, -1]),
        bar3([1, dh]),
      ],
      "independent",
      "The opening descends to 1 and the complete strain ends with another tonic arrival.",
    ),
  ],
);
