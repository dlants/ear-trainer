import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
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
 * A left hand that mostly holds a single root under the tonic bars and
 * thickens to a dyad only where the harmony turns: the moves to IV under the
 * melody's 6, and the dominant bars that push back to 1.
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
const answerBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [1])),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );
const neighbourBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
      voiceOf(
        "harmony",
        ev(h, [1, -1]),
        ev(q, [4, -1], [6, -1]),
        ev(q, [5, -1]),
      ),
    ],
    [region(h, 1), region(q, 4), region(q, 5)],
  );
const halfCadenceBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(h, [3]), ev(h, [2])),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const climbBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [6])),
      voiceOf("harmony", ev(dh, [1, -1]), ev(q, [4, -1], [6, -1])),
    ],
    [region(dh, 1), region(q, 4)],
  );
const finalBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const goTellItOnTheMountain: CorpusMelody = melody(
  "go-tell-it-on-the-mountain",
  "Go Tell It on the Mountain",
  100,
  "traditional",
  "Traditional African American spiritual, collected and published in the nineteenth century.",
  [
    phrase(
      [
        tonicBar(ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [1])),
        answerBar(),
        neighbourBar(),
        halfCadenceBar(),
        climbBar(),
        tonicBar(ev(q, [5]), ev(q, [3]), ev(h, [1])),
        dominantBar(ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
        finalBar(),
      ],
      "independent",
      "A 5–3–1 opening descent, repeated 1s, and the final lower-7 resolution identify tonic.",
      "independent",
    ),
  ],
);
