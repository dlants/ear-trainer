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
 * The accompaniment is hand-voiced rather than block-chorded: a mostly
 * single-note left hand that thickens only where the harmony turns (the first
 * move to IV, and the V–I cadences).
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5]), ev(q, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const subdominantBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [6]), ev(q, [6]), ev(h, [5])),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const descentBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(q, [3]), ev(q, [3])),
      voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const cadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(h, [1])),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1], [5, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const middleOpenBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [4]), ev(q, [4])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1])),
    ],
    [region(h, 1), region(h, 4)],
  );
const middleCloseBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );

const outerPhrase = () => [
  openingBar(),
  subdominantBar(),
  descentBar(),
  cadenceBar(),
];

export const twinkle: CorpusMelody = melody(
  "twinkle",
  "Twinkle, Twinkle, Little Star",
  96,
  "public-domain",
  "Traditional French melody published as ‘Ah! vous dirai-je, maman’ in the eighteenth century.",
  [
    phrase(
      outerPhrase(),
      "independent",
      "The phrase begins and cadences on 1, with repeated 1s and no altered tones.",
      "independent",
    ),
    phrase(
      [middleOpenBar(), middleCloseBar(), middleOpenBar(), middleCloseBar()],
      "context-required",
      "The repeated dominant-led middle strain ends on 2 and relies on the surrounding tonic phrases.",
      "independent",
    ),
    phrase(
      outerPhrase(),
      "independent",
      "The returning phrase states 1 at the opening and closes decisively on a long 1.",
      "independent",
    ),
  ],
);
