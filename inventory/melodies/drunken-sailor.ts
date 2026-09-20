import type { CorpusMelody } from "../../music/melody.ts";
import {
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
        // The call sits on 5, which is open between i and other chords, but the
        // shanty only ever rocks between i and VII, so a single held root is
        // all the harmony the tonic side needs.
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
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1, "minor")],
        ),
        // The answer turns to VII, where the harmony actually moves, so the
        // extra note is spent here: 7 with 2 above it marks the turn, then
        // thins back to the bare root once the ear has it.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [7, -2], [2, -1]), ev(h, [7, -2])),
          ],
          [region(w, 7)],
        ),
        // The call repeats, and so does its lone tonic root; the melody's
        // insistent 5 needs nothing more under it.
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
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1, "minor")],
        ),
        // The answering VII again takes the dyad on its downbeat, keeping the
        // alternation audible as a real harmonic rocking rather than a pedal.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [7, -2], [2, -1]), ev(h, [7, -2])),
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
        // The melody arpeggiates VII across the whole bar, so one sustained
        // root under it is enough.
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
        // The melody holds a bare 1, which alone says little after so much VII,
        // so the close gets root and fifth to land the modal tonic firmly.
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
