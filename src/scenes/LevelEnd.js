import Phaser from 'phaser';
import C, { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';
import { puff } from '../systems/impact.js';

export default class LevelEnd extends Phaser.Scene {
  constructor() { super('LevelEnd'); }

  init(data) { this.level = data.level; this.from = data.survivor; }

  create() {
    initGfx(this);
    this.add.image(0, C.HUD_H, 'terrain').setOrigin(0);
    text(this, 3, 3, `LEVEL ${this.level} CLEARED`, 0x60ff60);
    const { x, y } = this.from;
    const dino = this.add.image(Math.round(x), Math.round(y), 'dino').setTint(0x8a9a44).setScale(0).setDepth(8);
    this.tweens.add({ targets: dino, scale: 1, duration: 150, delay: 300 });
    this.tweens.add({ targets: dino, y: dino.y - 2, yoyo: true, duration: 150, delay: 300 });
    this.time.delayedCall(900, () => this.alert(dino));
  }

  alert(dino) {
    const up = dino.y - 9 >= C.HUD_H + 5, bx = Phaser.Math.Clamp(dino.x, 8, W - 9), by = dino.y + (up ? -9 : 9);
    const bubble = this.add.rectangle(bx, by, 15, 9, 0xffffff).setDepth(20);
    const tail = this.add.rectangle(dino.x, by + (up ? 5 : -6), 1, 2, 0xffffff).setDepth(20);
    const bang = text(this, bx, by, '!!!', 0xd02020).setOrigin(0.5);
    this.time.delayedCall(900, () => { [bubble, tail, bang].forEach(o => o.destroy()); this.run(dino); });
  }

  run(dino) {
    const { x, y } = dino, edges = [[-4, y, x], [W + 4, y, W - x], [x, C.HUD_H - 4, y - C.HUD_H], [x, H + 4, H - y]];
    const [tx, ty, dist] = edges.sort((a, b) => a[2] - b[2])[0];
    const dust = this.time.addEvent({
      delay: 60, loop: true,
      callback: () => { puff(this, dino.x, dino.y + 1, 0xc8b48a, 300); dino.setFlipY(!dino.flipY); }
    });
    this.tweens.add({
      targets: dino, x: tx, y: ty, duration: ((dist + 4) / C.DINO_RUN_SPEED) * 1000,
      onComplete: () => { dust.remove(); dino.destroy(); this.message(); }
    });
  }

  message() {
    this.add.rectangle(0, 70, W, 34, 0x000000, 0.7).setOrigin(0).setDepth(29);
    text(this, W / 2, 80, "One got away... he's warning the others!").setOrigin(0.5);
    this.time.delayedCall(700, () => {
      text(this, W / 2, 93, `LEVEL ${this.level + 1} — Space to continue`, 0xffe040).setOrigin(0.5);
      this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game', { level: this.level + 1 }));
      this.input.once('pointerdown', () => this.scene.start('Game', { level: this.level + 1 }));
    });
  }
}
