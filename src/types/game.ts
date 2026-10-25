import type { Difficulty, ItemKind, VisualStyle } from './event';

export interface GameResult {
  score: number;
  caught: Record<ItemKind, number>;
  missed: number;
  durationMs: number;
}

export interface GameCallbacks {
  onScore: (score: number, delta: number, kind: ItemKind) => void;
  onTick: (remainingMs: number) => void;
  onEnd: (result: GameResult) => void;
}

export interface GameOptions {
  durationSec: number;
  difficulty: Difficulty;
  scores: Record<ItemKind, number>;
  basketColor: string;
  reducedMotion: boolean;
  /** Selects item/catcher art and burst tints. */
  style: VisualStyle;
  /** Ambient particle colour (hex) and relative density (0–1). */
  particle: { color: string; density: number };
}

export interface GameHandle {
  start: () => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
}
