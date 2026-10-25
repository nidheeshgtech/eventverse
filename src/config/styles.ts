import type { EventTheme, ItemKind, VisualStyle } from '@/types/event';

export interface StylePreset {
  label: string;
  description: string;
  /** CSS `background` for the visitor experience (layered over the brand glow). */
  background: string;
  /** Ambient particle colour and density (snow, gold dust, data dots). */
  particle: { color: string; density: number };
  /** Optional display font, loaded on demand only for events that use this style. */
  displayFont?: { family: string; href: string };
  /** Names shown for each falling item, matching the style's game art. */
  itemLabels: Record<ItemKind, string>;
  /** What the player moves, used in the instructions. */
  catcherName: string;
}

export const STYLE_PRESETS: Record<VisualStyle, StylePreset> = {
  festive: {
    label: 'Festive',
    description: 'Midnight blue and purple, gift boxes, falling snow',
    background:
      'radial-gradient(ellipse at 20% 0%, rgba(124,77,255,0.32), transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(30,167,255,0.2), transparent 50%), linear-gradient(180deg, #05061a 0%, #0f0a2e 55%, #1c0f3d 100%)',
    particle: { color: '#ffffff', density: 0.7 },
    itemLabels: { gold: 'Gold Gift', blue: 'Blue Gift', purple: 'Purple Gift', snowball: 'Snowball' },
    catcherName: 'basket',
  },
  luxury: {
    label: 'Luxury',
    description: 'Black and gold, perfume bottles, gold dust',
    background:
      'radial-gradient(ellipse at 50% -10%, rgba(212,175,55,0.24), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(212,175,55,0.08), transparent 50%), linear-gradient(180deg, #0d0b08 0%, #060504 60%, #000000 100%)',
    particle: { color: '#e9c46a', density: 0.35 },
    displayFont: {
      family: '"Playfair Display", Georgia, serif',
      href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap',
    },
    itemLabels: { gold: 'Gold Elixir', blue: 'Pearl Musk', purple: 'Rosé Bloom', snowball: 'Smoke' },
    catcherName: 'bag',
  },
  corporate: {
    label: 'Corporate',
    description: 'Clean slate and blue, geometric cubes, subtle grid',
    background:
      'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px) 0 0 / 32px 32px, linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px) 0 0 / 32px 32px, radial-gradient(ellipse at 50% -20%, rgba(76,154,255,0.22), transparent 60%), linear-gradient(180deg, #0b1220 0%, #0f172a 100%)',
    particle: { color: '#93c5fd', density: 0.25 },
    itemLabels: { gold: 'Gold Cube', blue: 'Blue Cube', purple: 'Teal Cube', snowball: 'Error Block' },
    catcherName: 'tray',
  },
};

export function styleOf(theme: Pick<EventTheme, 'style'>): VisualStyle {
  return theme.style && theme.style in STYLE_PRESETS ? theme.style : 'festive';
}

export function presetOf(theme: Pick<EventTheme, 'style'>): StylePreset {
  return STYLE_PRESETS[styleOf(theme)];
}

const loadedFonts = new Set<string>();

/** Injects a style's Google Font stylesheet once, so other pages never pay for it. */
export function ensureStyleFont(preset: StylePreset): void {
  const href = preset.displayFont?.href;
  if (!href || loadedFonts.has(href) || typeof document === 'undefined') return;
  loadedFonts.add(href);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
