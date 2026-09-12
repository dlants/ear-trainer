---
name: design-system
description: Ear Trainer visual conventions for theme tokens and inline SVG icons. Use whenever adding or changing frontend colors, controls, icons, or other visual styling.
---

# Design system

The visual source of truth is `theme.ts` for shared CSS tokens and global control foundations, and `icons.ts` for trusted inline SVG icons. View-specific layout stays colocated with each view through `cls()` and `mountStyle()` as described by the **vamp** skill.

Before adding frontend styling:

1. Use an existing `var(--color-…)`, `var(--radius-…)`, or `var(--focus-…)` token from `theme.ts` instead of a hex literal.
2. Choose tokens by semantic role, not by which current color happens to look close.
3. Import an icon function from `icons.ts` rather than embedding SVG markup or using an emoji as an affordance.
4. If a visual role repeats and has no token, add a focused semantic token to `theme.ts` before using it in views.

## Theme

`theme.ts` mounts the global theme and is imported once by `main.ts`. It defines the page foundation, default text and control colors, typography inheritance, and a shared keyboard focus ring.

### Foundation tokens

- Canvas and surfaces: `--color-canvas`, `--color-surface`.
- Text: `--color-text`, `--color-text-muted`.
- Controls and dividers: `--color-border`.
- Shape: `--radius-control`.
- Keyboard focus: `--focus-ring`.

### Brand tokens

The brand family is forest green. It communicates familiarity, membership, and established knowledge, and connects practice controls to the green treatment used for cards already in the deck.

- `--color-brand`: foreground and primary brand color.
- `--color-brand-strong`: dark chrome such as the navigation menu.
- `--color-brand-active`: active state on dark brand chrome.
- `--color-brand-surface`: subtle selected or known background.
- `--color-brand-border`: border for known/selected controls.

### Practice semantics

Practice states use distinct semantic families rather than a generic warning palette:

- Unsure: `--color-unsure`, `--color-unsure-surface`, `--color-unsure-border`. This is slate blue: visibly different from known without implying danger or failure.
- Incorrect: `--color-incorrect`, `--color-incorrect-surface`, `--color-incorrect-border`. This is muted brick red, reserved for a negative outcome.
- Correct: `--color-correct`, `--color-correct-surface`, `--color-correct-border`. This is a clearer success green; keep it distinct from the softer brand treatment used for confidence and deck membership.

Do not introduce yellow or amber for uncertainty. Color must reinforce the text label, never replace it. Preserve readable foreground/background contrast and a visible `:focus-visible` state when adding new variants.

## Icons

`icons.ts` exports hand-authored static SVG functions returning `RawHtml`. Insert them only inside a `sanitize` template. Current icons are:

- `keyIcon()` — replay tonal context.
- `playIcon()` — play the trial pattern.
- `questionIcon()` — unsure confidence.
- `checkIcon()` — known confidence.

Icons use a `24 × 24` view box, are sized to `1em`, and are decorative with `aria-hidden="true"`; the containing button supplies the accessible text label. Outline icons use `stroke="currentColor"` so they inherit the control's semantic color. Keep new icons visually consistent with rounded line caps/joins and approximately `stroke-width="2"`; solid geometry is acceptable when the familiar symbol depends on it, as with play.

Use the shared `svg()` helper for standard outline icons. Only pass hand-authored static markup to `raw()`—never user or persisted content. Keep labels visible beside icons unless a control has an explicit accessible label and the icon-only treatment is deliberate.

<system_reminder>
When changing frontend CSS or markup, follow the design-system skill: use semantic tokens from `theme.ts` instead of one-off color literals, and use icon functions from `icons.ts` instead of embedded SVG or emoji affordances.
</system_reminder>
