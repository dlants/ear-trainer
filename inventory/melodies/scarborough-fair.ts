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

export const scarboroughFair: CorpusMelody = melody(
  "scarborough-fair",
  "Scarborough Fair",
  80,
  "traditional",
  "Traditional English ballad tune in a common Dorian-inflected form.",
  [
    phrase(
      [
        // The tune opens by stating 1 and 5 itself, so i needs no more than a
        // single sustained bass root a step below the melody.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The melody's 2 belongs to VII but says nothing about it on its own,
        // so the harmony spends its extra note on the turn: root and third a
        // step down from the opening bass, then the bare root.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [7, -1], [2, -1]), ev(q, [7, -1])),
          ],
          [region(dh, 7)],
        ),
        // The melody circles 3 and 4, so III is already audible; one sustained
        // bass 3 is support enough.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [3, -1])),
          ],
          [region(dh, 3)],
        ),
        // The held 2 is the dominant's fifth and leaves the chord otherwise
        // open, so the harmony names v with root and third before thinning to
        // the root for the rest of the held note.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5, "minor")],
        ),
        // The melody arpeggiates the minor tonic itself, 1 down to lower 5 and
        // back, so the harmony stays out of the way rather than restating a
        // root the tune has already framed — and avoids chasing it downward.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [5, -1]), ev(q, [1])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1, "minor")],
        ),
        // The tune leans on 2 and only brushes 3, and this is where the modal
        // line turns away from the tonic, so III gets root and third on the
        // downbeat before thinning to its root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [3, -1], [5, -1]), ev(q, [3, -1])),
          ],
          [region(dh, 3)],
        ),
        // Here the melody spells VII outright with its own lower 7 and 2, so
        // unlike its first appearance the chord needs nothing but a root; the
        // melody's dip forces that root into the octave below.
        polyBar3(
          [
            voiceOf("melody", ev(q, [7, -1]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [7, -2])),
          ],
          [region(dh, 7)],
        ),
        // The line arrives on a long 1. This is the ending, so the chordal
        // third joins the root and names the tonic as minor; a fifth would only
        // drone under a degree the melody is already holding.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
      ],
      "context-required",
      "The modal line begins and ends on 1, but its persistent 2 and lower 7 make beginner tonic evidence less direct.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
