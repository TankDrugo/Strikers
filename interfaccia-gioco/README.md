# Interfaccia gioco

## Stato

**funziona** · Menu stile FC, profili, lingua, Gioco rapido, Coppe, Ultimate Team, pausa e fine partita.

Fatto:
- Menu stile FC: LB/RB tra le schede, Coppe e Ultimate Team come parti a sé con i loro colori
- Lingua all'avvio (italiano, inglese) e profili salvati nel browser
- Gioco rapido: contro la CPU, contro un amico, in due contro la CPU
- Coppe complete: 9 coppe (1° novembre: 5 nuove a tema dei nostri personaggi, ognuna nel suo stadio), stelle, Difficile, voto da D a Z, bacheca, tornei fino a 4 giocatori
- Scelta dello stadio in Gioco rapido (9 stadi a tema o Casuale)
- Bozze scelte: stile M1, holo, teca delle numerate, walkout P1
- Ultimate Team: Club, Rosa, Mercato, Divisioni, Album e apertura P1 con walkout 3D
- Scelta della squadra in Gioco rapido, Coppe e tornei: squadre pronte o formazione libera con capitano (`game/src/ui/squads.js`)
- Carte con ritratto a mezzo busto stile FUT, calcolato dalla posa (testa e capelli mai tagliati)
- In partita: indicatore G1–G4 stile FIFA sopra il giocatore controllato, barra della Super Strike

Prossimo:
- Suoni veri (CC0)

Decisioni prese con l'utente in [`DESIGN.md`](DESIGN.md); bozze visive in [`bozze/`](bozze/) (online: https://claude.ai/artifact/M9yMAgV1hSDitKZo9UgzLA). Il codice sta in `game/src/ui/`, `game/src/cups/` e `game/src/ut/` (non in `interfaccia-gioco/src/`), così lo compila `game/tools/build.mjs`.

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
