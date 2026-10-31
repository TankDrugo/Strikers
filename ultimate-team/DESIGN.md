# Ultimate Team: decisioni prese con l'utente

Stato: **giocabile** (regole decise, economia calibrata su FC, aspetto delle carte scelto (vedi le bozze in [`../interfaccia-gioco/DESIGN.md`](../interfaccia-gioco/DESIGN.md#bozze)); scelte di dettaglio in fondo).

## Regole

- Ultimate Team **fa parte del profilo**: ogni profilo ha il suo club, i suoi crediti e la sua collezione.
- **Le statistiche delle carte cambiano il gioco** (velocità, tiro, passaggio, contrasto, parata). Oggi `FIELDER` e `GOALIE` in `game/src/config.js` valgono per tutti: andranno letti per giocatore, partendo da quei valori come media.
- **Niente intesa (chemistry).**
- Solo crediti guadagnati giocando, **niente soldi veri**.

## Sezioni

| Sezione | Cosa c'è |
|---|---|
| **Club** | Riepilogo: crediti, carte, oggetti; **negozio dei pacchetti** con probabilità dichiarate; pacchetti da aprire |
| **Rosa** | Formazione di 5 (posti 0-3 di movimento, posto 4 portiere) e panchina |
| **Mercato** | Mercato simulato con venditori CPU: compra, vendi, lista dei preferiti. Col server diventerà un mercato vero |
| **Divisioni** | Stagioni da 10 partite contro CPU sempre più forti, da Divisione 10 a Divisione 1. Ogni divisione dà un premio in crediti a fine stagione. Col server diventeranno online |
| **Album** | Una pagina per personaggio con tutte le varianti da trovare; premi per pagine e album completati |

## Rarità

| Livello | Note |
|---|---|
| Bronzo, Argento, Oro, Oro raro | Livelli base, decisi dalla valutazione del personaggio |
| Holo (più tipi) | Stesso personaggio, valutazione più alta. Effetti scelti: **Arcobaleno** e **Glitter** (holo), **Lava** (rara), **Prisma** e **Galassia** senza puntini (epica). Fasce confermate |
| **Numerata 1-10** | Solo per i personaggi più forti (valutazione base 85+). **10 copie in tutto il gioco**, ognuna col suo numero. Si mostra nella **teca graduata**; targhetta **blu notte con scritte e numero in oro** (L3b) |
| **1/1 Oro** | Una sola copia in tutto il gioco, per i personaggi più forti. Carta tutta in oro nella **teca nera con bordo oro** |

Le numerate sono **uniche per tutto il gioco**. Senza server, "tutto il gioco" significa tutti i profili di quel browser (un registro comune); col server privato il registro passa al server. Non vanno sul mercato simulato.

## Economia

Studio, numeri e simulazione in [`ECONOMIA.md`](ECONOMIA.md). In breve: prime ore generose, ritmo di FC (circa 0,7 pacchetti Oro Premium all'ora), numerata in mediana dopo circa 260 ore, 1/1 trovata da circa 1 giocatore su 25 in 400 ore.

## Apertura dei pacchetti

Scelta: **P1, walkout a indizi**.

1. Il pacchetto trema e si apre in un lampo; i raggi di luce prendono il colore della rarità.
2. Gli indizi compaiono uno per volta: ruolo, squadra, valutazione e, per le carte top, "NUMERATA 04 / 10" o "1 / 1". Per l'oro raro c'è solo la valutazione.
3. **Il personaggio esce camminando in 3D e fa una tra 10 esultanze, scelta a caso.**
4. Arriva la carta; numerate e 1/1 vengono **imbustate**: la teca entra vuota, la carta scivola dentro dall'apertura in alto, la teca fa clic e la targhetta viene stampata sopra (bozza P1 nella pagina delle bozze).

Le esultanze non ci sono fra le 183 clip. **Scelta dell'utente: usare le esultanze originali, adattate al walkout.** Nel gioco originale sono sequenze "NIS" (Non-Interactive Sequence) in `art/nis/` sul disco:

- `art/nis/nis_dict.txt` è l'indice: nome, numero di animazioni e di telecamere, posizioni;
- ogni file contiene un'animazione per personaggio presente (chunk `0x80017000`, letto con lo stesso `cSAnim` delle clip di gioco) più la telecamera (`0x80015501`);
- le esultanze dopo il gol hanno nomi con `goal_winner` o `_goal_`, filtrati per squadra o capitano (fonte: `src/Game/NisPlayer.cpp` e `src/Game/Render/Nis.cpp` di smstrikers-decomp).

I file dati dall'utente il 31 ottobre: `birdo_goal_winner_high`, `birdo_goal_winner_low` (esultanze), `camera_establish_home` (la squadra esce dal tunnel), `camera_establish` e `birdo_goal_bg_winner_high`. Sono decodificati da `animation/nis.py` in `animation/data/strikers_nis.npz`; i `.nis` **non vanno nel repository**. Per il walkout si tiene solo l'animazione del personaggio; la telecamera la decide il nostro palco.

Oggi il walkout ha **2 esultanze originali su 10**: le altre arriveranno con altri file `goal_winner` del disco.

## Scelte di dettaglio (31 ottobre)

Prese scrivendo il codice, dentro le regole sopra. Tutti i numeri stanno in `data/economy.json` e `data/cards.json`.

- **Statistiche**: 4 per carta, come nelle bozze. Movimento: VEL velocità, TIR tiro, PAS passaggio, CON contrasto. Portiere: PAR parata, RIF riflessi, USC uscite, VEL velocità. **A 75 una statistica vale come l'originale** (`FIELDER`/`GOALIE`); ogni punto sopra o sotto cambia di qualche decimo di percento i valori collegati (tabella in `game/src/stats.js`). Fuori da Ultimate Team tutti giocano con i valori originali.
- **Valutazioni base** dei 10 personaggi: Attaccante Celestini 86, Attaccante Rivali 85 (le due stelle: numerate e 1/1), Centrocampista Celestini 80, Portiere Celestini 79, Ala Celestini 77, Portiere Rivali 76 (oro), Difensore Celestini 72, Centrocampista Rivali 68 (argento), Difensore Rivali 64, Ala Rivali 61 (bronzo).
- **Varianti**: i personaggi oro hanno anche oro raro (+2), holo (+2), holo rara (+4) e holo epica (+6); le stelle anche numerata (+8) e 1/1 (+10). Bronzo e argento hanno una carta sola.
- **Effetti holo** per livello: holo Arcobaleno o Glitter, holo rara Lava, holo epica Prisma o Galassia (alternati tra i personaggi).
- **Club nuovo**: 2.000 crediti e una squadra iniziale di valutazione 68 (come il simulatore: circa 66), più 3 posti in panchina.
- **Album**: 2.000 crediti per ogni pagina completata (tutte le versioni tranne numerate e 1/1; le pagine con una sola versione contano ma non pagano), 25.000 per l'album intero.
- **Obiettivi del giorno**: gioca 2 partite di Divisioni, vincine una, segna 4 gol. 400 crediti l'uno.
- **Divisioni**: la squadra CPU ha la valutazione della divisione (58 in Divisione 10, 94 in Divisione 1) e un nome a tema hi-tech; anche l'IA si fa più sveglia salendo.
- **Mercato**: 14 offerte al giorno dei venditori CPU; vendendo, il prezzo "giusto" è il 35% del valore (si vende in circa 2 ore), più si chiede più si aspetta, fino a 3 giorni; oltre circa il doppio nessuno compra. Tassa 5%.
- **Walkout**: dopo gli indizi il personaggio esce correndo dal fondo del palco (la corsa del capitano di `camera_establish_home`) e fa una delle esultanze; la telecamera gli resta davanti anche quando l'esultanza gira su se stessa. Walkout per Oro raro e superiori; per l'oro raro c'è solo l'indizio della valutazione.
