import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  e,
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

export const drunkenSailor: CorpusMelody = melody(
  "drunken-sailor",
  "What Shall We Do with a Drunken Sailor?",
  112,
  "traditional",
  "Traditional sea shanty documented in the nineteenth century.",
  [
    phrase(
      [
        // The call rocks on 5 and brushes 6, so it gives the ear the fifth and
        // a neighbour but never the quality of the chord. The downbeat supplies
        // root and third to fix the minor tonic, then thins to the bare root;
        // the melody stays at 5 and above, so the root sits in its own octave
        // rather than down in the mud.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5]),
              ev(q, [5]),
              ev(e, [5]),
              ev(e, [6]),
              ev(q, [5]),
            ),
            voiceOf("harmony", ev(h, [1], [3]), ev(h, [1])),
          ],
          [region(w, 1, "minor")],
        ),
        // The answer turns to VII, and the melody's 4 and 2 spell that chord
        // above its root, so the extra note is spent on the downbeat to mark
        // the turn and the rest of the bar holds a root just under the tonic.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(q, [7, -1], [2]), ev(dh, [7, -1])),
          ],
          [region(w, 7)],
        ),
        // The call comes back with the key already set, so this time the tonic
        // takes a single held root instead of restating its third.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5]),
              ev(q, [5]),
              ev(e, [5]),
              ev(e, [6]),
              ev(q, [5]),
            ),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1, "minor")],
        ),
        // The answering VII, voiced bare: the rocking has been heard once with
        // its third, and keeping the dyad off every VII stops thickness from
        // becoming the signal that the harmony has moved.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(w, [7, -1])),
          ],
          [region(w, 7)],
        ),
        // Now the tune climbs 1-2-3 and states the minor tonic triad itself, so
        // the bass simply holds its root underneath.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [1]),
              ev(e, [1]),
              ev(e, [2]),
              ev(q, [3]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1, "minor")],
        ),
        // The melody falls to lower 7. The bass takes the root first and adds
        // the 2 above in the second half, where the melody has come to rest and
        // the chord needs the extra colour to stay present.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(h, [7, -1])),
            voiceOf("harmony", ev(h, [7, -2]), ev(h, [7, -2], [2, -1])),
          ],
          [region(w, 7)],
        ),
        // The melody arpeggiates 6-5-7-2 and lays VII out on its own, so a
        // single sustained root is all the bar wants; the bass stays where the
        // previous bar left it rather than chasing the line.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [6, -1]),
              ev(q, [5, -1]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [7, -2])),
          ],
          [region(w, 7)],
        ),
        // The melody holds a bare 1 after two bars of VII, so the close needs
        // more than a doubled root; root and fifth land the modal tonic, and
        // the fifth rather than the third keeps the ending from arguing with
        // the tune's own modal colour.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1, "minor")],
        ),
      ],
      "context-required",
      "The modal minor-color strain emphasizes 5 and lower 7; its final 1 is clear only with the full context.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
