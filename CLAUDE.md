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

- **Repository privato, uso personale.** Le animazioni derivano dal disco dell'utente. Mai rendere pubblico il repository. Il gioco compilato si pubblica **solo** sull'Artifact privato del gioco, https://claude.ai/artifact/Ru4U9NJSLMxgRX2bcmH9HH (build di prova, con 10 milioni di crediti), e su una pagina itch.io **ristretta** dell'utente per gli amici (deciso il 31 ottobre), mai su un link nuovo o pubblico.
- **Dopo ogni modifica al gioco, aggiorna il link online:** `node game/tools/build.mjs --web --prova`, poi pubblica `game/dist/web-prova/index.html` con **tutti** i file di `game/dist/web-prova/assets/` sull'Artifact qui sopra (parametro `url`), in due passi perché il totale (74 MB) supera i 64 MB per pubblicazione: l'utente vuole sempre il gioco completo e aggiornato. Per itch.io: `node game/tools/build.mjs --itch`. Dettagli in `game/README.md`, sezioni Link online e itch.io.
- **Mai aggiungere file del disco** (`.sanim`, `.shier`, `.bin`, `.trg`, `.nis`, `main.dol`, `.iso`, `.zip` del disco). Sono in `.gitignore`. Le animazioni decodificate stanno già in `animation/data/strikers_source.npz` e `animation/data/strikers_nis.npz`.
- **Nessun nome o marchio Nintendo** nel gioco (testi, stadio, interfaccia). I nomi originali compaiono solo in `reference/` e `animation/`, come fonte.
- Le misure vengono da `reference/STRIKERS_REFERENCE.md`. Se cambi un valore rispetto all'originale, scrivilo nel commento accanto (esempio: `SIZE` e `BALL.radius` in `game/src/config.js`).
- Dopo ogni modifica al gioco: `node game/tools/build.mjs` e una partita CPU contro CPU senza errori (vedi `game/README.md`, sezione Prove).
- Dopo una modifica a `game/`, `animation/` o ai README, aggiorna il grafo (`docs/grafo.md`).
- Quando un lavoro cambia lo stato di un'area, aggiorna la sezione `## Stato` del README di quell'area (stato, `Fatto:`, `Prossimo:`): mappa e tabella del `README.md` principale la leggono da lì con `python3 docs/make_map.py`.

## Stato al passaggio di consegne

- Gioco: partita completa 5v5 giocabile con controller Xbox (stile EA FC) o tastiera. Stadio originale. Giocatori 1,3 volte più grandi dell'originale (`SIZE`), pallone più piccolo (raggio 0,13 m): scelta dell'utente.
- Animazioni: 183 clip (84 giocatore, 99 portiere) controllate tutte, a occhio e con `animation/audit.py`. Più 3 clip del walkout (corsa e 2 esultanze) dalle scene `.nis` (`animation/nis.py`).
- Personaggi: completi. Due squadre da 5 ruoli (portiere, difensore, centrocampista, ala, attaccante): **Celestini** (maglia celeste) e **Rivali** (maglia verde), più 5 personaggi singoli con la loro nazionale (Big Smoke Belgio, Crilin Giappone, Dastardly Croazia, Goku Spagna, Goku SSJ Germania) nelle squadre pronte Leggende e Nazionali (`squads` in `roster.json`); tutti con le 183 animazioni. Gioco rapido, Coppe e tornei hanno la scelta della squadra e un editor della formazione con il capitano (`game/src/ui/squads.js`). Nomi e colori delle squadre (anelli, punteggio, tabellone, tifosi) vengono da `teamInfo` in `game/assets/roster.json`.
- Il gioco compilato pesa circa 131 MB (15 personaggi da circa 8-9 MB l'uno, metà mesh e metà animazioni); la versione online 74 MB, pubblicata in due passi (`game/README.md`, Link online); lo zip per itch.io 54 MB.
- Interfaccia gioco: menu stile FC con LB/RB, lingua, profili, Gioco rapido anche in due, **Coppe complete** (stelle, Difficile, voto D–Z, tornei fino a 4) e **Ultimate Team**. Decisioni in `interfaccia-gioco/DESIGN.md`, codice in `game/src/ui/`, `game/src/cups/` e `game/src/ut/`.
- Portiere: parata decisa dal tempo del tuffo come nell'originale (non a dado), tarata a circa un tiro su cinque.
- Ultimate Team: giocabile nel menu (Club, Rosa, Mercato, Divisioni, Album, pacchetti con walkout P1). Le carte cambiano il gioco (`game/src/stats.js`, a 75 = originale). Regole ed economia in `ultimate-team/DESIGN.md`, `ECONOMIA.md`, numeri in `ultimate-team/data/`. Esultanze originali: 2 su 10, le altre aspettano altri file `goal_winner` dal disco.
- Super Strike: fatta (31 ottobre), come nell'originale: solo il capitano, nella metà campo avversaria, carica 1,6 s, due lancette sul verde scuro (0,84 e 0,16), rallentatore 0,72, vale 2 gol. Numeri e stime in `SUPER` di `game/src/config.js`, prova `game/tools/supertest.cjs`. Indicatore G1–G4 stile FIFA sopra il giocatore controllato. Carte con ritratto a mezzo busto stile FUT.
- Il gioco legge `ultimate-team/data/*.json`: la pagina di sviluppo si serve dalla cartella principale (`game/dev/index.html`).

## Prossimi lavori (decisi con l'utente il 31 ottobre)

Il ramo aggiornato è `main`: contiene menu, Coppe e Ultimate Team. Prima di lavorare controlla che il tuo ramo parta dall'ultimo `main` (`git log origin/main -1`).

1. **itch.io privato**: pagina del gioco con visibilità Ristretta per gli amici. Le API di itch.io non creano pagine: l'utente crea la pagina (tipo HTML) sul sito, poi Claude carica `game/dist/itch/` con butler (`butler push game/dist/itch goleador0702/<pagina>:html5`; serve il permesso di scaricare ed eseguire butler nella sessione). Lo zip pronto è `game/dist/calcio-arcade-itch.zip` (`node game/tools/build.mjs --itch`).
2. **Nuovi personaggi**: l'utente carica i `.glb` già riggati (Mixamo). Procedura completa in `characters/README.md`, sezione "Aggiungere un personaggio", compresi Ultimate Team (`ultimate-team/data/cards.json`, nomi in `game/src/ui/i18n_ut.js`) e Coppe (le squadre CPU rimescolano tutti i personaggi del roster). Fatti i primi 5 (31 ottobre): Big Smoke, Crilin, Dastardly, Goku, Goku SSJ (squadre pronte in `squads` di `roster.json`). Attenzione al peso: ogni personaggio vale circa 4,5 MB online e il link ha un limite di 64 MB per pubblicazione (oggi 74 MB in tutto): si pubblica in più passi.
3. **Server privato (Oracle)**: quando l'utente lo ha, il salvataggio dei profili passa dal solo modulo `game/src/ui/save.js` (deciso in `interfaccia-gioco/DESIGN.md`); il registro delle numerate (`save.registry()`) diventa globale sul server; il mercato simulato potrà diventare vero (`ultimate-team/ECONOMIA.md`).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships. The navigable map for the user is docs/mappa.html.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>" --undirected` for relationships and `graphify explain "<concept>"` for focused concepts.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` (AST only, no API cost), then `python3 docs/make_map.py`. After changing READMEs or docs, run `/graphify . --update` so the doc concepts are re-extracted.
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it is expected.
