# Graph Report - calcio-arcade  (2026-10-30)

## Corpus Check
- Corpus is ~37,561 words - fits in a single context window. You may not need a graph.

## Summary
- 443 nodes · 988 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 148 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- IA, costanti e passo fisso
- Partita: azioni, pallone, portiere
- Aree, istruzioni, HUD e mappa
- Roster e squadre
- Hash, nomi ossa e dati di prova
- Prove del convertitore
- Metodo di retarget
- Formati originali e convertitore Blender
- Formati originali e caricamento
- Convertitore per Blender
- Comandi e controller
- Stadio
- Aggiunta dei personaggi
- Fisica del pallone
- Controllo automatico delle clip
- Lettura dei chunk
- Rig Mixamo e scrittura glTF
- Pacchetto delle clip originali
- Lettura dei file GLB
- Add-on di Blender

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

## Communities (21 total, 2 thin omitted)

### Community 0 - "IA, costanti e passo fisso"
Cohesion: 0.08
Nodes (50): IA: uno pressa, uno marca, gli altri in posizione, Passo fisso di fisica a 50 Hz, bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v (+42 more)

### Community 1 - "Partita: azioni, pallone, portiere"
Cohesion: 0.10
Nodes (4): Portiere: posizione, previsione del tiro, tuffo, rinvio, predict(), Game, Player

### Community 2 - "Aree, istruzioni, HUD e mappa"
Cohesion: 0.07
Nodes (30): Animazioni (area), Nomi e colori delle squadre (teamInfo): anelli, punteggio, tabellone, tifosi, Personaggi (area), Instradamento per area (CLAUDE.md), Aggiornare grafo e mappa dopo le modifiche, Mappa del progetto (docs/mappa.html), Gioco senza build (moduli e importmap), Gioco (area) (+22 more)

### Community 3 - "Roster e squadre"
Cohesion: 0.06
Nodes (31): Procedura: aggiungere un personaggio, Dieci personaggi per il 5 contro 5, Ricolorazione della maglia per la seconda squadra, roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere), Ruoli e posti: 0 difensore, 1 centrocampista, 2 ala, 3 attaccante, 4 portiere, Squadra Celestini (5 ruoli, in gioco), Squadra Rivali (5 ruoli, in gioco), dependencies (+23 more)

### Community 4 - "Hash, nomi ossa e dati di prova"
Cohesion: 0.12
Nodes (12): Nomi delle ossa da hash nlStringLowerHash, Clip, string_hash(), string_lower_hash(), sample_props(), sample_scale(), sample_trans(), write_bundle() (+4 more)

### Community 5 - "Prove del convertitore"
Cohesion: 0.15
Nodes (13): strikers_frames(), _mat_to_euler_zxy(), sample_quat(), check(), close(), game_world(), mul_rows(), qclose() (+5 more)

### Community 6 - "Metodo di retarget"
Cohesion: 0.14
Nodes (13): Calibrazione sulla posa idle originale, Metodo di retarget Biped → Mixamo, Root motion nei metadati delle clip, calibrate(), frame_from(), lowest_offset(), R(), mat_to_quat() (+5 more)

### Community 7 - "Formati originali e convertitore Blender"
Cohesion: 0.11
Nodes (11): contact_time(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat(), rest_offsets(), _unwrap() (+3 more)

### Community 8 - "Formati originali e caricamento"
Cohesion: 0.24
Nodes (12): Formati originali .sanim / .shier / .bin, _blender_cli(), clip_states(), _common_args(), dump_json(), load_chunks(), _load_cli(), load_clips() (+4 more)

### Community 9 - "Convertitore per Blender"
Cohesion: 0.20
Nodes (7): Convertitore per Blender, _biped_names(), _blender_add_curve(), _blender_fcurve_bag(), import_into_blender(), NameBook, test_blender()

### Community 10 - "Comandi e controller"
Cohesion: 0.24
Nodes (8): Comandi controller Xbox stile EA FC, Input, PAD, PadMenus, padPressed(), padStick(), readPad(), Navigazione dei menu col controller

### Community 11 - "Stadio"
Cohesion: 0.27
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 12 - "Aggiunta dei personaggi"
Cohesion: 0.22
Nodes (6): check_rig(), main(), Scheletro Mixamo richiesto, area_of(), kind_of(), main()

### Community 13 - "Fisica del pallone"
Cohesion: 0.22
Nodes (6): Problema noto: pallone oltre 50 m/s, Tiro perfetto con effetto Magnus, Ball, integrate(), Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi, Effetto Magnus solo sul tiro perfetto (barra ≥ 0,99)

### Community 14 - "Controllo automatico delle clip"
Cohesion: 0.26
Nodes (9): angle(), audit(), model_frames(), world(), rot_angle(), sample(), Controllo delle 183 clip (audit + tavole), Controllo di una singola posa (+1 more)

### Community 15 - "Lettura dei chunk"
Cohesion: 0.19
Nodes (6): Chunk, _cstr(), FormatError, Skeleton, top_level_chunks(), _u32()

### Community 16 - "Rig Mixamo e scrittura glTF"
Cohesion: 0.21
Nodes (5): main(), quat_to_mat(), Rig, shrink_images(), write_glb()

### Community 17 - "Pacchetto delle clip originali"
Cohesion: 0.25
Nodes (4): Rifare il pacchetto dal disco (--export), Pacchetto strikers_source.npz (183 clip decodificate), open_source(), Source

### Community 19 - "Add-on di Blender"
Cohesion: 0.50
Nodes (3): register(), _register_addon(), execute()

## Ambiguous Edges - Review These
- `.step()` → `Problema noto: pallone oltre 50 m/s`  [AMBIGUOUS]
  game/README.md · relation: references

## Knowledge Gaps
- **15 isolated node(s):** `IA: uno pressa, uno marca, gli altri in posizione`, `Problema noto: pallone oltre 50 m/s`, `Prova automatica CPU contro CPU`, `Gioco in un solo file HTML`, `Animazioni (area)` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 108 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` connect `Roster e squadre` to `Aree, istruzioni, HUD e mappa`, `Aggiunta dei personaggi`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `import_into_blender()` (e.g. with `Convertitore per Blender` and `.harvest_path()`) actually correct?**
  _`import_into_blender()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `IA: uno pressa, uno marca, gli altri in posizione`, `Problema noto: pallone oltre 50 m/s`, `Prova automatica CPU contro CPU` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `IA, costanti e passo fisso` be split into smaller, more focused modules?**
  _Cohesion score 0.07868852459016394 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Aggiunta dei personaggi` to `Rig Mixamo e scrittura glTF`, `Roster e squadre`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `test_decode()` (e.g. with `.name()` and `.local()`) actually correct?**
  _`test_decode()` has 2 INFERRED edges - model-reasoned connections that need verification._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `.step()` and `Problema noto: pallone oltre 50 m/s`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._