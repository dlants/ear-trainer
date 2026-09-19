import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const auldLangSyne: CorpusMelody = melody(
  "auld-lang-syne",
  "Auld Lang Syne",
  88,
  "traditional",
  "Traditional Scots tune associated with Robert Burns's 1788 text.",
  [
    phrase(
      [
        bar4([5, q, -1], [1, q], [1, q], [1, q]),
        bar4([3, q], [2, q], [1, h]),
        bar4([2, q], [3, q], [2, q], [1, q]),
        bar4([2, h], [5, h]),
        bar4([5, q], [3, q], [1, q], [1, q]),
        bar4([3, q], [2, q], [1, h]),
        bar4([6, q, -1], [5, q, -1], [6, q, -1], [1, q]),
        bar4([1, w]),
      ],
      "independent",
      "The tune repeatedly returns to 1, and the closing lower-neighbor ascent settles on a long tonic.",
    ),
  ],
);
