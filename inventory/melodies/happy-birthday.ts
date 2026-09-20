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
        polyPickup(
          [
            voiceOf("melody", ev(e, [5, -1]), ev(e, [5, -1])),
            voiceOf("harmony", ev(q, [5, -1])),
          ],
          [region(q, 5)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [5, -1]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(h, [7, -1]), ev(e, [5, -1]), ev(e, [5, -1])),
            voiceOf("harmony", ev(dh, [5, -1], [7, -1])),
          ],
          [region(dh, 5)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(q, [6, -1]), ev(q, [5, -1]), ev(q, [2])),
            voiceOf("harmony", ev(dh, [5, -1])),
          ],
          [region(dh, 5)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(dh, [1])),
            voiceOf("harmony", ev(dh, [1, -1], [5, -1])),
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
        polyPickup(
          [
            voiceOf("melody", ev(e, [5, -1]), ev(e, [5, -1])),
            voiceOf("harmony", ev(q, [5, -1])),
          ],
          [region(q, 5)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(q, [5]), ev(q, [3]), ev(q, [1])),
            voiceOf("harmony", ev(dh, [1, -1])),
          ],
          [region(dh, 1)],
        ),
        polyBar3(
          [
            voiceOf(
              "melody",
              ev(q, [7, -1]),
              ev(q, [6, -1]),
              ev(e, [4]),
              ev(e, [4]),
            ),
            voiceOf("harmony", ev(q, [5, -1]), ev(h, [4, -1], [6, -1])),
          ],
          [region(q, 5), region(h, 4)],
        ),
        polyBar3(
          [
            voiceOf("melody", ev(q, [3]), ev(q, [1]), ev(q, [2])),
            voiceOf("harmony", ev(h, [1, -1]), ev(q, [5, -1], [7, -1])),
          ],
          [region(h, 1), region(q, 5)],
        ),
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
