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
 * The left hand holds a single root through the tonic bars and thickens to a
 * dyad on the dominant, where the harmony turns and where the tune cadences.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf(
        "melody",
        ev(q, [5]),
        ev(e, [6]),
        ev(e, [5]),
        ev(q, [4]),
        ev(q, [3]),
      ),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const dominantBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [4]), ev(h, [5]), ev(q, [2])),
      voiceOf("harmony", ev(w, [5, -1], [7, -1])),
    ],
    [region(w, 5)],
  );
const tonicBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [3]), ev(h, [4]), ev(q, [3])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const halfCloseBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [4]), ev(h, [5]), ev(q, [5])),
      voiceOf("harmony", ev(w, [5, -1], [7, -1])),
    ],
    [region(w, 5)],
  );
const cadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );
const restBar = () =>
  polyBar(
    [voiceOf("melody", ev(w)), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );

export const londonBridge: CorpusMelody = melody(
  "london-bridge",
  "London Bridge Is Falling Down",
  112,
  "traditional",
  "Traditional English singing-game tune in a common nineteenth-century form.",
  [
    phrase(
      [openingBar(), dominantBar(), tonicBar(), halfCloseBar()],
      "context-required",
      "The first half circles 5 and ends there, with no tonic event.",
      "context-required",
    ),
    phrase(
      [openingBar(), dominantBar(), cadenceBar(), restBar()],
      "independent",
      "The final 5–3–1 arpeggiation supplies a clear tonic cadence followed by silence.",
      "independent",
    ),
  ],
);
