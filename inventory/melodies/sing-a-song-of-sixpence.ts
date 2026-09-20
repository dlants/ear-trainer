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
 * The tune alternates plainly between I and V, so the left hand stays on a
 * single root for the holding bars and opens into a dyad only where the
 * harmony turns to V or lands on the closing tonic.
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
const turnBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const restingBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const singASongOfSixpence: CorpusMelody = melody(
  "sing-a-song-of-sixpence",
  "Sing a Song of Sixpence",
  112,
  "traditional",
  "Traditional English nursery song documented in eighteenth-century print.",
  [
    phrase(
      [
        tonicBar(ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
        dominantBar(ev(q, [4]), ev(q, [4]), ev(h, [2])),
        turnBar(ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
        restingBar(ev(w, [5])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
        dominantBar(ev(q, [4]), ev(q, [2]), ev(h, [7, -1])),
        turnBar(ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        restingBar(ev(w, [1])),
      ],
      "independent",
      "The answer phrase repeatedly uses 1 and closes with lower 7–1 resolution.",
      "independent",
    ),
  ],
);
