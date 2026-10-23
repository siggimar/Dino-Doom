import Phaser from 'phaser';
import C from '../config.js';

const MID = (C.AIM_R_IN + C.AIM_R_OUT) / 2, HALF = (C.AIM_R_OUT - C.AIM_R_IN) / 2;

export default class Aim {
  constructor(scene) {
    this.g = scene.add.graphics().setDepth(10);
    this.active = false;
    this.debug = false;
  }

  start(x, y, done, speedMult = 1) {
    Object.assign(this, { x, y, done, active: true, r: C.AIM_R_START });
    this.speed = Phaser.Math.FloatBetween(C.AIM_SPEED_MIN, C.AIM_SPEED_MAX) * speedMult;
    this.change = Math.random() < C.AIM_CHANGE_CHANCE
      ? { at: Phaser.Math.FloatBetween(C.AIM_R_OUT + 4, C.AIM_R_START - 10), mult: Phaser.Utils.Array.GetRandom([0.55, 1.7]) }
      : null;
    this.draw();
  }

  press() { if (this.active) this.resolve(this.r); }

  update(dt) {
    if (!this.active) return;
    this.r -= (this.speed * dt) / 1000;
    if (this.change && this.r <= this.change.at) { this.speed *= this.change.mult; this.change = null; }
    if (this.r < C.AIM_R_IN) return this.resolve(this.r);
    this.draw();
  }

  resolve(r) {
    this.active = false;
    this.g.clear();
    const inBand = r >= C.AIM_R_IN && r <= C.AIM_R_OUT, err = Math.abs(r - MID) / HALF;
    const dist = inBand ? err * C.AIM_MAX_OFFSET : Phaser.Math.FloatBetween(C.AIM_MISS_MIN, C.AIM_MISS_MAX);
    const a = Math.random() * Math.PI * 2, perfect = inBand && err < C.AIM_PERFECT;
    const label = !inBand ? 'MISS' : perfect ? 'PERFECT!' : err < 0.5 ? 'GOOD' : 'OK';
    this.done({ dx: Math.cos(a) * dist, dy: Math.sin(a) * dist, perfect, label });
  }

  draw() {
    const { g, x, y } = this, px = 1 / g.scene.cameras.main.zoom;
    g.clear();
    g.lineStyle(HALF * 2, 0xffffff, this.debug ? 0.3 : 0.12).strokeCircle(x, y, MID);
    if (this.debug) g.lineStyle(Math.max(px, HALF * 2 * C.AIM_PERFECT), 0x00ff00, 0.7).strokeCircle(x, y, MID);
    g.lineStyle(px, 0xffffff).strokeCircle(x, y, C.AIM_R_IN).strokeCircle(x, y, C.AIM_R_OUT);
    g.lineStyle(px, 0xffe040).strokeCircle(x, y, this.r);
  }
}
