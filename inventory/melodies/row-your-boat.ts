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

export const rowYourBoat: CorpusMelody = melody(
  "row-your-boat",
  "Row, Row, Row Your Boat",
  104,
  "traditional",
  "Traditional English-language round, printed in nineteenth-century American song collections.",
  [
    phrase(
      [
        // The tune opens on bare repeated 1s, which name a pitch but not a
        // chord, so the harmony sets the key with root and chordal third. The
        // melody sits on 1 itself, so the bass has to take the octave below.
        polyBar6(
          [
            voiceOf("melody", ev(dq, [1]), ev(dq, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
        // The rise 1-2-3 lands on the chordal third, so the melody spells I on
        // its own and the harmony can drop out entirely rather than restate
        // what the opening bar has already placed.
        polyBar6(
          [
            voiceOf("melody", ev(q, [1]), ev(e, [2]), ev(dq, [3])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1)],
        ),
        // The line circles 3-2-3 over I and then leans on 4, which is where the
        // harmony turns. I gets root and third while the melody is high enough
        // to leave room, and the dominant takes a bare root, since 4 falling to
        // 5 carries the motion by itself.
        polyBar6(
          [
            voiceOf("melody", ev(q, [3]), ev(e, [2]), ev(q, [3]), ev(e, [4])),
            voiceOf("harmony", ev(dq, [1, -1], [3, -1]), ev(dq, [5, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        // The held 5 is the tonic's fifth; the melody is up in its own octave,
        // so the root comes up with it instead of staying in the mud. Doubling
        // the fifth would only thicken the note the tune is already singing.
        polyBar6(
          [voiceOf("melody", ev(dh, [5])), voiceOf("harmony", ev(dh, [1]))],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Three opening tonic attacks establish 1 before the line rises to 5.",
      "independent",
    ),
    phrase(
      [
        // The melody rings upper 1 then 5, spelling the tonic outright and
        // staying high, so one root under it in the melody's own octave is
        // support enough.
        polyBar6(
          [
            voiceOf(
              "melody",
              ev(e, [1, 1]),
              ev(e, [1, 1]),
              ev(e, [1, 1]),
              ev(e, [5]),
              ev(e, [5]),
              ev(e, [5]),
            ),
            voiceOf("harmony", ev(dh, [1])),
          ],
          [region(dh, 1)],
        ),
        // The descent 3-3-3-1-1-1 gives the third and the root of I in the tune
        // itself. Nothing sounds here: the harmony is holding rather than
        // turning, and the silence keeps the bass from leaping an octave after
        // the melody.
        polyBar6(
          [
            voiceOf(
              "melody",
              ev(e, [3]),
              ev(e, [3]),
              ev(e, [3]),
              ev(e, [1]),
              ev(e, [1]),
              ev(e, [1]),
            ),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1)],
        ),
        // The closing descent 5-4-3-2. I is plain under 5-4, so a bare root
        // carries it; the cadential V is the one place the phrase has left
        // unnamed, and the leading tone joins its root there.
        polyBar6(
          [
            voiceOf("melody", ev(q, [5]), ev(e, [4]), ev(q, [3]), ev(e, [2])),
            voiceOf("harmony", ev(dq, [1, -1]), ev(dq, [5, -1], [7, -1])),
          ],
          [region(dq, 1), region(dq, 5)],
        ),
        // The tune ends on a bare 1. This is the close rather than a way
        // station, so the chordal third sounds with the root below to settle
        // the mode; the fifth would add weight without adding meaning.
        polyBar6(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Repeated upper and home-register 1s lead to the closing 5–4–3–2–1 descent.",
      "independent",
    ),
  ],
);
