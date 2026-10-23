# Dino Doom (working title)

Top-down pixel-art browser game. The player is an asteroid wiping out dinosaurs, who develop better defenses as levels progress. Designed by an 11-year-old, so playtest feedback drives priorities.

## Tech
- JavaScript + Phaser 3, bundled with Vite
- Deployed to GitHub Pages (`npm run build` → `dist/`)
- Pixel art: nearest-neighbor scaling, `pixelArt: true`, fixed low internal resolution scaled up
- Must work with keyboard on desktop; touch support later

## Code style
- Short, concise code; no verbose comments, one-liners only where needed
- One scene/system per file; keep tuning values (speeds, radii, counts) in `src/config.js`
- Keep the game playable after every change

## Core loop
1. Player sees the map from above; dinosaurs are tiny, barely visible pixel clusters that wander
2. Player picks a target spot (click / arrow-key cursor)
3. **Aim minigame (rhythm):** two fixed concentric circles around the target form a ring zone. A third indicator circle starts outside both and shrinks. Press **Space** while the indicator is between the two circles
   - Accuracy = how close to the ring's center line the press was
   - Impact lands offset from the target proportional to the error; a miss (outside the ring) lands far off
   - Shrink speed varies per throw (and can speed up/slow down mid-shrink at higher levels)
4. Asteroid falls → crater (destroyed terrain pixels) + blast radius kills dinos
5. Repeat

## Win / lose
- Level cleared when **all dinosaurs are dead** OR **the map is destroyed** (≥ `MAP_DESTROYED_PCT` of terrain cratered, default 90%)
- Limited asteroids per level (proposed); out of asteroids with dinos alive = level failed

## Level transition
After a level is cleared, one surviving dino is seen scurrying off the map edge "to warn his friends" (short cutscene with a "!!!" speech bubble), then the next level starts. Story hook for why the next dinos are better prepared.

## Dinosaur defenses (unlocked by level)
| Defense | Effect |
|---|---|
| Scatter | Dinos run from the impact shadow during the fall |
| Burrowing | Dinos dig in; only a near-direct hit kills them |
| Force field | Dome over settlements; absorbs hits, needs several or a perfect throw to break |
| Artillery | Fires at the incoming asteroid, knocking it off course. Upgrades in tiers: T1 small shells, poor aim → T2 bigger bombs, even worse aim → T3+ big bombs, accuracy improves per tier |
| Settlements | Dinos cluster into towns, which hold force fields/artillery |

Ideas list (not yet approved): decoys, radar (makes aim ring faster), jamming (indicator wobbles), egg nests that respawn dinos, tunnels between settlements, camouflage in forests.

## Milestones
1. **M1 – Playable core:** static pixel map, ~12 wandering dino dots, target select, rhythm aim, crater + kills, kill counter
2. **M2 – Levels:** win/lose conditions, asteroid count, level screen, increasing aim difficulty
3. **M3 – First defenses:** scatter + burrowing
4. **M4 – Settlements:** towns, force fields
5. **M5 – Artillery**
6. Polish: sound, screen shake, particles, title screen, score/high score
