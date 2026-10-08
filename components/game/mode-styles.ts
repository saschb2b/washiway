import type { GameMode } from "@/lib/game-types"

export type TapeColor = "mint" | "pink" | "blue" | "peach" | "lavender" | "yellow"

export const MODE_STYLES: Record<
  GameMode,
  { color: TapeColor; pattern: "dots" | "stripes" | "dashes" | "zigzag"; icon: string }
> = {
  quick: { color: "mint", pattern: "dashes", icon: "#" },
  check: { color: "blue", pattern: "dots", icon: "?" },
  estimate: { color: "peach", pattern: "stripes", icon: "≈" },
  line: { color: "yellow", pattern: "stripes", icon: "↔" },
  gap: { color: "pink", pattern: "zigzag", icon: "□" },
  target: { color: "lavender", pattern: "dots", icon: "◎" },
  mix: { color: "blue", pattern: "zigzag", icon: "★" },
}

export const TAPE_BG: Record<TapeColor, string> = {
  mint: "bg-pastel-mint",
  pink: "bg-pastel-pink",
  blue: "bg-pastel-blue",
  peach: "bg-pastel-peach",
  lavender: "bg-pastel-lavender",
  yellow: "bg-pastel-yellow",
}
