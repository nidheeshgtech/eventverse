import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { ensureStyleFont, presetOf } from '@/config/styles';
import { themeVars } from '@/services/color';
import type { EventConfig } from '@/types/event';
import { Snowfall } from '../ui/Snowfall';

interface Props {
  event: Pick<EventConfig, 'theme'>;
  /** Animated ambient particles (off during gameplay, where Phaser draws its own). */
  particles?: boolean;
  /** Load the style's display font. Off where no display text sits inside the backdrop. */
  loadFont?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Branded backdrop shared by the visitor experience, voucher page and editor preview:
 * brand colour variables, the style preset's background, its particles and display font.
 */
export function EventBackdrop({ event, particles = true, loadFont = true, className = '', children }: Props) {
  const preset = presetOf(event.theme);

  useEffect(() => {
    if (loadFont) ensureStyleFont(preset);
  }, [preset, loadFont]);

  const style = {
    ...themeVars(event.theme.primary, event.theme.accent),
    ...(preset.displayFont ? { '--font-display': preset.displayFont.family } : {}),
    background: preset.background,
  } as CSSProperties;

  return (
    <div style={style} className={`relative overflow-hidden ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `radial-gradient(ellipse at 50% -10%, ${event.theme.primary}33, transparent 55%), radial-gradient(ellipse at 100% 100%, ${event.theme.accent}22, transparent 50%)`,
        }}
        aria-hidden="true"
      />
      {particles && <Snowfall density={preset.particle.density} color={preset.particle.color} />}
      {children}
    </div>
  );
}
