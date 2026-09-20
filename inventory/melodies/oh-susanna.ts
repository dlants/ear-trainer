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
 * A hand-voiced left hand: a single bass root while the harmony just holds,
 * widening to a dyad where the tune first turns to IV and at the V–I cadence.
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
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
    ],
    [region(h, 1), region(h, 4)],
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

export const ohSusanna: CorpusMelody = melody(
  "oh-susanna",
  "Oh! Susanna",
  108,
  "public-domain",
  "Stephen Foster song, first published in 1848.",
  [
    phrase(
      [
        tonicBar(ev(e, [1]), ev(e, [2]), ev(q, [3]), ev(q, [5]), ev(q, [6])),
        tonicBar(ev(h, [5]), ev(h, [3])),
        tonicBar(ev(e, [1]), ev(e, [2]), ev(q, [3]), ev(q, [3]), ev(q, [2])),
        halfCadenceBar(ev(h, [1]), ev(h, [2])),
        subdominantBar(ev(q, [3]), ev(q, [5]), ev(q, [6]), ev(q, [6])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(h, [1])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(ev(w, [1])),
      ],
      "independent",
      "The opening starts on 1, the refrain lands on 1, and the final leading-tone motion resolves home.",
      "independent",
    ),
  ],
);
