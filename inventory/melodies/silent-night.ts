import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, dq, e, h, melody, phrase, q } from "../melody-builders.ts";

export const silentNight: CorpusMelody = melody(
  "silent-night",
  "Silent Night",
  72,
  "public-domain",
  "Franz Xaver Gruber carol melody, composed in 1818.",
  [
    phrase(
      [
        bar3([5, dq], [6, e], [5, q]),
        bar3([3, dh]),
        bar3([5, dq], [6, e], [5, q]),
        bar3([3, dh]),
        bar3([2, h], [2, q]),
        bar3([7, h, -1], [7, q, -1]),
        bar3([1, h], [1, q]),
        bar3([5, dh, -1]),
        bar3([4, h], [4, q]),
        bar3([1, q, 1], [7, h]),
        bar3([6, q], [5, q], [3, q]),
        bar3([1, dh]),
      ],
      "independent",
      "The later phrase states 1 in two registers and descends 6–5–3–1 to a long tonic.",
    ),
  ],
);
