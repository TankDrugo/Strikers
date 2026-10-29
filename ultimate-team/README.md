# Ultimate Team

**Stato: da iniziare.** Questa cartella è pronta per il lavoro: quando l'utente dice "lavoriamo su Ultimate Team", si parte da qui.

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

## Da decidere prima di scrivere codice

Domande da fare all'utente nella prima chat su questo tema:

1. Le carte hanno statistiche che cambiano il gioco, o sono solo collezione?
2. Come si ottengono le carte: pacchetti, premi delle partite, crediti?
3. Dove si salvano i progressi: nel browser (`localStorage`) o su un server?
4. Rarità e versioni speciali dello stesso personaggio?
5. Intesa (chemistry) tra i giocatori della squadra?

## Struttura proposta (da confermare)

```
ultimate-team/
  README.md        questo file
  DESIGN.md        regole decise con l'utente
  src/             logica (collezione, pacchetti, formazione), importata da game/src
  data/            definizione delle carte
```
