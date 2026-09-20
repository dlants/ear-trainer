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
 * A slow spiritual, so the support is mostly a single held bass root; it
 * thickens to a dyad only at the turn to IV and under the closing V-I cadence.
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
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );
export const kumbaya: CorpusMelody = melody(
  "kumbaya",
  "Kumbaya",
  76,
  "traditional",
  "Traditional African American spiritual and camp song, documented in early twentieth-century field recordings.",
  [
    phrase(
      [
        tonicBar(ev(h, [1]), ev(h, [3])),
        tonicBar(ev(h, [5]), ev(h, [5])),
        subdominantBar(ev(h, [6]), ev(h, [5])),
        tonicBar(ev(w, [3])),
        tonicBar(ev(h, [1]), ev(h, [3])),
        subdominantBar(ev(q, [5]), ev(q, [4]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(),
      ],
      "independent",
      "The second statement begins on 1 and the final lower-7-to-1 motion gives a clear cadence.",
      "independent",
    ),
  ],
);
