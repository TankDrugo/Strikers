# Interfaccia gioco: decisioni prese con l'utente

Stato: **decisioni raccolte, bozze scelte** (pagina di prova: vedi "Bozze" in fondo). Quello che ha ancora bisogno di una scelta dell'utente è segnato **[da scegliere]**.

## Ordine di lavoro

1. Struttura del menu, stile grafico, profili e lingua. **Fatto** (`game/src/ui/`).
2. Gioco rapido. **Fatto**: contro il computer, contro un amico, in due contro il computer, computer contro computer; durata e difficoltà; squadra. Formazione, stadio e regole speciali hanno per ora una sola scelta.
3. Coppe. **Fatto**: 4 coppe giocabili (squadre CPU rimescolate dai 10 personaggi), tabellone con LB/RB tra i turni, obiettivi delle stelle nel prepartita e in pausa con avvisi in partita, golden goal di un minuto (poi decide chi ha tirato di più), livello Difficile, voto da D a Z, bacheca, coppa in corso salvata, torneo con gli amici da 2 a 4 giocatori (profili o ospiti) e torneo privato (4, 8 o 16 squadre). Le partite CPU contro CPU del tabellone si simulano.
4. Ultimate Team. **Fatto**: Club (negozio dei pacchetti, collezione, obiettivi del giorno), Rosa con panchina, Mercato simulato, Divisioni, Album, apertura P1 con indizi, walkout 3D, esultanza originale e teca per numerate e 1/1. Regole in [`../ultimate-team/DESIGN.md`](../ultimate-team/DESIGN.md).

## Avvio del gioco

1. **Lingua**: Italiano / English, la prima volta. Poi si cambia in Impostazioni.
2. **Profilo**: scegli un profilo o creane uno nuovo (nome, avatar, colore). Ogni profilo ha i suoi progressi: coppe, bacheca, club di Ultimate Team.
3. Per ora i profili si salvano nel browser. Più avanti ci sarà un **server privato** e i progressi si salveranno anche online. Il salvataggio passa sempre da un solo modulo (`save`), così poi basta cambiare quello.

## Navigazione (stile FC)

- **Barra principale**, che si scorre con **LB/RB** (tastiera: Q/E): **Home · Gioco rapido · Coppe · Ultimate Team · Impostazioni**.
- Entrare in **Coppe** o in **Ultimate Team** porta in un'altra parte del menu. La barra cambia colore, sfondo e voci, e LB/RB scorrono le sotto-schede di quella modalità:
  - Ultimate Team: **Club · Rosa · Mercato · Divisioni · Album**
  - Coppe: **Coppe · Torneo privato · Bacheca**
- In alto a sinistra c'è sempre il **percorso** (es. *Ultimate Team › Mercato*), così si capisce dove sei. **B** torna indietro di un livello, e dalla radice di una modalità torna alla barra principale.
- Ogni modalità ha **colore e sfondo propri**.
- Dentro una scheda: croce o levetta per muoversi tra i riquadri, A per confermare.

## Home

- **In alto a destra**: il profilo attivo (avatar, nome, crediti di Ultimate Team).
- **Notizie**: un riquadro grande a rotazione. Quando usciranno, qui ci saranno le promo delle carte nuove; per ora mostra carte holo di esempio, la coppa in corso e cose varie.
- Scorciatoie: continua la coppa, gioca subito, apri pacchetti.

## Gioco rapido

- Chi gioca: **umano contro CPU, umano contro umano, due umani contro la CPU** (stessa squadra), oppure **CPU contro CPU**.
- Ogni controller (o la tastiera) sceglie il proprio lato, come nei giochi da divano: si sposta a sinistra o a destra con la levetta.
- Prima della partita si sceglie:
  - squadra e formazione;
  - stadio;
  - durata;
  - difficoltà della CPU;
  - regole speciali.

## Coppe

- **4 coppe**, ognuna di 3-5 partite a **eliminazione diretta**. Per ora le squadre avversarie si fanno rimescolando i 10 personaggi (nomi e maglie nuovi), in attesa dei personaggi nuovi.
- Si giocano da soli contro la CPU, oppure in **torneo fino a 4 giocatori**, stile Tenkaichi 3. Tutti entrano nello stesso tabellone e ognuno gioca le proprie partite a turno sullo stesso schermo. Una partita CPU contro CPU si guarda o si salta con una simulazione. Quando due umani si incontrano, si sfidano.
- **Torneo privato**: si crea un tabellone con squadre, numero di turni e regole a scelta, fino a 4 giocatori umani.
- **Premi**: solo trofei in bacheca, niente crediti per Ultimate Team.

### Le 4 coppe

Decisione dell'utente: ogni coppa è una citazione ironica a uno dei giochi PS2 scelti come riferimento, senza loghi e senza personaggi. Crash Bandicoot non ha una coppa perché è già il tema della Home e del menu (M1).

| Coppa | Citazione | Tema dello stadio e dei menu | Partite |
|---|---|---|---|
| **Coppa Scimmie in Fuga** | Ape Escape 3 | giungla, banane, retini | 3 |
| **Gran Premio Pazzo Pazzo** | Le corse più pazze del mondo | circuito, bandiere a scacchi, avversari imbroglioni | 4 |
| **Coppa Lost Heaven** | Mafia | anni '30, gangster, grammofono, seppia | 5 |
| **Coppa Bullone Galattico** | Ratchet & Clank | spazio, robot, bulloni come moneta | 5 |

Si sbloccano in quest'ordine, dalla più facile alla più difficile.

### Stelle e obiettivi

- Ogni partita si può **vincere e basta**, oppure vincere conquistando **1, 2 o 3 stelle**. Ogni stella è un obiettivo di quella partita.
- Gli obiettivi si vedono **nel menu di pausa**, anche al calcio d'inizio. Durante la partita una piccola notifica avvisa quando una stella è presa (o persa).
- Ogni coppa ha due livelli: **Normale** e **Difficile**. Difficile si sblocca vincendo Normale: CPU più forte e obiettivi più duri.
- Gli obiettivi si pescano da un elenco, così le partite non si ripetono. Prime proposte; quelli con ★ usano azioni che il gioco non ha ancora, come il colpo speciale:

| Normale | Difficile |
|---|---|
| Vinci con almeno 2 gol di scarto | Vinci senza subire gol |
| Segna per primo | Vinci con almeno 4 gol di scarto |
| Segna un tiro perfetto (barra verde) | Segna 2 tiri perfetti |
| Segna un pallonetto | Segna un pallonetto da fuori area |
| Fai 3 tiri in porta nel primo tempo | Vinci rimontando da 0-1 |
| Segna entro il primo minuto | Segna negli ultimi 10 secondi |
| Ruba palla 3 volte con la scivolata | Ruba palla 5 volte senza perderla mai in contrasto |
| Segna con due giocatori diversi | Segna con tre ruoli diversi |
| Fai un gol dopo 4 passaggi di fila | Fai un gol dopo 6 passaggi di fila |
| Subisci al massimo 1 gol | La CPU non deve tirare in porta nel primo tempo |
| Segna dopo una finta | Tripletta dell'attaccante |
| Segna di prima intenzione | Vinci senza mai usare il turbo |
| ★ Segna con il colpo speciale | ★ Segna 2 colpi speciali |
| Il portiere fa 2 parate | Vinci contro il portiere avversario potenziato |
| | Vinci con il tempo dimezzato |

### Voto della coppa (gradazione stile Dragon Ball)

Ogni coppa ha una percentuale di completamento e un voto **D · C · B · A · S · Z**. **Z è il 100%** e si prende solo con tutte le stelle a Difficile.

| Cosa | Percentuale |
|---|---|
| Coppa vinta a Normale | 40% |
| Stelle a Normale (tutte) | +20% |
| Coppa vinta a Difficile | +20% |
| Stelle a Difficile (tutte) | +20% |

Voti: D da 40%, C da 50%, B da 60%, A da 80%, S da 90%, **Z al 100%**. Il trofeo in bacheca cambia aspetto col voto: bronzo, argento, oro, e per Z un trofeo speciale animato.

## Stile grafico

Il sistema è moderno, come in FC 27 (barra a schede, riquadri, percorso). Lo stile è **cartoon anni 2000 con richiami PS2**:

- colori saturi e contorni spessi;
- pannelli inclinati e "gommosi" che rimbalzano quando li selezioni;
- scritte grosse con contorno e ombra;
- sfondi animati a pattern (strisce, spirali, stelle).

Un tema per ogni modalità:

- **Home e Gioco rapido**: avventura tropicale (Crash, Ape Escape): arancio, giallo, azzurro.
- **Coppe**: ogni coppa usa il tema della sua citazione.
- **Ultimate Team**: un tocco hi-tech alla Ratchet & Clank (viola notte, bulloni, schermi); il Mercato è art déco alla Mafia (seppia e oro).
- Altri richiami possibili: Sly Cooper (contorni a fumetto), Jak and Daxter, Jet Set Radio (graffiti).

## Suoni

Si cercano su GitHub, Reddit e OpenGameArt, **solo con licenza CC0** (o una licenza che permetta l'uso senza obblighi complicati). Prime fonti trovate:

- [GUI Sound Effects di Lokif (CC0)](https://opengameart.org/content/gui-sound-effects)
- [Boing in CC0 su OpenGameArt](https://opengameart.org/node/183317)
- [Più di 50 pacchetti CC0 segnalati su r/gamedev](https://redlib.hbubli.cc/r/gamedev/comments/1i5xi9g/enhance_your_game_development_with_over_50_free)
- [Raccolta "SFX - UI" su itch.io](https://itch.io/c/1618276/sfx-ui) e [CC0 SFX and voices](https://itch.io/c/4003879/cc0-sfx-and-voices)
- Freesound con filtro CC0, e i pacchetti audio di Kenney (CC0)
- [UI Sound Library di Little Robot Sound Factory](https://opengameart.org/content/ui-sound-effects-library): è CC-BY, quindi va citato l'autore

Prima di usare un suono si controlla la licenza del singolo file.

## Lingue

Italiano e inglese, scelti all'apertura. Tutti i testi stanno in un file di traduzioni, nessun testo scritto dentro il codice delle schermate.

## Scelte sulle bozze

- **Menu: M1, Cartoon tropicale**, col cambio di colore e sfondo quando si entra in una modalità.
- **Holo**: Arcobaleno, Glitter, Lava, Prisma, Galassia senza puntini (fasce in `../ultimate-team/DESIGN.md`).
- **Numerate**: teca graduata con targhetta **blu notte e oro (L3b)**. **1/1 Oro**: teca nera con bordo oro (L4).
- **Pacchetti: P1, walkout a indizi**, con il personaggio 3D che esce camminando e fa una tra 10 esultanze a caso.

## Bozze

Pagina di prova: https://claude.ai/artifact/M9yMAgV1hSDitKZo9UgzLA (Artifact privato, solo mockup, non il gioco). Sorgente: [`bozze/bozze-menu.html`](bozze/bozze-menu.html); si ripubblica sullo stesso link. Contiene menu (stili M1-M3), holo (H1-H8), top loader (L1-L4) e aperture dei pacchetti (P1-P3). Quando l'utente sceglie, le scelte vanno scritte qui.
