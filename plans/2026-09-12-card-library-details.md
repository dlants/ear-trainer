# Objective and Context

In the card library:

1. Replace the corpus-occurrence text in each collapsed row with expandable details.
2. Tapping a row toggles its details, with at most one row expanded at a time; keep add/remove as independent controls on the right.
3. Put corpus occurrences and user-legible spaced-repetition knowledge information in the expanded section.

A library row represents one inventory pattern, but adding it creates two independently scheduled `DeckCard`s: `transcription` and `audiation`. Knowledge information must therefore be shown per mode rather than collapsed into one potentially misleading score.

Relevant entities:

- `InventoryEntry` supplies `id`, pedagogical `gloss`, and corpus `count`.
- `DeckStore` owns persisted `DeckCard`s and the `ts-fsrs` scheduler state.
- `DeckCard.fsrs` is `ts-fsrs@5.4.2`'s `Card`, including `due`, `stability`, `difficulty`, `scheduled_days`, `reps`, `lapses`, `state`, and `last_review`.
- `scheduler.get_retrievability(card, now, false)` returns the estimated current recall probability. A new card returns zero, which should be rendered as “not practiced yet,” not “0% recall.”
- The app maps only `known + got-it` to `Rating.Good`; every other trial maps to `Rating.Again`, so the displayed FSRS state reflects the app's intentionally strict grading policy.

Relevant files:

- `views/add-patterns.ts` — card-library state, reducer, row markup, bindings, and local styles.
- `views/add-patterns.test.ts` — card-library state/reducer tests and the natural home for interaction rendering tests.
- `deck/store.ts` — card persistence and the single scheduler instance used for grading and retrievability.
- `deck/card.ts` — pattern modes, card IDs, and grading semantics.
- `inventory/entry.ts` — inventory count and pedagogical gloss contract.
- `scripts/derive-inventory.ts` — generated gloss construction.
- `inventory/patterns.ts` — checked-in generated inventory data.
- `views/songs.ts` — existing one-expanded-row-at-a-time interaction pattern to follow.
- `theme.ts` — existing semantic colors, borders, radius, and focus treatment.

# Design

Add a single expanded-pattern identity to card-library state and derive each row's `expanded` flag during rebuilds, matching the selection behavior already used by the song list. Selecting the open row closes it; selecting another row closes the previous one. Add/remove rebuilds preserve the selected identity so acting on a card does not unexpectedly close its details. If “hide added” makes the selected row disappear, clear the selection to avoid retaining invisible UI state.

Render each row as a two-column header plus a details region. The header's main content is a semantic button that occupies all space except the add/remove control on the right; this gives the requested row-sized tap target without nesting buttons. Add/remove clicks remain independent and cannot toggle expansion. Expose expansion with `aria-expanded` and connect the header to the details region with `aria-controls`. The details region is binder-driven and visible only for the selected row.

Move frequency presentation from the generated gloss into the details region. Keep `InventoryEntry.count` unchanged and regenerate `inventory/patterns.ts` so each `gloss` contains only the pedagogical description. Render count separately as “Occurs once in the corpus” or “Occurs N times in the corpus.”

For patterns in the deck, show one compact knowledge block per mode:

- Human label: “Transcription” or “Audiation.”
- Stage: “Not practiced yet,” “Learning,” “Reviewing,” or “Relearning,” mapped directly from FSRS state.
- Estimated recall now: the rounded retrievability percentage for non-new cards.
- Next review: “due now,” “due today,” or a concise relative/absolute date derived from `due` and the injected `now()`.
- History: review count and lapse count, translated into plain language rather than exposing FSRS field names.
- Stability in days and difficulty on FSRS's 1–10 scale.
- A question-mark tooltip beside every statistic explaining its meaning in plain language.

Show all native values requested, while translating zero-valued new-card stability and difficulty to “Not set.” `scheduled_days` remains redundant with `due`. For a pattern not in the deck, show corpus information and a short “Add this pattern to start tracking learning” message instead of synthetic knowledge metrics.

Keep FSRS calculations in `DeckStore`, next to the scheduler, and return a UI-neutral progress snapshot. Keep formatting and copy in `views/add-patterns.ts`. This avoids duplicating scheduler configuration in the view and keeps the store independent of presentation language.

## Interfaces

Add a UI-neutral store projection:

```typescript
export type CardProgress = {
  mode: Mode;
  state: State;
  due: Date;
  retrievability: number | undefined;
  reps: number;
  lapses: number;
  stability: number;
  difficulty: number;
};

DeckStore.progressForPattern(patternId: PatternId, now: Date): CardProgress[];
```

`progressForPattern` returns entries in `MODES` order, omits modes not present in the deck, and returns `retrievability: undefined` for `State.New`. Dates remain `Date` values and probabilities remain numbers; the view owns display formatting.

Extend card-library state:

```typescript
export type KnowledgeRow = CardProgress;

export type Row = {
  id: PatternId;
  label: string;
  gloss: string;
  count: number;
  added: boolean;
  expanded: boolean;
  knowledge: KnowledgeRow[];
};

export type State = {
  rows: Row[];
  hideAdded: boolean;
  expandedId?: PatternId;
};

export type Msg =
  | { type: "TOGGLE_DETAILS"; id: PatternId }
  | { type: "ADD"; id: PatternId }
  | { type: "REMOVE"; id: PatternId }
  | { type: "SET_HIDE_ADDED"; value: boolean };
```

Change `rows` to accept the selected identity and one stable time value per rebuild:

```typescript
rows(ctx: AddPatternsCtx, expandedId?: PatternId, now?: Date): Row[];
```

The implementation should call `ctx.now()` once per reducer/initial-state rebuild and pass that same timestamp to every progress calculation so percentages and due labels are internally consistent.

## Invariants

- At most one card-library row is expanded.
- Tapping add/remove never toggles details.
- Removing a pattern removes both modes but leaves its inventory details available.
- Adding or removing a visible row does not close it.
- Hiding added rows cannot leave an invisible row selected.
- A pattern's two learning modes are never represented as one combined recall percentage.
- New cards never display a misleading 0% recall estimate.
- Corpus frequency remains sourced from `InventoryEntry.count`, not parsed from prose.
- Dynamic state is rendered through Vamp bindings; no imperative DOM updates are introduced.
- Existing semantic theme tokens and shared focus treatment are reused; no new color semantics are required.

# Stages

## Expose scheduler progress

- Goal: `DeckStore` can return current, UI-neutral FSRS progress for both cards belonging to a pattern.
- Tests:
  - A pattern outside the deck returns no progress entries.
  - A newly added pattern returns transcription and audiation in stable order, both without a recall percentage.
  - After grading one mode, that mode exposes the library's numeric retrievability at the injected time while the untouched mode remains new.
  - The projection does not mutate or persist card state.

## Separate corpus count from gloss

- Goal: generated inventory glosses contain only pedagogical text, while corpus frequency remains available through `count`.
- Tests:
  - Inventory derivation retains the same IDs, tiers, ordering, and counts.
  - Generated glosses no longer contain occurrence prose.
  - Singular and plural corpus labels are covered by view-formatting tests.

## Add exclusive expansion state

- Goal: card-library state supports toggling one row open at a time while preserving existing add/remove/filter behavior.
- Tests:
  - Selecting A opens A; selecting B closes A and opens B; selecting B again closes all rows.
  - Adding and removing preserve the currently expanded visible row.
  - Enabling “hide added” clears selection when the expanded row becomes hidden.
  - Existing add/remove/idempotence expectations continue to pass.

## Render accessible details

- Goal: the whole non-action portion of a row toggles details, add/remove stays on the right, and expanded content shows corpus frequency plus per-mode learning information.
- Tests:
  - Clicking the row header dispatches `TOGGLE_DETAILS` and updates `aria-expanded`.
  - Clicking add/remove dispatches only its own action.
  - Only the selected row's details are visible.
  - A non-added pattern shows the tracking prompt and no knowledge metrics.
  - New, learning/reviewing, due, and future-due cards render user-legible labels from fixed timestamps.
  - Review count, lapse count, stability, and difficulty render for each mode.
  - Every statistic has a keyboard-focusable and hoverable question-mark tooltip.
  - Transcription and audiation are displayed independently.

## Validate the integrated card library

- Goal: the revised card library remains usable at touch sizes and across its existing filters and deck mutations.
- Tests:
  - Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
  - Manually verify row tapping, independent add/remove actions, one-open-at-a-time behavior, focus visibility, and compact/mobile wrapping.
