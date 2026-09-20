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
 * A left hand that mostly walks single roots under the tune, thickening to a
 * dyad only where the harmony turns: the move to IV in the second strain and
 * the V–I cadences.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [5, -1]))],
    [region(w, 5)],
  );
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [4, -1])),
    ],
    [region(w, 4)],
  );
const turnBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const redRiverValley: CorpusMelody = melody(
  "red-river-valley",
  "Red River Valley",
  84,
  "traditional",
  "Traditional North American cowboy song, documented in nineteenth-century manuscripts.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
        tonicBar(ev(h, [3]), ev(q, [2]), ev(q, [1])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
        cadenceBar(ev(h, [3]), ev(h, [1])),
        subdominantBar(ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
        turnBar(ev(h, [3]), ev(h, [2])),
        dominantBar(ev(q, [1]), ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
        cadenceBar(ev(w, [1])),
      ],
      "independent",
      "The lower-5 pickup reaches 1, the first cadence returns there, and the full strain ends on tonic.",
      "independent",
    ),
  ],
);
