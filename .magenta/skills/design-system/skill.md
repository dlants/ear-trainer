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
- `--color-brand-surface`: subtle known or membership background.
- `--color-brand-border`: border for known or membership controls.

### Practice semantics

Practice states use distinct semantic families rather than a generic warning palette:

- Unsure: `--color-unsure`, `--color-unsure-surface`, `--color-unsure-border`. This is slate blue: visibly different from known without implying danger or failure.
- Incorrect: `--color-incorrect`, `--color-incorrect-surface`, `--color-incorrect-border`. This is muted brick red, reserved for a negative outcome.
- Correct: `--color-correct`, `--color-correct-surface`, `--color-correct-border`. This is a clearer success green; keep it distinct from the softer brand treatment used for confidence and deck membership.

Do not introduce yellow or amber for uncertainty. Color must reinforce the text label, never replace it. Preserve readable foreground/background contrast and a visible `:focus-visible` state when adding new variants.

Reserve green practice treatments for correctness. Generic selection and workflow actions such as start or reveal use neutral controls; selected notes and answer choices use the neutral `--color-selected-*` tokens rather than brand or correct green.

### Buttons

`PlayButtonView` from `views/play-button.ts` owns every page-level button chrome: audible playback controls and non-audible actions alike. It renders a leading trusted icon plus a visible label, so buttons stay the same height, weight, and alignment everywhere. Do not hand-roll a `<button>` in a page view when an action fits one of its variants.

- `variant: "trial"` — a full-width system action inside a half-width row slot: play, from beginning, reveal answers, next melody.
- `variant: "compact"` — a settings control in the support row: key, change key, drone, situations.
- Non-audible actions take an `ActionButtonId`, `playing: false`, and `animated: false`; unavailable ones set `disabled` rather than being styled ad hoc.
- Exception: a control that must gate a browser capability on a real `click` (audio unlock, mic start) stays a plain `<button>` bound with `onActivate`.

### Audible playback controls

Every control that starts audible playback must use `PlayButtonView` from `views/play-button.ts`. Give each operation a stable `PlayButtonId`, send the playback intent to the shared `PlayController`, and derive the button's `playing` and `durationMs` state from `PlayController.getState()` inside the parent's live binding callback.

- Page views and reducers must not call `AudioEngine` directly. `PlayController` is the sole application-level playback owner.
- Manual controls use `PlayController.toggle(...)`, so pressing the active button stops it and pressing a different button replaces all active and queued playback.
- Multi-step playback uses `PlayController.autoplay(...)`; page views must not implement their own queues or playback timers.
- `PlayButtonView` owns the audible control's button markup, trusted icon, accessibility state, and playback sweep. Do not add one-off sound buttons or page-local playback animations.
- Use `--color-playback-sweep` for the timed sweep and `--color-playback-active` for the static reduced-motion treatment. Their lifetime must come from the controller-provided playback duration, not duplicated CSS or view timers.

## Touch responsiveness

Taps must register on finger-down and look pressed in the same frame.

- This applies to every tappable affordance, not just `<button>`: menu toggles, `<summary>`, and any custom control a user presses. Plain `click` listeners are only correct for non-activation targets such as delegated link navigation.
- Bind activation with `onPress` from `vamp.ts`, never `addEventListener("click", ...)`. `onPress` fires on primary-button `pointerdown` and falls back to keyboard-synthesized clicks (`detail === 0`), so both touch and keyboard activation work without double-dispatch.
- Exception: controls that gate a browser capability requiring user activation — unlocking audio (`AudioContext.resume()`) and starting the mic (`getUserMedia()`) — bind `onActivate` (a `click` listener with the same pressed feedback), not `onPress`. Binding the start-audio button to `pointerdown` left the unlock pending forever on Android, with no error to surface. Do not "simplify" these back to `onPress`: desktop Chromium and the Android emulator both grant activation on `pointerdown`. The focused WebKit test demonstrates that touch `pointerdown` can leave `AudioContext.resume()` suspended until the tap completes, but it does not reproduce the exact Android Chrome hang.
- When a control has native click-driven behavior (notably `<summary>` toggling its `<details>`), suppress it with a `click` handler calling `preventDefault()` and drive the state change from `onPress` instead, so pointer and keyboard both go through one path.
- Pressed styling comes from the `pressedClass` that `onPress` toggles on the element, not from CSS `:active`, which browsers delay on touch and which would lag behind the pointerdown-time handler. `theme.ts` styles that class globally, so any control bound with `onPress` gets the feedback for free; do not add per-view `:active` rules for press feedback.
- Do not restate `touch-action: manipulation` or tap-highlight suppression in a view. `theme.ts` applies it globally to `button` and `summary`; extend that global rule if a new kind of tappable element appears.
- If a control needs a stronger pressed state than the global one, layer a `:active` rule using semantic tokens; do not remove the global feedback by overriding `filter` or `transform` without a replacement.

## Icons

`icons.ts` exports hand-authored static SVG functions returning `RawHtml`. Insert them only inside a `sanitize` template. Current icons are:

- `keyIcon()` — replay tonal context.
- `playIcon()` — play the trial pattern.
- `questionIcon()` — unsure confidence.
- `checkIcon()` — known confidence.
- `gearIcon()` — settings and selection controls.
- `shuffleIcon()` — pick a different key.
- `eyeIcon()` — reveal hidden answers.
- `arrowRightIcon()` — advance to the next item.

Icons use a `24 × 24` view box, are sized to `1em`, and are decorative with `aria-hidden="true"`; the containing button supplies the accessible text label. Outline icons use `stroke="currentColor"` so they inherit the control's semantic color. Keep new icons visually consistent with rounded line caps/joins and approximately `stroke-width="2"`; solid geometry is acceptable when the familiar symbol depends on it, as with play.

Use the shared `svg()` helper for standard outline icons. Only pass hand-authored static markup to `raw()`—never user or persisted content. Keep labels visible beside icons unless a control has an explicit accessible label and the icon-only treatment is deliberate.

<system_reminder>
When changing frontend CSS or markup, follow the design-system skill: use semantic tokens from `theme.ts` instead of one-off color literals, and use icon functions from `icons.ts` instead of embedded SVG or emoji affordances.
</system_reminder>
