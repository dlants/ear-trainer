import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const threeBlindMice: CorpusMelody = melody(
  "three-blind-mice",
  "Three Blind Mice",
  108,
  "traditional",
  "Traditional English round, with the familiar melody documented by the seventeenth century.",
  [
    phrase(
      [
        bar4([3, h], [2, h]),
        bar4([1, w]),
        bar4([3, h], [2, h]),
        bar4([1, w]),
        bar4([5, q], [4, q], [3, h]),
        bar4([5, q], [4, q], [3, h]),
        bar4([3, q], [2, q], [1, h]),
        bar4([1, w]),
      ],
      "independent",
      "Repeated 3–2–1 descents and a final sustained 1 provide unusually direct tonic evidence.",
    ),
  ],
);
