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

export const lochLomond: CorpusMelody = melody(
  "loch-lomond",
  "The Bonnie Banks o' Loch Lomond",
  80,
  "traditional",
  "Traditional Scottish song, first published in the nineteenth century.",
  [
    phrase(
      [
        // The pickup climbs from the lower 5 to repeated 1s, so the tune states
        // I on its own and the harmony only holds a single bass root.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [5, -1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 3 covers I, but its 2 leaves the turn to V open, so the
        // harmony adds the leading tone to the root exactly where the chord
        // changes.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The line arpeggiates I and then rises to 6; the bass holds the tonic
        // root and then supplies IV with its root and third, since the melody's
        // 5–6 alone would not pin the new chord down.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The tune sustains 5 over I, which is open between I and V, but the
        // approach has just settled the tonic, so a lone held root keeps it
        // there.
        polyBar(
          [voiceOf("melody", ev(w, [5])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The descent 5–3–1 spells I outright, so the harmony again does no
        // more than hold the root beneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // A quick I–V–I turn under 3–2–1: the passing V gets the leading tone
        // with its root to mark the motion, and the tonic beats either side
        // stay on bare roots.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(q, [1, -1]),
              ev(q, [5, -1], [7, -1]),
              ev(h, [1, -1]),
            ),
          ],
          [region(q, 1), region(q, 5), region(h, 1)],
        ),
        // The melody drops into the lower octave and gives no chord tones that
        // separate IV from V, so each half takes root and third to make the
        // pre-cadential turn audible.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [6, -1]),
              ev(q, [5, -1]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf(
              "harmony",
              ev(h, [4, -1], [6, -1]),
              ev(h, [5, -1], [7, -1]),
            ),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The final 1 is held; the root-fifth dyad lets the ending ring open
        // rather than adding a third above the tune.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The lower-5 pickup reaches 1, the later descent lands there, and the final phrase sustains tonic.",
      "independent",
    ),
  ],
);
