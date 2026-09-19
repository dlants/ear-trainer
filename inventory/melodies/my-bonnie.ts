import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const myBonnie: CorpusMelody = melody(
  "my-bonnie",
  "My Bonnie Lies over the Ocean",
  88,
  "traditional",
  "Traditional Scottish song, published in the nineteenth century.",
  [
    phrase(
      [
        bar3([5, q, -1], [1, h]),
        bar3([3, q], [2, q], [1, q]),
        bar3([2, q], [1, q], [6, q, -1]),
        bar3([5, dh, -1]),
        bar3([5, q, -1], [1, h]),
        bar3([3, q], [5, q], [6, q]),
        bar3([5, q], [3, q], [2, q]),
        bar3([1, dh]),
      ],
      "independent",
      "The lower-5 pickup resolves to 1 twice and the strain ends with a complete 5–3–2–1 descent.",
    ),
  ],
);
