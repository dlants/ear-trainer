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

export const awayInAManger: CorpusMelody = melody(
  "away-in-a-manger",
  "Away in a Manger",
  80,
  "public-domain",
  "Nineteenth-century American carol melody commonly called Mueller.",
  [
    phrase(
      [
        // The tune states 1 itself and then steps up to 4, so a single bass
        // root sets the key; the melody sits on its own 1, which forces the
        // root into the octave below it.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The held 3 spells I on its own, so the root carries it; the quarter
        // of V passes quickly and the melody's 2 is its fifth, so the bass
        // simply steps down to the dominant root rather than naming it.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // Coming back from V is the turn in this half, so the extra note goes
        // here: root and chordal third name the return of I, then the harmony
        // thins to the root as the melody leaps to 5 and spells the chord.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5])),
            voiceOf("harmony", ev(q, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // A whole bar on a held 4 says nothing about V, so the harmony has to
        // supply it outright: root and leading tone sound through the bar.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [4])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody's repeated 3 hands I its own third, so a bare root is
        // enough, and it comes up into the melody's octave now that the line
        // has left the bottom. The reach to 6 gives IV its third the same way,
        // so that chord too needs only its root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1]), ev(q, [4])),
          ],
          [region(h, 1), region(q, 4)],
        ),
        // The melody's 5 keeps I ambiguous and its 4 leans over V without
        // belonging to it, so the harmony turns here: a root under the tonic
        // half, then root and leading tone as the dominant arrives.
        polyBar3(
          [
            voiceOf("melody", ev(h, [5]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1]), ev(q, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // The tune descends 3–2 to the leading tone itself, so doubling that
        // leading tone would add nothing; a held dominant root under the whole
        // approach is context enough.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The carol ends on a held 1. This is the close rather than a way
        // station, so the chordal third joins the root; the fifth would only
        // thicken what the melody's own 1 already states.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s and the final 3–2–lower-7–1 descent provide clear tonic evidence.",
      "independent",
    ),
  ],
);
