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
 * the harmony holds, widening to a dyad at the turn to IV and at the half and
 * final cadences.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const tonicToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const tonicToSubdominantBar = (...events: ReturnType<typeof ev>[]) =>
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
const subdominantToDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 4), region(h, 5)],
  );
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const goodKingWenceslas: CorpusMelody = melody(
  "good-king-wenceslas",
  "Good King Wenceslas",
  108,
  "public-domain",
  "Traditional spring carol melody ‘Tempus adest floridum’, printed in 1582.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [2])),
        tonicToDominantBar(ev(q, [1]), ev(q, [1]), ev(h, [5])),
        tonicToSubdominantBar(ev(q, [3]), ev(q, [3]), ev(q, [4]), ev(q, [3])),
        dominantBar(ev(q, [2]), ev(q, [1]), ev(h, [2])),
        tonicBar(ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
        subdominantToDominantBar(ev(q, [4]), ev(q, [4]), ev(h, [2])),
        tonicToDominantBar(ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(),
      ],
      "independent",
      "Repeated opening 1s and the final lower-7-to-1 cadence strongly establish home.",
      "independent",
    ),
  ],
);
