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
 * A single-note left hand carries the I–V frame, thickening to a dyad only
 * where the harmony turns away from tonic (the first move to V, the IV bars)
 * and at the cadences.
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
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1], [5, -1])),
    ],
    [region(h, 5), region(h, 1)],
  );

export const hickoryDickoryDock: CorpusMelody = melody(
  "hickory-dickory-dock",
  "Hickory Dickory Dock",
  108,
  "traditional",
  "Traditional English nursery rhyme tune in a common modern folk form.",
  [
    phrase(
      [
        tonicBar(ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
        dominantBar(ev(h, [5]), ev(h, [5])),
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        cadenceBar(ev(h, [2]), ev(h, [1])),
        tonicBar(ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
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
      "The scale ascent starts on 1, the first half cadences there, and the ending resolves lower 7 to 1.",
      "independent",
    ),
  ],
);
