import Phaser from 'phaser';
import C from '../config.js';

const COLORS = [0x6e7837, 0x786440, 0x5f6e30];
const DEBUG_TINT = 0xff2020;
const between = Phaser.Math.FloatBetween;

// Behaviors run every frame as (dino, dt, dinos); later levels can push more (scatter, burrow...)
export const wander = (d, dt, { terrain }) => {
  if (d.wait > 0) { d.wait -= dt; return; }
  const dx = d.tx - d.x, dy = d.ty - d.y, dist = Math.hypot(dx, dy);
  if (dist < 0.5) {
    d.wait = between(500, 2500);
    for (let i = 0; i < 6; i++) {
      const tx = d.x + between(-16, 16), ty = d.y + between(-16, 16);
      if (terrain.walkable(tx, ty)) { d.tx = tx; d.ty = ty; break; }
    }
    return;
  }
  const step = Math.min(dist, (C.DINO_SPEED * dt) / 1000), nx = d.x + (dx / dist) * step, ny = d.y + (dy / dist) * step;
  if (terrain.walkable(nx, ny)) { d.x = nx; d.y = ny; d.moving = true; } else { d.tx = d.x; d.ty = d.y; }
};

export default class Dinos {
  constructor(scene, terrain, count, debug) {
    Object.assign(this, { scene, terrain, debug, list: [] });
    const { w, h } = terrain, top = C.HUD_H;
    for (let tries = 0; this.list.length < count && tries < 2000; tries++) {
      const cx = between(4, w - 4), cy = between(top + 4, top + h - 4);
      if (!terrain.walkable(cx, cy)) continue;
      const size = Math.min(Phaser.Math.Between(2, 5), count - this.list.length);
      for (let i = 0, t = 0; i < size && t < 50; t++) {
        const x = cx + between(-6, 6), y = cy + between(-6, 6);
        if (terrain.walkable(x, y)) { this.add(x, y); i++; }
      }
    }
  }

  add(x, y) {
    const tint = Phaser.Utils.Array.GetRandom(COLORS);
    const sprite = this.scene.add.image(x, y, 'dino').setDepth(8).setTint(this.debug ? DEBUG_TINT : tint);
    this.list.push({ x, y, tx: x, ty: y, wait: between(0, 2000), anim: 0, step: 0, tint, sprite, behaviors: [wander] });
  }

  get count() { return this.list.length; }

  setDebug(on) {
    this.debug = on;
    this.list.forEach(d => d.sprite.setTint(on ? DEBUG_TINT : d.tint));
  }

  update(dt) {
    for (const d of this.list) {
      d.moving = false;
      d.behaviors.forEach(b => b(d, dt, this));
      if (d.moving && (d.anim += dt) > 180) { d.anim = 0; d.step ^= 1; }
      d.sprite.setPosition(Math.round(d.x), Math.round(d.y) - d.step);
    }
  }

  killInRadius(x, y, r) {
    const dead = this.list.filter(d => Math.hypot(d.x - x, d.y - y) <= r);
    this.list = this.list.filter(d => !dead.includes(d));
    dead.forEach(d => {
      d.sprite.destroy();
      const dot = this.scene.add.rectangle(Math.round(d.x), Math.round(d.y), 1, 1, 0xff0000).setOrigin(0).setDepth(9);
      this.scene.time.delayedCall(300, () => dot.destroy());
    });
    return dead.length;
  }
}
