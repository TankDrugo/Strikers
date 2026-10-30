# Graph Report - Strikers  (2026-10-30)

## Corpus Check
- 37 files · ~49,553 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 488 nodes · 1045 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 149 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f11d6395`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- strikers_anim.py
- game.js
- Game
- test_converter.py
- boot
- build.mjs
- Stadium
- Input
- Ball
- retarget.py
- audit.py
- retarget_clip
- test_converter.py
- Ultimate Team (area, da iniziare)
- main
- Interfaccia gioco: decisioni prese con l'utente
- Source
- economy_sim.py
- Clip
- calibrate

## God Nodes (most connected - your core abstractions)
1. `Game` - 35 edges
2. `Player` - 22 edges
3. `import_into_blender()` - 21 edges
4. `test_decode()` - 17 edges
5. `STRIKERS_REFERENCE: misure e dinamiche con fonti` - 17 edges
6. `NameBook` - 15 edges
7. `Pose` - 15 edges
8. `boot()` - 14 edges
9. `Stadium` - 13 edges
10. `main()` - 12 edges

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

### Community 0 - "strikers_anim.py"
Cohesion: 0.05
Nodes (43): Convertitore per Blender, Formati originali .sanim / .shier / .bin, contact_time(), _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk (+35 more)

### Community 1 - "game.js"
Cohesion: 0.08
Nodes (50): IA: uno pressa, uno marca, gli altri in posizione, Passo fisso di fisica a 50 Hz, bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v (+42 more)

### Community 2 - "Game"
Cohesion: 0.10
Nodes (4): Portiere: posizione, previsione del tiro, tuffo, rinvio, predict(), Game, Player

### Community 3 - "test_converter.py"
Cohesion: 0.16
Nodes (15): Nomi delle ossa da hash nlStringLowerHash, string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle() (+7 more)

### Community 4 - "boot"
Cohesion: 0.12
Nodes (16): Ricolorazione della maglia per la seconda squadra, Gioco senza build (moduli e importmap), Hud, AnimViewer, boot(), openViewer(), restartFromPause(), showMenu() (+8 more)

### Community 5 - "build.mjs"
Cohesion: 0.06
Nodes (30): Procedura: aggiungere un personaggio, Nomi e colori delle squadre (teamInfo): anelli, punteggio, tabellone, tifosi, Dieci personaggi per il 5 contro 5, roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere), Ruoli e posti: 0 difensore, 1 centrocampista, 2 ala, 3 attaccante, 4 portiere, Squadra Celestini (5 ruoli, in gioco), Squadra Rivali (5 ruoli, in gioco), dependencies (+22 more)

### Community 6 - "Stadium"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 7 - "Input"
Cohesion: 0.24
Nodes (8): Comandi controller Xbox stile EA FC, Input, PAD, PadMenus, padPressed(), padStick(), readPad(), Navigazione dei menu col controller

### Community 8 - "Ball"
Cohesion: 0.20
Nodes (6): Problema noto: pallone oltre 50 m/s, Tiro perfetto con effetto Magnus, Ball, integrate(), Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi, Effetto Magnus solo sul tiro perfetto (barra ≥ 0,99)

### Community 9 - "retarget.py"
Cohesion: 0.18
Nodes (8): check_rig(), main(), angle(), rot_angle(), sample(), Root motion nei metadati delle clip, root_motion(), Scheletro Mixamo richiesto

### Community 10 - "audit.py"
Cohesion: 0.20
Nodes (7): audit(), model_frames(), world(), Controllo delle 183 clip (audit + tavole), Glb, Controllo di una singola posa, Tavole: personaggio accanto allo scheletro originale

### Community 11 - "retarget_clip"
Cohesion: 0.25
Nodes (7): Metodo di retarget Biped → Mixamo, lowest_offset(), R(), mat_to_quat(), orthonormal(), retarget_clip(), W()

### Community 12 - "test_converter.py"
Cohesion: 0.24
Nodes (5): strikers_frames(), game_world(), mul_rows(), quat_rows(), to4()

### Community 13 - "Ultimate Team (area, da iniziare)"
Cohesion: 0.06
Nodes (33): Animazioni (area), Personaggi (area), Instradamento per area (CLAUDE.md), Aggiornare grafo e mappa dopo le modifiche, Mappa del progetto (docs/mappa.html), area_of(), kind_of(), main() (+25 more)

### Community 14 - "main"
Cohesion: 0.21
Nodes (5): main(), quat_to_mat(), Rig, shrink_images(), write_glb()

### Community 15 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.13
Nodes (15): Avvio del gioco, Bozze, Coppe, Gioco rapido, Home, Interfaccia gioco: decisioni prese con l'utente, Lingue, Navigazione (stile FC) (+7 more)

### Community 16 - "Source"
Cohesion: 0.25
Nodes (4): Rifare il pacchetto dal disco (--export), Pacchetto strikers_source.npz (183 clip decodificate), open_source(), Source

### Community 18 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 20 - "calibrate"
Cohesion: 0.33
Nodes (4): Calibrazione sulla posa idle originale, calibrate(), frame_from(), swing()

## Ambiguous Edges - Review These
- `.step()` → `Problema noto: pallone oltre 50 m/s`  [AMBIGUOUS]
  game/README.md · relation: references

## Knowledge Gaps
- **15 isolated node(s):** `Convertitore per Blender`, `IA: uno pressa, uno marca, gli altri in posizione`, `Codice decompilato smstrikers-decomp`, `Da misurare: mesh .glg, telecamera, tiri dei gregari`, `Controllo di una singola posa` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 137 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` connect `build.mjs` to `retarget.py`, `boot`, `Ultimate Team (area, da iniziare)`?**
  _High betweenness centrality (0.232) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `import_into_blender()` (e.g. with `Convertitore per Blender` and `.harvest_path()`) actually correct?**
  _`import_into_blender()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Convertitore per Blender`, `IA: uno pressa, uno marca, gli altri in posizione`, `Codice decompilato smstrikers-decomp` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `strikers_anim.py` be split into smaller, more focused modules?**
  _Cohesion score 0.054203180785459264 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `retarget.py` to `build.mjs`, `main`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `test_decode()` (e.g. with `.name()` and `.local()`) actually correct?**
  _`test_decode()` has 2 INFERRED edges - model-reasoned connections that need verification._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `.step()` and `Problema noto: pallone oltre 50 m/s`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._