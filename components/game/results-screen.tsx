"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
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
    <div className="h-10 w-24 rounded-md relative overflow-hidden" style={{ backgroundColor: roll.colors.primary }}>
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
    { label: t.results.bestStreak, value: stats.maxStreak, color: "text-pastel-peach" },
    { label: t.results.accuracy, value: `${accuracy}%`, color: "text-pastel-mint" },
    { label: t.results.correct, value: stats.correct, color: "text-pastel-blue" },
    { label: t.results.avgTime, value: `${stats.avgTime}ms`, color: "text-pastel-pink" },
  ]

  return (
    <PaperBackground>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 relative overflow-hidden min-h-dvh">
        {/* Floating stationery decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
              className={cn(
                "absolute rounded-sm shadow-sm",
                i % 4 === 0 && "bg-pastel-yellow",
                i % 4 === 1 && "bg-pastel-pink",
                i % 4 === 2 && "bg-pastel-mint",
                i % 4 === 3 && "bg-pastel-blue",
              )}
              style={{
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
          className="text-center z-10 relative"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-pastel-mint/60 rounded-sm transform -rotate-2" />
          <LabelSticker className="mb-2">{t.results.gameOver}</LabelSticker>
          <h2 className="text-2xl font-bold text-foreground mt-2">{modeTranslation.name}</h2>
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
              <p className="text-6xl md:text-7xl font-bold font-mono text-foreground">{stats.score.toLocaleString()}</p>
              <p className="text-muted-foreground mt-1 text-sm uppercase tracking-wide">{t.results.points}</p>

              {isNewBest && stats.score > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3"
                >
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-pastel-mint rounded-full text-sm font-bold">
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
          <div className="flex items-center gap-2 px-4 py-2 bg-pastel-yellow/60 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-foreground">+{swatchesEarned}</span>
            <span className="text-sm text-muted-foreground">{isDE ? "Swatches" : "swatches"}</span>
          </div>
        </motion.div>

        {/* Stats checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs z-10"
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
                  <div className="w-5 h-5 rounded border-2 border-border bg-card flex items-center justify-center">
                    <Check className="w-3 h-3 text-pastel-mint" />
                  </div>
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <span className={cn("font-bold font-mono", item.color)}>{item.value}</span>
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
              className={cn(
                "px-6 py-3 rounded-xl",
                "bg-pastel-peach",
                "font-bold text-lg text-foreground",
                "shadow-md border-2 border-white/30",
                "animate-float",
              )}
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
          className="flex flex-col gap-3 w-full max-w-xs z-10"
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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setShowUnlockModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-card rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pastel-yellow flex items-center justify-center">
                    <Gift className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {isDE ? "Neue Rolle freigeschaltet!" : "New Roll Unlocked!"}
                  </h3>

                  <div className="space-y-3 my-4">
                    {newUnlocks.map((roll) => (
                      <div key={roll.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
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
                    className="w-full mt-2"
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
