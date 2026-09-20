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
 * the harmony merely holds, thickened to a dyad at the turn to IV and at the
 * dominant cadences.
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
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
    ],
    [region(h, 1), region(h, 4)],
  );

export const lochLomond: CorpusMelody = melody(
  "loch-lomond",
  "The Bonnie Banks o' Loch Lomond",
  80,
  "traditional",
  "Traditional Scottish song, first published in the nineteenth century.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(q, [1]), ev(q, [1]), ev(q, [2])),
        tonicToDominantBar(ev(h, [3]), ev(h, [2])),
        subdominantBar(ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [6])),
        tonicBar(ev(w, [5])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [2])),
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(q, [1, -1]),
              ev(q, [5, -1], [7, -1]),
              ev(h, [1, -1]),
            ),
          ],
          [region(q, 1), region(q, 5), region(h, 1)],
        ),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [6, -1]),
              ev(q, [5, -1]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf(
              "harmony",
              ev(h, [4, -1], [6, -1]),
              ev(h, [5, -1], [7, -1]),
            ),
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
      "The lower-5 pickup reaches 1, the later descent lands there, and the final phrase sustains tonic.",
      "independent",
    ),
  ],
);
