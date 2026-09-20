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
 * The tune sits on I for most of its length, so the left hand holds a single
 * bass root through the opening strain and only thickens to a dyad where the
 * harmony turns to V and at the closing cadence.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const tonicToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const dominantToTonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1]), ev(h, [1, -1])),
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
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const farmerInTheDell: CorpusMelody = melody(
  "farmer-in-the-dell",
  "The Farmer in the Dell",
  108,
  "traditional",
  "Traditional German-American singing-game tune, widespread in the nineteenth century.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [1])),
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
        tonicBar(ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
        tonicBar(ev(w, [3])),
        tonicToDominantBar(ev(q, [3]), ev(q, [4]), ev(h, [5])),
        dominantToTonicBar(ev(q, [5]), ev(q, [4]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(ev(w, [1])),
      ],
      "independent",
      "Six opening tonic attacks and a final lower-7-to-1 cadence give strong evidence for home.",
      "context-required",
    ),
  ],
);
