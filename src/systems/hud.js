import C, { W, H } from '../config.js';
import { text } from './gfx.js';

export default class Hud {
  constructor(scene) {
    this.scene = scene;
    scene.add.rectangle(0, 0, W, C.HUD_H, 0x000000).setOrigin(0).setDepth(29);
    this.t = text(scene, 3, 3, '');
    this.fps = text(scene, 2, H - 7, '', 0x00ff00).setVisible(false);
  }

  set(level, dinos, rocks, pct, debug) {
    this.t.setText(`LVL ${level}   DINOS ${dinos}   ROCKS ${rocks}   DESTROYED ${Math.floor(pct * 100)}%`);
    this.fps.setVisible(debug).setText(`FPS ${Math.round(this.scene.game.loop.actualFps)}`);
  }
}
