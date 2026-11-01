# Gioco

Prototipo giocabile 5 contro 5 con le misure e le dinamiche di [`reference/STRIKERS_REFERENCE.md`](../reference/STRIKERS_REFERENCE.md). I personaggi in campo sono scelti in [`assets/roster.json`](assets/roster.json); ci sono due squadre da 5 (Celestini e Rivali), quattro squadre miste con i personaggi singoli (Leggende, Nazionali, Avventurieri, Campioni: `squads` in `roster.json`) e un editor della formazione che mette qualsiasi personaggio in qualsiasi posto: 25 personaggi, tutti con le 183 animazioni originali adattate al loro scheletro Mixamo.

## Stato

**funziona** · Partita 5 contro 5: campo, stadio, pallone, giocatori, IA, comandi.

Fatto:
- Partita 5 contro 5 completa, CPU contro CPU o con controller Xbox
- Stadio, fisica del pallone, IA
- 9 stadi a tema (1° novembre): l'Arena Elettrica più uno per ogni gioco da cui vengono i personaggi, con apertura a giro di telecamera; si scelgono in Gioco rapido (anche Casuale), ognuno ha la sua coppa, in Ultimate Team sono a caso (`src/stadiums.js`)
- Gambe nella corsa: le clip di turbo tornano alla velocità del passo e il cambio tra clip di corsa tiene la fase del passo (1° novembre)
- Regole della partita dell'originale (31 ottobre, notte, `reference/VERIFICA.md` righe 1–17, colonna «Nostro gioco»): tiro con valore della barra e tiro a sorte con la curva del livello, portiere con la tabella delle 69 parate, Super Strike sui fotogrammi della clip, CPU con le tabelle della difficoltà, scivolata, spallata e passaggi dell'originale
- Partita a due giocatori (uno contro uno o insieme contro la CPU), difficoltà della CPU
- Link online privato, aggiornato a ogni modifica
- Statistiche per giocatore dalle carte di Ultimate Team (`src/stats.js`)
- Super Strike del capitano come nell'originale (`SUPER` in `src/config.js`): carica 0,91 s, una lancetta sul tempo della clip, scena dal fotogramma 27; indicatore G1–G4 stile FIFA sopra il giocatore controllato
- Build di prova con 10 milioni di crediti (`--prova`) e build per itch.io (`--itch`), caricata sulla pagina ristretta https://goleador0702.itch.io/strikers

Prossimo:
- Pallone attaccato all'osso `ball` delle clip (riga 12 di `VERIFICA.md`: va esportato l'osso), stati di corsa (riga 11), condizioni degli script della CPU
- Pallonetto in porta, tiro al volo, disturbo della lancetta del Super Strike
- Power-up
- Opzioni della pagina itch.io dal sito (gioco nel browser, 1280×720, schermo intero, accesso agli amici)

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

Dal 31 ottobre il link privato ospita la **build di prova** (`--prova`): è il gioco normale, ma ogni club di Ultimate Team torna a 10 milioni di crediti quando scende sotto i 5 milioni, per provare tutti i pacchetti (nel menu, accanto ai crediti, compare "PROVA"). La versione normale va su itch.io.

Funziona anche col controller Xbox (verificato dall'utente). È un Artifact di claude.ai **privato**: lo apre solo il proprietario dell'account. Non va condiviso, perché contiene le animazioni ricavate dal disco.

Per aggiornarlo (lo fa Claude dopo ogni modifica al gioco):

```bash
node tools/build.mjs --web --prova
```

Poi si ripubblica `dist/web-prova/index.html` con i file di `dist/web-prova/assets/` sullo **stesso** Artifact, passando il suo link come `url`. I modelli vanno come testo (gzip + base64, `*.glb.gz.txt`) perché gli Artifact non servono file `.glb`; il gioco li decomprime nel browser. In totale circa 121 MB con 25 personaggi (circa 4,8 MB l'uno), sopra il limite di 64 MB per pubblicazione: i file lasciati fuori da una pubblicazione restano online, quindi si pubblica in più passi sullo stesso `url`, al massimo 10 personaggi per passo (oggi 3 passi): prima `index.html` con i personaggi nuovi e altri fino a 10, poi gli altri a gruppi di 10, per ultimi `roster.json`, `walkout.json` e i restanti (così il roster nuovo arriva quando tutti i suoi personaggi sono già online). Ogni versione dell'Artifact tiene al massimo 256 MB e 511 file: bastano per circa 50 personaggi. L'utente vuole sempre il gioco completo e aggiornato online.

## itch.io (privato, per gli amici)

```bash
node tools/build.mjs --itch
```

Scrive `dist/itch/` (pagina completa con `<!doctype html>`) e `dist/calcio-arcade-itch.zip` (circa 89 MB con 25 personaggi), da caricare come gioco HTML su una pagina itch.io con visibilità **Ristretta** (con password o lista di accesso), mai pubblica: contiene le animazioni del disco. La pagina è https://goleador0702.itch.io/strikers (Ristretta: chi non ha accesso vede un 404). Dopo ogni modifica al gioco Claude la aggiorna con butler (l'utente ha dato il permesso il 31 ottobre; si scarica da `https://broth.itch.zone/butler/linux-amd64/LATEST/archive/default` nella cartella temporanea, la chiave la mette il proxy, a butler basta `BUTLER_API_KEY=dummy`):

```bash
node tools/build.mjs --itch
```
```bash
BUTLER_API_KEY=dummy butler push dist/itch goleador0702/strikers:html5 --userversion "$(git rev-parse --short HEAD)"
```

Prima build caricata il 31 ottobre (canale `html5`). Le opzioni della pagina (gioco nel browser, dimensioni 1280×720, schermo intero, chi può accedere) si cambiano solo dal sito, nella modifica del progetto.

## Comandi

### Controller Xbox (Series S/X, anche via Bluetooth o cavo)

| Tasto | Con la palla | Senza palla |
|---|---|---|
| Levetta sinistra / croce | muovi | muovi |
| RT | turbo | turbo |
| A | passaggio verso la direzione indicata | – |
| B | tieni premuto per caricare, rilascia per tirare (a barra piena parte da solo). Barra piena e verde: tiro perfetto con effetto | scivolata (dura finché tieni premuto, al massimo 0,35 s) |
| Y | pallonetto | – |
| X | finta | spallata |
| LB | – | cambia giocatore |
| Menu ☰ | pausa | pausa |
| View ⧉ (nella pausa) | ricomincia la partita | |

Nei menu (stile EA FC): **LB / RB** cambiano scheda, croce o levetta si spostano, **A** conferma, **B** torna indietro. Funzionano tutti i controller collegati. Nel visualizzatore: croce su/giù per cambiare animazione, X per specchiarla, B per uscire.

**Super Strike** (vale 2 gol): solo il capitano (© sopra la testa e nell'editor della formazione; in Ultimate Team si sceglie nella Rosa, mai il portiere). Nella metà campo avversaria tieni premuto B (tastiera: K) oltre la barra piena: il capitano brilla d'oro e dopo 0,91 s salta. Al rallentatore una lancetta sale e poi scende: premi B quando sale sul verde a destra (0,84) e di nuovo quando scende sul verde a sinistra (0,16). Conta soprattutto la seconda pressione: sul verde è gol; se anche la prima era perfetta il tiro è imparabile e il portiere finisce in rete; sul giallo il portiere para e resta stordito 1–2 s; fuori, respinge. Una prima pressione vicina allo 0,84 allarga il verde della seconda. Se ti placcano mentre carichi, la perdi; se sei a meno di 2 m dal portiere, può uscirti addosso. Vicino alla linea di porta o negli ultimi 5 s diventa un tiro normale.

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
| `src/game.js` | La partita: passo fisso a 50 Hz, uno o più umani (`controllers`, `setHumans`), difficoltà (`cpuLevel`, `skill()` legge le tabelle `SKILL`), azioni (passaggio, tiro col tiro a sorte, pallonetto, finta, scivolata, spallata), Super Strike, gol, telecamera |
| `src/goalie.js` | Il portiere: posizione e uscite (§9.1 di `VERIFICA.md`), parate dalla tabella `animation/data/strikers_saves.json` (griglia 7×5, miscela con la parata collegata, presa o deviazione, fatica) |
| `src/player.js` | Il giocatore: movimento, scelta e velocità delle animazioni, root motion, disegno interpolato tra due passi di fisica |
| `src/ball.js` | Fisica del pallone, effetto Magnus, urti con pali e barriere, gol |
| `src/ai.js` | IA dei giocatori di movimento |
| `src/input.js` | Controller Xbox e tastiera; `Input.bind` decide quale dispositivo guida quale umano |
| `src/hud.js` | Punteggio, tempo, barra del tiro, scritte |
| `src/field.js`, `src/stadium.js` | Campo, porte e stadio (disegno originale): erba, bordo, barriera, spalti col pubblico, tabellone, LED, tetto e torri faro secondo il tema |
| `src/stadiums.js` | I 9 stadi a tema (`STADIUMS`, `stadiumTheme`): cielo e sole, luci, colori, scritte LED e scenografie di ogni mondo, e i personaggi di quel mondo (`cast`) per le squadre della sua coppa |
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
- **Stadi:** 9, tutti attorno allo stesso campo misurato. Arena Elettrica (l'originale nostro, di notte), Giungla delle Scimmie (Spike: giungla, vulcano, banane), Circuito Pazzo Pazzo (Dastardly: canyon al tramonto, bandiere a scacchi, semaforo sulla partenza), Isola del Tramonto (Sora, Riku, Kairi, Roxas: mare, palme, torre dell'orologio), Villaggio dell'Eco (Jak: rovine e eco blu che galleggia), Quartiere delle Palme (Big Smoke: grattacieli, palme, graffiti, lampioni), Base Artica (Snake: neve, fari che cercano, casse e una scatola di cartone), Pianeta Bullone (Ratchet: pianeti, torri al neon, bulloni che girano), Torneo Celeste (Goku, Goku SSJ, Crilin, Piccolo, Vegeta: torneo all'aperto su un'isola, porte di tempio, nuvole). Nessun logo né nome vero.
- **Pallone:** fisica a 50 Hz con gravità −14 m/s², resistenza dell'aria e al rotolamento, rimbalzi diversi per terreno, barriere e pali. Velocità massima 50 m/s.
- **Tiro:** carica 0,25 + 0,75 × tempo / 0,66, rilascio automatico a barra piena; velocità tra 29 e 34 m/s secondo distanza e carica; bersaglio vicino a un palo, errore di mira che cresce col tempo di volo e un valore della barra basso; contatto al fotogramma 1,825 della clip.
- **Tiro perfetto:** carica ≥ 0,99 (barra tenuta fino in fondo); effetto Magnus con correzione della mira, come in `cBall::Shoot`.
- **Giocatori:** velocità, accelerazioni e virate dei file `.ini` e di `g_pTweaks`.
- **Animazioni:** velocità adattata a quella reale del giocatore (0,6–1,4×). Le clip "a sinistra" sono quelle "a destra" specchiate, come nell'originale.
- **Azioni:** passaggi a terra (spinta verticale 0,5–2 m/s) e pallonetti verso il punto d'intercetto del compagno, velocità secondo distanza e compagno che viene incontro, clip scelta dalla direzione; scivolata a 7,5 m/s verso l'intercetto, chi tocca il pallone col piede lo prende; spallata col movimento della clip a 1,5×, chi la subisce perde il pallone e resta giù per tutta la clip; finte.
- **Portieri:** come nell'originale (`src/goalie.js`). Al tiro si tira a sorte: il valore della barra (Shooting × 0,06 + carica × 0,29 + porta aperta × 0,40 + vicinanza × 0,25) passa per la curva del livello scelto (da 1% a 55%) e dice se il portiere deve sbagliare. Altrimenti para se una delle 69 parate della tabella (tempi dai trigger, punto dall'osso `ball`, ×`SIZE`) arriva in tempo nella cella 7×5 del pallone, miscelata con la parata collegata. Presa solo con tiro debole (carica < 0,3) e portiere riposato. Si piazza secondo la distanza del pallone, esce sul portatore e sulla palla libera secondo il livello, rilancia entro 2 s.
- **IA:** per ogni squadra un giocatore pressa, uno marca (stretto secondo `Marking Effectiveness`) e gli altri tengono la posizione. Ogni scelta (tiro, passaggio, finta, turbo, scivolata, spallata, Super Strike) è una probabilità della tabella della difficoltà (`SKILL` in `src/config.js`); la squadra con giocatori umani usa la tabella "umana" (i compagni del computer non contrastano). Velocità uguali a ogni livello.

## Non ancora presente

Power-up, falli e rigori, suoni veri (solo segnali sintetici).

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

Altre prove: `node tools/squadtest.cjs` (scelta della squadra e formazione), `node tools/supertest.cjs` (Super Strike: carica 0,91 s, imparabile +2, solo seconda pressione +2, respinta, metà campo sbagliata, non capitano, uscita del portiere, CPU), `node tools/savetest.cjs` (60 tiri da punti diversi col tiro a sorte forzato: "para" deve parare quasi tutti quelli in porta, "deve sbagliare" deve subirli; con un prefisso salva le foto dei tuffi al contatto), `node tools/goalrate.cjs [secondi]` (gol per tiro a ogni livello, CPU contro CPU), `node tools/packtest.cjs` (build di prova: crediti, 1.000 pacchetti, tutte le carte del catalogo col ritratto).

### Gol per tiro (31 ottobre, notte)

`node tools/goalrate.cjs 1800`: 30 minuti di partita CPU contro CPU per livello (le due squadre leggono la tabella del livello). Tiri normali; i Super Strike a parte.

| Livello | Tiri | Gol | Gol per tiro | "Deve sbagliare" | Tiri perfetti (gol) | Super Strike (gol) | Passaggi | Contrasti |
|---|---|---|---|---|---|---|---|---|
| Rookie | 195 | 63 | **32%** | 32% | 89 (27) | 0 (0) | 107 | 12 |
| Professional | 191 | 37 | **19%** | 20% | 89 (17) | 3 (2) | 371 | 59 |
| Superstar | 164 | 27 | **16%** | 20% | 77 (18) | 8 (5) | 462 | 419 |
| Legend | 77 | 9 | **12%** | 14% | 25 (2) | 4 (4) | 379 | 1031 |

Quasi ogni gol viene da un tiro in cui il tiro a sorte ha detto "deve sbagliare": se no il portiere trova quasi sempre una parata in tempo (`savetest.cjs`: 53–54 tiri su 59 in porta). Più alto il livello, più la CPU contrasta (tabella: `Slide Attack Chance` 0,02 / 0,15 / 0,5 / 1) e meno si tira. Prima della correzione entrava circa un tiro su cinque a ogni livello.

Per aggiungere personaggi vedi [`characters/README.md`](../characters/README.md).

## Problemi noti

- Le mani del nostro portiere arrivano a circa l'80% della portata dell'osso `ball` della tabella delle parate: nei tuffi lunghi il pallone respinto può passare fino a 0,9 m oltre le dita (`reference/VERIFICA.md` §9.2, controllo a occhio).
- A Legend la CPU scivola quasi a ogni occasione (`Slide Attack Chance` 1): circa 35 contrasti al minuto in CPU contro CPU. Quando una scelta viene offerta (raggi, frequenza) è ancora una stima nostra in `TACKLE` di `src/config.js`.
- Il file `gioco.html` pesa circa 215 MB con 25 personaggi (circa 8-9 MB l'uno). Si apre in qualche secondo; se diventa un problema si possono comprimere mesh e animazioni.
