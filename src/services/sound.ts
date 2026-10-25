import type { ItemKind } from '@/types/event';
import { readJSON, writeJSON } from './storage';

type Cue = ItemKind | 'start' | 'tick' | 'end' | 'win' | 'click';

/**
 * Tiny Web Audio synth. Every effect is generated at runtime,
 * so the game ships with zero audio files.
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = readJSON<boolean>('audio', true);

  /** Must be called from a user gesture (e.g. the Start button) on iOS. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    writeJSON('audio', on);
    if (on) this.unlock();
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + start;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  play(cue: Cue): void {
    if (!this.enabled || !this.ctx) return;
    switch (cue) {
      case 'purple':
        this.tone(660, 0, 0.12, 'sine', 0.5);
        this.tone(990, 0.05, 0.14, 'sine', 0.3);
        break;
      case 'blue':
        this.tone(784, 0, 0.12, 'sine', 0.5);
        this.tone(1175, 0.05, 0.16, 'sine', 0.32);
        break;
      case 'gold':
        this.tone(880, 0, 0.1, 'triangle', 0.5);
        this.tone(1319, 0.06, 0.12, 'triangle', 0.4);
        this.tone(1760, 0.12, 0.22, 'sine', 0.3);
        break;
      case 'snowball':
        this.tone(220, 0, 0.25, 'triangle', 0.6, 90);
        this.tone(140, 0.02, 0.2, 'square', 0.12, 70);
        break;
      case 'tick':
        this.tone(1400, 0, 0.05, 'square', 0.12);
        break;
      case 'start':
        [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.08, 0.16, 'sine', 0.4));
        break;
      case 'end':
        this.tone(784, 0, 0.18, 'sine', 0.4, 392);
        break;
      case 'win':
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.09, 0.3, 'triangle', 0.35));
        break;
      case 'click':
        this.tone(900, 0, 0.04, 'sine', 0.2);
        break;
    }
  }
}

export const sound = new SoundManager();
