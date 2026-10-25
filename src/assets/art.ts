import type { ItemKind } from '@/types/event';
import { shade } from '@/services/color';

/**
 * Procedural vector art. One source feeds both the React UI (as <img> data URIs)
 * and the Phaser game (rasterised to canvases), so there are no image files to load.
 */

interface GiftPalette {
  light: string;
  mid: string;
  dark: string;
  ribbonLight: string;
  ribbonMid: string;
  ribbonDark: string;
}

export const GIFT_PALETTES: Record<Exclude<ItemKind, 'snowball'>, GiftPalette> = {
  gold: {
    light: '#fff2c4',
    mid: '#f2c14e',
    dark: '#9c6a0c',
    ribbonLight: '#b58cff',
    ribbonMid: '#6c3fd6',
    ribbonDark: '#371a86',
  },
  blue: {
    light: '#b9ecff',
    mid: '#2eaef5',
    dark: '#0b4f9c',
    ribbonLight: '#fff1bf',
    ribbonMid: '#f2c14e',
    ribbonDark: '#a8740f',
  },
  purple: {
    light: '#d9c6ff',
    mid: '#8a5cf6',
    dark: '#3d1d8f',
    ribbonLight: '#fff1bf',
    ribbonMid: '#f2c14e',
    ribbonDark: '#a8740f',
  },
};

/** Tint used for particles and score popups. */
export const ITEM_TINT: Record<ItemKind, string> = {
  gold: '#f9d36b',
  blue: '#4cc3ff',
  purple: '#a57bff',
  snowball: '#dce8ff',
};

export function giftSvg(kind: Exclude<ItemKind, 'snowball'>, id: string = kind): string {
  const p = GIFT_PALETTES[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 128" width="120" height="128">
<defs>
<linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.light}"/><stop offset=".42" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient>
<linearGradient id="l${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.light}"/><stop offset="1" stop-color="${p.mid}"/></linearGradient>
<linearGradient id="r${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.ribbonDark}"/><stop offset=".5" stop-color="${p.ribbonLight}"/><stop offset="1" stop-color="${p.ribbonDark}"/></linearGradient>
<linearGradient id="k${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.ribbonLight}"/><stop offset="1" stop-color="${p.ribbonDark}"/></linearGradient>
<radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="60" cy="120" rx="44" ry="6" fill="url(#s${id})"/>
<rect x="18" y="50" width="84" height="66" rx="8" fill="url(#b${id})"/>
<path d="M80 50h14a8 8 0 0 1 8 8v50a8 8 0 0 1-8 8H80z" fill="#000" opacity=".16"/>
<rect x="18" y="57" width="84" height="5" fill="#000" opacity=".18"/>
<rect x="52" y="50" width="16" height="66" fill="url(#r${id})"/>
<rect x="12" y="38" width="96" height="20" rx="6" fill="url(#l${id})"/>
<rect x="52" y="38" width="16" height="20" fill="url(#r${id})"/>
<path d="M60 39C46 16 20 22 32 37c6 7 19 6 28 2z" fill="url(#k${id})"/>
<path d="M60 39c14-23 40-17 28-2-6 7-19 6-28 2z" fill="url(#k${id})"/>
<path d="M58 40c-6 8-10 14-14 22M62 40c6 8 10 14 14 22" stroke="${p.ribbonMid}" stroke-width="5" stroke-linecap="round" fill="none"/>
<ellipse cx="60" cy="38" rx="8" ry="6.5" fill="${p.ribbonMid}"/>
<ellipse cx="58" cy="36" rx="3" ry="2" fill="#fff" opacity=".55"/>
<rect x="24" y="64" width="6" height="44" rx="3" fill="#fff" opacity=".28"/>
<rect x="17" y="41" width="30" height="4" rx="2" fill="#fff" opacity=".45"/>
<circle cx="92" cy="72" r="2" fill="#fff" opacity=".7"/>
</svg>`;
}

export function snowballSvg(id = 'sb'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 128" width="120" height="128">
<defs>
<radialGradient id="g${id}" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#dbe6ff"/><stop offset="1" stop-color="#7f94c9"/></radialGradient>
<radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="60" cy="120" rx="36" ry="5" fill="url(#s${id})"/>
<circle cx="60" cy="66" r="42" fill="url(#g${id})"/>
<circle cx="44" cy="80" r="5" fill="#9fb2df" opacity=".45"/>
<circle cx="76" cy="54" r="4" fill="#9fb2df" opacity=".4"/>
<circle cx="72" cy="88" r="6" fill="#9fb2df" opacity=".35"/>
<circle cx="50" cy="50" r="3" fill="#9fb2df" opacity=".35"/>
<ellipse cx="45" cy="44" rx="12" ry="7" fill="#fff" opacity=".85" transform="rotate(-30 45 44)"/>
<path d="M88 34l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff"/>
</svg>`;
}

/** Basket tinted with the event's primary brand colour. */
export function basketSvg(color: string, id = 'bk'): string {
  const light = shade(color, 0.55);
  const mid = color;
  const dark = shade(color, -0.55);
  const deep = shade(color, -0.75);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 124" width="220" height="124">
<defs>
<linearGradient id="b${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
<linearGradient id="r${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
<linearGradient id="i${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${deep}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
<radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="110" cy="116" rx="86" ry="7" fill="url(#s${id})"/>
<path d="M22 38h176l-20 70a8 8 0 0 1-7.7 6H49.7a8 8 0 0 1-7.7-6z" fill="url(#b${id})"/>
<g stroke="${deep}" stroke-opacity=".35" stroke-width="2.5" fill="none">
<path d="M28 58h164M33 78h154M38 98h144"/>
<path d="M60 40l-6 72M90 40l-3 72M120 40l2 72M150 40l5 72M178 40l-4 40"/>
</g>
<path d="M30 44h160l-3 10H33z" fill="#000" opacity=".18"/>
<rect x="10" y="26" width="200" height="18" rx="9" fill="url(#r${id})"/>
<rect x="18" y="29" width="120" height="4" rx="2" fill="#fff" opacity=".55"/>
<ellipse cx="110" cy="35" rx="92" ry="4" fill="url(#i${id})" opacity=".5"/>
<path d="M46 62l-2 36" stroke="#fff" stroke-opacity=".3" stroke-width="4" stroke-linecap="round"/>
</svg>`;
}

export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function itemSvg(kind: ItemKind, id?: string): string {
  return kind === 'snowball' ? snowballSvg(id) : giftSvg(kind, id);
}

/** Rasterise an SVG string to a canvas at a given pixel size. */
export async function rasterize(svg: string, width: number, height: number): Promise<HTMLCanvasElement> {
  const img = new Image();
  img.decoding = 'async';
  img.width = width;
  img.height = height;
  img.src = svgDataUri(svg);
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/** Soft round glow used for snowflakes and sparkles. */
export function glowDot(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const r = size / 2;
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return canvas;
}

/** Four-point sparkle for catch bursts. */
export function sparkle(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(c, 0);
    ctx.quadraticCurveTo(c, c, size, c);
    ctx.quadraticCurveTo(c, c, c, size);
    ctx.quadraticCurveTo(c, c, 0, c);
    ctx.quadraticCurveTo(c, c, c, 0);
    ctx.fill();
  }
  return canvas;
}
