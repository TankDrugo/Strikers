# Gioco

Prototipo giocabile 5 contro 5 con le misure e le dinamiche di [`reference/STRIKERS_REFERENCE.md`](../reference/STRIKERS_REFERENCE.md). I personaggi in campo sono scelti in [`assets/roster.json`](assets/roster.json); per ora c'è solo `portiere`, con le 183 animazioni originali adattate al suo scheletro Mixamo.

## Avvio

```bash
npm install
```
```bash
node tools/build.mjs
```

Poi apri `dist/gioco.html` con un doppio clic (Chrome, Edge o Firefox). Non servono server né connessione.

Il file contiene dati di animazione estratti dalla tua copia del gioco: tienilo per uso personale e non pubblicarlo.

## Comandi

### Controller Xbox (Series S/X, anche via Bluetooth o cavo)

| Tasto | Con la palla | Senza palla |
|---|---|---|
| Levetta sinistra / croce | muovi | muovi |
| RT | turbo | turbo |
| A | passaggio verso la direzione indicata | – |
| B | tieni premuto per caricare, rilascia per tirare. Barra piena e verde: tiro perfetto con effetto | scivolata |
| Y | pallonetto | – |
| X | finta | spallata |
| LB | – | cambia giocatore |
| Menu ☰ | pausa | pausa |
| View ⧉ (nella pausa) | ricomincia la partita | |

Nei menu: croce o levetta per scegliere, A per confermare, B per tornare al gioco dalla pausa. Nel visualizzatore: croce su/giù per cambiare animazione, X per specchiarla, B per uscire.

Il controller va collegato prima di aprire il gioco, oppure basta premere un suo tasto con la pagina aperta: il browser lo rende visibile solo dopo la prima pressione. Funziona in Chrome, Edge e Firefox.

### Tastiera

| Tasto | Con la palla | Senza palla |
|---|---|---|
| WASD / frecce | muovi | muovi |
| Shift | turbo | turbo |
| J | passaggio | cambia giocatore |
| K | tiro (tieni premuto) | scivolata |
| L | pallonetto | spallata |
| Spazio | finta | – |
| + / - o rotella | zoom della telecamera | |
| P / Esc | pausa | |

Dal menu puoi anche guardare una partita CPU contro CPU, o aprire il **visualizzatore** con tutte le 183 animazioni: 84 da giocatore e 99 da portiere, anche specchiate.

## Codice

| File | Cosa fa |
|---|---|
| `src/config.js` | Tutte le costanti: campo, pallone, giocatori, portiere, tiro, contrasti, partita. `SIZE` ingrandisce i corpi rispetto all'originale |
| `src/main.js` | Caricamento di roster e personaggi, menu, pausa, visualizzatore delle animazioni |
| `src/game.js` | La partita: passo fisso a 50 Hz, azioni (passaggio, tiro, pallonetto, finta, scivolata, spallata), portiere, gol, telecamera |
| `src/player.js` | Il giocatore: movimento, scelta e velocità delle animazioni, root motion, disegno interpolato tra due passi di fisica |
| `src/ball.js` | Fisica del pallone, effetto Magnus, urti con pali e barriere, gol |
| `src/ai.js` | IA dei giocatori di movimento |
| `src/input.js` | Controller Xbox e tastiera, navigazione nei menu |
| `src/hud.js` | Punteggio, tempo, barra del tiro, scritte |
| `src/field.js`, `src/stadium.js` | Campo, porte e stadio (disegno originale) |
| `assets/roster.json` | Personaggi disponibili e formazione delle due squadre (posti 0–3 giocatori, posto 4 portiere) |
| `assets/characters/` | Personaggi pronti per il gioco, scritti da `animation/add_characters.py` |
| `tools/build.mjs` | Crea `dist/gioco.html` con tutto dentro |
| `tools/playtest.cjs` | Prova automatica: 150 s di partita CPU contro CPU |
| `dev/` | Pagine di sviluppo: `index.html` (gioco senza build); `sheet.html?char=<id>&clips=a,b,c` (fotogrammi del personaggio accanto allo scheletro originale, da `sticks.json`); `posecheck.html` (controllo di una posa) |

Fisica e logica girano a passo fisso di 50 Hz come l'originale. Ogni fotogramma disegna corpi e pallone a metà strada tra gli ultimi due passi (`Player.render`, `Ball.updateMesh`): senza questo, su schermi a 60 o 120 Hz il movimento scattava e sembrava sfocato.

## Cosa c'è

- **Campo:** 41,2 × 24,2 m chiuso da barriere con angoli arrotondati; porte 5,69 × 2,56 m; aree di rigore.
- **Pallone:** fisica a 50 Hz con gravità −14 m/s², resistenza dell'aria e al rotolamento, rimbalzi diversi per terreno, barriere e pali. Velocità massima 50 m/s.
- **Tiro perfetto:** effetto Magnus con correzione della mira, come in `cBall::Shoot`.
- **Giocatori:** velocità, accelerazioni e virate dei file `.ini` e di `g_pTweaks`.
- **Animazioni:** velocità adattata a quella reale del giocatore (0,6–1,4×). Le clip "a sinistra" sono quelle "a destra" specchiate, come nell'originale.
- **Azioni:** passaggi a terra e pallonetti col compagno anticipato, tiro caricato in 0,66 s, scivolate e spallate con reazioni direzionali, finte.
- **Portieri:** si posizionano tra palla e porta, prevedono il tiro e si tuffano (presa o respinta, con le probabilità legate a potenza e tiro perfetto). Poi rinviano con la mano o col piede.
- **IA:** per ogni squadra un giocatore pressa, uno marca e gli altri tengono la posizione rispetto al pallone.

## Non ancora presente

Power-up, Super Strike, falli e rigori, scelta dei personaggi, suoni veri (solo segnali sintetici), partita a due giocatori.

## Sviluppo e prove

Per sviluppare senza ricompilare, servi questa cartella con un server statico e apri `dev/index.html`:

```bash
python3 -m http.server 8000
```

Prova automatica dopo ogni modifica (richiede Playwright):

```bash
node tools/build.mjs && node tools/playtest.cjs
```

Esce con errore se la pagina dà errori o se una posizione diventa NaN.

Per aggiungere personaggi vedi [`characters/README.md`](../characters/README.md).

## Problemi noti

- Il pallone può superare i 50 m/s del limite originale (fino a circa 69 m/s in una partita CPU): il taglio della velocità non copre tutti i casi.
- Con molti personaggi diversi il file `gioco.html` cresce di circa 7 MB per personaggio.
