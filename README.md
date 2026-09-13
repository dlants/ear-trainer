# the ecological ear trainer

Functional ear training PWA: named scale-degree cells, FSRS scheduling, recognition + production directions.

Why it exists and how the practice model is meant to work: [docs/about.md](docs/about.md), which is also rendered in-app at `/about`. Architecture, data model, and scheduling details: [docs/design.md](docs/design.md).

## Local setup

Requires Node 22+ (developed on 24) and npm.

```
npm install
npm run dev
```

`npm run dev` starts Vite; open the printed localhost URL. Audio only starts after you press "start practicing", since browsers require a user gesture to unlock the audio context.

## Checks

Run these before opening a PR:

```
npm run typecheck
npm test
npm run lint
```

`npm run lint` uses Biome; `npx biome check --write .` applies the safe fixes. `npm run build` produces the production PWA bundle, and `npm run preview` serves it.

## Generated assets

- `npm run make-icons` regenerates the PWA icons in `public/`.
- `npm run derive-inventory` regenerates `inventory/patterns.ts` and `inventory/songs.ts` from the corpus in `scripts/derive-inventory.ts`.

Commit the regenerated output rather than generating it at runtime.

## Contributing

- `main` is the default and protected branch; work on a feature branch and open a PR.
- Match the existing structure: view modules under `views/` own their own markup, scoped CSS, and bindings via the tiny framework in `vamp.ts`; domain logic lives in `music/`, `deck/`, `inventory/`, and `audio/`.
- Larger changes are usually written up as a plan in `plans/` first.
