# Graph Report - Strikers  (2026-10-30)

## Corpus Check
- 45 files · ~63,980 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 615 nodes · 1429 edges · 27 communities (23 shown, 4 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 190 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5d6f7ef`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Pose
- game.js
- Game
- test_converter.py
- menu.js
- build.mjs
- Stadium
- Menu
- Ball
- audit.py
- strikers_anim.py
- import_into_blender
- test_converter.py
- Economia di Ultimate Team (crediti, pacchetti, mercato)
- retarget_clip
- cupsMenu.js
- FormatError
- economy_sim.py
- os
- AnimViewer
- retarget.py
- main
- Source
- Tracker
- _register_addon
- _mirror_rot

## God Nodes (most connected - your core abstractions)
1. `Game` - 47 edges
2. `Menu` - 38 edges
3. `t()` - 33 edges
4. `boot()` - 22 edges
5. `Player` - 22 edges
6. `import_into_blender()` - 21 edges
7. `installCups()` - 19 edges
8. `UiNav` - 19 edges
9. `test_decode()` - 17 edges
10. `STRIKERS_REFERENCE: misure e dinamiche con fonti` - 17 edges

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

## Communities (27 total, 4 thin omitted)

### Community 0 - "Pose"
Cohesion: 0.13
Nodes (9): contact_time(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat(), rest_offsets(), _unwrap(), write_bvh() (+1 more)

### Community 1 - "game.js"
Cohesion: 0.07
Nodes (52): IA: uno pressa, uno marca, gli altri in posizione, Passo fisso di fisica a 50 Hz, bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v (+44 more)

### Community 2 - "Game"
Cohesion: 0.08
Nodes (4): Portiere: posizione, previsione del tiro, tuffo, rinvio, predict(), Game, Player

### Community 3 - "test_converter.py"
Cohesion: 0.17
Nodes (12): Nomi delle ossa da hash nlStringLowerHash, string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle() (+4 more)

### Community 4 - "menu.js"
Cohesion: 0.12
Nodes (10): Comandi controller Xbox stile EA FC, Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads() (+2 more)

### Community 5 - "build.mjs"
Cohesion: 0.05
Nodes (33): Procedura: aggiungere un personaggio, Dieci personaggi per il 5 contro 5, Ricolorazione della maglia per la seconda squadra, roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere), Ruoli e posti: 0 difensore, 1 centrocampista, 2 ala, 3 attaccante, 4 portiere, Squadra Celestini (5 ruoli, in gioco), Squadra Rivali (5 ruoli, in gioco), dependencies (+25 more)

### Community 6 - "Stadium"
Cohesion: 0.12
Nodes (8): Nomi e colori delle squadre (teamInfo): anelli, punteggio, tabellone, tifosi, Hud, ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, Tabellone e cartelloni dello stadio

### Community 7 - "Menu"
Cohesion: 0.14
Nodes (12): Gioco senza build (moduli e importmap), boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause(), getLang() (+4 more)

### Community 8 - "Ball"
Cohesion: 0.20
Nodes (6): Problema noto: pallone oltre 50 m/s, Tiro perfetto con effetto Magnus, Ball, integrate(), Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi, Effetto Magnus solo sul tiro perfetto (barra ≥ 0,99)

### Community 9 - "audit.py"
Cohesion: 0.26
Nodes (9): angle(), audit(), model_frames(), world(), rot_angle(), sample(), Controllo delle 183 clip (audit + tavole), Controllo di una singola posa (+1 more)

### Community 10 - "strikers_anim.py"
Cohesion: 0.24
Nodes (12): Formati originali .sanim / .shier / .bin, _blender_cli(), clip_states(), _common_args(), dump_json(), load_chunks(), _load_cli(), load_clips() (+4 more)

### Community 11 - "import_into_blender"
Cohesion: 0.20
Nodes (7): Convertitore per Blender, _biped_names(), _blender_add_curve(), _blender_fcurve_bag(), import_into_blender(), NameBook, test_blender()

### Community 12 - "test_converter.py"
Cohesion: 0.17
Nodes (12): strikers_frames(), _mat_to_euler_zxy(), check(), close(), game_world(), mul_rows(), qclose(), quat_rows() (+4 more)

### Community 13 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.05
Nodes (45): Animazioni (area), Personaggi (area), Instradamento per area (CLAUDE.md), Aggiornare grafo e mappa dopo le modifiche, Mappa del progetto (docs/mappa.html), Gioco (area), Avvio del gioco, Bozze (+37 more)

### Community 14 - "retarget_clip"
Cohesion: 0.25
Nodes (7): Metodo di retarget Biped → Mixamo, lowest_offset(), R(), mat_to_quat(), orthonormal(), retarget_clip(), W()

### Community 15 - "cupsMenu.js"
Cohesion: 0.09
Nodes (38): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+30 more)

### Community 16 - "FormatError"
Cohesion: 0.11
Nodes (7): Chunk, Clip, _cstr(), FormatError, Skeleton, top_level_chunks(), _u32()

### Community 18 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 19 - "os"
Cohesion: 0.22
Nodes (6): check_rig(), main(), Scheletro Mixamo richiesto, area_of(), kind_of(), main()

### Community 21 - "retarget.py"
Cohesion: 0.16
Nodes (7): Calibrazione sulla posa idle originale, Root motion nei metadati delle clip, calibrate(), frame_from(), root_motion(), swing(), write_glb()

### Community 22 - "main"
Cohesion: 0.19
Nodes (5): Glb, main(), quat_to_mat(), Rig, shrink_images()

### Community 23 - "Source"
Cohesion: 0.25
Nodes (4): Rifare il pacchetto dal disco (--export), Pacchetto strikers_source.npz (183 clip decodificate), open_source(), Source

### Community 25 - "_register_addon"
Cohesion: 0.50
Nodes (3): register(), _register_addon(), execute()

## Ambiguous Edges - Review These
- `.step()` → `Problema noto: pallone oltre 50 m/s`  [AMBIGUOUS]
  game/README.md · relation: references

## Knowledge Gaps
- **15 isolated node(s):** `IA: uno pressa, uno marca, gli altri in posizione`, `Codice decompilato smstrikers-decomp`, `Da misurare: mesh .glg, telecamera, tiri dei gregari`, `Convertitore per Blender`, `Aggiornare grafo e mappa dopo le modifiche` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 158 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` connect `build.mjs` to `os`, `Economia di Ultimate Team (crediti, pacchetti, mercato)`, `Stadium`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `boot()` (e.g. with `Gioco senza build (moduli e importmap)` and `.tick()`) actually correct?**
  _`boot()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `IA: uno pressa, uno marca, gli altri in posizione`, `Codice decompilato smstrikers-decomp`, `Da misurare: mesh .glg, telecamera, tiri dei gregari` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pose` be split into smaller, more focused modules?**
  _Cohesion score 0.13450292397660818 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `os` to `build.mjs`, `main`?**
  _High betweenness centrality (0.227) - this node is a cross-community bridge._
- **Should `game.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0742447516641065 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `.step()` and `Problema noto: pallone oltre 50 m/s`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._