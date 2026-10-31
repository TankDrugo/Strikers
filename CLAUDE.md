# Calcio arcade: istruzioni per Claude

Gioco di calcio arcade 5 contro 5 (three.js, un solo file HTML) con proporzioni e dinamiche di Super Mario Strikers. L'utente scrive in italiano: rispondi in italiano. Codice, commenti e nomi nel codice in inglese, come quelli esistenti.

## Dove andare

Quando l'utente nomina un'area, leggi prima il README di quella cartella: dice cosa c'è, cosa manca e da dove partire.

| L'utente dice… | Vai in | Leggi prima |
|---|---|---|
| "gioco", "partita", "fisica", "pallone", "IA", "comandi", "controller", "stadio", "telecamera" | `game/` | `game/README.md`, poi `game/src/config.js` |
| "animazioni", "retarget", "clip", "pose" | `animation/` | `animation/README.md` |
| "personaggi", "nuovo personaggio", "squadre", "roster" | `characters/` e `game/assets/roster.json` | `characters/README.md` |
| "misure", "proporzioni", "com'era nell'originale", "Strikers" | `reference/` | `reference/STRIKERS_REFERENCE.md` |
| "Ultimate Team", "carte", "collezione", "pacchetti", "walkout" | `ultimate-team/` | `ultimate-team/README.md` |
| "interfaccia", "menu", "HUD", "schermate", "UI" | `interfaccia-gioco/` | `interfaccia-gioco/README.md` |
| "grafo", "mappa", "graphify" | `graphify-out/`, `docs/` | `docs/grafo.md` |

Per capire come si collegano le parti, interroga il grafo prima di leggere file a caso:

```bash
graphify query "come arriva un personaggio in campo"
graphify explain "Player"
graphify path "add_characters.py" "Player" --undirected
```

(`pip install graphifyy` se manca il comando.)

## Regole del progetto

- **Repository privato, uso personale.** Le animazioni derivano dal disco dell'utente. Mai rendere pubblico il repository. Il gioco compilato si pubblica **solo** sull'Artifact privato del gioco, https://claude.ai/artifact/Ru4U9NJSLMxgRX2bcmH9HH, mai su un link nuovo o pubblico.
- **Dopo ogni modifica al gioco, aggiorna il link online:** `node game/tools/build.mjs --web`, poi pubblica `game/dist/web/index.html` con tutti i file di `game/dist/web/assets/` sull'Artifact qui sopra (parametro `url`). Dettagli in `game/README.md`, sezione Link online.
- **Mai aggiungere file del disco** (`.sanim`, `.shier`, `.bin`, `.trg`, `.nis`, `main.dol`, `.iso`, `.zip` del disco). Sono in `.gitignore`. Le animazioni decodificate stanno già in `animation/data/strikers_source.npz` e `animation/data/strikers_nis.npz`.
- **Nessun nome o marchio Nintendo** nel gioco (testi, stadio, interfaccia). I nomi originali compaiono solo in `reference/` e `animation/`, come fonte.
- Le misure vengono da `reference/STRIKERS_REFERENCE.md`. Se cambi un valore rispetto all'originale, scrivilo nel commento accanto (esempio: `SIZE` e `BALL.radius` in `game/src/config.js`).
- Dopo ogni modifica al gioco: `node game/tools/build.mjs` e una partita CPU contro CPU senza errori (vedi `game/README.md`, sezione Prove).
- Dopo una modifica a `game/`, `animation/` o ai README, aggiorna il grafo (`docs/grafo.md`).
- Quando un lavoro cambia lo stato di un'area, aggiorna la sezione `## Stato` del README di quell'area (stato, `Fatto:`, `Prossimo:`): mappa e tabella del `README.md` principale la leggono da lì con `python3 docs/make_map.py`.

## Stato al passaggio di consegne

- Gioco: partita completa 5v5 giocabile con controller Xbox (stile EA FC) o tastiera. Stadio originale. Giocatori 1,3 volte più grandi dell'originale (`SIZE`), pallone più piccolo (raggio 0,13 m): scelta dell'utente.
- Animazioni: 183 clip (84 giocatore, 99 portiere) controllate tutte, a occhio e con `animation/audit.py`. Più 3 clip del walkout (corsa e 2 esultanze) dalle scene `.nis` (`animation/nis.py`).
- Personaggi: completi. Due squadre da 5 ruoli (portiere, difensore, centrocampista, ala, attaccante): **Celestini** (maglia celeste) e **Rivali** (maglia verde), tutti con le 183 animazioni. Nomi e colori delle squadre (anelli, punteggio, tabellone, tifosi) vengono da `teamInfo` in `game/assets/roster.json`.
- Il gioco compilato pesa circa 91 MB (10 personaggi da circa 9 MB l'uno, metà mesh e metà animazioni).
- Interfaccia gioco: menu stile FC con LB/RB, lingua, profili, Gioco rapido anche in due, **Coppe complete** (stelle, Difficile, voto D–Z, tornei fino a 4) e **Ultimate Team**. Decisioni in `interfaccia-gioco/DESIGN.md`, codice in `game/src/ui/`, `game/src/cups/` e `game/src/ut/`.
- Portiere: parata decisa dal tempo del tuffo come nell'originale (non a dado), tarata a circa un tiro su cinque.
- Ultimate Team: giocabile nel menu (Club, Rosa, Mercato, Divisioni, Album, pacchetti con walkout P1). Le carte cambiano il gioco (`game/src/stats.js`, a 75 = originale). Regole ed economia in `ultimate-team/DESIGN.md`, `ECONOMIA.md`, numeri in `ultimate-team/data/`. Esultanze originali: 2 su 10, le altre aspettano altri file `goal_winner` dal disco.
- Il gioco legge `ultimate-team/data/*.json`: la pagina di sviluppo si serve dalla cartella principale (`game/dev/index.html`).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships. The navigable map for the user is docs/mappa.html.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>" --undirected` for relationships and `graphify explain "<concept>"` for focused concepts.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` (AST only, no API cost), then `python3 docs/make_map.py`. After changing READMEs or docs, run `/graphify . --update` so the doc concepts are re-extracted.
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it is expected.
