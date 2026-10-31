# Graph Report - Strikers  (2026-10-31)

## Corpus Check
- 67 files · ~108,668 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 1083 nodes · 2377 edges · 54 communities (46 shown, 8 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 185 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2c821c76`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Game
- game.js
- t
- menu.js
- FormatError
- Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)
- build.mjs
- nis.py
- make_map.py
- retarget_clip
- club.js
- import_into_blender
- math
- utMenu.js
- Animazioni (area, clip controllate su 25 personaggi)
- Stato al passaggio di consegne
- Gioco (README)
- Super Mario Strikers: misure e dinamiche di riferimento
- test_converter.py
- input.js
- Regole del progetto
- Player
- Aggiungere un personaggio (procedura)
- Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)
- cardOf
- Interfaccia gioco: decisioni prese con l'utente
- Scelte di dettaglio (31 ottobre)
- cards.js
- Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori)
- audit.py (controllo automatico clip)
- Scelte sulle bozze (M1, holo, L3b, L4, P1)
- economy_sim.py
- Stadium
- Clip
- Economia di Ultimate Team (crediti, pacchetti, mercato)
- Come funzionano i giochi di questo tipo (FC e gacha)
- Stato personaggi: completo (25 personaggi, lavoro finito)
- import_into_blender
- Altezza uguale per i giocatori di movimento (FIELDER.height)
- Copie con texture ridotte in game/assets/characters/
- retarget.py
- json
- goalie.js
- Ball
- audit.py
- strikers_anim.py
- player.js
- AnimViewer
- Keeper
- Rig
- ball.js
- WalkoutStage
- ai.js
- field.js

## God Nodes (most connected - your core abstractions)
1. `Game` - 71 edges
2. `t()` - 50 edges
3. `Menu` - 39 edges
4. `Player` - 27 edges
5. `boot()` - 23 edges
6. `installCups()` - 23 edges
7. `Gioco (README)` - 23 edges
8. `import_into_blender()` - 20 edges
9. `UiNav` - 19 edges
10. `test_decode()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Riepilogo: differenze in ordine di importanza` --references--> `contact_time()`  [INFERRED]
  reference/VERIFICA.md → animation/retarget.py
- `6. Passaggi` --references--> `shootAtFast()`  [INFERRED]
  reference/VERIFICA.md → game/src/ball.js
- `Carte con ritratto a mezzo busto calcolato dalla posa` --references--> `makePortraits()`  [INFERRED]
  interfaccia-gioco/README.md → game/src/main.js
- `Super Strike (comandi)` --semantically_similar_to--> `Super Strike`  [INFERRED] [semantically similar]
  game/README.md → CLAUDE.md
- `Link online (privato)` --semantically_similar_to--> `Artifact privato del gioco (build di prova)`  [INFERRED] [semantically similar]
  game/README.md → CLAUDE.md

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

## Communities (54 total, 8 thin omitted)

### Community 0 - "Game"
Cohesion: 0.07
Nodes (5): shootAtFast(), clamp01(), Game, lerpRange(), seekSpeed()

### Community 1 - "game.js"
Cohesion: 0.12
Nodes (29): Pagina sviluppo gioco senza build (dev/index.html), ANIM_RATE_MAX, ANIM_RATE_MIN, BALL, FIELDER, GOALIE, MATCH, PASS (+21 more)

### Community 2 - "t"
Cohesion: 0.07
Nodes (13): Tracker, Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause() (+5 more)

### Community 3 - "menu.js"
Cohesion: 0.08
Nodes (49): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+41 more)

### Community 4 - "FormatError"
Cohesion: 0.14
Nodes (8): read_camera(), Chunk, _cstr(), FormatError, Retargets, Skeleton, top_level_chunks(), _u32()

### Community 5 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 6 - "build.mjs"
Cohesion: 0.05
Nodes (34): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+26 more)

### Community 7 - "nis.py"
Cohesion: 0.16
Nodes (11): biped_layout(), clip_frames(), decode(), export(), leg_length(), load(), retarget_walkouts(), scene_name() (+3 more)

### Community 8 - "make_map.py"
Cohesion: 0.05
Nodes (35): Convertitore per Blender (add-on e terminale), Nomi ossa da hash nlStringLowerHash, cPoseAccumulator::BuildNodeMatrices, Comandi info / bvh / json di strikers_anim.py, *.clips.json (metadati clip), Formati del disco .shier/.sanim/.bin, Disco europeo G4QP01, Limiti noti del convertitore (posa di riposo, fotogrammi chiave, morph, .trg) (+27 more)

### Community 9 - "retarget_clip"
Cohesion: 0.32
Nodes (6): lowest_offset(), R(), mat_to_quat(), orthonormal(), retarget_clip(), W()

### Community 10 - "club.js"
Cohesion: 0.09
Nodes (28): cardsOf(), hash(), addCard(), albumPage(), albumRewards(), buyOffer(), buyPack(), clubOf() (+20 more)

### Community 11 - "import_into_blender"
Cohesion: 0.12
Nodes (11): _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat(), rest_offsets(), _unwrap() (+3 more)

### Community 12 - "math"
Cohesion: 0.18
Nodes (12): string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+4 more)

### Community 13 - "utMenu.js"
Cohesion: 0.18
Nodes (20): addStrings(), getLang(), STRINGS, BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles() (+12 more)

### Community 14 - "Animazioni (area, clip controllate su 25 personaggi)"
Cohesion: 0.13
Nodes (20): add_characters.py (retarget e registrazione nel roster), Animazioni (area, clip controllate su 25 personaggi), Scheletro Biped originale (Bip01), WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner), Rifare il pacchetto dal disco (retarget.py --export), Scheletro Mixamo, nis.py (decodifica scene .nis e walkout), retarget.py (retarget Biped -> Mixamo) (+12 more)

### Community 15 - "Stato al passaggio di consegne"
Cohesion: 0.12
Nodes (16): Capitano, Controller Xbox stile EA FC, Coppe complete, Pagina di sviluppo servita dalla cartella principale, Scelta squadra ed editor della formazione, Indicatore G1-G4 stile FIFA, Interfaccia gioco stile FC, Pallone raggio 0,13 m (+8 more)

### Community 16 - "Gioco (README)"
Cohesion: 0.10
Nodes (26): Personaggi (characters/README.md), Visualizzatore animazioni (Impostazioni), Dove andare (tabella aree), Limite 64 MB per pubblicazione (121 MB in 3 passi da 10 personaggi), Peso gioco compilato (215 MB / 121 MB online / 89 MB itch), Azioni (passaggi, tiro, scivolate, finte), IA: uno pressa, uno marca, altri in posizione, Velocita animazioni adattata (0,6-1,4x) (+18 more)

### Community 17 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.06
Nodes (33): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+25 more)

### Community 18 - "test_converter.py"
Cohesion: 0.14
Nodes (11): world_mats(), contact_time(), strikers_frames(), check(), close(), game_world(), mul_rows(), qclose() (+3 more)

### Community 19 - "input.js"
Cohesion: 0.20
Nodes (8): Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads(), PadMenus: menu con il controller

### Community 20 - "Regole del progetto"
Cohesion: 0.19
Nodes (9): Artifact privato del gioco (build di prova), Calcio arcade: istruzioni per Claude, Pagina itch.io ristretta (goleador0702/strikers), Prossimi lavori (31 ottobre), Regole del progetto, Server privato (Oracle), Sezione ## Stato dei README, Verifica finale e pubblicazione definitiva (+1 more)

### Community 21 - "Player"
Cohesion: 0.16
Nodes (5): makePortraits(), Player, Indicatore G1-G4 e barra della Super Strike in partita, Carte con ritratto a mezzo busto calcolato dalla posa, Stato: funziona (menu FC, profili, Coppe, Ultimate Team, pausa)

### Community 22 - "Aggiungere un personaggio (procedura)"
Cohesion: 0.17
Nodes (14): Aggiungere un personaggio (procedura), Carta in ultimate-team/data/cards.json, Nome carta in i18n_ut.js (ut.char.<id>), recolor in roster.json (oggi false), game/assets/roster.json, dev/sheet.html: confronto con lo scheletro originale, squads in roster.json (Leggende, Nazionali, Avventurieri, Campioni), teams: posti 0-3 movimento, 4 portiere (+6 more)

### Community 23 - "Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)"
Cohesion: 0.14
Nodes (12): Campo team della carta (nazionale nel walkout), Ricompila e prova (build, playtest, uttest), Prova automatica playtest, Prova Ultimate Team uttest, Pacchetti P1 walkout a indizi, Apertura dei pacchetti P1 walkout a indizi, animation/data/strikers_nis.npz (da animation/nis.py), Capitano scelto nella Rosa (mai il portiere) (+4 more)

### Community 24 - "cardOf"
Cohesion: 0.15
Nodes (15): autoSquad(), canPlace(), cardOf(), fromBench(), inst(), lineup(), listCard(), place() (+7 more)

### Community 25 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.23
Nodes (11): Interfaccia gioco: decisioni prese con l'utente, Avvio del gioco (lingua, profilo), Gioco rapido (umano/CPU, scelta lato, durata, difficolta), Home (profilo attivo, notizie a rotazione, scorciatoie), Lingue italiano e inglese in file di traduzioni, Navigazione stile FC (barra LB/RB, percorso, B indietro), Ordine di lavoro (menu, Gioco rapido, Coppe, Ultimate Team: fatti), Interfaccia gioco (README) (+3 more)

### Community 26 - "Scelte di dettaglio (31 ottobre)"
Cohesion: 0.16
Nodes (12): Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Mercato simulato (14 offerte al giorno, 35%, tassa 5%), Obiettivi del giorno (400 crediti l'uno), 4 statistiche per carta (VEL TIR PAS CON / PAR RIF USC VEL), 75 = originale, Scelte di dettaglio (31 ottobre), Sezioni: Club, Rosa, Mercato, Divisioni, Album (+4 more)

### Community 27 - "cards.js"
Cohesion: 0.15
Nodes (8): avgOvr, CARD, CATALOG, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

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
Cohesion: 0.26
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 32 - "Stadium"
Cohesion: 0.28
Nodes (5): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium

### Community 34 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.26
Nodes (12): Ultimate Team, Ultimate Team: decisioni prese con l'utente, Economia (rimando a ECONOMIA.md), Economia di Ultimate Team (crediti, pacchetti, mercato), Confronto con FC (all'ora di gioco), Da tarare dopo, giocando (25 personaggi oggi, curva per 40), data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia) (+4 more)

### Community 36 - "Stato personaggi: completo (25 personaggi, lavoro finito)"
Cohesion: 0.16
Nodes (13): Squadra pronta Avventurieri (Piccolo in porta), Squadra pronta Campioni (Vegeta capitano), Celestini (squadra), Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta), Stato personaggi: completo (25 personaggi, lavoro finito), Tabella dei 25 modelli .glb, Squadra pronta Avventurieri, Squadra pronta Campioni (+5 more)

### Community 37 - "import_into_blender"
Cohesion: 0.30
Nodes (8): import_into_blender(), load_chunks(), _load_cli(), load_clips(), load_retargets(), load_skeletons(), NameBook, test_blender()

### Community 40 - "retarget.py"
Cohesion: 0.10
Nodes (10): calibrate(), frame_from(), Glb, main(), open_source(), root_motion(), shrink_images(), Source (+2 more)

### Community 41 - "json"
Cohesion: 0.27
Nodes (5): check_rig(), main(), ball_at(), clip_ref(), main()

### Community 42 - "goalie.js"
Cohesion: 0.17
Nodes (14): blendable(), blended(), BY_ID, CATCH, cellOf(), clamp(), DEFLECT, findBestSave() (+6 more)

### Community 44 - "audit.py"
Cohesion: 0.36
Nodes (6): angle(), audit(), model_frames(), world(), rot_angle(), sample()

### Community 45 - "strikers_anim.py"
Cohesion: 0.16
Nodes (11): _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), clip_states(), _common_args(), dump_json(), main() (+3 more)

### Community 46 - "player.js"
Cohesion: 0.52
Nodes (5): f(), fielderConfig(), goalieConfig(), scale(), STAT_BASE

### Community 48 - "Keeper"
Cohesion: 0.23
Nodes (3): Keeper, rootAt(), seekDirection()

### Community 50 - "ball.js"
Cohesion: 0.40
Nodes (4): integrate(), predict(), tmp, FIELD

### Community 52 - "ai.js"
Cohesion: 0.50
Nodes (7): bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), v, angleDiff()

### Community 53 - "field.js"
Cohesion: 0.43
Nodes (5): ballTexture(), buildBallMesh(), buildField(), buildGoals(), pitchTexture()

## Knowledge Gaps
- **73 isolated node(s):** `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `Pagine di sviluppo dev/`, `Controller Xbox stile EA FC`, `Coppe complete`, `Pagina di sviluppo servita dalla cartella principale` (+68 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 283 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tabella aree del progetto (scritta da make_map.py)` connect `make_map.py` to `Gioco (README)`, `Animazioni (area, clip controllate su 25 personaggi)`?**
  _High betweenness centrality (0.270) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `boot()` (e.g. with `.tick()` and `.show()`) actually correct?**
  _`boot()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `Pagine di sviluppo dev/`, `Controller Xbox stile EA FC` to the rest of the system?**
  _73 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.06851851851851852 - nodes in this community are weakly interconnected._
- **Why does `Riferimento: il gioco originale` connect `make_map.py` to `game.js`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Should `game.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1226890756302521 - nodes in this community are weakly interconnected._
- **Why does `Calcio arcade (progetto)` connect `make_map.py` to `Economia di Ultimate Team (crediti, pacchetti, mercato)`, `build.mjs`, `Animazioni (area, clip controllate su 25 personaggi)`, `Gioco (README)`, `Regole del progetto`, `Interfaccia gioco: decisioni prese con l'utente`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._