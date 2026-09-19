import type { CorpusMelody } from "../../music/melody.ts";
import { bar3, dh, h, melody, phrase, q } from "../melody-builders.ts";

export const shenandoah: CorpusMelody = melody(
  "shenandoah",
  "Shenandoah",
  72,
  "traditional",
  "Traditional American folk song and river shanty, documented in the nineteenth century.",
  [
    phrase(
      [
        bar3([5, q, -1], [1, h]),
        bar3([3, h], [2, q]),
        bar3([1, q], [2, q], [3, q]),
        bar3([5, dh]),
        bar3([6, q], [5, q], [3, q]),
        bar3([2, h], [1, q]),
        bar3([2, q], [7, q, -1], [2, q]),
        bar3([1, dh]),
      ],
      "independent",
      "The pickup resolves to 1, the later descent reaches it, and the final 2–lower-7–2–1 motion settles home.",
    ),
  ],
);
