# Graph Report - calcio-arcade  (2026-10-29)

## Corpus Check
- Corpus is ~36,723 words - fits in a single context window. You may not need a graph.

## Summary
- 440 nodes · 981 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 144 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Formati originali e convertitore Blender
- Personaggi nuovi e controllo clip
- Partita: azioni, pallone, portiere
- IA, costanti e passo fisso
- Hash, nomi ossa e dati di prova
- Roster e squadre
- HUD, visualizzatore, pagine di sviluppo
- Aree, istruzioni e mappa
- Stadio
- Comandi e controller
- Fisica del pallone
- Clip originali (chiavi)

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
- `HUD in partita` --references--> `Hud`  [INFERRED]
  interfaccia-gioco/README.md → game/src/hud.js
- `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` --shares_data_with--> `main()`  [INFERRED]
  characters/README.md → animation/add_characters.py
- `Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi` --references--> `integrate()`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/ball.js
- `ShootAtFast: velocità di passaggio in forma chiusa` --references--> `shootAtFast()`  [INFERRED]
  reference/STRIKERS_REFERENCE.md → game/src/ball.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pipeline animazioni: disco → pacchetto → retarget → controllo** — animation_strikers_anim_load_clips, animation_retarget_source_from_disc, animation_retarget_retarget_clip, animation_audit_audit [INFERRED 0.85]
- **Da modello .glb a personaggio in campo** — characters_readme_aggiungere_personaggio, animation_add_characters_main, animation_retarget_main, characters_readme_roster_json, game_tools_build, game_src_main_loadassets, game_src_player_player [INFERRED 0.85]

## Communities (13 total, 2 thin omitted)

### Community 0 - "Formati originali e convertitore Blender"
Cohesion: 0.06
Nodes (40): Convertitore per Blender, Formati originali .sanim / .shier / .bin, contact_time(), _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk (+32 more)

### Community 1 - "Personaggi nuovi e controllo clip"
Cohesion: 0.05
Nodes (33): check_rig(), main(), angle(), audit(), model_frames(), world(), rot_angle(), sample() (+25 more)

### Community 2 - "Partita: azioni, pallone, portiere"
Cohesion: 0.08
Nodes (12): Root motion nei metadati delle clip, root_motion(), Portiere: posizione, previsione del tiro, tuffo, rinvio, Tiro perfetto con effetto Magnus, integrate(), predict(), shootAtFast(), Game (+4 more)

### Community 3 - "IA, costanti e passo fisso"
Cohesion: 0.08
Nodes (46): IA: uno pressa, uno marca, gli altri in posizione, Passo fisso di fisica a 50 Hz, bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v (+38 more)

### Community 4 - "Hash, nomi ossa e dati di prova"
Cohesion: 0.09
Nodes (23): Nomi delle ossa da hash nlStringLowerHash, strikers_frames(), _mat_to_euler_zxy(), string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale() (+15 more)

### Community 5 - "Roster e squadre"
Cohesion: 0.06
Nodes (31): Procedura: aggiungere un personaggio, Dieci personaggi per il 5 contro 5, Ricolorazione della maglia per la seconda squadra, roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere), Ruoli e posti: 0 difensore, 1 centrocampista, 2 ala, 3 attaccante, 4 portiere, Squadra Celestini (5 ruoli, in gioco), Squadra Rivali (modelli da caricare; provvisorio: portiere in rosso), dependencies (+23 more)

### Community 6 - "HUD, visualizzatore, pagine di sviluppo"
Cohesion: 0.14
Nodes (13): Gioco senza build (moduli e importmap), Hud, AnimViewer, boot(), openViewer(), restartFromPause(), showMenu(), startMatch() (+5 more)

### Community 7 - "Aree, istruzioni e mappa"
Cohesion: 0.12
Nodes (18): Animazioni (area), Personaggi (area), Instradamento per area (CLAUDE.md), Aggiornare grafo e mappa dopo le modifiche, Mappa del progetto (docs/mappa.html), area_of(), kind_of(), main() (+10 more)

### Community 8 - "Stadio"
Cohesion: 0.25
Nodes (6): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, Tabellone e cartelloni dello stadio

### Community 9 - "Comandi e controller"
Cohesion: 0.24
Nodes (8): Comandi controller Xbox stile EA FC, Input, PAD, PadMenus, padPressed(), padStick(), readPad(), Navigazione dei menu col controller

### Community 10 - "Fisica del pallone"
Cohesion: 0.27
Nodes (3): Problema noto: pallone oltre 50 m/s, Ball, Fisica del pallone: gravità −14, attrito aria 0,1, rimbalzi

## Ambiguous Edges - Review These
- `.step()` → `Problema noto: pallone oltre 50 m/s`  [AMBIGUOUS]
  game/README.md · relation: references

## Knowledge Gaps
- **15 isolated node(s):** `IA: uno pressa, uno marca, gli altri in posizione`, `Problema noto: pallone oltre 50 m/s`, `Prova automatica CPU contro CPU`, `Gioco in un solo file HTML`, `Animazioni (area)` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 109 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Clip a sinistra = clip a destra specchiate` connect `Formati originali e convertitore Blender` to `Partita: azioni, pallone, portiere`, `IA, costanti e passo fisso`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `import_into_blender()` (e.g. with `Convertitore per Blender` and `.harvest_path()`) actually correct?**
  _`import_into_blender()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `IA: uno pressa, uno marca, gli altri in posizione`, `Problema noto: pallone oltre 50 m/s`, `Prova automatica CPU contro CPU` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Formati originali e convertitore Blender` be split into smaller, more focused modules?**
  _Cohesion score 0.056576576576576575 - nodes in this community are weakly interconnected._
- **Why does `roster.json: personaggi e formazioni (posti 0–3 giocatori, 4 portiere)` connect `Roster e squadre` to `Personaggi nuovi e controllo clip`, `Aree, istruzioni e mappa`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `test_decode()` (e.g. with `.name()` and `.local()`) actually correct?**
  _`test_decode()` has 2 INFERRED edges - model-reasoned connections that need verification._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `.step()` and `Problema noto: pallone oltre 50 m/s`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._