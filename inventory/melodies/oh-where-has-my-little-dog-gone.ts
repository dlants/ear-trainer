import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const ohWhereHasMyLittleDogGone: CorpusMelody = melody(
  "oh-where-has-my-little-dog-gone",
  "Oh Where, Oh Where Has My Little Dog Gone?",
  104,
  "public-domain",
  "Septimus Winner song, published in 1864, based on an older German folk melody.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [5, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([4, q], [4, q], [2, q], [2, q]),
        bar4([1, w]),
        bar4([5, q], [5, q], [6, q], [5, q]),
        bar4([3, q], [1, q], [2, h]),
        bar4([1, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final leading-tone resolution identify home.",
    ),
  ],
);
