# Calcio arcade

Gioco di calcio arcade 5 contro 5 con le proporzioni e le dinamiche di Super Mario Strikers (GameCube, 2005), ricostruite dai file del gioco originale e dal codice decompilato.

## Stato

Istruzioni per Claude, mappa e grafo.

Fatto:
- Repository su GitHub (TankDrugo/Strikers), organizzato per aree
- Grafo e mappa del progetto, aggiornati a ogni commit
- Istruzioni per le nuove chat (CLAUDE.md)

Prossimo:
- Tenere aggiornata la sezione Stato di ogni README: la mappa la legge da lì

> **Repository privato, uso personale.** Le animazioni in `animation/data/` e `game/assets/characters/` derivano dal disco di proprietà dell'autore. Non rendere pubblico il repository e non pubblicare il gioco compilato. I file grezzi del disco non sono nel repository.

## Mappa del progetto

<!-- aree:inizio (scritta da docs/make_map.py dalle sezioni Stato dei README: non modificare a mano) -->
| Area | Cartella | Stato |
|---|---|---|
| **Riferimento** (Misure e dinamiche del gioco originale, con le fonti. In corso il confronto di tutta la partita col codice ricostruito (`VERIFICA.md`)) | [`reference/`](reference/README.md) | in verifica |
| **Animazioni** (Clip originali decodificate, retarget sugli scheletri Mixamo, controlli automatici) | [`animation/`](animation/README.md) | funziona |
| **Personaggi** (Modelli dei giocatori, roster e formazioni delle due squadre) | [`characters/`](characters/README.md) | completo |
| **Gioco** (Partita 5 contro 5: campo, stadio, pallone, giocatori, IA, comandi) | [`game/`](game/README.md) | funziona |
| **Interfaccia gioco** (Menu stile FC, profili, lingua, Gioco rapido, Coppe, Ultimate Team, pausa e fine partita) | [`interfaccia-gioco/`](interfaccia-gioco/README.md) | funziona |
| **Ultimate Team** (Club, Rosa, Mercato, Divisioni e Album nel menu, pacchetti con walkout) | [`ultimate-team/`](ultimate-team/README.md) | funziona |
<!-- aree:fine -->

Il grafo del progetto è in [`graphify-out/`](graphify-out/): `graph.html` (grafo interattivo), `GRAPH_REPORT.md` (sintesi), `graph.json` (dati). La mappa navigabile è [`docs/mappa.html`](docs/mappa.html). Come aggiornarli: [`docs/grafo.md`](docs/grafo.md).

## Giocare

```bash
cd game && npm install && node tools/build.mjs
```

Poi apri `game/dist/gioco.html` con un doppio clic. Oppure gioca dal link privato, sempre aggiornato: https://claude.ai/artifact/Ru4U9NJSLMxgRX2bcmH9HH. Comandi (controller Xbox o tastiera) in [`game/README.md`](game/README.md).

## Lavorare con Claude

Apri una nuova chat nel progetto e indica l'area, per esempio "lavoriamo su Ultimate Team". [`CLAUDE.md`](CLAUDE.md) dice a Claude dove andare e quali regole seguire.
