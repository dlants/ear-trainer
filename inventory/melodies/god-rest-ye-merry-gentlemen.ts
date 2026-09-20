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
 * A minor-mode accompaniment carried by a single bass root, thickened to a
 * dyad only where the harmony turns: the first move to iv, the v at the
 * mid-point rest, and the closing VII–i cadence.
 */
const minorBar = (...events: ReturnType<typeof ev>[]) =>
  polyBar(
    [voiceOf("melody", ...events), voiceOf("harmony", ev(w, [1, -1]))],
    [region(w, 1, "minor")],
  );

export const godRestYeMerryGentlemen: CorpusMelody = melody(
  "god-rest-ye-merry-gentlemen",
  "God Rest Ye Merry, Gentlemen",
  96,
  "traditional",
  "Traditional English carol melody in a minor mode, printed in the nineteenth century.",
  [
    phrase(
      [
        minorBar(ev(q, [5, -1]), ev(q, [1]), ev(q, [1]), ev(q, [7, -1])),
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(h, [3])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [3, -1])),
          ],
          [region(h, 1, "minor"), region(h, 3)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4, "minor"), region(h, 1, "minor")],
        ),
        polyBar(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5, "minor")],
        ),
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [1, -1]), ev(q, [4, -1])),
          ],
          [region(dh, 1, "minor"), region(q, 4, "minor")],
        ),
        minorBar(ev(q, [3]), ev(q, [2]), ev(h, [1])),
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [7, -1]),
              ev(q, [6, -1]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [7, -1]), ev(h, [7, -1], [2, -1])),
          ],
          [region(w, 7)],
        ),
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1, "minor")],
        ),
      ],
      "context-required",
      "Natural 1 frames the minor-mode phrase, but lower 7 and the modal contour warrant contextual practice.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
