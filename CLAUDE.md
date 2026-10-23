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

## Upgrades (bones economy)
- Each kill = `BONES_PER_KILL` bone. U key / HUD button opens a pause menu; upgrade cost = `cost × (level + 1)`, max 4 levels
- Fast Reload, Bigger Boom, Steady Aim, Cluster Rock (mini rocks around the hit, which arrive with no shadow, so Scatter can't dodge them)
- Every new defense should have an upgrade that counters it

## Dino-Defences™
The dinos fight back as their losses grow: each defense comes online when the share of dinos killed passes its `at` threshold in `config.DEFENSES`, with a red "DINO-DEFENCES ONLINE" banner. Defenses are per-dino behaviors (`dinos.js`, `enable(key)`), so each one is a self-contained function.

| Online at | Defense | Effect | Counter upgrade |
|---|---|---|---|
| 10% ✅ | Scatter | 70% of dinos near the falling shadow freeze briefly, then run away | Cluster Rock, Bigger Boom |
| 25% | Burrowing | Dinos dig in when a shadow appears; only a near-direct (PERFECT) hit kills them | Bunker Buster (burrowed dinos die in a small center radius) |
| 40% | Settlements | Survivors gather into a few towns (visible huts at higher zoom) | — (makes them easier to find, but sets up the next two) |
| 55% | Force field | Dome over each town; absorbs hits, breaks after 3 hits or 1 PERFECT | Shield Breaker (double damage to domes) |
| 70% | Artillery T1 | Towns fire small shells at the falling rock, nudging it a few px off course; poor aim | Armored Rock (smaller nudges) |
| 85% | Artillery T2+ | Bigger shells, better aim with each tier | Decoy Rock (artillery shoots at a fake) |

Ideas list (not yet approved): radar (makes aim ring faster), jamming (indicator wobbles), egg nests that respawn dinos, tunnels between settlements, camouflage in forests.

## Milestones
1. **M1 – Playable core:** static pixel map, ~12 wandering dino dots, target select, rhythm aim, crater + kills, kill counter
2. **M2 – Big map:** one large map, zoom + pan + minimap, detailed dino sprites when zoomed, infinite rocks with cooldown, victory screen
3. **M3 – Upgrades + first defenses:** bones, upgrade menu, scatter ✅, burrowing
4. **M4 – Settlements:** towns, force fields
5. **M5 – Artillery**
6. Polish: sound, screen shake, particles, title screen, score/high score
