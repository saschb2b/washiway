"use client"

import { motion } from "framer-motion"
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
        className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-dvh cursor-pointer"
        onClick={handleTap}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-[15%] -left-4 w-32 h-4 transform -rotate-12 rounded-sm"
            style={{ backgroundColor: "var(--theme-primary)", opacity: 0.6 }}
          />
          <motion.div
            animate={{ x: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
            className="absolute top-[25%] -right-4 w-28 h-3 transform rotate-8 rounded-sm"
            style={{ backgroundColor: "var(--theme-secondary)", opacity: 0.5 }}
          />
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[30%] left-[10%] w-20 h-3 transform -rotate-6 rounded-sm"
            style={{ backgroundColor: "var(--theme-highlight)", opacity: 0.6 }}
          />
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute bottom-[20%] right-[15%] w-24 h-4 transform rotate-3 rounded-sm"
            style={{ backgroundColor: "var(--theme-muted)", opacity: 0.5 }}
          />

          <motion.div
            animate={{ y: [0, -12, 0], rotate: [-3, 2, -3] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-[10%] left-[8%]"
          >
            <div
              className="w-14 h-14 rounded-sm shadow-md transform -rotate-6"
              style={{ backgroundColor: "var(--theme-primary)" }}
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
            className="absolute top-[12%] right-[10%]"
          >
            <div
              className="w-12 h-12 rounded-sm shadow-md transform rotate-8"
              style={{ backgroundColor: "var(--theme-secondary)", opacity: 0.8 }}
            />
          </motion.div>

          {/* Pencil */}
          <motion.div
            animate={{ rotate: [8, 15, 8], y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[35%] left-[12%] w-20 h-2.5 bg-pastel-peach rounded-full shadow-sm transform rotate-12"
          >
            <div className="absolute right-0 w-3 h-full bg-foreground/15 rounded-r-full" />
            <div
              className="absolute left-0 w-2 h-full rounded-l-full"
              style={{ backgroundColor: "var(--theme-highlight)" }}
            />
          </motion.div>

          {/* Paper clip */}
          <motion.div
            animate={{ rotate: [-5, 8, -5] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[45%] right-[8%] w-3 h-8 rounded-full"
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
            className="px-5 py-2 bg-card/80 rounded-lg border border-border shadow-sm"
          >
            <p className="text-muted-foreground text-center text-lg italic">{t.splash.tagline}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex gap-2 mt-4"
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
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold shadow-sm border border-white/30"
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
              className="relative px-8 py-4 rounded-xl shadow-md border border-white/30"
              style={{ backgroundColor: "var(--theme-primary)", opacity: 0.9 }}
            >
              {/* Shine notch */}
              <div className="absolute top-2 right-4 w-5 h-1.5 bg-white/40 rounded-full transform -rotate-12" />
              <p className="text-base font-semibold text-foreground">{t.splash.tapToStart}</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </PaperBackground>
  )
}
