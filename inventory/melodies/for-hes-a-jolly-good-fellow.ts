import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const forHesAJollyGoodFellow: CorpusMelody = melody(
  "for-hes-a-jolly-good-fellow",
  "For He's a Jolly Good Fellow",
  108,
  "traditional",
  "Traditional celebratory song using the eighteenth-century French tune ‘Malbrouck s'en va-t-en guerre’.",
  [
    phrase(
      [
        bar4([5, q, -1], [1, q], [1, q], [2, q]),
        bar4([1, q], [7, q, -1], [1, h]),
        bar4([2, q], [3, q], [3, q], [4, q]),
        bar4([3, h], [2, h]),
        bar4([5, q], [5, q], [3, q], [1, q]),
        bar4([2, q], [3, q], [1, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The opening repeatedly returns to 1 and the final lower-7-to-1 motion closes decisively.",
    ),
  ],
);
