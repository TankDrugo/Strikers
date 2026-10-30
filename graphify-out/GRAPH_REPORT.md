# Graph Report - calcio-arcade  (2026-10-30)

## Corpus Check
- Corpus is ~37,292 words - fits in a single context window. You may not need a graph.

## Summary
- 441 nodes · 983 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 146 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Formati originali e convertitore Blender
- IA, costanti e passo fisso
- Partita: azioni, pallone, portiere
- Aree, istruzioni, HUD e mappa
- Hash, nomi ossa e dati di prova
- Roster e squadre
- Metodo di retarget
- Stadio
- Comandi e controller
- Aggiunta dei personaggi
- Fisica del pallone
- Controllo automatico delle clip
- Rig Mixamo e scrittura glTF
- Pacchetto delle clip originali
- Clip originali (chiavi)
- Lettura dei file GLB

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
- `ShootAtFast: velocità di passaggio in forma chiusa` --references--> `shootAtFast()`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/ball.js
- `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` --shares_data_with--> `main()`  [INFERRED]
  characters/README.md → animation/add_characters.py
- `Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi` --references--> `BALL`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/config.js
- `Parametri del portiere (goalie.ini)` --references--> `GOALIE`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/config.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pipeline animazioni: disco → pacchetto → retarget → controllo** — animation_strikers_anim_load_clips, animation_retarget_source_from_disc, animation_retarget_retarget_clip, animation_audit_audit [INFERRED 0.85]
- **Da modello .glb a personaggio in campo** — characters_readme_aggiungere_personaggio, animation_add_characters_main, animation_retarget_main, characters_readme_roster_json, game_tools_build, game_src_main_loadassets, game_src_player_player [INFERRED 0.85]

## Communities (17 total, 3 thin omitted)

### Community 0 - "Formati originali e convertitore Blender"
Cohesion: 0.06
Nodes (40): Convertitore per Blender, Formati originali .sanim / .shier / .bin, contact_time(), _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk (+32 more)

### Community 1 - "IA, costanti e passo fisso"
Cohesion: 0.08
Nodes (48): IA: uno pressa, uno marca, gli altri in posizione, Passo fisso di fisica a 50 Hz, bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v (+40 more)

### Community 2 - "Partita: azioni, pallone, portiere"
Cohesion: 0.09
Nodes (5): Portiere: posizione, previsione del tiro, tuffo, rinvio, predict(), shootAtFast(), Game, Player

### Community 3 - "Aree, istruzioni, HUD e mappa"
Cohesion: 0.07
Nodes (29): Animazioni (area), Colori di squadra su anelli e punteggio (da fare), Personaggi (area), Instradamento per area (CLAUDE.md), Aggiornare grafo e mappa dopo le modifiche, Mappa del progetto (docs/mappa.html), Gioco senza build (moduli e importmap), Gioco (area) (+21 more)

### Community 4 - "Hash, nomi ossa e dati di prova"
Cohesion: 0.10
Nodes (23): Nomi delle ossa da hash nlStringLowerHash, strikers_frames(), _mat_to_euler_zxy(), string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale() (+15 more)

### Community 5 - "Roster e squadre"
Cohesion: 0.06
Nodes (31): Procedura: aggiungere un personaggio, Dieci personaggi per il 5 contro 5, Ricolorazione della maglia per la seconda squadra, roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere), Ruoli e posti: 0 difensore, 1 centrocampista, 2 ala, 3 attaccante, 4 portiere, Squadra Celestini (5 ruoli, in gioco), Squadra Rivali (5 ruoli, in gioco), dependencies (+23 more)

### Community 6 - "Metodo di retarget"
Cohesion: 0.14
Nodes (13): Calibrazione sulla posa idle originale, Metodo di retarget Biped → Mixamo, Root motion nei metadati delle clip, calibrate(), frame_from(), lowest_offset(), R(), mat_to_quat() (+5 more)

### Community 7 - "Stadio"
Cohesion: 0.25
Nodes (6): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, Tabellone e cartelloni dello stadio

### Community 8 - "Comandi e controller"
Cohesion: 0.24
Nodes (8): Comandi controller Xbox stile EA FC, Input, PAD, PadMenus, padPressed(), padStick(), readPad(), Navigazione dei menu col controller

### Community 9 - "Aggiunta dei personaggi"
Cohesion: 0.22
Nodes (6): check_rig(), main(), Scheletro Mixamo richiesto, area_of(), kind_of(), main()

### Community 10 - "Fisica del pallone"
Cohesion: 0.22
Nodes (6): Problema noto: pallone oltre 50 m/s, Tiro perfetto con effetto Magnus, Ball, integrate(), Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi, Effetto Magnus solo sul tiro perfetto (barra ≥ 0,99)

### Community 11 - "Controllo automatico delle clip"
Cohesion: 0.26
Nodes (9): angle(), audit(), model_frames(), world(), rot_angle(), sample(), Controllo delle 183 clip (audit + tavole), Controllo di una singola posa (+1 more)

### Community 12 - "Rig Mixamo e scrittura glTF"
Cohesion: 0.21
Nodes (5): main(), quat_to_mat(), Rig, shrink_images(), write_glb()

### Community 13 - "Pacchetto delle clip originali"
Cohesion: 0.25
Nodes (4): Rifare il pacchetto dal disco (--export), Pacchetto strikers_source.npz (183 clip decodificate), open_source(), Source

## Ambiguous Edges - Review These
- `.step()` → `Problema noto: pallone oltre 50 m/s`  [AMBIGUOUS]
  game/README.md · relation: references

## Knowledge Gaps
- **15 isolated node(s):** `IA: uno pressa, uno marca, gli altri in posizione`, `Problema noto: pallone oltre 50 m/s`, `Prova automatica CPU contro CPU`, `Gioco in un solo file HTML`, `Animazioni (area)` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 108 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Clip a sinistra = clip a destra specchiate` connect `Formati originali e convertitore Blender` to `IA, costanti e passo fisso`, `Partita: azioni, pallone, portiere`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `import_into_blender()` (e.g. with `Convertitore per Blender` and `.harvest_path()`) actually correct?**
  _`import_into_blender()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `IA: uno pressa, uno marca, gli altri in posizione`, `Problema noto: pallone oltre 50 m/s`, `Prova automatica CPU contro CPU` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Formati originali e convertitore Blender` be split into smaller, more focused modules?**
  _Cohesion score 0.056576576576576575 - nodes in this community are weakly interconnected._
- **Why does `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` connect `Roster e squadre` to `Aggiunta dei personaggi`, `Aree, istruzioni, HUD e mappa`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `test_decode()` (e.g. with `.name()` and `.local()`) actually correct?**
  _`test_decode()` has 2 INFERRED edges - model-reasoned connections that need verification._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `.step()` and `Problema noto: pallone oltre 50 m/s`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._