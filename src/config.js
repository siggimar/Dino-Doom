export const W = 320, H = 180;

export default {
  HUD_H: 12, MAP_W: 1280, MAP_H: 720, DINOS: 250,
  ZOOM_MIN: 1, ZOOM_MAX: 4, CROSS_SPEED: 70,
  ROCK_COOLDOWN: 10000, BONES_PER_KILL: 1,
  AIM_R_IN: 10, AIM_R_OUT: 16, AIM_R_START: 60,
  AIM_SPEED_MIN: 25, AIM_SPEED_MAX: 55, AIM_CHANGE_CHANCE: 0.3,
  AIM_MAX_OFFSET: 14, AIM_MISS_MIN: 20, AIM_MISS_MAX: 40, AIM_PERFECT: 0.15,
  FALL_TIME: 900, CRATER_R: 9, BLAST_R: 12, PERFECT_BLAST_MULT: 1.5,
  DINO_SPEED: 6, MAP_DESTROYED_PCT: 0.9,

  // Upgrade cost = cost * (level + 1)
  UPGRADES: [
    { key: 'reload', name: 'FAST RELOAD', desc: 'RELOAD 1.5 SEC FASTER', cost: 5, max: 4 },
    { key: 'blast', name: 'BIGGER BOOM', desc: 'BLAST AND CRATER +25%', cost: 6, max: 4 },
    { key: 'steady', name: 'STEADY AIM', desc: 'AIM RING 12% SLOWER', cost: 4, max: 4 },
    { key: 'cluster', name: 'CLUSTER ROCK', desc: '+1 MINI ROCK AROUND THE HIT', cost: 8, max: 4 }
  ],
  UPG_RELOAD_STEP: 1500, UPG_BLAST_STEP: 0.25, UPG_STEADY_STEP: 0.12,
  CLUSTER_SPREAD_MIN: 10, CLUSTER_SPREAD_MAX: 24, CLUSTER_CRATER_R: 5, CLUSTER_BLAST_R: 7,

  // Dino-Defences: each comes online once this share of all dinos has been killed
  DEFENSES: [{ key: 'scatter', at: 0.1, name: 'SCATTER' }],
  SCATTER_R: 30, SCATTER_CHANCE: 0.7, SCATTER_SPEED: 18, SCATTER_REACT_MIN: 150, SCATTER_REACT_MAX: 450
};
