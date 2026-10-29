# Calcio arcade

Gioco di calcio arcade 5 contro 5 con le proporzioni e le dinamiche di Super Mario Strikers (GameCube, 2005), ricostruite dai file del gioco originale e dal codice decompilato.

> **Repository privato, uso personale.** Le animazioni in `animation/data/` e `game/assets/characters/` derivano dal disco di proprietà dell'autore. Non rendere pubblico il repository e non pubblicare il gioco compilato. I file grezzi del disco non sono nel repository.

## Mappa del progetto

| Area | Cartella | Stato |
|---|---|---|
| **Gioco** (prototipo giocabile: campo, stadio, pallone, giocatori, IA, comandi) | [`game/`](game/README.md) | funziona |
| **Animazioni** (decodifica delle clip originali, retarget sui personaggi, controlli) | [`animation/`](animation/README.md) | funziona |
| **Personaggi** (modelli riggati Mixamo da mettere in squadra) | [`characters/`](characters/README.md) | 1 su 10 |
| **Riferimento** (misure e dinamiche del gioco originale, con le fonti) | [`reference/`](reference/README.md) | completo |
| **Ultimate Team** (collezione di giocatori, carte, squadre) | [`ultimate-team/`](ultimate-team/README.md) | da iniziare |
| **Interfaccia gioco** (menu, HUD, schermate) | [`interfaccia-gioco/`](interfaccia-gioco/README.md) | da iniziare |

Il grafo del progetto è in [`graphify-out/`](graphify-out/): `graph.html` (grafo interattivo), `GRAPH_REPORT.md` (sintesi), `graph.json` (dati). La mappa navigabile è [`docs/mappa.html`](docs/mappa.html). Come aggiornarli: [`docs/grafo.md`](docs/grafo.md).

## Giocare

```bash
cd game && npm install && node tools/build.mjs
```

Poi apri `game/dist/gioco.html` con un doppio clic. Comandi (controller Xbox o tastiera) in [`game/README.md`](game/README.md).

## Lavorare con Claude

Apri una nuova chat nel progetto e indica l'area, per esempio "lavoriamo su Ultimate Team". [`CLAUDE.md`](CLAUDE.md) dice a Claude dove andare e quali regole seguire.
