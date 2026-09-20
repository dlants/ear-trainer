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
 * A hand-voiced left hand rather than block chords: a single bass root while
 * the harmony holds, thickened to a dyad at the turn to IV and at the V–I
 * cadences.
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
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );
const subdominantBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );

export const lavendersBlue: CorpusMelody = melody(
  "lavenders-blue",
  "Lavender's Blue",
  96,
  "traditional",
  "Traditional English folk song documented in seventeenth-century broadside form.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [3])),
        tonicBar(ev(q, [5]), ev(q, [5]), ev(h, [3])),
        dominantBar(ev(q, [4]), ev(q, [4]), ev(q, [2]), ev(q, [2])),
        finalBar(),
        tonicBar(ev(q, [3]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
        subdominantBar(),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final lower-7 resolution all point home.",
      "independent",
    ),
  ],
);
