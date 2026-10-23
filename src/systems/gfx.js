import Phaser from 'phaser';

// 3x5 glyphs, rows top to bottom
const GLYPHS = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010',
  8: '111101111101111', 9: '111101111001110',
  ' ': '000000000000000', '!': '010010010000010', '.': '000000000000010', ',': '000000000010100',
  '%': '100001010100001', '-': '000000111000000', '—': '000000111000000', '·': '000000010000000',
  ':': '000010000010000', "'": '010010000000000', '?': '110001010000010', '/': '001001010100100'
};

const PAL = { w: '#ffffff', g: '#8a8a8a', d: '#5a5a5a', o: '#ff8a20', y: '#ffd040' };

const pixels = (tx, key, rows) => {
  const c = tx.createCanvas(key, rows[0].length, rows.length), ctx = c.getContext();
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (PAL[ch]) { ctx.fillStyle = PAL[ch]; ctx.fillRect(x, y, 1, 1); }
  }));
  c.refresh();
};

export function initGfx(scene) {
  if (scene.cache.bitmapFont.exists('pix')) return;
  const tx = scene.textures, upper = Object.keys(GLYPHS).join('');
  const chars = upper + upper.replace(/[^A-Z]/g, '').toLowerCase();
  const c = tx.createCanvas('pix', chars.length * 4, 6), ctx = c.getContext();
  ctx.fillStyle = '#fff';
  [...chars].forEach((ch, n) => [...GLYPHS[ch.toUpperCase()]].forEach((b, i) => {
    if (b === '1') ctx.fillRect(n * 4 + (i % 3), (i / 3) | 0, 1, 1);
  }));
  c.refresh();
  scene.cache.bitmapFont.add('pix', Phaser.GameObjects.RetroFont.Parse(scene, {
    image: 'pix', width: 4, height: 6, chars, charsPerRow: chars.length, lineSpacing: 1
  }));

  pixels(tx, 'dino', ['www', 'w w']);
  pixels(tx, 'asteroid', [' ggd ', 'gdggd', 'ogdgg', 'yogdg', ' yog ']);
  pixels(tx, 'cross', ['   w   ', '   w   ', '       ', 'ww   ww', '       ', '   w   ', '   w   ']);
}

export const text = (scene, x, y, s, tint = 0xffffff) =>
  scene.add.bitmapText(x, y, 'pix', s).setTint(tint).setDepth(30);
