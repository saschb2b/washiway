"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSettings } from "@/lib/settings-context"
import type { GameMode } from "@/lib/game-types"
import { cn } from "@/lib/utils"
import { useAudio } from "@/lib/audio-context"
import { useI18n } from "@/lib/i18n-context"
import { LabelSticker, StickerButton, TabDividers, StickyNote } from "@/components/ui/stationery"

interface ModeConfigSheetProps {
  mode: GameMode | null
  onClose: () => void
  onStart: (mode: GameMode) => void
}

const MODE_COLORS: Record<GameMode, { color: string; icon: string }> = {
  truth: { color: "bg-pastel-blue", icon: "?" },
  compare: { color: "bg-pastel-pink", icon: "⟷" },
  digit: { color: "bg-pastel-mint", icon: "#" },
  missing: { color: "bg-pastel-peach", icon: "_" },
  combo: { color: "bg-pastel-lavender", icon: "★" },
  match: { color: "bg-pastel-yellow", icon: "≡" },
}

export function ModeConfigSheet({ mode, onClose, onStart }: ModeConfigSheetProps) {
  const [lastMode, setLastMode] = useState<GameMode | null>(mode)
  const { baseDifficulty, setBaseDifficulty, getBestScore } = useSettings()
  const { play } = useAudio()
  const { t } = useI18n()

  if (mode !== null && mode !== lastMode) {
    setLastMode(mode)
  }

  // Use lastMode for rendering content so it stays visible during exit
  const displayMode = mode ?? lastMode ?? "truth"
  const modeTranslation = t.modes[displayMode]
  const modeStyle = MODE_COLORS[displayMode]
  const currentBestScore = getBestScore(displayMode, baseDifficulty)

  const DIFFICULTY_TABS = [
    { level: 1, label: t.difficulty.chill, color: "bg-pastel-mint" },
    { level: 2, label: t.difficulty.easy, color: "bg-pastel-blue" },
    { level: 3, label: t.difficulty.medium, color: "bg-pastel-peach" },
    { level: 4, label: t.difficulty.hard, color: "bg-pastel-pink" },
    { level: 5, label: t.difficulty.expert, color: "bg-pastel-lavender" },
  ]

  const currentDifficulty = DIFFICULTY_TABS.find((d) => d.level === baseDifficulty) || DIFFICULTY_TABS[1]

  return (
    <AnimatePresence>
      {mode !== null && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-hidden"
          >
            <div className="relative rounded-t-[1.5rem] border-t-2 border-border bg-paper-alt shadow-2xl">
              {/* Paper texture */}
              <div
                className="pointer-events-none absolute inset-0 rounded-t-[1.5rem] opacity-[0.02]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Handle */}
              <div className="relative z-10 flex justify-center pt-3 pb-2">
                <div className="h-1.5 w-10 rounded-full bg-border" />
              </div>

              <div className="relative z-10 space-y-5 px-6 pb-8">
                {/* Mode Header */}
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold",
                      modeStyle.color,
                      "border-2 border-white/30 shadow-md",
                    )}
                  >
                    {modeStyle.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{modeTranslation.name}</h2>
                    <p className="text-sm text-muted-foreground">{modeTranslation.description}</p>
                  </div>
                </div>

                {/* Best Score as a sticky note */}
                <div className="flex justify-center">
                  <StickyNote color="yellow" className="inline-block px-6 py-4" rotate={-1}>
                    <div className="flex flex-col items-center">
                      <LabelSticker className="mb-2">{t.config.yourBest}</LabelSticker>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-4xl font-bold text-foreground">{currentBestScore || "—"}</span>
                        {currentBestScore > 0 && <span className="text-sm text-muted-foreground">{t.config.pts}</span>}
                      </div>
                      <span className="mt-1 text-xs text-muted-foreground">({currentDifficulty.label})</span>
                    </div>
                  </StickyNote>
                </div>

                {/* Difficulty Selection with Tab Dividers */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <LabelSticker color="mint">{t.config.difficulty}</LabelSticker>
                    <motion.span
                      key={baseDifficulty}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn("rounded-lg px-3 py-1 text-sm font-bold", currentDifficulty.color)}
                    >
                      {currentDifficulty.label}
                    </motion.span>
                  </div>

                  {/* Tab dividers for difficulty */}
                  <TabDividers
                    tabs={DIFFICULTY_TABS}
                    selected={baseDifficulty}
                    onChange={(level) => {
                      play("tap")
                      setBaseDifficulty(level)
                    }}
                  />

                  {/* Difficulty description */}
                  <div className="rounded-lg border border-border bg-card p-3">
                    <p className="text-center text-xs text-muted-foreground">
                      {t.config.difficultyDescriptions[baseDifficulty]}
                    </p>
                  </div>
                </div>

                {/* Start Button */}
                <StickerButton
                  color="mint"
                  size="lg"
                  onClick={() => {
                    play("tap")
                    onStart(displayMode)
                  }}
                  className="w-full py-5 text-xl"
                >
                  {t.config.startGame}
                </StickerButton>

                {/* Game info */}
                <p className="text-center text-xs text-muted-foreground">{t.config.gameInfo}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
