import type { CadenceSpeed } from "../audio/engine.ts";
import type { Midi } from "../music/pitch.ts";
import type { KeyValueStore } from "./store.ts";

export type Profile = {
  id: string;
  name: string;
  color: string;
  /** Legacy fixed tonic retained for older practice flows and profile imports. */
  tonic: Midi;
  lowNote: Midi;
  highNote: Midi;
  cadenceSpeed: CadenceSpeed;
  /** Holds the tonic audible under every trial. */
  drone: boolean;
};

/** A profile plus the raw deck blobs belonging to it, for export/import. */
export type ProfileExport = {
  profile: Profile;
  cards: string | null;
  log: string | null;
};

export type ExportPayload = { profiles: ProfileExport[] };

const PROFILES_KEY = "profiles";
const ACTIVE_KEY = "profile:active";
export const DEFAULT_CADENCE_SPEED: CadenceSpeed = "medium";
export const DEFAULT_DRONE = true;
export const DEFAULT_LOW_NOTE: Midi = 48;
export const DEFAULT_HIGH_NOTE: Midi = 72;

function normalizeProfile(profile: Profile): Profile {
  const legacyTonic = profile.tonic ?? 60;
  return {
    ...profile,
    tonic: legacyTonic,
    lowNote: profile.lowNote ?? legacyTonic - 12,
    highNote: profile.highNote ?? legacyTonic + 12,
    cadenceSpeed: profile.cadenceSpeed ?? DEFAULT_CADENCE_SPEED,
    drone: profile.drone ?? DEFAULT_DRONE,
  };
}

export function cardsKey(profileId: string): string {
  return `profile:${profileId}:cards`;
}

export function logKey(profileId: string): string {
  return `profile:${profileId}:log`;
}

export class ProfileStore {
  private profiles: Profile[];
  private activeId: string | undefined;

  constructor(private readonly storage: KeyValueStore) {
    const raw = this.storage.getItem(PROFILES_KEY);
    this.profiles = raw
      ? (JSON.parse(raw) as Profile[]).map(normalizeProfile)
      : [];
    this.activeId = this.storage.getItem(ACTIVE_KEY) ?? undefined;
  }

  list(): Profile[] {
    return this.profiles;
  }

  get(id: string): Profile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  /** The active profile, or undefined when none is selected yet. */
  active(): Profile | undefined {
    return this.activeId ? this.get(this.activeId) : undefined;
  }

  setActive(id: string): void {
    if (!this.get(id)) throw new Error(`unknown profile: ${id}`);
    this.activeId = id;
    this.storage.setItem(ACTIVE_KEY, id);
  }

  /** Creates or replaces the profile with this id. Deck data is untouched. */
  save(profile: Profile): void {
    const normalized = normalizeProfile(profile);
    const index = this.profiles.findIndex((p) => p.id === profile.id);
    if (index === -1) this.profiles.push(normalized);
    else this.profiles[index] = normalized;
    this.persist();
  }

  exportJson(): string {
    const payload: ExportPayload = {
      profiles: this.profiles.map((profile) => ({
        profile,
        cards: this.storage.getItem(cardsKey(profile.id)),
        log: this.storage.getItem(logKey(profile.id)),
      })),
    };
    return JSON.stringify(payload);
  }

  /**
   * Merges by profile id: incoming profiles overwrite their own entry and deck
   * blobs, and profiles absent from the payload are left exactly as they were.
   */
  importJson(json: string): void {
    const { profiles } = JSON.parse(json) as ExportPayload;
    for (const entry of profiles) {
      this.save(entry.profile);
      if (entry.cards !== null) {
        this.storage.setItem(cardsKey(entry.profile.id), entry.cards);
      }
      if (entry.log !== null) {
        this.storage.setItem(logKey(entry.profile.id), entry.log);
      }
    }
  }

  private persist(): void {
    this.storage.setItem(PROFILES_KEY, JSON.stringify(this.profiles));
  }
}
