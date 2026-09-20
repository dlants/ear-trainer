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
 * A sparse left hand: a single bass root while the harmony holds, widened to a
 * dyad where the tune first turns away from tonic and at the two V–I cadences.
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
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const dominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );
const dominantToTonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1], [5, -1]))],
    [region(w, 1)],
  );

export const auraLee: CorpusMelody = melody(
  "aura-lee",
  "Aura Lee",
  88,
  "public-domain",
  "George R. Poulton melody with W. W. Fosdick lyrics, published in 1861.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [3]), ev(h, [5])),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [4]), ev(q, [2])),
        cadenceBar(ev(w, [1])),
        tonicBar(ev(q, [3]), ev(q, [5]), ev(h, [1, 1])),
        dominantToTonicBar(ev(q, [7]), ev(q, [6]), ev(h, [5])),
        dominantBar(ev(q, [3]), ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
        cadenceBar(ev(w, [1])),
      ],
      "independent",
      "The melody begins on 1, cadences there at midpoint, and closes again on a sustained tonic.",
      "independent",
    ),
  ],
);
