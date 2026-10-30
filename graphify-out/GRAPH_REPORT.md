# Graph Report - Strikers  (2026-10-30)

## Corpus Check
- 42 files · ~57,081 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 579 nodes · 1326 edges · 21 communities (18 shown, 3 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26a7f4f9`
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
- retarget.py
- strikers_anim.py
- import_into_blender
- test_converter.py
- Economia di Ultimate Team (crediti, pacchetti, mercato)
- main
- Interfaccia gioco: decisioni prese con l'utente
- FormatError
- economy_sim.py
- Clip
- AnimViewer

## God Nodes (most connected - your core abstractions)
1. `Game` - 45 edges
2. `Menu` - 38 edges
3. `t()` - 26 edges
4. `Player` - 22 edges
5. `import_into_blender()` - 21 edges
6. `boot()` - 21 edges
7. `UiNav` - 19 edges
8. `test_decode()` - 17 edges
9. `STRIKERS_REFERENCE: misure e dinamiche con fonti` - 17 edges
10. `NameBook` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Tavole: personaggio accanto allo scheletro originale` --semantically_similar_to--> `audit()`  [INFERRED] [semantically similar]
  game/dev/sheet.html → animation/audit.py
- `HUD in partita` --references--> `Hud`  [INFERRED]
  interfaccia-gioco/README.md → game/src/hud.js
- `ShootAtFast: velocità di passaggio in forma chiusa` --references--> `shootAtFast()`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/ball.js
- `Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi` --references--> `BALL`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/config.js
- `Parametri del portiere (goalie.ini)` --references--> `GOALIE`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/config.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Da modello .glb a personaggio in campo** — characters_readme_aggiungere_personaggio, animation_add_characters_main, animation_retarget_main, characters_readme_roster_json, game_tools_build, game_src_main_loadassets, game_src_player_player [INFERRED 0.85]
- **Pipeline animazioni: disco → pacchetto → retarget → controllo** — animation_strikers_anim_load_clips, animation_retarget_source_from_disc, animation_retarget_retarget_clip, animation_audit_audit [INFERRED 0.85]

## Communities (21 total, 3 thin omitted)

### Community 0 - "Pose"
Cohesion: 0.10
Nodes (12): contact_time(), _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat(), rest_offsets() (+4 more)

### Community 1 - "game.js"
Cohesion: 0.08
Nodes (51): IA: uno pressa, uno marca, gli altri in posizione, Passo fisso di fisica a 50 Hz, bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v (+43 more)

### Community 2 - "Game"
Cohesion: 0.08
Nodes (4): Portiere: posizione, previsione del tiro, tuffo, rinvio, predict(), Game, Player

### Community 3 - "test_converter.py"
Cohesion: 0.17
Nodes (13): Nomi delle ossa da hash nlStringLowerHash, string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle() (+5 more)

### Community 4 - "menu.js"
Cohesion: 0.07
Nodes (24): Comandi controller Xbox stile EA FC, Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads() (+16 more)

### Community 5 - "build.mjs"
Cohesion: 0.05
Nodes (37): check_rig(), main(), Glb, Procedura: aggiungere un personaggio, Dieci personaggi per il 5 contro 5, Ricolorazione della maglia per la seconda squadra, roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere), Ruoli e posti: 0 difensore, 1 centrocampista, 2 ala, 3 attaccante, 4 portiere (+29 more)

### Community 6 - "Stadium"
Cohesion: 0.12
Nodes (8): Nomi e colori delle squadre (teamInfo): anelli, punteggio, tabellone, tifosi, Hud, ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, Tabellone e cartelloni dello stadio

### Community 7 - "Menu"
Cohesion: 0.13
Nodes (13): Gioco senza build (moduli e importmap), boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause(), makeAudio() (+5 more)

### Community 8 - "Ball"
Cohesion: 0.20
Nodes (6): Problema noto: pallone oltre 50 m/s, Tiro perfetto con effetto Magnus, Ball, integrate(), Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi, Effetto Magnus solo sul tiro perfetto (barra ≥ 0,99)

### Community 9 - "retarget.py"
Cohesion: 0.17
Nodes (10): angle(), audit(), rot_angle(), sample(), Controllo delle 183 clip (audit + tavole), Root motion nei metadati delle clip, open_source(), root_motion() (+2 more)

### Community 10 - "strikers_anim.py"
Cohesion: 0.16
Nodes (11): _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), clip_states(), _common_args(), dump_json(), main() (+3 more)

### Community 11 - "import_into_blender"
Cohesion: 0.26
Nodes (10): Convertitore per Blender, Formati originali .sanim / .shier / .bin, import_into_blender(), load_chunks(), _load_cli(), load_clips(), load_retargets(), load_skeletons() (+2 more)

### Community 12 - "test_converter.py"
Cohesion: 0.17
Nodes (10): strikers_frames(), check(), close(), game_world(), mul_rows(), qclose(), quat_rows(), test_bvh_import() (+2 more)

### Community 13 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.06
Nodes (33): Animazioni (area), Personaggi (area), Instradamento per area (CLAUDE.md), Aggiornare grafo e mappa dopo le modifiche, Mappa del progetto (docs/mappa.html), area_of(), kind_of(), main() (+25 more)

### Community 14 - "main"
Cohesion: 0.06
Nodes (21): model_frames(), world(), Calibrazione sulla posa idle originale, Metodo di retarget Biped → Mixamo, Rifare il pacchetto dal disco (--export), Pacchetto strikers_source.npz (183 clip decodificate), calibrate(), frame_from() (+13 more)

### Community 15 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.13
Nodes (15): Avvio del gioco, Bozze, Coppe, Gioco rapido, Home, Interfaccia gioco: decisioni prese con l'utente, Le 4 coppe, Lingue (+7 more)

### Community 16 - "FormatError"
Cohesion: 0.16
Nodes (7): Chunk, _cstr(), FormatError, Retargets, Skeleton, top_level_chunks(), _u32()

### Community 18 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

## Ambiguous Edges - Review These
- `.step()` → `Problema noto: pallone oltre 50 m/s`  [AMBIGUOUS]
  game/README.md · relation: references

## Knowledge Gaps
- **15 isolated node(s):** `Convertitore per Blender`, `IA: uno pressa, uno marca, gli altri in posizione`, `Codice decompilato smstrikers-decomp`, `Da misurare: mesh .glg, telecamera, tiri dei gregari`, `Controllo di una singola posa` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 150 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` connect `build.mjs` to `Economia di Ultimate Team (crediti, pacchetti, mercato)`, `Stadium`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `import_into_blender()` (e.g. with `Convertitore per Blender` and `.harvest_path()`) actually correct?**
  _`import_into_blender()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Convertitore per Blender`, `IA: uno pressa, uno marca, gli altri in posizione`, `Codice decompilato smstrikers-decomp` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pose` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `build.mjs` to `retarget.py`, `test_converter.py`, `main`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **Should `game.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07615018508725542 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `.step()` and `Problema noto: pallone oltre 50 m/s`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._