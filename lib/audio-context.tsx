"use client"

import { createContext, useContext, useRef, useCallback, useEffect, useState, type ReactNode } from "react"

type SoundType = "tap" | "correct" | "wrong" | "streak" | "burst" | "gameOver" | "newBest"

interface AudioContextType {
  play: (sound: SoundType) => void
  setMuted: (muted: boolean) => void
  isMuted: boolean
  playMusic: () => void
  stopMusic: () => void
  setMusicVolume: (volume: number) => void
  isMusicPlaying: boolean
  isInitialized: boolean
}

const AudioContext = createContext<AudioContextType | null>(null)

const SOUND_MAP: Record<SoundType, string> = {
  tap: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SnappyButton2-AssJOeimOe9HKjOMso8flgDH5M6tJo.wav",
  correct: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SnappyButton3-dQSn6KU4ww4XFAe0JXBQjRF7DfZBL9.wav",
  wrong: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SnappyButton4-sLwsdiIuwunEgcacIpPrOhZTCTHMUX.wav",
  streak: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SnappyButton5-M9As8vAVMgHqR8JPHZBze95jGBCbik.wav",
  burst: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SnappyButton5-M9As8vAVMgHqR8JPHZBze95jGBCbik.wav",
  gameOver: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SnappyButton4-sLwsdiIuwunEgcacIpPrOhZTCTHMUX.wav",
  newBest: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SnappyButton5-M9As8vAVMgHqR8JPHZBze95jGBCbik.wav",
}

const MUSIC_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Morning-Routine-Lofi-Study-Music%28chosic.com%29-92GYYwByyIUxZlgh93tUtACJeWZXmx.mp3"

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioContextRef = useRef<globalThis.AudioContext | null>(null)
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map())
  const [isMuted, setIsMuted] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const initializedRef = useRef(false)

  const musicSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const musicGainRef = useRef<GainNode | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const musicBufferRef = useRef<AudioBuffer | null>(null)

  const shouldPlayMusicOnInitRef = useRef(false)

  const playMusic = useCallback(() => {
    // If not initialized yet, set flag to play after init
    if (!audioContextRef.current || !musicBufferRef.current) {
      shouldPlayMusicOnInitRef.current = true
      return
    }

    if (isMusicPlaying) return

    try {
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }

      // Stop any existing music
      if (musicSourceRef.current) {
        musicSourceRef.current.stop()
      }

      const source = audioContextRef.current.createBufferSource()
      const gainNode = audioContextRef.current.createGain()

      source.buffer = musicBufferRef.current
      source.loop = true
      gainNode.gain.value = isMuted ? 0 : 0.3

      source.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      source.start(0)

      musicSourceRef.current = source
      musicGainRef.current = gainNode
      setIsMusicPlaying(true)

      source.onended = () => {
        if (musicSourceRef.current === source) {
          setIsMusicPlaying(false)
        }
      }
    } catch (e) {
      console.warn("Failed to play music", e)
    }
  }, [isMusicPlaying, isMuted])

  // Initialize audio context on first user interaction
  const initAudio = useCallback(async () => {
    if (initializedRef.current) return
    initializedRef.current = true

    try {
      audioContextRef.current = new window.AudioContext()

      // Preload all sounds
      const uniqueSounds = [...new Set(Object.values(SOUND_MAP))]
      await Promise.all(
        uniqueSounds.map(async (url) => {
          try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer)
            buffersRef.current.set(url, audioBuffer)
          } catch (e) {
            console.warn(`Failed to load sound: ${url}`, e)
          }
        }),
      )

      // Load music
      try {
        const response = await fetch(MUSIC_URL)
        const arrayBuffer = await response.arrayBuffer()
        musicBufferRef.current = await audioContextRef.current!.decodeAudioData(arrayBuffer)
      } catch (e) {
        console.warn("Failed to load music", e)
      }

      setIsInitialized(true)

      if (shouldPlayMusicOnInitRef.current && musicBufferRef.current) {
        shouldPlayMusicOnInitRef.current = false
        // Small delay to ensure state is updated
        setTimeout(() => {
          if (audioContextRef.current && musicBufferRef.current && !musicSourceRef.current) {
            try {
              if (audioContextRef.current.state === "suspended") {
                audioContextRef.current.resume()
              }

              const source = audioContextRef.current.createBufferSource()
              const gainNode = audioContextRef.current.createGain()

              source.buffer = musicBufferRef.current
              source.loop = true
              gainNode.gain.value = 0.3

              source.connect(gainNode)
              gainNode.connect(audioContextRef.current.destination)
              source.start(0)

              musicSourceRef.current = source
              musicGainRef.current = gainNode
              setIsMusicPlaying(true)
            } catch (e) {
              console.warn("Failed to autoplay music", e)
            }
          }
        }, 50)
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e)
    }
  }, [])

  // Initialize on first click/tap
  useEffect(() => {
    const handleInteraction = () => {
      initAudio()
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("touchstart", handleInteraction)
    }

    window.addEventListener("click", handleInteraction)
    window.addEventListener("touchstart", handleInteraction)

    return () => {
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("touchstart", handleInteraction)
    }
  }, [initAudio])

  const play = useCallback(
    (sound: SoundType) => {
      if (isMuted || !audioContextRef.current) return

      const url = SOUND_MAP[sound]
      const buffer = buffersRef.current.get(url)

      if (!buffer) return

      try {
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume()
        }

        const source = audioContextRef.current.createBufferSource()
        const gainNode = audioContextRef.current.createGain()

        source.buffer = buffer

        const volumeVariation = 0.8 + Math.random() * 0.2
        gainNode.gain.value = volumeVariation

        if (sound === "tap" || sound === "correct") {
          source.playbackRate.value = 0.95 + Math.random() * 0.1
        }

        source.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)
        source.start(0)
      } catch (e) {
        console.warn("Failed to play sound", e)
      }
    },
    [isMuted],
  )

  const stopMusic = useCallback(() => {
    if (musicSourceRef.current) {
      try {
        musicSourceRef.current.stop()
      } catch (e) {
        // Already stopped
      }
      musicSourceRef.current = null
      musicGainRef.current = null
      setIsMusicPlaying(false)
    }
  }, [])

  const setMusicVolume = useCallback(
    (volume: number) => {
      if (musicGainRef.current) {
        musicGainRef.current.gain.value = isMuted ? 0 : volume
      }
    },
    [isMuted],
  )

  useEffect(() => {
    if (musicGainRef.current) {
      musicGainRef.current.gain.value = isMuted ? 0 : 0.3
    }
  }, [isMuted])

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted)
  }, [])

  return (
    <AudioContext.Provider
      value={{
        play,
        setMuted,
        isMuted,
        playMusic,
        stopMusic,
        setMusicVolume,
        isMusicPlaying,
        isInitialized,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
