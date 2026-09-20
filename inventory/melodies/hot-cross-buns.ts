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

const descentBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [3]), ev(h, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const cadenceDescentBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [3]), ev(h, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const tonicBar = () =>
  polyBar(
    [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const finalTonicBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );
const repeatedTonicBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [1])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const repeatedSupertonicBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [2]), ev(q, [2]), ev(q, [2]), ev(q, [2])),
      voiceOf("harmony", ev(w, [5, -1], [7, -1])),
    ],
    [region(w, 5)],
  );

export const hotCrossBuns: CorpusMelody = melody(
  "hot-cross-buns",
  "Hot Cross Buns",
  96,
  "traditional",
  "Traditional English street cry and nursery tune, documented by the eighteenth century.",
  [
    phrase(
      [descentBar(), tonicBar(), cadenceDescentBar(), finalTonicBar()],
      "independent",
      "Each descending 3–2–1 statement ends on a sustained tonic.",
      "independent",
    ),
    phrase(
      [
        repeatedTonicBar(),
        repeatedSupertonicBar(),
        cadenceDescentBar(),
        finalTonicBar(),
      ],
      "independent",
      "Four repeated 1s precede the final 3–2–1 cadence.",
      "independent",
    ),
  ],
);
