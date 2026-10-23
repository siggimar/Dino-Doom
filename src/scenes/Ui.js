import Phaser from 'phaser';
import C, { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';

const MM_W = 64, MM_H = 36, MM_X = W - MM_W - 2, MM_Y = H - MM_H - 2;

// HUD overlay drawn above the zoomable Game camera
export default class Ui extends Phaser.Scene {
  constructor() { super('Ui'); }

  create() {
    initGfx(this);
    this.add.rectangle(0, 0, W, C.HUD_H, 0x000000).setOrigin(0);
    this.t = text(this, 3, 3, '');
    this.ready = text(this, W - 3, 3, '').setOrigin(1, 0);
    this.bar = this.add.rectangle(W - 3, 10, 0, 1, 0xff6040).setOrigin(1, 0);
    this.fps = text(this, 2, H - 7, '', 0x00ff00);
    this.add.rectangle(MM_X - 1, MM_Y - 1, MM_W + 2, MM_H + 2, 0x000000).setOrigin(0);
    this.add.image(MM_X, MM_Y, 'terrain').setOrigin(0).setDisplaySize(MM_W, MM_H);
    this.view = this.add.rectangle(MM_X, MM_Y, 1, 1).setOrigin(0).setStrokeStyle(1, 0xffffff);
  }

  update() {
    const g = this.scene.get('Game'), v = g.cameras.main.worldView, s = MM_W / C.MAP_W, cd = g.cooldown;
    this.t.setText(`DINOS ${g.dinos.count}/${g.total}   ROCKS ${g.thrown}   DESTROYED ${Math.floor(g.terrain.destroyedPct() * 100)}%`);
    this.ready.setText(cd ? `RELOAD ${Math.ceil(cd / 1000)}` : 'READY').setTint(cd ? 0xff6040 : 0x60ff60);
    this.bar.width = Math.round((cd / C.ROCK_COOLDOWN) * 36);
    this.view.setPosition(MM_X + Math.round(v.x * s), MM_Y + Math.round(v.y * s)).setSize(Math.max(2, v.width * s), Math.max(2, v.height * s));
    this.fps.setVisible(!!this.registry.get('debug')).setText(`FPS ${Math.round(this.game.loop.actualFps)}`);
  }
}
