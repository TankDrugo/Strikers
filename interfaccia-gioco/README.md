# Interfaccia gioco

**Stato: da iniziare.** Questa cartella è pronta per il lavoro: quando l'utente dice "lavoriamo sull'interfaccia", si parte da qui.

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

## Da decidere prima di scrivere codice

1. Stile grafico: riferimenti visivi, colori, caratteri.
2. Quali schermate servono per prime.
3. Restare in HTML/CSS sopra il canvas (come ora) o disegnare l'interfaccia in three.js?
4. Lingue: solo italiano o anche inglese?

## Struttura proposta (da confermare)

```
interfaccia-gioco/
  README.md        questo file
  DESIGN.md        stile e schermate decise con l'utente
  src/             componenti dell'interfaccia, importati da game/src/main.js
```
