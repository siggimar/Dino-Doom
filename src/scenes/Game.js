import Phaser from 'phaser';
import C, { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';
import Terrain from '../systems/terrain.js';
import Dinos from '../systems/dinos.js';
import Aim from '../systems/aim.js';
import { dropAsteroid, explode } from '../systems/impact.js';

const LABEL_TINT = { 'PERFECT!': 0xffe040, GOOD: 0x60ff60, OK: 0xffffff, MISS: 0xff4040 };

export default class Game extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    initGfx(this);
    const debug = !!this.registry.get('debug');
    this.terrain = new Terrain(this, 'terrain', (Math.random() * 1e9) | 0);
    this.dinos = new Dinos(this, this.terrain, C.DINOS, debug);
    this.aim = new Aim(this);
    this.aim.debug = debug;
    Object.assign(this, { total: this.dinos.count, thrown: 0, cooldown: 0, state: 'target', started: this.time.now, zoomTo: C.ZOOM_MIN, mouse: true });

    const cam = this.cameras.main.setViewport(0, C.HUD_H, W, H - C.HUD_H).setBounds(0, 0, C.MAP_W, C.MAP_H).setZoom(C.ZOOM_MIN);
    cam.centerOn(C.MAP_W / 2, C.MAP_H / 2);
    this.cross = this.add.image(0, 0, 'cross').setDepth(12);
    this.moveCross(C.MAP_W / 2, C.MAP_H / 2);
    this.scene.launch('Ui');

    this.keys = this.input.keyboard.createCursorKeys();
    this.input.on('pointermove', p => {
      this.mouse = true;
      if (!p.isDown || !this.drag) return;
      const d = this.drag;
      if (Math.hypot(p.x - d.x, p.y - d.y) > 4) d.moved = true;
      if (d.moved) cam.setScroll(d.sx - (p.x - d.x) / cam.zoom, d.sy - (p.y - d.y) / cam.zoom);
    });
    this.input.on('pointerdown', p => { this.drag = { x: p.x, y: p.y, sx: cam.scrollX, sy: cam.scrollY }; });
    this.input.on('pointerup', p => {
      const clicked = this.drag && !this.drag.moved && p.y >= C.HUD_H;
      this.drag = null;
      if (!clicked || this.state !== 'target') return;
      const w = cam.getWorldPoint(p.x, p.y);
      this.moveCross(w.x, w.y);
      this.select();
    });
    this.input.on('wheel', (p, objs, dx, dy) => this.zoomBy(-Math.sign(dy), p.x, p.y - C.HUD_H));

    const kb = this.input.keyboard;
    kb.on('keydown-SPACE', () => this.state === 'target' ? this.select() : this.aim.press());
    kb.on('keydown-ENTER', () => this.state === 'target' && this.select());
    ['E', 'PLUS', 'NUMPAD_ADD'].forEach(k => kb.on(`keydown-${k}`, () => this.zoomBy(1)));
    ['Q', 'MINUS', 'NUMPAD_SUBTRACT'].forEach(k => kb.on(`keydown-${k}`, () => this.zoomBy(-1)));
    kb.on('keydown-D', () => {
      const on = !this.registry.get('debug');
      this.registry.set('debug', on);
      this.dinos.setDebug(on);
      this.aim.debug = on;
    });
    kb.on('keydown-N', () => this.registry.get('debug') && (this.cooldown = 0));
  }

  moveCross(x, y) {
    this.cx = Phaser.Math.Clamp(x, 0, C.MAP_W - 1); this.cy = Phaser.Math.Clamp(y, 0, C.MAP_H - 1);
    this.cross.setPosition(Math.round(this.cx), Math.round(this.cy));
  }

  // Integer zoom steps keep pixels crisp; the world point under screen point sx/sy (default: crosshair) stays put
  zoomBy(dir, sx, sy) {
    const cam = this.cameras.main, now = this.time.now, hw = cam.width / 2, hh = cam.height / 2;
    if (now - (this.lastZoom || 0) < 120) return;
    this.lastZoom = now;
    this.zoomTo = Phaser.Math.Clamp(Math.round(this.zoomTo) + dir, C.ZOOM_MIN, C.ZOOM_MAX);
    if (sx === undefined) [sx, sy] = [(this.cx - cam.scrollX - hw) * cam.zoom + hw, (this.cy - cam.scrollY - hh) * cam.zoom + hh];
    this.anchor = { sx, sy, wx: cam.scrollX + hw + (sx - hw) / cam.zoom, wy: cam.scrollY + hh + (sy - hh) / cam.zoom };
  }

  applyZoom(z) {
    const cam = this.cameras.main, { sx, sy, wx, wy } = this.anchor, hw = cam.width / 2, hh = cam.height / 2;
    cam.setZoom(z).setScroll(wx - hw - (sx - hw) / z, wy - hh - (sy - hh) / z);
  }

  // Scroll the camera so a keyboard-driven crosshair stays in view
  follow() {
    const cam = this.cameras.main, v = cam.worldView, m = 24 / cam.zoom;
    if (this.cx < v.x + m) cam.scrollX -= v.x + m - this.cx;
    if (this.cx > v.right - m) cam.scrollX += this.cx - (v.right - m);
    if (this.cy < v.y + m) cam.scrollY -= v.y + m - this.cy;
    if (this.cy > v.bottom - m) cam.scrollY += this.cy - (v.bottom - m);
  }

  select() {
    if (this.cooldown > 0) {
      this.tweens.add({ targets: this.cross, angle: { from: -20, to: 20 }, duration: 50, yoyo: true, repeat: 2, onComplete: () => this.cross.setAngle(0) });
      return;
    }
    this.state = 'aim';
    const { x, y } = this.cross;
    this.aim.start(x, y, res => this.strike(x, y, res));
  }

  strike(tx, ty, res) {
    const zoom = this.cameras.main.zoom;
    const label = text(this, tx, ty - 22, res.label, LABEL_TINT[res.label]).setOrigin(0.5).setScale(1 / zoom);
    this.time.delayedCall(600, () => label.destroy());
    const x = Phaser.Math.Clamp(tx + res.dx, 0, C.MAP_W - 1), y = Phaser.Math.Clamp(ty + res.dy, 0, C.MAP_H - 1);
    this.thrown++;
    this.cooldown = C.ROCK_COOLDOWN;
    this.state = 'target';
    dropAsteroid(this, x, y, () => this.impact(x, y, res.perfect));
  }

  impact(x, y, perfect) {
    if (this.state === 'end') return;
    explode(this, x, y);
    this.terrain.paintCrater(x, y, C.CRATER_R);
    this.dinos.killInRadius(x, y, C.BLAST_R * (perfect ? C.PERFECT_BLAST_MULT : 1));
    if (!this.dinos.count || this.terrain.destroyedPct() >= C.MAP_DESTROYED_PCT) {
      this.state = 'end';
      const data = { time: this.time.now - this.started, thrown: this.thrown };
      this.time.delayedCall(1200, () => { this.scene.stop('Ui'); this.scene.start('Victory', data); });
    }
  }

  update(time, dt) {
    const cam = this.cameras.main;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (cam.zoom !== this.zoomTo) {
      const z = cam.zoom + (this.zoomTo - cam.zoom) * Math.min(1, dt * 0.015);
      this.applyZoom(Math.abs(this.zoomTo - z) < 0.01 ? this.zoomTo : z);
    }
    if (this.state === 'target') {
      const k = this.keys, v = (C.CROSS_SPEED * dt) / 1000 / cam.zoom;
      const dx = (k.right.isDown - k.left.isDown) * v, dy = (k.down.isDown - k.up.isDown) * v;
      if (dx || dy) {
        this.mouse = false;
        this.moveCross(this.cx + dx, this.cy + dy);
        this.follow();
      } else if (this.mouse) {
        const p = this.input.activePointer, w = cam.getWorldPoint(p.x, p.y);
        this.moveCross(w.x, w.y);
      }
    }
    this.cross.setScale(1 / cam.zoom).setTint(this.cooldown ? 0x707070 : 0xffffff);
    this.dinos.update(dt, cam.zoom);
    this.aim.update(dt);
  }
}
