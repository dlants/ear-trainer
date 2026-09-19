import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const shooFly: CorpusMelody = melody(
  "shoo-fly",
  "Shoo, Fly, Don't Bother Me",
  112,
  "public-domain",
  "American popular and folk song first published in the 1860s.",
  [
    phrase(
      [
        bar4([1, q], [3, q], [5, h]),
        bar4([5, q], [6, q], [5, h]),
        bar4([4, q], [3, q], [2, q], [1, q]),
        bar4([2, h], [5, h, -1]),
        bar4([1, q], [3, q], [5, h]),
        bar4([5, q], [6, q], [5, h]),
        bar4([4, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The melody starts on 1, descends through 1, and ends with lower 7 resolving to tonic.",
    ),
  ],
);
