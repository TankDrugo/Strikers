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
- **Dopo ogni modifica al gioco, aggiorna il link online:** `node game/tools/build.mjs --web --prova`, poi pubblica `game/dist/web-prova/index.html` con **tutti** i file di `game/dist/web-prova/assets/` sull'Artifact qui sopra (parametro `url`), in più passi (al massimo 10 personaggi per passo, oggi 3) perché il totale (121 MB con 25 personaggi) supera i 64 MB per pubblicazione: l'utente vuole sempre il gioco completo e aggiornato. Poi anche itch.io: `node game/tools/build.mjs --itch` e `butler push` sulla pagina ristretta https://goleador0702.itch.io/strikers. Dettagli in `game/README.md`, sezioni Link online e itch.io.
- **Mai aggiungere file del disco** (`.sanim`, `.shier`, `.bin`, `.trg`, `.nis`, `main.dol`, `.iso`, `.zip` del disco). Sono in `.gitignore`. Le animazioni decodificate stanno già in `animation/data/strikers_source.npz` e `animation/data/strikers_nis.npz`.
- **Nessun nome o marchio Nintendo** nel gioco (testi, stadio, interfaccia). I nomi originali compaiono solo in `reference/` e `animation/`, come fonte.
- Le misure vengono da `reference/STRIKERS_REFERENCE.md`. Se cambi un valore rispetto all'originale, scrivilo nel commento accanto (esempio: `SIZE` e `BALL.radius` in `game/src/config.js`).
- Dopo ogni modifica al gioco: `node game/tools/build.mjs` e una partita CPU contro CPU senza errori (vedi `game/README.md`, sezione Prove).
- Dopo una modifica a `game/`, `animation/` o ai README, aggiorna il grafo (`docs/grafo.md`).
- Quando un lavoro cambia lo stato di un'area, aggiorna la sezione `## Stato` del README di quell'area (stato, `Fatto:`, `Prossimo:`): mappa e tabella del `README.md` principale la leggono da lì con `python3 docs/make_map.py`.

## Stato al passaggio di consegne

- Gioco: partita completa 5v5 giocabile con controller Xbox (stile EA FC) o tastiera. Stadio originale. Giocatori 1,3 volte più grandi dell'originale (`SIZE`), pallone più piccolo (raggio 0,13 m): scelta dell'utente.
- Animazioni: 183 clip (84 giocatore, 99 portiere) controllate tutte, a occhio e con `animation/audit.py`. Più 3 clip del walkout (corsa e 2 esultanze) dalle scene `.nis` (`animation/nis.py`).
- Personaggi: completi. Due squadre da 5 ruoli (portiere, difensore, centrocampista, ala, attaccante): **Celestini** (maglia celeste) e **Rivali** (maglia verde), più 15 personaggi singoli con la loro nazionale (Big Smoke Belgio, Crilin Giappone, Dastardly Croazia, Goku Spagna, Goku SSJ Germania, Jak Paesi Bassi, Kairi Colombia, Piccolo Norvegia (portiere), Ratchet Inghilterra, Riku Uruguay, Roxas Senegal, Snake Stati Uniti, Sora Argentina, Spike Brasile, Vegeta Italia) nelle squadre pronte Leggende, Nazionali, Avventurieri e Campioni (`squads` in `roster.json`); tutti con le 183 animazioni. Gioco rapido, Coppe e tornei hanno la scelta della squadra e un editor della formazione con il capitano (`game/src/ui/squads.js`). Nomi e colori delle squadre (anelli, punteggio, tabellone, tifosi) vengono da `teamInfo` in `game/assets/roster.json`.
- Il gioco compilato pesa circa 215 MB (25 personaggi da circa 8-9 MB l'uno, metà mesh e metà animazioni); la versione online 121 MB, pubblicata in tre passi da 10 personaggi al massimo (`game/README.md`, Link online); lo zip per itch.io 89 MB.
- Interfaccia gioco: menu stile FC con LB/RB, lingua, profili, Gioco rapido anche in due, **Coppe complete** (stelle, Difficile, voto D–Z, tornei fino a 4) e **Ultimate Team**. Decisioni in `interfaccia-gioco/DESIGN.md`, codice in `game/src/ui/`, `game/src/cups/` e `game/src/ut/`.
- Portiere: parata decisa dal tempo del tuffo come nell'originale (non a dado), tarata a circa un tiro su cinque.
- Ultimate Team: giocabile nel menu (Club, Rosa, Mercato, Divisioni, Album, pacchetti con walkout P1). Le carte cambiano il gioco (`game/src/stats.js`, a 75 = originale). Regole ed economia in `ultimate-team/DESIGN.md`, `ECONOMIA.md`, numeri in `ultimate-team/data/`. Esultanze originali: 2 su 10, le altre aspettano altri file `goal_winner` dal disco.
- Super Strike: fatta (31 ottobre), come nell'originale: solo il capitano, nella metà campo avversaria, carica 1,6 s, due lancette sul verde scuro (0,84 e 0,16), rallentatore 0,72, vale 2 gol. Numeri e stime in `SUPER` di `game/src/config.js`, prova `game/tools/supertest.cjs`. Indicatore G1–G4 stile FIFA sopra il giocatore controllato. Carte con ritratto a mezzo busto stile FUT.
- Il gioco legge `ultimate-team/data/*.json`: la pagina di sviluppo si serve dalla cartella principale (`game/dev/index.html`).

## Ordine dei lavori tra le chat (deciso con l'utente il 31 ottobre, pomeriggio)

I rami si stavano incrociando: si lavora **in quest'ordine**, una chat alla volta sul `main`. Prima di iniziare controlla a che punto sei qui sotto e parti dall'ultimo `main`.

1. **Chat dei nuovi personaggi `.glb`**: **finita e sul `main`** (31 ottobre, sera; ramo `claude/charming-mayer-ck93f3`). L'utente ha detto che i personaggi sono finiti: 10 nuovi in questa chat (Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta), 25 in tutto. Da qui `characters/`, `game/assets/` e `roster.json` sono di nuovo liberi.
2. **Chat delle animazioni**: **in pausa**. Riparte solo dopo il punto 3, per mettere le animazioni delle ulti (Super Strike / mosse speciali) secondo le regole fissate lì.
3. **Chat delle regole del gioco** (prossima; ramo `claude/magical-ride-ltcq1k`: `reference/VERIFICA.md`, tabelle del disco, trigger delle animazioni in `animation/data/strikers_triggers.json`): finisce l'analisi delle regole, dei criteri del portiere e delle animazioni delle ulti, poi merge sul `main` **dopo** il punto 1 (ribasando sul `main` aggiornato). Poi si fa il punto 2.
4. **Verifica finale**: gioco completo e funzionante (build, partita CPU contro CPU, Super Strike, Coppe, Ultimate Team), pulizia di grafo e mappa (`graphify update .`, `/graphify . --update`, `python3 docs/make_map.py`), pubblicazione della versione definitiva sull'Artifact privato e su itch.io. Solo dopo: server privato (punto 3 della lista sotto).

Regola: un solo ramo aperto alla volta verso il `main`; chi finisce fa merge e lo segna qui.

## Prossimi lavori (decisi con l'utente il 31 ottobre)

Il ramo aggiornato è `main`: contiene menu, Coppe e Ultimate Team. Prima di lavorare controlla che il tuo ramo parta dall'ultimo `main` (`git log origin/main -1`).

1. **itch.io privato**: fatto. Pagina ristretta https://goleador0702.itch.io/strikers; dopo ogni modifica al gioco anche `node game/tools/build.mjs --itch` e `butler push game/dist/itch goleador0702/strikers:html5` (permesso per butler dato dall'utente il 31 ottobre; procedura in `game/README.md`, sezione itch.io). Le opzioni della pagina (gioco nel browser, 1280×720, accesso agli amici) le cambia l'utente dal sito.
2. **Nuovi personaggi**: l'utente carica i `.glb` già riggati (Mixamo). Procedura completa in `characters/README.md`, sezione "Aggiungere un personaggio", compresi Ultimate Team (`ultimate-team/data/cards.json`, nomi in `game/src/ui/i18n_ut.js`) e Coppe (le squadre CPU rimescolano tutti i personaggi del roster). Fatti i primi 5 (31 ottobre): Big Smoke, Crilin, Dastardly, Goku, Goku SSJ; poi altri 10 (31 ottobre, sera): Jak, Kairi, Piccolo, Ratchet, Riku, Roxas, Snake, Sora, Spike, Vegeta (squadre pronte in `squads` di `roster.json`). Per ora l'utente non ne ha altri. Attenzione al peso: ogni personaggio vale circa 4,8 MB online e il link ha un limite di 64 MB per pubblicazione (oggi 121 MB in tutto): si pubblica in più passi da 10 personaggi.
3. **Server privato (Oracle)**: quando l'utente lo ha, il salvataggio dei profili passa dal solo modulo `game/src/ui/save.js` (deciso in `interfaccia-gioco/DESIGN.md`); il registro delle numerate (`save.registry()`) diventa globale sul server; il mercato simulato potrà diventare vero (`ultimate-team/ECONOMIA.md`).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships. The navigable map for the user is docs/mappa.html.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>" --undirected` for relationships and `graphify explain "<concept>"` for focused concepts.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` (AST only, no API cost), then `python3 docs/make_map.py`. After changing READMEs or docs, run `/graphify . --update` so the doc concepts are re-extracted.
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it is expected.
