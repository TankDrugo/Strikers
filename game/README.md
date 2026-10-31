# Gioco

Prototipo giocabile 5 contro 5 con le misure e le dinamiche di [`reference/STRIKERS_REFERENCE.md`](../reference/STRIKERS_REFERENCE.md). I personaggi in campo sono scelti in [`assets/roster.json`](assets/roster.json); ci sono due squadre da 5 (Celestini e Rivali) più 5 personaggi singoli con la loro nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ), che giocano in Coppe e Ultimate Team: 15 personaggi, tutti con le 183 animazioni originali adattate al loro scheletro Mixamo.

## Stato

**funziona** · Partita 5 contro 5: campo, stadio, pallone, giocatori, IA, comandi.

Fatto:
- Partita 5 contro 5 completa, CPU contro CPU o con controller Xbox
- Stadio, fisica del pallone, IA
- Portiere che para come l'originale: conta il tempo del tuffo, non il caso
- Partita a due giocatori (uno contro uno o insieme contro la CPU), difficoltà della CPU
- Link online privato, aggiornato a ogni modifica
- Statistiche per giocatore dalle carte di Ultimate Team (`src/stats.js`)

Prossimo:
- Pallone oltre il limite di 50 m/s in alcuni tiri
- Power-up, Super Strike

## Avvio

```bash
npm install
```
```bash
node tools/build.mjs
```

Poi apri `dist/gioco.html` con un doppio clic (Chrome, Edge o Firefox). Non servono server né connessione.

Il file contiene dati di animazione estratti dalla tua copia del gioco: tienilo per uso personale e non pubblicarlo.

## Link online (privato)

Il gioco è anche online, aggiornato a ogni modifica: https://claude.ai/artifact/Ru4U9NJSLMxgRX2bcmH9HH

Funziona anche col controller Xbox (verificato dall'utente). È un Artifact di claude.ai **privato**: lo apre solo il proprietario dell'account. Non va condiviso, perché contiene le animazioni ricavate dal disco.

Per aggiornarlo (lo fa Claude dopo ogni modifica al gioco):

```bash
node tools/build.mjs --web
```

Poi si ripubblica `dist/web/index.html` con i file di `dist/web/assets/` sullo **stesso** Artifact, passando il suo link come `url`. I modelli vanno come testo (gzip + base64, `*.glb.gz.txt`) perché gli Artifact non servono file `.glb`; il gioco li decomprime nel browser. In totale circa 74 MB con 15 personaggi, sopra il limite di 64 MB per pubblicazione: i file lasciati fuori da una pubblicazione restano online, quindi si mandano sempre `index.html`, `roster.json` e `walkout.json` più i soli personaggi nuovi o cambiati (se cambiano tutti, in più passi sullo stesso `url`).

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

Nei menu (stile EA FC): **LB / RB** cambiano scheda, croce o levetta si spostano, **A** conferma, **B** torna indietro. Funzionano tutti i controller collegati. Nel visualizzatore: croce su/giù per cambiare animazione, X per specchiarla, B per uscire.

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

Nei menu: **Q / E** come LB / RB, frecce o WASD per spostarsi, **Invio** per confermare, **Esc** per tornare indietro.

### In due

In Gioco rapido: *Contro un amico* (uno per squadra) o *In due contro il computer* (stessa squadra). Ogni giocatore entra premendo **A** sul suo controller o **Invio** sulla tastiera; un'etichetta G1 / G2 segue il giocatore di ognuno.

Dal menu (Gioco rapido o Home) puoi anche guardare una partita CPU contro CPU; da Impostazioni apri il **visualizzatore** con tutte le 183 animazioni: 84 da giocatore e 99 da portiere, anche specchiate.

## Codice

| File | Cosa fa |
|---|---|
| `src/config.js` | Tutte le costanti: campo, pallone, giocatori, portiere, tiro, contrasti, partita. `SIZE` ingrandisce i corpi rispetto all'originale |
| `src/main.js` | Caricamento di roster e personaggi (in parallelo, con barra e messaggio d'errore), avvio delle partite, visualizzatore delle animazioni |
| `src/stats.js` | Valori di gioco per giocatore dalle statistiche delle carte di Ultimate Team: a 75 coincidono con `config.js`; senza carta (Gioco rapido, Coppe) valgono gli originali |
| `src/ut/` | Ultimate Team: `cards.js` catalogo delle carte, `club.js` regole del club (pacchetti, rosa, mercato, Divisioni, album), `walkout3d.js` palco 3D del walkout. Regole in `ultimate-team/DESIGN.md` |
| `src/cups/` | Coppe: `cups.js` (4 coppe, squadre CPU rimescolate, tabellone, simulazione, voto D–Z), `objectives.js` (obiettivi delle stelle e `Tracker` che li segue dagli eventi della partita) |
| `src/ui/` | Interfaccia (decisa in `interfaccia-gioco/DESIGN.md`): `menu.js` schermate, `cupsMenu.js` schermate delle Coppe, `nav.js` navigazione LB/RB per tastiera e controller, `theme.js` stile M1, `i18n.js` testi italiano e inglese, `save.js` profili nel browser; `utMenu.js`, `utCards.js`, `i18n_ut.js` schermate, carte e testi di Ultimate Team |
| `src/game.js` | La partita: passo fisso a 50 Hz, uno o più umani (`controllers`, `setHumans`), difficoltà della CPU (`cpuLevel`), azioni (passaggio, tiro, pallonetto, finta, scivolata, spallata), portiere, gol, telecamera |
| `src/player.js` | Il giocatore: movimento, scelta e velocità delle animazioni, root motion, disegno interpolato tra due passi di fisica |
| `src/ball.js` | Fisica del pallone, effetto Magnus, urti con pali e barriere, gol |
| `src/ai.js` | IA dei giocatori di movimento |
| `src/input.js` | Controller Xbox e tastiera; `Input.bind` decide quale dispositivo guida quale umano |
| `src/hud.js` | Punteggio, tempo, barra del tiro, scritte |
| `src/field.js`, `src/stadium.js` | Campo, porte e stadio (disegno originale) |
| `assets/roster.json` | Personaggi disponibili e formazione delle due squadre (posti 0–3 giocatori, posto 4 portiere) |
| `assets/characters/` | Personaggi pronti per il gioco, scritti da `animation/add_characters.py` (183 animazioni di gioco + 3 del walkout) |
| `assets/walkout.json` | Percorsi e direzioni delle clip del walkout, da `animation/nis.py` |
| `tools/build.mjs` | Crea `dist/gioco.html` con tutto dentro |
| `tools/playtest.cjs` | Prova automatica: 150 s di partita CPU contro CPU |
| `tools/uttest.cjs` | Prova automatica di Ultimate Team nel menu: club, pacchetti e walkout, teca, mercato, partita di Divisioni con le carte, album |
| `dev/` | Pagine di sviluppo: `index.html` (gioco senza build); `sheet.html?char=<id>&clips=a,b,c` (fotogrammi del personaggio accanto allo scheletro originale, da `sticks.json`); `posecheck.html` (controllo di una posa) |

Fisica e logica girano a passo fisso di 50 Hz come l'originale. Ogni fotogramma disegna corpi e pallone a metà strada tra gli ultimi due passi (`Player.render`, `Ball.updateMesh`): senza questo, su schermi a 60 o 120 Hz il movimento scattava e sembrava sfocato.

## Cosa c'è

- **Campo:** 41,2 × 24,2 m chiuso da barriere con angoli arrotondati; porte 5,69 × 2,56 m; aree di rigore.
- **Pallone:** fisica a 50 Hz con gravità −14 m/s², resistenza dell'aria e al rotolamento, rimbalzi diversi per terreno, barriere e pali. Velocità massima 50 m/s.
- **Tiro perfetto:** effetto Magnus con correzione della mira, come in `cBall::Shoot`.
- **Giocatori:** velocità, accelerazioni e virate dei file `.ini` e di `g_pTweaks`.
- **Animazioni:** velocità adattata a quella reale del giocatore (0,6–1,4×). Le clip "a sinistra" sono quelle "a destra" specchiate, come nell'originale.
- **Azioni:** passaggi a terra e pallonetti col compagno anticipato, tiro caricato in 0,66 s, scivolate e spallate con reazioni direzionali, finte.
- **Portieri:** si posizionano tra palla e porta, prevedono il tiro e si tuffano. Come nell'originale la parata non è un tiro di dado: para se il tuffo (reazione più spostamento) arriva in tempo. In partite CPU contro CPU entra circa un tiro su cinque, un tiro perfetto su due. Poi rinviano con la mano o col piede.
- **IA:** per ogni squadra un giocatore pressa, uno marca e gli altri tengono la posizione rispetto al pallone.

## Non ancora presente

Power-up, Super Strike, falli e rigori, scelta dei personaggi, suoni veri (solo segnali sintetici).

## Sviluppo e prove

Per sviluppare senza ricompilare, servi la **cartella principale del progetto** (il gioco legge anche `ultimate-team/data/`) con un server statico e apri `http://localhost:8000/game/dev/index.html`:

```bash
python3 -m http.server 8000
```

Prova automatica dopo ogni modifica (richiede Playwright):

```bash
node tools/build.mjs && node tools/playtest.cjs
```

Esce con errore se la pagina dà errori o se una posizione diventa NaN. Se la modifica tocca Ultimate Team, il menu o le statistiche:

```bash
node tools/uttest.cjs
```

Per aggiungere personaggi vedi [`characters/README.md`](../characters/README.md).

## Problemi noti

- Il pallone può superare i 50 m/s del limite originale (fino a circa 69 m/s in una partita CPU): il taglio della velocità non copre tutti i casi.
- Il file `gioco.html` pesa circa 131 MB con 15 personaggi (circa 8-9 MB l'uno). Si apre in qualche secondo; se diventa un problema si possono comprimere mesh e animazioni.
