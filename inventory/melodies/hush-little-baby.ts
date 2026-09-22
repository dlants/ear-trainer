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

export const hushLittleBaby: CorpusMelody = melody(
  "hush-little-baby",
  "Hush, Little Baby",
  92,
  "traditional",
  "Traditional American lullaby in a widely sung folk form.",
  [
    phrase(
      [
        // The tune arpeggiates 1-3-5 and spells I by itself on the way up, so
        // nothing sounds under the climb; the root and chordal third arrive on
        // the held 5, where the melody alone is open between I and V, and they
        // sit just below the tune rather than down in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(h), ev(h, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is the chordal third of IV, so the lone root is
        // support enough, and since the tune stays at 3 and above the bass can
        // sit in its own octave. The return home steps 4 to 1 in that same
        // register under the melody's 3.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4]), ev(h, [1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The melody's 5-3 states I on its own, so a bare root holds the first
        // half; the extra note goes to the turn, where 2-1 gives V no evidence
        // and the leading tone supplies it.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The interior cadence. The leading tone has just sounded, so this V
        // takes a plain root; the arrival gets the chordal third instead, so
        // the fuller sound lands on I rather than becoming the mark of the
        // dominant.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [1])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The second verse restarts on the same arpeggio. The key is settled
        // and the tune spells the tonic triad outright, so the harmony steps
        // aside entirely rather than restating the opening voicing.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [3]), ev(q, [5]), ev(q, [5])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The same turn to IV, whose root sounds again because the melody's 6
        // leaves the bass as the only thing naming the chord. The step home is
        // left bare this time: the melody's 3 and the earlier 4-to-1 have
        // already taught this return.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4]), ev(h)),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The closing 2-3-2-1 hovers around the dominant without stating it, so
        // the leading tone comes back for the last approach; the resolution
        // takes a plain root, leaving the close to the final bar.
        polyBar(
          [
            voiceOf("melody", ev(q, [2]), ev(q, [3]), ev(q, [2]), ev(q, [1])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [1, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The final held 1, with the melody in its own octave forcing the bass
        // below it. The chordal third joins the root to close the lullaby; the
        // fifth would only thicken what the melody's 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The melody starts on 1, repeatedly descends to it, and finishes with two tonic events.",
      "independent",
    ),
  ],
);
