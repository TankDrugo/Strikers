# Ultimate Team: decisioni prese con l'utente

Stato: **regole decise, economia calibrata su FC, aspetto delle carte scelto** (vedi le bozze in [`../interfaccia-gioco/DESIGN.md`](../interfaccia-gioco/DESIGN.md#bozze)).

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
4. Arriva la carta; numerate e 1/1 scendono nella loro teca.

Le esultanze non ci sono fra le 183 clip. **Scelta dell'utente: usare le esultanze originali, adattate al walkout.** Nel gioco originale sono sequenze "NIS" (Non-Interactive Sequence) in `art/nis/` sul disco:

- `art/nis/nis_dict.txt` è l'indice: nome, numero di animazioni e di telecamere, posizioni;
- ogni file contiene un'animazione per personaggio presente (chunk `0x80017000`, letto con lo stesso `cSAnim` delle clip di gioco) più la telecamera (`0x80015501`);
- le esultanze dopo il gol hanno nomi con `goal_winner` o `_goal_`, filtrati per squadra o capitano (fonte: `src/Game/NisPlayer.cpp` e `src/Game/Render/Nis.cpp` di smstrikers-decomp).

Servono dal disco dell'utente: `art/nis/nis_dict.txt` e i file NIS di esultanza. Come gli altri file del disco, **non vanno nel repository**: si decodificano e si salvano solo le pose, come per `strikers_source.npz`. Per il walkout si tiene solo l'animazione del personaggio; la telecamera la decide il nostro palco.
