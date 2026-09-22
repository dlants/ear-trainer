import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  dq,
  e,
  ev,
  melody,
  phrase,
  polyBar6,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const popGoesTheWeasel: CorpusMelody = melody(
  "pop-goes-the-weasel",
  "Pop Goes the Weasel",
  116,
  "traditional",
  "Traditional English dance and nursery tune, published in the 1850s.",
  [
    phrase(
      [
        // The tune runs 1-1-2-2: I is spelled by the melody, and the 2 leaves
        // the turn open, so the dance bass walks a bare root per dotted-quarter
        // beat. The melody touches its own 1 here, which forces the octave
        // below.
        polyBar6(
          [
            voiceOf("melody", ev(q, [1]), ev(e, [1]), ev(q, [2]), ev(e, [2])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        // The melody outlines 3-5-3, the upper reaches of I, so one held root
        // is support enough, and since the line stays at 3 and above the root
        // comes up into the melody's own octave rather than the muddy one.
        polyBar6(
          [
            voiceOf("melody", ev(q, [3]), ev(e, [5]), ev(dq, [3])),
            voiceOf("harmony", ev(dh, [1])),
          ],
          [region(dh, 1)],
        ),
        // The run-up returns. The tonic is settled by now, so the extra note
        // goes where the harmony turns: the dominant takes its leading tone
        // with the root, and I keeps walking bare.
        polyBar6(
          [
            voiceOf("melody", ev(q, [1]), ev(e, [1]), ev(q, [2]), ev(e, [2])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1], [7, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        // Melody 3 then 1 spells the tonic triad on its own, so the bass simply
        // holds its root; the tune's own 1 keeps it in the lower octave.
        polyBar6(
          [
            voiceOf("melody", ev(dq, [3]), ev(dq, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // Third statement of the run-up, and the last before the strain turns.
        // This time the tonic gets its third and the dominant is left bare, so
        // that weight does not become the signal that V has arrived.
        polyBar6(
          [
            voiceOf("melody", ev(q, [1]), ev(e, [1]), ev(q, [2]), ev(e, [2])),
            voiceOf("harmony", ev(dq, [1, -1], [3, -1]), ev(dq, [5, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        // The melody again covers I with 3-5, but its lift to 6 is only the
        // third of IV, so the harmony holds a lone tonic root and spends root
        // and third on the chord that turns.
        polyBar6(
          [
            voiceOf("melody", ev(q, [3]), ev(e, [5]), ev(dq, [6])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [4, -1], [6, -1])),
          ],
          [region(dq, 1), region(dq, 4)],
        ),
        // The melody sings 2 and then the lower 7 itself, leaning home, so
        // doubling that leading tone would add nothing: V holds a bare root
        // under the whole bar and lets the snap come from the tune.
        polyBar6(
          [
            voiceOf(
              "melody",
              ev(q, [5]),
              ev(e, [3]),
              ev(q, [2]),
              ev(e, [7, -1]),
            ),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The long 1 that ends the dance. The melody states the root itself, so
        // the chordal third joins the bass root to close; a fifth would only
        // thicken what is already there.
        polyBar6(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Each strain starts on 1, and the final lower-7-to-1 snap is a strong tonic resolution.",
      "independent",
    ),
  ],
);
