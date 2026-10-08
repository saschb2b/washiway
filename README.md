# Washiway

A cozy, mobile-first math game with a kawaii stationery aesthetic. Short rounds that adapt to you train mental arithmetic, number sense, estimation and early algebra — for teens and adults who want to stay sharp with numbers.

**Find your flow. Stick with the streak.**

Play it at **https://saschb2b.github.io/washiway/**

## Features

- **6 skills + a mixed mode**: Quick Math, Fact or Fib, Ballpark, Number Line, Fill the Gap, Make the Target, and Mixed Bag
- **Adaptive levels**: each skill has its own level (1–10) that moves after every answer and keeps you at about 80% success
- **Learn from mistakes**: every miss shows the solution and a strategy; missed tasks come back later in the round and in the next session
- **60-second sprints or untimed practice** (20 tasks, no clock)
- **Washi Binder**: unlock themed tape rolls through achievements and equip them to re-theme the app
- **Stationery theme**: washi tape UI elements, paper textures, sticky notes, and pastel colors
- **Juicy feedback**: animations, sound effects, streak indicators, and burst mode bonuses
- **Keyboard support** for every input type
- **i18n**: English and German
- **Personal bests and levels** stored locally in `localStorage`

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, static export)
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animations
- Web Audio API for sound
- TypeScript, ESLint, Prettier
- Vitest for the math engine
- Hosted on GitHub Pages, deployed by GitHub Actions

## Getting started

Requires Node.js 22 or newer (CI uses the version in `.nvmrc`) and pnpm. With Corepack enabled, the pnpm version pinned in `package.json` is used automatically.

```bash
corepack enable
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Scripts

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the dev server                         |
| `pnpm build`        | Build the static site into `out/`            |
| `pnpm preview`      | Serve `out/` locally                         |
| `pnpm lint`         | Run ESLint                                   |
| `pnpm typecheck`    | Run the TypeScript compiler without emitting |
| `pnpm test`         | Run the math engine tests                    |
| `pnpm format`       | Format all files with Prettier               |
| `pnpm format:check` | Check formatting (CI runs this)              |

## How the math works

The task design follows what research on math practice supports, and avoids claims it doesn't (there is no evidence that brain training games make you smarter in general — practice makes you better at what you practice).

| Skill               | What it trains                                                                                       | Why                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Quick Math**      | A 10-level ladder from making ten to two-digit products, squares, percentages and multi-step chains  | Fluency comes from retrieval plus strategies (compensation, near squares, ×11, x% of y = y% of x); every miss shows the strategy    |
| **Fact or Fib**     | Judging claims: near-miss results, misconceptions (1/2 + 1/3 ≠ 2/5, +50% −50% ≠ 0)                   | Wrong claims are never far off, so a glance can't reject them; a real check (last digit, parity, rough size, working backwards) can |
| **Ballpark**        | Closest estimate and "which is bigger" for products, percentages, fractions, powers, Fermi questions | Estimation matters in daily life, and knowing fraction magnitudes is linked to later algebra success                                |
| **Number Line**     | Placing whole numbers, negatives, fractions, decimals, roots and constants                           | Number-line accuracy correlates with math achievement (r ≈ .44 in a meta-analysis), most strongly for fractions                     |
| **Fill the Gap**    | Inverse operations, the equals sign as a balance, number patterns, linear equations                  | Relational understanding of "=" and solving for an unknown are the bridge to algebra                                                |
| **Make the Target** | Pick tiles that make a number: bonds to 10/100/1000/1, factor pairs, differences                     | Seeing number relationships at a glance is what fluent calculators do                                                               |
| **Mixed Bag**       | All skills interleaved                                                                               | Interleaved practice feels harder but is remembered better than blocked practice                                                    |

**Adaptive difficulty.** Each skill keeps a continuous level. A correct answer moves it up a little (more when fast), a miss moves it down about four times as much, so it settles where you succeed roughly 80% of the time (85% for true/false and two-option questions, where guessing helps). This mirrors the Elo-style approach of [Math Garden](https://www.klinkenberg.amsterdam/publication/math-garden/) (Klinkenberg et al., 2011). Steps start large so your level is found within a round.

**Scoring.** Points follow the "high speed, high stakes" rule ([Maris & van der Maas, 2012](https://dare.uva.nl/id/257c9569-e69c-466b-b813-c48c1e65942c)): fast correct answers earn the most, a fast wrong answer on a guessable task costs as much as a fast right one earns, and slow mistakes or "Don't know" cost nothing. Harder tiers are worth more, so best scores stay comparable as your level rises.

**Feedback and review.** After a miss you see the solution and a worked strategy — feedback after errors is what makes retrieval practice stick ([Pashler et al., 2005](https://digitalcommons.usf.edu/psy_facpub/1773)). Missed tasks return a few questions later and are saved for the start of your next session (successive relearning, spacing).

The generators live in `lib/math/`. Tests recompute every generated task with an independent expression evaluator across all skills and tiers, and simulate players of different strength to check that levels settle where they should.

## Deployment

The site is a fully static export (`output: "export"` in `next.config.ts`) and is published to GitHub Pages by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

- Every pull request is linted, type-checked, format-checked, tested, and built.
- Every push to `main` additionally uploads `out/` and deploys it to GitHub Pages.

GitHub Pages serves the project from `/washiway`, so the workflow passes that prefix to the build through `PAGES_BASE_PATH`. Locally the variable is unset and the app runs at the root.

To enable deployments on a fresh fork, open **Settings → Pages** and set **Source** to **GitHub Actions**.

## Project structure

```
├── app/                      # Next.js app router (layout, page, global styles, icon)
├── components/
│   ├── game/                 # Game screens and inputs
│   │   ├── inputs/           # Mode-specific input components
│   │   └── ...               # Screens, overlays, binder, UI pieces
│   ├── ui/                   # Stationery components (sticky notes, washi tape, ...)
│   └── math-game.tsx         # Main game orchestrator
├── lib/
│   ├── math/                 # Task generators, answer checking, adaptive levels and scoring (+ tests)
│   ├── game-context.tsx      # Game flow: questions, feedback, review queue
│   ├── skill-context.tsx     # Saved levels and review decks
│   ├── settings-context.tsx  # Best scores
│   ├── progression-context.tsx # Washi rolls, achievements, unlocks
│   ├── theme-context.tsx     # Applies the equipped roll's colors and pattern
│   ├── audio-context.tsx     # Sound effects, music
│   ├── i18n-context.tsx      # Translations
│   └── game-types.ts         # TypeScript types
├── public/sounds/            # Sound effects and background music
└── .github/workflows/        # CI and GitHub Pages deployment
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-mode`)
3. Make your changes
4. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` to verify there are no errors
5. Submit a pull request

### Adding a task family

Each skill in `lib/math/skills/` has a `TIERS` table mapping levels 1–10 to weighted builders. Add a builder that returns a question draft with a worked `explanation`, list it in the tiers where it fits, and run `pnpm test` — the tests recompute every answer.

### Adding a new skill

1. Add it to `SKILLS` and `GAME_MODES` in `lib/math/types.ts` and register its generator in `lib/math/engine.ts`
2. Reuse an existing question kind (number, true/false, choice, number line, target) or add a new kind with an input in `components/game/inputs/`, wired up in `components/game/game-screen.tsx`
3. Add its color, pattern, and icon to `MODE_STYLES` in `components/game/mode-styles.ts`
4. Add translations to `lib/i18n-context.tsx`

### Adding a new language

1. Add the locale to the `Language` type in `lib/math/types.ts`
2. Add a translations object in `lib/i18n-context.tsx`, and the new language to every `L(...)` text in `lib/math/`
3. Add it to `LANGUAGES` in `components/game/language-toggle.tsx`

## Credits

Background music: "Morning Routine" by Ghostrifter Official, via [chosic.com](https://www.chosic.com).

## License

MIT
