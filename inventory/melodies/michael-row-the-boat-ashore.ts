import type { CorpusMelody } from "../../music/melody.ts";
import {
  ev,
  h,
  melody,
  phrase,
  polyBar,
  q,
  region,
  voiceOf,
  w,
} from "../melody-builders.ts";

/**
 * A rowing-song support: a single bass root holds under the tonic bars, and
 * thickens to a dyad only at the turn to IV and at the two V–I cadences.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1], [5, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );

export const michaelRowTheBoatAshore: CorpusMelody = melody(
  "michael-row-the-boat-ashore",
  "Michael, Row the Boat Ashore",
  88,
  "traditional",
  "Traditional African American spiritual first documented in the nineteenth-century Sea Islands.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [3]), ev(h, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
        cadenceBar(ev(h, [2]), ev(h, [1])),
        tonicBar(ev(q, [1]), ev(q, [3]), ev(h, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Both halves start on 1 and descend to it, with a final lower-leading-tone resolution.",
      "independent",
    ),
  ],
);
