import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, e, h, melody, phrase, q, w } from "../melody-builders.ts";

export const ohSusanna: CorpusMelody = melody(
  "oh-susanna",
  "Oh! Susanna",
  108,
  "public-domain",
  "Stephen Foster song, first published in 1848.",
  [
    phrase(
      [
        bar4([1, e], [2, e], [3, q], [5, q], [6, q]),
        bar4([5, h], [3, h]),
        bar4([1, e], [2, e], [3, q], [3, q], [2, q]),
        bar4([1, h], [2, h]),
        bar4([3, q], [5, q], [6, q], [6, q]),
        bar4([5, q], [3, q], [1, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "The opening starts on 1, the refrain lands on 1, and the final leading-tone motion resolves home.",
    ),
  ],
);
