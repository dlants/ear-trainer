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
        // The opening 3-2 spells I on its own but has not yet placed a bass,
        // so a single root sounds, kept up in the melody's own octave since
        // the line has not dropped to 1 yet.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody states 1 itself and so forces the bass into the octave
        // below; that octave is already a full sound and the tune is only
        // pausing here, so nothing joins it.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The descent comes back with the key already set, so the harmony
        // steps aside entirely rather than restating a root the melody's 3-2
        // has covered.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The answering 1 gives only the root, so the chordal third joins it
        // underneath to colour the tonic before the tune moves on.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // "See how they run" turns to V, which the melody's 5-4 leaves open,
        // so the leading tone sounds beside the dominant root; the return to I
        // takes a plain root a step up, back in the melody's octave.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The run repeats, voiced bare: the leading tone has been heard once
        // already, and saving it for the cadence keeps a thicker dominant from
        // becoming the cue that V has arrived.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The cadence moves I-V-I inside the bar. The melody's 3-2-1 walks
        // through it without naming the dominant, so the leading tone marks
        // the turn and the arrival takes the third for weight.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(q, [1]),
              ev(q, [5, -1], [7, -1]),
              ev(h, [1, -1], [3, -1]),
            ),
          ],
          [region(q, 1), region(q, 5), region(h, 1)],
        ),
        // The closing 1 is held after the cadence has already resolved, so the
        // octave root alone lets the ending ring rather than thicken.
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
