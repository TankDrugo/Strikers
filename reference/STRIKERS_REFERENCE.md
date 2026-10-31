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

Valori riletti dal disco il 31 ottobre (elenco completo in §9 bis). Dove non è indicato altro, il file è `GameTweaks.ini` e la funzione che lo legge `GameTweaks::Init` (`GameTweaks.cpp`).

| Parametro | Valore | Chiave e uso nel codice |
|---|---|---|
| Durata massima di carica del tiro | 0,66 s; carica = 0,25 + 0,75 × tempo / 0,66 | `Shot Windup Seconds` · `ShotMeter::ShotReleased` |
| Valore della barra (entra nel tiro a sorte del portiere, §6) | Shooting × 0,06 + carica × 0,29 + porta aperta × 0,40 + vicinanza × 0,25 | `Shot Ratings/Net Open/Player Distance Weight`, `Shot Net Open Angle` 35° · `ShotMeter.cpp` `CalcScoreValue`; vicinanza da 20 m (0) a 7,5 m (1): `Shot Distance Min/Max`, `FuzzyTweaks.ini` |
| Valore della barra nel pallonetto | Shooting × 0,06 + carica × 0,04 + portiere fuori × 0,5 + porta aperta × 0,4 | `Chip Shot Goalie Out Weight`, `Chip Shot Net Open Weight` · `CalcScoreValue` |
| Punto mirato dal tiro | centro del pallone a 0,5 m dall'interno del palo (0,3 m nel pallonetto) | `Shot Offset From Post`, `Chip Shot Offset From Post` · `cFielder::DoFindBestShotTarget` |
| Distanza oltre la quale si tira sempre alto | 19 m dalla porta | `High Shot Distance` · `DoFindBestShotTarget` |
| Variazione casuale del bersaglio | 0,08 in larghezza, 0,04 in altezza (× tempo di volo × (1,1 − valore della barra)) | `Shot Width/Height Variance` · `cFielder::CalcRegularShot` |
| Tiro al volo | carica = caso fino a 0,16 + da 0,25 a 0,64 secondo direzione e distanza; 1 dopo un passaggio perfetto | `Shot Meter Max Onetimer Speed` 0,8 · `ShotMeter::CalcOneTimerValue` |
| Velocità dei passaggi | dalla minima a 1 m di distanza alla massima a 10 m | `Pass Speed Min/Max Dist` · `Player.cpp` `DoCalculatePassSpeed` |
| Distanza minima per un passaggio al volo | 3 m | `Volley Pass Min Distance` |
| Passaggio perfetto | rallentatore 0,17 | `Perfect Pass Slow Mo` |
| Spazzata | a terra 10–15 m/s, verticale 10–12,5 m/s | `Clear Ball Min/Max Ground Speed`, `Min/Max Z Speed` |
| Scivolata: considerata entro (CPU) | 2,5 m dall'avversario | `Do Slide Attack Radius` |
| Scivolata: durata | al massimo 0,35 s finché tieni premuto, poi 0,35 s di frenata | `Slide Attack Maximum Time`, `Slide Attack Fail Up Time` · `ActionSlideAttack` |
| Scivolata: decelerazione | 0,66 | `Slide Attack Deceleration` |
| Scivolata: velocità | turbo con palla livello 2: 7,5 m/s (gregari 7,4) | `WB Run Turbo Level 2 Speed` in `mario.ini`… · `GetSlideAttackSpeed` |
| Spallata invece di scivolata per bloccare | pallone sotto 0,5 m/s | `Block Ball with LAttack under this Speed` |
| Fungo | velocità × 1,5 per 1,33 s | `On Mushrooms Speed/Time` |
| Stella | velocità × 1,2 per 2,5 s | `On Star Speed/Time` |
| Gusci | 12,5 m/s; raggio piccolo 0,35 m, medio 0,7 m, grande 1,0 m | `… Shell Speed`, `Shell … Radius` |
| Raggio delle esplosioni | 2,0 m | `Powerup Explosion Radius` |
| Durata della partita (default) | 300 s | `Game Time` in `DefaultGameplayOptions.ini` |

**Super Strike (Shoot-to-Score):**
- carica: 0,66 + `STS Windup Time` 0,25 = **0,91 s** a ogni livello (`Difficulty*.ini`, `ShotMeter::Update`);
- lancetta sulla clip `captain_shoot_to_score` (127 fotogrammi): sale dal fotogramma 3 al 14,5, scende fino al 26; dopo il 26 il tempo va a 0,1 (`S2S 1st Jump Frame` 3, `S2S Nis Begin Frame` 26, `S2S Kick Frame` 27, `S2S Nis End Frame` 106, in tutti i 13 `.ini` dei personaggi; `FielderActions.cpp` `ActionShootToScore`);
- rallentatore da 0,68 (a 9 m dalla porta) a 0,78 (a 18 m) (`S2S Slow Mo Min/Max`, `FindSTSDistanceAffectedPercentage`);
- pressioni perfette a 0,84 e 0,16 della lancetta, verde da ±0,02 a ±0,06, giallo a 0,1 dal punto perfetto (`S2S Perfect First/Second Button Time`, `S2S Perfect Distance Min/Max`, `S2S 2 Button Press Yellow Dist`; regola in `VERIFICA.md` §3);
- animazioni e scena, fotogramma per fotogramma (risultato al 27, effetto della squadra al 67, calcio al 103,9, pallone al 106 su 127): `VERIFICA.md` §10.

---

## 6. Portiere

Da `goalie.ini`, letto da `GoalieTweaks::Init` (`CharacterTweaks.cpp`); riletti dal disco il 31 ottobre (elenco completo in §9 bis):

| Parametro | Valore | Chiave |
|---|---|---|
| Corsa / corsetta | 6,0 / 4,0 m/s | `Running Speed`, `Jog Speed` |
| Rinvio con calcio | 15–19 m/s, inclinazione 50–60°, solo se il bersaglio è a più di 13 m | `Minimum/Maximum Kick Velocity`, `… Kick Angle`, `Minimum Kick Distance` |
| Lancio con la mano dall'alto | oltre i 7 m | `Minimum Overhand Throw Distance` |
| Tempo massimo con la palla in mano | 2 s | `Goalie Ball Time` |
| Tolleranza per la presa | 0,6 m | `Catch Save Tolerance` |
| Tolleranza per l'intercetto | 0,5 m | `Intercept Save Tolerance` |
| Tiro troppo forte per la presa | sopra 0,3 sulla barra | `Catch Save Max Speed` |
| Energia minima per la presa | 90 (riserva del codice 60) | `Fatigue Catch Threshold` |
| Ritardo della parata mancata | 0,1 s | `Miss Save Delay` |
| Pallonetto: probabilità di inciampare | 0,3 | `Lob Shot Stumble Chance` |
| Tiri ignorati | quelli che mancano la porta di oltre 1 m | `Save Ignore Margin` |
| Virata durante la parata | 100000, rallentamento 4000 | `Save Turn Speed/Falloff` |
| Stordimento dopo un Super Strike | 1–2 s | `Min/Max STS Stun Time` |
| Uscita sul capitano durante il Super Strike | sempre entro 1 m (+ distanza di presa), con l'1% a fotogramma entro 2 m | `STS Attack Close/Max Distance` (riserva del codice 7), `STS Attack Chance Per Frame` · `Goalie.cpp` |
| Fatica | sale con ogni parata: presa 5, presa in tuffo 10, deviazione 7, deviazione in tuffo 15, pugno 7, gamba 6, Super Strike 15 (parata) / 25 (stordimento); recupero 2/s | `Shot Fatigue …`, `Fatigue Recover Rate` |
| Rialzarsi | energia alta 80, bassa 20; con energia bassa si rialza a 0,5× e si sposta a 0,8× | `High/Low Getup Energy`, `Low Getup Speed`, `Low Strafe Speed` |

Come decide la parata (da smstrikers-decomp; correzione del 31 ottobre, dettagli in [`VERIFICA.md`](VERIFICA.md) §1), in due passi:
1. **Tiro a sorte, al momento del tiro** (`cFielder::CalcRegularShot`, `Fielder.cpp`): il valore della barra del tiratore (§5) passa per la curva `Shot Value 1–3` / `Shot Chance 0–4` del **livello di difficoltà scelto**, la stessa per le due squadre (`Game.cpp` `ApplyDifficulty` la copia su entrambe). Probabilità che il portiere sbagli, a barra 0 / 0,25 / 0,6 / 0,75 / 1: Rookie 1 / 5 / 20 / 35 / 55%; Professional 1 / 3 / 17,5 / 35 / 55%; Superstar e Legend 1 / 1 / 15 / 35 / 55% (`Difficulty0…3.ini`). Se esce, il portiere deve sbagliare (`mbShouldMiss`): aspetta `Miss Save Delay` in più e gioca un'animazione di parata mancata.
2. **Parata possibile** (`Goalie::CalcSaveParameters`, `GoalieSave::FindBestSave`): altrimenti divide la porta in una griglia 7 × 5 e cerca, tra le animazioni di parata (`gSaveInfo`), una che arrivi sul punto del pallone entro il tempo di arrivo del tiro; se non c'è, il tiro entra. Tempo di una parata = (contatto − accovacciata) × durata della clip, dai trigger di `mariogoalie.trg` (`GoalieSave::TriggerCallback`): da 0,05 a 0,32 s. Il punto è l'osso `ball` della clip al contatto. Trigger in `animation/data/strikers_triggers.json`, tabella completa delle 69 parate (clip, tipo, tempi, punto di contatto, cella della griglia) in `animation/data/strikers_saves.json`. Posizione, uscite e scelta della parata passo per passo: [`VERIFICA.md`](VERIFICA.md) §9.

La presa è permessa solo per i pallonetti o con portiere riposato (energia ≥ 90) e tiro debole (carica < 0,3); altrimenti solo deviazioni. Il tiro perfetto non cambia la scelta della parata: è più difficile perché è più veloce, curva e alza il valore della barra. La difficoltà non cambia i riflessi del portiere: entra solo dalla curva del tiro. Nel gioco oggi i tempi sono stimati (`GOALIE.saveReact`, `GOALIE.diveSpeed` in `game/src/config.js`) e il tiro a sorte manca: da correggere con questi valori.

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

## 9 bis. Valori letti dal disco (31 ottobre)

Letti dall'ISO G4QP01 (`main.dol` SHA-1 `6dc83dc91d0a…`) col parser di `nlConfig.cpp` (chiavi senza maiuscole, `#` chiude il valore). Tra parentesi il valore di riserva del codice ricostruito.

**`GameTweaks.ini` (`GameTweaks::Init`):** S2S Perfect First Button Time 0,84 · Second 0,16 · Perfect Distance Min 0,02 · Max 0,06 · 2 Button Press Yellow Dist **0,1** · S2S Slow Mo Min 0,68 · Max 0,78 · Perfect Pass Slow Mo **0,17** · Shot Windup Seconds 0,66 · Shot Net Open Angle 35 · Shot Ratings Weight **0,06** · Shot Net Open Weight 0,40 · Shot Player Distance Weight 0,25 · Chip Shot Goalie Out Weight 0,50 · Chip Shot Net Open Weight 0,40 · Shot Meter Max Onetimer Speed 0,8 · Shot Offset From Post 0,5 · Chip Shot Offset From Post 0,3 · High Shot Distance 19 · Shot Width/Height Variance 0,08/0,04 · Pass Speed Min/Max Dist 1/10 · Volley Pass Min Distance 3 · Slide Attack Maximum Time 0,35 · Fail Up Time 0,35 · Deceleration 0,66 · Do Slide Attack Radius 2,5 · Block Ball with LAttack under this Speed 0,5 · Fielder Attributes Weight **0** · Arrived In/Out Radius 0,8/1,3 · Near In/Out Radius 2,5/6,5 · Run To Strafe / Strafe To Run / Backwards To Strafe / Strafe To Backwards Angle 12000/8000/23000/25000 · Swap Controller No Swap Back Time 0,3, Dampen Facing Time 0,33. Mancano nel file e valgono la riserva: GetInPosition KeyFielder Min/Max Distance (2/12), At Target Position Min/Max Radius (0,3/0,6), At Target Remain At Position Min/Max Radius (1/4,5), Filter Dropoff Delay Time/Time (0,5/6). `FuzzyTweaks.ini`: Shot Distance Min 20, Max 7,5 (termine "distanza" del valore della barra).

**Valore della barra** (`ShotMeter.cpp` `CalcScoreValue`): `Shooting × 0,06 + carica × 0,29 + porta aperta × 0,40 + vicinanza × 0,25` (vicinanza 0 a 20 m, 1 a 7,5 m; porta aperta su 35°). Pallonetto: `Shooting × 0,06 + carica × 0,04 + portiere fuori × 0,5 + porta aperta × 0,4`.

**Personaggi (`FielderTweaks::Init`, `mario.ini` e gli altri):** S2S 1st Jump Frame 3 · S2S Nis Begin Frame 26 · S2S Kick Frame 27 · S2S Nis End Frame 106 (tutti i 13 personaggi uguali). Shooting 1 (capitani), 0,8 (superteam), 0 (gregari); Passing 0,6, Dekeing 0,6, Aggression 0,6 (capitani; gregari 0,5 di riserva). Shot Min/Max Speed 29/34, Chip Shot Min/Max Speed 8,5/15 (gregari: 0, riserva). WB Run Turbo Level 2 Speed 7,5 (gregari 7,4). Shot Windup Direction Seek Speed/Falloff 75000/4000 e Shot Windup Decel 6 non stanno nei `.ini`: sono in `g_pTweaks` (`CharacterTweaks.cpp`), trovato identico in `main.dol`.

**Portiere (`GoalieTweaks::Init`, `goalie.ini`):** Catch Save Max Speed 0,3 · Fatigue Catch Threshold **90** (riserva 60) · Miss Save Delay 0,1 · Min/Max STS Stun Time 1/2 · Lob Shot Stumble Chance 0,3 · Catch Save Tolerance 0,6 · Intercept Save Tolerance 0,5 · Goalie Ball Time 2 · Save Turn Speed 100000, Falloff 4000 · Save Back Run Scale 1,5 · Save Ignore Margin 1 · Loose Ball Shot Distance 10 · Pounce Range 1 · STS Attack Close/Max Distance 1/**2** · STS Attack Chance Per Frame 0,01 · STS Attack Ball Speed Multiplier 0,3 · Fatica: default 10, presa 5, presa in tuffo 10, deviazione 7, deviazione in tuffo 15, pugno 7, gamba 6, STS parata 15, STS stordimento 25; recupero 2/s · High/Low Getup Energy 80/20 · Low Getup Speed 0,5 · Low Strafe Speed 0,8 · Throwing Turn Speed 50000.

**Difficoltà (`SkillTweaks::Init`, `GameTweaks.cpp`).** Importante (`Game.cpp` `ApplyDifficulty`): ogni squadra legge la sua tabella (`DifficultyHuman.ini` se ha giocatori umani), ma **Shot Value/Chance, STS Windup Time, Attack Carrier Range, Loose Ball Range e Goalie Intercept Pass vengono poi sovrascritti per entrambe le squadre** con quelli del livello scelto (Braindead = allenamento, 0 Rookie, 1 Professional, 2 Superstar, 3 Legend). Il file Superhuman non è mai usato dai menu. Un valore assente vale 0,5 (*corsivo*).

| Valore | Braindead | 0 | 1 | 2 | 3 | Superhuman | Human |
|---|---|---|---|---|---|---|---|
| Avoidance Effectiveness | 0,1 | 0,01 | 0,5 | 0,85 | 1 | 1 | 0,5 |
| Deke Chance | 0 | 0 | 0,358 | 0,717 | 1 | 1 | 0,65 |
| Ground Pass Chance | 0,01 | 0,05 | 0,3 | 0,672 | 0,85 | 1 | 0,75 |
| Volley Pass Chance | 0 | 0,05 | 0,3 | 0,672 | 0,85 | 1 | 0,7 |
| Shooting Chance | 0,01 | 0,1 | 0,525 | 0,95 | 1 | 1 | 0,95 |
| Chip Shot Chance | 0 | 0,05 | 0,486 | 0,922 | 0,9 | 1 | 0,5 |
| Captain ShootToScore Chance | 0 | 0,1 | 0,5 | 0,9 | 1 | 1 | 1 |
| Ground / Volley OneTimer Chance | 0 / 0 | 0,05 / 0,05 | 0,475 / 0,525 | 0,9 / 1 | 1 / 1 | 1 / 1 | 0,8 / 0,8 |
| OneTouch Ground = Volley Pass Chance | 0 | 0,15 | 0,25 | 0,694 | 0,85 | 1 | 0,5 |
| PassReceive Hit / Powerup Chance | 0 / 0 | 0,1 / 0,1 | 0,3 / 0,3 | 0,683 / 0,683 | 0,8 / 1 | 1 / 1 | 0 / 0 |
| Windup Deke / Pass / Powerup Chance | 0 / 0 / 0 | 0 / 0 / 0 | 0,25 / 0,25 / 0,25 | 0,667 / 0,672 / 0,65 | 1 / 0,983 / 1 | 1 | 0 |
| Cut And Break Chance | 0 | 0,01 | 0,61 | 0,72 | 1 | 1 | 1 |
| Turbo With Ball Chance | 0 | 0 | 0,333 | 0,667 | 1 | 1 | 0,75 |
| Reaction | *0,5* | 0 | 0,25 | 0,667 | 1 | 1 | *0,5* |
| Block Pass / Block Shot Chance | 0 / 0 | 0,02 / 0,02 | 0,15 / 0,2 | 0,55 / 0,55 | 1 / 1 | 1 | 0 / 0 |
| Slide Attack / Heavy Attack Chance | 0 / 0 | 0,02 / 0,02 | 0,15 / 0,15 | 0,5 / 0,5 | 1 / 0,95 | 1 | 0 / 0 |
| Defend VolleyPass Chance | 0 | 0,05 | 0,15 | 0,5 | 0,95 | 1 | 0 |
| Marking Effectiveness | 0 | 0,05 | 0,2 | 0,55 | 1 | 1 | 0,6 |
| Loose Heavy Attack / Shot Chance | 0 / 0 | 0,01 / 0,05 | 0,15 / 0,2 | 0,5 / 0,717 | 0,95 / 1 | 1 | 0 / 0 |
| Loose Ground = Volley Pass Chance | 0 | 0,05 | 0,33 | 0,694 | 1 | 1 | 0 |
| Captain S2S Perfect First = Second Button Chance | 0 | 0,2 | 0,33 | 0,6 | 0,975 | 1 | 0,4 |
| Shot Value 1 / 2 / 3 | 0,25 / 0,6 / 0,75 | = | = | = | = | = | = |
| Shot Chance 0 / 1 / 2 / 3 / 4 (%) | 1 / 1 / 15 / 35 / 55 | 1 / **5** / **20** / 35 / 55 | 1 / **3** / **17,5** / 35 / 55 | 1 / 1 / 15 / 35 / 55 | 1 / 1 / 15 / 35 / 55 | 1 / 1 / 15 / 35 / 55 | 1 / 1 / 15 / 35 / 55 |
| STS Windup Time | 0,25 | 0,25 | 0,25 | 0,25 | 0,25 | 0,25 | 0,25 |
| Attack Carrier Range | 1 | 2,5 | 3 | 4 | 4 | 4 | 4 |
| Loose Ball Range | −1 | −1 | 1 | 2 | 2 | 2 | 2 |
| Goalie Intercept Pass | 0 | 0 | 1 | 1 | 1 | 1 | 1 |
| Goalie Deke Chance | *0,5* | 0,5 | 0,5 | 0,5 | 0,5 | *0,5* | *0,5* |
| Goalie Deke Speed | *0,5* | 1 | 1,1 | 1,2 | 1,3 | *0,5* | *0,5* |

Curva del tiro a sorte (`cFielder::CalcRegularShot`): interpolazione lineare a tratti tra i punti (0; C0), (V1; C1), (V2; C2), (V3; C3), (1; C4); il portiere deve sbagliare se `100 × caso < valore`. Esempio Rookie: barra 0,25 → 5%, 0,6 → 20%, 0,75 → 35%, 1 → 55%. Carica del Super Strike: 0,66 + 0,25 = **0,91 s** a ogni livello.

Probabilità d'uso dei power-up per la CPU (`Offensive/Defensive/Loose <power-up> Chance`, stessa tabella `SkillTweaks`): le righe `Tornado` dei file non vengono lette. I quattro gusci (verde, rosso, spinoso, ghiaccio), la banana e la bob-omba hanno sempre lo stesso valore, scritto nella colonna "Gusci, banana, bomba".

| File | Situazione | Gusci, banana, bomba | Chain Chomp | Fungo | Stella |
|---|---|---|---|---|---|
| Braindead | tutte | 0 | 0 | 0 | 0 |
| Difficulty0 (Rookie) | tutte | 0,05 | 0,25 | 0,25 | 0,4 |
| Difficulty1 (Professional) | tutte | 0,35 | 0,6 | 0,5 | 0,8 |
| Difficulty2 (Superstar) | attacco | 0,65 | 1 | 0,8 | 1 |
| Difficulty2 (Superstar) | difesa | 0,65 | 0,8 | 0,8 | 0,8 |
| Difficulty2 (Superstar) | palla libera | 0,65 | 0,8 | 0,8 | 1 |
| Difficulty3 (Legend) | attacco | 0,95 | 0,95 | 0,95 | 1 |
| Difficulty3 (Legend) | difesa | 0,95 | 0,95 | 0,95 | 0 |
| Difficulty3 (Legend) | palla libera | 0,5 | 0,7 | 0,95 | 0,8 |
| Superhuman | tutte | 1 | 1 | 1 | 1 |
| Human | tutte | 0,65 | 0,65 | 0,65 | 0,65 |

Probabilità di comparsa dei power-up (`GameTweaks.ini`, pesi relativi): guscio verde 16, banana 15, fungo 14, bob-omba 12, guscio ghiaccio 11, guscio rosso 9, spinoso 9, stella 7, Chain Chomp 7; cambiano fino a ±9 con 0–3 gol di scarto (`Score Difference Minimum/Maximum`). Nel `.ini` di ogni capitano un solo power-up ha `Chance` 10, gli altri 0 (Mario e Luigi fungo, Peach ghiaccio, Daisy guscio rosso, Yoshi spinoso, Wario e Waluigi bob-omba, DK banana); Wario, Waluigi e DK hanno anche `Big Chance` e `Multiples Chance` a ±0,33. Come il gioco li combini coi pesi qui sopra non è stato verificato nel codice.

**Trigger delle animazioni:** `animation/data/strikers_triggers.json` (script `animation/triggers.py`): `mario.trg` 267 trigger su 72 clip (8 clip che non abbiamo), `MarioGoalie.trg` 459 trigger su 81 clip; 53 clip del portiere hanno il trigger di contatto della parata (`0xCF84E7CD`), 35 i tre milestone.

---

## 10. Cosa resta da misurare

- **L'altezza esatta delle mesh**, dalla suola alla cima della testa: serve leggere i modelli `.glg`, che non sono ancora stati estratti.
- **La telecamera di gioco**: i parametri (curve di zoom) non stanno negli `.ini` letti finora. Il valore predefinito è "SIDEZOOM1".
- **I tiri dei gregari**: da dove prendono la velocità.
