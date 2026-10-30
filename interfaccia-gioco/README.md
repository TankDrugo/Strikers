# Interfaccia gioco

**Stato: in progettazione.** Decisioni prese con l'utente in [`DESIGN.md`](DESIGN.md); bozze visive da scegliere in [`bozze/`](bozze/) (online: https://claude.ai/artifact/M9yMAgV1hSDitKZo9UgzLA). Codice del nuovo menu non ancora scritto.

## Idea

Tutto quello che il giocatore vede fuori dal campo e sopra il campo: menu, schermate prima e dopo la partita, scelta delle squadre, pausa, HUD in partita, impostazioni (comandi, telecamera, audio).

## Cosa esiste già (prototipo)

| Dove | Cosa |
|---|---|
| `game/src/main.js` | Menu principale (Gioca, Guarda CPU contro CPU, Visualizzatore animazioni), pausa con Ricomincia, schermata comandi, visualizzatore delle animazioni, suoni sintetici. HTML e CSS scritti nel codice |
| `game/src/hud.js` | HUD in partita: punteggio, tempo, barra di carica del tiro, scritte (GOL!, fine partita, statistiche) |
| `game/src/input.js` | `PadMenus`: navigazione dei menu con il controller (croce o levetta, A conferma, B indietro) |
| `game/src/stadium.js` | Tabellone dello stadio e cartelloni LED: interfaccia "dentro" lo stadio |

Funziona, ma è grezzo: niente stile coerente, niente transizioni, testi solo in italiano.

## Con cosa si collega

- **Ultimate Team** (`ultimate-team/`): collezione, pacchetti e formazione sono schermate.
- **Personaggi** (`game/assets/roster.json`): la scelta delle squadre prima della partita.
- **Comandi** (`game/src/input.js`): ogni schermata deve funzionare con controller Xbox e tastiera.

## Ancora da decidere

1. Scelte sulle bozze (stile del menu, holo, top loader, pacchetti): vedi `DESIGN.md`.
2. Nomi delle 4 coppe.
3. Restare in HTML/CSS sopra il canvas (come ora): proposta sì, le bozze sono già in HTML/CSS.

## Struttura proposta (da confermare)

```
interfaccia-gioco/
  README.md        questo file
  DESIGN.md        stile e schermate decise con l'utente
  bozze/           pagina di prova con le proposte visive
  src/             componenti dell'interfaccia, importati da game/src/main.js
```
