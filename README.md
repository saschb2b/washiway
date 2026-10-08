# Washiway

A cozy, mobile-first math reaction game with a kawaii stationery aesthetic. Race against time to solve math problems, build streaks, and beat your personal best.

**Find your flow. Stick with the streak.**

Play it at **https://saschb2b.github.io/washiway/**

## Features

- **6 game modes**: True or False, Pick the Bigger, Quick Solve, Find the Blank, Chain Mode, Tape Match
- **Difficulty scaling**: 5 levels from Chill to Expert, plus in-game scaling based on your streak
- **Washi Binder**: unlock themed tape rolls through achievements and equip them to re-theme the app
- **Stationery theme**: washi tape UI elements, paper textures, sticky notes, and pastel colors
- **Juicy feedback**: animations, sound effects, streak indicators, and burst mode bonuses
- **Keyboard support** for every input type
- **i18n**: English and German
- **Personal bests** tracked per mode and difficulty, stored in `localStorage`

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, static export)
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animations
- Web Audio API for sound
- TypeScript, ESLint, Prettier
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
| `pnpm format`       | Format all files with Prettier               |
| `pnpm format:check` | Check formatting (CI runs this)              |

## Deployment

The site is a fully static export (`output: "export"` in `next.config.ts`) and is published to GitHub Pages by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

- Every pull request is linted, type-checked, format-checked, and built.
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
│   ├── game-context.tsx      # Game state, scoring, feedback
│   ├── settings-context.tsx  # Difficulty, best scores
│   ├── progression-context.tsx # Washi rolls, achievements, unlocks
│   ├── theme-context.tsx     # Applies the equipped roll's colors and pattern
│   ├── audio-context.tsx     # Sound effects, music
│   ├── i18n-context.tsx      # Translations
│   ├── question-generator.ts # Math problem generation
│   └── game-types.ts         # TypeScript types
├── public/sounds/            # Sound effects and background music
└── .github/workflows/        # CI and GitHub Pages deployment
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-mode`)
3. Make your changes
4. Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` to verify there are no errors
5. Submit a pull request

### Adding a new game mode

1. Add the mode to the `GameMode` type in `lib/game-types.ts`
2. Add question generation logic in `lib/question-generator.ts`
3. Create an input component in `components/game/inputs/` if needed and wire it up in `components/game/game-screen.tsx`
4. Add its color, pattern, and icon to `MODE_STYLES` in `components/game/start-screen.tsx` and `MODE_COLORS` in `components/game/mode-config-sheet.tsx`
5. Add translations to `lib/i18n-context.tsx`

### Adding a new language

1. Add the locale to the `Language` type in `lib/i18n-context.tsx`
2. Add a translations object following the existing structure
3. Add it to `LANGUAGES` in `components/game/language-toggle.tsx`

## Credits

Background music: "Morning Routine" by Ghostrifter Official, via [chosic.com](https://www.chosic.com).

## License

MIT
