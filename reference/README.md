# Riferimento: il gioco originale

Misure e dinamiche di Super Mario Strikers, ricavate dai file del disco (versione europea G4QP01) e dal codice decompilato. Sono la base di tutte le costanti in `game/src/config.js`.

## Stato

**in verifica** · Misure e dinamiche del gioco originale, con le fonti. In corso il confronto di tutta la partita col codice ricostruito (`VERIFICA.md`).

Fatto:
- Campo, porte, pallone, personaggi, portiere, tiri e contrasti misurati dal gioco originale, con le fonti
- Confronto col codice ricostruito di parate, tiri, Super Strike, passaggi, contrasti, IA e animazioni (`VERIFICA.md`, 31 ottobre)
- Corretto: la parata tira a sorte al momento del tiro (curva della difficoltà del tiratore), poi serve un'animazione che arrivi in tempo

Prossimo:
- Leggere dal disco `GameTweaks.ini`, `Difficulty*.ini`, `mario.ini`, `goalie.ini` e i trigger `.trg`, poi correggere il gioco secondo `VERIFICA.md`
- Da misurare: telecamera originale e altezza delle mesh

| File | Contenuto |
|---|---|
| [`STRIKERS_REFERENCE.md`](STRIKERS_REFERENCE.md) | Il documento completo, con la fonte di ogni valore: convenzioni, campo e porte, pallone, personaggi (altezze, velocità, accelerazioni, virate), passaggi e tiri, portiere, contrasti, animazioni, telecamera |
| [`strikers_characters.json`](strikers_characters.json) | La tabella dei personaggi originali in forma leggibile da programma |
| [`VERIFICA.md`](VERIFICA.md) | Confronto comportamento per comportamento (parate, tiri, Super Strike, passaggi, contrasti, IA, animazioni) tra il codice ricostruito e il nostro gioco, con le correzioni da fare |

## Codice decompilato

[yannicksuter/smstrikers-decomp](https://github.com/yannicksuter/smstrikers-decomp), commit `d1f357f` (ancora l'ultimo il 31 ottobre). Non è copiato qui: per controllare un valore, clonalo a parte e cerca il file citato nel riferimento (per esempio `Ball.cpp`, `PhysicsBall.cpp`, `Fielder.cpp`).

## Differenze volute rispetto all'originale

| Cosa | Originale | Nel nostro gioco | Perché |
|---|---|---|---|
| Altezza dei personaggi | 0,89 m (giocatore), 1,09 m (portiere) | × 1,3 (`SIZE`) | Scelta dell'utente: in campo sembravano troppo piccoli |
| Raggio del pallone | 0,18 m | 0,13 m | Scelta dell'utente: sembrava troppo grande |

Distanze di presa, contrasto e tuffo crescono con `SIZE`. Velocità, accelerazioni, campo e porte restano quelli originali.
