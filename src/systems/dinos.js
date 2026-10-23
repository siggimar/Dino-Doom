import Phaser from 'phaser';
import C from '../config.js';

const COLORS = [0x6e7837, 0x786440, 0x5f6e30];
const DEBUG_TINT = 0xff2020;
const LOD = [[3, 'dino-l', 0.25], [1.75, 'dino-m', 0.5], [0, 'dino', 1]];
const between = Phaser.Math.FloatBetween;

// Behaviors run every frame as (dino, dt, dinos), in order; one returning true takes over that frame
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
  if (terrain.walkable(nx, ny)) { d.x = nx; d.y = ny; d.moving = true; d.left = dx < 0; } else { d.tx = d.x; d.ty = d.y; }
};

// Dino-Defence: run away from the shadow of an incoming asteroid (after a moment of shock)
export const scatter = (d, dt, { terrain, threats }) => {
  if (!d.flee) {
    const t = threats.find(t => t.id > (d.seen || 0) && Math.hypot(d.x - t.x, d.y - t.y) < C.SCATTER_R);
    if (!t) return false;
    d.seen = t.id;
    if (Math.random() > C.SCATTER_CHANCE) return false;
    d.flee = { t, delay: between(C.SCATTER_REACT_MIN, C.SCATTER_REACT_MAX) };
  }
  const { t } = d.flee;
  if (!threats.includes(t)) { d.flee = null; d.tx = d.x; d.ty = d.y; return false; }
  if ((d.flee.delay -= dt) > 0) return true;
  const dx = d.x - t.x, dy = d.y - t.y, dist = Math.hypot(dx, dy) || 1, step = (C.SCATTER_SPEED * dt) / 1000;
  const nx = d.x + (dx / dist) * step, ny = d.y + (dy / dist) * step;
  if (terrain.walkable(nx, ny)) { d.x = nx; d.y = ny; d.moving = true; d.left = dx < 0; }
  return true;
};

const DEFENSE_BEHAVIORS = { scatter };

export default class Dinos {
  constructor(scene, terrain, count, debug) {
    Object.assign(this, { scene, terrain, debug, list: [], threats: [], defenses: [] });
    const { w, h } = terrain;
    for (let tries = 0; this.list.length < count && tries < 20000; tries++) {
      const cx = between(4, w - 4), cy = between(4, h - 4);
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

  enable(key) {
    if (this.defenses.includes(key)) return;
    this.defenses.push(key);
    this.list.forEach(d => d.behaviors.unshift(DEFENSE_BEHAVIORS[key]));
  }

  setDebug(on) {
    this.debug = on;
    this.list.forEach(d => d.sprite.setTint(on ? DEBUG_TINT : d.tint));
  }

  // Sprites get more detailed (finer pixels) as the camera zooms in
  update(dt, zoom = 1) {
    const [, key, s] = LOD.find(l => zoom >= l[0]);
    for (const d of this.list) {
      d.moving = false;
      d.behaviors.some(b => b(d, dt, this));
      if (d.moving && (d.anim += dt) > 180) { d.anim = 0; d.step ^= 1; }
      if (d.sprite.texture.key !== key) d.sprite.setTexture(key).setScale(s);
      d.sprite.setFlipX(!!d.left).setPosition(Math.round(d.x / s) * s, Math.round(d.y / s) * s - d.step * s);
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
