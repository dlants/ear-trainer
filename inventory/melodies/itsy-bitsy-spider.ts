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
 * The left hand holds a single bass root through the climbing tonic bars and
 * thickens to a dyad only where the harmony turns: the first move to IV, the
 * half cadence, and the closing V–I.
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
const toSubdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
    ],
    [region(h, 1), region(h, 4)],
  );
const halfCadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const subdominantToTonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const finalBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const itsyBitsySpider: CorpusMelody = melody(
  "itsy-bitsy-spider",
  "Itsy Bitsy Spider",
  108,
  "traditional",
  "Traditional English-language nursery song, published in early twentieth-century folk collections.",
  [
    phrase(
      [
        tonicBar(
          ev(e, [5, -1]),
          ev(e, [1]),
          ev(q, [1]),
          ev(e, [1]),
          ev(e, [2]),
          ev(q, [3]),
        ),
        tonicBar(ev(q, [3]), ev(q, [2]), ev(h, [1])),
        toSubdominantBar(ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [4])),
        halfCadenceBar(ev(h, [3]), ev(h, [2])),
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [5])),
        subdominantToTonicBar(ev(q, [5]), ev(q, [4]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(ev(w, [1])),
      ],
      "independent",
      "The tune begins around 1, returns through it, and ends with lower 7 resolving to 1.",
      "independent",
    ),
  ],
);
