# Economia di Ultimate Team (crediti, pacchetti, mercato)

Calibrata sul ritmo di FC (decisione dell'utente: "studiala da FC"). I numeri stanno in [`data/economy.json`](data/economy.json) e li legge sia il gioco sia il simulatore [`tools/economy_sim.py`](tools/economy_sim.py). Per cambiare la curva si tocca solo il JSON e si rilancia:

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
| Partita Divisioni: vittoria / pareggio / sconfitta | 350 / 220 / 120, moltiplicati per la divisione (×1,0 in Divisione 10, ×1,8 in Divisione 1) |
| Gol segnato / porta inviolata | +15 / +50 |
| 3 obiettivi giornalieri | 400 l'uno |
| Fine stagione Divisioni (10 partite) | da 500 (Div. 10) a 8.000 (Div. 1) |
| Vendita sul mercato | 35% del prezzo base, meno il 5% di tassa |
| Vendita rapida | Oro 200, Oro raro 450, Holo 2.000… (numerate e 1/1 non si vendono) |

Le Coppe **non danno crediti** (decisione dell'utente): solo trofei in bacheca.

Una stagione di Divisioni è di 10 partite: con 18 punti si sale, sotto i 12 si scende. In Divisione 10 la CPU vale 58 di valutazione, in Divisione 1 vale 94.

## Confronto con FC

L'utente ha chiesto di copiare il ritmo di FC. Le partite di FC durano circa 15 minuti, le nostre 3; per questo il confronto si fa **all'ora di gioco**, non a partita.

| | FC 24-26 | Noi |
|---|---|---|
| Crediti a partita | circa 500 in Rivals e Champions, circa 700 in Squad Battles (fonte EA) | 120-630 (3 minuti) |
| Partite all'ora | circa 4 | circa 9 |
| Premio settimanale / di stagione | da 3.000 a 20.000 in Squad Battles | da 500 a 8.000 ogni 10 partite |
| Pacchetto Oro Premium | 7.500 | 7.500 |
| Pacchetti Oro Premium guadagnati all'ora | circa 0,6-0,7 | circa 0,7 |
| Almeno un 84+ in un Oro Premium | 4,2% (fonte EA) | circa 4% di trovare una holo |

Quindi una carta speciale dal pacchetto base esce con la stessa frequenza di un 84+ in FC.

## Negozio di pacchetti

| Pacchetto | Prezzo | Carte | Cosa contiene |
|---|---|---|---|
| Bronzo | 400 | 3 | 90% bronzo, 10% argento |
| Argento | 1.500 | 3 | 85% argento, 15% oro |
| Oro | 5.000 | 5 | 84% oro, 15% oro raro, circa 1% holo |
| Oro Premium | 7.500 | 5 | almeno 1 oro raro; per ogni carta 1,8% holo, 0,18% holo rara, 0,02% holo epica, **0,035% numerata, 0,001% 1/1** |
| Holo | 50.000 | 3 | almeno 1 holo; per ogni carta 20% holo, 4,2% holo rara, 0,8% holo epica, **0,18% numerata, 0,005% 1/1** |

Il pacchetto Holo è il nostro "Ultimate Pack" (in FC costa 125.000).

## Cosa dice la simulazione

Ore di gioco necessarie per arrivare al traguardo: il 10% più fortunato, la mediana e il 90%. "Mai" indica quanti giocatori non ci arrivano in 400 ore.

**Strategia A: compro solo pacchetti Oro Premium**

| Traguardo | 10% | Mediana | 90% | Mai in 400 h |
|---|---|---|---|---|
| Primo oro raro | 2 h | 2 h | 4 h | 0% |
| Squadra media 80+ | 2 h | 4 h | 7 h | 0% |
| Prima holo | 4 h | 10 h | 26 h | 0% |
| Squadra media 86+ | 10 h | 25 h | 112 h | 4% |
| Arrivo in Divisione 1 | 18 h | 36 h | 79 h | 0% |
| Prima holo rara | 13 h | 57 h | 174 h | 1% |
| Squadra media 90+ | 62 h | 346 h | – | 46% |
| Prima holo epica | 63 h | – | – | 53% |
| **Prima numerata** | 49 h | **263 h** | – | 34% |
| **Prima 1/1 Oro** | – | – | – | **96%** |

**Strategia B: risparmio e compro solo pacchetti Holo**

| Traguardo | 10% | Mediana | 90% | Mai in 400 h |
|---|---|---|---|---|
| Prima holo | 12 h | 21 h | 35 h | 0% |
| Squadra media 80+ | 21 h | 23 h | 42 h | 0% |
| Prima holo rara | 12 h | 49 h | 122 h | 0% |
| Arrivo in Divisione 1 | 54 h | 104 h | 218 h | 1% |
| Squadra media 86+ | 59 h | 134 h | – | 11% |
| Prima holo epica | 46 h | 185 h | – | 17% |
| **Prima numerata** | 125 h | – | – | 68% |
| **Prima 1/1 Oro** | – | – | – | **98%** |

Come si legge:

- **Le prime ore sono generose**: oro raro e prima squadra decente subito, come in FC.
- **Le due strategie sono una scelta vera**. I pacchetti Holo portano prima alle holo epiche, ma la squadra cresce molto più lentamente. In genere conviene il pacchetto Oro Premium, come in FC conviene il Premium Gold rispetto ai pacchetti più costosi.
- **Numerata**: in mediana circa 260 ore, e un giocatore su 3 non la trova in 400 ore. È un evento.
- **1/1 Oro**: la trova circa 1 giocatore su 25 in 400 ore. È una leggenda.
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

- [Regole e crediti a partita, aiuto EA](https://help.ea.com/en/articles/ea-sports-fc/fc-rules/)
- [Probabilità ufficiali dei pacchetti EA](https://www.ea.com/games/ea-sports-fc/news/fc-pack-probabilities)
- [Pacchetto Oro Premium a 7.500](https://futmind.com/pack/301/premium-gold-pack) e [Ultimate Pack a 125.000](https://futmind.com/pack/405/ultimate-pack)
- [Premi di Squad Battles in FC 26](https://allthings.how/ea-fc-26-squad-battles-rewards-timing-and-how-it-works/)

- [Probabilità dei pacchetti in EA FC](https://soccergaming.com/fc-ultimate-team-pack-probabilty/)
- [Come progettare probabilità oneste nei gacha](https://bugnet.io/blog/how-to-design-fair-gacha-rates)
- [Come funzionano pity e pull garantiti](https://www.itechguides.com/how-gacha-pity-rates-banners-and-guaranteed-pulls-work/)
- [Analisi e simulazione dei gacha](https://dev.to/hiroshi_takamura_c851fe71/this-is-how-gacha-games-get-ya-game-design-deconstruction-and-simulation-3bhb)
