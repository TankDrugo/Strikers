# Ultimate Team: decisioni prese con l'utente

Stato: **regole decise, economia proposta, aspetto delle carte da scegliere** (vedi le bozze in [`../interfaccia-gioco/DESIGN.md`](../interfaccia-gioco/DESIGN.md#bozze)).

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
| Holo (più tipi) | Stesso personaggio, valutazione più alta. Tre fasce: holo, holo rara, holo epica. **Quali effetti, da scegliere sulle bozze** |
| **Numerata 1-10** | Solo per i personaggi più forti (valutazione base 85+). **10 copie in tutto il gioco**, ognuna col suo numero. Si mostra nel **top loader** |
| **1/1 Oro** | Una sola copia in tutto il gioco, per i personaggi più forti. Nel top loader |

Le numerate sono **uniche per tutto il gioco**. Senza server, "tutto il gioco" significa tutti i profili di quel browser (un registro comune); col server privato il registro passa al server. Non vanno sul mercato simulato.

## Economia

Studio, numeri e simulazione in [`ECONOMIA.md`](ECONOMIA.md). In breve: prime ore generose, numerata in mediana dopo circa 200 ore, 1/1 trovata da circa 1 giocatore su 25 in 400 ore.

## Apertura dei pacchetti

Animazioni spettacolari, con una rivelazione a tappe più ricca per holo e numerate (come i walkout di FC). **Stile da scegliere sulle bozze.**
