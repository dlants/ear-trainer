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

export const downInTheValley: CorpusMelody = melody(
  "down-in-the-valley",
  "Down in the Valley",
  76,
  "traditional",
  "Traditional American folk song and Appalachian standard.",
  [
    phrase(
      [
        // The pickup from lower 5 to a held 1 states the tonic, so a single
        // held bass root under it is all the harmony supplies.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody's 3 is the chordal third of I, so the bass keeps holding
        // its root while the tune steps down to 2.
        polyBar3(
          [
            voiceOf("melody", ev(h, [3]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The rise 1–2–3 outlines I on its own; the bass root is enough.
        polyBar3(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The melody holds 2, which leaves V open, so the harmony sounds the
        // leading tone at the turn and then thins to the bare dominant root.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The second verse opens like the first: pickup to 1 over a held tonic
        // root.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5, -1]), ev(h, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The tune arpeggiates 3–5–3 through I, so again only the root is
        // needed underneath.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [5]), ev(q, [3])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The neighbor figure 2–7–2 already hints at V, but the 5–7 dyad at
        // the turn makes the dominant plain before the close.
        polyBar3(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [7, -1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(q, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        // The long 1 closes the tune over a root-fifth dyad for weight.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Both lower-5 pickups resolve to 1 and the closing neighbor figure settles on a long tonic.",
      "independent",
    ),
  ],
);
