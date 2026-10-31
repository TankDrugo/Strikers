# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- 65 files · ~87,887 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 990 nodes · 2162 edges · 43 communities (41 shown, 2 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 185 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- t
- Game
- main.js
- menu.js
- FormatError
- make_map.py
- test_converter.py
- club.js
- make_sample.py
- Super Mario Strikers: misure e dinamiche di riferimento
- Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)
- nis.py
- strikers_anim.py
- Ultimate Team: decisioni prese con l'utente
- Aggiungere un personaggio
- build.mjs
- utMenu.js
- value
- economy_sim.py
- Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti)
- Regole del progetto
- Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)
- retarget.py
- strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)
- game/assets/roster.json
- strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender) (2)
- math
- game.js
- Gioco (area)
- Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)
- Aggiungere un personaggio (procedura)
- test_converter.py (2)
- retarget.py (2)
- Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia) (2)
- src/hud.js (punteggio, tempo, barra del tiro)
- Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m
- Input
- Clip
- Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia) (3)
- Animazioni (area)
- Interfaccia gioco: decisioni prese con l'utente
- Scelte di dettaglio (31 ottobre)
- Rig

## God Nodes (most connected - your core abstractions)
1. `Game` - 56 edges
2. `t()` - 47 edges
3. `Menu` - 39 edges
4. `Player` - 26 edges
5. `Gioco (README)` - 24 edges
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
- `Scelta della squadra e formazione libera con capitano` --semantically_similar_to--> `Scelta squadra ed editor della formazione`  [INFERRED] [semantically similar]
  interfaccia-gioco/README.md → CLAUDE.md
- `Parata decisa dal tempo del tuffo` --semantically_similar_to--> `Portieri: parata dal tempo del tuffo`  [INFERRED] [semantically similar]
  CLAUDE.md → game/README.md
- `Obiettivi stella con il colpo speciale (non ancora nel gioco)` --conceptually_related_to--> `Super Strike`  [INFERRED]
  interfaccia-gioco/DESIGN.md → CLAUDE.md

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

## Communities (43 total, 2 thin omitted)

### Community 0 - "t"
Cohesion: 0.07
Nodes (5): shootAtFast(), Game, AnimViewer, Player, seekSpeed()

### Community 1 - "Game"
Cohesion: 0.07
Nodes (13): Tracker, Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause() (+5 more)

### Community 2 - "main.js"
Cohesion: 0.06
Nodes (50): Pagina sviluppo gioco senza build (dev/index.html), bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v, Ball (+42 more)

### Community 3 - "menu.js"
Cohesion: 0.07
Nodes (50): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+42 more)

### Community 4 - "FormatError"
Cohesion: 0.09
Nodes (24): _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk, clip_states(), _common_args(), _cstr() (+16 more)

### Community 5 - "make_map.py"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 6 - "test_converter.py"
Cohesion: 0.05
Nodes (30): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+22 more)

### Community 7 - "club.js"
Cohesion: 0.09
Nodes (21): check_rig(), main(), angle(), audit(), model_frames(), world(), rot_angle(), sample() (+13 more)

### Community 8 - "make_sample.py"
Cohesion: 0.08
Nodes (18): calibrate(), frame_from(), lowest_offset(), R(), main(), mat_to_quat(), open_source(), orthonormal() (+10 more)

### Community 9 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.12
Nodes (24): getLang(), BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles(), nmSize(), PACK_COLORS (+16 more)

### Community 10 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)"
Cohesion: 0.12
Nodes (19): hash(), autoSquad(), canPlace(), cardOf(), clubOf(), cpuRating(), DIVISIONS, inst() (+11 more)

### Community 11 - "nis.py"
Cohesion: 0.11
Nodes (12): contact_time(), dump_json(), _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat() (+4 more)

### Community 12 - "strikers_anim.py"
Cohesion: 0.18
Nodes (12): string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+4 more)

### Community 13 - "Ultimate Team: decisioni prese con l'utente"
Cohesion: 0.11
Nodes (20): Aggiornare il grafo dopo modifiche, Aggiornare link online dopo ogni modifica (piu passi, max 10 personaggi), Artifact privato del gioco (build di prova), Chat delle animazioni (in pausa, animazioni delle ulti), Chat dei 20 nuovi personaggi .glb (ramo charming-mayer, 5 su 20), Chat delle regole del gioco (ramo magical-ride, VERIFICA.md, strikers_triggers.json), Dove andare (tabella aree), Regole graphify (+12 more)

### Community 14 - "Aggiungere un personaggio"
Cohesion: 0.13
Nodes (17): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+9 more)

### Community 15 - "build.mjs"
Cohesion: 0.18
Nodes (11): world_mats(), check(), close(), game_world(), mul_rows(), qclose(), quat_rows(), test_blender() (+3 more)

### Community 16 - "utMenu.js"
Cohesion: 0.19
Nodes (9): Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads(), el() (+1 more)

### Community 17 - "value"
Cohesion: 0.14
Nodes (18): Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Pacchetti P1 walkout a indizi, Ultimate Team: decisioni prese con l'utente, Album (2.000 per pagina, 25.000 album), Apertura dei pacchetti P1 walkout a indizi, Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Economia (rimando a ECONOMIA.md) (+10 more)

### Community 18 - "economy_sim.py"
Cohesion: 0.18
Nodes (16): add_characters.py (retarget e registrazione nel roster), Animazioni (area, clip controllate su 20 personaggi), Scheletro Biped originale (Bip01), WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner), Scheletro Mixamo, nis.py (decodifica scene .nis e walkout), retarget.py (retarget Biped -> Mixamo), strikers_nis.npz (scene .nis decodificate) (+8 more)

### Community 19 - "Ultimate Team (Club, Rosa, Mercato, Divisioni, Album, pacchetti)"
Cohesion: 0.12
Nodes (17): audit.py (controllo automatico clip), Risultati audit portiere (ground_float, dir Spine1), game/dev/sheet.html (controllo a occhio), 183 clip (84 giocatore, 99 portiere), Cinque ruoli per squadra, Controller Xbox stile EA FC, Pagina di sviluppo servita dalla cartella principale, Pallone raggio 0,13 m (+9 more)

### Community 20 - "Regole del progetto"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 21 - "Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)"
Cohesion: 0.14
Nodes (14): Convertitore per Blender (add-on e terminale), Nomi ossa da hash nlStringLowerHash, cPoseAccumulator::BuildNodeMatrices, Comandi info / bvh / json di strikers_anim.py, Formati del disco .shier/.sanim/.bin, Rifare il pacchetto dal disco (retarget.py --export), Disco europeo G4QP01, Limiti noti del convertitore (posa di riposo, fotogrammi chiave, morph, .trg) (+6 more)

### Community 22 - "retarget.py"
Cohesion: 0.19
Nodes (7): AREAS in make_map.py, area_of(), kind_of(), last_update(), main(), read_status(), write_readme_table()

### Community 23 - "strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)"
Cohesion: 0.16
Nodes (14): Celestini (squadra), Altezza uguale per i giocatori di movimento (FIELDER.height), Personaggi (characters/README.md), recolor in roster.json (oggi false), Rivali, game/assets/roster.json, Stato personaggi: completo (20 personaggi), Tabella dei 20 modelli .glb (+6 more)

### Community 24 - "game/assets/roster.json"
Cohesion: 0.18
Nodes (14): Interfaccia gioco stile FC, Partita in due, Interfaccia gioco: decisioni prese con l'utente, Avvio del gioco (lingua, profilo), Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Lingue italiano e inglese in file di traduzioni, Navigazione stile FC (barra LB/RB, percorso, B indietro) (+6 more)

### Community 25 - "strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender) (2)"
Cohesion: 0.19
Nodes (12): Squadra pronta Avventurieri (Piccolo in porta), Campo team della carta (nazionale nel walkout), Carta in ultimate-team/data/cards.json, Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku), squads in roster.json (Leggende, Nazionali, Avventurieri), teams: posti 0-3 movimento, 4 portiere, Valutazione carte: bronzo <65, argento 65-74, oro >=75, numerate >=85, Squadra pronta Avventurieri (+4 more)

### Community 26 - "math"
Cohesion: 0.18
Nodes (13): Azioni (passaggi, tiro, scivolate, finte), IA: uno pressa, uno marca, altri in posizione, Velocita animazioni adattata (0,6-1,4x), Fisica del pallone, Pallone oltre 50 m/s, Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m, Passo fisso 50 Hz con interpolazione, Gioco (README) (+5 more)

### Community 27 - "game.js"
Cohesion: 0.18
Nodes (12): Capitano, Scelta squadra ed editor della formazione, Indicatore G1-G4 stile FIFA, Super Strike, Super Strike (comandi), Comandi controller Xbox, makePortraits(), Indicatore G1-G4 e barra della Super Strike in partita (+4 more)

### Community 28 - "Gioco (area)"
Cohesion: 0.24
Nodes (12): Server privato (Oracle), Modulo save (profili nel browser, poi server privato), Registro comune delle numerate (browser, poi server), data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia), Cosa dice la simulazione (strategia A Oro Premium, B Holo), Ultimate Team (README), data/cards.json (ruolo e 4 statistiche) (+4 more)

### Community 29 - "Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro)"
Cohesion: 0.23
Nodes (9): Economia di Ultimate Team (crediti, pacchetti, mercato), Dentro una rarita le carte forti sono piu rare (probabilita dimezzata ogni 3 punti), Come funzionano i giochi di questo tipo (FC e gacha), Confronto con FC (all'ora di gioco), Da tarare dopo, giocando (20 personaggi oggi, curva per 40), Fonti (EA, futmind, gacha), Mercato simulato (prezzi, comprare 110-160%, vendere, tassa 5%), Negozio di pacchetti (Bronzo, Argento, Oro, Oro Premium, Holo) (+1 more)

### Community 30 - "Aggiungere un personaggio (procedura)"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 31 - "test_converter.py (2)"
Cohesion: 0.22
Nodes (10): Ricompila e prova (build, playtest, uttest), Build e partita CPU contro CPU dopo ogni modifica, Build di prova --prova (10 milioni di crediti), Altre prove (squadtest, supertest, packtest), Prova automatica playtest, Prova Ultimate Team uttest, Build di prova con 10 milioni di crediti (packtest), Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album) (+2 more)

### Community 32 - "retarget.py (2)"
Cohesion: 0.22
Nodes (8): Grafo e mappa del progetto, graphify-out/graph.json, graphify-out/GRAPH_REPORT.md, docs/mappa.html, Sezione Stato dei README (fonte della mappa), Calcio arcade (progetto), Repository GitHub TankDrugo/Strikers, Tabella aree del progetto (scritta da make_map.py)

### Community 33 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia) (2)"
Cohesion: 0.20
Nodes (10): cardsOf(), addCard(), albumPage(), albumRewards(), buyOffer(), buyPack(), drawCard(), drawRarity() (+2 more)

### Community 34 - "src/hud.js (punteggio, tempo, barra del tiro)"
Cohesion: 0.28
Nodes (7): Coppe complete, Obiettivi stella con il colpo speciale (non ancora nel gioco), Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori), Stelle e obiettivi (1-3 stelle per partita, Normale/Difficile), Torneo privato, Voto della coppa D-C-B-A-S-Z (stile Dragon Ball), Rubinetti: da dove arrivano i crediti

### Community 36 - "Input"
Cohesion: 0.25
Nodes (9): Bozze (pagina di prova Artifact, bozze-menu.html), Holo scelti: Arcobaleno, Glitter, Lava, Prisma, Galassia, Menu M1 Cartoon tropicale, Scelte sulle bozze (M1, holo, L3b, L4, P1), Teche: graduata blu notte e oro (L3b), nera con bordo oro (L4), Numerata 1-10 (10 copie, teca graduata L3b), Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro), 1/1 Oro (teca nera con bordo oro) (+1 more)

### Community 38 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia) (3)"
Cohesion: 0.29
Nodes (8): value(), daily(), divisionResult(), fair(), fillDays(), offers(), today(), trackDaily()

### Community 39 - "Animazioni (area)"
Cohesion: 0.33
Nodes (7): add_characters.py --audit (retarget 183 clip), Aggiungere un personaggio (procedura), Nome carta in i18n_ut.js (ut.char.<id>), dev/sheet.html: confronto con lo scheletro originale, Visualizzatore animazioni (Impostazioni), Retarget delle 3 clip del walkout, Visualizzatore delle 183 animazioni

### Community 40 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.33
Nodes (7): tradable(), fromBench(), listCard(), quickSell(), quickSellValue(), toBench(), where()

### Community 41 - "Scelte di dettaglio (31 ottobre)"
Cohesion: 0.29
Nodes (7): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Le 4 coppe (citazioni ironiche ai giochi PS2), Stile grafico cartoon anni 2000 con richiami PS2, Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia)

### Community 42 - "Rig"
Cohesion: 0.67
Nodes (3): *.clips.json (metadati clip), Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati), Root motion

## Knowledge Gaps
- **76 isolated node(s):** `ShootAtFast (passaggi mirati in forma chiusa)`, `Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection)`, `Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit)`, `Cosa resta da misurare (mesh, telecamera, tiri dei gregari)`, `Fonti: main.dol G4QP01 e smstrikers-decomp` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 249 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tabella aree del progetto (scritta da make_map.py)` connect `retarget.py (2)` to `economy_sim.py`, `Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)`, `retarget.py`, `strikers_anim.py (decodifica .sanim/.shier/.bin, convertitore Blender)`, `math`?**
  _High betweenness centrality (0.288) - this node is a cross-community bridge._
- **What connects `ShootAtFast (passaggi mirati in forma chiusa)`, `Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection)`, `Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit)` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.06504065040650407 - nodes in this community are weakly interconnected._
- **Why does `Riferimento: il gioco originale` connect `Metodo di retarget (calibrazione idle, rotazioni relative, scala altezza, root motion nei metadati)` to `retarget.py (2)`, `main.js`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.0727036676403765 - nodes in this community are weakly interconnected._
- **Why does `Calcio arcade (progetto)` connect `retarget.py (2)` to `test_converter.py`, `economy_sim.py`, `game/assets/roster.json`, `math`, `Gioco (area)`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0647887323943662 - nodes in this community are weakly interconnected._