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
 * A single-note left hand holds the tonic through the rising figures and
 * thickens to a dyad only where the harmony turns: the 6 that needs a 4 under
 * it to read as IV, and the V–I cadences.
 */
const tonicBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1)],
  );
const subdominantBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
    ],
    [region(h, 4), region(h, 1)],
  );
const cadenceBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [
      voiceOf("melody", ...events),
      voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
    ],
    [region(h, 1), region(h, 5)],
  );
const closeBar = () =>
  polyBar(
    [
      voiceOf("melody", ev(w, [1])),
      voiceOf("harmony", ev(w, [1, -1], [5, -1])),
    ],
    [region(w, 1)],
  );

export const blueBellsOfScotland: CorpusMelody = melody(
  "blue-bells-of-scotland",
  "The Blue Bells of Scotland",
  92,
  "traditional",
  "Traditional Scottish song tune popularized in late eighteenth-century print.",
  [
    phrase(
      [
        tonicBar(ev(q, [5, -1]), ev(q, [1]), ev(q, [3]), ev(q, [5])),
        subdominantBar(ev(h, [6]), ev(h, [5])),
        tonicBar(ev(q, [3]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
        closeBar(),
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf(
              "harmony",
              ev(h, [1, -1]),
              ev(q, [4, -1], [6, -1]),
              ev(q, [1, -1]),
            ),
          ],
          [region(h, 1), region(q, 4), region(q, 1)],
        ),
        cadenceBar(ev(h, [3]), ev(h, [2])),
        cadenceBar(ev(q, [1]), ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
        closeBar(),
      ],
      "independent",
      "The pickup reaches 1, the first half cadences there, and the complete strain closes again on tonic.",
      "independent",
    ),
  ],
);
