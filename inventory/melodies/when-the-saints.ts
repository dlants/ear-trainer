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
 * The left hand holds a single root under the repeated tonic ascents and
 * thickens only where the harmony turns: the V of the first cadence and the
 * move to IV that sets up the close.
 */
const ascentBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );
const arrivalBar = () =>
  polyBar(
    [voiceOf("melody", ev(w, [1, 1])), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );

export const whenTheSaints: CorpusMelody = melody(
  "when-the-saints",
  "When the Saints Go Marching In",
  104,
  "traditional",
  "Traditional American gospel hymn, developed from nineteenth-century spiritual material.",
  [
    phrase(
      [
        ascentBar(),
        arrivalBar(),
        ascentBar(),
        arrivalBar(),
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [5]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Each opening ascent begins on 1 and reaches upper 1, while both later cadences return to home.",
      "independent",
    ),
  ],
);
