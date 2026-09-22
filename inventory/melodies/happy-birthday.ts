import type { CorpusMelody } from "../../music/melody.ts";
import {
  dh,
  e,
  ev,
  h,
  melody,
  phrase,
  polyBar3,
  polyPickup,
  q,
  region,
  voiceOf,
} from "../melody-builders.ts";

export const happyBirthday: CorpusMelody = melody(
  "happy-birthday",
  "Happy Birthday",
  92,
  "public-domain",
  "Patty and Mildred Hill melody first published in the 1890s; public-domain birthday-song form.",
  [
    phrase(
      [
        // Nothing has sounded yet, and a repeated lower 5 alone could belong to
        // any key, so the anacrusis takes root and third to plant I before the
        // tune starts. Both sit under the melody's lower 5.
        polyPickup(
          [
            voiceOf("melody", ev(e, [5, -1]), ev(e, [5, -1])),
            voiceOf("harmony", ev(q, [1, -1], [3, -1])),
          ],
          [region(q, 1)],
        ),
        // The line arrives on 1, so I is stated by the melody itself; the bass
        // only holds its root, a step below where the pickup left it.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [5, -1]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // The sustained lower 7 is the leading tone, so the melody supplies V's
        // third on its own; the harmony only needs the dominant root, which has
        // to sit an octave down to stay beneath this low line.
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(e, [5, -1]), ev(e, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -2])),
          ],
          [region(dh, 5)],
        ),
        // V comes back without its third this time - 6 and 2 around the melody's
        // 5 leave the chord open - so the leading tone sounds under the turn and
        // the root is left bare as the bar settles toward the cadence.
        polyBar3(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [5, -1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [5, -2], [7, -2]), ev(q, [5, -2])),
          ],
          [region(dh, 5)],
        ),
        // The resolution: the melody's held 1 gives the root, so the harmony
        // adds the chordal third, which names the quality where a fifth would
        // only thicken what is already there.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [3, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "Both opening sentences rise from lower 5 and the second lands on a sustained natural 1.",
      "independent",
    ),
    phrase(
      [
        // The same anacrusis, left bare now: the key is established and the
        // previous bar's tonic is still in the ear, so restating root and third
        // would teach the voicing rather than the tune.
        polyPickup(
          [
            voiceOf("melody", ev(e, [5, -1]), ev(e, [5, -1])),
            voiceOf("harmony", ev(q)),
          ],
          [region(q, 1)],
        ),
        // The melody arpeggiates 5-3-1 straight down the tonic triad, spelling I
        // outright, so a single held root underneath is all the support it
        // wants.
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        // Two turns in one bar. The melody's lower 7 covers V's third, so that
        // beat takes a bare dominant root; the move to IV is the new colour, but
        // the melody sounds 6 and 4 itself, so IV also needs only its root -
        // dropped a fourth so the chord is not inverted under the melody's 6.
        polyBar3(
          [
            voiceOf(
              "melody",
              ev(q, [7, -1]),
              ev(q, [6, -1]),
              ev(e, [4]),
              ev(e, [4]),
            ),
            voiceOf("harmony", ev(q, [5, -2]), ev(h, [4, -1])),
          ],
          [region(q, 5), region(h, 4)],
        ),
        // 3 and 1 hold I without help, so the bass just keeps its root there and
        // spends the extra note on the cadential turn, where the melody's 2 sits
        // over V and the leading tone pulls the phrase home.
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -2], [7, -2])),
          ],
          [region(h, 1), region(q, 5)],
        ),
        // The ending. The melody's long 1 and the earlier tonic bar have both
        // given the third already, so the close takes root and fifth for weight
        // rather than repeating the colour.
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
          ],
          [region(dh, 1)],
        ),
      ],
      "independent",
      "The climactic line includes 1 and the final 3–1–2–1 motion gives an unambiguous tonic arrival.",
      "independent",
    ),
  ],
);
