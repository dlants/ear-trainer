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
 * The left hand stays mostly to single bass notes and thickens only where the
 * harmony turns: the first move to IV in each strain, and the closing V–I.
 */
const openingBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [5])),
      voiceOf("harmony", ev(w, [1, -1])),
    ],
    [region(w, 1)],
  );

export const thisOldMan: CorpusMelody = melody(
  "this-old-man",
  "This Old Man",
  112,
  "traditional",
  "Traditional English-language nursery and counting song, collected in the nineteenth century.",
  [
    phrase(
      [
        openingBar(),
        openingBar(),
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
      ],
      "context-required",
      "The opening strain avoids 1 and pauses on 4, so it does not independently establish tonic.",
      "context-required",
    ),
    phrase(
      [
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated 1s and the final 2–lower-7–2–1 figure make the tonic arrival explicit.",
      "independent",
    ),
  ],
);
