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

export const farmerInTheDell: CorpusMelody = melody(
  "farmer-in-the-dell",
  "The Farmer in the Dell",
  108,
  "traditional",
  "Traditional German-American singing-game tune, widespread in the nineteenth century.",
  [
    phrase(
      [
        // Six hammered 1s tell the listener the note but not the chord, so the
        // opening bar states I outright with root and third; the melody sits at
        // 1, which forces the accompaniment into the octave below.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [1]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The rise 1-2-3 spells I in the tune itself, so the bar thins to a
        // bare root; the chord has just been sounded and is not turning.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The turnaround 3-2-1-2 keeps circling the tonic with nothing in
        // doubt, so the root holds still under it rather than restating I.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // A long 3 is the chordal third of I, so the root alone completes it,
        // and with the melody clear of 1 the root comes up into its own octave
        // instead of sitting in the mud.
        polyBar(
          [voiceOf("melody", ev(w, [3])), voiceOf("harmony", ev(w, [1]))],
          [region(w, 1)],
        ),
        // Here the harmony turns for the first time: 3-4-5 is open between I
        // and V, so the tonic half stays a bare root and the extra note is
        // spent at the turn, the leading tone beside the dominant root.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [4]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // Coming back the other way, the melody's 5 and landing 3 name both
        // chords itself, so each half takes only its root, and the return to I
        // steps back up to the melody's octave.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The melody sings the leading tone itself on the last beat, so
        // doubling it would add nothing; V holds rather than turns, and a bare
        // dominant root is context enough after the earlier spelled-out V.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune lands on a bare long 1. This is the ending, so the chordal
        // third joins the root to close; the fifth would only thicken what the
        // melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Six opening tonic attacks and a final lower-7-to-1 cadence give strong evidence for home.",
      "independent",
    ),
  ],
);
