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

export const camptownRaces: CorpusMelody = melody(
  "camptown-races",
  "Camptown Races",
  116,
  "public-domain",
  "Stephen Foster minstrel-era song, published in 1850.",
  [
    phrase(
      [
        // The call arpeggiates 5–3–5, spelling I by itself, so a single held
        // root is all the harmony supplies. The melody stays at 3 and above,
        // so that root sounds in its own octave rather than down in the mud.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [5])),
            voiceOf("harmony", ev(w, [1])),
          ],
          [region(w, 1)],
        ),
        // The melody's 6 is shared between IV and vi, so the turn to IV is
        // where the extra note is spent: root and chordal third name the chord.
        // The return to I takes a bare root, stepping down rather than leaping.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1], [6, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // The descent 3–2–1 states I on its own, so the bass just holds the
        // root; the half cadence on 2 leaves V open, so the leading tone sounds
        // beside the dominant root at the turn.
        polyBar(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [2]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(h, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(h, 5)],
        ),
        // The tune rests on 3 then its own 1, which forces the bass to the
        // octave below; that octave is a full sound, and the tune continues, so
        // this interior arrival wants nothing more.
        polyBar(
          [
            voiceOf("melody", ev(h, [3]), ev(h, [1])),
            voiceOf("harmony", ev(w, [1, -1])),
          ],
          [region(w, 1)],
        ),
        // The call comes back note for note, and the harmony steps aside: the
        // key is set and the melody is still arpeggiating I, so restating the
        // root would teach the voicing rather than the tune.
        polyBar(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [5]), ev(q, [3]), ev(q, [5])),
            voiceOf("harmony", ev(w)),
          ],
          [region(w, 1)],
        ),
        // The same turn to IV, bare this time. The phrase has already spelled
        // that chord out once, so its root alone is context enough, and the
        // thicker voicing does not become the signal that IV has arrived.
        polyBar(
          [
            voiceOf("melody", ev(q, [6]), ev(q, [5]), ev(h, [3])),
            voiceOf("harmony", ev(h, [4, -1]), ev(h, [1, -1])),
          ],
          [region(h, 4), region(h, 1)],
        ),
        // A whole bar of V, and the melody sings the leading tone itself on the
        // last beat; doubling it would add nothing, so the dominant root holds
        // alone while the harmony simply sits still.
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
        // The long 1 arrives from lower 7. This is the ending rather than a way
        // station, so the chordal third joins the root to close; a fifth would
        // only thicken what the melody's own 1 already states.
        polyBar(
          [
            voiceOf("melody", ev(w, [1])),
            voiceOf("harmony", ev(w, [1, -1], [3, -1])),
          ],
          [region(w, 1)],
        ),
      ],
      "independent",
      "The first cadence reaches 1 and the last phrase resolves lower 7 to a long tonic.",
      "independent",
    ),
  ],
);
