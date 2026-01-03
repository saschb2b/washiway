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

function PatternSVG({ pattern, color }: { pattern: WashiRoll["pattern"]; color: string }) {
  const patterns: Record<string, React.ReactNode> = {
    // Pokeball silhouettes
    pokeballs: (
      <pattern id="pokeballs" patternUnits="userSpaceOnUse" width="20" height="20">
        <circle cx="10" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.5" />
        <line x1="3" y1="10" x2="17" y2="10" stroke={color} strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2.5" fill={color} />
      </pattern>
    ),
    // Cat faces
    cats: (
      <pattern id="cats" patternUnits="userSpaceOnUse" width="24" height="24">
        <circle cx="12" cy="14" r="6" fill={color} />
        <polygon points="6,8 8,14 4,14" fill={color} />
        <polygon points="18,8 16,14 20,14" fill={color} />
        <circle cx="10" cy="13" r="1" fill="white" />
        <circle cx="14" cy="13" r="1" fill="white" />
        <ellipse cx="12" cy="15.5" rx="1" ry="0.7" fill="white" />
      </pattern>
    ),
    // Dog paw prints
    dogs: (
      <pattern id="dogs" patternUnits="userSpaceOnUse" width="22" height="22">
        <ellipse cx="11" cy="14" rx="4" ry="3.5" fill={color} />
        <circle cx="6" cy="9" r="2" fill={color} />
        <circle cx="11" cy="7" r="2" fill={color} />
        <circle cx="16" cy="9" r="2" fill={color} />
      </pattern>
    ),
    // Frog faces
    frogs: (
      <pattern id="frogs" patternUnits="userSpaceOnUse" width="24" height="20">
        <ellipse cx="12" cy="12" rx="8" ry="6" fill={color} />
        <circle cx="7" cy="7" r="3" fill={color} />
        <circle cx="17" cy="7" r="3" fill={color} />
        <circle cx="7" cy="7" r="1.5" fill="white" />
        <circle cx="17" cy="7" r="1.5" fill="white" />
        <ellipse cx="12" cy="13" rx="2" ry="1" fill="white" opacity="0.6" />
      </pattern>
    ),
    // Simple flowers
    flowers: (
      <pattern id="flowers" patternUnits="userSpaceOnUse" width="20" height="20">
        <circle cx="10" cy="7" r="3" fill={color} />
        <circle cx="7" cy="10" r="3" fill={color} />
        <circle cx="13" cy="10" r="3" fill={color} />
        <circle cx="10" cy="13" r="3" fill={color} />
        <circle cx="10" cy="10" r="2" fill="white" />
      </pattern>
    ),
    // Snowflakes
    snowflakes: (
      <pattern id="snowflakes" patternUnits="userSpaceOnUse" width="24" height="24">
        <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="1.5" />
        <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.5" />
        <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="1.5" />
        <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" fill={color} />
      </pattern>
    ),
    // Cute bees
    bees: (
      <pattern id="bees" patternUnits="userSpaceOnUse" width="22" height="22">
        <ellipse cx="11" cy="12" rx="5" ry="4" fill={color} />
        <line x1="8" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.5" />
        <line x1="8" y1="13" x2="14" y2="13" stroke="white" strokeWidth="1.5" />
        <circle cx="8" cy="9" r="2" fill={color} opacity="0.5" />
        <circle cx="14" cy="9" r="2" fill={color} opacity="0.5" />
      </pattern>
    ),
    // Autumn leaves
    leaves: (
      <pattern id="leaves" patternUnits="userSpaceOnUse" width="20" height="20">
        <ellipse cx="10" cy="10" rx="4" ry="6" fill={color} transform="rotate(30 10 10)" />
        <line x1="10" y1="5" x2="10" y2="16" stroke="white" strokeWidth="1" opacity="0.5" />
      </pattern>
    ),
    // Music notes
    music: (
      <pattern id="music" patternUnits="userSpaceOnUse" width="24" height="24">
        <ellipse cx="8" cy="16" rx="3" ry="2.5" fill={color} transform="rotate(-20 8 16)" />
        <line x1="11" y1="15" x2="11" y2="6" stroke={color} strokeWidth="1.5" />
        <path d="M11 6 Q15 5 15 9" stroke={color} strokeWidth="1.5" fill="none" />
      </pattern>
    ),
    // Stars
    stars: (
      <pattern id="stars" patternUnits="userSpaceOnUse" width="20" height="20">
        <polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill={color} />
      </pattern>
    ),
  }

  return (
    <svg width="0" height="0">
      <defs>{patterns[pattern]}</defs>
    </svg>
  )
}

function TapePatternPreview({ roll, size = "md" }: { roll: WashiRoll; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-12 w-28",
    lg: "h-16 w-36",
  }

  return (
    <div
      className={cn("rounded-md relative overflow-hidden", sizeClasses[size])}
      style={{ backgroundColor: roll.colors.primary }}
    >
      <PatternSVG pattern={roll.pattern} color={roll.colors.secondary} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(getPatternSVGString(roll.pattern, roll.colors.secondary))}")`,
          backgroundSize: getPatternSize(roll.pattern),
        }}
      />
      {/* Tape sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
      {/* Torn edges */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-black/[0.08]" />
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-black/[0.08]" />
    </div>
  )
}

function getPatternSVGString(pattern: WashiRoll["pattern"], color: string): string {
  const patterns: Record<string, string> = {
    pokeballs: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="7" fill="none" stroke="${color}" strokeWidth="1.5"/><line x1="3" y1="10" x2="17" y2="10" stroke="${color}" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" fill="${color}"/></svg>`,
    cats: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="14" r="6" fill="${color}"/><polygon points="6,8 8,14 4,14" fill="${color}"/><polygon points="18,8 16,14 20,14" fill="${color}"/><circle cx="10" cy="13" r="1" fill="white"/><circle cx="14" cy="13" r="1" fill="white"/><ellipse cx="12" cy="15.5" rx="1" ry="0.7" fill="white"/></svg>`,
    dogs: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><ellipse cx="11" cy="14" rx="4" ry="3.5" fill="${color}"/><circle cx="6" cy="9" r="2" fill="${color}"/><circle cx="11" cy="7" r="2" fill="${color}"/><circle cx="16" cy="9" r="2" fill="${color}"/></svg>`,
    frogs: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20"><ellipse cx="12" cy="12" rx="8" ry="6" fill="${color}"/><circle cx="7" cy="7" r="3" fill="${color}"/><circle cx="17" cy="7" r="3" fill="${color}"/><circle cx="7" cy="7" r="1.5" fill="white"/><circle cx="17" cy="7" r="1.5" fill="white"/><ellipse cx="12" cy="13" rx="2" ry="1" fill="white" opacity="0.6"/></svg>`,
    flowers: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="7" r="3" fill="${color}"/><circle cx="7" cy="10" r="3" fill="${color}"/><circle cx="13" cy="10" r="3" fill="${color}"/><circle cx="10" cy="13" r="3" fill="${color}"/><circle cx="10" cy="10" r="2" fill="white"/></svg>`,
    snowflakes: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><line x1="12" y1="4" x2="12" y2="20" stroke="${color}" strokeWidth="1.5"/><line x1="4" y1="12" x2="20" y2="12" stroke="${color}" strokeWidth="1.5"/><line x1="6" y1="6" x2="18" y2="18" stroke="${color}" strokeWidth="1.5"/><line x1="18" y1="6" x2="6" y2="18" stroke="${color}" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="${color}"/></svg>`,
    bees: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><ellipse cx="11" cy="12" rx="5" ry="4" fill="${color}"/><line x1="8" y1="11" x2="14" y2="11" stroke="white" strokeWidth="1.5"/><line x1="8" y1="13" x2="14" y2="13" stroke="white" strokeWidth="1.5"/><circle cx="8" cy="9" r="2" fill="${color}" opacity="0.5"/><circle cx="14" cy="9" r="2" fill="${color}" opacity="0.5"/></svg>`,
    leaves: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><ellipse cx="10" cy="10" rx="4" ry="6" fill="${color}" transform="rotate(30 10 10)"/><line x1="10" y1="5" x2="10" y2="16" stroke="white" strokeWidth="1" opacity="0.5"/></svg>`,
    music: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><ellipse cx="8" cy="16" rx="3" ry="2.5" fill="${color}" transform="rotate(-20 8 16)"/><line x1="11" y1="15" x2="11" y2="6" stroke="${color}" strokeWidth="1.5"/><path d="M11 6 Q15 5 15 9" stroke="${color}" strokeWidth="1.5" fill="none"/></svg>`,
    stars: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="${color}"/></svg>`,
  }
  return patterns[pattern] || patterns.stars
}

function getPatternSize(pattern: WashiRoll["pattern"]): string {
  const sizes: Record<string, string> = {
    pokeballs: "20px 20px",
    cats: "24px 24px",
    dogs: "22px 22px",
    frogs: "24px 20px",
    flowers: "20px 20px",
    snowflakes: "24px 24px",
    bees: "22px 22px",
    leaves: "20px 20px",
    music: "24px 24px",
    stars: "20px 20px",
  }
  return sizes[pattern] || "20px 20px"
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
        const isUnlocked = unlockedRolls.includes(roll.id)
        const isSelected = selectedRoll === roll.id
        const progress = getAchievementProgress(roll.unlockRequirement)

        return (
          <motion.button
            key={roll.id}
            onClick={() => isUnlocked && onSelectRoll(roll.id)}
            disabled={!isUnlocked}
            whileTap={isUnlocked ? { scale: 0.98 } : undefined}
            className={cn(
              "relative p-4 rounded-xl border-2 text-left transition-all",
              isUnlocked
                ? isSelected
                  ? "border-foreground/30 bg-pastel-mint/20 shadow-md"
                  : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
                : "border-border/50 bg-muted/30 opacity-70",
            )}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-pastel-mint flex items-center justify-center">
                <Check className="w-4 h-4 text-foreground" />
              </div>
            )}

            {/* Lock indicator */}
            {!isUnlocked && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Tape preview */}
              <div className={cn(!isUnlocked && "grayscale opacity-50")}>
                <TapePatternPreview roll={roll} size="md" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={cn("font-bold text-sm", !isUnlocked && "text-muted-foreground")}>
                  {isDE ? roll.nameDE : roll.name}
                </h3>
                <p className="text-xs text-muted-foreground capitalize">{roll.pattern}</p>

                {/* Unlock requirement / progress */}
                {!isUnlocked && (
                  <div className="mt-2">
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
