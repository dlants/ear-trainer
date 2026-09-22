import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const greensleeves: CorpusMelody = melody(
  "greensleeves",
  "Greensleeves",
  76,
  "public-domain",
  "English Renaissance ballad tune, registered in 1580.",
  [
    phrase(
      [
        // The pickup 5 and held 1 outline the tonic, but nothing yet says
        // which mode, so the opening spends its extra note on the minor
        // third beside the root; the melody dips to lower 5, which puts the
        // bass in the octave below.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(q, [1, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The tune climbs 2-3-4 and keeps i sounding on its own; the harmony
        // is holding rather than turning, so the bare root stays put.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // This is the turn away from i, and the melody's 3 alone would read
        // as part of the tonic, so III takes its root with the 5 above it —
        // that 5 is III's third, which is what distinguishes it. v then
        // passes on a bare root under the melody's 2.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [3, -1], [5, -1]), ev(q, [5, -1])),
          ],
          [region(h, 3), region(q, 5, "minor")],
        ),
        // The melody sings VII's root and then v's root itself, so both
        // chords are already spelled from above: the bass takes VII's root an
        // octave below rather than doubling the tune in unison, and drops out
        // where the melody states 5.
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(q, [5, -1])),
            voiceOf("harmony", ev(h, [7, -2]), ev(q)),
          ],
          [region(h, 7), region(q, 5, "minor")],
        ),
        // The opening gesture returns; the mode is settled now, so the root
        // comes back alone instead of restating the third.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
        // The tune turns back down to 2 over the same unmoving i. The root has
        // just sounded and the melody circles the tonic, so the harmony rests
        // rather than restating a chord nobody has left.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(dh)),
          ],
          [region(dh, 1, "minor")],
        ),
        // The approach to the cadence: the melody only circles lower 7 and 6
        // and never leaves VII's own notes, so this is where the extra note is
        // worth spending — VII gets root and its third, then v takes a root to
        // lean the phrase home.
        polyBar3(
          [
            voiceOf("melody", ev(q, [7, -1]), ev(q, [6, -1]), ev(q, [7, -1])),
            voiceOf("harmony", ev(h, [7, -2], [2, -1]), ev(q, [5, -1])),
          ],
          [region(h, 7), region(q, 5, "minor")],
        ),
        // The close lands on a sustained 1 in the melody's own octave. This is
        // the ending rather than a way station, so the minor third joins the
        // root to name the mode one last time.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1, "minor")],
        ),
      ],
      "context-required",
      "The minor-mode tune frames 1 with lower 7 and 6; its tonic is clear in context but conservative practice should defer it.",
      "context-required",
    ),
  ],
  "minor-cadence",
);
