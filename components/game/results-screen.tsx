"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { GameMode, GameStats } from "@/lib/game-types"
import { useSettings } from "@/lib/settings-context"
import { useAudio } from "@/lib/audio-context"
import { useI18n } from "@/lib/i18n-context"
import { useProgression, type WashiRoll } from "@/lib/progression-context"
import { PaperBackground, StickyNote, StickerButton, LabelSticker, NotebookCard } from "@/components/ui/stationery"
import { Check, Sparkles, Gift } from "lucide-react"

interface ResultsScreenProps {
  stats: GameStats
  mode: GameMode
  difficulty: number
  onPlayAgain: () => void
  onBackToMenu: () => void
}

// Pattern preview for unlocked rolls
function TapePatternPreview({ roll }: { roll: WashiRoll }) {
  const patternStyles: Record<string, string> = {
    dots: `radial-gradient(circle, ${roll.colors.secondary} 2px, transparent 2px)`,
    stripes: `repeating-linear-gradient(45deg, transparent, transparent 6px, ${roll.colors.secondary} 6px, ${roll.colors.secondary} 10px)`,
    gingham: `linear-gradient(90deg, ${roll.colors.secondary}33 50%, transparent 50%), linear-gradient(${roll.colors.secondary}33 50%, transparent 50%)`,
    confetti: `radial-gradient(circle, ${roll.colors.secondary} 1px, transparent 1px), radial-gradient(circle, ${roll.colors.highlight} 1px, transparent 1px)`,
    grid: `linear-gradient(${roll.colors.secondary} 1px, transparent 1px), linear-gradient(90deg, ${roll.colors.secondary} 1px, transparent 1px)`,
    waves: `repeating-linear-gradient(0deg, transparent, transparent 4px, ${roll.colors.secondary} 4px, ${roll.colors.secondary} 6px)`,
    hearts: `radial-gradient(circle, ${roll.colors.secondary} 2px, transparent 2px)`,
    stars: `radial-gradient(circle, ${roll.colors.secondary} 1.5px, transparent 1.5px)`,
  }

  return (
    <div className="relative h-10 w-24 overflow-hidden rounded-md" style={{ backgroundColor: roll.colors.primary }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: patternStyles[roll.pattern],
          backgroundSize:
            roll.pattern === "dots" || roll.pattern === "hearts" || roll.pattern === "stars"
              ? "10px 10px"
              : roll.pattern === "gingham" || roll.pattern === "grid"
                ? "12px 12px"
                : undefined,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
    </div>
  )
}

export function ResultsScreen({ stats, mode, difficulty, onPlayAgain, onBackToMenu }: ResultsScreenProps) {
  const { getBestScore, updateBestScore } = useSettings()
  const { play } = useAudio()
  const { t, language } = useI18n()
  const { recordGameResult } = useProgression()

  const [swatchesEarned, setSwatchesEarned] = useState(0)
  const [newUnlocks, setNewUnlocks] = useState<WashiRoll[]>([])
  const [showUnlockModal, setShowUnlockModal] = useState(false)

  const isDE = language === "de"
  const modeTranslation = t.modes[mode]
  const accuracy =
    stats.correct + stats.incorrect > 0 ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) : 0

  const currentBest = getBestScore(mode, difficulty)
  const isNewBest = stats.score > currentBest
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    // Record to progression system
    const result = recordGameResult(mode, stats.correct, stats.correct + stats.incorrect, stats.maxStreak)
    setSwatchesEarned(result.swatchesEarned)
    setNewUnlocks(result.newUnlocks)

    // Play sounds
    if (isNewBest && stats.score > 0) {
      setTimeout(() => play("newBest"), 400)
    }

    // Show unlock modal if new rolls unlocked
    if (result.newUnlocks.length > 0) {
      setTimeout(() => setShowUnlockModal(true), 1200)
    }

    updateBestScore(mode, difficulty, stats.score)
  }, [mode, difficulty, stats, updateBestScore, isNewBest, play, recordGameResult])

  const statItems = [
    { label: t.results.bestStreak, value: stats.maxStreak, cssVar: "--theme-primary" },
    { label: t.results.accuracy, value: `${accuracy}%`, cssVar: "--theme-secondary" },
    { label: t.results.correct, value: stats.correct, cssVar: "--theme-highlight" },
    { label: t.results.avgTime, value: `${stats.avgTime}ms`, cssVar: "--theme-muted" },
  ]

  return (
    <PaperBackground>
      <div className="relative flex min-h-dvh flex-1 flex-col items-center justify-center gap-5 overflow-hidden p-6">
        {/* Floating stationery decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: [0, -10, 0],
                opacity: 0.4,
                rotate: [0, i % 2 === 0 ? 8 : -8, 0],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
              className="absolute rounded-sm shadow-sm"
              style={{
                backgroundColor: `var(--theme-${i % 4 === 0 ? "primary" : i % 4 === 1 ? "secondary" : i % 4 === 2 ? "highlight" : "muted"})`,
                width: 16 + (i % 3) * 10,
                height: 16 + (i % 3) * 10,
                left: `${8 + i * 15}%`,
                top: `${10 + (i % 4) * 18}%`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <div
            className="absolute -top-3 left-1/2 h-4 w-24 -translate-x-1/2 -rotate-2 transform rounded-sm"
            style={{ backgroundColor: "var(--theme-primary)", opacity: 0.6 }}
          />
          <LabelSticker className="mb-2">{t.results.gameOver}</LabelSticker>
          <h2 className="mt-2 text-2xl font-bold text-foreground">{modeTranslation.name}</h2>
        </motion.div>

        {/* Big Score on a sticky note */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="z-10"
        >
          <StickyNote color={isNewBest ? "pink" : "yellow"} className="px-10 py-6" rotate={-2}>
            <div className="text-center">
              <p className="font-mono text-6xl font-bold text-foreground md:text-7xl">{stats.score.toLocaleString()}</p>
              <p className="mt-1 text-sm tracking-wide text-muted-foreground uppercase">{t.results.points}</p>

              {isNewBest && stats.score > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3"
                >
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold"
                    style={{ backgroundColor: "var(--theme-primary)" }}
                  >
                    ★ {t.results.newBest}
                  </span>
                </motion.div>
              )}
            </div>
          </StickyNote>
        </motion.div>

        {/* Swatches earned */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="z-10"
        >
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 shadow-sm"
            style={{ backgroundColor: "var(--theme-highlight)", opacity: 0.9 }}
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-bold text-foreground">+{swatchesEarned}</span>
            <span className="text-sm text-muted-foreground">{isDE ? "Swatches" : "swatches"}</span>
          </div>
        </motion.div>

        {/* Stats checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="z-10 w-full max-w-xs"
        >
          <NotebookCard className="p-4 shadow-md">
            <div className="space-y-3">
              {statItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-border bg-card">
                    <Check className="h-3 w-3" style={{ color: "var(--theme-primary)" }} />
                  </div>
                  <span className="flex-1 text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-mono font-bold" style={{ color: `var(${item.cssVar})` }}>
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </NotebookCard>
        </motion.div>

        {/* Streak Badge */}
        {stats.maxStreak >= 10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 5 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
            className="z-10"
          >
            <div
              className="animate-float rounded-xl border-2 border-white/30 px-6 py-3 text-lg font-bold text-foreground shadow-md"
              style={{ backgroundColor: "var(--theme-secondary)" }}
            >
              {stats.maxStreak} {t.results.streak}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="z-10 flex w-full max-w-xs flex-col gap-3"
        >
          <StickerButton
            color="mint"
            size="lg"
            onClick={() => {
              play("tap")
              onPlayAgain()
            }}
            className="w-full"
          >
            {t.results.playAgain}
          </StickerButton>

          <StickerButton
            color="blue"
            size="md"
            onClick={() => {
              play("tap")
              onBackToMenu()
            }}
            className="w-full"
          >
            {t.results.changeMode}
          </StickerButton>
        </motion.div>

        {/* New Roll Unlock Modal */}
        <AnimatePresence>
          {showUnlockModal && newUnlocks.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowUnlockModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 overflow-hidden rounded-2xl bg-card shadow-2xl"
              >
                <div className="p-6 text-center">
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--theme-primary)" }}
                  >
                    <Gift className="h-8 w-8 text-foreground" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">
                    {isDE ? "Neue Rolle freigeschaltet!" : "New Roll Unlocked!"}
                  </h3>

                  <div className="my-4 space-y-3">
                    {newUnlocks.map((roll) => (
                      <div key={roll.id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                        <TapePatternPreview roll={roll} />
                        <div className="text-left">
                          <p className="font-bold">{isDE ? roll.nameDE : roll.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{roll.pattern}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <StickerButton
                    color="mint"
                    onClick={() => {
                      play("tap")
                      setShowUnlockModal(false)
                    }}
                    className="mt-2 w-full"
                  >
                    {isDE ? "Super!" : "Awesome!"}
                  </StickerButton>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PaperBackground>
  )
}
