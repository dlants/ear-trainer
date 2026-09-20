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

export const threeBlindMice: CorpusMelody = melody(
  "three-blind-mice",
  "Three Blind Mice",
  108,
  "traditional",
  "Traditional English round, with the familiar melody documented by the seventeenth century.",
  [
    phrase(
      [
        // The tune's 3-2 descent leaves the arrival implied, so a single bass
        // root states I and lets the melody carry the motion.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody holds 1 outright, so one held root under it is support
        // enough; nothing more is needed to say I.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The same descent again, held over the same lone root.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's sustained 1 answers the descent; the single root holds
        // the tonic under it.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The "see how they run" descent turns to V, which the melody's 5-4
        // leaves open, so the harmony thickens to root and leading tone before
        // returning to a bare tonic root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The second run repeats the turn to V, and the leading tone again
        // supplies the pull the melody does not state.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The cadence moves I-V-I within the bar: the leading tone marks the
        // dominant, and the arrival takes a root-fifth to sound closed.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(q, [1, -1]),
              ev(q, [5, -1], [7, -1]),
              ev(h, [1, -1], [5, -1]),
            ),
          ],
          [region(q, 1), region(q, 5), region(h, 1)],
        ),
        // The closing sustained 1 needs only its root beneath it.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated 3–2–1 descents and a final sustained 1 provide unusually direct tonic evidence.",
      "independent",
    ),
  ],
);
