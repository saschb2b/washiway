"use client"

import { motion } from "motion/react"
import { useAudio } from "@/lib/audio-context"
import { useI18n } from "@/lib/i18n-context"
import { PaperBackground, WashiwayLogo } from "@/components/ui/stationery"

interface SplashScreenProps {
  onStart: () => void
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  const { playMusic } = useAudio()
  const { t } = useI18n()

  const handleTap = () => {
    playMusic()
    onStart()
  }

  return (
    <PaperBackground>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative flex min-h-dvh flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden p-6"
        onClick={handleTap}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-[15%] -left-4 h-4 w-32 -rotate-12 transform rounded-sm"
            style={{ backgroundColor: "var(--theme-primary)", opacity: 0.6 }}
          />
          <motion.div
            animate={{ x: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
            className="absolute top-[25%] -right-4 h-3 w-28 rotate-8 transform rounded-sm"
            style={{ backgroundColor: "var(--theme-secondary)", opacity: 0.5 }}
          />
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[30%] left-[10%] h-3 w-20 -rotate-6 transform rounded-sm"
            style={{ backgroundColor: "var(--theme-highlight)", opacity: 0.6 }}
          />
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute right-[15%] bottom-[20%] h-4 w-24 rotate-3 transform rounded-sm"
            style={{ backgroundColor: "var(--theme-muted)", opacity: 0.5 }}
          />

          <motion.div
            animate={{ y: [0, -12, 0], rotate: [-3, 2, -3] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-[10%] left-[8%]"
          >
            <div
              className="h-14 w-14 -rotate-6 transform rounded-sm shadow-md"
              style={{ backgroundColor: "var(--theme-primary)" }}
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
            className="absolute top-[12%] right-[10%]"
          >
            <div
              className="h-12 w-12 rotate-8 transform rounded-sm shadow-md"
              style={{ backgroundColor: "var(--theme-secondary)", opacity: 0.8 }}
            />
          </motion.div>

          {/* Pencil */}
          <motion.div
            animate={{ rotate: [8, 15, 8], y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[35%] left-[12%] h-2.5 w-20 rotate-12 transform rounded-full bg-pastel-peach shadow-sm"
          >
            <div className="absolute right-0 h-full w-3 rounded-r-full bg-foreground/15" />
            <div
              className="absolute left-0 h-full w-2 rounded-l-full"
              style={{ backgroundColor: "var(--theme-highlight)" }}
            />
          </motion.div>

          {/* Paper clip */}
          <motion.div
            animate={{ rotate: [-5, 8, -5] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[45%] right-[8%] h-8 w-3 rounded-full"
            style={{ border: "2px solid var(--theme-secondary)", opacity: 0.6 }}
          />
        </div>

        {/* Main content */}
        <div className="z-10 flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <WashiwayLogo size="lg" />
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="rounded-lg border border-border bg-card/80 px-5 py-2 shadow-sm"
          >
            <p className="text-center text-lg text-muted-foreground italic">{t.splash.tagline}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 flex gap-2"
          >
            {[
              { symbol: "+", cssVar: "--theme-primary" },
              { symbol: "−", cssVar: "--theme-secondary" },
              { symbol: "×", cssVar: "--theme-highlight" },
              { symbol: "÷", cssVar: "--theme-muted" },
            ].map((item, i) => (
              <motion.div
                key={item.symbol}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.15 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 text-xl font-bold shadow-sm"
                style={{ backgroundColor: `var(${item.cssVar})` }}
              >
                {item.symbol}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-10"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="relative rounded-xl border border-white/30 px-8 py-4 shadow-md"
              style={{ backgroundColor: "var(--theme-primary)", opacity: 0.9 }}
            >
              {/* Shine notch */}
              <div className="absolute top-2 right-4 h-1.5 w-5 -rotate-12 transform rounded-full bg-white/40" />
              <p className="text-base font-semibold text-foreground">{t.splash.tapToStart}</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </PaperBackground>
  )
}
