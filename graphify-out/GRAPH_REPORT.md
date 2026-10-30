# Graph Report - calcio-arcade  (2026-10-30)

## Corpus Check
- Corpus is ~37,946 words - fits in a single context window. You may not need a graph.

## Summary
- 445 nodes · 991 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 149 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Formati originali e convertitore Blender
- IA, costanti e passo fisso
- Partita: azioni, pallone, portiere
- Hash, matrici e prove del convertitore
- Aree, istruzioni, HUD e mappa
- Roster e squadre
- Stadio
- Comandi e controller
- Fisica del pallone
- Aggiunta dei personaggi
- Controllo automatico delle clip
- Metodo di retarget
- Dipendenze del gioco
- Calcolo del retarget
- Rig Mixamo e scrittura glTF
- Rig Mixamo
- Pacchetto delle clip originali

## God Nodes (most connected - your core abstractions)
1. `Game` - 35 edges
2. `Player` - 22 edges
3. `import_into_blender()` - 21 edges
4. `test_decode()` - 17 edges
5. `STRIKERS_REFERENCE: misure e dinamiche con fonti` - 16 edges
6. `NameBook` - 15 edges
7. `Pose` - 15 edges
8. `boot()` - 14 edges
9. `Stadium` - 13 edges
10. `main()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Tavole: personaggio accanto allo scheletro originale` --semantically_similar_to--> `audit()`  [INFERRED] [semantically similar]
  game/dev/sheet.html → animation/audit.py
- `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` --shares_data_with--> `main()`  [INFERRED]
  characters/README.md → animation/add_characters.py
- `ShootAtFast: velocità di passaggio in forma chiusa` --references--> `shootAtFast()`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/ball.js
- `Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi` --references--> `BALL`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/config.js
- `Parametri del portiere (goalie.ini)` --references--> `GOALIE`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/config.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pipeline animazioni: disco → pacchetto → retarget → controllo** — animation_strikers_anim_load_clips, animation_retarget_source_from_disc, animation_retarget_retarget_clip, animation_audit_audit [INFERRED 0.85]
- **Da modello .glb a personaggio in campo** — characters_readme_aggiungere_personaggio, animation_add_characters_main, animation_retarget_main, characters_readme_roster_json, game_tools_build, game_src_main_loadassets, game_src_player_player [INFERRED 0.85]

## Communities (18 total, 1 thin omitted)

### Community 0 - "Formati originali e convertitore Blender"
Cohesion: 0.05
Nodes (38): Convertitore per Blender, Formati originali .sanim / .shier / .bin, contact_time(), _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk (+30 more)

### Community 1 - "IA, costanti e passo fisso"
Cohesion: 0.08
Nodes (47): IA: uno pressa, uno marca, gli altri in posizione, Passo fisso di fisica a 50 Hz, dist2(), fielderAI(), moveTo(), openness(), v, shootAtFast() (+39 more)

### Community 2 - "Partita: azioni, pallone, portiere"
Cohesion: 0.10
Nodes (7): Portiere: posizione, previsione del tiro, tuffo, rinvio, bestPassTarget(), predict(), Game, angleDiff(), Player, seekDirection()

### Community 3 - "Hash, matrici e prove del convertitore"
Cohesion: 0.09
Nodes (25): Nomi delle ossa da hash nlStringLowerHash, _mat_to_euler_zxy(), _quat_norm(), _quat_to_mat(), string_hash(), string_lower_hash(), sample_props(), sample_quat() (+17 more)

### Community 4 - "Aree, istruzioni, HUD e mappa"
Cohesion: 0.08
Nodes (28): Animazioni (area), Personaggi (area), Instradamento per area (CLAUDE.md), Aggiornare grafo e mappa dopo le modifiche, Mappa del progetto (docs/mappa.html), Gioco senza build (moduli e importmap), Gioco (area), Hud (+20 more)

### Community 5 - "Roster e squadre"
Cohesion: 0.07
Nodes (22): Procedura: aggiungere un personaggio, Nomi e colori delle squadre (teamInfo): anelli, punteggio, tabellone, tifosi, Dieci personaggi per il 5 contro 5, Ricolorazione della maglia per la seconda squadra, roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere), Ruoli e posti: 0 difensore, 1 centrocampista, 2 ala, 3 attaccante, 4 portiere, Squadra Celestini (5 ruoli, in gioco), Squadra Rivali (5 ruoli, in gioco) (+14 more)

### Community 6 - "Stadio"
Cohesion: 0.25
Nodes (6): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, Tabellone e cartelloni dello stadio

### Community 7 - "Comandi e controller"
Cohesion: 0.24
Nodes (8): Comandi controller Xbox stile EA FC, Input, PAD, PadMenus, padPressed(), padStick(), readPad(), Navigazione dei menu col controller

### Community 8 - "Fisica del pallone"
Cohesion: 0.20
Nodes (6): Problema noto: pallone oltre 50 m/s, Tiro perfetto con effetto Magnus, Ball, integrate(), Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi, Effetto Magnus solo sul tiro perfetto (barra ≥ 0,99)

### Community 9 - "Aggiunta dei personaggi"
Cohesion: 0.22
Nodes (6): check_rig(), main(), Scheletro Mixamo richiesto, area_of(), kind_of(), main()

### Community 10 - "Controllo automatico delle clip"
Cohesion: 0.24
Nodes (9): angle(), audit(), model_frames(), rot_angle(), sample(), Controllo delle 183 clip (audit + tavole), open_source(), Controllo di una singola posa (+1 more)

### Community 11 - "Metodo di retarget"
Cohesion: 0.20
Nodes (7): Calibrazione sulla posa idle originale, Root motion nei metadati delle clip, calibrate(), frame_from(), root_motion(), strikers_frames(), swing()

### Community 12 - "Dipendenze del gioco"
Cohesion: 0.18
Nodes (11): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+3 more)

### Community 13 - "Calcolo del retarget"
Cohesion: 0.25
Nodes (7): Metodo di retarget Biped → Mixamo, lowest_offset(), R(), mat_to_quat(), orthonormal(), retarget_clip(), W()

### Community 14 - "Rig Mixamo e scrittura glTF"
Cohesion: 0.18
Nodes (4): Glb, main(), shrink_images(), write_glb()

### Community 15 - "Rig Mixamo"
Cohesion: 0.38
Nodes (3): world(), quat_to_mat(), Rig

### Community 16 - "Pacchetto delle clip originali"
Cohesion: 0.33
Nodes (3): Rifare il pacchetto dal disco (--export), Pacchetto strikers_source.npz (183 clip decodificate), Source

## Ambiguous Edges - Review These
- `.step()` → `Problema noto: pallone oltre 50 m/s`  [AMBIGUOUS]
  game/README.md · relation: references

## Knowledge Gaps
- **15 isolated node(s):** `IA: uno pressa, uno marca, gli altri in posizione`, `Problema noto: pallone oltre 50 m/s`, `Prova automatica CPU contro CPU`, `Gioco in un solo file HTML`, `Animazioni (area)` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 109 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `Aggiunta dei personaggi` to `Roster e squadre`, `Rig Mixamo e scrittura glTF`?**
  _High betweenness centrality (0.207) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `import_into_blender()` (e.g. with `Convertitore per Blender` and `.harvest_path()`) actually correct?**
  _`import_into_blender()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `IA: uno pressa, uno marca, gli altri in posizione`, `Problema noto: pallone oltre 50 m/s`, `Prova automatica CPU contro CPU` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Formati originali e convertitore Blender` be split into smaller, more focused modules?**
  _Cohesion score 0.0519311911716975 - nodes in this community are weakly interconnected._
- **Why does `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` connect `Roster e squadre` to `Aggiunta dei personaggi`, `Aree, istruzioni, HUD e mappa`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `test_decode()` (e.g. with `.name()` and `.local()`) actually correct?**
  _`test_decode()` has 2 INFERRED edges - model-reasoned connections that need verification._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `.step()` and `Problema noto: pallone oltre 50 m/s`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._