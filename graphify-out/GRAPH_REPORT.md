# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- 61 files · ~88,297 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 990 nodes · 2166 edges · 44 communities (42 shown, 2 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 185 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af1d3ef6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Game
- t
- main.js
- menu.js
- strikers_anim.py
- Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)
- build.mjs
- nis.py
- retarget.py
- utMenu.js
- club.js
- Pose
- math
- Regole del progetto
- Super Mario Strikers: misure e dinamiche di riferimento
- test_converter.py
- input.js
- Scelte di dettaglio (31 ottobre)
- Animazioni (area, clip controllate su 20 personaggi)
- Stato al passaggio di consegne
- Stadium
- strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)
- make_map.py
- Personaggi (characters/README.md)
- Interfaccia gioco: decisioni prese con l'utente
- Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku)
- Gioco (README)
- Super Strike
- Ultimate Team (README)
- Come funzionano i giochi di questo tipo (FC e gacha)
- economy_sim.py
- Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)
- Calcio arcade (progetto)
- drawCard
- Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)
- WalkoutStage
- Ultimate Team: decisioni prese con l'utente
- Clip
- value
- Aggiungere un personaggio (procedura)
- tradable
- Le 4 coppe (citazioni ironiche ai giochi PS2)
- Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)
- Economia di Ultimate Team (crediti, pacchetti, mercato)

## God Nodes (most connected - your core abstractions)
1. `Game` - 56 edges
2. `t()` - 47 edges
3. `Menu` - 39 edges
4. `Player` - 26 edges
5. `Gioco (README)` - 26 edges
6. `boot()` - 23 edges
7. `installCups()` - 23 edges
8. `import_into_blender()` - 20 edges
9. `UiNav` - 19 edges
10. `Stato al passaggio di consegne` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Carte con ritratto a mezzo busto calcolato dalla posa` --references--> `makePortraits()`  [INFERRED]
  interfaccia-gioco/README.md → game/src/main.js
- `PadMenus: menu con il controller` --references--> `PadMenus`  [EXTRACTED]
  interfaccia-gioco/README.md → game/src/input.js
- `Scheletro Mixamo (mixamorig:Hips...), metri, verso +Z` --semantically_similar_to--> `Scheletro Mixamo`  [INFERRED] [semantically similar]
  characters/README.md → animation/README.md
- `Parata decisa dal tempo del tuffo` --semantically_similar_to--> `Portieri: parata dal tempo del tuffo`  [INFERRED] [semantically similar]
  CLAUDE.md → game/README.md
- `Valutazione carte: bronzo <65, argento 65-74, oro >=75, numerate >=85` --conceptually_related_to--> `Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)`  [INFERRED]
  characters/README.md → ultimate-team/DESIGN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Chosen holo finishes** — interfaccia_gioco_bozze_bozze_menu_h1_arcobaleno, interfaccia_gioco_bozze_bozze_menu_h3_glitter, interfaccia_gioco_bozze_bozze_menu_h4_lava, interfaccia_gioco_bozze_bozze_menu_h6_prisma, interfaccia_gioco_bozze_bozze_menu_h5_galassia [EXTRACTED 1.00]
- **Menu input flow (keyboard/gamepad to tab, focus, enter, back)** — interfaccia_gioco_bozze_bozze_menu_pad, interfaccia_gioco_bozze_bozze_menu_shift, interfaccia_gioco_bozze_bozze_menu_press, interfaccia_gioco_bozze_bozze_menu_back, interfaccia_gioco_bozze_bozze_menu_movefocus, interfaccia_gioco_bozze_bozze_menu_render [EXTRACTED 1.00]
- **Pack opening flow (run, walkout/tear/crate, showCard, sleeve)** — interfaccia_gioco_bozze_bozze_menu_run, interfaccia_gioco_bozze_bozze_menu_walkout, interfaccia_gioco_bozze_bozze_menu_tear, interfaccia_gioco_bozze_bozze_menu_crate, interfaccia_gioco_bozze_bozze_menu_showcard, interfaccia_gioco_bozze_bozze_menu_sleeve [EXTRACTED 1.00]
- **Generazione mappa dalle sezioni Stato** — docs_make_map, readme_area_stato_section, readme_project_map_table, docs_grafo_mappa_html, githooks_pre_commit [EXTRACTED 1.00]
- **Pipeline di un nuovo personaggio (glb, retarget, roster, carta, nome, prove)** — characters_readme_aggiungere_un_personaggio, characters_readme_add_characters_py, characters_readme_roster_json, characters_readme_cards_json, characters_readme_i18n_ut_js, characters_readme_prove [EXTRACTED 1.00]
- **Pubblicazione del gioco (Artifact privato in piu passi e itch.io ristretto)** — claude_aggiorna_link_online, claude_artifact_privato_del_gioco, claude_limite_64_mb, claude_itch_io_ristretto, game_readme_web_build, game_readme_itch_build [EXTRACTED 1.00]
- **Walkout: scene .nis decodificate, clip retargettate, palco 3D** — animation_readme_nis, animation_readme_strikers_nis_npz, animation_readme_walkout_clips, animation_readme_walkout_json, ultimate_team_design_walkout, ultimate_team_design_esultanze_nis [INFERRED 0.85]

## Communities (44 total, 2 thin omitted)

### Community 0 - "Game"
Cohesion: 0.07
Nodes (5): shootAtFast(), Game, AnimViewer, Player, seekSpeed()

### Community 1 - "t"
Cohesion: 0.07
Nodes (13): Tracker, Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause() (+5 more)

### Community 2 - "main.js"
Cohesion: 0.06
Nodes (50): Pagina sviluppo gioco senza build (dev/index.html), bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v, Ball (+42 more)

### Community 3 - "menu.js"
Cohesion: 0.07
Nodes (50): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+42 more)

### Community 4 - "strikers_anim.py"
Cohesion: 0.09
Nodes (24): _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk, clip_states(), _common_args(), _cstr() (+16 more)

### Community 5 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 6 - "build.mjs"
Cohesion: 0.05
Nodes (30): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+22 more)

### Community 7 - "nis.py"
Cohesion: 0.09
Nodes (21): check_rig(), main(), angle(), audit(), model_frames(), world(), rot_angle(), sample() (+13 more)

### Community 8 - "retarget.py"
Cohesion: 0.08
Nodes (18): calibrate(), frame_from(), lowest_offset(), R(), main(), mat_to_quat(), open_source(), orthonormal() (+10 more)

### Community 9 - "utMenu.js"
Cohesion: 0.12
Nodes (24): getLang(), BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles(), nmSize(), PACK_COLORS (+16 more)

### Community 10 - "club.js"
Cohesion: 0.12
Nodes (19): hash(), autoSquad(), canPlace(), cardOf(), clubOf(), cpuRating(), DIVISIONS, inst() (+11 more)

### Community 11 - "Pose"
Cohesion: 0.11
Nodes (12): contact_time(), dump_json(), _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat() (+4 more)

### Community 12 - "math"
Cohesion: 0.18
Nodes (12): string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+4 more)

### Community 13 - "Regole del progetto"
Cohesion: 0.12
Nodes (17): Aggiornare il grafo dopo modifiche, Aggiornare link online dopo ogni modifica (piu passi, max 10 personaggi), Artifact privato del gioco (build di prova), Chat delle animazioni (in pausa, animazioni delle ulti), Chat dei 20 nuovi personaggi .glb (ramo charming-mayer, 5 su 20), Chat delle regole del gioco (ramo magical-ride, VERIFICA.md, strikers_triggers.json), Dove andare (tabella aree), Regole graphify (+9 more)

### Community 14 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.13
Nodes (17): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+9 more)

### Community 15 - "test_converter.py"
Cohesion: 0.18
Nodes (11): world_mats(), check(), close(), game_world(), mul_rows(), qclose(), quat_rows(), test_blender() (+3 more)

### Community 16 - "input.js"
Cohesion: 0.19
Nodes (9): Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads(), el() (+1 more)

### Community 17 - "Scelte di dettaglio (31 ottobre)"
Cohesion: 0.20
Nodes (12): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Obiettivi del giorno (400 crediti l'uno), 4 statistiche per carta (VEL TIR PAS CON / PAR RIF USC VEL), 75 = originale, Regole (club nel profilo, niente intesa, niente soldi veri), Scelte di dettaglio (31 ottobre) (+4 more)

### Community 18 - "Animazioni (area, clip controllate su 20 personaggi)"
Cohesion: 0.18
Nodes (16): add_characters.py (retarget e registrazione nel roster), Animazioni (area, clip controllate su 20 personaggi), Scheletro Biped originale (Bip01), WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner), Scheletro Mixamo, nis.py (decodifica scene .nis e walkout), retarget.py (retarget Biped -> Mixamo), strikers_nis.npz (scene .nis decodificate) (+8 more)

### Community 19 - "Stato al passaggio di consegne"
Cohesion: 0.12
Nodes (17): audit.py (controllo automatico clip), Risultati audit portiere (ground_float, dir Spine1), game/dev/sheet.html (controllo a occhio), 183 clip (84 giocatore, 99 portiere), Cinque ruoli per squadra, Controller Xbox stile EA FC, Pagina di sviluppo servita dalla cartella principale, Pallone raggio 0,13 m (+9 more)

### Community 20 - "Stadium"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 21 - "strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)"
Cohesion: 0.14
Nodes (14): Convertitore per Blender (add-on e terminale), Nomi ossa da hash nlStringLowerHash, cPoseAccumulator::BuildNodeMatrices, Comandi info / bvh / json di strikers_anim.py, Formati del disco .shier/.sanim/.bin, Rifare il pacchetto dal disco (retarget.py --export), Disco europeo G4QP01, Limiti noti del convertitore (posa di riposo, fotogrammi chiave, morph, .trg) (+6 more)

### Community 22 - "make_map.py"
Cohesion: 0.19
Nodes (7): AREAS in make_map.py, area_of(), kind_of(), last_update(), main(), read_status(), write_readme_table()

### Community 23 - "Personaggi (characters/README.md)"
Cohesion: 0.16
Nodes (14): Celestini (squadra), Altezza uguale per i giocatori di movimento (FIELDER.height), Personaggi (characters/README.md), recolor in roster.json (oggi false), Rivali, game/assets/roster.json, Stato personaggi: completo (20 personaggi), Tabella dei 20 modelli .glb (+6 more)

### Community 24 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.18
Nodes (14): Interfaccia gioco stile FC, Partita in due, Interfaccia gioco: decisioni prese con l'utente, Avvio del gioco (lingua, profilo), Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Lingue italiano e inglese in file di traduzioni, Navigazione stile FC (barra LB/RB, percorso, B indietro) (+6 more)

### Community 25 - "Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku)"
Cohesion: 0.19
Nodes (12): Squadra pronta Avventurieri (Piccolo in porta), Campo team della carta (nazionale nel walkout), Carta in ultimate-team/data/cards.json, Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku), squads in roster.json (Leggende, Nazionali, Avventurieri), teams: posti 0-3 movimento, 4 portiere, Valutazione carte: bronzo <65, argento 65-74, oro >=75, numerate >=85, Squadra pronta Avventurieri (+4 more)

### Community 26 - "Gioco (README)"
Cohesion: 0.18
Nodes (13): Azioni (passaggi, tiro, scivolate, finte), IA: uno pressa, uno marca, altri in posizione, Velocita animazioni adattata (0,6-1,4x), Fisica del pallone, Pallone oltre 50 m/s, Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m, Passo fisso 50 Hz con interpolazione, Gioco (README) (+5 more)

### Community 27 - "Super Strike"
Cohesion: 0.18
Nodes (12): Capitano, Scelta squadra ed editor della formazione, Indicatore G1-G4 stile FIFA, Super Strike, Super Strike (comandi), Comandi controller Xbox, makePortraits(), Indicatore G1-G4 e barra della Super Strike in partita (+4 more)

### Community 28 - "Ultimate Team (README)"
Cohesion: 0.27
Nodes (10): Server privato (Oracle), Modulo save (profili nel browser, poi server privato), Teche: graduata blu notte e oro (L3b), nera con bordo oro (L4), Numerata 1-10 (10 copie, teca graduata L3b), Registro comune delle numerate (browser, poi server), Ultimate Team (README), data/cards.json (ruolo e 4 statistiche), Con cosa si collega (roster, main.js statsFor, save.js, nis.py) (+2 more)

### Community 29 - "Come funzionano i giochi di questo tipo (FC e gacha)"
Cohesion: 0.22
Nodes (6): Dentro una rarita le carte forti sono piu rare (probabilita dimezzata ogni 3 punti), Come funzionano i giochi di questo tipo (FC e gacha), Rubinetti: da dove arrivano i crediti, Mercato simulato (prezzi, comprare 110-160%, vendere, tassa 5%), Negozio di pacchetti (Bronzo, Argento, Oro, Oro Premium, Holo), Probabilita dichiarate nel negozio

### Community 30 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 31 - "Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)"
Cohesion: 0.17
Nodes (13): Ricompila e prova (build, playtest, uttest), Build e partita CPU contro CPU dopo ogni modifica, Limite 64 MB per pubblicazione (97 MB in passi da 10 personaggi), Build di prova --prova (10 milioni di crediti), Link online (privato), Altre prove (squadtest, supertest, packtest), Prova automatica playtest, Prova Ultimate Team uttest (+5 more)

### Community 32 - "Calcio arcade (progetto)"
Cohesion: 0.22
Nodes (8): Grafo e mappa del progetto, graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, docs/mappa.html, Sezione Stato dei README (fonte della mappa), Calcio arcade (progetto), Repository GitHub TankDrugo/Strikers, Tabella aree del progetto (scritta da make_map.py)

### Community 33 - "drawCard"
Cohesion: 0.20
Nodes (10): cardsOf(), addCard(), albumPage(), albumRewards(), buyOffer(), buyPack(), drawCard(), drawRarity() (+2 more)

### Community 34 - "Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)"
Cohesion: 0.40
Nodes (6): Coppe complete, Obiettivi stella con il colpo speciale (non ancora nel gioco), Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori), Stelle e obiettivi (1-3 stelle per partita, Normale/Difficile), Torneo privato, Voto della coppa D-C-B-A-S-Z (stile Dragon Ball)

### Community 36 - "Ultimate Team: decisioni prese con l'utente"
Cohesion: 0.18
Nodes (13): Bozze (pagina di prova Artifact, bozze-menu.html), Holo scelti: Arcobaleno, Glitter, Lava, Prisma, Galassia, Menu M1 Cartoon tropicale, Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Pacchetti P1 walkout a indizi, Scelte sulle bozze (M1, holo, L3b, L4, P1), Ultimate Team: decisioni prese con l'utente, Apertura dei pacchetti P1 walkout a indizi (+5 more)

### Community 38 - "value"
Cohesion: 0.29
Nodes (8): value(), daily(), divisionResult(), fair(), fillDays(), offers(), today(), trackDaily()

### Community 39 - "Aggiungere un personaggio (procedura)"
Cohesion: 0.33
Nodes (7): add_characters.py --audit (retarget 183 clip), Aggiungere un personaggio (procedura), Nome carta in i18n_ut.js (ut.char.<id>), dev/sheet.html: confronto con lo scheletro originale, Visualizzatore animazioni (Impostazioni), Retarget delle 3 clip del walkout, Visualizzatore delle 183 animazioni

### Community 40 - "tradable"
Cohesion: 0.33
Nodes (7): tradable(), fromBench(), listCard(), quickSell(), quickSellValue(), toBench(), where()

### Community 41 - "Le 4 coppe (citazioni ironiche ai giochi PS2)"
Cohesion: 0.29
Nodes (7): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Le 4 coppe (citazioni ironiche ai giochi PS2), Stile grafico cartoon anni 2000 con richiami PS2, Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia)

### Community 42 - "Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)"
Cohesion: 0.67
Nodes (3): *.clips.json (metadati clip), Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati), Root motion

### Community 43 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.39
Nodes (8): Economia di Ultimate Team (crediti, pacchetti, mercato), Confronto con FC (all'ora di gioco), Da tarare dopo, giocando (20 personaggi oggi, curva per 40), data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia), Fonti (EA, futmind, gacha), Cosa dice la simulazione (strategia A Oro Premium, B Holo), data/economy.json e simulatore economy_sim.py

## Knowledge Gaps
- **76 isolated node(s):** `Regole graphify`, `Misure da STRIKERS_REFERENCE`, `Sezione ## Stato dei README`, `Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection)`, `Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit)` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 249 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tabella aree del progetto (scritta da make_map.py)` connect `Calcio arcade (progetto)` to `Animazioni (area, clip controllate su 20 personaggi)`, `strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)`, `make_map.py`, `Personaggi (characters/README.md)`, `Gioco (README)`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **What connects `Regole graphify`, `Misure da STRIKERS_REFERENCE`, `Sezione ## Stato dei README` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.06504065040650407 - nodes in this community are weakly interconnected._
- **Why does `Calcio arcade (progetto)` connect `Calcio arcade (progetto)` to `build.mjs`, `Regole del progetto`, `Animazioni (area, clip controllate su 20 personaggi)`, `Personaggi (characters/README.md)`, `Interfaccia gioco: decisioni prese con l'utente`, `Gioco (README)`, `Ultimate Team (README)`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.0727036676403765 - nodes in this community are weakly interconnected._
- **Why does `Riferimento: il gioco originale` connect `strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)` to `Calcio arcade (progetto)`, `main.js`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0647887323943662 - nodes in this community are weakly interconnected._