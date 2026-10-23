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
1. One big map (`MAP_W`×`MAP_H`, many screens) seen from above; ~250 dinosaurs are tiny, barely visible pixel clusters that wander in herds
2. Pan (mouse drag / arrow-key cursor pushing the edge) and zoom (wheel, Q/E, 1×–4× integer steps). Dinos switch to more detailed sprites as you zoom in. Minimap shows the current view
3. Player picks a target spot (click / arrow-key cursor)
4. **Aim minigame (rhythm):** two fixed concentric circles around the target form a ring zone. A third indicator circle starts outside both and shrinks. Press **Space** while the indicator is between the two circles
   - Accuracy = how close to the ring's center line the press was
   - Impact lands offset from the target proportional to the error; a miss (outside the ring) lands far off
   - Shrink speed varies per throw, and sometimes speeds up/slows down mid-shrink
5. Asteroid falls → crater (destroyed terrain pixels) + blast radius kills dinos
6. Infinite rocks, but a `ROCK_COOLDOWN` (15 s) reload after each throw; scouting is allowed while reloading

## Win
- **All dinosaurs dead** OR **the map is destroyed** (≥ `MAP_DESTROYED_PCT` of terrain cratered) → victory screen with rocks thrown and time
- No levels and no lose condition for now (playtest decision: one big map, infinite rocks with cooldown)
- Old idea, parked: escape cutscene where a survivor runs off "to warn his friends" — could return as the trigger for dinos gaining defenses over time

## Dinosaur defenses (unlock trigger TBD now that there are no levels)
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
2. **M2 – Big map:** one large map, zoom + pan + minimap, detailed dino sprites when zoomed, infinite rocks with cooldown, victory screen
3. **M3 – First defenses:** scatter + burrowing
4. **M4 – Settlements:** towns, force fields
5. **M5 – Artillery**
6. Polish: sound, screen shake, particles, title screen, score/high score
