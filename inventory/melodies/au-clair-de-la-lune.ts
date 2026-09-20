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
 * A single-note left hand holds the tonic through the opening, thickening to a
 * dyad only where the tune turns to V and at the closing cadences.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [2])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const turnToDominantBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [3]), ev(h, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const answerBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [2]), ev(q, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const cadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );
const dominantBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(q, [2]), ev(q, [2])),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
    ],
    [region(w, 5)],
  );
const restingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [5]), ev(h, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );

export const auClairDeLaLune: CorpusMelody = melody(
  "au-clair-de-la-lune",
  "Au clair de la lune",
  100,
  "traditional",
  "Traditional French song, printed in the eighteenth century.",
  [
    phrase(
      [
        openingBar(),
        turnToDominantBar(),
        answerBar(),
        cadenceBar(),
        dominantBar(),
        restingBar(),
        answerBar(),
        cadenceBar(),
      ],
      "independent",
      "Repeated opening 1s and two long tonic cadences make home unmistakable.",
      "independent",
    ),
  ],
);
