import { expect, test } from "@playwright/test";
import { cells, tonicEventIndexes, voice } from "../music/melody.ts";
import { phraseMatchesSituation, SITUATIONS } from "../music/situations.ts";
import { selectIdentifyNotesPhrase } from "../views/tonic-practice.ts";
import { MELODIES, MELODY_CORPUS } from "./melodies.ts";

function melody(id: string) {
  const found = MELODIES.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing melody ${id}`);
  return found;
}

test.describe("timed melody corpus", () => {
  test("normalizes the complete corpus at module load", () => {
    expect(MELODIES).toHaveLength(MELODY_CORPUS.length);
    expect(MELODIES.length).toBeGreaterThanOrEqual(50);
  });

  test("uses unique stable IDs and documented supported sources", () => {
    const ids = MELODY_CORPUS.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const entry of MELODY_CORPUS) {
      expect(entry.id.trim(), entry.title).not.toBe("");
      expect(entry.source.description.trim(), entry.id).not.toBe("");
      expect(["public-domain", "traditional", "original"], entry.id).toContain(
        entry.source.status,
      );
    }
  });

  test("gives every melody a complete melody voice, phrases, and tonic", () => {
    for (const entry of MELODIES) {
      const melodyVoice = entry.voices.find(({ id }) => id === "melody");
      expect(melodyVoice, entry.id).toBeDefined();
      expect(melodyVoice?.events.length, entry.id).toBeGreaterThan(0);
      expect(entry.phrases.length, entry.id).toBeGreaterThan(0);
      expect(
        melodyVoice?.events.some((event) =>
          event.notes.some(
            (note) => note.degree === 1 && note.alteration === 0,
          ),
        ),
        entry.id,
      ).toBe(true);
      expect(entry.measures.at(-1)?.endTicks, entry.id).toBe(
        entry.durationTicks,
      );
    }
  });

  test("keeps authored measure and voice totals structurally complete", () => {
    for (const entry of MELODY_CORPUS) {
      for (const [measureIndex, measure] of entry.measures.entries()) {
        expect(
          measure.beatDurationsTicks.reduce(
            (total, duration) => total + duration,
            0,
          ),
          `${entry.id} measure ${measureIndex + 1}`,
        ).toBe(measure.durationTicks);
        const melodyVoice = measure.voices.find(
          ({ voiceId }) => voiceId === "melody",
        );
        expect(
          melodyVoice,
          `${entry.id} measure ${measureIndex + 1}`,
        ).toBeDefined();
        expect(
          melodyVoice?.events.reduce(
            (total, event) => total + event.durationTicks,
            0,
          ),
          `${entry.id} measure ${measureIndex + 1}`,
        ).toBe(measure.durationTicks);
      }
    }
  });

  test("authors conservative phrase suitability with rationales", () => {
    const supported = ["independent", "context-required", "exclude"];
    for (const entry of MELODIES) {
      for (const phrase of entry.phrases) {
        expect(supported, phrase.id).toContain(phrase.noteIdentification);
        expect(phrase.rationale.trim(), phrase.id).not.toBe("");
        if (phrase.noteIdentification !== "independent") continue;

        const melodyVoice = voice(phrase, "melody");
        expect(phrase.measures.length, phrase.id).toBeGreaterThanOrEqual(2);
        expect(phrase.measures.length, phrase.id).toBeLessThanOrEqual(3);
        expect(melodyVoice?.events.length, phrase.id).toBeGreaterThanOrEqual(4);
        expect(melodyVoice?.events.length, phrase.id).toBeLessThanOrEqual(8);
        expect(
          tonicEventIndexes(phrase, "melody").length,
          phrase.id,
        ).toBeGreaterThan(0);
      }
    }
  });

  test("fills every voice of every multi-voice entry", () => {
    const multiVoice = MELODIES.filter((entry) => entry.voices.length > 1);
    expect(multiVoice.length).toBeGreaterThan(0);
    for (const entry of multiVoice) {
      for (const entryVoice of entry.voices) {
        const sounded = entryVoice.events.reduce(
          (total, event) => total + event.durationTicks,
          0,
        );
        expect(sounded, `${entry.id}/${entryVoice.id}`).toBe(
          entry.durationTicks,
        );
      }
    }
  });
  test("sustains a voice across another voice's arpeggio somewhere", () => {
    const hasSustainOverArpeggio = MELODIES.some((entry) => {
      const entryCells = cells(entry);
      return entryCells.some(
        (held) =>
          entryCells.filter(
            (other) =>
              other.voiceId !== held.voiceId &&
              other.onsetTicks > held.onsetTicks &&
              other.onsetTicks < held.onsetTicks + held.durationTicks,
          ).length >= 2,
      );
    });
    expect(hasSustainOverArpeggio).toBe(true);
  });
  test("selects a multi-voice phrase for the harmony situations", () => {
    const harmonySituationIds = SITUATIONS.filter(
      (candidate) => candidate.group === "harmony",
    )
      .map(({ id }) => id)
      .filter((id) => id !== "arpeggiated-triad");
    for (let seed = 0; seed < 20; seed += 1) {
      const selection = selectIdentifyNotesPhrase(
        MELODIES,
        harmonySituationIds,
        undefined,
        () => seed / 20,
      );
      expect(selection, `seed ${seed}`).toBeDefined();
      expect(
        selection?.phrase.voices.length,
        `${selection?.phrase.id} for ${selection?.targetSituationId}`,
      ).toBeGreaterThan(1);
    }
  });
  test("covers every situation with an eligible independent phrase", () => {
    const eligiblePhrases = MELODIES.flatMap((entry) => entry.phrases).filter(
      (phrase) =>
        phrase.noteIdentification === "independent" &&
        phrase.measures.length >= 2,
    );

    for (const situation of SITUATIONS) {
      const matchingPhraseIds = eligiblePhrases
        .filter((phrase) => phraseMatchesSituation(phrase, situation.id))
        .map((phrase) => phrase.id);
      expect(
        matchingPhraseIds.length,
        `${situation.id}: no eligible independent phrase`,
      ).toBeGreaterThan(0);
    }
  });

  test("pins common-time rhythm and phrase boundaries for Twinkle", () => {
    const twinkle = melody("twinkle");
    expect(twinkle.measures).toHaveLength(12);
    expect(twinkle.measures.slice(0, 4)).toEqual([
      { startTicks: 0, endTicks: 96, beatDurationsTicks: [24, 24, 24, 24] },
      { startTicks: 96, endTicks: 192, beatDurationsTicks: [24, 24, 24, 24] },
      { startTicks: 192, endTicks: 288, beatDurationsTicks: [24, 24, 24, 24] },
      { startTicks: 288, endTicks: 384, beatDurationsTicks: [24, 24, 24, 24] },
    ]);
    expect(twinkle.phrases.map(({ measures }) => measures.length)).toEqual([
      2, 2, 2, 2, 2, 2,
    ]);
    expect(
      twinkle.phrases.map(({ noteIdentification }) => noteIdentification),
    ).toEqual([
      "independent",
      "independent",
      "context-required",
      "context-required",
      "independent",
      "independent",
    ]);
  });

  test("pins pickup and triple-meter measure lengths for Happy Birthday", () => {
    const happyBirthday = melody("happy-birthday");
    expect(
      happyBirthday.measures.map(
        ({ startTicks, endTicks }) => endTicks - startTicks,
      ),
    ).toEqual([24, 72, 72, 72, 72, 24, 72, 72, 72, 72]);
    expect(happyBirthday.measures[0]?.beatDurationsTicks).toEqual([24]);
    expect(happyBirthday.measures[1]?.beatDurationsTicks).toEqual([24, 24, 24]);
    expect(
      happyBirthday.phrases.map(({ measures }) => measures.length),
    ).toEqual([3, 2, 3, 2]);
  });

  test("pins compound beat grouping and an authored rest gap", () => {
    const row = melody("row-your-boat");
    expect(
      row.measures.every(
        ({ beatDurationsTicks }) => beatDurationsTicks.join(",") === "36,36",
      ),
    ).toBe(true);

    const londonBridge = melody("london-bridge");
    const melodyVoice = londonBridge.voices.find(({ id }) => id === "melody");
    const lastMeasure = londonBridge.measures.at(-1);
    expect(lastMeasure).toBeDefined();
    expect(
      melodyVoice?.events.some(
        (event) => event.onsetTicks >= (lastMeasure?.startTicks ?? 0),
      ),
    ).toBe(false);
  });
});
