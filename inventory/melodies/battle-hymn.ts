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
 * A marching left hand: a single bass root while the harmony simply holds,
 * thickened to a dyad at the turn to IV and at the dominant cadences.
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
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const battleHymn: CorpusMelody = melody(
  "battle-hymn",
  "Battle Hymn of the Republic",
  108,
  "public-domain",
  "Traditional American camp-meeting tune used for ‘John Brown's Body’ and Julia Ward Howe's 1862 hymn.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [7, -1])),
        tonicBar(ev(q, [1]), ev(q, [2]), ev(h, [3])),
        tonicBar(ev(q, [3]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
        dominantBar(ev(h, [2]), ev(h, [5, -1])),
        tonicBar(ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(),
      ],
      "independent",
      "Three initial tonic attacks and a final lower-7-to-1 cadence provide strong tonic evidence.",
      "independent",
    ),
  ],
);
