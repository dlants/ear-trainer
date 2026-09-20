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

export const odeToJoy: CorpusMelody = melody(
  "ode-to-joy",
  "Ode to Joy",
  112,
  "public-domain",
  "Ludwig van Beethoven, Symphony No. 9 finale theme, 1824.",
  [
    phrase(
      [
        // The opening ascent 3-4-5 says little about the harmony on its own,
        // so the bass simply holds the tonic root under the whole bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The line falls 5-4-3-2; the second half leans dominant, so the bass
        // steps from 1 to 5 to mark the turn. Single roots are enough while
        // the melody is doing the work.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune states 1 twice and climbs back to 3, all tonic material, so
        // a held root is all the harmony needs to supply.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody rests on 2, which leaves V open, so the leading tone
        // joins the root here where the half cadence has to be heard.
        polyBar(
          [
            voiceOf("melody", ev(dq, [3]), ev(e, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
      ],
      "independent",
      "The balanced stepwise line clearly reaches 1 and returns through 2–3–2.",
      "independent",
    ),
    phrase(
      [
        // The same ascent returns over the same held tonic root.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The falling line again turns dominant halfway, and the bass follows
        // it with bare roots.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // Tonic material in the tune once more, supported by a single held
        // root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The closing 2–1 is the one place the accompaniment thickens
        // throughout: the leading tone drives the cadence and the fifth joins
        // the root to settle the final tonic.
        polyBar(
          [
            voiceOf("melody", ev(dq, [2]), ev(e, [1]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [5, -1]),
            ),
          ],
          [region(h, 5), region(h, 1)],
        ),
      ],
      "independent",
      "Repeated 1s prepare a final 2–1 cadence with a sustained tonic.",
      "independent",
    ),
  ],
);
