import Phaser from 'phaser';
import C, { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';

export default class GameOver extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) { this.level = data.level; }

  create() {
    initGfx(this);
    this.add.image(0, C.HUD_H, 'terrain').setOrigin(0);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0);
    text(this, W / 2, 60, 'GAME OVER', 0xff4040).setOrigin(0.5).setScale(3);
    text(this, W / 2, 88, `Out of rocks! You reached level ${this.level}`).setOrigin(0.5);
    text(this, W / 2, 104, 'Space to retry', 0xffe040).setOrigin(0.5);
    const retry = () => this.scene.start('Game', { level: this.level });
    this.time.delayedCall(500, () => {
      this.input.keyboard.once('keydown-SPACE', retry);
      this.input.once('pointerdown', retry);
    });
  }
}
