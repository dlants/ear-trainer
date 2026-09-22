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
        // The scale from upper 1 names every degree but never sounds 3, and
        // the tune sits high enough that root and third fit comfortably under
        // it in the melody's own octave rather than down in the mud.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1, 1]),
              ev(q, [7]),
              ev(q, [6]),
              ev(q, [5]),
            ),
            voiceOf("harmony", ev(w, [1], [3])),
          ],
          [region(w, 1)],
        ),
        // The melody's 4–3–2 could belong to either chord, so the turn to V
        // takes the leading tone with its root on the downbeat and then lets
        // the bare root hold the bar out.
        polyBar(
          [
            voiceOf("melody", ev(dq, [4]), ev(e, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The line has dropped to 1–2–3 in its own octave, forcing the root
        // into the octave below; the melody arpeggiates I by itself, so that
        // bare root is all the support it wants.
        polyBar(
          [
            voiceOf("melody", ev(dq, [1]), ev(e, [2]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 3 states I outright, so the tonic half needs only its
        // root; the held 5 is the dominant's own root and says nothing about
        // the turn, so the leading tone sounds there instead.
        polyBar(
          [
            voiceOf("melody", ev(dq, [3]), ev(e, [4]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // V holds for the whole bar rather than turning, and the leading tone
        // has already been sounded twice, so a single sustained root keeps the
        // busy 5–6–5–4–3–2 descent clear.
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
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody states 1 and then falls to 5 beneath the accompaniment's
        // range; rather than chase it into a muddier octave the harmony holds
        // the root over the downbeat and then steps aside, since 1 and 5 have
        // spelled I already.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h)),
          ],
          [region(w, 1)],
        ),
        // Coming out of the bar where the harmony dropped out, the tonic half
        // is restated with root and third; the melody then sings the leading
        // tone itself, so the dominant needs no more than its root.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [2]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [1, -1], [3, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody holds 1 alone at the ending, so the third joins the root
        // to close; the fifth would only thicken what the tune already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
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
