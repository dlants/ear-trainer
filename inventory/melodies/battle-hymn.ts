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

export const battleHymn: CorpusMelody = melody(
  "battle-hymn",
  "Battle Hymn of the Republic",
  108,
  "public-domain",
  "Traditional American camp-meeting tune used for ‘John Brown's Body’ and Julia Ward Howe's 1862 hymn.",
  [
    phrase(
      [
        // Three tonic attacks state I outright, so the marching left hand only
        // needs a single bass root beneath them.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [1]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The tune climbs 1–2–3 through the chord, so the bass root simply
        // holds.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The descent back to 1 keeps stating I; a lone root under it is
        // enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 2 and lower 5 leave V open, so the leading tone sounds
        // with the root before the bass thins back to a single note.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [5, -1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The arpeggio 1–3–5 spells I by itself, leaving the bass root to hold.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The turn to IV is the one thing the melody's 6 cannot pin down, so
        // the chordal third joins the root there before the return to I.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The 2–3–2–lower-7 approach needs the dominant spelled out, so the
        // leading tone sounds under the first half of the cadence bar.
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
        // The melody lands on a long 1; root and fifth close the hymn.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [5, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "Three initial tonic attacks and a final lower-7-to-1 cadence provide strong tonic evidence.",
      "independent",
    ),
  ],
);
