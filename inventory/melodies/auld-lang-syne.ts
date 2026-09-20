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
 * The tune sits on I for most of its length, so the accompaniment is a single
 * held bass root there, thickening to a dyad only at the half cadence, at the
 * turn to IV, and at the final close.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const halfCadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );
const approachBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
    ],
    [region(h, 4), region(h, 5)],
  );
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const auldLangSyne: CorpusMelody = melody(
  "auld-lang-syne",
  "Auld Lang Syne",
  88,
  "traditional",
  "Traditional Scots tune associated with Robert Burns's 1788 text.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(q, [1]), ev(q, [1]), ev(q, [1])),
        tonicBar(ev(q, [3]), ev(q, [2]), ev(h, [1])),
        tonicBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
        halfCadenceBar(ev(h, [2]), ev(h, [5])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [1])),
        tonicBar(ev(q, [3]), ev(q, [2]), ev(h, [1])),
        approachBar(ev(q, [6, -1]), ev(q, [5, -1]), ev(q, [6, -1]), ev(q, [1])),
        finalBar(ev(w, [1])),
      ],
      "independent",
      "The tune repeatedly returns to 1, and the closing lower-neighbor ascent settles on a long tonic.",
      "independent",
    ),
  ],
);
