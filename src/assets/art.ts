import type { ItemKind, VisualStyle } from '@/types/event';
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

/** Tint used for particles and score popups, per visual style. */
export const ITEM_TINTS: Record<VisualStyle, Record<ItemKind, string>> = {
  festive: { gold: '#f9d36b', blue: '#4cc3ff', purple: '#a57bff', snowball: '#dce8ff' },
  luxury: { gold: '#e9c46a', blue: '#f4efe6', purple: '#f2a7b8', snowball: '#a29bab' },
  corporate: { gold: '#fcd34d', blue: '#60a5fa', purple: '#2dd4bf', snowball: '#f87171' },
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

/**
 * Catcher art per style. Every variant keeps its opening at y≈26 of the 220x124
 * viewBox, because CatchScene's collision zone is derived from that rim height.
 */
export function basketSvg(color: string, id = 'bk', style: VisualStyle = 'festive'): string {
  if (style === 'luxury') return bagSvg(color, id);
  if (style === 'corporate') return traySvg(color, id);
  return wovenBasketSvg(color, id);
}

/** Luxury shopping bag: matte black with brand-coloured (gold) trim. */
function bagSvg(color: string, id: string): string {
  const light = shade(color, 0.45);
  const dark = shade(color, -0.45);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 124" width="220" height="124">
<defs>
<linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050505"/><stop offset=".35" stop-color="#1c1a17"/><stop offset="1" stop-color="#050505"/></linearGradient>
<linearGradient id="t${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
<radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="110" cy="117" rx="84" ry="6" fill="url(#s${id})"/>
<path d="M76 30C76 4 144 4 144 30" stroke="url(#t${id})" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M28 30h164l-8 80a6 6 0 0 1-6 5H42a6 6 0 0 1-6-5z" fill="url(#b${id})"/>
<rect x="24" y="24" width="172" height="12" rx="3" fill="url(#t${id})"/>
<rect x="30" y="26" width="90" height="3" rx="1.5" fill="#fff" opacity=".5"/>
<path d="M44 46h132" stroke="${color}" stroke-opacity=".5" stroke-width="1.2"/>
<path d="M110 62l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill="url(#t${id})"/>
<path d="M44 104h132" stroke="${color}" stroke-opacity=".35" stroke-width="1"/>
</svg>`;
}

/** Corporate tray: clean, glossy, no weave. */
function traySvg(color: string, id: string): string {
  const light = shade(color, 0.5);
  const dark = shade(color, -0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 124" width="220" height="124">
<defs>
<linearGradient id="b${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
<linearGradient id="r${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${color}"/></linearGradient>
<radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="110" cy="116" rx="86" ry="7" fill="url(#s${id})"/>
<path d="M20 36h180l-14 68a12 12 0 0 1-11.8 10H45.8A12 12 0 0 1 34 104z" fill="url(#b${id})"/>
<path d="M32 50h156" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
<rect x="12" y="26" width="196" height="14" rx="7" fill="url(#r${id})"/>
<rect x="20" y="28.5" width="110" height="3.5" rx="1.75" fill="#fff" opacity=".6"/>
<rect x="92" y="72" width="36" height="6" rx="3" fill="#fff" opacity=".35"/>
<path d="M44 58l-4 40" stroke="#fff" stroke-opacity=".25" stroke-width="4" stroke-linecap="round"/>
</svg>`;
}

/** Woven festive basket tinted with the event's primary brand colour. */
function wovenBasketSvg(color: string, id: string): string {
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

export function itemSvg(kind: ItemKind, id?: string, style: VisualStyle = 'festive'): string {
  if (style === 'luxury') return kind === 'snowball' ? smokeSvg(id) : perfumeSvg(kind, id);
  if (style === 'corporate') return kind === 'snowball' ? errorBlockSvg(id) : cubeSvg(kind, id);
  return kind === 'snowball' ? snowballSvg(id) : giftSvg(kind, id);
}

/* ── Luxury style: perfume bottles + smoke ─────────────────────────────── */

const PERFUME: Record<Exclude<ItemKind, 'snowball'>, { light: string; mid: string; dark: string; cap: [string, string] }> = {
  gold: { light: '#fff3c9', mid: '#e3b341', dark: '#7a4f08', cap: ['#2b2620', '#0b0a08'] },
  blue: { light: '#ffffff', mid: '#ebe5da', dark: '#9b9184', cap: ['#f6dc8c', '#a77a1c'] },
  purple: { light: '#ffe6ec', mid: '#e9a6b6', dark: '#8a4458', cap: ['#f6dc8c', '#a77a1c'] },
};

export function perfumeSvg(kind: Exclude<ItemKind, 'snowball'>, id: string = `p${kind}`): string {
  const p = PERFUME[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 128" width="120" height="128">
<defs>
<linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.dark}"/><stop offset=".3" stop-color="${p.light}"/><stop offset=".62" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient>
<linearGradient id="c${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.cap[0]}"/><stop offset="1" stop-color="${p.cap[1]}"/></linearGradient>
<linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe7a1"/><stop offset="1" stop-color="#b8892b"/></linearGradient>
<radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="60" cy="121" rx="38" ry="5" fill="url(#s${id})"/>
<rect x="49" y="36" width="22" height="14" rx="3" fill="url(#g${id})"/>
<rect x="40" y="8" width="40" height="30" rx="7" fill="url(#c${id})"/>
<rect x="40" y="31" width="40" height="5" fill="url(#g${id})"/>
<rect x="45" y="12" width="6" height="18" rx="3" fill="#fff" opacity=".22"/>
<path d="M30 52h60a10 10 0 0 1 10 10v44a12 12 0 0 1-12 12H32a12 12 0 0 1-12-12V62a10 10 0 0 1 10-10z" fill="url(#b${id})"/>
<path d="M24 82h72v24a12 12 0 0 1-12 12H36a12 12 0 0 1-12-12z" fill="${p.mid}" opacity=".35"/>
<rect x="38" y="70" width="44" height="26" rx="3" fill="#0b0a08" opacity=".72"/>
<rect x="40.5" y="72.5" width="39" height="21" rx="2" fill="none" stroke="#e3b341" stroke-width="1.4"/>
<path d="M60 77l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill="#e9c46a"/>
<rect x="28" y="58" width="6" height="52" rx="3" fill="#fff" opacity=".5"/>
<rect x="86" y="60" width="3" height="44" rx="1.5" fill="#fff" opacity=".25"/>
</svg>`;
}

export function smokeSvg(id = 'sm'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 128" width="120" height="128">
<defs>
<radialGradient id="g${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#c9c3cf"/><stop offset=".6" stop-color="#77707f"/><stop offset="1" stop-color="#3a3540"/></radialGradient>
<radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="60" cy="118" rx="34" ry="5" fill="url(#s${id})"/>
<g fill="url(#g${id})">
<circle cx="42" cy="76" r="24"/><circle cx="74" cy="70" r="28"/><circle cx="58" cy="50" r="22"/><circle cx="62" cy="92" r="20"/>
</g>
<circle cx="52" cy="46" r="7" fill="#fff" opacity=".25"/>
<path d="M48 72l8 6-6 4 10 8M74 62l-6 10 8 2-4 10" stroke="#1b181f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".55"/>
</svg>`;
}

/* ── Corporate style: isometric cubes + error block ────────────────────── */

const CUBE: Record<Exclude<ItemKind, 'snowball'>, [string, string, string]> = {
  gold: ['#fde68a', '#f5b82e', '#b7791f'],
  blue: ['#bfdbfe', '#3b82f6', '#1e40af'],
  purple: ['#99f6e4', '#14b8a6', '#0f766e'],
};

export function cubeSvg(kind: Exclude<ItemKind, 'snowball'>, id: string = `c${kind}`): string {
  const [top, left, right] = CUBE[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 128" width="120" height="128">
<defs><radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="60" cy="120" rx="38" ry="5" fill="url(#s${id})"/>
<path d="M60 14l44 25-44 25-44-25z" fill="${top}"/>
<path d="M16 39l44 25v50l-44-25z" fill="${left}"/>
<path d="M104 39l-44 25v50l44-25z" fill="${right}"/>
<path d="M60 14l44 25-44 25-44-25z" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linejoin="round"/>
<path d="M60 64v50" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
<path d="M60 29l18 10-18 10-18-10z" fill="#fff" opacity=".35"/>
<path d="M24 50l8 4.6v30" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;
}

export function errorBlockSvg(id = 'er'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 128" width="120" height="128">
<defs>
<linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb7185"/><stop offset="1" stop-color="#be123c"/></linearGradient>
<radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="60" cy="118" rx="34" ry="5" fill="url(#s${id})"/>
<rect x="22" y="28" width="76" height="76" rx="18" fill="url(#g${id})"/>
<rect x="22" y="28" width="76" height="76" rx="18" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
<path d="M45 51l30 30M75 51L45 81" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
<rect x="30" y="34" width="34" height="6" rx="3" fill="#fff" opacity=".35"/>
</svg>`;
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
