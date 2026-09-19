import type { CorpusMelody } from "../../music/melody.ts";
import { bar6, dh, dq, e, melody, phrase, q } from "../melody-builders.ts";

export const popGoesTheWeasel: CorpusMelody = melody(
  "pop-goes-the-weasel",
  "Pop Goes the Weasel",
  116,
  "traditional",
  "Traditional English dance and nursery tune, published in the 1850s.",
  [
    phrase(
      [
        bar6([1, q], [1, e], [2, q], [2, e]),
        bar6([3, q], [5, e], [3, dq]),
        bar6([1, q], [1, e], [2, q], [2, e]),
        bar6([3, dq], [1, dq]),
        bar6([1, q], [1, e], [2, q], [2, e]),
        bar6([3, q], [5, e], [6, dq]),
        bar6([5, q], [3, e], [2, q], [7, e, -1]),
        bar6([1, dh]),
      ],
      "independent",
      "Each strain starts on 1, and the final lower-7-to-1 snap is a strong tonic resolution.",
    ),
  ],
);
