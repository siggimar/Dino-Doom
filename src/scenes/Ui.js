import Phaser from 'phaser';
import C, { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';

const MM_W = 64, MM_H = 36, MM_X = W - MM_W - 2, MM_Y = H - MM_H - 2, MM_S = MM_W / C.MAP_W;

// HUD overlay drawn above the zoomable Game camera
export default class Ui extends Phaser.Scene {
  constructor() { super('Ui'); }

  create() {
    initGfx(this);
    const g = this.scene.get('Game');
    this.add.rectangle(0, 0, W, C.HUD_H, 0x000000).setOrigin(0);
    this.t = text(this, 3, 3, '');
    this.ready = text(this, 112, 3, '');
    this.bar = this.add.rectangle(112, 10, 0, 1, 0xff6040).setOrigin(0);
    this.def = text(this, 162, 3, '', 0xff4040);
    this.button(252, 12, '-', () => g.zoomBy(-1));
    this.button(266, 12, '+', () => g.zoomBy(1));
    this.upgBtn = this.button(280, 38, 'UPGRADES', () => g.openUpgrades());
    this.fps = text(this, 2, H - 7, '', 0x00ff00);

    this.add.rectangle(MM_X - 1, MM_Y - 1, MM_W + 2, MM_H + 2, 0x000000).setOrigin(0);
    this.add.image(MM_X, MM_Y, 'terrain').setOrigin(0).setDisplaySize(MM_W, MM_H)
      .setInteractive().on('pointerdown', p => g.cameras.main.centerOn((p.x - MM_X) / MM_S, (p.y - MM_Y) / MM_S));
    this.view = this.add.rectangle(MM_X, MM_Y, 1, 1).setOrigin(0).setStrokeStyle(1, 0xffffff);
    this.map = text(this, MM_X, MM_Y - 7, '');
  }

  button(x, w, label, fn) {
    const bg = this.add.rectangle(x, 1, w, 10, 0x303840).setOrigin(0).setStrokeStyle(1, 0x607080).setInteractive().on('pointerdown', fn);
    bg.label = text(this, x + w / 2, 3, label).setOrigin(0.5, 0);
    return bg;
  }

  // Pointer is over the HUD or minimap, so the Game should ignore it
  blocks(p) {
    return p.y < C.HUD_H || (p.x >= MM_X - 1 && p.y >= MM_Y - 1);
  }

  banner(msg) {
    const bg = this.add.rectangle(0, 20, W, 11, 0x000000, 0.75).setOrigin(0);
    const t = text(this, W / 2, 23, msg, 0xff4040).setOrigin(0.5, 0);
    this.tweens.add({ targets: t, alpha: 0.3, duration: 250, yoyo: true, repeat: 5 });
    this.time.delayedCall(3500, () => { bg.destroy(); t.destroy(); });
  }

  update() {
    const g = this.scene.get('Game'), v = g.cameras.main.worldView, cd = g.cooldown;
    const full = g.cooldown && C.ROCK_COOLDOWN - g.upg.reload * C.UPG_RELOAD_STEP;
    const canBuy = C.UPGRADES.some(u => g.upg[u.key] < u.max && g.bones >= u.cost * (g.upg[u.key] + 1));
    this.t.setText(`DINOS ${g.dinos.count}/${g.total}  BONES ${g.bones}`);
    this.ready.setText(cd ? `RELOAD ${Math.ceil(cd / 1000)}` : 'READY').setTint(cd ? 0xff6040 : 0x60ff60);
    this.bar.width = cd ? Math.round((cd / full) * 36) : 0;
    this.def.setText(g.dinos.defenses.length ? `DEF ${g.dinos.defenses.length}` : '');
    this.upgBtn.setFillStyle(canBuy ? 0x806010 : 0x303840);
    this.map.setText(`MAP ${Math.floor(g.terrain.destroyedPct() * 100)}%`);
    this.view.setPosition(MM_X + Math.round(v.x * MM_S), MM_Y + Math.round(v.y * MM_S)).setSize(Math.max(2, v.width * MM_S), Math.max(2, v.height * MM_S));
    this.fps.setVisible(!!this.registry.get('debug')).setText(`FPS ${Math.round(this.game.loop.actualFps)}`);
  }
}
