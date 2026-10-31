# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 941 nodes · 2031 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 189 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e90193d0`
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
- FormatError
- Aggiungere un personaggio
- Stadium
- Interfaccia gioco: decisioni prese con l'utente
- game/assets/roster.json
- Aggiungere un personaggio
- cards.js
- Ultimate Team: decisioni prese con l'utente
- Scelte di dettaglio (31 ottobre)
- Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti)
- Ball
- economy_sim.py
- strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)
- Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)
- Economia di Ultimate Team (crediti, pacchetti, mercato)
- Stato al passaggio di consegne
- Gioco (area)
- tradable
- Animazioni (area)
- value
- Le 4 coppe (citazioni ironiche ai giochi PS2)
- Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori)
- retarget_clip
- AnimViewer
- Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)
- IA: uno pressa, uno marca, gli altri tengono posizione
- Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m
- src/hud.js (punteggio, tempo, barra del tiro)

## God Nodes (most connected - your core abstractions)
1. `Game` - 47 edges
2. `t()` - 40 edges
3. `Menu` - 38 edges
4. `Player` - 25 edges
5. `boot()` - 23 edges
6. `import_into_blender()` - 20 edges
7. `UiNav` - 19 edges
8. `installCups()` - 19 edges
9. `test_decode()` - 17 edges
10. `Pose` - 16 edges

## Surprising Connections (you probably didn't know these)
- `3 clip del walkout (strikers_nis.npz)` --semantically_similar_to--> `Clip walkout (nis_run, nis_win_high, nis_win_low)`  [INFERRED] [semantically similar]
  characters/README.md → animation/README.md
- `3 clip del walkout dalle scene .nis` --semantically_similar_to--> `Clip walkout (nis_run, nis_win_high, nis_win_low)`  [INFERRED] [semantically similar]
  CLAUDE.md → animation/README.md
- `Comandi controller Xbox stile EA FC o tastiera` --semantically_similar_to--> `Comandi controller Xbox (stile EA FC)`  [INFERRED] [semantically similar]
  CLAUDE.md → game/README.md
- `game/dev/sheet.html (controllo a occhio)` --semantically_similar_to--> `game/dev/sheet.html (confronto fotogramma per fotogramma)`  [INFERRED] [semantically similar]
  animation/README.md → characters/README.md
- `Visualizzatore animazioni (Impostazioni)` --semantically_similar_to--> `Visualizzatore animazioni`  [INFERRED] [semantically similar]
  characters/README.md → game/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Procedura per aggiungere un personaggio (retarget, roster, carte, testi, prove)** — characters_readme_aggiungere_un_personaggio, characters_readme_add_characters_py, characters_readme_roster_json, characters_readme_cards_json, characters_readme_i18n_ut_js, characters_readme_prove [EXTRACTED 1.00]
- **Le 4 coppe come citazioni ai giochi PS2** — interfaccia_gioco_design_coppa_scimmie_in_fuga, interfaccia_gioco_design_gran_premio_pazzo_pazzo, interfaccia_gioco_design_coppa_lost_heaven, interfaccia_gioco_design_coppa_bullone_galattico [EXTRACTED 1.00]
- **Simulazione a passo fisso 50 Hz con disegno interpolato** — game_readme_fixed_step_50hz, game_readme_game_js, game_readme_player_js, game_readme_ball_js [EXTRACTED 1.00]
- **Chosen holo finishes** — interfaccia_gioco_bozze_bozze_menu_h1_arcobaleno, interfaccia_gioco_bozze_bozze_menu_h3_glitter, interfaccia_gioco_bozze_bozze_menu_h4_lava, interfaccia_gioco_bozze_bozze_menu_h6_prisma, interfaccia_gioco_bozze_bozze_menu_h5_galassia [EXTRACTED 1.00]
- **Menu input flow (keyboard/gamepad to tab, focus, enter, back)** — interfaccia_gioco_bozze_bozze_menu_pad, interfaccia_gioco_bozze_bozze_menu_shift, interfaccia_gioco_bozze_bozze_menu_press, interfaccia_gioco_bozze_bozze_menu_back, interfaccia_gioco_bozze_bozze_menu_movefocus, interfaccia_gioco_bozze_bozze_menu_render [EXTRACTED 1.00]
- **Pack opening flow (run, walkout/tear/crate, showCard, sleeve)** — interfaccia_gioco_bozze_bozze_menu_run, interfaccia_gioco_bozze_bozze_menu_walkout, interfaccia_gioco_bozze_bozze_menu_tear, interfaccia_gioco_bozze_bozze_menu_crate, interfaccia_gioco_bozze_bozze_menu_showcard, interfaccia_gioco_bozze_bozze_menu_sleeve [EXTRACTED 1.00]
- **Generazione mappa dalle sezioni Stato** — docs_make_map, readme_area_stato_section, readme_project_map_table, docs_grafo_mappa_html, githooks_pre_commit [EXTRACTED 1.00]
- **Principi dell'economia presi da FC e gacha** — ultimate_team_economia_rubinetti_e_scarichi, ultimate_team_economia_inizio_veloce_fine_lenta, ultimate_team_economia_carte_forti_piu_rare, ultimate_team_economia_sorpresa_vs_certezza, ultimate_team_economia_pity, ultimate_team_economia_probabilita_dichiarate [EXTRACTED 1.00]
- **Pipeline animazioni: decodifica disco -> npz -> retarget Mixamo -> audit** — animation_readme_strikers_anim, animation_readme_strikers_source_npz, animation_readme_retarget, animation_readme_add_characters, animation_readme_audit [INFERRED 0.85]
- **Apertura pacchetti P1: indizi, walkout 3D con esultanze NIS, teca per numerate** — ultimate_team_design_apertura_pacchetti, ultimate_team_design_walkout, ultimate_team_design_esultanze_nis, interfaccia_gioco_design_teche_l3b_l4, game_src_ut_walkout3d [INFERRED 0.85]

## Communities (44 total, 5 thin omitted)

### Community 0 - "Game"
Cohesion: 0.09
Nodes (6): predict(), shootAtFast(), Game, angleDiff(), seekDirection(), seekSpeed()

### Community 1 - "t"
Cohesion: 0.08
Nodes (13): Tracker, Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause() (+5 more)

### Community 2 - "main.js"
Cohesion: 0.06
Nodes (45): Pagina sviluppo gioco senza build (dev/index.html), bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v, tmp (+37 more)

### Community 3 - "menu.js"
Cohesion: 0.06
Nodes (47): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+39 more)

### Community 4 - "make_map.py"
Cohesion: 0.12
Nodes (11): AREAS in make_map.py, Grafo e mappa del progetto, graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, docs/mappa.html, area_of(), kind_of(), last_update() (+3 more)

### Community 5 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 6 - "retarget.py"
Cohesion: 0.09
Nodes (12): calibrate(), frame_from(), Glb, main(), open_source(), quat_to_mat(), Rig, root_motion() (+4 more)

### Community 7 - "strikers_anim.py"
Cohesion: 0.14
Nodes (18): _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), clip_states(), _common_args(), import_into_blender(), load_chunks() (+10 more)

### Community 8 - "nis.py"
Cohesion: 0.11
Nodes (18): check_rig(), main(), angle(), audit(), model_frames(), world(), rot_angle(), sample() (+10 more)

### Community 9 - "club.js"
Cohesion: 0.11
Nodes (22): cardsOf(), addCard(), albumPage(), albumRewards(), buyOffer(), buyPack(), clubOf(), daily() (+14 more)

### Community 10 - "math"
Cohesion: 0.13
Nodes (12): dump_json(), _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat(), rest_offsets() (+4 more)

### Community 11 - "build.mjs"
Cohesion: 0.06
Nodes (25): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+17 more)

### Community 12 - "test_converter.py"
Cohesion: 0.13
Nodes (12): world_mats(), cPoseAccumulator::BuildNodeMatrices, contact_time(), strikers_frames(), check(), close(), game_world(), mul_rows() (+4 more)

### Community 13 - "utMenu.js"
Cohesion: 0.20
Nodes (17): addStrings(), getLang(), STRINGS, BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles() (+9 more)

### Community 14 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.13
Nodes (17): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+9 more)

### Community 15 - "make_sample.py"
Cohesion: 0.18
Nodes (12): string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+4 more)

### Community 16 - "FormatError"
Cohesion: 0.09
Nodes (10): decode(), read_camera(), Chunk, Clip, _cstr(), FormatError, Retargets, Skeleton (+2 more)

### Community 17 - "Aggiungere un personaggio"
Cohesion: 0.16
Nodes (13): Ricompila e prova (build.mjs, playtest.cjs, uttest.cjs), Artifact privato del gioco (Ru4U9NJSLMxgRX2bcmH9HH), Limite 64 MB per pubblicazione del link online, Nuovi personaggi (.glb Mixamo), Peso del gioco compilato (~91 MB, ~9 MB per personaggio), Regole del progetto, Sezione ## Stato dei README (stato, Fatto, Prossimo), tools/build.mjs (crea dist/gioco.html) (+5 more)

### Community 18 - "Stadium"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 19 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.13
Nodes (11): Interfaccia gioco: decisioni prese con l'utente, Avvio del gioco (lingua, profilo), Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Interfaccia gioco (README), Con cosa si collega (Ultimate Team, roster.json, input.js), HUD in partita (punteggio, tempo, barra del tiro), PadMenus: navigazione menu col controller (+3 more)

### Community 20 - "game/assets/roster.json"
Cohesion: 0.14
Nodes (18): Celestini, recolor in roster.json, Rivali, game/assets/roster.json, Modelli <squadra>_<ruolo>.glb (10 personaggi), teamInfo (color, shirt), teams in roster.json (posti 0-4), Copie con texture ridotte in game/assets/characters/ (+10 more)

### Community 21 - "Aggiungere un personaggio"
Cohesion: 0.13
Nodes (16): game/dev/sheet.html (controllo a occhio), Aggiungere un personaggio, ultimate-team/data/cards.json (characters), game/src/ui/i18n_ut.js (ut.char.<id>), Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ), game/dev/sheet.html (confronto fotogramma per fotogramma), Valutazione carte (bronzo <65, argento 65-74, oro >=75, numerate >=85), Coppe complete (stelle, Difficile, voto D-Z, tornei fino a 4) (+8 more)

### Community 22 - "cards.js"
Cohesion: 0.18
Nodes (8): avgOvr, CARD, CATALOG, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

### Community 23 - "Ultimate Team: decisioni prese con l'utente"
Cohesion: 0.18
Nodes (11): Bozze (pagina di prova Artifact, bozze-menu.html), Holo scelti: Arcobaleno, Glitter, Lava, Prisma, Galassia, Menu M1 Cartoon tropicale, Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Pacchetti P1 walkout a indizi, Scelte sulle bozze (M1, holo, L3b, L4, P1), Ultimate Team: decisioni prese con l'utente, Apertura dei pacchetti P1 walkout a indizi (+3 more)

### Community 24 - "Scelte di dettaglio (31 ottobre)"
Cohesion: 0.22
Nodes (8): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Obiettivi del giorno (400 crediti l'uno), Personaggi singoli con nazionale (Goku SSJ, Goku, Crilin, Big Smoke, Dastardly), Scelte di dettaglio (31 ottobre), Valutazioni base dei 10 personaggi (Celestini, Rivali), data/cards.json (carte e statistiche base), Dove sta il codice (cards.js, club.js, walkout3d.js, utMenu.js, utCards.js, stats.js)

### Community 25 - "Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti)"
Cohesion: 0.18
Nodes (12): FIELDER.height in game/src/config.js, game/dev/index.html (pagina di sviluppo), BALL.radius: pallone 0,13 m, SIZE: giocatori 1,3 volte l'originale, game/src/stats.js (carte cambiano il gioco, 75 = originale), Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti), ultimate-team/data/*.json, ultimate-team/DESIGN.md e ECONOMIA.md (+4 more)

### Community 27 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 28 - "strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)"
Cohesion: 0.18
Nodes (11): Nomi ossa da hash nlStringLowerHash, Comandi info / bvh / json di strikers_anim.py, Formati del disco .shier/.sanim/.bin, Rifare il pacchetto dal disco (retarget.py --export), Disco europeo G4QP01, Limiti noti del convertitore (posa di riposo, fotogrammi chiave, morph, .trg), smstrikers-decomp (yannicksuter, commit d1f357f), strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender) (+3 more)

### Community 29 - "Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)"
Cohesion: 0.22
Nodes (10): Risultati audit portiere (ground_float, dir Spine1), Scheletro Biped originale (Bip01), Convertitore per Blender (add-on e terminale), *.clips.json (metadati clip), Clip specchiate (_mirror, direzioni 0900), Scheletro Mixamo, Root motion, Scheletro Mixamo (mixamorig:Hips...) (+2 more)

### Community 30 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.15
Nodes (12): Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Economia di Ultimate Team (crediti, pacchetti, mercato), Dentro una rarita le carte forti sono piu rare (probabilita dimezzata ogni 3 punti), Come funzionano i giochi di questo tipo (FC e gacha), Confronto con FC (all'ora di gioco), Da tarare dopo, giocando, data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia) (+4 more)

### Community 31 - "Stato al passaggio di consegne"
Cohesion: 0.18
Nodes (10): 183 clip di animazione (84 giocatore, 99 portiere), Parata decisa dal tempo del tuffo, Stato al passaggio di consegne, src/ball.js (fisica pallone, Magnus, urti, gol), Fisica pallone 50 Hz (gravita' -14 m/s2, max 50 m/s), Problema: pallone oltre 50 m/s, src/game.js (partita, passo 50 Hz, umani, cpuLevel), Parata del portiere per tempo del tuffo, non a caso (+2 more)

### Community 32 - "Gioco (area)"
Cohesion: 0.14
Nodes (19): Personaggi (characters/README.md), Stato personaggi: completo, Capitano (scelto nella Rosa, non portiere), Clip captain_shoot_to_score e gk_s2s_*, game/src/ut/club.js e game/src/ui/utMenu.js, Comandi controller Xbox stile EA FC o tastiera, Dove andare (tabella aree e README), reference/STRIKERS_REFERENCE.md (+11 more)

### Community 33 - "tradable"
Cohesion: 0.18
Nodes (13): tradable(), autoSquad(), canPlace(), cardOf(), fromBench(), inst(), listCard(), place() (+5 more)

### Community 34 - "Animazioni (area)"
Cohesion: 0.19
Nodes (15): add_characters.py (retarget e registrazione nel roster), Animazioni (area), audit.py (controllo automatico clip), WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner), nis.py (decodifica scene .nis e walkout), retarget.py (retarget Biped -> Mixamo), strikers_nis.npz (scene .nis decodificate), strikers_source.npz (183 clip decodificate) (+7 more)

### Community 35 - "value"
Cohesion: 0.29
Nodes (8): hash(), value(), cpuRating(), fair(), fillDays(), offers(), opponent(), today()

### Community 36 - "Le 4 coppe (citazioni ironiche ai giochi PS2)"
Cohesion: 0.29
Nodes (5): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia)

### Community 37 - "Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori)"
Cohesion: 0.22
Nodes (7): Obiettivi stella con il colpo speciale (non ancora nel gioco), Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori), Torneo privato, Voto della coppa D-C-B-A-S-Z (stile Dragon Ball), Divisioni (CPU da 58 a 94, nomi hi-tech), Rubinetti: da dove arrivano i crediti, Stagione Divisioni (10 partite, 18 punti si sale, sotto 12 si scende)

### Community 38 - "retarget_clip"
Cohesion: 0.32
Nodes (6): lowest_offset(), R(), mat_to_quat(), orthonormal(), retarget_clip(), W()

### Community 40 - "Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)"
Cohesion: 0.33
Nodes (5): Teche: graduata blu notte e oro (L3b), nera con bordo oro (L4), Numerata 1-10 (10 copie, teca graduata L3b), Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro), 1/1 Oro (teca nera con bordo oro), Varianti delle carte (+2 oro raro ... +10 1/1)

## Knowledge Gaps
- **73 isolated node(s):** `cPoseAccumulator::BuildNodeMatrices`, `Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection)`, `Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit)`, `Cosa resta da misurare (mesh, telecamera, tiri dei gregari)`, `Fonti: main.dol G4QP01 e smstrikers-decomp` (+68 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 229 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Con cosa si collega (roster.json, main.js statsFor, save.js, nis.py)` connect `game/assets/roster.json` to `nis.py`, `main.js`, `menu.js`?**
  _High betweenness centrality (0.337) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `boot()` (e.g. with `.tick()` and `.show()`) actually correct?**
  _`boot()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `cPoseAccumulator::BuildNodeMatrices`, `Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection)`, `Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit)` to the rest of the system?**
  _73 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.08619777895293496 - nodes in this community are weakly interconnected._
- **Why does `Ultimate Team (README)` connect `game/assets/roster.json` to `Gioco (area)`, `build.mjs`, `Ultimate Team: decisioni prese con l'utente`, `Scelte di dettaglio (31 ottobre)`, `economy_sim.py`, `Economia di Ultimate Team (crediti, pacchetti, mercato)`?**
  _High betweenness centrality (0.145) - this node is a cross-community bridge._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.07508771929824562 - nodes in this community are weakly interconnected._
- **Why does `Gioco (area)` connect `Gioco (area)` to `Aggiungere un personaggio`, `game/assets/roster.json`, `Super Mario Strikers: misure e dinamiche di riferimento`, `Stato al passaggio di consegne`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._