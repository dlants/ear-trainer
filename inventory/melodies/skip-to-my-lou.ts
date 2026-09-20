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
 * A bouncing I–V dance accompaniment: a single bass root while the harmony
 * holds, thickened to a dyad at the turn to V and at each cadence into 1.
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
const cadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const skipToMyLou: CorpusMelody = melody(
  "skip-to-my-lou",
  "Skip to My Lou",
  112,
  "traditional",
  "Traditional American partner-stealing dance song, documented in the nineteenth century.",
  [
    phrase(
      [
        tonicBar(ev(q, [5]), ev(q, [3]), ev(h, [3])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(h, [3])),
        dominantBar(ev(q, [5]), ev(q, [4]), ev(q, [3]), ev(q, [2])),
        cadenceBar(),
        tonicBar(ev(q, [1]), ev(q, [3]), ev(h, [5])),
        tonicBar(ev(q, [5]), ev(q, [4]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        cadenceBar(),
      ],
      "independent",
      "The first half cadences on 1 and the ending repeats a lower-7-to-1 tonic resolution.",
      "independent",
    ),
  ],
);
