# Graph Report - Strikers  (2026-10-30)

## Corpus Check
- 45 files · ~64,547 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 741 nodes · 1658 edges · 41 communities (34 shown, 7 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 189 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `12806af1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Partita: Game e azioni
- IA e fisica del pallone
- HUD in partita
- Personaggi: aggiunta e controllo clip
- Coppe: logica e menu
- strikers_anim.py
- Ball
- Dipendenze del gioco
- Hash dei nomi e campione di prova
- Stadio
- Economia: mercato e simulatore
- Gioco: README e moduli
- Ultimate Team: sezioni e carte
- Test del convertitore
- Regole del progetto (CLAUDE.md)
- Riferimento e differenze volute
- Animazioni: README
- Pose e contatto col pallone
- render
- Bozze: carte e pacchetti
- Personaggi e squadre
- Nomi delle ossa
- Interfaccia: piano e schermate
- UiNav
- make_map.py
- Economia: documento
- Clip e chiavi
- Visualizzatore animazioni
- Ultimate Team: rosa e ingresso
- Strumenti di verifica pose
- interfaccia-gioco/DESIGN.md
- Voto della coppa D-C-B-A-S-Z (percentuale di completamento)
- Obiettivi: Tracker
- Ultimate Team: decisioni
- Coppe come citazioni ironiche a giochi PS2
- FormatError
- Coppe
- Modulo unico di salvataggio (save)
- Cose mancanti
- Golden goal

## God Nodes (most connected - your core abstractions)
1. `Game` - 47 edges
2. `Menu` - 38 edges
3. `t()` - 33 edges
4. `Game README` - 26 edges
5. `Super Mario Strikers reference measurements` - 24 edges
6. `Player` - 22 edges
7. `boot()` - 21 edges
8. `import_into_blender()` - 20 edges
9. `installCups()` - 19 edges
10. `UiNav` - 19 edges

## Surprising Connections (you probably didn't know these)
- `pad()` --semantically_similar_to--> `PadMenus`  [INFERRED] [semantically similar]
  interfaccia-gioco/bozze/bozze-menu.html → game/src/input.js
- `card()` --semantically_similar_to--> `cardHtml()`  [INFERRED] [semantically similar]
  interfaccia-gioco/bozze/bozze-menu.html → game/src/ui/theme.js
- `MAIN` --semantically_similar_to--> `MAIN`  [INFERRED] [semantically similar]
  interfaccia-gioco/bozze/bozze-menu.html → game/src/ui/menu.js
- `SUB` --semantically_similar_to--> `SUB`  [INFERRED] [semantically similar]
  interfaccia-gioco/bozze/bozze-menu.html → game/src/ui/menu.js
- `sfx` --semantically_similar_to--> `makeBlips()`  [INFERRED] [semantically similar]
  interfaccia-gioco/bozze/bozze-menu.html → game/src/ui/menu.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Add-character pipeline (glb to roster to build to playtest)** — characters_readme_add_character_procedure, animation_readme_add_characters, animation_readme_retarget, characters_readme_roster_json, game_readme_build_mjs, game_readme_playtest_cjs [EXTRACTED 1.00]
- **Animazione di apertura dei pacchetti nelle bozze** — interfaccia_gioco_bozze_bozze_menu_run, interfaccia_gioco_bozze_bozze_menu_walkout, interfaccia_gioco_bozze_bozze_menu_clue, interfaccia_gioco_bozze_bozze_menu_showcard, interfaccia_gioco_bozze_bozze_menu_sleeve, interfaccia_gioco_bozze_bozze_menu_confetti [EXTRACTED 1.00]
- **Post-change workflow (build, playtest, web publish, graph update)** — claude_post_change_checks, game_readme_build_mjs, game_readme_playtest_cjs, game_readme_web_build, docs_grafo_update_workflow [EXTRACTED 1.00]
- **Scala delle rarita delle carte** — ultimate_team_design_rarita_base, ultimate_team_design_holo, ultimate_team_design_numerata, ultimate_team_design_uno_su_uno_oro [EXTRACTED 1.00]
- **Sezioni di Ultimate Team (Club, Rosa, Mercato, Divisioni, Album)** — ultimate_team_design_club, ultimate_team_design_rosa, ultimate_team_design_mercato, ultimate_team_design_divisioni, ultimate_team_design_album [EXTRACTED 1.00]
- **Animation verification tools** — animation_readme_audit, game_dev_sheet, game_dev_sheet_sticks_json, game_dev_posecheck, animation_readme_audit_results [INFERRED 0.85]

## Communities (41 total, 7 thin omitted)

### Community 0 - "Partita: Game e azioni"
Cohesion: 0.08
Nodes (6): predict(), Game, angleDiff(), Player, seekDirection(), seekSpeed()

### Community 1 - "IA e fisica del pallone"
Cohesion: 0.10
Nodes (38): bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v, shootAtFast(), tmp (+30 more)

### Community 2 - "HUD in partita"
Cohesion: 0.11
Nodes (11): Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause(), getLang() (+3 more)

### Community 3 - "Personaggi: aggiunta e controllo clip"
Cohesion: 0.06
Nodes (26): check_rig(), main(), angle(), audit(), model_frames(), world(), rot_angle(), sample() (+18 more)

### Community 4 - "Coppe: logica e menu"
Cohesion: 0.09
Nodes (37): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+29 more)

### Community 5 - "strikers_anim.py"
Cohesion: 0.14
Nodes (11): _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), _common_args(), main(), _quat_norm(), register() (+3 more)

### Community 7 - "Dipendenze del gioco"
Cohesion: 0.08
Nodes (19): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+11 more)

### Community 8 - "Hash dei nomi e campione di prova"
Cohesion: 0.18
Nodes (12): string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+4 more)

### Community 9 - "Stadio"
Cohesion: 0.15
Nodes (11): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, Pagina bozze (Artifact privato M9yMAgV1hSDitKZo9UgzLA), Interfaccia: ancora da decidere (bozze, nomi coppe, HTML/CSS sopra il canvas), HUD in partita (+3 more)

### Community 10 - "Economia: mercato e simulatore"
Cohesion: 0.15
Nodes (12): Mercato simulato con venditori CPU, data/economy.json (numeri dell economia), Pacchetto Holo (50.000, il nostro Ultimate Pack), Pacchetto Oro Premium (7.500 crediti), Dentro una rarita le carte forti sono piu rare (probabilita dimezzata ogni ~3 punti), Strategie simulate A (Oro Premium) e B (solo Holo), draw(), main() (+4 more)

### Community 11 - "Gioco: README e moduli"
Cohesion: 0.19
Nodes (18): Dev index page (game without build), Game README, ai.js fielder AI (press, mark, hold position), ball.js ball physics, Controls (Xbox controller and keyboard), game.js match loop, input.js Input.bind, Known issues (ball over 50 m/s, 89 MB build) (+10 more)

### Community 12 - "Ultimate Team: sezioni e carte"
Cohesion: 0.13
Nodes (10): HOLOS, LOADERS, Album: una pagina per personaggio con tutte le varianti, Club: crediti, negozio dei pacchetti con probabilita dichiarate, Divisioni: stagioni da 10 partite, da Divisione 10 a 1, Holo: Arcobaleno, Glitter (holo), Lava (rara), Prisma, Galassia (epica), Numerata 1-10 (teca graduata, targhetta blu notte e oro L3b), Rarita base: Bronzo, Argento, Oro, Oro raro (+2 more)

### Community 13 - "Test del convertitore"
Cohesion: 0.13
Nodes (12): contact_time(), strikers_frames(), _quat_to_mat(), check(), close(), game_world(), mul_rows(), qclose() (+4 more)

### Community 14 - "Regole del progetto (CLAUDE.md)"
Cohesion: 0.21
Nodes (14): Area routing table (Dove andare), graphify usage rules, CLAUDE.md project instructions, Private game Artifact (Ru4U9NJSLMxgRX2bcmH9HH), Graph and project map guide (grafo.md), graphify-out outputs (graph.html, GRAPH_REPORT.md, graph.json), Map areas (AREAS in make_map.py), docs/mappa.html navigable map (+6 more)

### Community 15 - "Riferimento e differenze volute"
Cohesion: 0.23
Nodes (12): config.js constants (SIZE, BALL, GOALIE), Reference README, smstrikers-decomp (commit d1f357f), strikers_characters.json character table, Super Mario Strikers reference measurements, Capsule collision and dribble ball bone, Per-character dimensions and parameters table, Field, goals and penalty area (41.20 x 24.17 m, goal 5.69 x 2.56 m) (+4 more)

### Community 16 - "Animazioni: README"
Cohesion: 0.17
Nodes (14): Animation README, Biped skeleton (Bip01 bones, ball bone), Bone name hash recovery (nlStringLowerHash, --names-from), Converter tests (tests/test_converter.py), Converter known limits (G4QP01, rest pose, keyframe offset), Mirrored clip export (--mirrored), retarget.py Biped-to-Mixamo retarget, Root motion in clips.json metadata (+6 more)

### Community 17 - "Pose e contatto col pallone"
Cohesion: 0.14
Nodes (8): dump_json(), _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, rest_offsets(), write_bvh(), joint()

### Community 18 - "render"
Cohesion: 0.19
Nodes (12): MAIN, SUB, back(), MAIN, pad(), press(), render(), setTab() (+4 more)

### Community 19 - "Bozze: carte e pacchetti"
Cohesion: 0.22
Nodes (9): card(), confetti(), crate(), OUT, run(), showCard(), sleeve(), tear() (+1 more)

### Community 20 - "Personaggi e squadre"
Cohesion: 0.32
Nodes (11): add_characters.py character onboarding, Characters README, Add a character procedure, Celestini team (light blue shirt), recolor flag (now false for all), Rivali team (green shirt), roster.json (teams, teamInfo, recolor), teamInfo team names and colors (+3 more)

### Community 21 - "Nomi delle ossa"
Cohesion: 0.29
Nodes (9): clip_states(), import_into_blender(), load_chunks(), _load_cli(), load_clips(), load_retargets(), load_skeletons(), NameBook (+1 more)

### Community 22 - "Interfaccia: piano e schermate"
Cohesion: 0.18
Nodes (11): Avvio del gioco, Bozze, Gioco rapido, Home, Interfaccia gioco: decisioni prese con l'utente, Lingue, Navigazione (stile FC), Ordine di lavoro (+3 more)

### Community 23 - "UiNav"
Cohesion: 0.13
Nodes (9): Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads(), UiNav (+1 more)

### Community 24 - "make_map.py"
Cohesion: 0.21
Nodes (6): area_of(), kind_of(), last_update(), main(), read_status(), write_readme_table()

### Community 25 - "Economia: documento"
Cohesion: 0.22
Nodes (9): Come funzionano i giochi di questo tipo, Confronto con FC, Cosa dice la simulazione, Da tarare dopo, giocando, Economia di Ultimate Team (crediti, pacchetti, mercato), Fonti, Mercato simulato, Negozio di pacchetti (+1 more)

### Community 28 - "Ultimate Team: rosa e ingresso"
Cohesion: 0.29
Nodes (7): Rosa: formazione di 5 (posti 0-3 movimento, 4 portiere) e panchina, Carte e collezione di personaggi, Ultimate Team: sintesi delle decisioni, Punto d ingresso della modalita nel menu principale, Squadra di 5 che riempie teams[0], Struttura proposta ultimate-team/ (tools, src, data), Ultimate Team (area in progettazione, codice non scritto)

### Community 29 - "Strumenti di verifica pose"
Cohesion: 0.47
Nodes (6): audit.py per-frame clip audit, audit.py results for portiere (ground_float, dir), Pose check page (clip frame grid), Animation sheet page (model vs original stick skeleton), sticks.json original skeleton frames, three.js importmap from node_modules

### Community 30 - "interfaccia-gioco/DESIGN.md"
Cohesion: 0.22
Nodes (5): Gioco rapido: umano vs CPU, 1v1, 2 vs CPU, CPU vs CPU, Menu M1 Cartoon tropicale (scelto), Un tema per ogni modalita (tropicale, coppe, hi-tech UT, art deco Mercato), Torneo con gli amici fino a 4 giocatori (stile Tenkaichi 3), Torneo privato (4, 8 o 16 squadre)

### Community 33 - "Ultimate Team: decisioni"
Cohesion: 0.33
Nodes (6): Apertura dei pacchetti, Economia, Rarità, Regole, Sezioni, Ultimate Team: decisioni prese con l'utente

### Community 34 - "Coppe come citazioni ironiche a giochi PS2"
Cohesion: 0.40
Nodes (4): Coppa Bullone Galattico (Ratchet & Clank, 5 partite), Coppa Lost Heaven (Mafia, 5 partite), Coppa Scimmie in Fuga (Ape Escape 3, 3 partite), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo, 4 partite)

### Community 35 - "FormatError"
Cohesion: 0.16
Nodes (7): Chunk, _cstr(), FormatError, Retargets, Skeleton, top_level_chunks(), _u32()

### Community 36 - "Coppe"
Cohesion: 0.50
Nodes (4): Coppe, Le 4 coppe, Stelle e obiettivi, Voto della coppa (gradazione stile Dragon Ball)

### Community 37 - "Modulo unico di salvataggio (save)"
Cohesion: 0.67
Nodes (3): Profili giocatore con progressi propri, Server privato (futuro salvataggio online), Ultimate Team fa parte del profilo (club, crediti, collezione)

### Community 38 - "Cose mancanti"
Cohesion: 0.67
Nodes (3): Ultimate Team (rules decided, code not started), Not yet present (power-ups, Super Strike, fouls, real sounds, Ultimate Team), Super Strike (Shoot-to-Score)

## Knowledge Gaps
- **23 isolated node(s):** `Pacchetto Holo (50.000, il nostro Ultimate Pack)`, `ShootAtFast closed-form pass velocity`, `Album: una pagina per personaggio con tutte le varianti`, `Rarita base: Bronzo, Argento, Oro, Oro raro`, `graphify-out outputs (graph.html, GRAPH_REPORT.md, graph.json)` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 183 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Ultimate Team (area in progettazione, codice non scritto)` connect `Ultimate Team: rosa e ingresso` to `IA e fisica del pallone`, `Stadio`, `Economia: mercato e simulatore`, `Ultimate Team: sezioni e carte`, `Regole del progetto (CLAUDE.md)`?**
  _High betweenness centrality (0.395) - this node is a cross-community bridge._
- **What connects `Pacchetto Holo (50.000, il nostro Ultimate Pack)`, `ShootAtFast closed-form pass velocity`, `Album: una pagina per personaggio con tutte le varianti` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Partita: Game e azioni` be split into smaller, more focused modules?**
  _Cohesion score 0.07901668129938542 - nodes in this community are weakly interconnected._
- **Why does `Punto d ingresso della modalita nel menu principale` connect `Ultimate Team: rosa e ingresso` to `IA e fisica del pallone`?**
  _High betweenness centrality (0.255) - this node is a cross-community bridge._
- **Should `IA e fisica del pallone` be split into smaller, more focused modules?**
  _Cohesion score 0.09693877551020408 - nodes in this community are weakly interconnected._
- **Why does `Calcio arcade project README` connect `Regole del progetto (CLAUDE.md)` to `Stadio`, `Gioco: README e moduli`, `Riferimento e differenze volute`, `Animazioni: README`, `Personaggi e squadre`, `Ultimate Team: rosa e ingresso`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Should `HUD in partita` be split into smaller, more focused modules?**
  _Cohesion score 0.10839598997493734 - nodes in this community are weakly interconnected._