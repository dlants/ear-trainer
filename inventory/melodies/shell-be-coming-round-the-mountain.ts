import type { CorpusMelody } from "../../music/melody.ts";
import {
  e,
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
 * the harmony just holds, thickened to a dyad at the turns away from tonic —
 * the half cadence, the move to IV, and the closing V–I.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const dominantToTonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const halfCadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
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
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const shellBeComingRoundTheMountain: CorpusMelody = melody(
  "shell-be-coming-round-the-mountain",
  "She'll Be Coming 'Round the Mountain",
  116,
  "traditional",
  "Traditional American folk song derived from the spiritual ‘When the Chariot Comes’.",
  [
    phrase(
      [
        tonicBar(
          ev(e, [5, -1]),
          ev(e, [6, -1]),
          ev(q, [1]),
          ev(q, [1]),
          ev(q, [1]),
        ),
        tonicBar(ev(q, [3]), ev(q, [3]), ev(h, [3])),
        dominantToTonicBar(ev(q, [2]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
        halfCadenceBar(ev(h, [1]), ev(h, [5, -1])),
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(ev(w, [1])),
      ],
      "independent",
      "Repeated 1s establish home immediately and the ending resolves lower 7 to 1.",
      "independent",
    ),
  ],
);
