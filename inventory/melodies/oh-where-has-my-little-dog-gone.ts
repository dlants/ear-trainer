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

export const ohWhereHasMyLittleDogGone: CorpusMelody = melody(
  "oh-where-has-my-little-dog-gone",
  "Oh Where, Oh Where Has My Little Dog Gone?",
  104,
  "public-domain",
  "Septimus Winner song, published in 1864, based on an older German folk melody.",
  [
    phrase(
      [
        // The tune states 1 and 5 itself, so the bass only has to hold the
        // tonic root under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the first departure from I; the 4 and its third
        // sound beneath it so the IV reading is unmistakable, then the bass
        // steps back to a bare 1 as the tune settles on 3.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody's repeated 4 is the root of IV, so a lone 4 under it
        // suffices; the turn to V is the tune's first, and 2 leaves its
        // quality open, so the leading tone joins the root to spell it once.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The tune holds 1 alone with nothing of the chord but its root, so
        // the harmony supplies the chordal third at the midpoint arrival; the
        // fifth would only thicken what the melody already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // Repeated 5s sit comfortably over the tonic root; the melody's 6
        // turns to IV again, but the earlier bar has already sounded that
        // chord's third, so the bass moving to a bare 4 is context enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // 3 and 1 spell I outright, so the harmony stays silent there rather
        // than restating it, and enters on the bass root as the melody's 2
        // turns the phrase toward V.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(h, [2])),
            voiceOf("harmony", ev(h), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune rises 1–3 over the tonic root, then sings the leading tone
        // itself into the cadence; doubling it would add nothing, so the
        // dominant takes a plain root under the second half.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds 1 in its own octave, and the root an octave below
        // it is already a full sound after the leading tone has resolved; the
        // midpoint arrival took the third, so the close keeps the bare octave.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final leading-tone resolution identify home.",
      "independent",
    ),
  ],
);
