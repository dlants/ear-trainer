import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, dq, e, h, melody, phrase, q, w } from "../melody-builders.ts";

export const jingleBells: CorpusMelody = melody(
  "jingle-bells",
  "Jingle Bells",
  116,
  "public-domain",
  "James Lord Pierpont, ‘One Horse Open Sleigh’, 1857.",
  [
    phrase(
      [
        bar4([3, q], [3, q], [3, h]),
        bar4([3, q], [3, q], [3, h]),
        bar4([3, q], [5, q], [1, dq, 1], [2, e, 1]),
        bar4([3, w, 1]),
      ],
      "context-required",
      "The refrain's first half leaps through upper 1 but ends on 3, so its cadence is not tonic.",
    ),
    phrase(
      [
        bar4([4, q], [4, q], [4, dq], [4, e]),
        bar4([4, q], [3, q], [3, q], [3, e], [3, e]),
        bar4([3, q], [2, q], [2, q], [3, q]),
        bar4([2, h], [5, h]),
      ],
      "context-required",
      "This answer emphasizes 4, 3, 2, and 5 without a natural tonic arrival.",
    ),
  ],
);
