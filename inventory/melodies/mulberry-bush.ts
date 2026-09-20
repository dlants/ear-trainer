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
 * A swinging I–V support: a single bass root holds the tonic bars, thickened to
 * a 5–7 dyad where the tune first turns to V and again at the closing cadence.
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
const plainDominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [5, -1]))],
    [region(w, 5)],
  );
const halfCadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );

export const mulberryBush: CorpusMelody = melody(
  "mulberry-bush",
  "Here We Go Round the Mulberry Bush",
  112,
  "traditional",
  "Traditional English singing-game tune documented in the nineteenth century.",
  [
    phrase(
      [
        tonicBar(ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
        dominantBar(ev(q, [4]), ev(q, [4]), ev(h, [2])),
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
        dominantBar(ev(h, [5]), ev(h, [5])),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
        plainDominantBar(ev(q, [4]), ev(q, [2]), ev(h, [7, -1])),
        halfCadenceBar(ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The closing strain uses 1 twice and resolves lower 7 to a sustained tonic.",
      "independent",
    ),
  ],
);
