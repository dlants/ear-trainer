import type { CorpusMelody } from "../../music/melody.ts";
import {
  bar3,
  dh,
  e,
  h,
  melody,
  phrase,
  pickup,
  q,
} from "../melody-builders.ts";

export const happyBirthday: CorpusMelody = melody(
  "happy-birthday",
  "Happy Birthday",
  92,
  "public-domain",
  "Patty and Mildred Hill melody first published in the 1890s; public-domain birthday-song form.",
  [
    phrase(
      [
        pickup([5, e, -1], [5, e, -1]),
        bar3([6, q, -1], [5, q, -1], [1, q]),
        bar3([7, h, -1], [5, e, -1], [5, e, -1]),
        bar3([6, q, -1], [5, q, -1], [2, q]),
        bar3([1, dh]),
      ],
      "independent",
      "Both opening sentences rise from lower 5 and the second lands on a sustained natural 1.",
    ),
    phrase(
      [
        pickup([5, e, -1], [5, e, -1]),
        bar3([5, q], [3, q], [1, q]),
        bar3([7, q, -1], [6, q, -1], [4, e], [4, e]),
        bar3([3, q], [1, q], [2, q]),
        bar3([1, dh]),
      ],
      "independent",
      "The climactic line includes 1 and the final 3–1–2–1 motion gives an unambiguous tonic arrival.",
    ),
  ],
);
