import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const clementine: CorpusMelody = melody(
  "clementine",
  "Oh My Darling, Clementine",
  88,
  "public-domain",
  "Percy Montrose song, published in 1884, drawing on earlier American folk material.",
  [
    phrase(
      [
        bar3([5, q, -1], [5, q, -1], [5, q, -1]),
        bar3([1, h], [3, q]),
        bar3([3, q], [3, q], [1, q]),
        bar3([5, dh, -1]),
        bar3([5, q, -1], [5, q, -1], [5, q, -1]),
        bar3([1, h], [3, q]),
        bar3([5, q], [5, q], [3, q]),
        bar3([1, dh]),
      ],
      "independent",
      "Repeated lower 5s resolve to 1 in both halves, and the final 5–3–1 outlines the tonic triad.",
    ),
  ],
);
