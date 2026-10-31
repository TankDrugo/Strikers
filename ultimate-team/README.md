# Ultimate Team

## Stato

**funziona** · Club, Rosa, Mercato, Divisioni e Album nel menu, pacchetti con walkout.

Fatto:
- Carte con statistiche che cambiano il gioco (a 75 = valori originali)
- Pacchetti con probabilità dichiarate, protezione holo, numerate 1-10 e 1/1 uniche
- Walkout P1: indizi, corsa e esultanza originale in 3D, teca per numerate e 1/1
- Mercato simulato, Divisioni da 10 partite, obiettivi del giorno, Album con premi
- Prova automatica (game/tools/uttest.cjs)
- 20 personaggi con carta: anche Big Smoke, Crilin, Dastardly, Goku, Goku SSJ, Jak, Kairi, Piccolo, Ratchet e Riku (nazionale nel walkout)
- Capitano scelto nella Rosa (solo lui fa la Super Strike, mai il portiere)
- Build di prova con 10 milioni di crediti sul link privato (`node game/tools/build.mjs --web --prova`, prova `game/tools/packtest.cjs`)

Prossimo:
- Più esultanze originali: servono altri file goal_winner dal disco (oggi 2 su 10)
- Server privato: salvataggio online e numerate uniche per tutti

Regole in [`DESIGN.md`](DESIGN.md), economia in [`ECONOMIA.md`](ECONOMIA.md) (numeri in `data/economy.json`, simulatore in `tools/economy_sim.py`).

## Dove sta il codice

Come per le Coppe, il codice del gioco sta in `game/src/` (lo compila `game/tools/build.mjs`); qui restano regole e dati.

| File | Cosa fa |
|---|---|
| `data/cards.json` | Le carte: per ogni personaggio ruolo e 4 statistiche base. Valutazione = media pesata per ruolo; livello (Bronzo, Argento, Oro) dalla valutazione |
| `data/economy.json` | Tutti i numeri dell'economia: pacchetti, probabilità, premi, mercato, squadra iniziale, album, obiettivi del giorno |
| `tools/economy_sim.py` | Simulatore dell'economia (ore per arrivare ai traguardi) |
| `game/src/ut/cards.js` | Catalogo: carta base di ogni personaggio e varianti (oro raro, holo, holo rara, holo epica, numerata, 1/1), valore di mercato |
| `game/src/ut/club.js` | Regole del club: pacchetti, rosa e panchina, vendita rapida, mercato, Divisioni, obiettivi, album |
| `game/src/ut/walkout3d.js` | Il palco 3D del walkout |
| `game/src/ui/utMenu.js` | Le schermate nel menu (Club, Rosa, Mercato, Divisioni, Album) e l'apertura P1 |
| `game/src/ui/utCards.js` | Disegno delle carte: rarità, i 5 holo, teca graduata L3b, teca oro L4, palco del pacchetto |
| `game/src/ui/i18n_ut.js` | Testi in italiano e inglese |
| `game/src/stats.js` | Da statistiche della carta a valori di gioco |

## Idea

Una modalità in cui il giocatore colleziona personaggi (carte), compone la propria squadra di 5 e la usa in partita, come Ultimate Team di EA FC.

## Con cosa si collega

| Parte | Collegamento |
|---|---|
| `game/assets/roster.json` | I personaggi: ognuno ha la sua pagina di carte. Un personaggio nuovo va aggiunto anche in `data/cards.json` |
| `game/src/main.js` | Le squadre di Ultimate Team entrano in partita con le statistiche di ogni posto (`statsFor`); ritratti delle carte e palco del walkout |
| `game/src/ui/save.js` | Il club sta nel profilo (`profile.ultimate`); il registro delle numerate accanto ai profili |
| `animation/nis.py` | Le clip del walkout (corsa ed esultanze) dalle scene `.nis` del disco |
