import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const auraLee: CorpusMelody = melody(
  "aura-lee",
  "Aura Lee",
  88,
  "public-domain",
  "George R. Poulton melody with W. W. Fosdick lyrics, published in 1861.",
  [
    phrase(
      [
        bar4([1, q], [3, q], [5, h]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [4, q], [2, q]),
        bar4([1, w]),
        bar4([3, q], [5, q], [1, h, 1]),
        bar4([7, q], [6, q], [5, h]),
        bar4([3, q], [2, q], [7, q, -1], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "The melody begins on 1, cadences there at midpoint, and closes again on a sustained tonic.",
    ),
  ],
);
