# Washiway

A cozy, mobile-first math reaction game with a kawaii stationery aesthetic. Race against time to solve math problems, build streaks, and beat your personal best.

**Find your flow. Stick with the streak.**

## Features

- **5 Game Modes**: True or False, Pick the Bigger, Quick Solve, Find the Blank, Chain Mode
- **Difficulty Scaling**: 5 levels from Cozy to Expert, with dynamic in-game scaling based on streak
- **Stationery Theme**: Washi tape UI elements, paper textures, sticky notes, and pastel colors
- **Juicy Feedback**: Satisfying animations, sound effects, streak indicators, and burst mode bonuses
- **i18n Support**: English and German translations
- **Personal Bests**: Tracked per mode and difficulty combination

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Audio**: Web Audio API
- **State**: React Context (game state, settings, audio, i18n)

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to play.

## Project Structure

```
├── app/                    # Next.js app router
├── components/
│   ├── game/              # Game screens and inputs
│   │   ├── inputs/        # Mode-specific input components
│   │   └── ...            # Screens, overlays, UI pieces
│   ├── ui/                # shadcn/ui + stationery components
│   └── math-game.tsx      # Main game orchestrator
├── lib/
│   ├── game-context.tsx   # Game state, scoring, feedback
│   ├── settings-context.tsx # Difficulty, best scores
│   ├── audio-context.tsx  # Sound effects, music
│   ├── i18n-context.tsx   # Translations
│   ├── question-generator.ts # Math problem generation
│   └── game-types.ts      # TypeScript types
└── public/sounds/         # Audio assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-mode`)
3. Make your changes
4. Run `pnpm build` to verify no errors
5. Submit a pull request

### Adding a New Game Mode

1. Add the mode to `GameMode` type in `lib/game-types.ts`
2. Add question generation logic in `lib/question-generator.ts`
3. Create input component in `components/game/inputs/` if needed
4. Add mode config to `GAME_MODES` in `components/game/start-screen.tsx`
5. Add translations to `lib/i18n-context.tsx`

### Adding a New Language

1. Add locale to `Locale` type in `lib/i18n-context.tsx`
2. Add translations object following the existing structure
3. Update `LanguageToggle` component

## License

MIT
