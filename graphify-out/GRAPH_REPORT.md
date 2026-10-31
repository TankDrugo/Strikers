# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- 61 files · ~80,188 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 865 nodes · 1909 edges · 43 communities (39 shown, 4 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 160 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Fisica del pallone
- Obiettivi delle coppe
- Istruzioni e regole progetto
- Coppe e tabellone
- Bozze menu e carte
- Club di Ultimate Team
- Comandi e input
- Decodifica scene NIS
- Riferimento Strikers
- Pose e matrici originali
- Hash dei nomi originali
- Avvio del gioco
- Pallone e portiere
- nis.py
- Carte di Ultimate Team
- Retarget delle clip
- Super Mario Strikers: misure e d
- _mirror_rot()
- Stadio
- Convertitore Blender
- stadium.js
- autoSquad()
- Catalogo carte
- Rig Mixamo e glTF
- Roster e squadre
- Pacchetto npm
- Ball
- Simulatore economia
- Retarget personaggi
- Controllo automatico clip
- Rarita e walkout P1
- Album (2.000 per pagina, 25.000 
- Economia Ultimate Team
- Clip
- Nomi ossa da hash nlStringLowerH
- open_source()
- Partita e IA
- Statistiche per giocatore
- Le quattro coppe
- Ordine di lavoro (menu, Gioco ra
- Salvataggio profili
- Coppe (4 coppe a eliminazione di
- Come funzionano i giochi di ques

## God Nodes (most connected - your core abstractions)
1. `Game` - 47 edges
2. `t()` - 40 edges
3. `Menu` - 38 edges
4. `Player` - 25 edges
5. `boot()` - 23 edges
6. `Gioco (area)` - 21 edges
7. `import_into_blender()` - 20 edges
8. `installCups()` - 19 edges
9. `UiNav` - 19 edges
10. `test_decode()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `audit.py (controllo automatico clip)` --semantically_similar_to--> `sheet.html (modello accanto allo scheletro originale)`  [INFERRED] [semantically similar]
  animation/README.md → game/dev/sheet.html
- `color/shirt di teamInfo` --semantically_similar_to--> `teamInfo in roster.json (nomi e colori squadre)`  [INFERRED] [semantically similar]
  characters/README.md → CLAUDE.md
- `Cinque ruoli: portiere, difensore, centrocampista, ala, attaccante` --semantically_similar_to--> `teams: 5 posti (0 difensore,1 centrocampista,2 ala,3 attaccante,4 portiere)`  [INFERRED] [semantically similar]
  CLAUDE.md → characters/README.md
- `Apertura dei pacchetti P1 walkout a indizi` --semantically_similar_to--> `Pacchetti P1 walkout a indizi`  [INFERRED] [semantically similar]
  ultimate-team/DESIGN.md → interfaccia-gioco/DESIGN.md
- `Tabella 'Dove andare' (area -> cartella -> README)` --references--> `Grafo e mappa del progetto`  [EXTRACTED]
  CLAUDE.md → docs/grafo.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Progressione delle coppe (stelle, Difficile, voto, trofei)** — interfaccia_gioco_design_coppe, interfaccia_gioco_design_stelle_e_obiettivi, interfaccia_gioco_design_voto_della_coppa, interfaccia_gioco_design_premi_solo_trofei [EXTRACTED 1.00]
- **Chosen holo finishes** — interfaccia_gioco_bozze_bozze_menu_h1_arcobaleno, interfaccia_gioco_bozze_bozze_menu_h3_glitter, interfaccia_gioco_bozze_bozze_menu_h4_lava, interfaccia_gioco_bozze_bozze_menu_h6_prisma, interfaccia_gioco_bozze_bozze_menu_h5_galassia [EXTRACTED 1.00]
- **Menu input flow (keyboard/gamepad to tab, focus, enter, back)** — interfaccia_gioco_bozze_bozze_menu_pad, interfaccia_gioco_bozze_bozze_menu_shift, interfaccia_gioco_bozze_bozze_menu_press, interfaccia_gioco_bozze_bozze_menu_back, interfaccia_gioco_bozze_bozze_menu_movefocus, interfaccia_gioco_bozze_bozze_menu_render [EXTRACTED 1.00]
- **Pack opening flow (run, walkout/tear/crate, showCard, sleeve)** — interfaccia_gioco_bozze_bozze_menu_run, interfaccia_gioco_bozze_bozze_menu_walkout, interfaccia_gioco_bozze_bozze_menu_tear, interfaccia_gioco_bozze_bozze_menu_crate, interfaccia_gioco_bozze_bozze_menu_showcard, interfaccia_gioco_bozze_bozze_menu_sleeve [EXTRACTED 1.00]
- **Generazione mappa dalle sezioni Stato** — docs_make_map, readme_area_stato_section, readme_project_map_table, docs_grafo_mappa_html, githooks_pre_commit [EXTRACTED 1.00]
- **Procedura dopo una modifica al gioco** — game_tools_build, game_readme_playtest, game_readme_web_build, claude_private_game_artifact, docs_make_map [EXTRACTED 1.00]
- **Pipeline personaggio: glb -> retarget -> roster -> gioco** — characters_readme_glb_models, animation_add_characters, animation_readme_retarget, characters_readme_roster_json, game_src_main [INFERRED 0.85]
- **Flusso di apertura pacchetti con walkout ed esultanze NIS** — ultimate_team_design_apertura_pacchetti, interfaccia_gioco_design_pacchetti_p1_walkout, ultimate_team_design_esultanze_nis, ultimate_team_design_walkout, ultimate_team_design_strikers_nis_npz [INFERRED 0.85]
- **Rarita delle carte e loro presentazione (holo, numerate in teca, 1/1)** — ultimate_team_design_rarita, ultimate_team_design_numerata_1_10, ultimate_team_design_uno_su_uno_oro, interfaccia_gioco_design_scelte_sulle_bozze, ultimate_team_economia_negozio_pacchetti [INFERRED 0.85]

## Communities (43 total, 4 thin omitted)

### Community 0 - "Fisica del pallone"
Cohesion: 0.07
Nodes (8): bestPassTarget(), predict(), Game, AnimViewer, makePortraits(), angleDiff(), Player, seekDirection()

### Community 1 - "Obiettivi delle coppe"
Cohesion: 0.08
Nodes (12): Tracker, Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause() (+4 more)

### Community 2 - "Istruzioni e regole progetto"
Cohesion: 0.05
Nodes (28): Istruzioni per Claude (CLAUDE.md), Procedura dopo ogni modifica (build, playtest, pubblicazione web, aggiornamento grafo), Artifact privato del gioco (Ru4U9NJSLMxgRX2bcmH9HH), AREAS in make_map.py, Grafo e mappa del progetto, graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, docs/mappa.html (+20 more)

### Community 3 - "Coppe e tabellone"
Cohesion: 0.09
Nodes (39): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+31 more)

### Community 4 - "Bozze menu e carte"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 5 - "Club di Ultimate Team"
Cohesion: 0.10
Nodes (28): cardsOf(), hash(), tradable(), value(), addCard(), albumPage(), albumRewards(), buyOffer() (+20 more)

### Community 6 - "Comandi e input"
Cohesion: 0.12
Nodes (10): Comandi tastiera, Comandi controller Xbox (stile EA FC), Input, PAD, PadMenus, padPressed(), padStick(), readPad() (+2 more)

### Community 7 - "Decodifica scene NIS"
Cohesion: 0.09
Nodes (29): Animazioni (area), audit.py (controllo automatico clip), Scheletro Biped originale (Bip01), *.clips.json (metadati clip), Scheletro Mixamo, nis.py (decodifica scene .nis e walkout), retarget.py (retarget Biped -> Mixamo), Root motion (+21 more)

### Community 8 - "Riferimento Strikers"
Cohesion: 0.12
Nodes (18): _blender_cli(), Chunk, clip_states(), _common_args(), _cstr(), dump_json(), FormatError, load_chunks() (+10 more)

### Community 9 - "Pose e matrici originali"
Cohesion: 0.12
Nodes (14): world_mats(), cPoseAccumulator::BuildNodeMatrices, contact_time(), _mat_to_euler_zxy(), _quat_to_mat(), check(), close(), game_world() (+6 more)

### Community 10 - "Hash dei nomi originali"
Cohesion: 0.18
Nodes (12): string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+4 more)

### Community 11 - "Avvio del gioco"
Cohesion: 0.16
Nodes (18): FIELDER.height (altezza uguale dei giocatori di movimento), Visualizzatore animazioni, ANIM_RATE_MAX, ANIM_RATE_MIN, FIELDER, GOALIE, MATCH, RIG_HEIGHT (+10 more)

### Community 12 - "Pallone e portiere"
Cohesion: 0.14
Nodes (17): Problema: pallone oltre 50 m/s, Tiro perfetto con effetto Magnus (cBall::Shoot), Partita a due giocatori, shootAtFast(), tmp, BALL, FIELD, PASS (+9 more)

### Community 13 - "nis.py"
Cohesion: 0.15
Nodes (12): biped_layout(), clip_frames(), decode(), export(), leg_length(), load(), read_camera(), retarget_walkouts() (+4 more)

### Community 14 - "Carte di Ultimate Team"
Cohesion: 0.20
Nodes (17): addStrings(), getLang(), STRINGS, BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles() (+9 more)

### Community 15 - "Retarget delle clip"
Cohesion: 0.15
Nodes (11): calibrate(), frame_from(), lowest_offset(), R(), mat_to_quat(), orthonormal(), retarget_clip(), W() (+3 more)

### Community 16 - "Super Mario Strikers: misure e d"
Cohesion: 0.14
Nodes (16): Super Mario Strikers: misure e dinamiche di riferimento, Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp, GoalPostDimensions.ini (porte per stadio) (+8 more)

### Community 17 - "_mirror_rot()"
Cohesion: 0.14
Nodes (8): _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), rest_offsets(), _unwrap(), write_bvh(), joint()

### Community 18 - "Stadio"
Cohesion: 0.13
Nodes (13): Interfaccia gioco: decisioni prese con l'utente, Bozze (pagina di prova Artifact, bozze-menu.html), Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Menu M1 Cartoon tropicale, Scelte sulle bozze (M1, holo, L3b, L4, P1), Interfaccia gioco (README), Con cosa si collega (Ultimate Team, roster.json, input.js) (+5 more)

### Community 19 - "Convertitore Blender"
Cohesion: 0.20
Nodes (8): _biped_names(), _blender_add_curve(), _blender_fcurve_bag(), import_into_blender(), load_clips(), load_skeletons(), NameBook, test_blender()

### Community 20 - "stadium.js"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 21 - "autoSquad()"
Cohesion: 0.14
Nodes (16): autoSquad(), canPlace(), cardOf(), fillDays(), fromBench(), inst(), lineup(), listCard() (+8 more)

### Community 22 - "Catalogo carte"
Cohesion: 0.15
Nodes (8): avgOvr, CARD, CATALOG, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

### Community 23 - "Rig Mixamo e glTF"
Cohesion: 0.21
Nodes (5): main(), quat_to_mat(), Rig, shrink_images(), write_glb()

### Community 24 - "Roster e squadre"
Cohesion: 0.21
Nodes (11): recolor in roster.json, game/assets/roster.json, color/shirt di teamInfo, teams: 5 posti (0 difensore,1 centrocampista,2 ala,3 attaccante,4 portiere), Raggio pallone 0,13 m (originale 0,18 m), Cinque ruoli: portiere, difensore, centrocampista, ala, attaccante, Stato al passaggio di consegne, SIZE: giocatori 1,3x l'originale (+3 more)

### Community 25 - "Pacchetto npm"
Cohesion: 0.18
Nodes (11): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+3 more)

### Community 27 - "Simulatore economia"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 28 - "Retarget personaggi"
Cohesion: 0.27
Nodes (3): check_rig(), main(), Glb

### Community 29 - "Controllo automatico clip"
Cohesion: 0.36
Nodes (6): angle(), audit(), model_frames(), world(), rot_angle(), sample()

### Community 30 - "Rarita e walkout P1"
Cohesion: 0.20
Nodes (7): Pacchetti P1 walkout a indizi, Apertura dei pacchetti P1 walkout a indizi, Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro), animation/data/strikers_nis.npz (da animation/nis.py), 1/1 Oro (teca nera con bordo oro), Walkout (corsa da camera_establish_home ed esultanza), Prossimo: piu esultanze originali, server privato

### Community 31 - "Album (2.000 per pagina, 25.000 "
Cohesion: 0.22
Nodes (9): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Obiettivi del giorno (400 crediti l'uno), Scelte di dettaglio (31 ottobre), Valutazioni base dei 10 personaggi (Celestini, Rivali), Varianti delle carte (+2 oro raro ... +10 1/1) (+1 more)

### Community 32 - "Economia Ultimate Team"
Cohesion: 0.28
Nodes (8): Economia (rimando a ECONOMIA.md), Economia di Ultimate Team (crediti, pacchetti, mercato), Da tarare dopo, giocando, data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia), Cosa dice la simulazione (strategia A Oro Premium, B Holo), data/cards.json (carte e statistiche base), Dove sta il codice (cards.js, club.js, walkout3d.js, utMenu.js, utCards.js, stats.js)

### Community 34 - "Nomi ossa da hash nlStringLowerH"
Cohesion: 0.33
Nodes (7): Nomi ossa da hash nlStringLowerHash, Disco europeo G4QP01, Clip specchiate (_mirror, direzioni 0900), smstrikers-decomp (yannicksuter, commit d1f357f), strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender), Riferimento: il gioco originale, strikers_characters.json

### Community 36 - "Partita e IA"
Cohesion: 0.43
Nodes (6): dist2(), fielderAI(), moveTo(), openness(), v, TACKLE

### Community 37 - "Statistiche per giocatore"
Cohesion: 0.52
Nodes (5): f(), fielderConfig(), goalieConfig(), scale(), STAT_BASE

### Community 38 - "Le quattro coppe"
Cohesion: 0.29
Nodes (5): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia)

### Community 39 - "Ordine di lavoro (menu, Gioco ra"
Cohesion: 0.29
Nodes (4): Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Ultimate Team: decisioni prese con l'utente, Sezioni: Club, Rosa, Mercato, Divisioni, Album

### Community 40 - "Salvataggio profili"
Cohesion: 0.33
Nodes (5): Avvio del gioco (lingua, profilo), Ultimate Team (README), Con cosa si collega (roster.json, main.js statsFor, save.js, nis.py), Stato: funziona (carte, pacchetti, walkout, mercato, divisioni, album), Prova automatica game/tools/uttest.cjs

### Community 41 - "Coppe (4 coppe a eliminazione di"
Cohesion: 0.40
Nodes (4): Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori), Torneo privato, Voto della coppa D-C-B-A-S-Z (stile Dragon Ball), Rubinetti: da dove arrivano i crediti

## Knowledge Gaps
- **63 isolated node(s):** `Cinque ruoli: portiere, difensore, centrocampista, ala, attaccante`, `Repository GitHub TankDrugo/Strikers`, `*.clips.json (metadati clip)`, `Nomi ossa da hash nlStringLowerHash`, `Clip specchiate (_mirror, direzioni 0900)` (+58 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 226 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `game/assets/roster.json` connect `Roster e squadre` to `Avvio del gioco`, `Retarget personaggi`, `Decodifica scene NIS`?**
  _High betweenness centrality (0.219) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `boot()` (e.g. with `.tick()` and `.show()`) actually correct?**
  _`boot()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Cinque ruoli: portiere, difensore, centrocampista, ala, attaccante`, `Repository GitHub TankDrugo/Strikers`, `*.clips.json (metadati clip)` to the rest of the system?**
  _63 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Fisica del pallone` be split into smaller, more focused modules?**
  _Cohesion score 0.07099099099099099 - nodes in this community are weakly interconnected._
- **Why does `Gioco (area)` connect `Decodifica scene NIS` to `Istruzioni e regole progetto`, `Partita e IA`, `Statistiche per giocatore`, `Comandi e input`, `Avvio del gioco`, `Pallone e portiere`, `Roster e squadre`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Should `Obiettivi delle coppe` be split into smaller, more focused modules?**
  _Cohesion score 0.07847082494969819 - nodes in this community are weakly interconnected._
- **Why does `Game` connect `Fisica del pallone` to `Obiettivi delle coppe`, `Avvio del gioco`, `Pallone e portiere`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._