import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const whatChildIsThis: CorpusMelody = melody(
  "what-child-is-this",
  "What Child Is This?",
  76,
  "public-domain",
  "William Chatterton Dix's carol sung to the sixteenth-century English tune Greensleeves.",
  [
    phrase(
      [
        // The tune rises from 5 to a held 1, stating i itself, so a single
        // sustained bass root is support enough.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The climb 2-3-4 wanders outside the triad, so the downbeat takes the
        // minor third beside the root to fix the mode, and the bass then holds
        // alone while the line moves.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(q, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // Here the harmony turns away to III, which the melody's 3 alone would
        // not pin down, so root and chordal third sound; the lean back to v
        // takes its own third, the leading tone, above the dominant root.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf(
              "harmony",
              ev(h, [3, -1], [5, -1]),
              ev(q, [5, -1], [7, -1]),
            ),
          ],
          [region(h, 3), region(q, 5, "minor")],
        ),
        // The melody's lower 7 is the root of VII, but the turn away from i is
        // the surprise, so the harmony doubles it with 2 before falling to v.
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(h, [7, -1], [2]), ev(q, [5, -1])),
          ],
          [region(h, 7), region(q, 5, "minor")],
        ),
        // Back on i, the melody states 1 outright and the single held root
        // carries the bar.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The descent 2-1-7 still sits on i, which the previous bar has just
        // placed, so the harmony drops out rather than restating a root the
        // melody is already spelling.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1, "minor")],
        ),
        // VI passes by on a bare root, and the cadential v takes the raised 7
        // beside its root so the pull to the final i is audible.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(q, [6, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(q, 6), region(h, 5, "minor")],
        ),
        // The tune arrives on a sustained 1, so the root below it adds nothing
        // new by itself; the minor third joins it to close the phrase in the
        // mode, where a fifth would only be drone-like.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
      ],
      "context-required",
      "The minor-mode cadence reaches 1, but its lower-7 and lower-6 emphasis makes it a contextual example.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
