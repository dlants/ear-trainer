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
 * A light I–V support: a single bass root while the harmony holds, widened to
 * a dyad at the first turn to V and at the closing cadence, so the bass line
 * stays just below the tune instead of blocking out triads.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [3]), ev(q, [3])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const answerBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );
const risingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const sustainBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [5]), ev(h, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const cadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [2, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const closingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const pollyPutTheKettleOn: CorpusMelody = melody(
  "polly-put-the-kettle-on",
  "Polly Put the Kettle On",
  112,
  "traditional",
  "Traditional English nursery tune, printed in the late eighteenth century.",
  [
    phrase(
      [
        openingBar(),
        answerBar(),
        risingBar(),
        sustainBar(),
        openingBar(),
        answerBar(),
        cadenceBar(),
        closingBar(),
      ],
      "independent",
      "The latter half reaches 1 and closes with lower 7 resolving to a full-measure tonic.",
      "independent",
    ),
  ],
);
