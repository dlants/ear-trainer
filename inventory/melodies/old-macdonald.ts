import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const oldMacdonald: CorpusMelody = melody(
  "old-macdonald",
  "Old MacDonald Had a Farm",
  108,
  "traditional",
  "Traditional American cumulative song, documented in early twentieth-century collections from older oral forms.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [1, q], [5, q, -1]),
        bar4([6, q, -1], [6, q, -1], [5, h, -1]),
        bar4([3, q], [3, q], [2, q], [2, q]),
        bar4([1, h], [5, h]),
      ],
      "independent",
      "Repeated opening 1s and the 2–1 motion establish tonic before the refrain pickup.",
    ),
    phrase(
      [
        bar4([1, q], [1, q], [1, q], [5, q, -1]),
        bar4([6, q, -1], [6, q, -1], [5, h, -1]),
        bar4([3, q], [3, q], [2, q], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "The repeated tonic opening returns and the complete strain closes on a full-measure 1.",
    ),
  ],
);
