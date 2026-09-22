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

export const pollyPutTheKettleOn: CorpusMelody = melody(
  "polly-put-the-kettle-on",
  "Polly Put the Kettle On",
  112,
  "traditional",
  "Traditional English nursery tune, printed in the late eighteenth century.",
  [
    phrase(
      [
        // The tune drops 5 to a repeated 3, which spells I on its own, so a
        // single root is support enough; the melody never leaves the top of
        // its octave here, so that root sounds in the same octave rather than
        // down in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The first turn to V, with the melody resting on 2 and telling us
        // nothing about the chord: the leading tone sounds with the root where
        // the harmony turns, then the root alone holds it.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(h, [5, -1], [7, -1]), ev(h, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody climbs 1-2-3-4 through both chords, giving I its own
        // third on the way; its low 1 pulls the bass into the octave below,
        // and since the leading tone has just sounded, V takes a bare root.
        polyBar(
          [
            voiceOf("melody", ev(q, [1]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune sits on 5 for a whole bar, a note I and V share, so this is
        // where the harmony spends its extra note: root and third name the
        // chord as I, then the root holds alone once that is heard.
        polyBar(
          [
            voiceOf("melody", ev(h, [5]), ev(h, [5])),
            voiceOf("harmony", ev(h, [1], [3]), ev(h, [1])),
          ],
          [region(w, 1)],
        ),
        // The opening returns note for note. I has just been spelled out and
        // 5-3-3-3 states it again on its own, so the harmony steps aside
        // rather than restating a root the ear already holds.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [3]), ev(q, [3])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The answering V, bare this time: the phrase sounded its leading tone
        // at the first turn, and keeping the thicker voicing back stops a full
        // dominant from becoming the cue that V has arrived.
        polyBar(
          [
            voiceOf("melody", ev(q, [4]), ev(q, [2]), ev(h, [2])),
            voiceOf("harmony", ev(w, [5, -1])),
          ],
          [region(w, 5)],
        ),
        // The melody falls to lower 7 over V, singing the leading tone itself
        // and leaning home, so each chord needs only its root; the melody's
        // low 1 keeps the bass in the octave below.
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
        // The melody holds 1 for the close. This is the ending rather than a
        // way station, so the chordal third joins the root to settle it; the
        // fifth would only thicken what the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The latter half reaches 1 and closes with lower 7 resolving to a full-measure tonic.",
      "independent",
    ),
  ],
);
