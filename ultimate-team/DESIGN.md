# Ultimate Team: regole decise

Decise con l'utente il 31 ottobre 2026.

| Domanda | Scelta |
|---|---|
| Le carte cambiano il gioco? | **Sì.** Ogni carta ha statistiche che il gioco legge per quel giocatore |
| Come si ottengono? | **Crediti e pacchetti.** Le partite danno crediti, i crediti comprano pacchetti |
| Dove si salvano i progressi? | **Online**, nello spazio privato dell'utente sull'Artifact del gioco (database della pagina, `data/users/<id>/ut`). Con `gioco.html` aperto dal disco, o se il database non risponde: nel browser (`localStorage`). Una copia va sempre anche nel browser |
| Rarità e versioni speciali? | **Sì:** Bronzo, Argento, Oro, In forma, Icona. Ogni personaggio ha una carta per rarità (10 × 5 = 50 carte) |
| Intesa (chemistry)? | **No.** Conta solo la forza delle carte |

## Carte

Generate da `tools/make_cards.mjs` in `data/cards.js` (non modificare `cards.js` a mano).

- Giocatori di movimento: **VEL** velocità, **TIR** tiro, **PAS** passaggio, **DRI** dribbling, **DIF** difesa, **FIS** fisico.
- Portieri: **TUF** tuffo, **RIF** riflessi, **PRE** presa, **POS** piazzamento, **RIN** rinvio.
- Valutazione (OVR) di rarità: Bronzo 60, Argento 70, Oro 80, In forma 87, Icona 93. Le statistiche si distribuiscono attorno al valore secondo il ruolo (il difensore ha DIF alta e TIR bassa, l'ala VEL e DRI alte…), con un piccolo carattere di squadra: Celestini più tecnici, Rivali più fisici.

## Effetto in partita

In `game/src/stats.js`. **A 75 una statistica vale esattamente come l'originale** (`FIELDER`/`GOALIE` in `config.js`). Ogni punto sopra o sotto cambia di poco i valori collegati:

| Statistica | Cosa cambia | Per punto |
|---|---|---|
| VEL | velocità di corsa e turbo, accelerazione | ±0,4 %, ±0,6 % |
| DRI | rotazione con la palla, corsa con la palla | ±0,6 %, ±0,2 % |
| TIR | potenza del tiro, precisione, ampiezza della zona verde del tiro perfetto | ±0,4 %, ∓2 % errore, ±1 % |
| PAS | velocità dei passaggi; sotto 80 un piccolo errore di direzione | ±0,3 % |
| DIF | portata della spallata, velocità della scivolata | ±0,5 %, ±0,4 % |
| FIS | tempo a terra dopo un contrasto; chi è più forte può resistere a una spallata | ∓0,8 % |
| TUF | portata del tuffo | ±0,6 % |
| RIF | probabilità di arrivare sul tiro | ±0,8 % |
| PRE | probabilità di bloccare invece di respingere (0,65 a 75) | ±1,2 % |
| POS | velocità del portiere | ±0,4 % |
| RIN | lunghezza dei rinvii | ±0,4 % |

Partita normale e CPU contro CPU (senza carte) restano identiche all'originale.

## Squadra

5 posti come le squadre del gioco: DIF, CEN, ALA, ATT (giocatori di movimento) e POR (solo portieri). Lo stesso personaggio non può giocare due volte. Una carta di movimento può stare in qualsiasi posto di movimento senza penalità. Valutazione di squadra = media delle 5 OVR.

## Economia

| Cosa | Crediti |
|---|---|
| Inizio | 800 + pacchetto di benvenuto gratis (5 bronzi, uno per ruolo) |
| Vittoria / pareggio / sconfitta | 500 / 300 / 150 |
| Ogni gol segnato | +40 |
| Porta inviolata | +100 |
| Uscire dalla partita dalla pausa | 0 |
| Vendita rapida (solo copie fuori squadra) | Bronzo 60, Argento 200, Oro 600, In forma 1.800, Icona 4.000 |

| Pacchetto | Prezzo | Carte | Probabilità per carta | Garanzia |
|---|---|---|---|---|
| Bronzo | 400 | 3 | Bronzo 80 %, Argento 18 %, Oro 2 % | – |
| Argento | 1.200 | 3 | Bronzo 30 %, Argento 60 %, Oro 9 %, In forma 1 % | un argento |
| Oro | 3.000 | 3 | Argento 40 %, Oro 52 %, In forma 7 %, Icona 1 % | un oro |
| Campioni | 7.500 | 5 | Oro 70 %, In forma 22 %, Icona 8 % | un oro |

## Avversari

La CPU schiera una squadra vicina alla tua valutazione (da −2 a +4), una carta per ruolo, con un nome inventato (Fulmini, Tempesta, Vulcani…) e un colore.

## Walkout dei pacchetti

Se la carta migliore del pacchetto è Oro o superiore parte il walkout, con le scene d'intermezzo originali (`.nis`, decodificate da `animation/nis.py`):

1. **Inquadratura dello stadio** (`camera_establish`): il giocatore esce dal tunnel con la corsa di `camera_establish_home`, mentre compaiono ruolo, squadra e rarità.
2. **Esultanza** (`goal_winner_low` per l'Oro, `goal_winner_high` per In forma e Icona) con le due telecamere originali; compare la valutazione.
3. Rivelazione di tutte le carte del pacchetto.

Si salta con **Salta**, Invio, Spazio o Esc.
