import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const mulberryBush: CorpusMelody = melody(
  "mulberry-bush",
  "Here We Go Round the Mulberry Bush",
  112,
  "traditional",
  "Traditional English singing-game tune documented in the nineteenth century.",
  [
    phrase(
      [
        bar4([5, q], [5, q], [3, q], [3, q]),
        bar4([4, q], [4, q], [2, h]),
        bar4([1, q], [2, q], [3, q], [4, q]),
        bar4([5, h], [5, h]),
        bar4([5, q], [3, q], [1, q], [3, q]),
        bar4([4, q], [2, q], [7, h, -1]),
        bar4([1, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The closing strain uses 1 twice and resolves lower 7 to a sustained tonic.",
    ),
  ],
);
