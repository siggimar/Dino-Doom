import C, { W, H } from '../config.js';

export const T = { WATER: 0, SAND: 1, GRASS: 2, FOREST: 3, ROCK: 4, DEEP: 5 };
const LAND = [T.SAND, T.GRASS, T.FOREST];
const COL = {
  deep: [28, 58, 128], water: [44, 88, 170], sand: [214, 194, 124], grass1: [86, 152, 62],
  grass2: [104, 168, 72], forest: [44, 104, 48], rock: [124, 122, 126]
};

export const rng = seed => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const valueNoise = (rand, cell, w, h) => {
  const gw = Math.ceil(w / cell) + 2, g = new Float32Array(gw * (Math.ceil(h / cell) + 2)).map(rand);
  const s = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = x / cell, fy = y / cell, ix = fx | 0, iy = fy | 0, u = s(fx - ix), v = s(fy - iy), i = iy * gw + ix;
    const a = g[i], b = g[i + 1], c = g[i + gw], d = g[i + gw + 1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
};

export default class Terrain {
  constructor(scene, key, seed) {
    this.w = W; this.h = H - C.HUD_H; this.key = key;
    this.rand = rng(seed);
    if (scene.textures.exists(key)) scene.textures.remove(key);
    this.tex = scene.textures.createCanvas(key, this.w, this.h);
    this.ctx = this.tex.getContext();
    this.img = this.ctx.createImageData(this.w, this.h);
    this.type = new Uint8Array(this.w * this.h);
    this.destroyed = new Uint8Array(this.w * this.h);
    this.count = 0;
    this.generate();
    this.image = scene.add.image(0, C.HUD_H, key).setOrigin(0);
  }

  generate() {
    const { w, h, rand } = this, n = c => valueNoise(rand, c, w, h);
    const n1 = n(40), n2 = n(16), n3 = n(6), moist = n(30), patch = n(5);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const e = (0.55 * n1(x, y) + 0.3 * n2(x, y) + 0.15 * n3(x, y) - 0.5) * 1.8 + 0.5;
      const [t, c] = e < 0.26 ? [T.WATER, COL.deep] : e < 0.33 ? [T.WATER, COL.water] : e < 0.38 ? [T.SAND, COL.sand]
        : e > 0.8 ? [T.ROCK, COL.rock] : moist(x, y) > 0.6 ? [T.FOREST, COL.forest]
        : [T.GRASS, patch(x, y) > 0.5 ? COL.grass1 : COL.grass2];
      const i = y * w + x, j = ((rand() * 14) | 0) - 7;
      this.type[i] = t;
      this.setPx(i, c[0] + j, c[1] + j, c[2] + j);
    }
    this.flush();
  }

  setPx(i, r, g, b) {
    const d = this.img.data;
    d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
  }

  flush() { this.ctx.putImageData(this.img, 0, 0); this.tex.refresh(); }

  idx(x, y) {
    const px = Math.floor(x), py = Math.floor(y - C.HUD_H);
    return px < 0 || py < 0 || px >= this.w || py >= this.h ? -1 : py * this.w + px;
  }

  walkable(x, y) { const i = this.idx(x, y); return i >= 0 && LAND.includes(this.type[i]); }

  paintCrater(cx, cy, r) {
    const R = Math.ceil(r + 2), ox = Math.round(cx), oy = Math.round(cy);
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const d = Math.hypot(x, y), i = this.idx(ox + x, oy + y);
      if (i < 0 || d > r + (this.rand() - 0.5) * 3) continue;
      const k = d / r, j = (this.rand() * 14) | 0;
      if (!this.destroyed[i]) { this.destroyed[i] = 1; this.count++; }
      if (k < 0.55) this.type[i] = T.DEEP;
      const c = k < 0.4 ? [18, 12, 10] : k < 0.75 ? [48, 30, 20] : [78, 52, 30];
      this.setPx(i, c[0] + j, c[1] + j * 0.7, c[2] + j * 0.5);
    }
    this.flush();
  }

  destroyedPct() { return this.count / (this.w * this.h); }
}
