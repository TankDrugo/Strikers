# Verifica del funzionamento della partita contro l'originale

Confronto, comportamento per comportamento, tra il gioco originale e il nostro codice (`game/src/`). Per ogni comportamento: funzione o file del codice ricostruito, valori dei file `.ini`, cosa fa oggi il nostro gioco, differenza, correzione proposta.

**Fonti ammesse:**
1. codice ricostruito [smstrikers-decomp](https://github.com/yannicksuter/smstrikers-decomp), commit `d1f357f` (17 settembre 2026). Il 31 ottobre è ancora l'ultimo commit di `main`: non ce n'è uno più recente;
2. i file del disco europeo G4QP01 (`.ini`, `.trg`, animazioni, `main.dol`).

**Stato della verifica (31 ottobre):** letto il codice ricostruito. I file del disco non sono ancora disponibili in questa sessione: i valori che vengono dai `.ini` e dai `.trg` sono segnati **[disco]** e vanno letti prima di correggere il gioco. Dove il codice ricostruito ha solo un valore di riserva (il secondo argomento di `cfg.Get`), è scritto "riserva": il valore vero è nel `.ini`.

Abbreviazioni: *FA* = `src/Game/AI/FielderActions.cpp`, *F* = `src/Game/AI/Fielder.cpp`, *FD* = `src/Game/AI/FielderDesires.cpp`, *GT* = `src/Game/GameTweaks.cpp`, *CT* = `src/Game/CharacterTweaks.cpp`.

---

## Riepilogo: differenze in ordine di importanza

| # | Comportamento | Originale | Nostro gioco | Gravità |
|---|---|---|---|---|
| 1 | **Esito del tiro e parata** | Al momento del tiro si tira a sorte se il portiere deve sbagliare (`CalcRegularShot` → `mbShouldMiss`), con una probabilità che dipende dal tiratore (attributo Shooting, carica) e dalla difficoltà della sua squadra (`Shot Value/Chance` dei `Difficulty*.ini`). Se non deve sbagliare, para solo se una delle sue 69 animazioni di parata arriva sul pallone in tempo (griglia 7×5, tempi dai trigger `.trg`, posizione dall'osso `ball`) | Nessun tiro a sorte. Reazione 0,14 s + tuffo a 9 m/s (stime). Presa al 65% a caso | alta |
| 2 | **Velocità e mira del tiro** | Velocità = interpolazione tra Shot Min e Max Speed su distanza × (0,3 + carica), da 3 a 18 m. Carica = 0,25 + 0,75 × tempo/0,66; tenuto fino in fondo il tiro parte da solo a carica 1 | Velocità solo dalla carica (0,15 + 0,85 × carica). Il tiro parte da solo 0,4 s dopo la barra piena | alta |
| 3 | **Tiro perfetto** | Carica ≥ 0,99, cioè barra tenuta fino alla fine (dopo 0,653 s su 0,66 o rilascio automatico). Nessuna finestra, nessuna penalità se tieni troppo | Finestra "verde" in cima alla barra (±0,06) e scade 0,12 s dopo la barra piena | alta |
| 4 | **Super Strike: regola del risultato** | Una sola lancetta che sale (0→1) e scende (1→0) a tempo di animazione. Conta soprattutto la **seconda** pressione: nel verde = gol, nel giallo = parata con stordimento (o respinta), fuori = respinta. La **prima** pressione perfetta allarga il verde della seconda e, se anche la seconda è nel verde, dà il tiro imparabile | Due lancette, 2/1/0 punti a pressione; 4 = imparabile, 3 = gol | alta |
| 5 | **Super Strike: tempi** | Carica = 0,66 s + `STS Windup Time` (difficoltà). Lancetta guidata dai fotogrammi `S2S 1st Jump Frame` e `S2S Nis Begin Frame` del `.ini` del personaggio. Rallentatore da `S2S Slow Mo Min` a `Max` secondo la distanza (9→18 m), poi 0,1 dopo il punto di non ritorno. Velocità del tiro = 1,25 × quella di un tiro normale | Carica 1,6 s, lancetta 0,9 s, rallentatore 0,72 fisso, 30 m/s: tutte stime | alta |
| 6 | **Istanti di contatto** | Tiro al fotogramma 1,825 della clip di calcio; passaggio al 12% della clip; spallata dai fotogrammi 4–14; parate e altri dai trigger `.trg` | Stimati dal piede più veloce (`retarget.py`, `contact_time`). Il tiro perfetto parte dopo 0,51 s invece di 0,06 s; clip di tiro accelerate a 1,25–1,35× (inventato) | alta |
| 7 | **CPU e difficoltà** | Ogni squadra legge una tabella di circa 45 valori (`Difficulty0…3.ini` per la CPU, `DifficultyHuman.ini` per chi gioca): probabilità di tiro, passaggio, finta, scivolata, spallata, Super Strike, tempi di reazione, raggio di pressing… Le decisioni seguono gli script `DefaultOffensive`/`DefaultDefensive` | IA a ruoli scritta da noi. La difficoltà cambia velocità dei giocatori (×0,9–1,08) e riflessi del portiere (×1,4–0,75): l'originale non fa nessuna delle due cose | alta |
| 8 | **Scivolata** | Velocità = turbo con palla livello 2 (Mario 7,5 m/s) verso il punto d'intercetto; dura finché tieni premuto, al massimo 0,35 s, poi frena per 0,35 s; se il piede (osso `ball`) tocca il pallone, **chi scivola prende la palla** | 9 m/s fissi, 0,35 s fissi; il pallone schizza via a 7 m/s | media |
| 9 | **Spallata e reazioni** | La spallata segue il movimento della clip (root motion) a 1,5×, mirata sul punto d'intercetto; chi la subisce perde la palla con la velocità dell'attaccante e cade per tutta la clip | 7,5 m/s per 0,3 s; pallone in direzione casuale a 5 m/s | media |
| 10 | **Passaggi** | Passaggio a terra dritto con piccola spinta verticale (0,5–2 m/s secondo la distanza); passaggio alto con `ShootAtFast` e tempo = distanza/velocità; passaggio anticipato calcolato col punto d'intercetto; clip scelta dalla direzione (1200/300/600/900); passaggio perfetto | Sempre `pass_1200`; anticipo 0,8 × velocità × tempo; passaggio alto 1,6 volte più lento | media |
| 11 | **Animazioni di corsa** | Molti stati: partenza, arresto, arresto brusco, laterale, all'indietro, inclinate a destra/sinistra miscelate, ricezione, tiro al volo. Velocità della clip adattata solo per corsetta, corsa, laterale e indietro; la corsa turbo gira a 1×, il turbo con palla a 2× | 6 clip di corsa, nessuna miscela. La velocità adattata vale anche per il turbo | media |
| 12 | **Pallone tra i piedi** | Il pallone è attaccato all'osso `ball` della clip (posizione e rotazione) | Formula nostra: davanti ai piedi con un'oscillazione | media |
| 13 | **Tempi di miscela** | Per stato, da `globalanimproperties.cpp`: 0,133 s (corsa), 0,1 s (partenze, Super Strike), 0,067 s (carica, reazioni), 0 (passaggi) | 0,04–0,2 s scelti a mano | bassa |
| 14 | **Portiere: presa o respinta** | Presa possibile solo se il tiro è un pallonetto, oppure se il portiere è riposato (`Fatigue Catch Threshold`) e il tiro è debole (carica < `Catch Save Max Speed`) | 65% a caso sui tiri deboli | media |
| 15 | **Portiere con la palla in mano** | `Goalie Ball Time` 2 s | Rilancia dopo 1,2 s | bassa |

Le righe 1–7 cambiano come si vince una partita; per quasi tutte servono i numeri del disco.

---

## 1. Esito del tiro e parata

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Tiro a sorte | `F` `cFielder::CalcRegularShot`: `fShotValue` (valore della barra) passa per una curva a 4 tratti (`Shot Value 1..3`, `Shot Chance 0..4`) della squadra **che tira**; se `100 × caso < fShotValue` il portiere ha `mbShouldMiss = true` | `Shot Value 1–3`, `Shot Chance 0–4` in `DifficultyHuman.ini` (chi gioca) e `Difficulty0…3.ini` (CPU) **[disco]** | Assente | Il riferimento oggi dice "non tira a sorte": **è sbagliato**. Il gioco tira a sorte, poi controlla se la parata è fisicamente possibile | Aggiungere il tiro a sorte con la curva vera |
| Valore della barra | `ShotMeter.cpp` `CalcScoreValue`: `Shooting × Ratings Weight + carica × (1 − pesi) + apertura porta × peso + distanza × peso` | `Shooting` (`mario.ini`…), `Shot Ratings Weight`, `Shot Net Open Weight`, `Shot Player Distance Weight` (`GameTweaks.ini`) **[disco]** | Assente | – | Calcolarlo come l'originale; l'attributo `tir` delle carte entra qui |
| Il portiere deve sbagliare | `Goalie::CalcSaveParameters`: aggiunge `Miss Save Delay` al tempo e sceglie un'animazione di parata mancata (`mbPlayMiss`) | `Miss Save Delay` (riserva 0,1 s) in `goalie.ini` **[disco]** | – | – | Giocare la clip di parata mancata |
| Parata possibile | `GoalieSave::FindBestSave` / `FindBestInList`: porta divisa in 7×5 celle; per ogni animazione di parata della cella, tempo = (trigger di contatto − trigger di partenza) × durata; serve tempo ≤ tempo d'arrivo del pallone e distanza dal punto di parata < `mfCatchAllowDist` (solo per le prese). Se nessuna clip della cella va bene, cerca nelle celle vicine | Tempi dai trigger delle clip (`mariogoalie.trg`) **[disco]**. Posizione della parata = osso `ball` al trigger di contatto (`GoalieSave::InitData`): **ce l'abbiamo** nelle 99 clip del portiere | `saveReact` 0,14 s + distanza / `diveSpeed` 9 m/s (stime), portata `diveReach` | Il modello a reazione+velocità è una stima. L'originale ha una tabella di 69 parate, ciascuna col suo tempo e il suo punto | Costruire la tabella delle 69 parate dalle nostre clip (posizione) e dai `.trg` (tempi); `saveReact` e `diveSpeed` spariscono |
| Tipi di parata | `GoalieSave.cpp` `gSaveInfo[70]`: prese da fermo (15), prese in tuffo (14), deviazioni (15), deviazioni in tuffo (12), gambe (2), pugni (3), Super Strike (4), pallonetti mancati (4) | – | 3 distanze × 3 altezze, presa o respinta | Mancano gambe, pugni, salti alti, pallonetti mancati | Usare tutte le voci di `gSaveInfo` |
| Presa o respinta | `F` `CalcRegularShot`: prese permesse (`0xFFFF`) solo se pallonetto, oppure energia ≥ `Fatigue Catch Threshold` e carica < `Catch Save Max Speed`; altrimenti solo deviazioni (`0xFFFC`) | `Fatigue Catch Threshold` (riserva 60), `Catch Save Max Speed` (nel riferimento 0,3) **[disco]** | `power < 0.55` e `Math.random() < 0.65` | Probabilità inventata | Regola dell'originale |
| Momento del tuffo | `Goalie::InitActionSaveSetup`, `CalcTimeToPlane`: il pallone viene simulato fino al piano del portiere (`FakeBallWorld`); la clip parte in modo che il trigger di contatto cada all'arrivo (`mfStartTime`) | – | Parte appena il tiro viaggia verso la porta, con velocità della clip `max(1, 0.45/t)` | – | Partenza calcolata dal trigger |
| Difficoltà | La difficoltà non cambia il portiere direttamente: entra solo dalla curva del tiro a sorte della squadra che tira | – | Riflessi del portiere CPU ×1,4 / 1 / 0,85 / 0,75 | Inventato | Togliere; la difficoltà passa dal tiro a sorte |
| Tiro perfetto | Nessun ritardo di lettura: è più difficile solo perché più veloce, curvo e con carica alta (che alza la probabilità di errore del portiere) | – | `perfectReadDelay` 0,1 s (scelta nostra) | Inventato | Togliere |

## 2. Tiro normale

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Carica | `ShotMeter::ShotReleased`: `Interpolate(0.25, 1.0, t / Shot Windup Seconds)`, 1 oltre il tempo | `Shot Windup Seconds` 0,66 (già nel riferimento) | `charge = t/0.66`, potenza `0.15 + 0.85 × charge` | Minimo 0,25, non 0,15 | Formula originale |
| Rilascio automatico | `ShotMeter::Update`: a barra piena passa a `RELEASED` (tiro), tranne il capitano nella metà avversaria (va al Super Strike) | – | Dopo 0,66 + 0,4 s | 0,4 s in più | Rilascio a 0,66 s |
| Velocità | `F` `DoFindBestShotTarget`: `InterpolateRangeClamped(ShotMin, ShotMax, 3, 18, distanza × (0,3 + carica))`, distanza dal palo più vicino | `Shot Min/Max Speed` (Mario 29–34) | Solo dalla carica | Un tiro da vicino è più lento anche a barra piena | Formula originale |
| Bersaglio | `DoFindBestShotTarget`: palo scelto con probabilità dagli angoli palo/portiere (o dalla levetta, ±1); altezza a caso tra `0,18 + raggio palo + Shot Offset From Post` e la traversa meno lo stesso margine; sempre alto oltre `High Shot Distance`; vicino alla porta tiro dritto sul centro | `Shot Offset From Post` 0,5; `High Shot Distance` 19 | Palo opposto al portiere o levetta; altezza 0,35–1,65 m | Altezze e scelta del palo diverse | Formula originale |
| Errore di mira | `CalcRegularShot`: scala = tempo di volo × (1,1 − valore della barra); larghezza × `Shot Width Variance`, altezza × `Shot Height Variance` | 0,08 e 0,04 | `(1 − potenza) × 0,12` rad più varianza fissa | Diverso | Formula originale |
| Contatto | `FA` `ActionShot`: `TestFrameTrigger(1.825)`, a velocità 1 | – | `contact` stimato / 1,25 (0,094 s) e, per il perfetto, 0,683/1,35 = 0,506 s | Il tiro perfetto parte 8 volte troppo tardi | Fotogramma 1,825, clip a 1× |
| Clip | `InitActionShot`: `windup_kick` o, con carica ≥ 0,99, `windup_powershot`; a sinistra specchiate se la porta è a sinistra | – | Uguale, ma mai specchiate | Specchiatura mancante | Specchiare |
| Rotazione durante la carica | `asmRunningWB` (anim 0x56): `SeekDirection` verso la porta con `Shot Windup Direction Seek Speed/Falloff`; frenata = velocità / tempo rimasto, tra `Shot Windup Decel` e 50 | velocità di virata 75000, rallentamento 4000, decelerazione 6 (già nel riferimento) | 6 rad/s, decelerazione 6 | Virata diversa | Valori originali |
| Effetto | `DoRegularShooting`: spin avanti ±7,5, laterale ±15, verticale 10–25, segno verticale da una regola sul bersaglio; ×0,4 al volo; Magnus solo con carica ≥ 0,99 | – | Segno verticale a caso | Segno | Regola originale |
| Tiro al volo | `ShotMeter::CalcOneTimerValue`: carica da direzione e distanza (0,25–0,8 × `Shot Meter Max Onetimer Speed`), 1 dopo un passaggio perfetto | `Shot Meter Max Onetimer Speed` **[disco]** | Assente | – | Più avanti |

## 3. Super Strike

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Chi e dove | `F` `CanDoCaptainShootToScore`: opzione attiva e capitano. `ShotMeter::Update`: metà campo avversaria. `FA` `InitActionShootToScore`: vicino alla linea di porta (entro 2 m e davanti alla porta) diventa un tiro normale | – | Capitano, metà avversaria | Manca il caso vicino alla porta | Aggiungere |
| Carica | `ShotMeter::Update`, `GetTotalDuration`: `Shot Windup Seconds + STS Windup Time` | `STS Windup Time`: `DifficultyHuman.ini` per chi gioca, `Difficulty0…3.ini` per la CPU **[disco]** | 1,6 s (stima) | – | Valore del disco |
| Rilascio prima della fine | `F` (gestione dei tasti): rilasciando B durante la carica lunga parte un tiro normale a carica 1 | – | Tiro normale (già perfetto se nella finestra) | Quasi uguale | – |
| Lancetta | `FA` `ActionShootToScore`: valore = (t − salto) / (centro − salto) in salita, poi 1 − (t − centro)/(inizio NIS − centro) in discesa; t = tempo normalizzato della clip `captain_shoot_to_score` (127 fotogrammi); centro = metà tra `S2S 1st Jump Frame` e `S2S Nis Begin Frame` | `S2S 1st Jump Frame`, `S2S Nis Begin Frame`, `S2S Nis End Frame` in `mario.ini`… **[disco]** (il riferimento ha "salto 3, calcio 27") | Due lancette di 0,9 s ciascuna (stima), clip ferma a mano tra 0,9 e 2,0 s | Durata e forma diverse | Lancetta dal tempo della clip, che gira a velocità normale sotto il rallentatore |
| Prima pressione | Conta solo se la lancetta è oltre `Perfect Second Button Time`. Se dista meno di `S2S Perfect Distance Min` da `Perfect First Button Time` diventa esattamente perfetta. Se non premi entro il centro, vale 1 | `Perfect First Button Time` (0,84), `Perfect Second Button Time` (0,16), `Perfect Distance Min/Max` (0,02/0,06) **[disco: da riconfermare]** | Verde scuro ±0,05, verde chiaro ±0,13 (stima) | Regola diversa | Regola originale |
| Verde della seconda | Parte da `Perfect Distance Min`; se la prima era entro il giallo si allarga fino a `Perfect Distance Max` × moltiplicatore del personaggio (DK, Wario ×1,1; Waluigi, Yoshi ×0,92; Peach, Daisy ×0,84) | `S2S 2 Button Press Yellow Dist` **[disco]**; giallo × 0,75 (DK, Wario), × 1,25 (Waluigi, Yoshi), × 1,5 (Peach, Daisy) | – | – | Regola originale (i nostri personaggi usano i valori di Mario) |
| Seconda pressione | Solo in discesa e con lancetta < 0,6 | – | – | – | Regola originale |
| Risultato | `F` `DoCalcShootToScoreResult`: prima perfetta e seconda nel verde → **SUPER** (imparabile); seconda nel verde → **GOL** (portiere manca); seconda nel giallo → **parata con stordimento**, ma con probabilità crescente verso il bordo diventa respinta (`CalcShootToScoreShot`, `0,95 × caso < valore`); fuori → **respinta** | – | 4 punti = imparabile, 3 = gol | Regola diversa | Regola originale |
| Gol | `Game.cpp`: gol del capitano col Super Strike (`m_uGoalType` 6) vale 2 | – | 2 | Uguale | – |
| Rallentatore | `FindSTSDistanceAffectedPercentage`: da `S2S Slow Mo Min` (a 9 m dalla porta) a `Max` (a 18 m); dopo l'inizio della NIS 0,1; torna 1 al calcio | 0,68–0,78 (nel riferimento) **[disco: da riconfermare]** | 0,72 fisso | Fisso | Formula originale |
| Velocità del tiro | `CalcShootToScoreShot`: tempo = distanza / (1,25 × velocità del tiro); respinta 1,2 volte più lenta. Bersaglio basso (0,18 + margine + caso fino a 0,5 m) | – | 30 m/s (stima) | Stima | Formula originale |
| Portiere | Respinta: 66% (× valore) di schiaffo se lontano più di 7 m, altrimenti parata; giallo: `S2S Save Stun` (stordimento `Min/Max STS Stun Time`); gol: parata mancata; super: `S2S Blast Net` o `S2S Spin` | `Min/Max STS Stun Time` (riferimento 1–2 s) | Simile | Mancano lo schiaffo e la scelta | Più avanti |
| CPU: quando | `FD` (carica): al passaggio alla carica lunga, `Captain ShootToScore Chance` della difficoltà, e solo se `Open ≥ 0,8` e vicinanza al portiere ≤ 0,65 | `Captain ShootToScore Chance` **[disco]** | 25–70% a caso (stima) | Stima | Valore del disco e condizioni originali |
| CPU: pressioni | `FD` `InitDesireShoot`, `DesireShoot`, `F` `S2SShootWasPressed`: con probabilità `Captain S2S Perfect First/Second Button Chance` preme esatto, altrimenti con errore uniforme ±0,3 | **[disco]** | Errore gaussiano 0,16–0,035 (stima) | Stima | Valori del disco |
| Disturbo | Chi difende può far tremare la lancetta con la levetta C (`mfRumbleAmount` riduce le probabilità della CPU); la CPU Superstar/Legend fa tremare quella di chi gioca | – | Assente | – | Più avanti |
| Gli altri | Durante il tiro imparabile tutti tranne il capitano sono congelati (`FreezeEveryoneButCaptain`); il capitano è invulnerabile dopo il punto di non ritorno | – | Si può placcare durante la carica | Uguale fino al salto | – |

## 4. Animazioni

| Cosa | Originale (fonte) | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|
| Quale clip per quale stato | `AnimProps/globalanimproperties.cpp` (119 stati del giocatore), `goalieanimproperties.cpp` | Circa 20 clip usate | Mancano partenze, arresti, arresto brusco, laterale, indietro, inclinate, ricezioni, tiri al volo, passaggi 300/600/900 | Aggiungere per gruppi, a partire da passaggi e corsa |
| Specchiatura | Flag `16777216` della tabella: le clip "0900" e "LEFT" sono le "0300" e "RIGHT" specchiate | Specchiate: finta, reazioni, parate, laterale del portiere | Mancano carica e calci a sinistra, passaggi 900 | Seguire la tabella |
| Miscela | Quarto campo della tabella: 0,133 / 0,1 / 0,067 / 0 s | 0,04–0,2 s | Diverso | Valori della tabella |
| Velocità di riproduzione | `Character.cpp` `MatchAnimSpeedToCharacterSpeed`: velocità / velocità lineare, tra 0,6 e 1,4, **solo** per le clip col flag (ultimo campo: corsetta, corsa, laterale, indietro); turbo con palla livello 1 a 2× in `RUNNING_WB_TURBO` | Anche turbo e turbo con palla | Diverso | Seguire il flag |
| Corsa inclinata | `Fielder.cpp:4296`: dritta, destra e sinistra miscelate secondo lo sterzo | Assente | – | Aggiungere |
| Root motion | `InitMovementFromAnim`: spallata, reazioni, finta, scivolata fallita, Super Strike si muovono con la clip | Finta e reazioni sì; spallata no | Spallata | Root motion anche lì |
| Osso `ball` | `Player.cpp` (`PickupBall`, `GetAnimatedBallOrientation`): il pallone segue posizione e rotazione dell'osso | Formula nostra | Diverso | Seguire l'osso (le clip ce l'hanno) |
| Istanti di contatto | Codice: tiro fotogramma 1,825; passaggio 12% della clip; spallata fotogrammi 4–14; tiri al volo e ricezioni da tabelle (`gOneTimer…ContactAnims`, `GetReceivePassBallContactAnimInfo`); parate e il resto dai trigger `.trg` | `contact` stimato dal piede più veloce | Stime | Codice + `.trg` **[disco]** |
| Trigger | `Triggers/BinaryTriggerFile.cpp`, `CharacterTriggers.cpp`: file `art/animation/<personaggio>.trg` | Non letti | – | Decodificare `mario.trg` e `mariogoalie.trg` |

## 5. Contrasti

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Velocità della scivolata | `F` `GetSlideAttackSpeed`: `WB Run Turbo Level 2 Speed` (Mario 7,5), ×1,4 con fungo o stella | `mario.ini` | 9 m/s | +20% | 7,5 |
| Direzione | `FA` `InitActionSlideAttack`: verso il punto d'intercetto del bersaglio entro 0,7 s | – | Dove guardi | – | Intercetto |
| Durata | `ActionSlideAttack`: finché B è premuto, al massimo `Slide Attack Maximum Time`, poi frenata esponenziale `Slide Attack Deceleration` per `Slide Attack Fail Up Time` | 0,35 / 0,66 / 0,35 (riferimento) | 0,35 s fissi, poi `slide_tackle_up_fail` a 1,6× | Rilascio anticipato mancante, clip accelerata | Regola originale |
| Successo | L'osso `ball` di chi scivola tocca il pallone (raggio 0,05 + 0,18) → **prende la palla** (`PickupBall`); il portatore cade (`Ball.cpp`, `InitActionSlideAttackReact`) | – | Il pallone schizza via a 7 m/s | Diverso | Regola originale |
| Spallata | `FA` `InitActionHit`: velocità = spostamento della clip tra i fotogrammi 4 e 14 / 0,333 s, mirata sull'intercetto; clip a 1,5× con root motion | – | 7,5 m/s per 0,3 s, portata 1,2 × `SIZE` × 0,75 | Diverso | Regola originale |
| Chi subisce | `InitActionHitReact`: perde la palla (`ShootBallDueToContact`, velocità dell'attaccante); clip scelta tra 4 direzioni; resta giù per tutta la clip | – | Pallone a 5 m/s in direzione casuale; clip giusta; stordimento 1,9/1,7 s | Pallone | Regola originale |
| Raggio per decidere la scivolata (CPU) | `Do Slide Attack Radius` | riserva 2,15; riferimento 2,5 **[disco: da riconfermare]** | 2,5 | – | – |

## 6. Passaggi

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Velocità | `Player.cpp` `DoCalculatePassSpeed`: da `Pass … Speed Min` a `Max` secondo la distanza tra `Pass Speed Min Dist` e `Max Dist`, **meno metà della velocità con cui il compagno si avvicina**; `DoClampPassSpeed` la tiene sempre tra i limiti del passaggio **a terra**, anche per quello alto | `mario.ini`; 1 e 10 m (riferimento) | Interpolazione sulla distanza, senza correzione né limite | Manca la correzione per il compagno che viene incontro | Formula originale |
| Passaggio a terra | `Player.cpp` (rilascio del passaggio): velocità dritta = distanza / tempo, verticale 0,5–2,0 m/s secondo la distanza | – | `shootAtFast` con verticale ≤ 1,2 | Diverso | Formula originale |
| Passaggio alto | `ShootAtFast` con tempo = distanza / velocità; verticale ≤ 14 m/s | – | Tempo × 1,6, arrivo a 0,9 m | Diverso | Formula originale |
| Anticipo | `SuggestPassTargetPosition` + `CalcInterceptXY` con la velocità di corsa del compagno; controllo corsetta/corsa | – | 0,8 × velocità × tempo | Stima | Formula originale |
| Rilascio | `FA` `ActionPass`: `TestTrigger(0.12)` (12% della clip) | – | `contact` stimato (0,05 s) | Vicino | 12% |
| Clip | `InitActionPass`: `pass_1200/300/600/900` secondo l'angolo col compagno | – | Sempre `pass_1200` | Mancano 3 direzioni | Aggiungere |
| Passaggio perfetto | `DoCalcCanDoPerfectPass` (vicino alla porta, compagno libero), rallentatore `Perfect Pass Slow Mo` | **[disco]** | Assente | – | Più avanti |

## 7. CPU e difficoltà

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Quale tabella | `GameInfo.cpp` `ApplyDifficultySettings`: lato con giocatori umani → `DifficultyHuman.ini`; lato CPU → `DifficultyBraindead` (allenamento), `Difficulty0` (Rookie), `Difficulty1` (Professional), `Difficulty2` (Superstar), `Difficulty3` (Legend). `SkillTweaks::Init` | tutti **[disco]** | Livelli 0–3 con tabelle stimate (`cpuTune`) | – | Leggere le 6 tabelle |
| Valori | `GT` `SkillTweaks::SkillTweaks`: Avoidance, Deke, Ground/Volley Pass, Shooting, Chip Shot, Captain ShootToScore, One-Timer, One-Touch, PassReceive Hit, Windup Deke/Pass, Cut And Break, Turbo With Ball, Reaction, Block Pass/Shot, Slide Attack, Heavy Attack, Defend VolleyPass, Marking, Loose …, S2S First/Second Button, Shot Value 1–3, Shot Chance 0–4, STS Windup Time, Attack Carrier Range, Loose Ball Range, Goalie Intercept Pass, Goalie Deke Chance/Speed | **[disco]** | – | – | – |
| Velocità della CPU | Nessuna differenza: velocità dai `.ini` dei personaggi | – | ×0,9 / 1 / 1,05 / 1,08 | Inventato | Togliere |
| Decisioni | Script `AI/Scripts/Plays/DefaultOffensive.cpp`, `DefaultDefensive.cpp`, `CommonScript.cpp`, `Fuzzy.cpp`: ogni azione ha una probabilità `CalcSelectChance(valore della tabella, attributo del personaggio)`; reazione `0,3 × (1 − Reaction)` | – | Probabilità al secondo scelte a mano (tiro sotto 14,5 m, scivolata 1,6/s, finta 2,5%…) | Tutto stimato | Prima le probabilità e le reazioni della tabella, poi le condizioni degli script |

## 8. Altro (portiere e pallone)

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Palla in mano | `Goalie Ball Time` | 2 s (riferimento) | Rilancia a 1,2 s | – | 2 s (o prima, se c'è un compagno libero: da verificare in `GoalieActions.cpp`) |
| Rinvio | `Goalie::DoPassRelease` | `Minimum/Maximum Kick Velocity`, angoli (riferimento) | Formula nostra con ×0,9 e ×0,6 | Da verificare | Formula originale |
| Pallone oltre 50 m/s | `PhysicsBall` taglia prima e dopo ogni passo | – | Fino a 69 m/s in una partita (problema noto) | – | Da correggere insieme al tiro |

---

## Dati che servono dal disco

Senza questi file le correzioni 1, 3, 4, 5 e 7 resterebbero stime, quindi non le faccio finché non li ho:

| File (sul disco) | Cosa serve |
|---|---|
| `GameTweaks.ini` | tutti i valori `S2S …`, `Shot … Weight`, `Shot Meter Max Onetimer Speed`, `Pass Speed Min/Max Dist`, `Slide Attack …`, `Do Slide Attack Radius`, `Perfect Pass Slow Mo` (per riconfermare anche quelli già nel riferimento) |
| `DifficultyHuman.ini`, `Difficulty0.ini`…`Difficulty3.ini`, `DifficultyBraindead.ini` | tutta la tabella della difficoltà |
| `mario.ini` (e gli altri personaggi) | `S2S 1st Jump Frame`, `S2S Nis Begin Frame`, `S2S Nis End Frame`, `S2S Kick Frame`, `Shooting`, `Shot Windup …`, `WB Run Turbo Level 2 Speed` |
| `goalie.ini` | `Catch Save Max Speed`, `Fatigue Catch Threshold`, `Miss Save Delay`, `Min/Max STS Stun Time`, `Lob Shot Stumble Chance` |
| `art/animation/mario.trg`, `art/animation/mariogoalie.trg` | istanti di contatto e trigger delle parate |
| `main.dol` | solo per riconfermare le costanti scritte nel codice |

Nessuno di questi file entra nel repository: si leggono in una cartella temporanea e nel repository vanno solo i numeri, con la fonte.
