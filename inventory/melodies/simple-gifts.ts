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
 * A single low root holds the tonic bars; the accompaniment thickens to a dyad
 * only where the tune first turns to IV and at the V–I cadences, so the bass
 * stays a step-wise walk rather than a block-chord pattern.
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
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [4, -1])),
    ],
    [region(w, 4)],
  );
const subdominantToTonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1])),
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
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const simpleGifts: CorpusMelody = melody(
  "simple-gifts",
  "Simple Gifts",
  104,
  "public-domain",
  "Joseph Brackett's Shaker dance song, composed in 1848.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [4]), ev(q, [4])),
        subdominantBar(ev(q, [4]), ev(q, [5]), ev(h, [6])),
        subdominantToTonicBar(ev(q, [6]), ev(q, [5]), ev(q, [4]), ev(q, [3])),
        cadenceBar(ev(h, [2]), ev(h, [1])),
        tonicBar(ev(q, [1]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
        subdominantToTonicBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final lower-7 resolution all establish home.",
      "independent",
    ),
  ],
);
