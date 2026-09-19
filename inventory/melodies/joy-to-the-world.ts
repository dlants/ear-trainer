import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, dq, e, h, melody, phrase, q, w } from "../melody-builders.ts";

export const joyToTheWorld: CorpusMelody = melody(
  "joy-to-the-world",
  "Joy to the World",
  112,
  "public-domain",
  "Lowell Mason's 1836 hymn tune Antioch, drawing on earlier Handelian material.",
  [
    phrase(
      [
        bar4([1, q, 1], [7, q], [6, q], [5, q]),
        bar4([4, dq], [3, e], [2, h]),
        bar4([1, dq], [2, e], [3, h]),
        bar4([3, dq], [4, e], [5, h]),
        bar4([5, e], [6, e], [5, e], [4, e], [3, q], [2, q]),
        bar4([1, h], [5, h, -1]),
        bar4([1, q], [2, q], [7, q, -1], [2, q]),
        bar4([1, w]),
      ],
      "independent",
      "The opening scale descends from upper 1 and the final phrase returns twice to home.",
    ),
  ],
);
