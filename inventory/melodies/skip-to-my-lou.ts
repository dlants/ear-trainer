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

export const skipToMyLou: CorpusMelody = melody(
  "skip-to-my-lou",
  "Skip to My Lou",
  112,
  "traditional",
  "Traditional American partner-stealing dance song, documented in the nineteenth century.",
  [
    phrase(
      [
        // The tune's 5 and held 3 spell the tonic triad, so a single held root
        // is support enough. The melody stays at 3 and above in this bar, so
        // the root sounds in its own octave rather than down in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The bar repeats note for note; the harmony drops out rather than
        // restating the root, since the melody is still spelling I on its own
        // and the previous bar has already placed the chord.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(h, [3])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The descent 5–4–3–2 leaves V open, so the harmony spends its extra
        // note at the turn with the leading tone, then holds the bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(q, [3]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The long 1 arrives, and the melody reaching its own root forces the
        // bass into the octave below. That octave is a full sound already; the
        // tune goes on afterwards, so this interior arrival wants no more.
        polyBar(
          [voiceOf("melody", ev(w, [1])), voiceOf("harmony", ev(w, [1, -1]))],
          [region(w, 1)],
        ),
        // The rising 1–3–5 arpeggiates the tonic outright, straight out of a
        // tonic bar, so nothing needs to sound underneath it.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(h, [5])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The passing 4 resolves straight back to the held 3, so I needs no
        // more than its root, which comes back up to the melody's octave now
        // that the line has left the bottom of it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [4]), ev(h, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody sings the leading tone itself on the last beat, leaning
        // home, so doubling it would add nothing: a bare dominant root under
        // the whole bar is enough, and the earlier V has already been spelled
        // out.
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
        // The final long 1. This is the ending rather than a way station, so
        // the chordal third joins the root to close; the fifth would only
        // thicken what the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The first half cadences on 1 and the ending repeats a lower-7-to-1 tonic resolution.",
      "independent",
    ),
  ],
);
