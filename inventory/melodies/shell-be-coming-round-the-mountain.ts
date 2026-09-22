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

export const shellBeComingRoundTheMountain: CorpusMelody = melody(
  "shell-be-coming-round-the-mountain",
  "She'll Be Coming 'Round the Mountain",
  116,
  "traditional",
  "Traditional American folk song derived from the spiritual ‘When the Chariot Comes’.",
  [
    phrase(
      [
        // The pickup and the repeated 1s state the tonic outright, so a single
        // held bass root under the whole bar is all the harmony owes it.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(e, [5, -1]),
              ev(e, [6, -1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody sits on 3, the chordal third, so a bare root is support
        // enough; with the tune off the bottom of its range the root comes up
        // into the melody's own octave instead of staying in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 leaves V open, so the leading tone joins the root
        // where the harmony turns; the return to I needs only a bare root, and
        // the tune's 2–3 lets it sit high rather than an octave down.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The melody's held 1 forces the root into the octave below it; the
        // drop to lower 5 only doubles the dominant's root, so the leading tone
        // is what actually names V at the half cadence.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody arpeggiates I outright as 1–1–3–5, so the harmony steps
        // aside entirely rather than restating a root the tune is spelling, and
        // the accompaniment avoids teaching that every tonic bar carries a bass
        // note.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [3]), ev(q, [5])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the subdominant's third only by accident of the
        // scale, so the move away from home takes root and third to name IV;
        // the return to I is carried by the tune's own 3 over a plain root.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The tune sings the leading tone itself on the last beat, so doubling
        // it would add nothing; a bare dominant root holds the whole bar, and
        // the earlier V has already been spelled out with its third.
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
        // The whole-note 1 lands home. This is the ending rather than a way
        // station, so the chordal third joins the root to close; a fifth would
        // only thicken what the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Repeated 1s establish home immediately and the ending resolves lower 7 to 1.",
      "independent",
    ),
  ],
);
