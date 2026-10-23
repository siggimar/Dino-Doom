import Phaser from 'phaser';
import C from '../config.js';

const FIRE = [0xffa020, 0xff5010, 0xffe060];

export const puff = (scene, x, y, color, ms) => {
  const p = scene.add.rectangle(Math.round(x), Math.round(y), 1, 1, color).setOrigin(0).setDepth(14);
  scene.tweens.add({ targets: p, alpha: 0, duration: ms, onComplete: () => p.destroy() });
};

export function dropAsteroid(scene, x, y, onImpact) {
  const shadow = scene.add.ellipse(x, y, 12, 6, 0x000000, 0.5).setScale(0).setDepth(5);
  const v = scene.cameras.main.worldView, rock = scene.add.image(v.right + 8, v.y - 8, 'asteroid').setDepth(15);
  const trail = scene.time.addEvent({
    delay: 16, loop: true,
    callback: () => puff(scene, rock.x + Phaser.Math.Between(0, 3), rock.y - Phaser.Math.Between(0, 3), Phaser.Utils.Array.GetRandom(FIRE), 250)
  });
  scene.tweens.add({ targets: shadow, scale: 1, duration: C.FALL_TIME });
  scene.tweens.add({
    targets: rock, x, y, duration: C.FALL_TIME, ease: 'Quad.easeIn',
    onComplete: () => { trail.remove(); rock.destroy(); shadow.destroy(); onImpact(); }
  });
}

export function explode(scene, x, y, shake = true) {
  if (shake) { scene.cameras.main.shake(180, 0.015); scene.cameras.main.flash(90, 255, 255, 255); }
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2, d = Phaser.Math.Between(6, 18);
    const p = scene.add.rectangle(x, y, 1, 1, Phaser.Utils.Array.GetRandom(FIRE)).setOrigin(0).setDepth(14);
    scene.tweens.add({
      targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0,
      duration: Phaser.Math.Between(300, 600), ease: 'Quad.easeOut', onComplete: () => p.destroy()
    });
  }
}
