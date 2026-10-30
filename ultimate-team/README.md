# Ultimate Team

## Stato

**progettato** · Collezione di personaggi, carte e squadre.

Fatto:
- Regole decise: carte con statistiche, rarità, numerate 1-10 e 1/1 uniche
- Economia calibrata sul ritmo di FC, con simulatore
- Aspetto scelto: 5 holo, teca graduata, walkout a indizi con imbustamento

Prossimo:
- Scrivere il codice di Club, Rosa, Mercato, Divisioni e Album
- Esultanze del walkout dai file art/nis/ del disco

Regole in [`DESIGN.md`](DESIGN.md), economia in [`ECONOMIA.md`](ECONOMIA.md) (numeri in `data/economy.json`, simulatore in `tools/economy_sim.py`).

## Idea

Una modalità in cui il giocatore colleziona personaggi (carte), compone la propria squadra di 5 e la usa in partita, come Ultimate Team di EA FC.

## Con cosa si collega

| Parte esistente | Collegamento |
|---|---|
| `game/assets/roster.json` | Oggi decide chi gioca. La squadra scelta in Ultimate Team dovrà riempire i 5 posti di una squadra (`teams[0]`): posti 0–3 giocatori di movimento, posto 4 portiere |
| `characters/` e `animation/add_characters.py` | I personaggi disponibili per le carte sono quelli del roster |
| `game/src/config.js` (`FIELDER`, `GOALIE`) | Oggi tutti i giocatori hanno le stesse statistiche. Se le carte devono avere statistiche (velocità, tiro, passaggio…), andranno lette per giocatore invece che da queste costanti |
| `interfaccia-gioco/` | Le schermate (collezione, pacchetti, formazione) sono lavoro dell'interfaccia: decidere insieme chi fa cosa |
| `game/src/main.js` | Menu principale: qui va il punto d'ingresso della modalità |

## Decisioni (sintesi)

Statistiche che cambiano il gioco; carte da pacchetti comprati con crediti guadagnati giocando; salvataggio nel profilo (browser, poi server privato); rarità Bronzo/Argento/Oro, holo di più tipi, numerate 1-10 e 1/1 Oro; niente intesa. Dettagli in `DESIGN.md`.

## Struttura proposta (da confermare)

```
ultimate-team/
  README.md        questo file
  DESIGN.md        regole decise con l'utente
  ECONOMIA.md      crediti, pacchetti, mercato: studio e simulazione
  tools/           economy_sim.py
  src/             logica (collezione, pacchetti, formazione), importata da game/src
  data/            definizione delle carte
```
