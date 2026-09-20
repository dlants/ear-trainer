import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const awayInAManger: CorpusMelody = melody(
  "away-in-a-manger",
  "Away in a Manger",
  80,
  "public-domain",
  "Nineteenth-century American carol melody commonly called Mueller.",
  [
    phrase(
      [
        // The tune states 1 itself, so a single bass root is all the waltz
        // needs to set the key.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's 2 leaves V open, so the harmony turns here: a bass root
        // under I, then root and leading tone on the beat that moves.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // Repeated 1s again state the chord; the lone bass root holds under
        // them.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The held 4 says nothing about V on its own, so the harmony supplies
        // both the root and the leading tone for the whole bar.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [4])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The reach to 6 is the turn to IV, so the dyad falls there; the
        // opening half keeps its bare tonic root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(q, 4)],
        ),
        // As in the second bar, the melody's step down leaves V open and the
        // leading tone joins the root where the harmony turns.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // The tune descends 3–2–lower-7 over a full bar of V; root and leading
        // tone hold through the approach to the cadence.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody arrives on 1; root and fifth close the carol.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s and the final 3–2–lower-7–1 descent provide clear tonic evidence.",
      "independent",
    ),
  ],
);
