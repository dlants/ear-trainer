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
        // harmony adds the leading tone at the change; with the tune up at 3
        // the tonic root can sit in its own octave instead of the mud.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The line arpeggiates I and then rises to 6. The melody touching its
        // own 1 forces the tonic root into the octave below, and the turn to IV
        // is where the extra note is worth spending: 5–6 alone would not pin
        // the new chord down, so its third sounds too.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [6])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(h, 1), region(h, 4)],
        ),
        // The tune sustains 5, which is open between I and V, but IV has just
        // resolved back home, so a lone root settles it — and with the melody
        // high the root comes back up under it rather than staying low.
        polyBar(
          [voiceOf("melody", ev(w, [5])), voiceOf("harmony", ev(w, [1]))],
          [region(w, 1)],
        ),
        // The descent 5–3–1 spells I outright, so the harmony does no more than
        // hold the root; the melody's own 1 puts it back in the lower octave.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // A quick I–V–I turn under 3–2–1: the passing V takes the leading tone
        // with its root to mark the motion, while the tonic beats stay bare —
        // high under the melody's 3, low once the tune lands on 1 itself.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(q, [1]),
              ev(q, [5, -1], [7, -1]),
              ev(h, [1, -1]),
            ),
          ],
          [region(q, 1), region(q, 5), region(h, 1)],
        ),
        // The melody drops into the lower octave and sings the leading tone
        // itself, so the pre-cadence needs no thirds — they would collide with
        // the tune at the unison. Two bare roots stepping 4–5 under the line
        // are the clearest thing available down here.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [6, -1]),
              ev(q, [5, -1]),
              ev(q, [7, -1]),
              ev(q, [2]),
            ),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The final 1 is held. This is the ending rather than a way station and
        // the cadence before it was bare, so the chordal third joins the root
        // to close; a fifth would only thicken what the melody already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
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
