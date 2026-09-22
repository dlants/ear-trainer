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

export const mulberryBush: CorpusMelody = melody(
  "mulberry-bush",
  "Here We Go Round the Mulberry Bush",
  112,
  "traditional",
  "Traditional English singing-game tune documented in the nineteenth century.",
  [
    phrase(
      [
        // The opening 5s are open between I and V, so root and chordal third
        // sound under them to plant the key; once the tune falls to 3 and
        // spells I itself the harmony steps aside. The melody stays at 3 and
        // above, so the root sits in its own octave rather than the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(h, [1], [3]), ev(h)),
          ],
          [region(w, 1)],
        ),
        // The melody's 4 and held 2 leave V open, so the harmony spends its
        // extra note at the turn with the leading tone, then holds the bare
        // root while the dominant sits still.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [4]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The scalar climb 1–2–3–4 states I clearly, and the melody touching
        // its own 1 forces the bass into the octave below; a lone root there
        // is support enough.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody holds 5, which belongs to both I and V. Rather than
        // restate the earlier dominant voicing, the root carries the first
        // half and the leading tone arrives late, leaning into the I that
        // follows.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(w, 5)],
        ),
        // The tune arpeggiates 5–3–1–3, spelling the tonic triad outright, so
        // the harmony adds nothing but the root under it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody supplies the leading tone itself here, so the harmony
        // stands on a bare dominant root.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [7, -1])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The bar turns from I to V mid-measure, but the melody sings the
        // leading tone itself on the last beat, so plain roots stepping down a
        // fourth are all the turn needs.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The melody arrives on a sustained 1. This is the ending rather than
        // a way station, so the chordal third joins the root to close; a fifth
        // would only drone under a pitch the melody already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The closing strain uses 1 twice and resolves lower 7 to a sustained tonic.",
      "independent",
    ),
  ],
);
