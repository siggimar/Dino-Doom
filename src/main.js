import Phaser from 'phaser';
import { W, H } from './config.js';
import Title from './scenes/Title.js';
import Game from './scenes/Game.js';
import Ui from './scenes/Ui.js';
import Victory from './scenes/Victory.js';
import Upgrades from './scenes/Upgrades.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Title, Game, Ui, Victory, Upgrades]
});

if (import.meta.env.DEV) window.game = game;
