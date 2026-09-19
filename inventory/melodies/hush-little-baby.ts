import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const hushLittleBaby: CorpusMelody = melody(
  "hush-little-baby",
  "Hush, Little Baby",
  92,
  "traditional",
  "Traditional American lullaby in a widely sung folk form.",
  [
    phrase(
      [
        bar4([1, q], [3, q], [5, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([5, q], [3, q], [2, q], [1, q]),
        bar4([2, h], [1, h]),
        bar4([1, q], [3, q], [5, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [1, q]),
        bar4([1, w]),
      ],
      "independent",
      "The melody starts on 1, repeatedly descends to it, and finishes with two tonic events.",
    ),
  ],
);
