# Ultimate Team

**Stato: prima versione giocabile.** Dal menu del gioco: **Ultimate Team**. Regole in [`DESIGN.md`](DESIGN.md).

Collezioni carte dei personaggi, componi una squadra di 5 e la usi in partita contro squadre CPU; le partite danno crediti, i crediti comprano pacchetti. Le carte hanno statistiche che cambiano il gioco. I progressi si salvano online sul link privato del gioco (nel browser se il gioco è aperto dal file).

## File

| File | Cosa fa |
|---|---|
| `DESIGN.md` | Regole decise con l'utente: carte, statistiche, economia, pacchetti, walkout |
| `data/cards.js` | Le 50 carte (generato, non modificare a mano) |
| `tools/make_cards.mjs` | Genera `data/cards.js` da `game/assets/roster.json`: profili dei ruoli, rarità, carattere delle squadre |
| `src/core.js` | Regole pure: collezione, crediti, pacchetti, squadra, premi, avversari |
| `src/storage.js` | Salvataggio: database dell'Artifact (`data/users/<id>/ut`) o `localStorage` |
| `src/index.js` | Le schermate (hub, squadra, collezione, dettaglio carta, negozio, pacchetti, pre-partita, premi) e i ritratti delle carte |
| `src/walkout.js` | Il walkout dei pacchetti con le telecamere originali (`game/assets/walkout.json`) |
| `src/ui.css.js` | Stili delle schermate e delle carte |

## Con cosa si collega

| Parte | Collegamento |
|---|---|
| `game/src/main.js` | Crea `UltimateTeam` e gli passa il contesto (three.js, renderer, personaggi, `startMatch`, ecc.): questa cartella non importa file del gioco |
| `game/src/game.js` | `new Game(..., { lineups, teams })`: le carte riempiono i 5 posti di ogni squadra |
| `game/src/stats.js` | Da statistiche della carta a valori di gioco (a 75 = originale) |
| `game/assets/roster.json` | I personaggi: ognuno ha 5 carte. Un personaggio nuovo diventa carte rigenerando `data/cards.js` |
| `animation/nis.py` | Clip e telecamere del walkout |
| `interfaccia-gioco/` | Le schermate sono qui, con lo stile dei menu esistenti; se l'interfaccia cambia stile, `ui.css.js` va allineato |

## Prova

```bash
cd game && node tools/build.mjs && node tools/uttest.cjs
```

Pacchetto di benvenuto, squadra, pacchetto Oro con walkout, partita CPU con le carte, crediti e salvataggio. Con un secondo argomento salva le schermate: `node tools/uttest.cjs dist/gioco.html /tmp/ut`.

## Prossimi passi possibili

- Mercato tra carte (scambio crediti/carte), obiettivi e sfide settimanali.
- Più personaggi = più carte: basta aggiungerli al roster e rigenerare.
- Squadre avversarie con livelli di difficoltà (oggi la IA è uguale, cambiano solo le carte).
