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
 * A banjo-style left hand: a single bass root while the harmony holds, widened
 * to a dyad at the turn to IV and at the half and final cadences.
 */
const callBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const answerBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const descentBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const restingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [3]), ev(h, [1])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
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

export const camptownRaces: CorpusMelody = melody(
  "camptown-races",
  "Camptown Races",
  116,
  "public-domain",
  "Stephen Foster minstrel-era song, published in 1850.",
  [
    phrase(
      [
        callBar(),
        answerBar(),
        descentBar(),
        restingBar(),
        callBar(),
        answerBar(),
        dominantBar(),
        finalBar(),
      ],
      "independent",
      "The first cadence reaches 1 and the last phrase resolves lower 7 to a long tonic.",
      "independent",
    ),
  ],
);
