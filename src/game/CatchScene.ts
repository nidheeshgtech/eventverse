import Phaser from 'phaser';
import { ITEM_TINTS } from '@/assets/art';
import { DIFFICULTY, GIFT_WEIGHTS } from '@/config/game';
import { hexToNumber } from '@/services/color';
import { sound } from '@/services/sound';
import type { ItemKind } from '@/types/event';
import type { GameCallbacks, GameOptions, GameResult } from '@/types/game';

interface Faller {
  sprite: Phaser.GameObjects.Image;
  kind: ItemKind;
  falling: boolean;
  vy: number;
  spin: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  baseX: number;
  prevY: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const GIFT_ASPECT = 128 / 120;
const BASKET_ASPECT = 124 / 220;
/** Rim top sits 26/124 of the way down the basket art. */
const RIM_FROM_BOTTOM = 1 - 26 / 124;

function pickGift(): Exclude<ItemKind, 'snowball'> {
  const entries = Object.entries(GIFT_WEIGHTS) as [Exclude<ItemKind, 'snowball'>, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [kind, w] of entries) {
    r -= w;
    if (r <= 0) return kind;
  }
  return 'purple';
}

export class CatchScene extends Phaser.Scene {
  private readonly durationMs: number;
  private readonly curve;

  private W = 0;
  private H = 0;
  private unit = 1;
  private itemSize = 64;
  private basketW = 160;

  private basket!: Phaser.GameObjects.Image;
  private basketGlow!: Phaser.GameObjects.Ellipse;
  private basketScale = 1;
  private targetX = 0;
  private lastBasketX = 0;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;

  private snowZone = new Phaser.Geom.Rectangle(0, 0, 1, 1);
  private snow?: Phaser.GameObjects.Particles.ParticleEmitter;
  private burst!: Phaser.GameObjects.Particles.ParticleEmitter;

  private pool: Faller[] = [];
  private elapsed = 0;
  private spawnIn = 400;
  private lastTickSecond = -1;
  private lastTickEmit = -1;
  private finished = false;
  /** Set by begin(); the basket can be moved during the countdown but nothing falls yet. */
  private running = false;

  private score = 0;
  private caught: Record<ItemKind, number> = { gold: 0, blue: 0, purple: 0, snowball: 0 };
  private missed = 0;

  constructor(
    private readonly opts: GameOptions,
    private readonly cb: GameCallbacks,
    private readonly art: Record<string, HTMLCanvasElement>,
  ) {
    super('catch');
    this.durationMs = opts.durationSec * 1000;
    this.curve = DIFFICULTY[opts.difficulty];
  }

  create(): void {
    for (const [key, canvas] of Object.entries(this.art)) {
      if (!this.textures.exists(key)) this.textures.addCanvas(key, canvas);
    }

    this.W = this.scale.width;
    this.H = this.scale.height;
    this.computeSizes();

    // Ambient particles (snow, gold dust or data dots). Fewer when reduced motion is preferred.
    const density = Phaser.Math.Clamp(this.opts.particle.density, 0.05, 1);
    this.snowZone.setTo(0, -20, this.W, 1);
    this.snow = this.add.particles(0, 0, 'flake', {
      emitZone: { type: 'random', source: this.snowZone, quantity: 1 } as Phaser.Types.GameObjects.Particles.EmitZoneData,
      lifespan: 9000,
      speedY: { min: 22 * this.unit, max: 60 * this.unit },
      speedX: { min: -12 * this.unit, max: 12 * this.unit },
      scale: { min: 0.08 * this.unit, max: 0.28 * this.unit },
      alpha: { start: 0.85, end: 0.15 },
      frequency: this.opts.reducedMotion ? 600 : Math.round(100 / density),
      tint: hexToNumber(this.opts.particle.color),
      advance: 6000,
    });
    this.snow.setDepth(0);

    this.basketGlow = this.add
      .ellipse(0, 0, this.basketW * 1.1, this.basketW * 0.22, hexToNumber(this.opts.basketColor), 0.22)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1);
    this.basket = this.add.image(this.W / 2, 0, 'basket').setOrigin(0.5, 1).setDepth(3);
    this.targetX = this.lastBasketX = this.W / 2;

    this.burst = this.add.particles(0, 0, 'spark', {
      emitting: false,
      lifespan: { min: 380, max: 700 },
      speed: { min: 90 * this.unit, max: 280 * this.unit },
      angle: { min: 200, max: 340 },
      gravityY: 520 * this.unit,
      scale: { start: 0.45 * this.unit, end: 0 },
      alpha: { start: 1, end: 0 },
      rotate: { min: 0, max: 180 },
      blendMode: Phaser.BlendModes.ADD,
    });
    this.burst.setDepth(5);

    this.layout();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => (this.targetX = p.x));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown || !p.wasTouch) this.targetX = p.x;
    });
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this));

    this.cb.onTick(this.durationMs);
  }

  /** Starts the round after the pre-game countdown. Safe to call before create() runs. */
  begin(): void {
    if (this.running) return;
    this.running = true;
    sound.play('start');
  }

  private computeSizes(): void {
    // `unit` is ~1 on a 400px-wide phone at 1x, scaled for DPR and larger screens.
    this.unit = Math.min(this.W, this.H * 0.62) / 400;
    this.itemSize = Phaser.Math.Clamp(this.W * 0.15, 46 * this.unit, 84 * this.unit);
    this.basketW = Phaser.Math.Clamp(this.W * 0.34, 120 * this.unit, 200 * this.unit);
  }

  private onResize(size: Phaser.Structs.Size): void {
    const ratio = this.W ? size.width / this.W : 1;
    this.W = size.width;
    this.H = size.height;
    this.computeSizes();
    this.targetX *= ratio;
    this.basket.x *= ratio;
    for (const f of this.pool) {
      f.baseX *= ratio;
      f.sprite.x *= ratio;
    }
    this.snowZone.setTo(0, -20, this.W, 1);
    this.layout();
  }

  private layout(): void {
    const h = this.basketW * BASKET_ASPECT;
    this.basket.setDisplaySize(this.basketW, h);
    this.basketScale = this.basket.scaleY;
    this.basket.y = this.H - Math.max(this.H * 0.05, 18 * this.unit);
    this.basketGlow.setSize(this.basketW * 1.1, this.basketW * 0.2);
    this.basketGlow.setDisplaySize(this.basketW * 1.1, this.basketW * 0.2);
    this.basketGlow.y = this.basket.y - h * 0.08;
    this.clampBasket();
  }

  private clampBasket(): void {
    const half = this.basketW / 2;
    this.targetX = Phaser.Math.Clamp(this.targetX, half, this.W - half);
    this.basket.x = Phaser.Math.Clamp(this.basket.x, half, this.W - half);
    this.basketGlow.x = this.basket.x;
  }

  private obtain(): Faller {
    let f = this.pool.find((p) => !p.falling && !p.sprite.visible);
    if (!f) {
      f = {
        sprite: this.add.image(0, 0, 'purple').setDepth(2),
        kind: 'purple',
        falling: false,
        vy: 0,
        spin: 0,
        swayAmp: 0,
        swayFreq: 0,
        phase: 0,
        baseX: 0,
        prevY: 0,
      };
      this.pool.push(f);
    }
    return f;
  }

  private spawn(t: number): void {
    const snowChance = lerp(this.curve.snowStart, this.curve.snowEnd, t);
    const kind: ItemKind = Math.random() < snowChance ? 'snowball' : pickGift();
    const f = this.obtain();
    const size = this.itemSize * (kind === 'snowball' ? 0.82 : 1) * Phaser.Math.FloatBetween(0.92, 1.08);
    const margin = size * 0.6;
    const speedBoost = kind === 'gold' ? 1.14 : kind === 'snowball' ? 1.06 : 1;

    f.kind = kind;
    f.falling = true;
    f.baseX = Phaser.Math.FloatBetween(margin, this.W - margin);
    f.vy = lerp(this.curve.speedStart, this.curve.speedEnd, t) * this.H * speedBoost * Phaser.Math.FloatBetween(0.9, 1.1);
    f.spin = Phaser.Math.FloatBetween(-1.2, 1.2);
    f.swayAmp = this.opts.reducedMotion ? 0 : Phaser.Math.FloatBetween(0, 14 * this.unit);
    f.swayFreq = Phaser.Math.FloatBetween(1.5, 3);
    f.phase = Math.random() * Math.PI * 2;
    f.prevY = -size;
    f.sprite
      .setTexture(kind)
      .setDisplaySize(size, size * GIFT_ASPECT)
      .setPosition(f.baseX, -size)
      .setRotation(Phaser.Math.FloatBetween(-0.25, 0.25))
      .setAlpha(1)
      .setVisible(true);
  }

  update(_time: number, rawDelta: number): void {
    if (this.finished) return;
    const dt = Math.min(rawDelta, 50);
    const sec = dt / 1000;
    if (!this.running) {
      this.moveBasket(sec);
      return;
    }
    this.elapsed += dt;
    const remaining = Math.max(0, this.durationMs - this.elapsed);

    // Throttle HUD updates to ~10 per second.
    const tenth = Math.ceil(remaining / 100);
    if (tenth !== this.lastTickEmit) {
      this.lastTickEmit = tenth;
      this.cb.onTick(remaining);
    }
    const whole = Math.ceil(remaining / 1000);
    if (whole !== this.lastTickSecond) {
      this.lastTickSecond = whole;
      if (whole <= 5 && whole > 0) sound.play('tick');
    }
    if (remaining <= 0) {
      this.finish();
      return;
    }

    const t = this.elapsed / this.durationMs;
    this.spawnIn -= dt;
    // Stop spawning in the final 0.6s so nothing is left mid-air at the buzzer.
    while (this.spawnIn <= 0 && remaining > 600) {
      this.spawn(t);
      this.spawnIn += lerp(this.curve.spawnStart, this.curve.spawnEnd, t) * Phaser.Math.FloatBetween(0.8, 1.2);
    }

    this.moveBasket(sec);
    this.moveItems(sec);
  }

  private moveBasket(sec: number): void {
    const left = this.cursors?.left.isDown || this.keyA?.isDown;
    const right = this.cursors?.right.isDown || this.keyD?.isDown;
    if (left || right) this.targetX += (right ? 1 : -1) * 900 * this.unit * sec;
    this.clampBasket();

    this.lastBasketX = this.basket.x;
    this.basket.x += (this.targetX - this.basket.x) * Math.min(1, sec * 18);
    this.clampBasket();
    const vx = (this.basket.x - this.lastBasketX) / Math.max(sec, 0.001);
    const tilt = this.opts.reducedMotion ? 0 : Phaser.Math.Clamp(vx / (3000 * this.unit), -0.12, 0.12);
    this.basket.rotation += (tilt - this.basket.rotation) * Math.min(1, sec * 12);
  }

  private moveItems(sec: number): void {
    const basketH = this.basketW * BASKET_ASPECT;
    const rimY = this.basket.y - basketH * RIM_FROM_BOTTOM;
    const zoneTop = rimY - this.itemSize * 0.15;
    const zoneBottom = rimY + basketH * 0.38;
    const halfW = this.basketW * 0.44;

    for (const f of this.pool) {
      if (!f.falling) continue;
      const s = f.sprite;
      f.prevY = s.y;
      f.phase += f.swayFreq * sec;
      s.y += f.vy * sec;
      s.x = f.baseX + Math.sin(f.phase) * f.swayAmp;
      s.rotation += f.spin * sec * 0.6;

      // Swept check against the basket mouth so fast items can't tunnel through.
      const bottom = s.y + s.displayHeight * 0.3;
      const prevBottom = f.prevY + s.displayHeight * 0.3;
      if (bottom >= zoneTop && prevBottom <= zoneBottom && Math.abs(s.x - this.basket.x) <= halfW + s.displayWidth * 0.15) {
        this.collect(f, rimY);
        continue;
      }
      if (s.y - s.displayHeight > this.H) {
        f.falling = false;
        s.setVisible(false);
        if (f.kind !== 'snowball') this.missed++;
      }
    }
  }

  private collect(f: Faller, rimY: number): void {
    f.falling = false;
    const delta = this.opts.scores[f.kind];
    this.score = Math.max(0, this.score + delta);
    this.caught[f.kind]++;
    this.cb.onScore(this.score, delta, f.kind);
    sound.play(f.kind);

    const s = f.sprite;
    this.tweens.add({
      targets: s,
      y: rimY + this.basketW * 0.12,
      scaleX: s.scaleX * 0.5,
      scaleY: s.scaleY * 0.5,
      alpha: 0,
      duration: 140,
      ease: 'Quad.easeIn',
      onComplete: () => s.setVisible(false),
    });

    const tint = hexToNumber(ITEM_TINTS[this.opts.style][f.kind]);
    this.burst.setParticleTint(tint);
    this.burst.explode(f.kind === 'gold' ? 18 : f.kind === 'snowball' ? 10 : 12, s.x, rimY);

    this.tweens.add({
      targets: this.basket,
      scaleY: this.basketScale * (f.kind === 'snowball' ? 0.8 : 0.9),
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => this.basket.setScale(this.basket.scaleX, this.basketScale),
    });

    if (f.kind === 'snowball') {
      this.basket.setTint(0xbfd4ff);
      this.time.delayedCall(220, () => this.basket.clearTint());
      if (!this.opts.reducedMotion) this.cameras.main.shake(140, 0.006);
    }

    this.popup(s.x, rimY, delta, ITEM_TINTS[this.opts.style][f.kind]);
  }

  private popup(x: number, y: number, delta: number, color: string): void {
    const label = delta > 0 ? `+${delta}` : `${delta}`;
    const text = this.add
      .text(x, y - 10 * this.unit, label, {
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontSize: `${Math.round((delta >= 30 ? 34 : 28) * this.unit)}px`,
        fontStyle: '800',
        color: delta < 0 ? '#ff8a9a' : color,
        stroke: '#0a0b26',
        strokeThickness: 5 * this.unit,
      })
      .setOrigin(0.5)
      .setDepth(6);
    this.tweens.add({
      targets: text,
      y: text.y - 70 * this.unit,
      alpha: 0,
      scale: { from: 0.7, to: 1.15 },
      duration: 750,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  private finish(): void {
    this.finished = true;
    this.cb.onTick(0);
    sound.play('end');
    for (const f of this.pool) {
      if (!f.falling) continue;
      f.falling = false;
      this.tweens.add({ targets: f.sprite, alpha: 0, duration: 300, onComplete: () => f.sprite.setVisible(false) });
    }
    const result: GameResult = {
      score: this.score,
      caught: { ...this.caught },
      missed: this.missed,
      durationMs: Math.round(this.elapsed),
    };
    this.time.delayedCall(650, () => this.cb.onEnd(result));
  }
}
