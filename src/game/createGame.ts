import Phaser from 'phaser';
import { basketSvg, glowDot, itemSvg, rasterize, sparkle } from '@/assets/art';
import type { ItemKind } from '@/types/event';
import type { GameCallbacks, GameHandle, GameOptions } from '@/types/game';
import { CatchScene } from './CatchScene';

const KINDS: ItemKind[] = ['gold', 'blue', 'purple', 'snowball'];

/**
 * Boots Phaser inside `parent`. This module is only reached through a dynamic import,
 * so the ~1 MB engine is never part of the initial page load.
 *
 * The canvas renders at device pixel ratio (capped at 2 for mid-range phones)
 * and is scaled down with CSS zoom, which keeps the art crisp on retina screens.
 */
export async function createGame(parent: HTMLElement, opts: GameOptions, cb: GameCallbacks): Promise<GameHandle> {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const texW = Math.round(96 * dpr);

  const [items, basket] = await Promise.all([
    Promise.all(KINDS.map((k) => rasterize(itemSvg(k, `g${k}`), texW, Math.round(texW * (128 / 120))))),
    rasterize(basketSvg(opts.basketColor), Math.round(220 * dpr), Math.round(124 * dpr)),
  ]);
  const art: Record<string, HTMLCanvasElement> = {
    basket,
    flake: glowDot(32),
    spark: sparkle(32),
  };
  KINDS.forEach((k, i) => (art[k] = items[i]));

  const rect = parent.getBoundingClientRect();
  const scene = new CatchScene(opts, cb, art);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    transparent: true,
    width: Math.max(1, Math.round(rect.width * dpr)),
    height: Math.max(1, Math.round(rect.height * dpr)),
    scale: { mode: Phaser.Scale.NONE, zoom: 1 / dpr },
    banner: false,
    fps: { target: 60, smoothStep: true },
    render: { antialias: true, powerPreference: 'high-performance' },
    input: { activePointers: 2 },
    audio: { noAudio: true },
    disableContextMenu: true,
    scene,
  });

  const observer = new ResizeObserver(() => {
    const r = parent.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    game.scale.resize(Math.round(r.width * dpr), Math.round(r.height * dpr));
    game.scale.setZoom(1 / dpr);
  });
  observer.observe(parent);

  // Dev-only handle for automated play-testing (stripped from production builds).
  if (import.meta.env.DEV) (window as unknown as { __eventverse?: unknown }).__eventverse = { game, scene };

  const active = () => game.scene.getScene('catch');

  return {
    start: () => scene.begin(),
    pause: () => {
      const s = active();
      if (s && s.scene.isActive()) s.scene.pause();
    },
    resume: () => {
      const s = active();
      if (s && s.scene.isPaused()) s.scene.resume();
    },
    destroy: () => {
      observer.disconnect();
      game.destroy(true);
    },
  };
}
