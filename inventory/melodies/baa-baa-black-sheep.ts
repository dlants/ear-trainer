import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q } from "../melody-builders.ts";

export const baaBaaBlackSheep: CorpusMelody = melody(
  "baa-baa-black-sheep",
  "Baa, Baa, Black Sheep",
  96,
  "traditional",
  "Traditional English nursery rhyme sung to the eighteenth-century French melody also used by Twinkle.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [5, q], [5, q]),
        bar4([6, q], [6, q], [5, h]),
        bar4([4, q], [4, q], [3, q], [3, q]),
        bar4([2, q], [2, q], [1, h]),
        bar4([5, q], [5, q], [4, q], [4, q]),
        bar4([3, q], [3, q], [2, h]),
        bar4([1, q], [1, q], [5, q], [5, q]),
        bar4([2, q], [2, q], [1, h]),
      ],
      "independent",
      "The shared tune opens with repeated 1s and returns to 1 in both the first and final cadences.",
    ),
  ],
);
