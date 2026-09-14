import { expect, test } from "@playwright/test";
import { makePattern } from "../music/note.ts";
import { makeCardId } from "./card.ts";
import { type Profile, ProfileStore } from "./profiles.ts";
import { DeckStore, type KeyValueStore } from "./store.ts";

function memoryStorage(): KeyValueStore {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

function profile(id: string): Profile {
  return {
    id,
    name: id,
    drone: true,
    color: "#123456",
    tonic: 60,
    cadenceSpeed: "medium",
  };
}

const pattern = makePattern("major-cadence", [
  { notes: [{ degree: 1, alteration: 0, octave: 0 }] },
  { notes: [{ degree: 3, alteration: 0, octave: 0 }] },
]);
const cardId = makeCardId(pattern.id, "transcription");
const now = new Date("2026-01-01T00:00:00Z");

test.describe("profile scoping", () => {
  test("grading under one profile leaves the other's deck untouched", () => {
    const storage = memoryStorage();
    const a = new DeckStore("a", storage);
    const b = new DeckStore("b", storage);
    a.addPattern(pattern.id, now);
    b.addPattern(pattern.id, now);

    a.grade(cardId, "known", "got-it", now);

    const dueA = a.getState().cards[cardId]?.fsrs.due.getTime();
    const dueB = b.getState().cards[cardId]?.fsrs.due.getTime();
    expect(dueA).toBeGreaterThan(dueB as number);
    expect(b.getState().log).toEqual([]);
    expect(new DeckStore("b", storage).getState().log).toEqual([]);
  });
});

test.describe("ProfileStore", () => {
  test("fills the movable range when loading an older profile", () => {
    const storage = memoryStorage();
    storage.setItem(
      "profiles",
      JSON.stringify([{ id: "a", name: "a", color: "#123456", tonic: 60 }]),
    );

    const loaded = new ProfileStore(storage).get("a");

    expect(loaded?.cadenceSpeed).toBe("medium");
    expect(loaded?.drone).toBe(true);
  });

  test("persists profiles and the active selection", () => {
    const storage = memoryStorage();
    const store = new ProfileStore(storage);
    store.save(profile("a"));
    store.save(profile("b"));
    store.setActive("b");

    const reloaded = new ProfileStore(storage);
    expect(reloaded.list().map((p) => p.id)).toEqual(["a", "b"]);
    expect(reloaded.active()?.id).toBe("b");
  });

  test("exports every profile with its deck data", () => {
    const storage = memoryStorage();
    const store = new ProfileStore(storage);
    store.save(profile("a"));
    store.save(profile("b"));
    new DeckStore("a", storage).addPattern(pattern.id, now);

    const payload = JSON.parse(store.exportJson()) as {
      profiles: { profile: Profile; cards: string | null }[];
    };
    expect(payload.profiles.map((e) => e.profile.id)).toEqual(["a", "b"]);
    expect(payload.profiles[0]?.cards).toContain(cardId);
    expect(payload.profiles[1]?.cards).toBeNull();
  });

  test("imports by merging on id without clobbering unrelated profiles", () => {
    const source = memoryStorage();
    const from = new ProfileStore(source);
    from.save(profile("a"));
    new DeckStore("a", source).addPattern(pattern.id, now);
    const json = from.exportJson();

    const target = memoryStorage();
    const to = new ProfileStore(target);
    to.save({ ...profile("a"), name: "stale" });
    to.save(profile("z"));
    new DeckStore("z", target).addPattern(pattern.id, now);
    new DeckStore("z", target).grade(cardId, "known", "got-it", now);

    to.importJson(json);

    expect(to.list().map((p) => p.id)).toEqual(["a", "z"]);
    expect(to.get("a")?.name).toBe("a");
    expect(new DeckStore("a", target).getState().cards[cardId]).toBeDefined();
    expect(new DeckStore("z", target).getState().log).toHaveLength(1);
  });
});
