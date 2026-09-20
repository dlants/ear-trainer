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

export const greensleeves: CorpusMelody = melody(
  "greensleeves",
  "Greensleeves",
  76,
  "public-domain",
  "English Renaissance ballad tune, registered in 1580.",
  [
    phrase(
      [
        // The pickup 5 rising to 1 states the tonic itself, so a single bass
        // root under it is enough.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The tune climbs 2-3-4 above the held i; the bass just holds its root
        // while the harmony does not move.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The melody's 3 is the root of III, but this is the turn away from i,
        // so root and fifth mark it, and v takes its root with the melody's 2
        // above.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [3, -1], [5, -1]), ev(q, [5, -1], [2])),
          ],
          [region(h, 3), region(q, 5, "minor")],
        ),
        // Lower 7 in the tune is the root of VII; the added 2 supplies its
        // fifth, then v returns on a bare root.
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(h, [7, -1], [2]), ev(q, [5, -1])),
          ],
          [region(h, 7), region(q, 5, "minor")],
        ),
        // The opening gesture returns, and so does its lone bass root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The tune turns back down to 2 over the same held i; one root still
        // carries it.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The melody circles lower 7 and 6, so VII holds a bare root and v
        // adds 2 above its root to point the cadence home.
        polyBar3(
          [
            voiceOf("melody", ev(q, [7, -1]), ev(q, [6, -1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(h, [7, -1]), ev(q, [5, -1], [2])),
          ],
          [region(h, 7), region(q, 5, "minor")],
        ),
        // The close lands on 1; a root-fifth below gives the final i its
        // weight.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
      ],
      "context-required",
      "The minor-mode tune frames 1 with lower 7 and 6; its tonic is clear in context but conservative practice should defer it.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
