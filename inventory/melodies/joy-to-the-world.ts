import type { CorpusMelody } from "../../music/melody.ts";
import {
  dq,
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
 * The descending scale carries the tune, so the left hand stays out of its
 * way: a single bass root while the harmony holds, thickened to a dyad on the
 * dominant turns and at the closing cadence.
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
const turningBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const joyToTheWorld: CorpusMelody = melody(
  "joy-to-the-world",
  "Joy to the World",
  112,
  "public-domain",
  "Lowell Mason's 1836 hymn tune Antioch, drawing on earlier Handelian material.",
  [
    phrase(
      [
        tonicBar(ev(q, [1, 1]), ev(q, [7]), ev(q, [6]), ev(q, [5])),
        dominantBar(ev(dq, [4]), ev(e, [3]), ev(h, [2])),
        tonicBar(ev(dq, [1]), ev(e, [2]), ev(h, [3])),
        turningBar(ev(dq, [3]), ev(e, [4]), ev(h, [5])),
        dominantBar(
          ev(e, [5]),
          ev(e, [6]),
          ev(e, [5]),
          ev(e, [4]),
          ev(q, [3]),
          ev(q, [2]),
        ),
        tonicBar(ev(h, [1]), ev(h, [5, -1])),
        turningBar(ev(q, [1]), ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
        cadenceBar(ev(w, [1])),
      ],
      "independent",
      "The opening scale descends from upper 1 and the final phrase returns twice to home.",
      "independent",
    ),
  ],
);
