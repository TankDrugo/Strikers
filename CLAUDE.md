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
| "Ultimate Team", "carte", "collezione", "pacchetti" | `ultimate-team/` | `ultimate-team/README.md` |
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

- **Repository privato, uso personale.** Le animazioni derivano dal disco dell'utente. Mai rendere pubblico il repository, mai pubblicare il gioco compilato o i dati di animazione come Artifact o altrove.
- **Mai aggiungere file del disco** (`.sanim`, `.shier`, `.bin`, `.trg`, `main.dol`, `.iso`, `.zip` del disco). Sono in `.gitignore`. Le animazioni decodificate stanno già in `animation/data/strikers_source.npz`.
- **Nessun nome o marchio Nintendo** nel gioco (testi, stadio, interfaccia). I nomi originali compaiono solo in `reference/` e `animation/`, come fonte.
- Le misure vengono da `reference/STRIKERS_REFERENCE.md`. Se cambi un valore rispetto all'originale, scrivilo nel commento accanto (esempio: `SIZE` e `BALL.radius` in `game/src/config.js`).
- Dopo ogni modifica al gioco: `node game/tools/build.mjs` e una partita CPU contro CPU senza errori (vedi `game/README.md`, sezione Prove).
- Dopo una modifica a `game/`, `animation/` o ai README, aggiorna il grafo (`docs/grafo.md`).

## Stato al passaggio di consegne

- Gioco: partita completa 5v5 giocabile con controller Xbox (stile EA FC) o tastiera. Stadio originale. Giocatori 1,3 volte più grandi dell'originale (`SIZE`), pallone più piccolo (raggio 0,13 m): scelta dell'utente.
- Animazioni: 183 clip (84 giocatore, 99 portiere) controllate tutte, a occhio e con `animation/audit.py`.
- Personaggi: completi. Due squadre da 5 ruoli (portiere, difensore, centrocampista, ala, attaccante): **Celestini** (maglia celeste) e **Rivali** (maglia verde), tutti con le 183 animazioni. Nomi e colori delle squadre (anelli, punteggio, tabellone, tifosi) vengono da `teamInfo` in `game/assets/roster.json`.
- Il gioco compilato pesa circa 89 MB (10 personaggi da circa 9 MB l'uno, metà mesh e metà animazioni).
- Ultimate Team e Interfaccia gioco: cartelle pronte, lavoro non iniziato.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships. The navigable map for the user is docs/mappa.html.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>" --undirected` for relationships and `graphify explain "<concept>"` for focused concepts.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` (AST only, no API cost), then `python3 docs/make_map.py`. After changing READMEs or docs, run `/graphify . --update` so the doc concepts are re-extracted.
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it is expected.
