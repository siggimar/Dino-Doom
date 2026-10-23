import Phaser from 'phaser';
import C, { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';

const KEYS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];

// Pause overlay where bones are spent on upgrades
export default class Upgrades extends Phaser.Scene {
  constructor() { super('Upgrades'); }

  create() {
    initGfx(this);
    this.g = this.scene.get('Game');
    this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setInteractive();
    text(this, W / 2, 6, 'UPGRADES', 0xffe040).setOrigin(0.5, 0).setScale(2);
    this.bones = text(this, W / 2, 22, '').setOrigin(0.5, 0);
    this.rows = C.UPGRADES.map((u, i) => {
      const y = 32 + i * 30;
      const bg = this.add.rectangle(16, y, W - 32, 26, 0x202830).setOrigin(0).setStrokeStyle(1, 0x506070)
        .setInteractive().on('pointerdown', () => this.buy(i));
      text(this, 22, y + 5, `${i + 1}  ${u.name}`);
      text(this, 22, y + 15, u.desc, 0x9aa0a8);
      return { bg, pips: text(this, 150, y + 5, ''), cost: text(this, W - 22, y + 10, '').setOrigin(1, 0) };
    });
    const close = this.add.rectangle(W / 2, H - 14, 70, 12, 0x303840).setStrokeStyle(1, 0x607080).setInteractive().on('pointerdown', () => this.close());
    text(this, close.x, close.y, 'CLOSE (U)').setOrigin(0.5);
    C.UPGRADES.forEach((u, i) => this.input.keyboard.on(`keydown-${KEYS[i]}`, () => this.buy(i)));
    ['U', 'ESC'].forEach(k => this.input.keyboard.on(`keydown-${k}`, () => this.close()));
    this.refresh();
  }

  cost(u) { return u.cost * (this.g.upg[u.key] + 1); }

  buy(i) {
    const u = C.UPGRADES[i], g = this.g, row = this.rows[i];
    if (g.upg[u.key] >= u.max || g.bones < this.cost(u)) {
      this.tweens.add({ targets: row.bg, x: { from: 13, to: 19 }, duration: 40, yoyo: true, repeat: 2, onComplete: () => row.bg.setX(16) });
      return;
    }
    g.bones -= this.cost(u);
    g.upg[u.key]++;
    this.refresh();
  }

  refresh() {
    const g = this.g;
    this.bones.setText(`YOU HAVE ${g.bones} BONES`);
    C.UPGRADES.forEach((u, i) => {
      const lvl = g.upg[u.key], r = this.rows[i], maxed = lvl >= u.max, ok = !maxed && g.bones >= this.cost(u);
      r.pips.setText('#'.repeat(lvl) + '-'.repeat(u.max - lvl)).setTint(0xffe040);
      r.cost.setText(maxed ? 'MAX' : `${this.cost(u)} BONES`).setTint(maxed ? 0xffe040 : ok ? 0x60ff60 : 0xff6040);
      r.bg.setFillStyle(ok ? 0x203a28 : 0x202830);
    });
  }

  close() {
    this.scene.stop();
    this.scene.resume('Game');
    this.scene.resume('Ui');
  }
}
