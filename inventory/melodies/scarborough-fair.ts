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

/**
 * The Dorian tune is supported by a single sustained bass note per bar, voiced
 * a step or two below the tune; the bass thickens to a dyad only where the
 * harmony turns away from i (the move to VII) and at the closing v–i cadence.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1, "minor")],
  );
const subtonicTurnBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [7, -2], [2, -1]), ev(q, [7, -2])),
    ],
    [region(dh, 7)],
  );
const mediantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [3, -1]))],
    [region(dh, 3)],
  );
const minorDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
    ],
    [region(dh, 5, "minor")],
  );

export const scarboroughFair: CorpusMelody = melody(
  "scarborough-fair",
  "Scarborough Fair",
  80,
  "traditional",
  "Traditional English ballad tune in a common Dorian-inflected form.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [5])),
        subtonicTurnBar(ev(h, [2]), ev(q, [1])),
        mediantBar(ev(q, [3]), ev(q, [4]), ev(q, [3])),
        minorDominantBar(ev(dh, [2])),
        tonicBar(ev(q, [1]), ev(q, [5, -1]), ev(q, [1])),
        mediantBar(ev(q, [2]), ev(q, [3]), ev(q, [2])),
        subtonicTurnBar(ev(q, [7, -1]), ev(q, [2]), ev(q, [7, -1])),
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
