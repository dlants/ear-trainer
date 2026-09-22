import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  dq,
  e,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const silentNight: CorpusMelody = melody(
  "silent-night",
  "Silent Night",
  72,
  "public-domain",
  "Franz Xaver Gruber carol melody, composed in 1818.",
  [
    phrase(
      [
        // The opening 5-6-5 rocks around 5, which is common to I and V, so the
        // harmony sets the key outright with root and chordal third. The tune
        // never drops below 3 here, so both sit in its own octave rather than
        // down in the mud.
        polyBar3(
          [
            voiceOf("melody", ev(dq, [5]), ev(e, [6]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [1], [3])),
          ],
          [region(dh, 1)],
        ),
        // The tune comes to rest on 3 and spells the chordal third itself, so
        // the root alone completes I.
        polyBar3(
          [voiceOf("melody", ev(dh, [3])), voiceOf("harmony", ev(dh, [1]))],
          [region(dh, 1)],
        ),
        // The opening figure returns. The key is set and the first bar has
        // already spelled I, so this time only the root sounds; repeating the
        // third would teach the voicing instead of the tune.
        polyBar3(
          [
            voiceOf("melody", ev(dq, [5]), ev(e, [6]), ev(q, [5])),
            voiceOf("harmony", ev(dh, [1])),
          ],
          [region(dh, 1)],
        ),
        // The resting 3 comes back over a tonic that has been holding for three
        // bars, so the harmony steps aside and lets the melody state I.
        polyBar3(
          [voiceOf("melody", ev(dh, [3])), voiceOf("harmony", ev(dh))],
          [region(dh, 1)],
        ),
        // The melody's held 2 leaves V open, and this is the first turn away
        // from I, so the leading tone joins the root to name the chord.
        polyBar3(
          [
            voiceOf("melody", ev(h, [2]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // V is holding rather than turning, and the tune sings the leading tone
        // itself down here, so a bare dominant root underneath is enough.
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The melody arrives on 1 and states the tonic itself; the octave below
        // is a full sound already, and the tune goes on, so nothing more.
        polyBar3(
          [
            voiceOf("melody", ev(h, [1]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // A long lower 5 is open between I and V, but the melody has dropped
        // into the octave below, which forces the bass down with it; the held
        // tonic root fixes the bar as I.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [5, -1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune holds 4, the chordal root, which says nothing about quality,
        // so the harmony spends its extra note on this turn to IV and supplies
        // the third.
        polyBar3(
          [
            voiceOf("melody", ev(h, [4]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
          ],
          [region(dh, 4)],
        ),
        // The melody leaps to high 1 and falls to 7, sounding the leading tone
        // itself, so the cadential dominant needs only its root; doubling the
        // 7 would add nothing the ear is not already given.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1, 1]), ev(h, [7])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The 6-5-3 descent spells I on its own, so one held root suffices, and
        // it comes back up into the melody's octave now that the line has.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1])),
          ],
          [region(dh, 1)],
        ),
        // The ending. The melody holds 1 and states the root, so the chordal
        // third joins the bass to close the carol in major; a fifth would only
        // thicken what is already stated.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The later phrase states 1 in two registers and descends 6–5–3–1 to a long tonic.",
      "independent",
    ),
  ],
);
