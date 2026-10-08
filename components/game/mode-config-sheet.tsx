"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useSettings } from "@/lib/settings-context"
import { useSkills } from "@/lib/skill-context"
import { type GameMode, SKILLS, type Skill } from "@/lib/math"
import { cn } from "@/lib/utils"
import { useAudio } from "@/lib/audio-context"
import { useI18n } from "@/lib/i18n-context"
import { LabelSticker, StickerButton, TabDividers, StickyNote } from "@/components/ui/stationery"
import { MODE_STYLES, TAPE_BG } from "./mode-styles"

interface ModeConfigSheetProps {
  mode: GameMode | null
  onClose: () => void
  onStart: (mode: GameMode, timed: boolean) => void
}

function LevelBar({ level, className }: { level: number; className?: string }) {
  const progress = level >= 10 ? 1 : level - Math.floor(level)
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-black/10", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        className="h-full rounded-full"
        style={{ backgroundColor: "var(--theme-secondary)" }}
      />
    </div>
  )
}

export function ModeConfigSheet({ mode, onClose, onStart }: ModeConfigSheetProps) {
  const [lastMode, setLastMode] = useState<GameMode | null>(mode)
  const [timed, setTimed] = useState(true)
  const { getBestScore } = useSettings()
  const { records } = useSkills()
  const { play } = useAudio()
  const { t } = useI18n()

  if (mode !== null && mode !== lastMode) {
    setLastMode(mode)
  }

  // Keep showing the last mode while the sheet slides away.
  const displayMode = mode ?? lastMode ?? "quick"
  const modeText = t.modes[displayMode]
  const modeStyle = MODE_STYLES[displayMode]
  const bestScore = getBestScore(displayMode)

  return (
    <AnimatePresence>
      {mode !== null && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto"
          >
            <div className="relative rounded-t-[1.5rem] border-t-2 border-border bg-paper-alt shadow-2xl">
              {/* Paper texture */}
              <div
                className="pointer-events-none absolute inset-0 rounded-t-[1.5rem] opacity-[0.02]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />

              <div className="relative z-10 flex justify-center pt-3 pb-2">
                <div className="h-1.5 w-10 rounded-full bg-border" />
              </div>

              <div className="relative z-10 mx-auto max-w-md space-y-4 px-6 pb-8">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl font-bold",
                      TAPE_BG[modeStyle.color],
                      "border-2 border-white/30 shadow-md",
                    )}
                  >
                    {modeStyle.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{modeText.name}</h2>
                    <p className="text-sm text-muted-foreground">{modeText.description}</p>
                  </div>
                </div>

                <p className="rounded-lg border border-border bg-card px-3 py-2 text-sm leading-snug text-foreground/80">
                  {modeText.trains}
                </p>

                <div className="flex items-stretch gap-3">
                  <StickyNote color="yellow" className="flex-1 px-4 py-3" rotate={-1}>
                    {displayMode === "mix" ? (
                      <MixLevels />
                    ) : (
                      <SkillLevel skill={displayMode} level={records[displayMode].level} />
                    )}
                  </StickyNote>
                  <div className="flex w-28 flex-col items-center justify-center rounded-lg border border-border bg-card px-2 py-3">
                    <LabelSticker className="mb-1 px-2 text-[10px]">{t.config.yourBest}</LabelSticker>
                    <span className="font-mono text-2xl font-bold text-foreground">
                      {bestScore ? bestScore.toLocaleString() : "—"}
                    </span>
                    {bestScore > 0 && <span className="text-xs text-muted-foreground">{t.config.pts}</span>}
                  </div>
                </div>

                <TabDividers
                  tabs={[
                    { level: 1, label: t.config.timed, color: "bg-pastel-mint" },
                    { level: 0, label: t.config.untimed, color: "bg-pastel-blue" },
                  ]}
                  selected={timed ? 1 : 0}
                  onChange={(value) => {
                    play("tap")
                    setTimed(value === 1)
                  }}
                />

                <StickerButton
                  color="mint"
                  size="lg"
                  onClick={() => {
                    play("tap")
                    onStart(displayMode, timed)
                  }}
                  className="w-full py-5 text-xl"
                >
                  {t.config.startGame}
                </StickerButton>

                <p className="text-center text-xs text-muted-foreground">
                  {timed ? t.config.infoTimed : t.config.infoUntimed}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SkillLevel({ skill, level }: { skill: Skill; level: number }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-1.5" data-skill={skill}>
      <LabelSticker className="self-start">{t.config.level}</LabelSticker>
      <span className="font-mono text-4xl font-bold text-foreground">{Math.floor(level)}</span>
      <LevelBar level={level} />
      <span className="text-xs text-muted-foreground">{t.config.levelHint}</span>
    </div>
  )
}

function MixLevels() {
  const { t } = useI18n()
  const { records } = useSkills()
  return (
    <div className="space-y-1">
      <LabelSticker className="mb-1">{t.config.yourLevels}</LabelSticker>
      {SKILLS.map((skill) => (
        <div key={skill} className="flex items-center gap-2 text-xs">
          <span className="w-24 truncate text-foreground/80">{t.modes[skill].name}</span>
          <span className="w-4 font-mono font-bold">{Math.floor(records[skill].level)}</span>
          <LevelBar level={records[skill].level} className="flex-1" />
        </div>
      ))}
    </div>
  )
}
