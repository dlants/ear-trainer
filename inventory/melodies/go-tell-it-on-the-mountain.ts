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

export const goTellItOnTheMountain: CorpusMelody = melody(
  "go-tell-it-on-the-mountain",
  "Go Tell It on the Mountain",
  100,
  "traditional",
  "Traditional African American spiritual, collected and published in the nineteenth century.",
  [
    phrase(
      [
        // The opening 5–5–3–1 spells I on its own, so the harmony holds a
        // single root under it and saves its second notes for the turns.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone sounds under it;
        // the answering 1 is a real resolution, so the chordal third joins the
        // root there rather than leaving every tonic a bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [3, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The tune sits on 5 throughout, which fits I, IV and V alike, so the
        // harmony has to name the change: a lone tonic root, then 4 with its
        // third under the neighbouring 6, then the dominant root.
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
        ),
        // The melody's 3 states I, and the half cadence on 2 is open, so the
        // leading tone joins 5 to make the dominant arrival unmistakable.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The climb 1–3–5 outlines the tonic triad, so one held root carries
        // three beats; the 6 turns to IV, where the third is worth the note.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(dh, [1, -1]), ev(q, [4, -1], [6, -1])),
          ],
          [region(dh, 1), region(q, 4)],
        ),
        // The descent to a held 1 states the tonic outright, so the harmony
        // returns to a single root under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody circles 2–3–2 and drops to lower 7, which pulls but does
        // not name the chord; the harmony supplies 5 with its leading tone and
        // then holds the bare root as the pull carries into the close.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The final held 1. The melody states the root itself, so the harmony
        // closes with root and third; the fifth would only thicken what is
        // already there.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "A 5–3–1 opening descent, repeated 1s, and the final lower-7 resolution identify tonic.",
      "independent",
    ),
  ],
);
