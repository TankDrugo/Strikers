# Riferimento: il gioco originale

Misure e dinamiche di Super Mario Strikers, ricavate dai file del disco (versione europea G4QP01) e dal codice decompilato. Sono la base di tutte le costanti in `game/src/config.js`.

## Stato

**verificato** · Misure e dinamiche del gioco originale, con le fonti; confronto completo col codice ricostruito e coi valori del disco (`VERIFICA.md`).

Fatto:
- Campo, porte, pallone, personaggi, portiere, tiri e contrasti misurati dal gioco originale, con le fonti
- Confronto col codice ricostruito di parate, tiri, Super Strike, passaggi, contrasti, IA e animazioni (`VERIFICA.md`, 31 ottobre)
- Letti dal disco tutti i valori di `GameTweaks.ini`, dei 7 `Difficulty*.ini`, dei 13 personaggi e di `goalie.ini` (`STRIKERS_REFERENCE.md` §9 bis) e i trigger delle animazioni (`animation/data/strikers_triggers.json`)
- Corretto: la parata tira a sorte al momento del tiro con la curva del livello scelto, uguale per le due squadre (1–55% secondo la barra), poi serve un'animazione che arrivi in tempo; carica del Super Strike 0,91 s

Prossimo:
- Correggere il gioco secondo `VERIFICA.md` (righe 1–7 per prime), poi le animazioni delle ulti
- Da misurare: telecamera originale e altezza delle mesh; tiri dei gregari

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
