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

export const oComeAllYeFaithful: CorpusMelody = melody(
  "o-come-all-ye-faithful",
  "O Come, All Ye Faithful",
  96,
  "public-domain",
  "Eighteenth-century Latin carol melody traditionally attributed to John Francis Wade.",
  [
    phrase(
      [
        // The melody's 1 and 5 outline the tonic but leave its third unsaid,
        // and the opening is where the key gets set, so root and third sound
        // together. The melody's own 1 forces them into the octave below.
        polyBar(
          [
            voiceOf("melody", ev(h, [1]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
        // The same 1–5 an octave up repeats evidence the ear already has, so a
        // bare root is enough, and it comes up into the melody's octave now
        // that the tune has left the bottom of it.
        polyBar(
          [
            voiceOf("melody", ev(h, [1, 1]), ev(h, [5])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The stepwise 3–2–3–4 decorates I without turning anywhere, so the
        // harmony holds the bare root under it rather than spending a note.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [3]), ev(q, [4])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The held 2 is the first thing in the tune that leaves the tonic, so
        // the harmony turns mid-bar and spends its extra note there: the
        // leading tone names V, which the melody's 2 alone does not.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The descent 1–7–6–5 drives the harmony through I, IV and V in one
        // bar and sings the leading tone itself. The melody is down in the low
        // octave here, so the harmony follows with bare stepping roots rather
        // than stacking thirds into the mud.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [1]),
              ev(q, [7, -1]),
              ev(q, [6, -1]),
              ev(q, [5, -1]),
            ),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [4, -1]), ev(q, [5, -1])),
          ],
          [region(h, 1), region(q, 4), region(q, 5)],
        ),
        // V has just been sounded, so its root carries the first half bare; the
        // return to I is the turn worth marking, and the melody's 3 is thin
        // evidence on its own, so root and third land there instead.
        polyBar(
          [
            voiceOf("melody", ev(h, [2]), ev(h, [3])),
            voiceOf("harmony", ev(h, [5, -1]), ev(h, [1, -1], [3, -1])),
          ],
          [region(h, 5), region(h, 1)],
        ),
        // The melody's 4 could still belong to I, so IV gets its own third to
        // declare itself; the dominant that follows needs nothing but a root,
        // since the tune sings the leading tone on the last beat.
        polyBar(
          [
            voiceOf(
              "melody",
              ev(q, [4]),
              ev(q, [3]),
              ev(q, [2]),
              ev(q, [7, -1]),
            ),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [5, -1])),
          ],
          [region(h, 4), region(h, 5)],
        ),
        // The ending, not a way station: the melody holds 1, so the third joins
        // the root to close the chord, where a fifth would only thicken what
        // the tune already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The tune opens with tonic octaves and eventually resolves lower 7 to a sustained 1.",
      "independent",
    ),
  ],
);
