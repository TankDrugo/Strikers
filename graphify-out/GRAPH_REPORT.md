# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- 61 files · ~80,582 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 906 nodes · 1968 edges · 39 communities (35 shown, 4 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 167 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- predict()
- Hud
- Pagina sviluppo gioco senza buil
- cups.js
- Animazioni (area)
- bozze-menu.html (Bozze menu e ca
- retarget.py
- strikers_anim.py
- add_characters.py
- cardsOf()
- cPoseAccumulator::BuildNodeMatri
- package.json
- Like test_converter.game_world, 
- i18n.js
- Super Mario Strikers: misure e d
- nlStringHash: used for clip and 
- Comandi tastiera
- Aggiungere un personaggio
- stadium.js
- Interfaccia gioco: decisioni pre
- animation/add_characters.py --au
- ultimate-team/data/cards.json (c
- cards.js
- Bozze (pagina di prova Artifact,
- Album (2.000 per pagina, 25.000 
- FIELDER.height in game/src/confi
- Ball
- pathlib
- WalkoutStage
- Avvio del gioco (lingua, profilo
- Economia (rimando a ECONOMIA.md)
- Clip
- Capitano (scelto nella Rosa, non
- tradable()
- 3 clip del walkout (strikers_nis
- hash()
- Coppa Bullone Galattico (Ratchet
- Coppe (4 coppe a eliminazione di
- Come funzionano i giochi di ques

## God Nodes (most connected - your core abstractions)
1. `Game` - 47 edges
2. `t()` - 40 edges
3. `Menu` - 38 edges
4. `Player` - 25 edges
5. `boot()` - 23 edges
6. `import_into_blender()` - 20 edges
7. `Gioco (area)` - 20 edges
8. `installCups()` - 19 edges
9. `UiNav` - 19 edges
10. `test_decode()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `3 clip del walkout (strikers_nis.npz)` --semantically_similar_to--> `3 clip del walkout dalle scene .nis`  [INFERRED] [semantically similar]
  characters/README.md → CLAUDE.md
- `Celestini (maglia celeste)` --semantically_similar_to--> `Celestini`  [INFERRED] [semantically similar]
  CLAUDE.md → characters/README.md
- `Rivali (maglia verde)` --semantically_similar_to--> `Rivali`  [INFERRED] [semantically similar]
  CLAUDE.md → characters/README.md
- `teamInfo in game/assets/roster.json` --semantically_similar_to--> `teamInfo (color, shirt)`  [INFERRED] [semantically similar]
  CLAUDE.md → characters/README.md
- `Apertura dei pacchetti P1 walkout a indizi` --semantically_similar_to--> `Pacchetti P1 walkout a indizi`  [INFERRED] [semantically similar]
  ultimate-team/DESIGN.md → interfaccia-gioco/DESIGN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pipeline per aggiungere un personaggio (retarget, roster, carte, nomi, prove)** — characters_readme_aggiungere_un_personaggio, characters_readme_add_characters_py, characters_readme_roster_json, characters_readme_cards_json, characters_readme_i18n_ut_js, characters_readme_prove [EXTRACTED 1.00]
- **Progressione delle coppe (stelle, Difficile, voto, trofei)** — interfaccia_gioco_design_coppe, interfaccia_gioco_design_stelle_e_obiettivi, interfaccia_gioco_design_voto_della_coppa, interfaccia_gioco_design_premi_solo_trofei [EXTRACTED 1.00]
- **Chosen holo finishes** — interfaccia_gioco_bozze_bozze_menu_h1_arcobaleno, interfaccia_gioco_bozze_bozze_menu_h3_glitter, interfaccia_gioco_bozze_bozze_menu_h4_lava, interfaccia_gioco_bozze_bozze_menu_h6_prisma, interfaccia_gioco_bozze_bozze_menu_h5_galassia [EXTRACTED 1.00]
- **Menu input flow (keyboard/gamepad to tab, focus, enter, back)** — interfaccia_gioco_bozze_bozze_menu_pad, interfaccia_gioco_bozze_bozze_menu_shift, interfaccia_gioco_bozze_bozze_menu_press, interfaccia_gioco_bozze_bozze_menu_back, interfaccia_gioco_bozze_bozze_menu_movefocus, interfaccia_gioco_bozze_bozze_menu_render [EXTRACTED 1.00]
- **Pack opening flow (run, walkout/tear/crate, showCard, sleeve)** — interfaccia_gioco_bozze_bozze_menu_run, interfaccia_gioco_bozze_bozze_menu_walkout, interfaccia_gioco_bozze_bozze_menu_tear, interfaccia_gioco_bozze_bozze_menu_crate, interfaccia_gioco_bozze_bozze_menu_showcard, interfaccia_gioco_bozze_bozze_menu_sleeve [EXTRACTED 1.00]
- **Generazione mappa dalle sezioni Stato** — docs_make_map, readme_area_stato_section, readme_project_map_table, docs_grafo_mappa_html, githooks_pre_commit [EXTRACTED 1.00]
- **Implementazione Super Strike del capitano** — claude_super_strike, claude_capitano, claude_captain_shoot_to_score, claude_club_js_utmenu_js, claude_with_lineups, claude_strikers_reference_md [EXTRACTED 1.00]
- **Flusso di apertura pacchetti con walkout ed esultanze NIS** — ultimate_team_design_apertura_pacchetti, interfaccia_gioco_design_pacchetti_p1_walkout, ultimate_team_design_esultanze_nis, ultimate_team_design_walkout, ultimate_team_design_strikers_nis_npz [INFERRED 0.85]
- **Pubblicazione del gioco compilato sull'Artifact privato** — claude_aggiorna_link_online, claude_artifact_privato_del_gioco, claude_peso_gioco_compilato, claude_limite_64_mb [INFERRED 0.85]
- **Rarita delle carte e loro presentazione (holo, numerate in teca, 1/1)** — ultimate_team_design_rarita, ultimate_team_design_numerata_1_10, ultimate_team_design_uno_su_uno_oro, interfaccia_gioco_design_scelte_sulle_bozze, ultimate_team_economia_negozio_pacchetti [INFERRED 0.85]

## Communities (39 total, 4 thin omitted)

### Community 0 - "predict()"
Cohesion: 0.07
Nodes (8): predict(), shootAtFast(), Game, AnimViewer, makePortraits(), angleDiff(), Player, seekDirection()

### Community 1 - "Hud"
Cohesion: 0.09
Nodes (11): Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause(), t() (+3 more)

### Community 2 - "Pagina sviluppo gioco senza buil"
Cohesion: 0.06
Nodes (54): Pagina sviluppo gioco senza build (dev/index.html), dependencies, three@0.180.0, Visualizzatore animazioni, Problema: pallone oltre 50 m/s, src/cups/ (Coppe), dev/ (pagine di sviluppo), src/field.js e src/stadium.js (+46 more)

### Community 3 - "cups.js"
Cohesion: 0.07
Nodes (41): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+33 more)

### Community 4 - "Animazioni (area)"
Cohesion: 0.05
Nodes (37): Animazioni (area), audit.py (controllo automatico clip), Scheletro Biped originale (Bip01), Nomi ossa da hash nlStringLowerHash, *.clips.json (metadati clip), Disco europeo G4QP01, Clip specchiate (_mirror, direzioni 0900), Scheletro Mixamo (+29 more)

### Community 5 - "bozze-menu.html (Bozze menu e ca"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 6 - "retarget.py"
Cohesion: 0.08
Nodes (18): calibrate(), frame_from(), Glb, lowest_offset(), R(), main(), mat_to_quat(), open_source() (+10 more)

### Community 7 - "strikers_anim.py"
Cohesion: 0.10
Nodes (24): _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk, clip_states(), _common_args(), _cstr(), dump_json() (+16 more)

### Community 8 - "add_characters.py"
Cohesion: 0.10
Nodes (20): check_rig(), main(), angle(), audit(), model_frames(), world(), rot_angle(), sample() (+12 more)

### Community 9 - "cardsOf()"
Cohesion: 0.09
Nodes (29): cardsOf(), addCard(), albumPage(), albumRewards(), autoSquad(), buyOffer(), buyPack(), canPlace() (+21 more)

### Community 10 - "cPoseAccumulator::BuildNodeMatri"
Cohesion: 0.10
Nodes (17): cPoseAccumulator::BuildNodeMatrices, _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat(), _unwrap() (+9 more)

### Community 11 - "package.json"
Cohesion: 0.07
Nodes (19): devDependencies, esbuild@0.25.10, name, private, scripts, build, type, version (+11 more)

### Community 12 - "Like test_converter.game_world, "
Cohesion: 0.13
Nodes (10): world_mats(), contact_time(), strikers_frames(), _biped_names(), NameBook, game_world(), mul_rows(), quat_rows() (+2 more)

### Community 13 - "i18n.js"
Cohesion: 0.20
Nodes (17): addStrings(), getLang(), STRINGS, BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles() (+9 more)

### Community 14 - "Super Mario Strikers: misure e d"
Cohesion: 0.12
Nodes (17): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+9 more)

### Community 15 - "nlStringHash: used for clip and "
Cohesion: 0.21
Nodes (10): string_hash(), string_lower_hash(), sample_props(), sample_scale(), sample_trans(), write_bundle(), write_clip(), write_retarget() (+2 more)

### Community 16 - "Comandi tastiera"
Cohesion: 0.19
Nodes (9): Comandi tastiera, Comandi controller Xbox (stile EA FC), Input, PAD, PadMenus, padPressed(), padStick(), readPad() (+1 more)

### Community 17 - "Aggiungere un personaggio"
Cohesion: 0.16
Nodes (10): Aggiungere un personaggio, game/src/ui/i18n_ut.js (ut.char.<id>), Ricompila e prova (build.mjs, playtest.cjs, uttest.cjs), game/dev/sheet.html (confronto fotogramma per fotogramma), Stato personaggi: completo, Visualizzatore animazioni (Impostazioni), Artifact privato del gioco (Ru4U9NJSLMxgRX2bcmH9HH), Nuovi personaggi (.glb Mixamo) (+2 more)

### Community 18 - "stadium.js"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 19 - "Interfaccia gioco: decisioni pre"
Cohesion: 0.15
Nodes (10): Interfaccia gioco: decisioni prese con l'utente, Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Interfaccia gioco (README), Con cosa si collega (Ultimate Team, roster.json, input.js), HUD in partita (punteggio, tempo, barra del tiro), PadMenus: navigazione menu col controller, Cosa esiste gia (prototipo: main.js, hud.js, input.js, stadium.js) (+2 more)

### Community 20 - "animation/add_characters.py --au"
Cohesion: 0.24
Nodes (12): animation/add_characters.py --audit, Celestini, Personaggi (characters/README.md), recolor in roster.json, game/assets/roster.json, Scheletro Mixamo (mixamorig:Hips...), Modelli <squadra>_<ruolo>.glb (10 personaggi), teams in roster.json (posti 0-4) (+4 more)

### Community 21 - "ultimate-team/data/cards.json (c"
Cohesion: 0.20
Nodes (12): ultimate-team/data/cards.json (characters), Valutazione carte (bronzo <65, argento 65-74, oro >=75, numerate >=85), Coppe complete (stelle, Difficile, voto D-Z, tornei fino a 4), game/dev/index.html (pagina di sviluppo), interfaccia-gioco/DESIGN.md, Interfaccia gioco (menu stile FC, profili, Gioco rapido), game/src/ui/save.js (save.registry()), Server privato (Oracle) (+4 more)

### Community 22 - "cards.js"
Cohesion: 0.17
Nodes (7): avgOvr, CATALOG, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

### Community 23 - "Bozze (pagina di prova Artifact,"
Cohesion: 0.18
Nodes (10): Bozze (pagina di prova Artifact, bozze-menu.html), Menu M1 Cartoon tropicale, Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Pacchetti P1 walkout a indizi, Scelte sulle bozze (M1, holo, L3b, L4, P1), Ultimate Team: decisioni prese con l'utente, Apertura dei pacchetti P1 walkout a indizi, Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro) (+2 more)

### Community 24 - "Album (2.000 per pagina, 25.000 "
Cohesion: 0.17
Nodes (11): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Obiettivi del giorno (400 crediti l'uno), Scelte di dettaglio (31 ottobre), animation/data/strikers_nis.npz (da animation/nis.py), Valutazioni base dei 10 personaggi (Celestini, Rivali) (+3 more)

### Community 25 - "FIELDER.height in game/src/confi"
Cohesion: 0.22
Nodes (9): FIELDER.height in game/src/config.js, Rivali, teamInfo (color, shirt), Comandi controller Xbox stile EA FC o tastiera, BALL.radius: pallone 0,13 m, Rivali (maglia verde), SIZE: giocatori 1,3 volte l'originale, Stato al passaggio di consegne (+1 more)

### Community 27 - "pathlib"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 29 - "Avvio del gioco (lingua, profilo"
Cohesion: 0.22
Nodes (7): Avvio del gioco (lingua, profilo), Ultimate Team (README), data/cards.json (carte e statistiche base), Con cosa si collega (roster.json, main.js statsFor, save.js, nis.py), Dove sta il codice (cards.js, club.js, walkout3d.js, utMenu.js, utCards.js, stats.js), Stato: funziona (carte, pacchetti, walkout, mercato, divisioni, album), Prova automatica game/tools/uttest.cjs

### Community 30 - "Economia (rimando a ECONOMIA.md)"
Cohesion: 0.28
Nodes (7): Economia (rimando a ECONOMIA.md), Economia di Ultimate Team (crediti, pacchetti, mercato), Da tarare dopo, giocando, data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia), Cosa dice la simulazione (strategia A Oro Premium, B Holo), Prossimo: piu esultanze originali, server privato

### Community 32 - "Capitano (scelto nella Rosa, non"
Cohesion: 0.29
Nodes (8): Capitano (scelto nella Rosa, non portiere), game/src/ut/club.js e game/src/ui/utMenu.js, Dove andare (tabella aree e README), Calcio arcade: istruzioni per Claude, Prossimi lavori (31 ottobre), reference/STRIKERS_REFERENCE.md, Super Strike (ulti), withLineups (main.js -> game.js)

### Community 33 - "tradable()"
Cohesion: 0.29
Nodes (8): tradable(), fillDays(), fromBench(), listCard(), quickSell(), quickSellValue(), toBench(), where()

### Community 34 - "3 clip del walkout (strikers_nis"
Cohesion: 0.33
Nodes (6): 3 clip del walkout (strikers_nis.npz), 183 clip di animazione (84 giocatore, 99 portiere), Clip captain_shoot_to_score e gk_s2s_*, animation/data/strikers_nis.npz, animation/data/strikers_source.npz, 3 clip del walkout dalle scene .nis

### Community 35 - "hash()"
Cohesion: 0.33
Nodes (7): hash(), value(), cpuRating(), fair(), offers(), opponent(), today()

### Community 36 - "Coppa Bullone Galattico (Ratchet"
Cohesion: 0.29
Nodes (5): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia)

### Community 37 - "Coppe (4 coppe a eliminazione di"
Cohesion: 0.40
Nodes (4): Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori), Torneo privato, Voto della coppa D-C-B-A-S-Z (stile Dragon Ball), Rubinetti: da dove arrivano i crediti

## Knowledge Gaps
- **71 isolated node(s):** `Comandi controller Xbox stile EA FC o tastiera`, `game/dev/index.html (pagina di sviluppo)`, `game/src/ut/club.js e game/src/ui/utMenu.js`, `withLineups (main.js -> game.js)`, `game/src/ui/save.js (save.registry())` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 238 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `game/assets/roster.json` connect `animation/add_characters.py --au` to `add_characters.py`, `FIELDER.height in game/src/confi`, `Capitano (scelto nella Rosa, non`, `Pagina sviluppo gioco senza buil`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `boot()` (e.g. with `.tick()` and `.show()`) actually correct?**
  _`boot()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Comandi controller Xbox stile EA FC o tastiera`, `game/dev/index.html (pagina di sviluppo)`, `game/src/ut/club.js e game/src/ui/utMenu.js` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `predict()` be split into smaller, more focused modules?**
  _Cohesion score 0.07063063063063063 - nodes in this community are weakly interconnected._
- **Why does `Gioco (area)` connect `Pagina sviluppo gioco senza buil` to `Comandi tastiera`, `package.json`, `animation/add_characters.py --au`, `Animazioni (area)`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Should `Hud` be split into smaller, more focused modules?**
  _Cohesion score 0.08612836438923395 - nodes in this community are weakly interconnected._
- **Why does `Tabella aree del progetto (scritta da make_map.py)` connect `Animazioni (area)` to `Pagina sviluppo gioco senza buil`, `animation/add_characters.py --au`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._