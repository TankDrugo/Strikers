# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- 44 files · ~47,184 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 574 nodes · 1273 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `23b2aa3c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- FormatError
- game.js
- Game
- make_sample.py
- boot
- build.mjs
- Stadium
- core.js
- Ball
- nis.py
- UltimateTeam
- retarget.py
- package.json
- Ultimate Team (area, da iniziare)
- test_converter.py
- import_into_blender
- Pose
- strikers_anim.py
- math
- Clip

## God Nodes (most connected - your core abstractions)
1. `Game` - 35 edges
2. `Player` - 22 edges
3. `UltimateTeam` - 22 edges
4. `import_into_blender()` - 21 edges
5. `test_decode()` - 17 edges
6. `STRIKERS_REFERENCE: misure e dinamiche con fonti` - 17 edges
7. `Pose` - 16 edges
8. `boot()` - 16 edges
9. `NameBook` - 15 edges
10. `Stadium` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Tavole: personaggio accanto allo scheletro originale` --semantically_similar_to--> `audit()`  [INFERRED] [semantically similar]
  game/dev/sheet.html → animation/audit.py
- `HUD in partita` --references--> `Hud`  [INFERRED]
  interfaccia-gioco/README.md → game/src/hud.js
- `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` --shares_data_with--> `main()`  [INFERRED]
  characters/README.md → animation/add_characters.py
- `ShootAtFast: velocità di passaggio in forma chiusa` --references--> `shootAtFast()`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/ball.js
- `Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi` --references--> `BALL`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/config.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Da modello .glb a personaggio in campo** — characters_readme_aggiungere_personaggio, animation_add_characters_main, animation_retarget_main, characters_readme_roster_json, game_tools_build, game_src_main_loadassets, game_src_player_player [INFERRED 0.85]
- **Pipeline animazioni: disco → pacchetto → retarget → controllo** — animation_strikers_anim_load_clips, animation_retarget_source_from_disc, animation_retarget_retarget_clip, animation_audit_audit [INFERRED 0.85]

## Communities (21 total, 2 thin omitted)

### Community 0 - "FormatError"
Cohesion: 0.14
Nodes (12): Formati originali .sanim / .shier / .bin, Chunk, _cstr(), FormatError, load_chunks(), load_clips(), load_retargets(), load_skeletons() (+4 more)

### Community 1 - "game.js"
Cohesion: 0.08
Nodes (51): IA: uno pressa, uno marca, gli altri in posizione, Passo fisso di fisica a 50 Hz, bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v (+43 more)

### Community 2 - "Game"
Cohesion: 0.09
Nodes (8): Portiere: posizione, previsione del tiro, tuffo, rinvio, predict(), Game, angleDiff(), Player, seekDirection(), seekSpeed(), SeekSpeed e SeekDirection

### Community 3 - "make_sample.py"
Cohesion: 0.19
Nodes (11): Nomi delle ossa da hash nlStringLowerHash, string_hash(), string_lower_hash(), sample_props(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+3 more)

### Community 4 - "boot"
Cohesion: 0.12
Nodes (20): Gioco senza build (moduli e importmap), Comandi controller Xbox stile EA FC, Input, PAD, PadMenus, padPressed(), padStick(), readPad() (+12 more)

### Community 5 - "build.mjs"
Cohesion: 0.06
Nodes (30): Procedura: aggiungere un personaggio, Dieci personaggi per il 5 contro 5, Ricolorazione della maglia per la seconda squadra, roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere), Ruoli e posti: 0 difensore, 1 centrocampista, 2 ala, 3 attaccante, 4 portiere, Squadra Celestini (5 ruoli, in gioco), Squadra Rivali (5 ruoli, in gioco), Gioco in un solo file HTML (+22 more)

### Community 6 - "Stadium"
Cohesion: 0.13
Nodes (8): Nomi e colori delle squadre (teamInfo): anelli, punteggio, tabellone, tifosi, Hud, makeStage(), ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 7 - "core.js"
Cohesion: 0.08
Nodes (32): CARDS, RARITIES, addCards(), applyMatch(), autoFill(), buyPack(), byId, canPlace() (+24 more)

### Community 8 - "Ball"
Cohesion: 0.20
Nodes (6): Problema noto: pallone oltre 50 m/s, Tiro perfetto con effetto Magnus, Ball, integrate(), Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi, Effetto Magnus solo sul tiro perfetto (barra ≥ 0,99)

### Community 9 - "nis.py"
Cohesion: 0.08
Nodes (27): check_rig(), main(), angle(), audit(), model_frames(), world(), rot_angle(), sample() (+19 more)

### Community 10 - "UltimateTeam"
Cohesion: 0.14
Nodes (6): esc(), shortName(), STAT_LABELS, UltimateTeam, CSS, Walkout

### Community 11 - "retarget.py"
Cohesion: 0.07
Nodes (23): Calibrazione sulla posa idle originale, Metodo di retarget Biped → Mixamo, Rifare il pacchetto dal disco (--export), Root motion nei metadati delle clip, Pacchetto strikers_source.npz (183 clip decodificate), calibrate(), frame_from(), Glb (+15 more)

### Community 12 - "package.json"
Cohesion: 0.18
Nodes (11): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+3 more)

### Community 13 - "Ultimate Team (area, da iniziare)"
Cohesion: 0.10
Nodes (23): Animazioni (area), Personaggi (area), Instradamento per area (CLAUDE.md), Aggiornare grafo e mappa dopo le modifiche, Mappa del progetto (docs/mappa.html), Gioco (area), Interfaccia: domande aperte (stile, schermate, HTML o three.js, lingue), HUD in partita (+15 more)

### Community 14 - "test_converter.py"
Cohesion: 0.15
Nodes (12): world_mats(), contact_time(), strikers_frames(), check(), close(), game_world(), mul_rows(), qclose() (+4 more)

### Community 15 - "import_into_blender"
Cohesion: 0.18
Nodes (8): Convertitore per Blender, _biped_names(), _blender_add_curve(), _blender_fcurve_bag(), import_into_blender(), NameBook, execute(), test_blender()

### Community 16 - "Pose"
Cohesion: 0.15
Nodes (5): _mirror_rot(), _mirror_trans(), Pose, rest_offsets(), Clip a sinistra = clip a destra specchiate

### Community 18 - "strikers_anim.py"
Cohesion: 0.27
Nodes (8): _blender_cli(), clip_states(), _common_args(), dump_json(), _load_cli(), main(), register(), _register_addon()

### Community 19 - "math"
Cohesion: 0.27
Nodes (8): _mat_to_euler_zxy(), _quat_norm(), _quat_to_mat(), _unwrap(), write_bvh(), joint(), sample_quat(), test_bvh_text()

## Ambiguous Edges - Review These
- `.step()` → `Problema noto: pallone oltre 50 m/s`  [AMBIGUOUS]
  game/README.md · relation: references

## Knowledge Gaps
- **15 isolated node(s):** `Convertitore per Blender`, `IA: uno pressa, uno marca, gli altri in posizione`, `Codice decompilato smstrikers-decomp`, `Da misurare: mesh .glg, telecamera, tiri dei gregari`, `Controllo di una singola posa` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 152 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` connect `build.mjs` to `nis.py`, `Ultimate Team (area, da iniziare)`, `Stadium`?**
  _High betweenness centrality (0.274) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `import_into_blender()` (e.g. with `Convertitore per Blender` and `.harvest_path()`) actually correct?**
  _`import_into_blender()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Convertitore per Blender`, `IA: uno pressa, uno marca, gli altri in posizione`, `Codice decompilato smstrikers-decomp` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `FormatError` be split into smaller, more focused modules?**
  _Cohesion score 0.14210526315789473 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `nis.py` to `retarget.py`, `build.mjs`?**
  _High betweenness centrality (0.264) - this node is a cross-community bridge._
- **Should `game.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07526881720430108 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `.step()` and `Problema noto: pallone oltre 50 m/s`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._