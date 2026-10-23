import Phaser from 'phaser';
import C, { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';
import Terrain from '../systems/terrain.js';
import Dinos from '../systems/dinos.js';
import Aim from '../systems/aim.js';
import Hud from '../systems/hud.js';
import { dropAsteroid, explode } from '../systems/impact.js';

const LABEL_TINT = { 'PERFECT!': 0xffe040, GOOD: 0x60ff60, OK: 0xffffff, MISS: 0xff4040 };

export default class Game extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) { this.level = data.level || 1; }

  create() {
    initGfx(this);
    const n = this.level, debug = !!this.registry.get('debug');
    if (!this.registry.has('runSeed')) this.registry.set('runSeed', (Math.random() * 1e9) | 0);
    this.terrain = new Terrain(this, 'terrain', this.registry.get('runSeed') + n * 7919);
    this.dinos = new Dinos(this, this.terrain, C.DINOS_BASE + C.DINOS_PER_LEVEL * (n - 1), debug);
    this.rocks = Math.ceil(this.dinos.count / C.DINOS_PER_ROCK) + C.ROCKS_BONUS;
    this.aim = new Aim(this);
    this.aim.debug = debug;
    this.hud = new Hud(this);
    this.cross = this.add.image(0, 0, 'cross').setDepth(12);
    this.moveCross(W / 2, (H + C.HUD_H) / 2);
    this.state = 'target';

    this.keys = this.input.keyboard.createCursorKeys();
    this.input.on('pointermove', p => this.state === 'target' && this.moveCross(p.worldX, p.worldY));
    this.input.on('pointerdown', p => {
      if (this.state !== 'target') return;
      this.moveCross(p.worldX, p.worldY);
      this.select();
    });
    this.input.keyboard.on('keydown-SPACE', () => this.state === 'target' ? this.select() : this.aim.press());
    this.input.keyboard.on('keydown-ENTER', () => this.state === 'target' && this.select());
    this.input.keyboard.on('keydown-D', () => {
      const on = !this.registry.get('debug');
      this.registry.set('debug', on);
      this.dinos.setDebug(on);
      this.aim.debug = on;
    });
    this.input.keyboard.on('keydown-N', () => this.registry.get('debug') && this.state === 'target' && this.finish('LevelEnd'));
  }

  moveCross(x, y) {
    this.cx = Phaser.Math.Clamp(x, 0, W - 1); this.cy = Phaser.Math.Clamp(y, C.HUD_H, H - 1);
    this.cross.setPosition(Math.round(this.cx), Math.round(this.cy));
  }

  select() {
    this.state = 'aim';
    const { x, y } = this.cross;
    this.aim.start(x, y, this.level, res => this.strike(x, y, res));
  }

  strike(tx, ty, res) {
    this.state = 'fall';
    const label = text(this, tx, ty - 22, res.label, LABEL_TINT[res.label]).setOrigin(0.5);
    this.time.delayedCall(600, () => label.destroy());
    const x = Phaser.Math.Clamp(tx + res.dx, 0, W - 1), y = Phaser.Math.Clamp(ty + res.dy, C.HUD_H, H - 1);
    dropAsteroid(this, x, y, () => this.impact(x, y, res.perfect));
  }

  impact(x, y, perfect) {
    explode(this, x, y);
    this.terrain.paintCrater(x, y, C.CRATER_R);
    this.dinos.killInRadius(x, y, C.BLAST_R * (perfect ? C.PERFECT_BLAST_MULT : 1));
    this.rocks--;
    this.lastImpact = { x, y };
    if (!this.dinos.count || this.terrain.destroyedPct() >= C.MAP_DESTROYED_PCT) this.finish('LevelEnd');
    else if (!this.rocks) this.finish('GameOver');
    else this.state = 'target';
  }

  survivor() {
    if (this.dinos.count) {
      const d = Phaser.Utils.Array.GetRandom(this.dinos.list);
      return { x: d.x, y: d.y };
    }
    const p = this.lastImpact || { x: W / 2, y: H / 2 }, a = Math.random() * Math.PI * 2, r = C.CRATER_R + 2;
    return { x: Phaser.Math.Clamp(p.x + Math.cos(a) * r, 2, W - 3), y: Phaser.Math.Clamp(p.y + Math.sin(a) * r, C.HUD_H + 2, H - 3) };
  }

  finish(scene) {
    this.state = 'end';
    const data = { level: this.level, survivor: this.survivor() };
    this.time.delayedCall(800, () => this.scene.start(scene, data));
  }

  update(time, dt) {
    if (this.state === 'target') {
      const v = (C.CROSS_SPEED * dt) / 1000, k = this.keys;
      const dx = (k.right.isDown - k.left.isDown) * v, dy = (k.down.isDown - k.up.isDown) * v;
      if (dx || dy) this.moveCross(this.cx + dx, this.cy + dy);
    }
    this.dinos.update(dt);
    this.aim.update(dt);
    this.hud.set(this.level, this.dinos.count, this.rocks, this.terrain.destroyedPct(), this.registry.get('debug'));
  }
}
