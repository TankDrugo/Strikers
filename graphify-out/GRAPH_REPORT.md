# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 979 nodes · 2273 edges · 56 communities (49 shown, 7 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 228 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bedf08e7`
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
- Stato al passaggio di consegne
- Interfaccia gioco: decisioni prese con l'utente
- game/assets/roster.json
- Aggiungere un personaggio
- cards.js
- Ultimate Team: decisioni prese con l'utente
- Regole del progetto
- Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti)
- game.js
- economy_sim.py
- strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)
- Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)
- Interfaccia gioco: decisioni prese con l'utente
- field.js
- Gioco (area)
- economy_sim.py
- Animazioni (area)
- Hud
- Le 4 coppe (citazioni ironiche ai giochi PS2)
- Aggiungere un personaggio (procedura)
- AnimViewer
- Tabella del codice del gioco
- Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)
- IA: uno pressa, uno marca, gli altri tengono posizione
- Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m
- src/hud.js (punteggio, tempo, barra del tiro)
- Clip
- boot
- value
- Scelte sulle bozze (M1, holo, L3b, L4, P1)
- Scelte di dettaglio (31 ottobre)
- Rig
- Input
- Le 4 coppe (citazioni ironiche ai giochi PS2)
- json
- Tracker
- listCard
- Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)

## God Nodes (most connected - your core abstractions)
1. `Game` - 57 edges
2. `t()` - 47 edges
3. `Menu` - 39 edges
4. `Tabella del codice del gioco` - 34 edges
5. `Player` - 27 edges
6. `Gioco (area): prototipo 5 contro 5, 15 personaggi` - 25 edges
7. `installCups()` - 23 edges
8. `boot()` - 23 edges
9. `import_into_blender()` - 20 edges
10. `UiNav` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Visualizzatore animazioni (Impostazioni)` --references--> `AnimViewer`  [INFERRED]
  characters/README.md → game/src/main.js
- `Pallone piu piccolo (raggio 0,13 m)` --references--> `BALL`  [INFERRED]
  CLAUDE.md → game/src/config.js
- `Carte con ritratto a mezzo busto stile FUT` --references--> `makePortraits()`  [INFERRED]
  CLAUDE.md → game/src/main.js
- `Carte con ritratto a mezzo busto calcolato dalla posa` --references--> `makePortraits()`  [INFERRED]
  interfaccia-gioco/README.md → game/src/main.js
- `Altezza uguale per i giocatori di movimento (FIELDER.height)` --references--> `FIELDER`  [EXTRACTED]
  characters/README.md → game/src/config.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Procedura per aggiungere un personaggio (retarget, roster, carta, testi, prove)** — characters_readme_aggiungere_un_personaggio, animation_add_characters, characters_readme_roster_json, ultimate_team_data_cards, game_src_ui_i18n_ut, game_tools_playtest, game_tools_uttest [EXTRACTED 1.00]
- **Le 4 coppe come citazioni ai giochi PS2** — interfaccia_gioco_design_coppa_scimmie_in_fuga, interfaccia_gioco_design_gran_premio_pazzo_pazzo, interfaccia_gioco_design_coppa_lost_heaven, interfaccia_gioco_design_coppa_bullone_galattico [EXTRACTED 1.00]
- **Chosen holo finishes** — interfaccia_gioco_bozze_bozze_menu_h1_arcobaleno, interfaccia_gioco_bozze_bozze_menu_h3_glitter, interfaccia_gioco_bozze_bozze_menu_h4_lava, interfaccia_gioco_bozze_bozze_menu_h6_prisma, interfaccia_gioco_bozze_bozze_menu_h5_galassia [EXTRACTED 1.00]
- **Menu input flow (keyboard/gamepad to tab, focus, enter, back)** — interfaccia_gioco_bozze_bozze_menu_pad, interfaccia_gioco_bozze_bozze_menu_shift, interfaccia_gioco_bozze_bozze_menu_press, interfaccia_gioco_bozze_bozze_menu_back, interfaccia_gioco_bozze_bozze_menu_movefocus, interfaccia_gioco_bozze_bozze_menu_render [EXTRACTED 1.00]
- **Pack opening flow (run, walkout/tear/crate, showCard, sleeve)** — interfaccia_gioco_bozze_bozze_menu_run, interfaccia_gioco_bozze_bozze_menu_walkout, interfaccia_gioco_bozze_bozze_menu_tear, interfaccia_gioco_bozze_bozze_menu_crate, interfaccia_gioco_bozze_bozze_menu_showcard, interfaccia_gioco_bozze_bozze_menu_sleeve [EXTRACTED 1.00]
- **Generazione mappa dalle sezioni Stato** — docs_make_map, readme_area_stato_section, readme_project_map_table, docs_grafo_mappa_html, githooks_pre_commit [EXTRACTED 1.00]
- **Principi dell'economia presi da FC e gacha** — ultimate_team_economia_rubinetti_e_scarichi, ultimate_team_economia_inizio_veloce_fine_lenta, ultimate_team_economia_carte_forti_piu_rare, ultimate_team_economia_sorpresa_vs_certezza, ultimate_team_economia_pity, ultimate_team_economia_probabilita_dichiarate [EXTRACTED 1.00]
- **Pipeline animazioni: decodifica disco -> npz -> retarget Mixamo -> audit** — animation_readme_strikers_anim, animation_readme_strikers_source_npz, animation_readme_retarget, animation_readme_add_characters, animation_readme_audit [INFERRED 0.85]
- **Pubblicazione privata del gioco (build di prova, Artifact, limite 64 MB, itch.io ristretto)** — claude_aggiorna_link_online, game_readme_link_online, game_readme_web_build, game_tools_build_prova, claude_limite_64_mb, claude_artifact_privato_del_gioco, claude_itch_io_ristretto [INFERRED 0.85]
- **Super Strike del capitano: regole, config, partita, Rosa, prova** — claude_super_strike, game_readme_super_strike, game_src_config_super, game_src_game_game_cansuper, game_src_game_game_iscaptain, game_src_ut_club_cyclecaptain, game_tools_supertest, reference_strikers_reference_super_strike [INFERRED 0.85]
- **Apertura pacchetti P1: indizi, walkout 3D con esultanze NIS, teca per numerate** — ultimate_team_design_apertura_pacchetti, ultimate_team_design_walkout, ultimate_team_design_esultanze_nis, interfaccia_gioco_design_teche_l3b_l4, game_src_ut_walkout3d [INFERRED 0.85]

## Communities (56 total, 7 thin omitted)

### Community 0 - "Game"
Cohesion: 0.07
Nodes (5): shootAtFast(), Game, Player, seekDirection(), seekSpeed()

### Community 1 - "t"
Cohesion: 0.07
Nodes (52): Scelta squadra ed editor della formazione con capitano, baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES (+44 more)

### Community 2 - "main.js"
Cohesion: 0.05
Nodes (40): Ricompila e prova (build, playtest, uttest), Pagina di sviluppo servita dalla cartella principale, Pagina sviluppo gioco senza build (dev/index.html), dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name (+32 more)

### Community 3 - "menu.js"
Cohesion: 0.12
Nodes (4): t(), esc(), Menu, UiNav

### Community 4 - "make_map.py"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 5 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)"
Cohesion: 0.09
Nodes (30): cardsOf(), addCard(), albumPage(), albumRewards(), autoSquad(), buyOffer(), buyPack(), canPlace() (+22 more)

### Community 6 - "retarget.py"
Cohesion: 0.11
Nodes (15): AREAS in make_map.py, Grafo e mappa del progetto, graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, docs/mappa.html, area_of(), kind_of(), last_update() (+7 more)

### Community 7 - "strikers_anim.py"
Cohesion: 0.13
Nodes (15): world_mats(), cPoseAccumulator::BuildNodeMatrices, contact_time(), strikers_frames(), _quat_to_mat(), check(), close(), game_world() (+7 more)

### Community 8 - "nis.py"
Cohesion: 0.11
Nodes (10): calibrate(), frame_from(), Glb, main(), open_source(), root_motion(), shrink_images(), Source (+2 more)

### Community 9 - "club.js"
Cohesion: 0.15
Nodes (19): Giocatori 1,3 volte piu grandi (SIZE), Velocita delle animazioni adattata (0,6-1,4x), clip specchiate, ANIM_RATE_MAX, ANIM_RATE_MIN, BALL, FIELDER, GOALIE, PASS (+11 more)

### Community 10 - "math"
Cohesion: 0.18
Nodes (11): string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+3 more)

### Community 11 - "build.mjs"
Cohesion: 0.15
Nodes (12): biped_layout(), clip_frames(), decode(), export(), leg_length(), load(), read_camera(), retarget_walkouts() (+4 more)

### Community 12 - "test_converter.py"
Cohesion: 0.12
Nodes (10): dump_json(), _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), rest_offsets(), _unwrap() (+2 more)

### Community 13 - "utMenu.js"
Cohesion: 0.16
Nodes (18): add_characters.py (retarget e registrazione nel roster), Animazioni (area), audit.py (controllo automatico clip), Risultati audit portiere (ground_float, dir Spine1), Scheletro Biped originale (Bip01), Convertitore per Blender (add-on e terminale), WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner), *.clips.json (metadati clip) (+10 more)

### Community 14 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.23
Nodes (17): getLang(), BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles(), nmSize(), PACK_COLORS (+9 more)

### Community 15 - "make_sample.py"
Cohesion: 0.24
Nodes (11): _blender_add_curve(), clip_states(), import_into_blender(), load_chunks(), _load_cli(), load_clips(), load_retargets(), load_skeletons() (+3 more)

### Community 16 - "FormatError"
Cohesion: 0.15
Nodes (17): Azioni: passaggi, pallonetti, tiro caricato 0,66 s, scivolate, spallate, finte, IA: uno pressa, uno marca, gli altri tengono la posizione, Fisica del pallone (gravita -14, max 50 m/s), Problema noto: pallone oltre 50 m/s (fino a 69), Gioco (area): prototipo 5 contro 5, 15 personaggi, Tiro perfetto con effetto Magnus (cBall::Shoot), Non ancora presente: power-up, falli e rigori, suoni veri, Squadre pronte (squads: Leggende, Nazionali) ed editor della formazione (+9 more)

### Community 17 - "Aggiungere un personaggio"
Cohesion: 0.18
Nodes (6): Passo fisso 50 Hz con disegno interpolato, Ball, integrate(), predict(), tmp, PHYSICS_DT

### Community 18 - "Stato al passaggio di consegne"
Cohesion: 0.15
Nodes (16): Celestini, Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ), Rivali, squads in roster.json (Leggende, Nazionali), Tabella dei 15 modelli .glb, teams: posti 0-3 movimento, 4 portiere, 183 clip (84 giocatore, 99 portiere), Celestini (maglia celeste) (+8 more)

### Community 19 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 20 - "game/assets/roster.json"
Cohesion: 0.18
Nodes (15): Scheletro Mixamo, add_characters.py --audit (retarget 183 clip), Altezza uguale per i giocatori di movimento (FIELDER.height), Personaggi (characters/README.md), recolor in roster.json (oggi false), game/assets/roster.json, Scheletro Mixamo (mixamorig:Hips...), metri, verso +Z, teamInfo: color e shirt delle squadre (+7 more)

### Community 21 - "Aggiungere un personaggio"
Cohesion: 0.19
Nodes (7): _biped_names(), _blender_cli(), _blender_fcurve_bag(), _common_args(), main(), register(), _register_addon()

### Community 22 - "cards.js"
Cohesion: 0.16
Nodes (7): Chunk, _cstr(), FormatError, Retargets, Skeleton, top_level_chunks(), _u32()

### Community 23 - "Ultimate Team: decisioni prese con l'utente"
Cohesion: 0.16
Nodes (15): Stato personaggi: completo, Capitano (unico a fare la Super Strike, mai il portiere), Indicatore G1-G4 stile FIFA sopra il giocatore controllato, Carte con ritratto a mezzo busto stile FUT, Server privato (Oracle): salvataggio e registro numerate globali, Sezione ## Stato dei README (letta da make_map.py), Super Strike del capitano (fatta il 31 ottobre), cycleCaptain() (+7 more)

### Community 24 - "Regole del progetto"
Cohesion: 0.17
Nodes (10): Artifact privato del gioco (build di prova, 10 milioni di crediti), Pagina itch.io ristretta per gli amici (butler, goleador0702), Limite di 64 MB per pubblicazione, Nuovi personaggi (.glb Mixamo dell'utente, circa 4,5 MB online ciascuno), Peso: 131 MB compilato, 74 MB online, 54 MB zip itch.io, Prossimi lavori (31 ottobre), Regole del progetto, gioco.html pesa circa 131 MB con 15 personaggi (+2 more)

### Community 25 - "Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti)"
Cohesion: 0.19
Nodes (12): Parata decisa dal tempo del tuffo (circa un tiro su cinque), Parata decisa dal tempo del tuffo, Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Fonti: main.dol G4QP01 e smstrikers-decomp (+4 more)

### Community 26 - "game.js"
Cohesion: 0.26
Nodes (13): bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v, SUPER, TACKLE (+5 more)

### Community 27 - "economy_sim.py"
Cohesion: 0.19
Nodes (13): Ultimate Team giocabile (carte cambiano il gioco, a 75 = originale), Bozze (pagina di prova Artifact, bozze-menu.html), Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Ultimate Team: decisioni prese con l'utente, Economia (rimando a ECONOMIA.md), Sezioni: Club, Rosa, Mercato, Divisioni, Album, Economia di Ultimate Team (crediti, pacchetti, mercato), Confronto con FC (all'ora di gioco) (+5 more)

### Community 28 - "strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)"
Cohesion: 0.19
Nodes (11): MATCH, TEAM_DEFAULTS, PadMenus, fetchOk(), loadAssets(), makeAudio(), makePortraits(), teamMaterials() (+3 more)

### Community 29 - "Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)"
Cohesion: 0.18
Nodes (11): Nomi ossa da hash nlStringLowerHash, Comandi info / bvh / json di strikers_anim.py, Formati del disco .shier/.sanim/.bin, Rifare il pacchetto dal disco (retarget.py --export), Disco europeo G4QP01, Limiti noti del convertitore (posa di riposo, fotogrammi chiave, morph, .trg), smstrikers-decomp (yannicksuter, commit d1f357f), strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender) (+3 more)

### Community 30 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.20
Nodes (9): Coppe complete (stelle, Difficile, voto D-Z, tornei fino a 4), Interfaccia gioco: menu FC, profili, Coppe, Ultimate Team, Interfaccia gioco: decisioni prese con l'utente, Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Interfaccia gioco (README), Ancora da decidere (bozze, nomi coppe, HTML/CSS sopra il canvas), Bozze visive (bozze/, Artifact) (+1 more)

### Community 31 - "field.js"
Cohesion: 0.24
Nodes (9): Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m, FIELD, ballTexture(), buildBallMesh(), buildField(), buildGoals(), pitchTexture(), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore (+1 more)

### Community 32 - "Gioco (area)"
Cohesion: 0.18
Nodes (8): avgOvr, CARD, CATALOG, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

### Community 33 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 34 - "Animazioni (area)"
Cohesion: 0.36
Nodes (6): angle(), audit(), model_frames(), world(), rot_angle(), sample()

### Community 36 - "Le 4 coppe (citazioni ironiche ai giochi PS2)"
Cohesion: 0.22
Nodes (5): Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Dentro una rarita le carte forti sono piu rare (probabilita dimezzata ogni 3 punti), Come funzionano i giochi di questo tipo (FC e gacha), Mercato simulato (prezzi, comprare 110-160%, vendere, tassa 5%), Negozio di pacchetti (Bronzo, Argento, Oro, Oro Premium, Holo)

### Community 37 - "Aggiungere un personaggio (procedura)"
Cohesion: 0.22
Nodes (8): game/dev/sheet.html (controllo a occhio), Aggiungere un personaggio (procedura), Campo team della carta (nazionale nel walkout), Carta in ultimate-team/data/cards.json, Nome carta in i18n_ut.js (ut.char.<id>), dev/sheet.html: confronto con lo scheletro originale, Valutazione carte: bronzo <65, argento 65-74, oro >=75, numerate >=85, Visualizzatore animazioni (Impostazioni)

### Community 38 - "AnimViewer"
Cohesion: 0.36
Nodes (3): Visualizzatore delle 183 animazioni, Partita in due (contro un amico o insieme contro la CPU), AnimViewer

### Community 39 - "Tabella del codice del gioco"
Cohesion: 0.33
Nodes (5): Tabella del codice del gioco, PAD_COLORS, addStrings(), STRINGS, Dove sta il codice (game/src/ut, ui, stats.js)

### Community 40 - "Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)"
Cohesion: 0.42
Nodes (5): PAD, padPressed(), padStick(), readPad(), readPads()

### Community 42 - "Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m"
Cohesion: 0.22
Nodes (7): Obiettivi stella con il colpo speciale (non ancora nel gioco), Coppe (4 coppe a eliminazione diretta, torneo fino a 4 giocatori), Torneo privato, Voto della coppa D-C-B-A-S-Z (stile Dragon Ball), Divisioni (CPU da 58 a 94, nomi hi-tech), Rubinetti: da dove arrivano i crediti, Stagione Divisioni (10 partite, 18 punti si sale, sotto 12 si scende)

### Community 43 - "src/hud.js (punteggio, tempo, barra del tiro)"
Cohesion: 0.32
Nodes (6): lowest_offset(), R(), mat_to_quat(), orthonormal(), retarget_clip(), W()

### Community 45 - "boot"
Cohesion: 0.43
Nodes (6): boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause()

### Community 46 - "value"
Cohesion: 0.29
Nodes (8): hash(), value(), cpuRating(), fair(), fillDays(), offers(), opponent(), today()

### Community 47 - "Scelte sulle bozze (M1, holo, L3b, L4, P1)"
Cohesion: 0.25
Nodes (7): Holo scelti: Arcobaleno, Glitter, Lava, Prisma, Galassia, Menu M1 Cartoon tropicale, Pacchetti P1 walkout a indizi, Scelte sulle bozze (M1, holo, L3b, L4, P1), Apertura dei pacchetti P1 walkout a indizi, animation/data/strikers_nis.npz (da animation/nis.py), Walkout (corsa da camera_establish_home ed esultanza)

### Community 48 - "Scelte di dettaglio (31 ottobre)"
Cohesion: 0.25
Nodes (7): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Obiettivi del giorno (400 crediti l'uno), Personaggi singoli con nazionale (Goku SSJ, Goku, Crilin, Big Smoke, Dastardly), Scelte di dettaglio (31 ottobre), Valutazioni base dei 10 personaggi (Celestini, Rivali), data/economy.json e simulatore economy_sim.py

### Community 51 - "Le 4 coppe (citazioni ironiche ai giochi PS2)"
Cohesion: 0.29
Nodes (5): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia)

### Community 54 - "listCard"
Cohesion: 0.40
Nodes (6): fromBench(), listCard(), quickSell(), quickSellValue(), toBench(), where()

### Community 55 - "Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)"
Cohesion: 0.40
Nodes (5): Teche: graduata blu notte e oro (L3b), nera con bordo oro (L4), Numerata 1-10 (10 copie, teca graduata L3b), Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro), 1/1 Oro (teca nera con bordo oro), Varianti delle carte (+2 oro raro ... +10 1/1)

## Knowledge Gaps
- **56 isolated node(s):** `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `*.clips.json (metadati clip)`, `ShootAtFast (passaggi mirati in forma chiusa)`, `Non ancora presente: power-up, falli e rigori, suoni veri`, `Cinque ruoli (portiere, difensore, centrocampista, ala, attaccante)` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 224 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tabella del codice del gioco` connect `Tabella del codice del gioco` to `Gioco (area)`, `t`, `main.js`, `Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)`, `Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)`, `club.js`, `build.mjs`, `Super Mario Strikers: misure e dinamiche di riferimento`, `FormatError`, `Aggiungere un personaggio`, `Interfaccia gioco: decisioni prese con l'utente`, `json`, `game.js`, `economy_sim.py`, `strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)`, `Interfaccia gioco: decisioni prese con l'utente`, `field.js`?**
  _High betweenness centrality (0.470) - this node is a cross-community bridge._
- **What connects `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `*.clips.json (metadati clip)`, `ShootAtFast (passaggi mirati in forma chiusa)` to the rest of the system?**
  _56 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.07243243243243243 - nodes in this community are weakly interconnected._
- **Why does `Interfaccia gioco: decisioni prese con l'utente` connect `Interfaccia gioco: decisioni prese con l'utente` to `t`, `Tabella del codice del gioco`, `Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m`, `Scelte sulle bozze (M1, holo, L3b, L4, P1)`, `Le 4 coppe (citazioni ironiche ai giochi PS2)`, `Ultimate Team: decisioni prese con l'utente`, `economy_sim.py`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.07139079851930195 - nodes in this community are weakly interconnected._
- **Why does `Bozze (pagina di prova Artifact, bozze-menu.html)` connect `economy_sim.py` to `make_map.py`, `Interfaccia gioco: decisioni prese con l'utente`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.050314465408805034 - nodes in this community are weakly interconnected._