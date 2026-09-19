import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const auClairDeLaLune: CorpusMelody = melody(
  "au-clair-de-la-lune",
  "Au clair de la lune",
  100,
  "traditional",
  "Traditional French song, printed in the eighteenth century.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [1, q], [2, q]),
        bar4([3, h], [2, h]),
        bar4([1, q], [3, q], [2, q], [2, q]),
        bar4([1, w]),
        bar4([2, q], [2, q], [2, q], [2, q]),
        bar4([5, h], [5, h]),
        bar4([1, q], [3, q], [2, q], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "Repeated opening 1s and two long tonic cadences make home unmistakable.",
    ),
  ],
);
