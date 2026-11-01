# Graph Report - Strikers  (2026-11-01)

## Corpus Check
- 68 files · ~118,410 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 1110 nodes · 2451 edges · 54 communities (41 shown, 13 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 186 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `edc34dcf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Game
- player.js
- t
- menu.js
- Stato al passaggio di consegne
- Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)
- build.mjs
- nis.py
- make_map.py
- Keeper
- club.js
- strikers_anim.py
- test_converter.py
- utMenu.js
- Animazioni (area, clip controllate su 25 personaggi)
- drawCard
- Gioco (README)
- Super Mario Strikers: misure e dinamiche di riferimento
- Ultimate Team (README)
- input.js
- Aggiornare link online dopo ogni modifica (passi da 10 personaggi, oggi 3)
- write_skeleton
- Aggiungere un personaggio (procedura)
- Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)
- Player
- Interfaccia gioco: decisioni prese con l'utente
- Scelte di dettaglio (31 ottobre)
- cards.js
- Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)
- audit.py (controllo automatico clip)
- Scelte sulle bozze (M1, holo, L3b, L4, P1)
- economy_sim.py
- stadiums.js
- Clip
- Economia di Ultimate Team (crediti, pacchetti, mercato)
- Come funzionano i giochi di questo tipo (FC e gacha)
- Personaggi (characters/README.md)
- import_into_blender
- Altezza uguale per i giocatori di movimento (FIELDER.height)
- Copie con texture ridotte in game/assets/characters/
- retarget.py
- json
- goalie.js
- Ball
- .play
- main.js
- Regole del progetto
- AnimViewer
- .shootBall
- value
- WalkoutStage
- ai.js
- game.js

## God Nodes (most connected - your core abstractions)
1. `Game` - 74 edges
2. `t()` - 51 edges
3. `Menu` - 39 edges
4. `Player` - 27 edges
5. `installCups()` - 24 edges
6. `boot()` - 23 edges
7. `Gioco (README)` - 23 edges
8. `import_into_blender()` - 20 edges
9. `UiNav` - 19 edges
10. `test_decode()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Carte con ritratto a mezzo busto calcolato dalla posa` --references--> `makePortraits()`  [INFERRED]
  interfaccia-gioco/README.md → game/src/main.js
- `Super Strike (comandi)` --semantically_similar_to--> `Super Strike`  [INFERRED] [semantically similar]
  game/README.md → CLAUDE.md
- `Personaggi singoli con nazionale (Goku SSJ 90, Vegeta 88, Goku, Sora, Piccolo, Ratchet, Jak, Snake, Roxas, Spike, Crilin, Riku, Big Smoke, Dastardly, Kairi)` --semantically_similar_to--> `Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta)`  [INFERRED] [semantically similar]
  ultimate-team/DESIGN.md → characters/README.md
- `Celestini (squadra)` --semantically_similar_to--> `Celestini`  [INFERRED] [semantically similar]
  characters/README.md → CLAUDE.md
- `PadMenus: menu con il controller` --references--> `PadMenus`  [EXTRACTED]
  interfaccia-gioco/README.md → game/src/input.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flusso: dal .glb al personaggio in campo e in Ultimate Team** — characters_readme_aggiungere_un_personaggio, characters_readme_add_characters_py, animation_readme_retarget, characters_readme_roster_json, characters_readme_cards_json, characters_readme_i18n_ut_js, characters_readme_prove [EXTRACTED 1.00]
- **Chosen holo finishes** — interfaccia_gioco_bozze_bozze_menu_h1_arcobaleno, interfaccia_gioco_bozze_bozze_menu_h3_glitter, interfaccia_gioco_bozze_bozze_menu_h4_lava, interfaccia_gioco_bozze_bozze_menu_h6_prisma, interfaccia_gioco_bozze_bozze_menu_h5_galassia [EXTRACTED 1.00]
- **Menu input flow (keyboard/gamepad to tab, focus, enter, back)** — interfaccia_gioco_bozze_bozze_menu_pad, interfaccia_gioco_bozze_bozze_menu_shift, interfaccia_gioco_bozze_bozze_menu_press, interfaccia_gioco_bozze_bozze_menu_back, interfaccia_gioco_bozze_bozze_menu_movefocus, interfaccia_gioco_bozze_bozze_menu_render [EXTRACTED 1.00]
- **Pack opening flow (run, walkout/tear/crate, showCard, sleeve)** — interfaccia_gioco_bozze_bozze_menu_run, interfaccia_gioco_bozze_bozze_menu_walkout, interfaccia_gioco_bozze_bozze_menu_tear, interfaccia_gioco_bozze_bozze_menu_crate, interfaccia_gioco_bozze_bozze_menu_showcard, interfaccia_gioco_bozze_bozze_menu_sleeve [EXTRACTED 1.00]
- **Generazione mappa dalle sezioni Stato** — docs_make_map, readme_area_stato_section, readme_project_map_table, docs_grafo_mappa_html, githooks_pre_commit [EXTRACTED 1.00]
- **Pubblicazione del gioco (Artifact privato in passi, itch.io ristretto)** — claude_aggiorna_link_online, game_readme_web_build, claude_limite_64_mb, claude_artifact_privato_del_gioco, game_readme_itch_build, claude_itch_io_ristretto [EXTRACTED 1.00]
- **Pipeline del walkout (scene .nis -> clip -> palco 3D)** — animation_readme_nis, animation_readme_strikers_nis_npz, animation_readme_walkout_clips, animation_readme_walkout_json, ultimate_team_design_walkout, ultimate_team_readme_walkout_p1 [INFERRED 0.85]

## Communities (54 total, 13 thin omitted)

### Community 1 - "player.js"
Cohesion: 0.21
Nodes (12): ANIM_RATE_MAX, ANIM_RATE_MIN, FIELDER, SIZE, GOLD, LOCO_CYCLES, tmpV, f() (+4 more)

### Community 2 - "t"
Cohesion: 0.07
Nodes (12): Tracker, Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause() (+4 more)

### Community 3 - "menu.js"
Cohesion: 0.07
Nodes (52): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+44 more)

### Community 4 - "Stato al passaggio di consegne"
Cohesion: 0.10
Nodes (20): Capitano, Controller Xbox stile EA FC, Coppe complete, Pagina di sviluppo servita dalla cartella principale, Scelta squadra ed editor della formazione, Indicatore G1-G4 stile FIFA, Interfaccia gioco stile FC, Pallone raggio 0,13 m (+12 more)

### Community 5 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 6 - "build.mjs"
Cohesion: 0.05
Nodes (34): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+26 more)

### Community 7 - "nis.py"
Cohesion: 0.11
Nodes (18): angle(), audit(), model_frames(), world(), rot_angle(), sample(), biped_layout(), clip_frames() (+10 more)

### Community 8 - "make_map.py"
Cohesion: 0.06
Nodes (30): Convertitore per Blender (add-on e terminale), Nomi ossa da hash nlStringLowerHash, cPoseAccumulator::BuildNodeMatrices, Comandi info / bvh / json di strikers_anim.py, *.clips.json (metadati clip), Formati del disco .shier/.sanim/.bin, Disco europeo G4QP01, Limiti noti del convertitore (posa di riposo, fotogrammi chiave, morph, .trg) (+22 more)

### Community 10 - "club.js"
Cohesion: 0.09
Nodes (29): hash(), autoSquad(), canPlace(), cardOf(), clubOf(), cpuRating(), divisionResult(), DIVISIONS (+21 more)

### Community 11 - "strikers_anim.py"
Cohesion: 0.07
Nodes (32): _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk, clip_states(), _common_args(), _cstr(), dump_json() (+24 more)

### Community 12 - "test_converter.py"
Cohesion: 0.11
Nodes (21): world_mats(), _mat_to_euler_zxy(), string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans() (+13 more)

### Community 13 - "utMenu.js"
Cohesion: 0.21
Nodes (17): getLang(), BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles(), nmSize(), PACK_COLORS (+9 more)

### Community 14 - "Animazioni (area, clip controllate su 25 personaggi)"
Cohesion: 0.13
Nodes (20): add_characters.py (retarget e registrazione nel roster), Animazioni (area, clip controllate su 25 personaggi), Scheletro Biped originale (Bip01), WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner), Rifare il pacchetto dal disco (retarget.py --export), Scheletro Mixamo, nis.py (decodifica scene .nis e walkout), retarget.py (retarget Biped -> Mixamo) (+12 more)

### Community 15 - "drawCard"
Cohesion: 0.20
Nodes (10): cardsOf(), addCard(), albumPage(), albumRewards(), buyOffer(), buyPack(), drawCard(), drawRarity() (+2 more)

### Community 16 - "Gioco (README)"
Cohesion: 0.14
Nodes (18): Azioni (passaggi, tiro, scivolate, finte), IA: uno pressa, uno marca, altri in posizione, Velocita animazioni adattata (0,6-1,4x), Fisica del pallone, Pallone oltre 50 m/s, Build di prova --prova (10 milioni di crediti), Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m, Gioco (README) (+10 more)

### Community 17 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.07
Nodes (32): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+24 more)

### Community 18 - "Ultimate Team (README)"
Cohesion: 0.36
Nodes (7): data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia), Ultimate Team (README), data/cards.json (ruolo e 4 statistiche), Con cosa si collega (roster, main.js statsFor, save.js, nis.py), Dove sta il codice (game/src/ut, ui, stats.js), data/economy.json e simulatore economy_sim.py

### Community 19 - "input.js"
Cohesion: 0.20
Nodes (8): Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads(), PadMenus: menu con il controller

### Community 20 - "Aggiornare link online dopo ogni modifica (passi da 10 personaggi, oggi 3)"
Cohesion: 0.23
Nodes (10): Artifact privato del gioco (build di prova), Pagina itch.io ristretta (goleador0702/strikers), Limite 64 MB per pubblicazione (121 MB in 3 passi da 10 personaggi), Peso gioco compilato (215 MB / 121 MB online / 89 MB itch), Prossimi lavori (31 ottobre), Server privato (Oracle), Verifica finale e pubblicazione definitiva, gioco.html pesa circa 215 MB (+2 more)

### Community 21 - "write_skeleton"
Cohesion: 0.57
Nodes (3): write_retarget(), write_skeleton(), Writer

### Community 22 - "Aggiungere un personaggio (procedura)"
Cohesion: 0.20
Nodes (13): Aggiungere un personaggio (procedura), Carta in ultimate-team/data/cards.json, Nome carta in i18n_ut.js (ut.char.<id>), recolor in roster.json (oggi false), game/assets/roster.json, dev/sheet.html: confronto con lo scheletro originale, squads in roster.json (Leggende, Nazionali, Avventurieri, Campioni), teams: posti 0-3 movimento, 4 portiere (+5 more)

### Community 23 - "Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)"
Cohesion: 0.22
Nodes (8): Campo team della carta (nazionale nel walkout), Pacchetti P1 walkout a indizi, Apertura dei pacchetti P1 walkout a indizi, animation/data/strikers_nis.npz (da animation/nis.py), Capitano scelto nella Rosa (mai il portiere), Prossimo: piu esultanze originali, server privato, Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album), 25 personaggi con carta (nazionale nel walkout)

### Community 25 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.19
Nodes (12): Interfaccia gioco: decisioni prese con l'utente, Avvio del gioco (lingua, profilo), Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Lingue italiano e inglese in file di traduzioni, Navigazione stile FC (barra LB/RB, percorso, B indietro), Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Interfaccia gioco (README) (+4 more)

### Community 26 - "Scelte di dettaglio (31 ottobre)"
Cohesion: 0.16
Nodes (12): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Obiettivi del giorno (400 crediti l'uno), 4 statistiche per carta (VEL TIR PAS CON / PAR RIF USC VEL), 75 = originale, Scelte di dettaglio (31 ottobre), Sezioni: Club, Rosa, Mercato, Divisioni, Album (+4 more)

### Community 27 - "cards.js"
Cohesion: 0.17
Nodes (7): avgOvr, CARD, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

### Community 28 - "Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)"
Cohesion: 0.17
Nodes (11): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Le 4 coppe (citazioni ironiche ai giochi PS2), Stile grafico cartoon anni 2000 con richiami PS2, Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia) (+3 more)

### Community 29 - "audit.py (controllo automatico clip)"
Cohesion: 0.22
Nodes (11): audit.py (controllo automatico clip), Risultati audit portiere (ground_float, dir Spine1), game/dev/sheet.html (controllo a occhio), Clip sollevate dai capelli voluminosi (centrocampista Rivali, Spike 19 clip), Rivali (squadra), teamInfo: color e shirt delle squadre, 183 clip (84 giocatore, 99 portiere), Celestini (+3 more)

### Community 30 - "Scelte sulle bozze (M1, holo, L3b, L4, P1)"
Cohesion: 0.18
Nodes (10): Bozze (pagina di prova Artifact, bozze-menu.html), Holo scelti: Arcobaleno, Glitter, Lava, Prisma, Galassia, Menu M1 Cartoon tropicale, Scelte sulle bozze (M1, holo, L3b, L4, P1), Teche: graduata blu notte e oro (L3b), nera con bordo oro (L4), Numerata 1-10 (10 copie, teca graduata L3b), Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro), 1/1 Oro (teca nera con bordo oro) (+2 more)

### Community 31 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 32 - "stadiums.js"
Cohesion: 0.10
Nodes (22): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, BASE, buildDecor(), clouds() (+14 more)

### Community 34 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.43
Nodes (7): Ultimate Team, Ultimate Team: decisioni prese con l'utente, Economia (rimando a ECONOMIA.md), Economia di Ultimate Team (crediti, pacchetti, mercato), Confronto con FC (all'ora di gioco), Da tarare dopo, giocando (25 personaggi oggi, curva per 40), Fonti (EA, futmind, gacha)

### Community 36 - "Personaggi (characters/README.md)"
Cohesion: 0.16
Nodes (14): Squadra pronta Avventurieri (Piccolo in porta), Squadra pronta Campioni (Vegeta capitano), Celestini (squadra), Personaggi (characters/README.md), Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta), Stato personaggi: completo (25 personaggi, lavoro finito), Tabella dei 25 modelli .glb, Squadra pronta Avventurieri (+6 more)

### Community 37 - "import_into_blender"
Cohesion: 0.20
Nodes (5): contact_time(), root_motion(), strikers_frames(), _biped_names(), NameBook

### Community 40 - "retarget.py"
Cohesion: 0.08
Nodes (17): calibrate(), frame_from(), Glb, lowest_offset(), R(), main(), mat_to_quat(), open_source() (+9 more)

### Community 41 - "json"
Cohesion: 0.15
Nodes (10): check_rig(), main(), ball_at(), clip_ref(), main(), decode(), event_names(), main() (+2 more)

### Community 42 - "goalie.js"
Cohesion: 0.14
Nodes (16): predict(), blendable(), blended(), BY_ID, CATCH, cellOf(), clamp(), DEFLECT (+8 more)

### Community 45 - "main.js"
Cohesion: 0.18
Nodes (12): Pagina sviluppo gioco senza build (dev/index.html), GOALIE, MATCH, RIG_HEIGHT, TEAM_DEFAULTS, fetchOk(), loadAssets(), makeAudio() (+4 more)

### Community 46 - "Regole del progetto"
Cohesion: 0.15
Nodes (8): Ricompila e prova (build, playtest, uttest), Dove andare (tabella aree), Calcio arcade: istruzioni per Claude, Regole del progetto, Sezione ## Stato dei README, Prova automatica playtest, Prova Ultimate Team uttest, Prova automatica game/tools/uttest.cjs

### Community 50 - "value"
Cohesion: 0.40
Nodes (6): tradable(), value(), daily(), fair(), offers(), today()

### Community 52 - "ai.js"
Cohesion: 0.44
Nodes (8): bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), shapeSpot(), spot, angleDiff()

### Community 53 - "game.js"
Cohesion: 0.15
Nodes (20): shootAtFast(), tmp, BALL, FIELD, PASS, PHYSICS_DT, SHOT, SKILL (+12 more)

## Knowledge Gaps
- **73 isolated node(s):** `Pagina sviluppo gioco senza build (dev/index.html)`, `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `Pagine di sviluppo dev/`, `IA: uno pressa, uno marca, altri in posizione`, `Velocita animazioni adattata (0,6-1,4x)` (+68 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 290 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tabella aree del progetto (scritta da make_map.py)` connect `make_map.py` to `Gioco (README)`, `Personaggi (characters/README.md)`, `Animazioni (area, clip controllate su 25 personaggi)`?**
  _High betweenness centrality (0.303) - this node is a cross-community bridge._
- **What connects `Pagina sviluppo gioco senza build (dev/index.html)`, `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `Pagine di sviluppo dev/` to the rest of the system?**
  _73 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Why does `Riferimento: il gioco originale` connect `make_map.py` to `game.js`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.07392607392607392 - nodes in this community are weakly interconnected._
- **Why does `Calcio arcade (progetto)` connect `make_map.py` to `Personaggi (characters/README.md)`, `build.mjs`, `Regole del progetto`, `Animazioni (area, clip controllate su 25 personaggi)`, `Gioco (README)`, `Ultimate Team (README)`, `Interfaccia gioco: decisioni prese con l'utente`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Should `menu.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07168458781362007 - nodes in this community are weakly interconnected._