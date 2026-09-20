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
        // The melody's 4 is the root of IV, so a lone 4 suffices; the turn to
        // V under 2 is open, so the leading tone joins the root there.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(q, [2]), ev(q, [2])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The tune holds 1 alone, so root and fifth fill out the midpoint
        // arrival.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
        // Repeated 5s sit comfortably over the tonic root; when the melody
        // reaches 6 the bass moves to 4 with its third, keeping the IV clear.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [6]), ev(q, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // 3 and 1 state I on their own, so a bare root holds; the melody's 2
        // leaves V open, so the leading tone sounds under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune rises 1–3 over the tonic root, then turns toward the
        // cadence on 2 and 7; the bass doubles that leading tone to drive the
        // resolution.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The held 1 is alone in the melody, so root and fifth close the tune.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated opening 1s, a midpoint tonic cadence, and the final leading-tone resolution identify home.",
      "independent",
    ),
  ],
);
