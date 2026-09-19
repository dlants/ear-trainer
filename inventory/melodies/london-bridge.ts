import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, e, h, melody, phrase, q, w } from "../melody-builders.ts";

export const londonBridge: CorpusMelody = melody(
  "london-bridge",
  "London Bridge Is Falling Down",
  112,
  "traditional",
  "Traditional English singing-game tune in a common nineteenth-century form.",
  [
    phrase(
      [
        bar4([5, q], [6, e], [5, e], [4, q], [3, q]),
        bar4([4, q], [5, h], [2, q]),
        bar4([3, q], [4, h], [3, q]),
        bar4([4, q], [5, h], [5, q]),
      ],
      "context-required",
      "The first half circles 5 and ends there, with no tonic event.",
    ),
    phrase(
      [
        bar4([5, q], [6, e], [5, e], [4, q], [3, q]),
        bar4([4, q], [5, h], [2, q]),
        bar4([5, q], [3, q], [1, h]),
        bar4(["rest", w]),
      ],
      "independent",
      "The final 5–3–1 arpeggiation supplies a clear tonic cadence followed by silence.",
    ),
  ],
);
