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

export const godRestYeMerryGentlemen: CorpusMelody = melody(
  "god-rest-ye-merry-gentlemen",
  "God Rest Ye Merry, Gentlemen",
  96,
  "traditional",
  "Traditional English carol melody in a minor mode, printed in the nineteenth century.",
  [
    phrase(
      [
        // The tune rises lower 5 to 1 and touches lower 7, outlining i itself,
        // so a single held bass root is all the harmony needs to supply.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1, "minor")],
        ),
        // The melody's held 3 is the chordal root of III, so the harmony just
        // steps the bass 1–3 under it; one note reads the turn clearly.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(h, [3])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [3, -1])),
          ],
          [region(h, 1, "minor"), region(h, 3)],
        ),
        // The melody's 4 could belong to iv or ii°, so this first move to iv
        // gets its third alongside the root; the return to i needs only the
        // root, since the descent lands on 1.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4, "minor"), region(h, 1, "minor")],
        ),
        // The mid-point rest on lower 5 is open, so the leading tone joins the
        // dominant root on its arrival and the bass then holds bare.
        polyBar(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5, "minor")],
        ),
        // The climb 1–3–5 spells the minor tonic, so one held root covers three
        // beats; the melody's 4 turns to iv, and by now a bare root reads.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [1, -1]), ev(q, [4, -1])),
          ],
          [region(dh, 1, "minor"), region(q, 4, "minor")],
        ),
        // The 3–2–1 descent states i on its own, so the harmony returns to a
        // single sustained root beneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1, "minor")],
        ),
        // The melody circles lower 7 and 6 around the subtonic, so the bass
        // takes 7 plainly first and adds the chordal third as the melody leaps
        // to 2, marking the VII that drives the cadence.
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
        // The final held 1 closes with root and fifth: the cadence is worth the
        // fuller sound, and the open fifth leaves the mode to the melody.
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
