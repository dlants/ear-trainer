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

export const ohSusanna: CorpusMelody = melody(
  "oh-susanna",
  "Oh! Susanna",
  108,
  "public-domain",
  "Stephen Foster song, first published in 1848.",
  [
    phrase(
      [
        // The tune opens by spelling the tonic triad and reaching to 6, so a
        // single held bass root is all the harmony has to supply.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [1]),
              ev(e, [2]),
              ev(q, [3]),
              ev(q, [5]),
              ev(q, [6]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // 5 then 3 are both chord tones of I; the held root keeps the bass
        // still under them.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The opening figure returns and settles onto 2; the tonic root holds
        // through, since the bar is still tonic.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [1]),
              ev(e, [2]),
              ev(q, [3]),
              ev(q, [3]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody rests on 2, which does not decide V, so the leading tone
        // joins the root to make the half cadence audible.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The refrain turns to IV under the repeated 6; 6 is the chordal
        // third, but this is the tune's first move away from I, so the third
        // sounds beneath it to mark the turn.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [6]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The line falls 5–3–1 and states I itself, so a lone held root is
        // enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody arrives on the leading tone; the bass states V with its
        // own leading tone first and then thins to the bare root as the
        // cadence prepares.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [2]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune holds 1 alone, so the harmony fills out the arrival with
        // root and fifth.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The opening starts on 1, the refrain lands on 1, and the final leading-tone motion resolves home.",
      "independent",
    ),
  ],
);
