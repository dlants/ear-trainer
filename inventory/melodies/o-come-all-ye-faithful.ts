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
 * A hymn-style support that stays out of the tune's way: a single bass root
 * while the harmony holds, thickened to a root-plus-leading-tone dyad at each
 * turn to V and under the final cadence.
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
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const dominantToTonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );

export const oComeAllYeFaithful: CorpusMelody = melody(
  "o-come-all-ye-faithful",
  "O Come, All Ye Faithful",
  96,
  "public-domain",
  "Eighteenth-century Latin carol melody traditionally attributed to John Francis Wade.",
  [
    phrase(
      [
        tonicBar(ev(h, [1]), ev(h, [5])),
        tonicBar(ev(h, [1, 1]), ev(h, [5])),
        tonicBar(ev(q, [3]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
        tonicToDominantBar(ev(h, [3]), ev(h, [2])),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [7, -1]),
              ev(q, [6, -1]),
              ev(q, [5, -1]),
            ),
            voiceOf(
              "harmony",
              ev(h, [1, -1]),
              ev(q, [4, -1]),
              ev(q, [5, -1], [7, -1]),
            ),
          ],
          [region(h, 1), region(q, 4), region(q, 5)],
        ),
        dominantToTonicBar(ev(h, [2]), ev(h, [3])),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [4]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The tune opens with tonic octaves and eventually resolves lower 7 to a sustained 1.",
      "independent",
    ),
  ],
);
