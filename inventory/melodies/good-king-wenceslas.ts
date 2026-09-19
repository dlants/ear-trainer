import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const goodKingWenceslas: CorpusMelody = melody(
  "good-king-wenceslas",
  "Good King Wenceslas",
  108,
  "public-domain",
  "Traditional spring carol melody ‘Tempus adest floridum’, printed in 1582.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [1, q], [2, q]),
        bar4([1, q], [1, q], [5, h]),
        bar4([3, q], [3, q], [4, q], [3, q]),
        bar4([2, q], [1, q], [2, h]),
        bar4([5, q], [5, q], [3, q], [3, q]),
        bar4([4, q], [4, q], [2, h]),
        bar4([1, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "Repeated opening 1s and the final lower-7-to-1 cadence strongly establish home.",
    ),
  ],
);
