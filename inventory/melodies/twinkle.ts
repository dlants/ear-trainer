import type { CorpusMelody } from "../../music/melody.ts";
import {
  accompany,
  bar4,
  ev,
  h,
  melody,
  phrase,
  q,
  region,
  triadI,
  triadIV,
  triadV,
  w,
} from "../melody-builders.ts";

export const twinkle: CorpusMelody = melody(
  "twinkle",
  "Twinkle, Twinkle, Little Star",
  96,
  "public-domain",
  "Traditional French melody published as ‘Ah! vous dirai-je, maman’ in the eighteenth century.",
  [
    phrase(
      [
        accompany(
          bar4([1, q], [1, q], [5, q], [5, q]),
          [region(w, 1)],
          ev(h, ...triadI),
          ev(h, ...triadI),
        ),
        accompany(
          bar4([6, q], [6, q], [5, h]),
          [region(h, 4), region(h, 1)],
          ev(h, ...triadIV),
          ev(h, ...triadI),
        ),
        accompany(
          bar4([4, q], [4, q], [3, q], [3, q]),
          [region(h, 4), region(h, 1)],
          ev(h, ...triadIV),
          ev(h, ...triadI),
        ),
        accompany(
          bar4([2, q], [2, q], [1, h]),
          [region(h, 5), region(h, 1)],
          ev(h, ...triadV),
          ev(h, ...triadI),
        ),
      ],
      "independent",
      "The phrase begins and cadences on 1, with repeated 1s and no altered tones.",
      "independent",
    ),
    phrase(
      [
        accompany(
          bar4([5, q], [5, q], [4, q], [4, q]),
          [region(h, 1), region(h, 4)],
          ev(h, ...triadI),
          ev(h, ...triadIV),
        ),
        accompany(
          bar4([3, q], [3, q], [2, h]),
          [region(h, 1), region(h, 5)],
          ev(h, ...triadI),
          ev(h, ...triadV),
        ),
        accompany(
          bar4([5, q], [5, q], [4, q], [4, q]),
          [region(h, 1), region(h, 4)],
          ev(h, ...triadI),
          ev(h, ...triadIV),
        ),
        accompany(
          bar4([3, q], [3, q], [2, h]),
          [region(h, 1), region(h, 5)],
          ev(h, ...triadI),
          ev(h, ...triadV),
        ),
      ],
      "context-required",
      "The repeated dominant-led middle strain ends on 2 and relies on the surrounding tonic phrases.",
      "independent",
    ),
    phrase(
      [
        accompany(
          bar4([1, q], [1, q], [5, q], [5, q]),
          [region(w, 1)],
          ev(h, ...triadI),
          ev(h, ...triadI),
        ),
        accompany(
          bar4([6, q], [6, q], [5, h]),
          [region(h, 4), region(h, 1)],
          ev(h, ...triadIV),
          ev(h, ...triadI),
        ),
        accompany(
          bar4([4, q], [4, q], [3, q], [3, q]),
          [region(h, 4), region(h, 1)],
          ev(h, ...triadIV),
          ev(h, ...triadI),
        ),
        accompany(
          bar4([2, q], [2, q], [1, h]),
          [region(h, 5), region(h, 1)],
          ev(h, ...triadV),
          ev(h, ...triadI),
        ),
      ],
      "independent",
      "The returning phrase states 1 at the opening and closes decisively on a long 1.",
      "independent",
    ),
  ],
);
