"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Lock, Check, Sparkles } from "lucide-react"
import {
  useProgression,
  WASHI_ROLLS,
  ALL_ACHIEVEMENTS,
  type Achievement,
  type WashiRoll,
} from "@/lib/progression-context"
import { useI18n } from "@/lib/i18n-context"
import { useAudio } from "@/lib/audio-context"
import { cn } from "@/lib/utils"

interface WashiBinderProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = "rolls" | "achievements"

function PatternIcon({ pattern, color, size }: { pattern: WashiRoll["pattern"]; color: string; size: number }) {
  const s = size

  const patterns: Record<string, React.ReactNode> = {
    // Mint leaves - small leaf shapes
    mint: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <ellipse cx="8" cy="8" rx="3" ry="5" fill={color} transform="rotate(-15 8 8)" />
        <line x1="8" y1="4" x2="8" y2="13" stroke="white" strokeWidth="0.8" opacity="0.4" />
      </svg>
    ),
    // Pokeball silhouettes
    pokeballs: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="5" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="3" y1="8" x2="13" y2="8" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2" fill={color} />
      </svg>
    ),
    // Cat faces
    cats: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <circle cx="8" cy="9" r="4" fill={color} />
        <polygon points="4,5 5.5,9 3,9" fill={color} />
        <polygon points="12,5 10.5,9 13,9" fill={color} />
        <circle cx="6.5" cy="8.5" r="0.8" fill="white" />
        <circle cx="9.5" cy="8.5" r="0.8" fill="white" />
      </svg>
    ),
    // Dog paw prints
    dogs: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <ellipse cx="8" cy="10" rx="3" ry="2.5" fill={color} />
        <circle cx="5" cy="6" r="1.5" fill={color} />
        <circle cx="8" cy="5" r="1.5" fill={color} />
        <circle cx="11" cy="6" r="1.5" fill={color} />
      </svg>
    ),
    // Frog faces
    frogs: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <ellipse cx="8" cy="9" rx="5" ry="4" fill={color} />
        <circle cx="5" cy="5" r="2.5" fill={color} />
        <circle cx="11" cy="5" r="2.5" fill={color} />
        <circle cx="5" cy="5" r="1" fill="white" />
        <circle cx="11" cy="5" r="1" fill="white" />
      </svg>
    ),
    // Simple flowers
    flowers: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <circle cx="8" cy="5" r="2.5" fill={color} />
        <circle cx="5" cy="8" r="2.5" fill={color} />
        <circle cx="11" cy="8" r="2.5" fill={color} />
        <circle cx="8" cy="11" r="2.5" fill={color} />
        <circle cx="8" cy="8" r="1.5" fill="white" />
      </svg>
    ),
    // Snowflakes
    snowflakes: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <line x1="8" y1="2" x2="8" y2="14" stroke={color} strokeWidth="1.5" />
        <line x1="2" y1="8" x2="14" y2="8" stroke={color} strokeWidth="1.5" />
        <line x1="4" y1="4" x2="12" y2="12" stroke={color} strokeWidth="1" />
        <line x1="12" y1="4" x2="4" y2="12" stroke={color} strokeWidth="1" />
      </svg>
    ),
    // Cute bees
    bees: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <ellipse cx="8" cy="9" rx="4" ry="3" fill={color} />
        <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="white" strokeWidth="1.2" />
        <line x1="5.5" y1="10" x2="10.5" y2="10" stroke="white" strokeWidth="1.2" />
        <circle cx="6" cy="6" r="1.5" fill={color} opacity="0.6" />
        <circle cx="10" cy="6" r="1.5" fill={color} opacity="0.6" />
      </svg>
    ),
    // Autumn leaves
    leaves: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <ellipse cx="8" cy="8" rx="3" ry="5" fill={color} transform="rotate(25 8 8)" />
        <line x1="8" y1="4" x2="8" y2="13" stroke="white" strokeWidth="0.8" opacity="0.4" />
      </svg>
    ),
    // Music notes
    music: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <ellipse cx="6" cy="11" rx="2.5" ry="2" fill={color} transform="rotate(-15 6 11)" />
        <line x1="8.5" y1="10" x2="8.5" y2="3" stroke={color} strokeWidth="1.5" />
        <path d="M8.5 3 Q12 2 12 5" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
    ),
    // Stars
    stars: (
      <svg width={s} height={s} viewBox="0 0 16 16">
        <polygon points="8,1 9.5,6 14,6 10.5,9 12,14 8,11 4,14 5.5,9 2,6 6.5,6" fill={color} />
      </svg>
    ),
  }

  return patterns[pattern] || patterns.mint
}

export function TapePatternPreview({ roll, size = "md" }: { roll: WashiRoll; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-10 w-24",
    md: "h-12 w-32",
    lg: "h-14 w-40",
  }

  const patternSize = size === "sm" ? 14 : size === "md" ? 16 : 18
  const offsetAmount = patternSize / 2

  return (
    <div
      className={cn("relative overflow-hidden rounded-sm", sizeClasses[size])}
      style={{ backgroundColor: roll.colors.primary }}
    >
      {/* Torn left edge */}
      <svg className="absolute top-0 left-0 h-full w-2" preserveAspectRatio="none" viewBox="0 0 8 100">
        <path
          d="M8 0 L8 100 L6 98 L4 100 L2 97 L0 100 L2 95 L0 92 L3 88 L0 85 L2 80 L0 75 L3 72 L0 68 L2 65 L0 60 L3 55 L0 50 L2 45 L0 40 L3 35 L0 30 L2 25 L0 20 L3 15 L0 10 L2 5 L0 0 Z"
          fill={roll.colors.primary}
        />
      </svg>

      {/* Torn right edge */}
      <svg className="absolute top-0 right-0 h-full w-2" preserveAspectRatio="none" viewBox="0 0 8 100">
        <path
          d="M0 0 L0 100 L2 98 L4 100 L6 97 L8 100 L6 95 L8 92 L5 88 L8 85 L6 80 L8 75 L5 72 L8 68 L6 65 L8 60 L5 55 L8 50 L6 45 L8 40 L5 35 L8 30 L6 25 L8 20 L5 15 L8 10 L6 5 L8 0 Z"
          fill={roll.colors.primary}
        />
      </svg>

      {/* Pattern with offset rows */}
      <div className="absolute inset-0 flex flex-col justify-center">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="flex items-center gap-1"
            style={{
              marginLeft: row % 2 === 1 ? offsetAmount : 0,
              marginTop: row === 0 ? 0 : -2,
            }}
          >
            {[...Array(8)].map((_, col) => (
              <PatternIcon key={col} pattern={roll.pattern} color={roll.colors.secondary} size={patternSize} />
            ))}
          </div>
        ))}
      </div>

      {/* Tape sheen - glossy effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
    </div>
  )
}

export function WashiBinder({ isOpen, onClose }: WashiBinderProps) {
  const [activeTab, setActiveTab] = useState<TabType>("rolls")
  const { language } = useI18n()
  const { play } = useAudio()
  const { swatches, unlockedRolls, selectedRoll, setSelectedRoll, getAchievementProgress } = useProgression()

  const isDE = language === "de"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Binder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl bg-background shadow-2xl md:inset-8 lg:inset-16"
          >
            {/* Binder spine decoration */}
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-pastel-peach to-pastel-peach/50">
              <div className="absolute inset-y-4 left-1 flex w-1 flex-col justify-around">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-background shadow-inner" />
                ))}
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4 pl-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">{isDE ? "Mein Washi Binder" : "My Washi Binder"}</h2>
                {/* Swatches counter */}
                <div className="flex items-center gap-1.5 rounded-full bg-pastel-yellow/60 px-3 py-1.5">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-bold text-foreground">{swatches}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  play("tap")
                  onClose()
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-3 pl-6">
              {(["rolls", "achievements"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    play("tap")
                    setActiveTab(tab)
                  }}
                  className={cn(
                    "rounded-t-lg border-2 border-b-0 px-4 py-2 text-sm font-semibold transition-all",
                    activeTab === tab
                      ? "relative z-10 -mb-[2px] border-border bg-card shadow-sm"
                      : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {tab === "rolls" ? (isDE ? "Tape Rollen" : "Tape Rolls") : isDE ? "Erfolge" : "Achievements"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="ml-3 flex-1 overflow-auto rounded-tl-lg border-t-2 border-border bg-card">
              {activeTab === "rolls" ? (
                <RollsTab
                  unlockedRolls={unlockedRolls}
                  selectedRoll={selectedRoll}
                  onSelectRoll={(id) => {
                    play("correct")
                    setSelectedRoll(id)
                  }}
                  isDE={isDE}
                />
              ) : (
                <AchievementsTab getProgress={getAchievementProgress} isDE={isDE} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface RollsTabProps {
  unlockedRolls: string[]
  selectedRoll: string
  onSelectRoll: (id: string) => void
  isDE: boolean
}

function RollsTab({ unlockedRolls, selectedRoll, onSelectRoll, isDE }: RollsTabProps) {
  const { getAchievementProgress } = useProgression()

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
      {WASHI_ROLLS.map((roll) => {
        const isUnlocked = roll.id === "starter-mint" || unlockedRolls.includes(roll.id)
        const isSelected = selectedRoll === roll.id
        const progress = getAchievementProgress(roll.unlockRequirement)

        return (
          <motion.button
            key={roll.id}
            onClick={() => isUnlocked && onSelectRoll(roll.id)}
            disabled={!isUnlocked}
            whileTap={isUnlocked ? { scale: 0.98 } : undefined}
            className={cn(
              "relative rounded-xl border-2 p-3 text-left transition-all",
              isUnlocked
                ? isSelected
                  ? "border-foreground/30 bg-pastel-mint/20 shadow-md"
                  : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
                : "border-border/50 bg-muted/30 opacity-70",
            )}
          >
            {/* Selected indicator */}
            {isSelected && isUnlocked && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-pastel-mint">
                <Check className="h-4 w-4 text-foreground" />
              </div>
            )}

            {/* Lock indicator - only show if NOT unlocked */}
            {!isUnlocked && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Tape preview - only grayscale when locked */}
              <div className={cn(!isUnlocked && "opacity-50 grayscale")}>
                <TapePatternPreview roll={roll} size="md" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className={cn("text-sm font-bold", !isUnlocked && "text-muted-foreground")}>
                  {isDE ? roll.nameDE : roll.name}
                </h3>

                {/* Only show unlock requirement for locked rolls */}
                {!isUnlocked && (
                  <div className="mt-1.5">
                    <p className="mb-1 text-xs text-muted-foreground">
                      {isDE ? roll.unlockRequirement.descriptionDE : roll.unlockRequirement.description}
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-pastel-blue transition-all"
                        style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {progress.current} / {progress.target}
                    </p>
                  </div>
                )}

                {/* Show "Equipped" or "Tap to equip" for unlocked rolls */}
                {isUnlocked && !isSelected && (
                  <p className="mt-1 text-xs text-muted-foreground">{isDE ? "Tippen zum Auswählen" : "Tap to equip"}</p>
                )}
                {isUnlocked && isSelected && (
                  <p className="mt-1 text-xs font-medium text-pastel-mint">{isDE ? "Ausgerüstet" : "Equipped"}</p>
                )}
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

interface AchievementsTabProps {
  getProgress: (achievement: Achievement) => {
    current: number
    target: number
    complete: boolean
  }
  isDE: boolean
}

function AchievementsTab({ getProgress, isDE }: AchievementsTabProps) {
  return (
    <div className="space-y-2 p-4">
      {ALL_ACHIEVEMENTS.map((achievement) => {
        const progress = getProgress(achievement)

        return (
          <div
            key={achievement.id}
            className={cn(
              "rounded-lg border-2 p-3 transition-all",
              progress.complete ? "border-pastel-mint/50 bg-pastel-mint/10" : "border-border bg-card",
            )}
          >
            <div className="flex items-start gap-3">
              {/* Status icon */}
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  progress.complete ? "bg-pastel-mint" : "bg-muted",
                )}
              >
                {progress.complete ? (
                  <Check className="h-4 w-4 text-foreground" />
                ) : (
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold">{isDE ? achievement.nameDE : achievement.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {isDE ? achievement.descriptionDE : achievement.description}
                </p>

                {/* Progress bar */}
                {!progress.complete && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-pastel-blue transition-all"
                        style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {progress.current} / {progress.target}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
