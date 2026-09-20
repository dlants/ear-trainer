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
 * dyad at the turns to IV and at the V–I cadence that closes the refrain.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [5]), ev(q, [3]), ev(q, [1])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
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
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const dominantBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
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

export const swingLow: CorpusMelody = melody(
  "swing-low",
  "Swing Low, Sweet Chariot",
  84,
  "traditional",
  "Traditional African American spiritual, documented in the nineteenth century.",
  [
    phrase(
      [
        openingBar(),
        subdominantBar(ev(h, [6]), ev(h, [5])),
        tonicBar(ev(q, [3]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
        tonicBar(ev(w, [1])),
        openingBar(),
        subdominantBar(ev(q, [6]), ev(q, [5]), ev(h, [3])),
        dominantBar(),
        finalBar(),
      ],
      "independent",
      "The opening 5–3–1 descent and both long tonic cadences establish home.",
      "independent",
    ),
  ],
);
