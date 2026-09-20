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
 * A waltz accompaniment held to one bass note per bar, thickened to a dyad only
 * where the harmony turns: the move to IV and the dominant bars that lead back
 * to the tonic.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(dh, [1, -1]))],
    [region(dh, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
    ],
    [region(dh, 5)],
  );
const turnToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(q, 5)],
  );
const turnToSubdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(q, [1, -1]), ev(h, [4, -1], [6, -1])),
    ],
    [region(q, 1), region(h, 4)],
  );
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar3(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
    ],
    [region(dh, 1)],
  );

export const myBonnie: CorpusMelody = melody(
  "my-bonnie",
  "My Bonnie Lies over the Ocean",
  88,
  "traditional",
  "Traditional Scottish song, published in the nineteenth century.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(h, [1])),
        tonicBar(ev(q, [3]), ev(q, [2]), ev(q, [1])),
        turnToDominantBar(ev(q, [2]), ev(q, [1]), ev(q, [6, -1])),
        dominantBar(ev(dh, [5, -1])),
        tonicBar(ev(q, [5, -1]), ev(h, [1])),
        turnToSubdominantBar(ev(q, [3]), ev(q, [5]), ev(q, [6])),
        dominantBar(ev(q, [5]), ev(q, [3]), ev(q, [2])),
        finalBar(ev(dh, [1])),
      ],
      "independent",
      "The lower-5 pickup resolves to 1 twice and the strain ends with a complete 5–3–2–1 descent.",
      "independent",
    ),
  ],
);
