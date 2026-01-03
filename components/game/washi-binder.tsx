"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Lock, Check, Sparkles } from "lucide-react"
import { useProgression, WASHI_ROLLS, ALL_ACHIEVEMENTS, type WashiRoll } from "@/lib/progression-context"
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
  const half = s / 2

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

function TapePatternPreview({ roll, size = "md" }: { roll: WashiRoll; size?: "sm" | "md" | "lg" }) {
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
      <svg className="absolute left-0 top-0 h-full w-2" preserveAspectRatio="none" viewBox="0 0 8 100">
        <path
          d="M8 0 L8 100 L6 98 L4 100 L2 97 L0 100 L2 95 L0 92 L3 88 L0 85 L2 80 L0 75 L3 72 L0 68 L2 65 L0 60 L3 55 L0 50 L2 45 L0 40 L3 35 L0 30 L2 25 L0 20 L3 15 L0 10 L2 5 L0 0 Z"
          fill={roll.colors.primary}
        />
      </svg>

      {/* Torn right edge */}
      <svg className="absolute right-0 top-0 h-full w-2" preserveAspectRatio="none" viewBox="0 0 8 100">
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
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Binder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-background rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Binder spine decoration */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-pastel-peach to-pastel-peach/50">
              <div className="absolute inset-y-4 left-1 w-1 flex flex-col justify-around">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-background shadow-inner" />
                ))}
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 pl-6 border-b border-border">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">{isDE ? "Mein Washi Binder" : "My Washi Binder"}</h2>
                {/* Swatches counter */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pastel-yellow/60 rounded-full">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-sm text-foreground">{swatches}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  play("tap")
                  onClose()
                }}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pl-6 pt-3">
              {(["rolls", "achievements"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    play("tap")
                    setActiveTab(tab)
                  }}
                  className={cn(
                    "px-4 py-2 rounded-t-lg font-semibold text-sm transition-all border-2 border-b-0",
                    activeTab === tab
                      ? "bg-card border-border shadow-sm -mb-[2px] relative z-10"
                      : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {tab === "rolls" ? (isDE ? "Tape Rollen" : "Tape Rolls") : isDE ? "Erfolge" : "Achievements"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-card border-t-2 border-border ml-3 rounded-tl-lg">
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
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              "relative p-3 rounded-xl border-2 text-left transition-all",
              isUnlocked
                ? isSelected
                  ? "border-foreground/30 bg-pastel-mint/20 shadow-md"
                  : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
                : "border-border/50 bg-muted/30 opacity-70",
            )}
          >
            {/* Selected indicator */}
            {isSelected && isUnlocked && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-pastel-mint flex items-center justify-center">
                <Check className="w-4 h-4 text-foreground" />
              </div>
            )}

            {/* Lock indicator - only show if NOT unlocked */}
            {!isUnlocked && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Tape preview - only grayscale when locked */}
              <div className={cn(!isUnlocked && "grayscale opacity-50")}>
                <TapePatternPreview roll={roll} size="md" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={cn("font-bold text-sm", !isUnlocked && "text-muted-foreground")}>
                  {isDE ? roll.nameDE : roll.name}
                </h3>

                {/* Only show unlock requirement for locked rolls */}
                {!isUnlocked && (
                  <div className="mt-1.5">
                    <p className="text-xs text-muted-foreground mb-1">
                      {isDE ? roll.unlockRequirement.descriptionDE : roll.unlockRequirement.description}
                    </p>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pastel-blue transition-all"
                        style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {progress.current} / {progress.target}
                    </p>
                  </div>
                )}

                {/* Show "Equipped" or "Tap to equip" for unlocked rolls */}
                {isUnlocked && !isSelected && (
                  <p className="text-xs text-muted-foreground mt-1">{isDE ? "Tippen zum Auswählen" : "Tap to equip"}</p>
                )}
                {isUnlocked && isSelected && (
                  <p className="text-xs text-pastel-mint font-medium mt-1">{isDE ? "Ausgerüstet" : "Equipped"}</p>
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
  getProgress: (achievement: { id: string; type: string; target: number }) => {
    current: number
    target: number
    complete: boolean
  }
  isDE: boolean
}

function AchievementsTab({ getProgress, isDE }: AchievementsTabProps) {
  return (
    <div className="p-4 space-y-2">
      {ALL_ACHIEVEMENTS.map((achievement) => {
        const progress = getProgress(achievement)

        return (
          <div
            key={achievement.id}
            className={cn(
              "p-3 rounded-lg border-2 transition-all",
              progress.complete ? "border-pastel-mint/50 bg-pastel-mint/10" : "border-border bg-card",
            )}
          >
            <div className="flex items-start gap-3">
              {/* Status icon */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  progress.complete ? "bg-pastel-mint" : "bg-muted",
                )}
              >
                {progress.complete ? (
                  <Check className="w-4 h-4 text-foreground" />
                ) : (
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">{isDE ? achievement.nameDE : achievement.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {isDE ? achievement.descriptionDE : achievement.description}
                </p>

                {/* Progress bar */}
                {!progress.complete && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pastel-blue transition-all"
                        style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
