# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- 57 files · ~81,171 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 906 nodes · 1975 edges · 38 communities (36 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 167 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c4d07289`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Game
- t
- main.js
- menu.js
- make_map.py
- Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)
- retarget.py
- strikers_anim.py
- nis.py
- club.js
- math
- build.mjs
- test_converter.py
- utMenu.js
- Super Mario Strikers: misure e dinamiche di riferimento
- make_sample.py
- input.js
- Aggiungere un personaggio
- Stadium
- Interfaccia gioco: decisioni prese con l'utente
- Personaggi (characters/README.md)
- Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti)
- cards.js
- Esultanze originali dalle sequenze NIS (art/nis, nis_dict.txt)
- Scelte di dettaglio (31 ottobre)
- Stato al passaggio di consegne
- Ball
- economy_sim.py
- .from_disc
- Ultimate Team (README)
- Economia di Ultimate Team (crediti, pacchetti, mercato)
- Calcio arcade: istruzioni per Claude
- tradable
- 183 clip di animazione (84 giocatore, 99 portiere)
- value
- Le 4 coppe (citazioni ironiche ai giochi PS2)
- Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori)
- Come funzionano i giochi di questo tipo (FC e gacha)

## God Nodes (most connected - your core abstractions)
1. `Game` - 47 edges
2. `t()` - 40 edges
3. `Menu` - 38 edges
4. `Player` - 25 edges
5. `boot()` - 23 edges
6. `Gioco (area)` - 22 edges
7. `import_into_blender()` - 20 edges
8. `installCups()` - 19 edges
9. `UiNav` - 19 edges
10. `test_decode()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Celestini (maglia celeste)` --semantically_similar_to--> `Celestini`  [INFERRED] [semantically similar]
  CLAUDE.md → characters/README.md
- `Apertura dei pacchetti P1 walkout a indizi` --semantically_similar_to--> `Pacchetti P1 walkout a indizi`  [INFERRED] [semantically similar]
  ultimate-team/DESIGN.md → interfaccia-gioco/DESIGN.md
- `Rivali (maglia verde)` --semantically_similar_to--> `Rivali`  [INFERRED] [semantically similar]
  CLAUDE.md → characters/README.md
- `teamInfo in game/assets/roster.json` --semantically_similar_to--> `teamInfo (color, shirt)`  [INFERRED] [semantically similar]
  CLAUDE.md → characters/README.md
- `3 clip del walkout (strikers_nis.npz)` --semantically_similar_to--> `3 clip del walkout dalle scene .nis`  [INFERRED] [semantically similar]
  characters/README.md → CLAUDE.md

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

## Communities (38 total, 2 thin omitted)

### Community 0 - "Game"
Cohesion: 0.07
Nodes (8): predict(), shootAtFast(), Game, AnimViewer, makePortraits(), angleDiff(), Player, seekDirection()

### Community 1 - "t"
Cohesion: 0.09
Nodes (11): Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause(), t() (+3 more)

### Community 2 - "main.js"
Cohesion: 0.06
Nodes (54): Pagina sviluppo gioco senza build (dev/index.html), dependencies, three@0.180.0, Visualizzatore animazioni, Problema: pallone oltre 50 m/s, src/cups/ (Coppe), dev/ (pagine di sviluppo), src/field.js e src/stadium.js (+46 more)

### Community 3 - "menu.js"
Cohesion: 0.07
Nodes (41): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+33 more)

### Community 4 - "make_map.py"
Cohesion: 0.05
Nodes (37): Animazioni (area), audit.py (controllo automatico clip), Scheletro Biped originale (Bip01), Nomi ossa da hash nlStringLowerHash, *.clips.json (metadati clip), Disco europeo G4QP01, Clip specchiate (_mirror, direzioni 0900), Scheletro Mixamo (+29 more)

### Community 5 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 6 - "retarget.py"
Cohesion: 0.08
Nodes (17): calibrate(), frame_from(), lowest_offset(), R(), main(), mat_to_quat(), open_source(), orthonormal() (+9 more)

### Community 7 - "strikers_anim.py"
Cohesion: 0.11
Nodes (23): _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk, clip_states(), _common_args(), _cstr(), dump_json() (+15 more)

### Community 8 - "nis.py"
Cohesion: 0.07
Nodes (22): check_rig(), main(), angle(), audit(), model_frames(), world(), rot_angle(), sample() (+14 more)

### Community 9 - "club.js"
Cohesion: 0.09
Nodes (29): cardsOf(), addCard(), albumPage(), albumRewards(), autoSquad(), buyOffer(), buyPack(), canPlace() (+21 more)

### Community 10 - "math"
Cohesion: 0.13
Nodes (11): _mat_to_euler_zxy(), _mirror_rot(), Pose, _quat_norm(), _quat_to_mat(), rest_offsets(), _unwrap(), write_bvh() (+3 more)

### Community 11 - "build.mjs"
Cohesion: 0.06
Nodes (20): devDependencies, esbuild@0.25.10, name, private, scripts, build, type, version (+12 more)

### Community 12 - "test_converter.py"
Cohesion: 0.12
Nodes (14): world_mats(), cPoseAccumulator::BuildNodeMatrices, contact_time(), strikers_frames(), _mirror_trans(), check(), close(), game_world() (+6 more)

### Community 13 - "utMenu.js"
Cohesion: 0.20
Nodes (17): addStrings(), getLang(), STRINGS, BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles() (+9 more)

### Community 14 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.12
Nodes (17): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+9 more)

### Community 15 - "make_sample.py"
Cohesion: 0.21
Nodes (10): string_hash(), string_lower_hash(), sample_props(), sample_scale(), sample_trans(), write_bundle(), write_clip(), write_retarget() (+2 more)

### Community 16 - "input.js"
Cohesion: 0.19
Nodes (9): Comandi tastiera, Comandi controller Xbox (stile EA FC), Input, PAD, PadMenus, padPressed(), padStick(), readPad() (+1 more)

### Community 17 - "Aggiungere un personaggio"
Cohesion: 0.16
Nodes (10): Aggiungere un personaggio, game/src/ui/i18n_ut.js (ut.char.<id>), Ricompila e prova (build.mjs, playtest.cjs, uttest.cjs), game/dev/sheet.html (confronto fotogramma per fotogramma), Stato personaggi: completo, Visualizzatore animazioni (Impostazioni), Artifact privato del gioco (Ru4U9NJSLMxgRX2bcmH9HH), Nuovi personaggi (.glb Mixamo) (+2 more)

### Community 18 - "Stadium"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 19 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.13
Nodes (13): Interfaccia gioco: decisioni prese con l'utente, Bozze (pagina di prova Artifact, bozze-menu.html), Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Menu M1 Cartoon tropicale, Scelte sulle bozze (M1, holo, L3b, L4, P1), Interfaccia gioco (README), Con cosa si collega (Ultimate Team, roster.json, input.js) (+5 more)

### Community 20 - "Personaggi (characters/README.md)"
Cohesion: 0.24
Nodes (12): animation/add_characters.py --audit, Celestini, Personaggi (characters/README.md), recolor in roster.json, game/assets/roster.json, Scheletro Mixamo (mixamorig:Hips...), Modelli <squadra>_<ruolo>.glb (10 personaggi), teams in roster.json (posti 0-4) (+4 more)

### Community 21 - "Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti)"
Cohesion: 0.20
Nodes (12): ultimate-team/data/cards.json (characters), Valutazione carte (bronzo <65, argento 65-74, oro >=75, numerate >=85), Coppe complete (stelle, Difficile, voto D-Z, tornei fino a 4), game/dev/index.html (pagina di sviluppo), interfaccia-gioco/DESIGN.md, Interfaccia gioco (menu stile FC, profili, Gioco rapido), game/src/ui/save.js (save.registry()), Server privato (Oracle) (+4 more)

### Community 22 - "cards.js"
Cohesion: 0.17
Nodes (7): avgOvr, CATALOG, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

### Community 23 - "Esultanze originali dalle sequenze NIS (art/nis, nis_dict.txt)"
Cohesion: 0.40
Nodes (4): Pacchetti P1 walkout a indizi, Apertura dei pacchetti P1 walkout a indizi, animation/data/strikers_nis.npz (da animation/nis.py), Walkout (corsa da camera_establish_home ed esultanza)

### Community 24 - "Scelte di dettaglio (31 ottobre)"
Cohesion: 0.22
Nodes (9): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Obiettivi del giorno (400 crediti l'uno), Scelte di dettaglio (31 ottobre), Valutazioni base dei 10 personaggi (Celestini, Rivali), Varianti delle carte (+2 oro raro ... +10 1/1) (+1 more)

### Community 25 - "Stato al passaggio di consegne"
Cohesion: 0.22
Nodes (9): FIELDER.height in game/src/config.js, Rivali, teamInfo (color, shirt), Comandi controller Xbox stile EA FC o tastiera, BALL.radius: pallone 0,13 m, Rivali (maglia verde), SIZE: giocatori 1,3 volte l'originale, Stato al passaggio di consegne (+1 more)

### Community 27 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 28 - ".from_disc"
Cohesion: 0.29
Nodes (3): _biped_names(), NameBook, test_blender()

### Community 29 - "Ultimate Team (README)"
Cohesion: 0.22
Nodes (7): Avvio del gioco (lingua, profilo), Ultimate Team (README), data/cards.json (carte e statistiche base), Con cosa si collega (roster.json, main.js statsFor, save.js, nis.py), Dove sta il codice (cards.js, club.js, walkout3d.js, utMenu.js, utCards.js, stats.js), Stato: funziona (carte, pacchetti, walkout, mercato, divisioni, album), Prova automatica game/tools/uttest.cjs

### Community 30 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.16
Nodes (12): Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Ultimate Team: decisioni prese con l'utente, Economia (rimando a ECONOMIA.md), Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro), Sezioni: Club, Rosa, Mercato, Divisioni, Album, 1/1 Oro (teca nera con bordo oro), Economia di Ultimate Team (crediti, pacchetti, mercato), Da tarare dopo, giocando (+4 more)

### Community 32 - "Calcio arcade: istruzioni per Claude"
Cohesion: 0.29
Nodes (8): Capitano (scelto nella Rosa, non portiere), game/src/ut/club.js e game/src/ui/utMenu.js, Dove andare (tabella aree e README), Calcio arcade: istruzioni per Claude, Prossimi lavori (31 ottobre), reference/STRIKERS_REFERENCE.md, Super Strike (ulti), withLineups (main.js -> game.js)

### Community 33 - "tradable"
Cohesion: 0.29
Nodes (8): tradable(), fillDays(), fromBench(), listCard(), quickSell(), quickSellValue(), toBench(), where()

### Community 34 - "183 clip di animazione (84 giocatore, 99 portiere)"
Cohesion: 0.33
Nodes (6): 3 clip del walkout (strikers_nis.npz), 183 clip di animazione (84 giocatore, 99 portiere), Clip captain_shoot_to_score e gk_s2s_*, animation/data/strikers_nis.npz, animation/data/strikers_source.npz, 3 clip del walkout dalle scene .nis

### Community 35 - "value"
Cohesion: 0.33
Nodes (7): hash(), value(), cpuRating(), fair(), offers(), opponent(), today()

### Community 36 - "Le 4 coppe (citazioni ironiche ai giochi PS2)"
Cohesion: 0.29
Nodes (5): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia)

### Community 37 - "Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori)"
Cohesion: 0.40
Nodes (4): Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori), Torneo privato, Voto della coppa D-C-B-A-S-Z (stile Dragon Ball), Rubinetti: da dove arrivano i crediti

## Knowledge Gaps
- **71 isolated node(s):** `cPoseAccumulator::BuildNodeMatrices`, `Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit)`, `Cosa resta da misurare (mesh, telecamera, tiri dei gregari)`, `Fonti: main.dol G4QP01 e smstrikers-decomp`, `GoalPostDimensions.ini (porte per stadio)` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 238 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `game/assets/roster.json` connect `Personaggi (characters/README.md)` to `nis.py`, `Stato al passaggio di consegne`, `Calcio arcade: istruzioni per Claude`, `main.js`?**
  _High betweenness centrality (0.269) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `boot()` (e.g. with `.tick()` and `.show()`) actually correct?**
  _`boot()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `cPoseAccumulator::BuildNodeMatrices`, `Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit)`, `Cosa resta da misurare (mesh, telecamera, tiri dei gregari)` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.07063063063063063 - nodes in this community are weakly interconnected._
- **Why does `Gioco (area)` connect `main.js` to `make_map.py`, `build.mjs`, `Super Mario Strikers: misure e dinamiche di riferimento`, `input.js`, `Personaggi (characters/README.md)`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.08612836438923395 - nodes in this community are weakly interconnected._
- **Why does `Calcio arcade (progetto)` connect `make_map.py` to `Interfaccia gioco: decisioni prese con l'utente`, `main.js`, `build.mjs`, `Ultimate Team (README)`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._