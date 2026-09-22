import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  ev,
  melody,
  phrase,
  polyBar3,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const minuetInG: CorpusMelody = melody(
  "minuet-in-g",
  "Minuet in G",
  100,
  "public-domain",
  "Christian Petzold, Minuet in G major from the 1725 Notebook for Anna Magdalena Bach.",
  [
    phrase(
      [
        // The melody climbs 5–1–2 and names the tonic itself, but nothing has
        // established the key yet, so root and third sound together in the
        // melody's own octave rather than down in the mud.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [1, 1]), ev(q, [2, 1])),
            voiceOf("harmony", ev(dh, [1], [3])),
          ],
          [region(dh, 1)],
        ),
        // The run 3–4–5 keeps climbing over an unchanged I. The harmony is
        // holding rather than turning, so the root alone carries the bar.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3, 1]), ev(q, [4, 1]), ev(q, [5, 1])),
            voiceOf("harmony", ev(dh, [1])),
          ],
          [region(dh, 1)],
        ),
        // The tune drops an octave and arpeggiates 1–2–3, spelling I on its
        // own; the bass follows it down to the octave below and holds a bare
        // root, since the melody is forcing the register, not the voicing.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The first move away from home: 4–5–6 could still be heard over I, so
        // the harmony spends its extra note at the turn and gives IV both its
        // root and its third.
        polyBar3(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(dh, [4, -1], [6, -1])),
          ],
          [region(dh, 4)],
        ),
        // The melody descends the tonic triad 5–3–1 and states I outright, so
        // the return home needs no more than its root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The turn to V, which the melody's 2–3–4 leaves open: root and leading
        // tone together name the dominant as it arrives.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        // V holds, and the melody falls to the lower 7 and sings the leading
        // tone for itself, so doubling it would add nothing; the bare dominant
        // root keeps the pull in the tune where it belongs.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [7, -1])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The sustained 1 closes the tune. This is the ending rather than a way
        // station, so the chordal third joins the root; a fifth here would only
        // drone under a tonic the melody already states.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The closing half descends through the tonic triad and resolves lower 7 to a sustained 1.",
      "independent",
    ),
  ],
);
