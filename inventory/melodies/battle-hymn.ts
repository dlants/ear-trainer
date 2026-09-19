import type { CorpusMelody } from "../../music/melody.ts";
import { bar4, h, melody, phrase, q, w } from "../melody-builders.ts";

export const battleHymn: CorpusMelody = melody(
  "battle-hymn",
  "Battle Hymn of the Republic",
  108,
  "public-domain",
  "Traditional American camp-meeting tune used for ‘John Brown's Body’ and Julia Ward Howe's 1862 hymn.",
  [
    phrase(
      [
        bar4([1, q], [1, q], [1, q], [7, q, -1]),
        bar4([1, q], [2, q], [3, h]),
        bar4([3, q], [3, q], [2, q], [1, q]),
        bar4([2, h], [5, h, -1]),
        bar4([1, q], [3, q], [5, q], [5, q]),
        bar4([6, q], [5, q], [3, h]),
        bar4([2, q], [3, q], [2, q], [7, q, -1]),
        bar4([1, w]),
      ],
      "independent",
      "Three initial tonic attacks and a final lower-7-to-1 cadence provide strong tonic evidence.",
    ),
  ],
);
