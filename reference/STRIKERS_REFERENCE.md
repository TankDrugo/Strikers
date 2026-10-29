# Super Mario Strikers: misure e dinamiche di riferimento

Documento per adattare un gioco di calcio arcade alle proporzioni e alle dinamiche di **Super Mario Strikers** (GameCube, 2005).

**Fonti:**
- i file di gioco originali, versione europea G4QP01 (*Mario Smash Football*): `main.dol` con SHA-1 `6dc83dc9…`;
- il codice ricostruito [smstrikers-decomp](https://github.com/yannicksuter/smstrikers-decomp), commit `d1f357f`.

Ogni valore riporta la sua fonte. Le costanti prese dal codice ricostruito sono state ritrovate identiche dentro `main.dol`.

Il file `strikers_characters.json` accanto a questo contiene la tabella dei personaggi in forma leggibile da programma.

---

## 1. Convenzioni

| Cosa | Valore nel gioco |
|---|---|
| Unità | metri, secondi, kg |
| Asse verticale | **Z in alto**. Le porte stanno sull'asse X, le linee laterali sull'asse Y |
| Origine | centro del campo, a livello del terreno |
| Fisica | passo fisso di **0,02 s (50 Hz)**, motore ODE (`FixedUpdateTask.cpp`) |
| Animazioni | **30 fotogrammi chiave al secondo** |
| Angoli nei file di tuning | unità a 16 bit: **65536 = 360°**. Le "Turn Speed" sono in unità al secondo: 110000 ≈ 604°/s |

Se il motore del tuo gioco usa Y in alto (Unity, Godot, three.js), scambia Y e Z nei valori qui sotto.

---

## 2. Campo, porte, area di rigore

| Misura | Valore | Fonte |
|---|---|---|
| Campo (lunghezza × larghezza) | **41,20 × 24,17 m** (metà: 20,602 × 12,083) | helper `FieldCorner` di ogni `.wld`; valore iniziale in `Field.cpp` |
| Angoli del campo | arrotondati, **raggio 3,0 m** | `Field.cpp` (`cornerRadius`) |
| Bordi | barriere chiuse su tutti i lati: niente falli laterali né rimesse. Il pallone rimbalza contro le barriere | `Field.cpp`, `PhysicsBall.cpp` |
| Area di rigore | da x = ±13,34 a ±20,60 (profonda 7,26 m), y = ±5,01 (larga 10,0 m) | helper `PenaltyCorner` (nel codice il valore iniziale è 13,5 × 4,5) |
| Porta (apertura) | **5,69 m × 2,56 m** (helper `NetCorner`: x = 20,537, y = ±2,846, z = 2,559) | `.wld` |
| Porta, per stadio | larghezza della rete 5,69–5,92 m, altezza 2,56–2,78 m, raggio dei pali 0,08–0,165 m, pali da 0,02 a 0,25 m dietro la linea di porta | `GoalPostDimensions.ini` |
| Pareti invisibili dietro la rete | circa 6,6–8 m di larghezza, 2,69 m di altezza, 4,3–4,8 m di profondità: tengono il pallone dentro la rete | `GoalPostDimensions.ini` |

Gli stadi principali (Mario, Wario, Yoshi, Peach/Toad, DK/Daisy, Forbidden Dome, Super Stadium) hanno lo stesso campo. Fanno eccezione *The Palace* (20,563 × 12,049) e *Koopadome* (20,734 × 12,318).

Per confronto, un campo vero misura 105 × 68 m e una porta 7,32 × 2,44 m: il campo di Strikers è molto più piccolo, mentre la porta è quasi a grandezza reale e più alta.

---

## 3. Il pallone

| Parametro | Valore | Fonte |
|---|---|---|
| Raggio | **0,18 m** (diametro 0,36 m; un pallone vero ha raggio 0,11 m) | `Ball.cpp:93` |
| Massa | 1 kg | `PhysicsSphere.cpp` |
| Gravità (solo per il pallone) | **−14 m/s²** | `PhysicsBall.cpp:421` |
| Resistenza dell'aria | forza = −0,1 · v | `g_BallAirResistance` |
| Resistenza al rotolamento | freno costante di 5 N a terra | `g_BallRollingResistance` |
| Rimbalzo: terreno / barriere / altro | 0,375 / 0,45 / 0,25 | `g_BallBounce*` |
| Attrito: terreno / barriere | 3 / 4 (μ di ODE) | `g_BallFriction*` |
| Velocità massima | 50 m/s, tagliata prima e dopo ogni passo di fisica | `GetBallMaxVelocity` |
| Tetto | sopra i 20 m la velocità verso l'alto si riduce del 10% a ogni passo | `PhysicsBall::PostUpdate` |
| Effetto Magnus (curva) | forza = (ω × v) · (0,075 in x e y; 0,04 in z). Attivo **solo** con la barra del tiro ≥ 0,99, e non nei Super Strike. Solo in aria, con \|v\| > 1 m/s e \|ω\| > 1 rad/s | `PhysicsBall::AddResistanceForces`, `Fielder.cpp:2985` |
| Spin di un tiro normale | casuale, in rad/s: avanti ±7,5; laterale ±15; verticale da 10 a 25 (il segno dipende dalla posizione del bersaglio). Ridotto al 40% nei tiri al volo | `Fielder.cpp:2942–2992` |
| Correzione della mira con la curva | il gioco simula il tiro con un pallone "fantasma" e ruota la direzione di partenza perché la curva finisca sul bersaglio | `Ball.cpp:1496–1525` |
| Passaggi mirati | velocità calcolata in forma chiusa dato punto d'arrivo e tempo (`ShootAtFast`), con gravità × 1,025 | `Ball.cpp:1589` |

Formula di `ShootAtFast`, con k = 0,1, g = −14 · 1,025, t = tempo di volo desiderato:
```
e  = exp(-k*t)
vx = k*dx / (1-e)
vy = k*dy / (1-e)
vz = k*(dz - g*t/k) / (1-e) + g/k
```

---

## 4. I personaggi

### 4.1 Dimensioni e parametri per personaggio

Le altezze sono misurate sullo scheletro nella posa `idle`, fotogramma 0: sono **le altezze delle ossa, non della mesh**. La cima della testa visibile sta circa 0,1–0,15 m sopra l'osso della testa. Per alcuni personaggi l'"osso più alto" è un cappello o un accessorio.

| Personaggio | Testa (osso) | Osso più alto | Bacino | Corsa | Turbo | Col pallone | Turbo pallone 1/2/3 | Capsula alt./larg. | Tiro min–max | Passaggio a terra |
|---|---|---|---|---|---|---|---|---|---|---|
| Mario | 0.72 | 0.87 | 0.36 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.33 | 29–34 | 8.5–19 |
| Luigi | 0.75 | 1.00 | 0.43 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.3 | 29–34 | 8.5–19 |
| Peach | 0.93 | 1.19 | 0.58 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.3 | 29–34 | 8.5–19 |
| Daisy | 0.93 | 1.17 | 0.58 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.3 | 29–34 | 8.5–19 |
| Yoshi | 0.71 | 0.71 | 0.38 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.35 | 29–34 | 8.5–19 |
| Wario | 0.72 | 0.94 | 0.25 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.48 | 29–34 | 8.5–19 |
| Waluigi | 0.96 | 1.10 | 0.66 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.3 | 29–34 | 8.5–19 |
| DonkeyKong | 0.83 | 0.94 | 0.63 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.64 | 29–34 | 8.5–19 |
| Birdo | 0.67 | 0.67 | 0.35 | 6 | 6.8 | 5.9 | 6.8/7.4/7.8 | 0.3 / 0.35 | – | – |
| Toad | 0.50 | 0.71 | 0.23 | 6 | 6.8 | 5.9 | 6.8/7.4/7.8 | 0.3 / 0.3 | – | – |
| Koopa | 0.73 | 0.73 | 0.33 | 6 | 6.8 | 5.9 | 6.8/7.4/7.8 | 0.3 / 0.36 | – | – |
| HammerBro | 0.73 | 0.73 | 0.33 | 6 | 6.8 | 5.9 | 6.8/7.4/7.8 | 0.3 / 0.36 | – | – |
| SuperTeam | 0.96 | 1.10 | 0.66 | 6.1 | 7 | 6 | 7/7.5/8 | 0.3 / 0.3 | 29–34 | 8.5–19 |
| MarioGoalie (Kritter) | 0.98 | 0.98 | 0.57 | 6 | – | – | –/–/– | 0.8 / 0.65 | – | 9–19 |

Velocità in m/s, misure in metri.

**Fonti:**
- altezze: `art/animation/<nome>.shier` e `.sanim`;
- parametri: `<nome>.ini` (`mario.ini`, `dk.ini`, `goalie.ini`…).

**Altri valori:**
- Tutti i giocatori di movimento hanno corsetta (Jog) a 4,5 m/s; il portiere 4,0 m/s.
- I gregari (Birdo, Toad, Koopa, Hammer Bro) non definiscono tiri e passaggi nel loro `.ini`. Il codice usa allora i valori di riserva: passaggi 5,5–16 m/s a terra e 5,5–14 m/s al volo, tiro 0. Come vengano calcolati davvero i loro tiri è **da verificare**.
- Velocità laterale 4,9 m/s e all'indietro 5,3 m/s (Mario).
- Pallonetto (Mario): 8,5–15 m/s.
- Passaggio al volo (Mario): 8,5–11,5 m/s; per il portiere è fisso a 7 m/s.
- Limite assoluto alla velocità di un personaggio: 15 m/s (`Character.cpp:2332`).

### 4.2 Accelerazioni e virate (uguali per tutti)

Valori in `CharacterTweaks.cpp`, array `g_pTweaks`, verificati in `main.dol`:

| Stato | Accelerazione | Decelerazione | Arresto | Virata, rallentamento finale |
|---|---|---|---|---|
| Corsa senza pallone | 25 m/s² | 45 m/s² | 9,5 m/s² | 4000 |
| Laterale / all'indietro | 17,5 | 17,5 | – | 4000 |
| Turbo | 22,5 | 18 | – | 2600 |
| Corsa col pallone | 25 | 18 | 10 | 3200 |
| Turbo col pallone | 20 | 20 | – | 2600 |
| Carica del tiro | – | 6 | – | velocità di virata 75000, rallentamento 4000 |

La velocità avanza verso quella desiderata di accelerazione × dt (`SeekSpeed`): da fermo Mario arriva a 6,1 m/s in circa 0,24 s. La direzione ruota alla "Turn Speed" (vedi `.ini`) e rallenta nell'ultimo tratto (sotto i 4000 di differenza ≈ 22°), secondo la funzione `SeekDirection` in `AiUtil.cpp`.

Velocità di virata di Mario: corsa 110000 (≈ 604°/s), laterale 140000, turbo 70000, col pallone 80000, turbo col pallone 90000.

### 4.3 Collisione

Ogni personaggio è una capsula verticale. Capitani e gregari hanno `Capsule Height` 0,3 m, con larghezza da 0,3 a 0,64 m (Donkey Kong). Il portiere ha capsula 0,8 × 0,65 m. Il pallone, durante il dribbling, diventa un sotto-oggetto del personaggio e segue l'osso `ball` dell'animazione.

---

## 5. Tiri, passaggi, contrasti

**Da `GameTweaks.ini`:**

| Parametro | Valore |
|---|---|
| Durata massima di carica del tiro | 0,66 s |
| Punto mirato dal tiro | centro del pallone a 0,5 m dall'interno del palo (0,3 m nel pallonetto) |
| Distanza oltre la quale si tira sempre alto | 19 m dalla porta |
| Variazione casuale del bersaglio | ±0,08 in larghezza, ±0,04 in altezza |
| Potenza massima del tiro al volo | 0,8 sulla barra (minimo: metà) |
| Velocità dei passaggi | dalla minima a 1 m di distanza alla massima a 10 m |
| Distanza minima per un passaggio al volo | 3 m |
| Spazzata | a terra 10–15 m/s, verticale 10–12,5 m/s |
| Scivolata: considerata entro | 2,5 m dall'avversario |
| Scivolata: durata | 0,35 s + 0,35 s di recupero |
| Scivolata: decelerazione | 0,66 |
| Fungo | velocità × 1,5 per 1,33 s |
| Stella | velocità × 1,2 per 2,5 s |
| Gusci | 12,5 m/s; raggio piccolo 0,35 m, medio 0,7 m, grande 1,0 m |
| Raggio delle esplosioni | 2,0 m |
| Durata della partita (default) | 300 s (`DefaultGameplayOptions.ini`) |

**Super Strike (Shoot-to-Score):**
- rallentatore 0,68–0,78;
- finestra "perfetta" ±0,02–0,06 attorno ai punti 0,84 e 0,16 della barra;
- fotogrammi del calcio da `mario.ini`: salto al fotogramma 3, calcio al 27.

---

## 6. Portiere

Da `goalie.ini`:

| Parametro | Valore |
|---|---|
| Corsa / corsetta | 6,0 / 4,0 m/s |
| Rinvio con calcio | 15–19 m/s, inclinazione 50–60°, solo se il bersaglio è a più di 13 m |
| Lancio con la mano dall'alto | oltre i 7 m |
| Tempo massimo con la palla in mano | 2 s |
| Tolleranza per la presa | 0,6 m |
| Tolleranza per l'intercetto | 0,5 m |
| Tiro troppo forte per la presa | sopra 0,3 sulla barra |
| Tiri ignorati | quelli che mancano la porta di oltre 1 m |
| Stordimento dopo un Super Strike | 1–2 s |
| Fatica | sale con ogni parata: presa 5, presa in tuffo 10, deviazione 7/15, Super Strike 15/25; recupero 2/s |

---

## 7. Animazioni e velocità di gioco

- Le clip hanno il movimento della radice. La **velocità lineare** di una clip è la distanza percorsa dalla radice divisa per la durata. Per Mario: corsetta 2,27 m/s, corsa col pallone 3,61 m/s, turbo 4,94 m/s.
- Mentre corre, il gioco riproduce l'animazione a **velocità = velocità reale / velocità lineare della clip, limitata tra 0,6× e 1,4×** (`Character.cpp:1725`). Il turbo col pallone è fisso a 2×. Mario corre a 6 m/s con una clip "da 3,6 m/s": l'animazione gira a 1,4× e i piedi scivolano un po'. È voluto, fa parte dello stile arcade.
- Le clip di corsa dritta e inclinata a destra/sinistra avanzano sincronizzate e vengono miscelate in base allo sterzo (`Fielder.cpp:4296`).
- Le transizioni fra animazioni durano 0,067–0,133 s.
- Le clip a sinistra sono le clip a destra specchiate al volo.
- La tabella completa degli stati è in `src/Game/AnimProps/globalanimproperties.cpp`. Il convertitore `strikers_anim.py` esporta tutte le clip in Blender.

---

## 8. Proporzioni chiave

In "altezze di Mario", prendendo per Mario un'altezza visibile di circa 0,85–0,9 m:

| Rapporto | Strikers | Calcio reale (giocatore di 1,8 m) |
|---|---|---|
| Lunghezza del campo / altezza del personaggio | ≈ 47 | ≈ 58 |
| Larghezza del campo / altezza | ≈ 27 | ≈ 38 |
| Larghezza della porta / altezza | ≈ 6,5 | ≈ 4 |
| Altezza della porta / altezza | ≈ 2,9 | ≈ 1,35 |
| Diametro del pallone / altezza | ≈ 0,41 | ≈ 0,12 |
| Velocità di corsa / altezza (al secondo) | ≈ 7 (turbo ≈ 9) | ≈ 4 |
| Velocità di tiro | 29–34 m/s | 25–35 m/s |

In sintesi, rispetto a un calcio reale: personaggi piccoli e tozzi (il bacino sta al 40% dell'altezza, contro il 55% di un umano), pallone enorme, porte enormi, campo compatto e chiuso da barriere, corsa velocissima rispetto alla taglia, gravità del pallone 1,4 volte quella reale.

---

## 9. Come adattare un personaggio esistente (es. `portiere.glb`)

Il modello attuale `portiere.glb`:
- scheletro Mixamo, alto **1,70 m**, bacino a 0,92–0,99 m;
- animazioni **sul posto** (la radice non avanza);
- *Running*: ciclo di 0,633 s, ritmo dei passi equivalente a **4,9 m/s**;
- *Walking*: ciclo di 1,033 s, **1,4 m/s**.

Le velocità sono misurate dal piede d'appoggio.

**Procedura consigliata:**
1. **Tenere il mondo in metri di Strikers**: campo, porte, pallone e gravità come nelle sezioni 2–3. Si scala il personaggio, non il mondo: così tutti i valori di questo documento si usano senza conversioni.
2. **Scalare il modello in modo uniforme:**
   - per un portiere alla Kritter (testa a 0,98 m, cima della testa ≈ 1,1 m): scala ≈ **0,65**;
   - per un giocatore di movimento della taglia di Mario (≈ 0,9 m): scala ≈ **0,53**.
3. **Velocità di riproduzione:**
   - dopo la scala, il ritmo naturale della corsa diventa 4,9 × scala, cioè 3,2 m/s a 0,65 e 2,6 m/s a 0,53;
   - si usa la regola di Strikers: `velocità di riproduzione = clamp(velocità reale / (4,9 × scala), 0,6, 1,4)`;
   - un portiere a 6 m/s gira quindi a 1,4× con un leggero scivolamento dei piedi, come nell'originale;
   - per eliminare lo scivolamento serve una clip con passi più lunghi.
4. **Collisione:** una capsula come quella del Kritter, alta 0,8 m e larga 0,65 m, centrata sul personaggio.
5. **Proporzioni del corpo:** una scala uniforme non rende il personaggio tozzo come quelli di Strikers. Per quello serve modificare il modello (gambe più corte, testa più grande), non i parametri di gioco.

---

## 10. Cosa resta da misurare

- **L'altezza esatta delle mesh**, dalla suola alla cima della testa: serve leggere i modelli `.glg`, che non sono ancora stati estratti.
- **La telecamera di gioco**: i parametri (curve di zoom) non stanno negli `.ini` letti finora. Il valore predefinito è "SIDEZOOM1".
- **I tiri dei gregari**: da dove prendono la velocità.
