# Economia di Ultimate Team (crediti, pacchetti, mercato)

Proposta da approvare. I numeri stanno in [`data/economy.json`](data/economy.json) e li legge sia il gioco sia il simulatore [`tools/economy_sim.py`](tools/economy_sim.py). Per cambiare la curva si tocca solo il JSON e si rilancia:

```bash
python3 ultimate-team/tools/economy_sim.py 600 400 40
```

(600 giocatori simulati, 400 ore di gioco ciascuno, 40 personaggi in rosa: la dimensione prevista quando i personaggi saranno di più.)

## Come funzionano i giochi di questo tipo

Cosa si impara da Ultimate Team di EA FC e dai gacha:

1. **Rubinetti e scarichi.** I crediti entrano dalle partite, dagli obiettivi e dai premi delle Divisioni, ed escono con i pacchetti, la tassa del mercato e gli acquisti. Se ne entrano più di quanti ne escono, i prezzi salgono e le carte rare perdono valore. Senza giocatori veri il mercato non può gonfiarsi da solo, ma la regola vale lo stesso: ogni carta venduta deve rendere meno di quanto costava trovarla.
2. **Inizio veloce, fine lenta.** Nelle prime ore si migliora la squadra a ogni pacchetto. Poi ogni punto di valutazione costa sempre di più. In FC una squadra "buona" arriva in pochi giorni, quella "perfetta" quasi mai.
3. **Dentro una rarità, le carte forti sono più rare.** Un pacchetto Oro dà quasi sempre ori da 75-80, raramente da 88. Nel simulatore la probabilità si dimezza circa ogni 3 punti.
4. **La sorpresa sta nei pacchetti, la certezza nel mercato.** Il pacchetto fa sognare, il mercato serve a prendere la carta che manca. Per questo i venditori CPU comprano a poco (35% del prezzo base) e vendono a molto (110-160%): sul mercato si perde sempre qualcosa.
5. **Protezione contro la sfortuna (pity).** Nei gacha, dopo tanti tentativi a vuoto, la probabilità sale o c'è una garanzia. La metto **solo sulle holo comuni**: almeno una holo ogni 40 pacchetti Oro Premium. **Mai sulle numerate**, altrimenti diventano una certezza e perdono senso.
6. **Probabilità dichiarate.** EA mostra le probabilità di ogni pacchetto nel negozio ("Probabilità del pacchetto"). Lo facciamo anche noi: più onesto, e la rarità si percepisce meglio quando si vede scritto "0,035%".

## Rubinetti (da dove arrivano i crediti)

| Fonte | Crediti |
|---|---|
| Partita Divisioni: vittoria / pareggio / sconfitta | 500 / 300 / 150, moltiplicati per la divisione (×1,0 in Divisione 10, ×1,8 in Divisione 1) |
| Gol segnato / porta inviolata | +20 / +75 |
| 3 obiettivi giornalieri | 500 l'uno |
| Fine stagione Divisioni (10 partite) | da 1.000 (Div. 10) a 16.000 (Div. 1) |
| Vendita sul mercato | 35% del prezzo base, meno il 5% di tassa |
| Vendita rapida | Oro 200, Oro raro 450, Holo 2.000… (numerate e 1/1 non si vendono) |

Le Coppe **non danno crediti** (decisione dell'utente): solo trofei in bacheca.

Una stagione di Divisioni è di 10 partite: con 18 punti si sale, sotto i 12 si scende. In Divisione 10 la CPU vale 58 di valutazione, in Divisione 1 vale 94.

## Negozio di pacchetti

| Pacchetto | Prezzo | Carte | Cosa contiene |
|---|---|---|---|
| Bronzo | 400 | 3 | 90% bronzo, 10% argento |
| Argento | 1.500 | 3 | 85% argento, 15% oro |
| Oro | 5.000 | 5 | 84% oro, 15% oro raro, ~1% holo |
| Oro Premium | 10.000 | 5 | almeno 1 oro raro; 1,8% holo, 0,18% holo rara, 0,02% holo epica, **0,035% numerata, 0,001% 1/1** a carta |
| Holo | 50.000 | 3 | almeno 1 holo; 20% holo, 4,2% holo rara, 0,8% holo epica, **0,18% numerata, 0,005% 1/1** a carta |

## Cosa dice la simulazione

Ore di gioco necessarie per arrivare al traguardo: il 10% più fortunato, la mediana e il 90%. "Mai" indica quanti giocatori non ci arrivano in 400 ore.

**Strategia A: compro solo pacchetti Oro Premium**

| Traguardo | 10% | Mediana | 90% | Mai in 400 h |
|---|---|---|---|---|
| Primo oro raro | 2 h | 2 h | 4 h | 0% |
| Prima holo | 3 h | 9 h | 20 h | 0% |
| Squadra media 80+ | 2 h | 4 h | 7 h | 0% |
| Prima holo rara | 12 h | 49 h | 157 h | 0% |
| Arrivo in Divisione 1 | 17 h | 33 h | 76 h | 1% |
| Squadra media 86+ | 10 h | 20 h | 109 h | 4% |
| Squadra media 90+ | 54 h | 223 h | – | 39% |
| Prima holo epica | 59 h | 337 h | – | 44% |
| **Prima numerata** | 30 h | **197 h** | – | 27% |
| **Prima 1/1 Oro** | – | – | – | **96%** |

**Strategia B: risparmio e compro solo pacchetti Holo**

| Traguardo | 10% | Mediana | 90% | Mai in 400 h |
|---|---|---|---|---|
| Prima holo | 8 h | 14 h | 25 h | 0% |
| Squadra media 80+ | 14 h | 16 h | 26 h | 0% |
| Prima holo rara | 9 h | 32 h | 76 h | 0% |
| Arrivo in Divisione 1 | 37 h | 76 h | 147 h | 0% |
| Squadra media 86+ | 34 h | 82 h | 250 h | 5% |
| Prima holo epica | 27 h | 99 h | 299 h | 4% |
| **Prima numerata** | 86 h | 381 h | – | 48% |
| **Prima 1/1 Oro** | – | – | – | **98%** |

Come si legge:

- **Le prime 5 ore sono generose**: oro raro e prima squadra decente subito, come in FC.
- **Le due strategie sono una scelta vera**. I pacchetti Holo portano prima alle holo rare ed epiche, ma la squadra cresce molto più lentamente e si arriva tardi in Divisione 1. Non c'è una strada ovviamente migliore.
- **Numerata**: in mediana circa 200 ore, e più di un giocatore su 4 non la trova in 400 ore. È un evento.
- **1/1 Oro**: circa 1 giocatore su 25 la trova in 400 ore. È una leggenda.
- Le numerate esistono in **10 copie per tutto il gioco**: quando una copia esce, sparisce dai pacchetti di tutti i profili. Senza server, "tutto il gioco" vuol dire tutti i profili di quel browser; col server privato diventerà davvero globale (il registro delle copie passa al server).

## Mercato simulato

- I prezzi partono dal prezzo base della rarità, più l'8% per ogni punto di valutazione sopra la media della rarità, e si muovono un po' ogni giorno (passeggiata casuale entro ±15%).
- **Comprare**: le offerte dei venditori CPU costano dal 110 al 160% del prezzo base. Conviene cercare l'affare.
- **Vendere**: si mette un prezzo e la CPU compra in un tempo (reale) che va da circa 2 ore a 3 giorni. Più il prezzo è alto, più si aspetta, e se è troppo alto la carta non si vende. Tassa del 5%.
- **Le numerate e le 1/1 non vanno sul mercato** finché non c'è il server: sono troppo rare per un mercato finto.

## Da tarare dopo, giocando

- Le ore per partita: il simulatore conta 9 partite all'ora (3 minuti di gioco più menu). Se le partite diventano più lunghe, i crediti all'ora scendono.
- La forza della CPU nelle Divisioni dipende anche da come gioca l'IA, non solo dalla valutazione.
- Con 10 personaggi (oggi) la collezione si completa in fretta: la curva è pensata per circa 40.

## Fonti

- [Probabilità dei pacchetti in EA FC](https://soccergaming.com/fc-ultimate-team-pack-probabilty/)
- [Come progettare probabilità oneste nei gacha](https://bugnet.io/blog/how-to-design-fair-gacha-rates)
- [Come funzionano pity e pull garantiti](https://www.itechguides.com/how-gacha-pity-rates-banners-and-guaranteed-pulls-work/)
- [Analisi e simulazione dei gacha](https://dev.to/hiroshi_takamura_c851fe71/this-is-how-gacha-games-get-ya-game-design-deconstruction-and-simulation-3bhb)
