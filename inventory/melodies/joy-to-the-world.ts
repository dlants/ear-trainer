import type { CorpusMelody } from "../../music/melody.ts";
import {
  dq,
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

export const joyToTheWorld: CorpusMelody = melody(
  "joy-to-the-world",
  "Joy to the World",
  112,
  "public-domain",
  "Lowell Mason's 1836 hymn tune Antioch, drawing on earlier Handelian material.",
  [
    phrase(
      [
        // The descending scale from upper 1 carries the tune on its own, so
        // the left hand stays out of its way with a single held bass root.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1, 1]),
              ev(q, [7]),
              ev(q, [6]),
              ev(q, [5]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The scale lands on 2, which leaves V open, so the leading tone
        // sounds with the bass root before the bare root holds the bar out.
        polyBar(
          [
            voiceOf("melody", ev(dq, [4]), ev(e, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody rises 1-2-3 through the tonic chord, so a held bass root
        // is enough.
        polyBar(
          [
            voiceOf("melody", ev(dq, [1]), ev(e, [2]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The harmony turns to V mid-bar and the melody's 5 is open between
        // the chords, so the leading tone joins the dominant root.
        polyBar(
          [
            voiceOf("melody", ev(dq, [3]), ev(e, [4]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // A whole bar of V under a busy descent: the leading tone states the
        // chord at the downbeat, then the root alone keeps the texture clear.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [5]),
              ev(e, [6]),
              ev(e, [5]),
              ev(e, [4]),
              ev(q, [3]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody itself states 1 and then 5, spelling I, so the bass just
        // holds its root.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's lower 7 needs the dominant under it, so the second half
        // takes root and leading tone as the phrase turns toward the cadence.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds 1 alone, so the closing chord adds the fifth to
        // round off the cadence.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The opening scale descends from upper 1 and the final phrase returns twice to home.",
      "independent",
    ),
  ],
);
