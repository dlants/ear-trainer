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
        // The ascent 3–3–4–5 could belong to I or vi, so the harmony names the
        // key with a plain tonic root. The melody never drops below 3, so that
        // root sits just under it rather than down in the octave below.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The descent 5–4–3–2 holds I and then leans dominant; the turn is
        // where the harmony moves, but the half cadence two bars later is the
        // one that has to be heard, so V takes a bare root here.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune states 1 twice and climbs back through 2 to 3, spelling I
        // by itself. The melody's own 1 forces the bass into the octave below,
        // where a single root is a full enough sound.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody settles on 2, which leaves V open, so the leading tone
        // joins the dominant root where the half cadence has to land; the
        // first half only needs the tonic root back up under the melody.
        polyBar(
          [
            voiceOf("melody", ev(dq, [3]), ev(e, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
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
        // The same ascent returns, and the key no longer needs stating: the
        // root is struck once and then lets go, so the repeat is heard as a
        // repeat rather than as the same accompaniment stamped again.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [3]), ev(q, [4]), ev(q, [5])),
            voiceOf("harmony", ev(h, [1]), ev(h)),
          ],
          [region(w, 1)],
        ),
        // The falling line turns dominant again. This time the tonic half gets
        // its third, which the melody's 5–4 leaves open, while V stays on its
        // bare root so the thicker sound is not what signals the dominant.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1], [3]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // Tonic material in the tune once more, but the phrase is heading for
        // its close, so the low root takes the chordal third at the downbeat
        // before thinning back out.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [1]), ev(q, [2]), ev(q, [3])),
            voiceOf("harmony", ev(h, [1, -1], [3, -1]), ev(h, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The closing 2–1: the leading tone drives the dominant, and the final
        // tonic takes the third rather than the fifth, since the melody's own
        // sustained 1 already states root and the third says more.
        polyBar(
          [
            voiceOf("melody", ev(dq, [2]), ev(e, [1]), ev(h, [1])),
            voiceOf(
              "harmony",
              ev(h, [5, -1], [7, -1]),
              ev(h, [1, -1], [3, -1]),
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
