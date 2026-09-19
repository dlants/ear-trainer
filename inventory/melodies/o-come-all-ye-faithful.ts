import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const oComeAllYeFaithful: CorpusMelody = melody(
  "o-come-all-ye-faithful",
  "O Come, All Ye Faithful",
  96,
  "public-domain",
  "Eighteenth-century Latin carol melody traditionally attributed to John Francis Wade.",
  [
    phrase(
      [
        bar4([1, h], [5, h]),
        bar4([1, h, 1], [5, h]),
        bar4([3, q], [2, q], [3, q], [4, q]),
        bar4([3, h], [2, h]),
        bar4([1, q], [7, q, -1], [6, q, -1], [5, q, -1]),
        bar4([2, h], [3, h]),
        bar4([4, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The tune opens with tonic octaves and eventually resolves lower 7 to a sustained 1.",
    ),
  ],
);
