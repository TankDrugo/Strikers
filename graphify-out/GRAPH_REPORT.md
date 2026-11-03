# Graph Report - Strikers  (2026-11-03)

## Corpus Check
- 70 files · ~128,680 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 2)

## Summary
- 1149 nodes · 2575 edges · 55 communities (43 shown, 12 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 195 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9cea3aec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Game
- main.js
- t
- menu.js
- Stato al passaggio di consegne
- Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)
- build.mjs
- nis.py
- make_map.py
- Keeper
- club.js
- Pose
- math
- utMenu.js
- Animazioni (area, clip controllate su 25 personaggi)
- cardOf
- Gioco (README)
- Super Mario Strikers: misure e dinamiche di riferimento
- Economia di Ultimate Team (crediti, pacchetti, mercato)
- UiNav
- Regole del progetto
- .play
- Aggiungere un personaggio (procedura)
- Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)
- holo.js
- Interfaccia gioco: decisioni prese con l'utente
- Ultimate Team: decisioni prese con l'utente
- cards.js
- Player
- Personaggi (characters/README.md)
- test_converter.py
- sys
- stadium.js
- Clip
- strikers_anim.py
- stadiums.js
- main
- import_into_blender
- Altezza uguale per i giocatori di movimento (FIELDER.height)
- Copie con texture ridotte in game/assets/characters/
- retarget.py
- json
- goalie.js
- Ball
- FormatError
- .shootBall
- WalkoutStage
- AnimViewer
- audit.py
- triggers.py
- ai.js
- game.js
- Source

## God Nodes (most connected - your core abstractions)
1. `Game` - 85 edges
2. `t()` - 57 edges
3. `Menu` - 41 edges
4. `Player` - 27 edges
5. `installCups()` - 26 edges
6. `boot()` - 23 edges
7. `Gioco (README)` - 23 edges
8. `UiNav` - 22 edges
9. `import_into_blender()` - 20 edges
10. `test_decode()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Carte con ritratto a mezzo busto calcolato dalla posa` --references--> `makePortraits()`  [INFERRED]
  interfaccia-gioco/README.md → game/src/main.js
- `Super Strike (comandi)` --semantically_similar_to--> `Super Strike`  [INFERRED] [semantically similar]
  game/README.md → CLAUDE.md
- `Link online (privato)` --semantically_similar_to--> `Artifact privato del gioco (build di prova)`  [INFERRED] [semantically similar]
  game/README.md → CLAUDE.md
- `Personaggi singoli con nazionale (Goku SSJ 90, Vegeta 88, Goku, Sora, Piccolo, Ratchet, Jak, Snake, Roxas, Spike, Crilin, Riku, Big Smoke, Dastardly, Kairi)` --semantically_similar_to--> `Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta)`  [INFERRED] [semantically similar]
  ultimate-team/DESIGN.md → characters/README.md
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

## Communities (55 total, 12 thin omitted)

### Community 1 - "main.js"
Cohesion: 0.11
Nodes (29): Pagina sviluppo gioco senza build (dev/index.html), ANIM_RATE_MAX, ANIM_RATE_MIN, FIELDER, GOALIE, MATCH, PASS, RIG_HEIGHT (+21 more)

### Community 2 - "t"
Cohesion: 0.08
Nodes (15): Tracker, Hud, boot(), openViewer(), resume(), showMenu(), startMatch(), togglePause() (+7 more)

### Community 3 - "menu.js"
Cohesion: 0.07
Nodes (55): baseTeams(), cpuTeams(), cupById(), CUPS, grade(), makeBracket(), NAMES, nextRound() (+47 more)

### Community 4 - "Stato al passaggio di consegne"
Cohesion: 0.11
Nodes (18): Capitano, Controller Xbox stile EA FC, Coppe complete, Pagina di sviluppo servita dalla cartella principale, Scelta squadra ed editor della formazione, Indicatore G1-G4 stile FIFA, Interfaccia gioco stile FC, Pallone raggio 0,13 m (+10 more)

### Community 5 - "Holo prototypes (chosen: Arcobaleno, Glitter, Lava, Prisma, Galassia)"
Cohesion: 0.07
Nodes (42): bozze-menu.html (Bozze menu e carte), art() SVG character portrait, back() (B button), bindTilt() pointer tilt, blip() WebAudio synth, card() card HTML builder, Card rarities (gold, goldRare, silver, holo, numbered, oneOfOne), confetti() (+34 more)

### Community 6 - "build.mjs"
Cohesion: 0.05
Nodes (34): dependencies, three@0.180.0, devDependencies, esbuild@0.25.10, name, private, scripts, build (+26 more)

### Community 7 - "nis.py"
Cohesion: 0.15
Nodes (12): biped_layout(), clip_frames(), decode(), export(), leg_length(), load(), read_camera(), retarget_walkouts() (+4 more)

### Community 8 - "make_map.py"
Cohesion: 0.06
Nodes (30): Convertitore per Blender (add-on e terminale), Nomi ossa da hash nlStringLowerHash, cPoseAccumulator::BuildNodeMatrices, Comandi info / bvh / json di strikers_anim.py, *.clips.json (metadati clip), Formati del disco .shier/.sanim/.bin, Disco europeo G4QP01, Limiti noti del convertitore (posa di riposo, fotogrammi chiave, morph, .trg) (+22 more)

### Community 10 - "club.js"
Cohesion: 0.09
Nodes (30): cardsOf(), hash(), addCard(), albumPage(), albumRewards(), buyOffer(), buyPack(), clubOf() (+22 more)

### Community 11 - "Pose"
Cohesion: 0.12
Nodes (11): _mat_to_euler_zxy(), _mirror_rot(), _mirror_trans(), Pose, _quat_norm(), _quat_to_mat(), rest_offsets(), _unwrap() (+3 more)

### Community 12 - "math"
Cohesion: 0.18
Nodes (12): string_hash(), string_lower_hash(), sample_props(), sample_quat(), sample_scale(), sample_trans(), write_bundle(), write_clip() (+4 more)

### Community 13 - "utMenu.js"
Cohesion: 0.22
Nodes (17): activateCard(), BEAM, bindTilt(), BUST(), caseHtml(), installCardStyles(), nmSize(), PACK_COLORS (+9 more)

### Community 14 - "Animazioni (area, clip controllate su 25 personaggi)"
Cohesion: 0.13
Nodes (20): add_characters.py (retarget e registrazione nel roster), Animazioni (area, clip controllate su 25 personaggi), Scheletro Biped originale (Bip01), WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner), Rifare il pacchetto dal disco (retarget.py --export), Scheletro Mixamo, nis.py (decodifica scene .nis e walkout), retarget.py (retarget Biped -> Mixamo) (+12 more)

### Community 15 - "cardOf"
Cohesion: 0.20
Nodes (12): autoSquad(), canPlace(), cardOf(), fromBench(), inst(), listCard(), place(), quickSell() (+4 more)

### Community 16 - "Gioco (README)"
Cohesion: 0.09
Nodes (27): Ricompila e prova (build, playtest, uttest), Visualizzatore animazioni (Impostazioni), Peso gioco compilato (215 MB / 121 MB online / 89 MB itch), Azioni (passaggi, tiro, scivolate, finte), IA: uno pressa, uno marca, altri in posizione, Velocita animazioni adattata (0,6-1,4x), Visualizzatore delle 183 animazioni, Fisica del pallone (+19 more)

### Community 17 - "Super Mario Strikers: misure e dinamiche di riferimento"
Cohesion: 0.07
Nodes (32): Super Mario Strikers: misure e dinamiche di riferimento, Accelerazioni e virate (g_pTweaks, SeekSpeed, SeekDirection), Campo 41,20 x 24,17 m, porte 5,69 x 2,56 m, area di rigore, Collisione a capsula verticale, Convenzioni (Z in alto, fisica 50 Hz ODE, 30 fps, angoli 16 bit), Cosa resta da misurare (mesh, telecamera, tiri dei gregari), Effetto Magnus solo con barra >= 0,99, Fonti: main.dol G4QP01 e smstrikers-decomp (+24 more)

### Community 18 - "Economia di Ultimate Team (crediti, pacchetti, mercato)"
Cohesion: 0.11
Nodes (18): Numerata 1-10 (10 copie, teca graduata L3b), Economia di Ultimate Team (crediti, pacchetti, mercato), Come funzionano i giochi di questo tipo (FC e gacha), Confronto con FC (all'ora di gioco), Da tarare dopo, giocando (25 personaggi oggi, curva per 40), data/economy.json (numeri dell'economia), tools/economy_sim.py (simulatore dell'economia), Fonti (EA, futmind, gacha) (+10 more)

### Community 19 - "UiNav"
Cohesion: 0.12
Nodes (10): Input, PAD, PadMenus, padPressed(), padStick(), readPad(), readPads(), KB_KEYS (+2 more)

### Community 20 - "Regole del progetto"
Cohesion: 0.14
Nodes (12): Artifact privato del gioco (build di prova), Chat delle animazioni (in pausa, animazioni delle ulti), Chat delle regole del gioco (prossima, ramo magical-ride, VERIFICA.md, strikers_triggers.json), Dove andare (tabella aree), Calcio arcade: istruzioni per Claude, Pagina itch.io ristretta (goleador0702/strikers), Prossimi lavori (31 ottobre), Regole del progetto (+4 more)

### Community 22 - "Aggiungere un personaggio (procedura)"
Cohesion: 0.14
Nodes (18): Aggiungere un personaggio (procedura), Squadra pronta Avventurieri (Piccolo in porta), Squadra pronta Campioni (Vegeta capitano), Carta in ultimate-team/data/cards.json, Nome carta in i18n_ut.js (ut.char.<id>), recolor in roster.json (oggi false), game/assets/roster.json, dev/sheet.html: confronto con lo scheletro originale (+10 more)

### Community 23 - "Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album)"
Cohesion: 0.22
Nodes (8): Campo team della carta (nazionale nel walkout), Pacchetti P1 walkout a indizi, Apertura dei pacchetti P1 walkout a indizi, animation/data/strikers_nis.npz (da animation/nis.py), Capitano scelto nella Rosa (mai il portiere), Prossimo: piu esultanze originali, server privato, Stato: funziona (carte, pacchetti, walkout, mercato, Divisioni, album), 25 personaggi con carta (nazionale nel walkout)

### Community 24 - "holo.js"
Cohesion: 0.31
Nodes (9): bindHolo(), canvas(), installHolo(), rnd, SHINY, stickHolo(), textures(), cardHtml() (+1 more)

### Community 25 - "Interfaccia gioco: decisioni prese con l'utente"
Cohesion: 0.09
Nodes (26): Interfaccia gioco: decisioni prese con l'utente, Avvio del gioco (lingua, profilo), Bozze (pagina di prova Artifact, bozze-menu.html), Coppa Bullone Galattico (Ratchet & Clank), Coppa Lost Heaven (Mafia), Coppa Scimmie in Fuga (Ape Escape 3), Coppe (4 coppe a eliminazione diretta, portieri dal posto 4, torneo fino a 4 giocatori), Gioco rapido (umano/CPU, scelta lato, durata, difficolta) (+18 more)

### Community 26 - "Ultimate Team: decisioni prese con l'utente"
Cohesion: 0.14
Nodes (17): Ultimate Team, Holo scelti: Arcobaleno, Glitter, Lava, Prisma, Galassia, Ultimate Team: decisioni prese con l'utente, Album (2.000 per pagina, 25.000 album), Club nuovo (2.000 crediti, squadra 68, 3 panchina), Divisioni (CPU da 58 a 94, nomi hi-tech), Economia (rimando a ECONOMIA.md), Mercato simulato (14 offerte al giorno, 35%, tassa 5%) (+9 more)

### Community 27 - "cards.js"
Cohesion: 0.15
Nodes (8): avgOvr, CARD, CATALOG, CHARACTERS, HOLO_FX, RANK, RARITIES, SPECIAL

### Community 28 - "Player"
Cohesion: 0.16
Nodes (5): makePortraits(), angleDiff(), Player, seekDirection(), Carte con ritratto a mezzo busto calcolato dalla posa

### Community 29 - "Personaggi (characters/README.md)"
Cohesion: 0.16
Nodes (17): audit.py (controllo automatico clip), Risultati audit portiere (ground_float, dir Spine1), game/dev/sheet.html (controllo a occhio), Clip sollevate dai capelli voluminosi (centrocampista Rivali, Spike 19 clip), Celestini (squadra), Personaggi (characters/README.md), Personaggi singoli con nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta), Rivali (squadra) (+9 more)

### Community 30 - "test_converter.py"
Cohesion: 0.15
Nodes (10): world_mats(), contact_time(), check(), close(), game_world(), mul_rows(), qclose(), quat_rows() (+2 more)

### Community 31 - "sys"
Cohesion: 0.26
Nodes (6): draw(), main(), make_pool(), open_pack(), sale_value(), simulate()

### Community 32 - "stadium.js"
Cohesion: 0.20
Nodes (7): ledTexture(), perimeterPoints(), ringGeometry(), roundedRect(), Stadium, buildDecor(), stadiumTheme()

### Community 34 - "strikers_anim.py"
Cohesion: 0.16
Nodes (11): _biped_names(), _blender_add_curve(), _blender_cli(), _blender_fcurve_bag(), clip_states(), _common_args(), dump_json(), main() (+3 more)

### Community 35 - "stadiums.js"
Cohesion: 0.20
Nodes (15): BASE, clouds(), DECOR, ground(), instanced(), mountains(), palms(), rnd (+7 more)

### Community 36 - "main"
Cohesion: 0.15
Nodes (6): Glb, main(), quat_to_mat(), Rig, shrink_images(), write_glb()

### Community 37 - "import_into_blender"
Cohesion: 0.30
Nodes (8): import_into_blender(), load_chunks(), _load_cli(), load_clips(), load_retargets(), load_skeletons(), NameBook, test_blender()

### Community 40 - "retarget.py"
Cohesion: 0.16
Nodes (11): calibrate(), frame_from(), lowest_offset(), R(), mat_to_quat(), orthonormal(), retarget_clip(), W() (+3 more)

### Community 41 - "json"
Cohesion: 0.27
Nodes (5): check_rig(), main(), ball_at(), clip_ref(), main()

### Community 42 - "goalie.js"
Cohesion: 0.16
Nodes (16): SIZE, blendable(), blended(), BY_ID, CATCH, cellOf(), clamp(), DEFLECT (+8 more)

### Community 44 - "FormatError"
Cohesion: 0.16
Nodes (7): Chunk, _cstr(), FormatError, Retargets, Skeleton, top_level_chunks(), _u32()

### Community 45 - ".shootBall"
Cohesion: 0.20
Nodes (3): shootAtFast(), clamp01(), 1. Esito del tiro e parata

### Community 49 - "audit.py"
Cohesion: 0.36
Nodes (6): angle(), audit(), model_frames(), world(), rot_angle(), sample()

### Community 50 - "triggers.py"
Cohesion: 0.31
Nodes (5): decode(), event_names(), main(), read_disc(), string_hash()

### Community 52 - "ai.js"
Cohesion: 0.39
Nodes (8): bestPassTarget(), dist2(), fielderAI(), moveTo(), openness(), shapeSpot(), spot, TACKLE

### Community 53 - "game.js"
Cohesion: 0.15
Nodes (16): integrate(), predict(), tmp, BALL, FENCE, FIELD, PHYSICS_DT, SKILL_FROM_LEVEL (+8 more)

## Knowledge Gaps
- **73 isolated node(s):** `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `Pagine di sviluppo dev/`, `IA: uno pressa, uno marca, altri in posizione`, `Velocita animazioni adattata (0,6-1,4x)`, `Campo 41,2 x 24,2 m, porte 5,69 x 2,56 m` (+68 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 294 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tabella aree del progetto (scritta da make_map.py)` connect `make_map.py` to `Gioco (README)`, `Personaggi (characters/README.md)`, `Animazioni (area, clip controllate su 25 personaggi)`?**
  _High betweenness centrality (0.285) - this node is a cross-community bridge._
- **What connects `WALKOUT_CLIPS e CELEBRATIONS in nis.py (esultanze goal_winner)`, `Pagine di sviluppo dev/`, `IA: uno pressa, uno marca, altri in posizione` to the rest of the system?**
  _73 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game` be split into smaller, more focused modules?**
  _Cohesion score 0.11182795698924732 - nodes in this community are weakly interconnected._
- **Why does `Riferimento: il gioco originale` connect `make_map.py` to `main.js`?**
  _High betweenness centrality (0.207) - this node is a cross-community bridge._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10634920634920635 - nodes in this community are weakly interconnected._
- **Why does `Calcio arcade (progetto)` connect `make_map.py` to `build.mjs`, `Animazioni (area, clip controllate su 25 personaggi)`, `Gioco (README)`, `Economia di Ultimate Team (crediti, pacchetti, mercato)`, `Regole del progetto`, `Interfaccia gioco: decisioni prese con l'utente`, `Personaggi (characters/README.md)`?**
  _High betweenness centrality (0.184) - this node is a cross-community bridge._
- **Should `t` be split into smaller, more focused modules?**
  _Cohesion score 0.08020344287949922 - nodes in this community are weakly interconnected._