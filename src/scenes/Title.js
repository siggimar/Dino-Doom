import Phaser from 'phaser';
import C, { W, H } from '../config.js';
import { initGfx, text } from '../systems/gfx.js';
import Terrain from '../systems/terrain.js';
import { dropAsteroid, explode } from '../systems/impact.js';

export default class Title extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    initGfx(this);
    const map = new Terrain(this, 'title-map', (Math.random() * 1e9) | 0, W, H, 0.4);
    const drop = () => {
      const x = Phaser.Math.Between(20, W - 20), y = Phaser.Math.Between(20, H - 10);
      dropAsteroid(this, x, y, () => { explode(this, x, y, false); map.paintCrater(x, y, C.CRATER_R); });
    };
    this.time.addEvent({ delay: 1600, loop: true, callback: drop });
    drop();

    this.add.rectangle(0, 50, W, 76, 0x000000, 0.6).setOrigin(0).setDepth(29);
    text(this, W / 2, 70, 'DINO DOOM', 0xff8a20).setOrigin(0.5).setScale(4);
    text(this, W / 2, 96, 'Press Space', 0xffe040).setOrigin(0.5);
    text(this, W / 2, 108, 'Click/tap to target · again to strike', 0xaaaaaa).setOrigin(0.5);
    text(this, W / 2, 116, 'Drag to move · Wheel or Q/E zoom · U upgrades', 0xaaaaaa).setOrigin(0.5);

    const start = () => this.scene.start('Game');
    this.input.keyboard.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);
  }
}
