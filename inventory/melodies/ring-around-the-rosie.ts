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
 * A light left hand: a single bass root while the harmony holds, widened to a
 * dyad at the turns away from tonic (IV, V) and under the final cadence.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );
const tonicToSubdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
    ],
    [region(h, 1), region(h, 4)],
  );
const dominantToTonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const subdominantToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 4), region(h, 5)],
  );
const tonicToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const ringAroundTheRosie: CorpusMelody = melody(
  "ring-around-the-rosie",
  "Ring Around the Rosie",
  108,
  "traditional",
  "Traditional English-language singing game in a common American melodic form.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [3])),
        dominantBar(ev(q, [2]), ev(q, [2]), ev(h, [5])),
        tonicToSubdominantBar(ev(q, [3]), ev(q, [1]), ev(q, [3]), ev(q, [4])),
        dominantToTonicBar(ev(h, [2]), ev(h, [1])),
        tonicBar(ev(q, [5]), ev(q, [5]), ev(h, [3])),
        subdominantToDominantBar(ev(q, [4]), ev(q, [4]), ev(h, [2])),
        tonicToDominantBar(ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(),
      ],
      "independent",
      "Repeated opening 1s and the final lower-7-to-1 cadence clearly identify home.",
      "independent",
    ),
  ],
);
