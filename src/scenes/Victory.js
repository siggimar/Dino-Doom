import Phaser from 'phaser';
import { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';

export default class Victory extends Phaser.Scene {
  constructor() { super('Victory'); }

  init(data) { this.stats = data; }

  create() {
    initGfx(this);
    this.add.image(0, 0, 'terrain').setOrigin(0).setDisplaySize(W, H);
    this.add.rectangle(0, 50, W, 76, 0x000000, 0.7).setOrigin(0);
    const { time, thrown } = this.stats, s = Math.round(time / 1000);
    text(this, W / 2, 68, 'DINOS DOOMED!', 0xff8a20).setOrigin(0.5).setScale(2);
    text(this, W / 2, 88, `${thrown} rocks in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`).setOrigin(0.5);
    text(this, W / 2, 104, 'Space to play again', 0xffe040).setOrigin(0.5);
    const again = () => this.scene.start('Game');
    this.time.delayedCall(800, () => {
      this.input.keyboard.once('keydown-SPACE', again);
      this.input.once('pointerdown', again);
    });
  }
}
