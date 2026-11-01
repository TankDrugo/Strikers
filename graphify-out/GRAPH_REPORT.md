# Graph Report - Strikers  (2026-11-01)

## Corpus Check
- 69 files · ~120,148 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 1118 nodes · 2461 edges · 50 communities (43 shown, 7 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 186 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `74a30cd8`
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
- cardOf
- Gioco (README)
- Super Mario Strikers: misure e dinamiche di riferimento
- Economia di Ultimate Team (crediti, pacchetti, mercato)
- input.js
- Aggiornare link online dopo ogni modifica (passi da 10 personaggi, oggi 3)
- write_skeleton
- Aggiungere un personaggio (procedura)
- Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)
- holo.js
- Interfaccia gioco: decisioni prese con l'utente
- Scelte di dettaglio (31 ottobre)
- cards.js
- Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)
- Personaggi (characters/README.md)
- Scelte sulle bozze (M1, holo, L3b, L4, P1)
- economy_sim.py
- stadiums.js
- Clip
- Server privato (Oracle)
- Come funzionano i giochi di questo tipo (FC e gacha)
- Personaggi (characters/README.md)
- import_into_blender
- Altezza uguale per i giocatori di movimento (FIELDER.height)
- Copie con texture ridotte in game/assets/characters/
- retarget.py
- json
- goalie.js
- Ball
- Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)
- main.js
- AnimViewer
- value
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
- `PadMenus: menu con il controller` --references--> `PadMenus`  [EXTRACTED]
  interfaccia-gioco/README.md → game/src/input.js
- `Carte con ritratto a mezzo busto calcolato dalla posa` --references--> `makePortraits()`  [INFERRED]
  interfaccia-gioco/README.md → game/src/main.js
- `Super Strike (comandi)` --semantically_similar_to--> `Super Strike`  [INFERRED] [semantically similar]
  game/README.md → CLAUDE.md
- `Personaggi singoli con nazionale (Goku SSJ 90, Vegeta 88, Goku, Sora, Piccolo, Ratchet, Jak, Snake, Roxas, Spike, Crilin, Riku, Big Smoke, Dastardly, Kairi)` --semantically_similar_to--> `Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta)`  [INFERRED] [semantically similar]
  ultimate-team/DESIGN.md → characters/README.md
- `Scheletro Mixamo (mixamorig:Hips...), metri, verso +Z` --semantically_similar_to--> `Scheletro Mixamo`  [INFERRED] [semantically similar]
  characters/README.md → animation/README.md

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

## Communities (50 total, 7 thin omitted)

### Community 0 - "Game"
Cohesion: 0.06
Nodes (8): clamp01(), Game, lerpRange(), makePortraits(), Player, seekSpeed(), Carte con ritratto a mezzo busto calcolato dalla posa, 1. Esito del tiro e parata

### Community 1 - "player.js"
Cohesion: 0.21
Nodes (12): ANIM_RATE_MAX, ANIM_RATE_MIN, GOALIE, SIZE, GOLD, LOCO_CYCLES, tmpV, f() (+4 more)

### Community 2 - "t"
Cohesion: 0.06
Nodes (14): Tracker, Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause() (+6 more)

### Community 3 - "menu.js"
Cohesion: 0.07
Nodes (51): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+43 more)

### Community 4 - "Stato al passaggio di consegne"
Cohesion: 0.18
Nodes (10): audit.py (controllo automatico clip), Risultati audit portiere (ground_float, dir Spine1), game/dev/sheet.html (controllo a occhio), 183 clip (84 giocatore, 99 portiere), Controller Xbox stile EA FC, Pagina di sviluppo servita dalla cartella principale, Pallone raggio 0,13 m, Giocatori 1,3x (SIZE) (+2 more)

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
Cohesion: 0.11
Nodes (20): cardsOf(), addCard(), albumPage(), albumRewards(), buyOffer(), buyPack(), clubOf(), DIVISIONS (+12 more)

### Community 11 - "strikers_anim.py"
Cohesion: 0.07
Nodes (32): _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), Chunk, clip_states(), _common_args(), _cstr(), dump_json() (+24 more)

### Community 12 - "test_converter.py"
Cohesion: 0.11
Nodes (21): world_mats(), _mat_to_euler_zxy(), string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans() (+13 more)

### Community 13 - "utMenu.js"
Cohesion: 0.17
Nodes (19): addStrings(), getLang(), STRINGS, BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles() (+11 more)

### Community 14 - "Animazioni (area, clip controllate su 25 personaggi)"
Cohesion: 0.13
Nodes (20): add_characters.py (retarget e registrazione nel roster), Animazioni (area, clip controllate su 25 personaggi), Scheletro Biped originale (Bip01), WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner), Rifare il pacchetto dal disco (retarget.py --export), Scheletro Mixamo, nis.py (decodifica scene .nis e walkout), retarget.py (retarget Biped -> Mixamo) (+12 more)

### Community 15 - "cardOf"
Cohesion: 0.20
Nodes (12): autoSquad(), canPlace(), cardOf(), fromBench(), inst(), listCard(), place(), quickSell() (+4 more)

### Community 16 - "Gioco (README)"
Cohesion: 0.14
Nodes (18): Azioni (passaggi, tiro, scivolate, finte), IA: uno pressa, uno marca, altri in posizione, Velocita animazioni adattata (0,6-1,4x), Fisica del pallone, Pallone oltre 50 m/s, Build di prova --prova (10 milioni di crediti), Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m, Gioco (README) (+10 more)

### Community 17 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.07
Nodes (32): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+24 more)

### Community 18 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.24
Nodes (14): Ultimate Team, Ultimate Team: decisioni prese con l'utente, Economia (rimando a ECONOMIA.md), Economia di Ultimate Team (crediti, pacchetti, mercato), Confronto con FC (all'ora di gioco), Da tarare dopo, giocando (25 personaggi oggi, curva per 40), data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia) (+6 more)

### Community 19 - "input.js"
Cohesion: 0.22
Nodes (7): Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads()

### Community 20 - "Aggiornare link online dopo ogni modifica (passi da 10 personaggi, oggi 3)"
Cohesion: 0.15
Nodes (12): Artifact privato del gioco (build di prova), Calcio arcade: istruzioni per Claude, Pagina itch.io ristretta (goleador0702/strikers), Limite 64 MB per pubblicazione (121 MB in 3 passi da 10 personaggi), Peso gioco compilato (215 MB / 121 MB online / 89 MB itch), Prossimi lavori (31 ottobre), Regole del progetto, Sezione ## Stato dei README (+4 more)

### Community 21 - "write_skeleton"
Cohesion: 0.57
Nodes (3): write_retarget(), write_skeleton(), Writer

### Community 22 - "Aggiungere un personaggio (procedura)"
Cohesion: 0.20
Nodes (13): Aggiungere un personaggio (procedura), Carta in ultimate-team/data/cards.json, Nome carta in i18n_ut.js (ut.char.<id>), recolor in roster.json (oggi false), game/assets/roster.json, dev/sheet.html: confronto con lo scheletro originale, squads in roster.json (Leggende, Nazionali, Avventurieri, Campioni), teams: posti 0-3 movimento, 4 portiere (+5 more)

### Community 23 - "Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)"
Cohesion: 0.17
Nodes (10): Campo team della carta (nazionale nel walkout), Ricompila e prova (build, playtest, uttest), Prova automatica playtest, Prova Ultimate Team uttest, animation/data/strikers_nis.npz (da animation/nis.py), Capitano scelto nella Rosa (mai il portiere), Prossimo: piu esultanze originali, server privato, Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album) (+2 more)

### Community 24 - "holo.js"
Cohesion: 0.36
Nodes (5): canvas(), installHolo(), rnd, SHINY, textures()

### Community 25 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.14
Nodes (17): Coppe complete, Interfaccia gioco stile FC, Interfaccia gioco: decisioni prese con l'utente, Avvio del gioco (lingua, profilo), Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Lingue italiano e inglese in file di traduzioni, Navigazione stile FC (barra LB/RB, percorso, B indietro) (+9 more)

### Community 26 - "Scelte di dettaglio (31 ottobre)"
Cohesion: 0.20
Nodes (11): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Obiettivi del giorno (400 crediti l'uno), 4 statistiche per carta (VEL TIR PAS CON / PAR RIF USC VEL), 75 = originale, Scelte di dettaglio (31 ottobre), Sezioni: Club, Rosa, Mercato, Divisioni, Album (+3 more)

### Community 27 - "cards.js"
Cohesion: 0.15
Nodes (8): avgOvr, CARD, CATALOG, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

### Community 28 - "Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)"
Cohesion: 0.29
Nodes (7): Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Gran Premio Pazzo Pazzo (Le corse piu pazze del mondo), Le 4 coppe (citazioni ironiche ai giochi PS2), Stile grafico cartoon anni 2000 con richiami PS2, Temi per modalita (tropicale, hi-tech Ratchet, art deco Mafia)

### Community 29 - "Personaggi (characters/README.md)"
Cohesion: 0.21
Nodes (14): Clip sollevate dai capelli voluminosi (centrocampista Rivali, Spike 19 clip), Celestini (squadra), Personaggi (characters/README.md), Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta), Rivali (squadra), Stato personaggi: completo (25 personaggi, lavoro finito), Tabella dei 25 modelli .glb, teamInfo: color e shirt delle squadre (+6 more)

### Community 30 - "Scelte sulle bozze (M1, holo, L3b, L4, P1)"
Cohesion: 0.20
Nodes (10): Bozze (pagina di prova Artifact, bozze-menu.html), Holo scelti: Arcobaleno, Glitter, Lava, Prisma, Galassia, Menu M1 Cartoon tropicale, Pacchetti P1 walkout a indizi, Scelte sulle bozze (M1, holo, L3b, L4, P1), Teche: graduata blu notte e oro (L3b), nera con bordo oro (L4), Apertura dei pacchetti P1 walkout a indizi, Rarita (Bronzo, Argento, Oro, Oro raro, Holo, Numerata, 1/1 Oro) (+2 more)

### Community 31 - "economy_sim.py"
Cohesion: 0.29
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 32 - "stadiums.js"
Cohesion: 0.11
Nodes (21): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, BASE, buildDecor(), clouds() (+13 more)

### Community 34 - "Server privato (Oracle)"
Cohesion: 0.29
Nodes (4): Server privato (Oracle), Numerata 1-10 (10 copie, teca graduata L3b), Mercato simulato (prezzi, comprare 110-160%, vendere, tassa 5%), Cosa dice la simulazione (strategia A Oro Premium, B Holo)

### Community 36 - "Personaggi (characters/README.md)"
Cohesion: 0.13
Nodes (14): Squadra pronta Avventurieri (Piccolo in porta), Squadra pronta Campioni (Vegeta capitano), Squadra pronta Avventurieri, Squadra pronta Campioni, Capitano, Chat delle animazioni (in pausa, animazioni delle ulti), Chat dei nuovi personaggi .glb (finita e sul main, ramo charming-mayer), Chat delle regole del gioco (prossima, ramo magical-ride, VERIFICA.md, strikers_triggers.json) (+6 more)

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

### Community 44 - "Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)"
Cohesion: 0.29
Nodes (6): Obiettivi stella con il colpo speciale (non ancora nel gioco), Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori), Stelle e obiettivi (1-3 stelle per partita, Normale/Difficile), Torneo privato, Voto della coppa D-C-B-A-S-Z (stile Dragon Ball), Rubinetti: da dove arrivano i crediti

### Community 45 - "main.js"
Cohesion: 0.18
Nodes (12): Pagina sviluppo gioco senza build (dev/index.html), FIELDER, MATCH, RIG_HEIGHT, TEAM_DEFAULTS, fetchOk(), loadAssets(), teamMaterials() (+4 more)

### Community 50 - "value"
Cohesion: 0.20
Nodes (11): hash(), value(), cpuRating(), daily(), divisionResult(), fair(), fillDays(), offers() (+3 more)

### Community 52 - "ai.js"
Cohesion: 0.44
Nodes (8): bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), shapeSpot(), spot, angleDiff()

### Community 53 - "game.js"
Cohesion: 0.15
Nodes (20): shootAtFast(), tmp, BALL, FIELD, PASS, PHYSICS_DT, SHOT, SKILL (+12 more)

## Knowledge Gaps
- **73 isolated node(s):** `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `Pagine di sviluppo dev/`, `IA: uno pressa, uno marca, altri in posizione`, `Velocita animazioni adattata (0,6-1,4x)`, `Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m` (+68 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 293 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tabella aree del progetto (scritta da make_map.py)` connect `make_map.py` to `Gioco (README)`, `Personaggi (characters/README.md)`, `Animazioni (area, clip controllate su 25 personaggi)`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **What connects `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `Pagine di sviluppo dev/`, `IA: uno pressa, uno marca, altri in posizione` to the rest of the system?**
  _73 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.0584385226741468 - nodes in this community are weakly interconnected._
- **Why does `Riferimento: il gioco originale` connect `make_map.py` to `game.js`?**
  _High betweenness centrality (0.203) - this node is a cross-community bridge._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.062173458725182866 - nodes in this community are weakly interconnected._
- **Why does `Calcio arcade (progetto)` connect `make_map.py` to `build.mjs`, `Animazioni (area, clip controllate su 25 personaggi)`, `Gioco (README)`, `Economia di Ultimate Team (crediti, pacchetti, mercato)`, `Aggiornare link online dopo ogni modifica (passi da 10 personaggi, oggi 3)`, `Interfaccia gioco: decisioni prese con l'utente`, `Personaggi (characters/README.md)`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **Should `menu.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07457627118644068 - nodes in this community are weakly interconnected._