# Task: Build the playable prototype (M1 + M2 + escape cutscene)

Read `CLAUDE.md` first; it is the source of truth for the game design and code style. Build in the steps below, and make sure `npm run dev` runs without errors after each step.

## 0. Project setup
- Vite + Phaser 3 project in the repo root: `index.html`, `src/`, `package.json`
- `vite.config.js` with `base: './'` so it works on GitHub Pages
- Add `.github/workflows/deploy.yml` that builds and deploys `dist/` to GitHub Pages on push to `main`
- Phaser config: internal resolution 320×180, `pixelArt: true`, `roundPixels: true`, `Scale.FIT` + `CENTER_BOTH`, black background
- No external art files for now: generate all graphics in code (`Graphics` → `generateTexture`, or canvas textures)

File layout:
```
src/
  main.js            Phaser config + scene list
  config.js          all tuning values (see bottom)
  scenes/Title.js
  scenes/Game.js
  scenes/LevelEnd.js
  scenes/GameOver.js
  systems/terrain.js map generation, crater painting, destroyed %
  systems/dinos.js   spawning, wandering, kill checks
  systems/aim.js     rhythm aiming minigame
  systems/hud.js
```

## 1. Terrain
- Map is a canvas texture the size of the screen (320×180 px, minus a 12 px HUD strip at the top)
- Generate with simple value noise (write a small function, no library): water (blue), sand, grass (two greens), forest (dark green), rock (grey). Add 1-px random color jitter per pixel so it looks hand-pixeled
- Seed the generator per level, so each level gets a different map
- `paintCrater(x, y, r)`: inside radius r, set pixels to dark brown/black scorched colors (darker near center, ragged edge via random noise). Track a `destroyed` boolean grid
- `destroyedPct()` returns the share of map pixels that are destroyed

## 2. Dinosaurs
- Each dino is 2×2 px (or 3×2) in a slightly off-grass color (olive/brown), so they are **hard to spot** on purpose
- Spawn on land only (not water/rock), loosely in small groups of 2–5
- Wander: pick a random nearby land point, walk slowly (`DINO_SPEED`), pause, repeat. Never enter water, rock or craters' deep center
- 1-frame "step" animation (shift 1 px) so they are visible when moving
- `killInRadius(x, y, r)` removes dinos inside the radius; on death, flash a 1-px red dot for 300 ms

## 3. Targeting
- Mouse: a pixel crosshair follows the cursor; click to choose the target
- Keyboard alternative: arrow keys move the crosshair, Space/Enter chooses the target
- Once a target is chosen, input switches to the aim minigame (no re-targeting mid-aim)

## 4. Aim minigame (rhythm)
Draw around the target:
- Inner circle radius `AIM_R_IN` and outer circle radius `AIM_R_OUT` (fixed, white, 1 px). The band between them is the "hit zone"; tint it faintly
- An indicator circle (yellow) starts at `AIM_R_START` and shrinks toward 0
- Shrink speed is random each throw within `[AIM_SPEED_MIN, AIM_SPEED_MAX]`, scaled up by level (`AIM_SPEED_LEVEL_MULT ^ (level-1)`)
- From level 3+: speed can change once mid-shrink (random speed-up or slow-down) so you can't just memorize the timing
- Press **Space**:
  - `mid = (AIM_R_IN + AIM_R_OUT) / 2`, `half = (AIM_R_OUT - AIM_R_IN) / 2`
  - Inside the band: `err = |r - mid| / half` (0 = perfect, 1 = edge). Impact offset = `err * AIM_MAX_OFFSET` in a random direction
  - Outside the band: miss, offset random in `[AIM_MISS_MIN, AIM_MISS_MAX]`
  - `err < AIM_PERFECT` → **PERFECT**: blast radius × `PERFECT_BLAST_MULT`
- If the indicator shrinks past the inner circle without a press, it counts as a miss
- Show feedback text for 600 ms: "PERFECT!", "GOOD", "OK", "MISS"

## 5. Impact
- Asteroid: a 5×5 grey/orange pixel blob with a short flame trail, flying in from the top-right corner to the impact point over `FALL_TIME` ms
- A dark shadow ellipse grows at the impact point during the fall
- On impact: screen shake, a white flash, orange pixel particles, `paintCrater(r = CRATER_R)`, `killInRadius(r = BLAST_R)` (× perfect mult if earned)
- Decrement the asteroid count

## 6. HUD (top strip)
`LVL 1   DINOS 14   ROCKS 6   DESTROYED 12%`, in a tiny pixel font (Phaser bitmap text generated from a 3×5 font, or a monospace web font at a small size with no smoothing)

## 7. Levels, win and lose
- Level n: `dinos = DINOS_BASE + DINOS_PER_LEVEL*(n-1)`, `rocks = ceil(dinos / DINOS_PER_ROCK) + ROCKS_BONUS`
- **Win:** all dinos dead OR `destroyedPct() >= MAP_DESTROYED_PCT` → wait 800 ms → LevelEnd scene
- **Lose:** rocks = 0 and dinos alive, after the last impact resolves → GameOver scene (show the level reached, and "Space to retry")

## 8. Escape cutscene (LevelEnd scene)
- Keep the destroyed map visible (pass the terrain texture or a snapshot)
- One survivor dino pops out from a crater edge (or from the last dino alive, if the level was won by destroying the map)
- Pause briefly; a "!!!" speech bubble appears above it
- It runs to the nearest screen edge (faster than normal walking, with tiny dust puffs) and leaves the screen
- Text: "One got away... he's warning the others!" then "LEVEL n+1 — Space to continue"
- Space → Game scene with level n+1

## 9. Title scene
- Title "DINO DOOM", a falling asteroid animation over a generated map, "Press Space"
- Short controls hint: "Click to target · Space to strike"

## 10. Tuning values (`src/config.js`)
Export these as one object, with placeholder values to tweak during playtests:
```
HUD_H 12
AIM_R_IN 10, AIM_R_OUT 16, AIM_R_START 60
AIM_SPEED_MIN 25, AIM_SPEED_MAX 55, AIM_SPEED_LEVEL_MULT 1.12
AIM_MAX_OFFSET 14, AIM_MISS_MIN 20, AIM_MISS_MAX 40, AIM_PERFECT 0.15
FALL_TIME 900, CRATER_R 9, BLAST_R 12, PERFECT_BLAST_MULT 1.5
DINOS_BASE 12, DINOS_PER_LEVEL 4, DINOS_PER_ROCK 3, ROCKS_BONUS 3
DINO_SPEED 6, MAP_DESTROYED_PCT 0.9
```

## 11. Debug helpers
- `D` toggles debug: dinos drawn bright red, the hit zone shown, and FPS
- `N` skips to the next level (debug only)

## Done when
- [ ] `npm run dev` runs; `npm run build` produces a working `dist/`
- [ ] Title → Game → aim → impact → craters and kills work end to end
- [ ] Rhythm aim gives clearly different results for perfect, good and miss
- [ ] Levels advance, with the escape cutscene in between; difficulty rises
- [ ] Game over and retry work
- [ ] Mouse and keyboard-only both playable
- [ ] Code follows the style in CLAUDE.md

Do **not** implement the dinosaur defenses yet (scatter, burrowing, force field, artillery); those are later milestones. Structure `dinos.js` so behaviors can be added per level later (e.g. a `behaviors` list per dino).
