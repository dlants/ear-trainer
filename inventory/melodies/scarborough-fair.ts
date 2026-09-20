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

export const scarboroughFair: CorpusMelody = melody(
  "scarborough-fair",
  "Scarborough Fair",
  80,
  "traditional",
  "Traditional English ballad tune in a common Dorian-inflected form.",
  [
    phrase(
      [
        // The tune opens by stating 1 and 5 itself, so i needs no more than a
        // single sustained bass root a step below the melody.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The melody's 2 says nothing about the turn away from i, so the bass
        // thickens here: lower 7 with its fifth names VII before settling to a
        // bare root.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [7, -2], [2, -1]), ev(q, [7, -2])),
          ],
          [region(dh, 7)],
        ),
        // The melody circles 3 and 4, so III is already audible; one sustained
        // bass 3 is support enough.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [3, -1])),
          ],
          [region(dh, 3)],
        ),
        // The held 2 leaves the minor dominant open, so the bass sounds 5 with
        // lower 7 above it before thinning to the root.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5, "minor")],
        ),
        // The melody outlines 1 and lower 5 around the tonic, so again a lone
        // sustained bass root carries the bar.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [5, -1]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The tune leans on 2 and 3; a single bass 3 lets III be heard without
        // crowding the modal line.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [3, -1])),
          ],
          [region(dh, 3)],
        ),
        // The melody's lower 7 and 2 spell VII loosely, and the dyad voices it
        // the same way as its first appearance so the turn stays recognizable.
        polyBar3(
          [
            voiceOf("melody", ev(q, [7, -1]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(h, [7, -2], [2, -1]), ev(q, [7, -2])),
          ],
          [region(dh, 7)],
        ),
        // The line arrives on a long 1; a root-and-fifth dyad closes the
        // cadence with weight without adding a third to the modal colour.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
      ],
      "context-required",
      "The modal line begins and ends on 1, but its persistent 2 and lower 7 make beginner tonic evidence less direct.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
