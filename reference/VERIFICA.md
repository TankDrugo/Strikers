# Verifica del funzionamento della partita contro l'originale

Confronto, comportamento per comportamento, tra il gioco originale e il nostro codice (`game/src/`). Per ogni comportamento: funzione o file del codice ricostruito, valori dei file `.ini`, cosa fa oggi il nostro gioco, differenza, correzione proposta.

**Fonti ammesse:**
1. codice ricostruito [smstrikers-decomp](https://github.com/yannicksuter/smstrikers-decomp), commit `d1f357f` (17 settembre 2026). Il 31 ottobre è ancora l'ultimo commit di `main`: non ce n'è uno più recente;
2. i file del disco europeo G4QP01 (`.ini`, `.trg`, animazioni, `main.dol`).

**Stato della verifica (31 ottobre, sera):** letti il codice ricostruito e i file del disco (`.ini`, `.trg`, `main.dol` con SHA-1 `6dc83dc9…`). Ogni valore riporta il file da cui viene; dove il file non ha la chiave vale il "riserva" del codice (secondo argomento di `cfg.Get`, oppure 0,5 per le tabelle della difficoltà). Tutti i valori letti sono anche in [`STRIKERS_REFERENCE.md`](STRIKERS_REFERENCE.md) §9 bis; i trigger delle animazioni in `animation/data/strikers_triggers.json`.

Abbreviazioni: *FA* = `src/Game/AI/FielderActions.cpp`, *F* = `src/Game/AI/Fielder.cpp`, *FD* = `src/Game/AI/FielderDesires.cpp`, *GT* = `src/Game/GameTweaks.cpp`, *CT* = `src/Game/CharacterTweaks.cpp`.

---

## Riepilogo: differenze in ordine di importanza

| # | Comportamento | Originale | Nostro gioco | Gravità |
|---|---|---|---|---|
| 1 | **Esito del tiro e parata** | Al momento del tiro si tira a sorte se il portiere deve sbagliare (`CalcRegularShot` → `mbShouldMiss`): il valore della barra (Shooting × 0,06 + carica × 0,29 + porta aperta × 0,40 + vicinanza × 0,25) passa per la curva `Shot Value/Chance` del **livello scelto**, uguale per le due squadre (`Game.cpp` `ApplyDifficulty`): da 1% a barra 0 fino a 55% a barra 1 (Rookie 5/20/35% a 0,25/0,6/0,75; Professional 3/17,5/35%; Superstar e Legend 1/15/35%). Se non deve sbagliare, para solo se una delle sue animazioni di parata arriva sul pallone in tempo (griglia 7×5, tempi dai trigger `.trg`, posizione dall'osso `ball`) | Nessun tiro a sorte. Reazione 0,14 s + tuffo a 9 m/s (stime). Presa al 65% a caso | alta |
| 2 | **Velocità e mira del tiro** | Velocità = interpolazione tra Shot Min e Max Speed (29–34 m/s) su distanza × (0,3 + carica), da 3 a 18 m. Carica = 0,25 + 0,75 × tempo/0,66; tenuto fino in fondo il tiro parte da solo a carica 1 | Velocità solo dalla carica (0,15 + 0,85 × carica). Il tiro parte da solo 0,4 s dopo la barra piena | alta |
| 3 | **Tiro perfetto** | Carica ≥ 0,99, cioè barra tenuta fino alla fine (dopo 0,653 s su 0,66 o rilascio automatico). Nessuna finestra, nessuna penalità se tieni troppo | Finestra "verde" in cima alla barra (±0,06) e scade 0,12 s dopo la barra piena | alta |
| 4 | **Super Strike: regola del risultato** | Una sola lancetta che sale (0→1) e scende (1→0) a tempo di animazione. Conta soprattutto la **seconda** pressione: nel verde = gol, nel giallo = parata con stordimento (o respinta), fuori = respinta. La **prima** pressione perfetta allarga il verde della seconda e, se anche la seconda è nel verde, dà il tiro imparabile | Due lancette, 2/1/0 punti a pressione; 4 = imparabile, 3 = gol | alta |
| 5 | **Super Strike: tempi** | Carica = 0,66 + 0,25 (`STS Windup Time`, uguale a ogni livello) = **0,91 s**. Lancetta sulla clip `captain_shoot_to_score` (127 fotogrammi): sale dal fotogramma 3 al 14,5 e scende fino al 26 (`S2S 1st Jump Frame` 3, `S2S Nis Begin Frame` 26), cioè 0,77 s di clip, circa 1,07 s veri col rallentatore. Rallentatore da 0,68 (a 9 m) a 0,78 (a 18 m), poi 0,1 dopo il fotogramma 26. Velocità del tiro = 1,25 × quella di un tiro normale | Carica 1,6 s, lancetta 0,9 s, rallentatore 0,72 fisso, 30 m/s: tutte stime | alta |
| 6 | **Istanti di contatto** | Tiro al fotogramma 1,825 della clip di calcio; passaggio al 12% della clip; spallata dai fotogrammi 4–14; parate dai trigger `.trg` (accovacciata → contatto da 0,05 a 0,32 s secondo la clip) | Stimati dal piede più veloce (`retarget.py`, `contact_time`). Il tiro perfetto parte dopo 0,51 s invece di 0,06 s; clip di tiro accelerate a 1,25–1,35× (inventato) | alta |
| 7 | **CPU e difficoltà** | Ogni squadra legge una tabella di 72 valori (`Difficulty0…3.ini` per la CPU, `DifficultyHuman.ini` per la squadra con giocatori umani): probabilità di tiro, passaggio, finta, scivolata, spallata, Super Strike, reazione, marcatura, power-up… Curva del tiro, carica del Super Strike e aggressività del portiere vengono invece dal livello scelto per tutte e due. Le decisioni seguono gli script `DefaultOffensive`/`DefaultDefensive` | IA a ruoli scritta da noi. La difficoltà cambia velocità dei giocatori (×0,9–1,08) e riflessi del portiere (×1,4–0,75): l'originale non fa nessuna delle due cose | alta |
| 8 | **Scivolata** | Velocità = turbo con palla livello 2 (Mario 7,5 m/s) verso il punto d'intercetto; dura finché tieni premuto, al massimo 0,35 s, poi frena per 0,35 s; se il piede (osso `ball`) tocca il pallone, **chi scivola prende la palla** | 9 m/s fissi, 0,35 s fissi; il pallone schizza via a 7 m/s | media |
| 9 | **Spallata e reazioni** | La spallata segue il movimento della clip (root motion) a 1,5×, mirata sul punto d'intercetto; chi la subisce perde la palla con la velocità dell'attaccante e cade per tutta la clip | 7,5 m/s per 0,3 s; pallone in direzione casuale a 5 m/s | media |
| 10 | **Passaggi** | Passaggio a terra dritto con piccola spinta verticale (0,5–2 m/s secondo la distanza); passaggio alto con `ShootAtFast` e tempo = distanza/velocità; passaggio anticipato calcolato col punto d'intercetto; clip scelta dalla direzione (1200/300/600/900); passaggio perfetto | Sempre `pass_1200`; anticipo 0,8 × velocità × tempo; passaggio alto 1,6 volte più lento | media |
| 11 | **Animazioni di corsa** | Molti stati: partenza, arresto, arresto brusco, laterale, all'indietro, inclinate a destra/sinistra miscelate, ricezione, tiro al volo. Velocità della clip adattata solo per corsetta, corsa, laterale e indietro; la corsa turbo gira a 1×, il turbo con palla a 2× | 6 clip di corsa, nessuna miscela. La velocità adattata vale anche per il turbo | media |
| 12 | **Pallone tra i piedi** | Il pallone è attaccato all'osso `ball` della clip (posizione e rotazione) | Formula nostra: davanti ai piedi con un'oscillazione | media |
| 13 | **Tempi di miscela** | Per stato, da `globalanimproperties.cpp`: 0,133 s (corsa), 0,1 s (partenze, Super Strike), 0,067 s (carica, reazioni), 0 (passaggi) | 0,04–0,2 s scelti a mano | bassa |
| 14 | **Portiere: presa o respinta** | Presa possibile solo se il tiro è un pallonetto, oppure se il portiere è riposato (energia ≥ 90, `Fatigue Catch Threshold`) e il tiro è debole (carica < 0,3, `Catch Save Max Speed`) | 65% a caso sui tiri deboli | media |
| 15 | **Portiere con la palla in mano** | `Goalie Ball Time` 2 s | Rilancia dopo 1,2 s | bassa |
| 16 | **Portiere contro il Super Strike** | Durante la carica può uscire sul capitano (`Goalie.cpp`, clip `gk_attack_s2s_high`): sempre entro 1 m in più della distanza di presa, con l'1% a fotogramma entro 2 m (`STS Attack Close/Max Distance`), solo prima del trigger `0x85181b83` della clip del capitano (fotogramma 24) | Assente | media |

Le righe 1–7 cambiano come si vince una partita. Con i numeri del disco ora si possono correggere tutte.

---

## 1. Esito del tiro e parata

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Tiro a sorte | `F` `cFielder::CalcRegularShot`: `fShotValue` (valore della barra) passa per una curva a 4 tratti (`Shot Value 1..3`, `Shot Chance 0..4`); se `100 × caso < valore` il portiere ha `mbShouldMiss = true`. La curva è quella del **livello scelto** per tutte e due le squadre: `Game.cpp` `ApplyDifficulty` copia `Shot Value/Chance` dal file del livello (`GetSkillLevelAsDifficultyID`) sopra le tabelle delle squadre, anche su quella di chi gioca | Punti (0; 0,25; 0,6; 0,75; 1) in tutti i file. Probabilità in %: Braindead 1/1/15/35/55; Rookie (`Difficulty0.ini`) 1/5/20/35/55; Professional (`Difficulty1.ini`) 1/3/17,5/35/55; Superstar e Legend (`Difficulty2/3.ini`) 1/1/15/35/55. `DifficultyHuman.ini` (1/1/15/35/55) non viene mai usato per la curva | Assente | Il riferimento diceva "non tira a sorte": **era sbagliato**. Il gioco tira a sorte, poi controlla se la parata è fisicamente possibile | Aggiungere il tiro a sorte con la curva del livello |
| Valore della barra | `ShotMeter.cpp` `CalcScoreValue`: `Shooting × 0,06 + carica × 0,29 + porta aperta × 0,40 + vicinanza × 0,25`. Porta aperta = varco visibile accanto al portiere su 35°; vicinanza = 0 a 20 m dalla porta, 1 a 7,5 m (`PlayerShotDistance`). Pallonetto: `Shooting × 0,06 + carica × 0,04 + portiere fuori × 0,5 + porta aperta × 0,4` | `Shooting` 1 (capitani, `mario.ini`…), 0,8 (`superteam.ini`), 0 (gregari); `Shot Ratings Weight` 0,06, `Shot Net Open Weight` 0,40, `Shot Player Distance Weight` 0,25, `Shot Net Open Angle` 35, `Chip Shot Goalie Out Weight` 0,5, `Chip Shot Net Open Weight` 0,4 (`GameTweaks.ini`); `Shot Distance Min/Max` 20/7,5 (`FuzzyTweaks.ini`) | Assente | – | Calcolarlo come l'originale; l'attributo `tir` delle carte entra qui (pesa solo 0,06) |
| Il portiere deve sbagliare | `Goalie::CalcSaveParameters`: aggiunge `Miss Save Delay` al tempo e sceglie un'animazione di parata mancata (`mbPlayMiss`) | `Miss Save Delay` 0,1 s (`goalie.ini`) | – | – | Giocare la clip di parata mancata |
| Parata possibile | `GoalieSave::FindBestSave` / `FindBestInList`: porta divisa in 7×5 celle; per ogni animazione di parata della cella, tempo = (contatto − accovacciata) × durata, oppure (contatto − stacco) se il portiere è già in volo; senza milestone, 0,6 × contatto. Serve tempo ≤ tempo d'arrivo del pallone e distanza dal punto di parata < `mfCatchAllowDist` (solo per le prese). Se nessuna clip della cella va bene, cerca nelle celle vicine | `mariogoalie.trg` (`animation/data/strikers_triggers.json`): contatto `0xcf84e7cd` in 53 clip; accovacciata `0x56264bbe`, stacco `0x0f9524ba`, fine `0x045424b9` in 35. Accovacciata → contatto: 0,05–0,08 s per prese e deviazioni da fermo, 0,1–0,25 s per i salti, 0,15–0,32 s per i tuffi. Posizione della parata = osso `ball` al trigger di contatto (`GoalieSave::InitData`): ce l'abbiamo nelle 99 clip del portiere | `saveReact` 0,14 s + distanza / `diveSpeed` 9 m/s (stime), portata `diveReach` | Il modello a reazione+velocità è una stima. L'originale ha una tabella di parate, ciascuna col suo tempo e il suo punto | Costruire la tabella delle parate dalle nostre clip (posizione) e dai trigger (tempi); `saveReact` e `diveSpeed` spariscono |
| Tipi di parata | `GoalieSave.cpp` `gSaveInfo[70]`: prese da fermo (15), prese in tuffo (14), deviazioni (15), deviazioni in tuffo (12), gambe (2), pugni (3), Super Strike (4), pallonetti mancati (4) | – | 3 distanze × 3 altezze, presa o respinta | Mancano gambe, pugni, salti alti, pallonetti mancati | Usare tutte le voci di `gSaveInfo` |
| Presa o respinta | `F` `CalcRegularShot`: prese permesse (`0xFFFF`) solo se pallonetto, oppure energia ≥ `Fatigue Catch Threshold` e carica < `Catch Save Max Speed`; altrimenti solo deviazioni (`0xFFFC`) | `Fatigue Catch Threshold` **90** (riserva 60), `Catch Save Max Speed` 0,3, `Catch Save Tolerance` 0,6, `Intercept Save Tolerance` 0,5, `Lob Shot Stumble Chance` 0,3 (`goalie.ini`). Fatica: presa 5, presa in tuffo 10, deviazione 7, deviazione in tuffo 15, pugno 7, gamba 6, Super Strike 15/25; recupero 2/s | `power < 0.55` e `Math.random() < 0.65` | Probabilità inventata | Regola dell'originale |
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
| Tiro al volo | `ShotMeter::CalcOneTimerValue`: carica da direzione e distanza (0,25–0,8 × `Shot Meter Max Onetimer Speed`), 1 dopo un passaggio perfetto | `Shot Meter Max Onetimer Speed` 0,8 (`GameTweaks.ini`): carica = caso fino a 0,16 + da 0,25 a 0,64 secondo direzione e distanza (da 20 a 7,5 m) | Assente | – | Più avanti |

## 3. Super Strike

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Chi e dove | `F` `CanDoCaptainShootToScore`: opzione attiva e capitano. `ShotMeter::Update`: metà campo avversaria. `FA` `InitActionShootToScore`: vicino alla linea di porta (entro 2 m e davanti alla porta) diventa un tiro normale | – | Capitano, metà avversaria | Manca il caso vicino alla porta | Aggiungere |
| Carica | `ShotMeter::Update`, `GetTotalDuration`: `Shot Windup Seconds + STS Windup Time` | `STS Windup Time` 0,25 in tutti i file (sovrascritto per entrambe le squadre dal livello scelto, come la curva del tiro) → carica totale **0,91 s** | 1,6 s (stima) | +0,69 s | 0,91 s |
| Rilascio prima della fine | `F` (gestione dei tasti): rilasciando B durante la carica lunga parte un tiro normale a carica 1 | – | Tiro normale (già perfetto se nella finestra) | Quasi uguale | – |
| Lancetta | `FA` `ActionShootToScore`: valore = (t − salto) / (centro − salto) in salita, poi 1 − (t − centro)/(inizio NIS − centro) in discesa; t = tempo normalizzato della clip `captain_shoot_to_score` (127 fotogrammi); centro = metà tra `S2S 1st Jump Frame` e `S2S Nis Begin Frame` | `S2S 1st Jump Frame` 3, `S2S Nis Begin Frame` 26, `S2S Kick Frame` 27, `S2S Nis End Frame` 106: uguali in tutti i 13 `.ini` dei personaggi. Su 127 fotogrammi: salto a t = 0,024, centro a 0,114, inizio NIS a 0,205 (0,1 s, 0,48 s e 0,87 s di clip) | Due lancette di 0,9 s ciascuna (stima), clip ferma a mano tra 0,9 e 2,0 s | Durata e forma diverse | Lancetta dal tempo della clip, che gira a velocità normale sotto il rallentatore |
| Prima pressione | Conta solo se la lancetta è oltre `Perfect Second Button Time`. Se dista meno di `S2S Perfect Distance Min` da `Perfect First Button Time` diventa esattamente perfetta. Se non premi entro il centro, vale 1 | `S2S Perfect First Button Time` 0,84, `Second` 0,16, `Perfect Distance Min/Max` 0,02/0,06 (`GameTweaks.ini`: confermati) | Verde scuro ±0,05, verde chiaro ±0,13 (stima) | Regola diversa | Regola originale |
| Verde della seconda | Parte da `Perfect Distance Min`; se la prima era entro il giallo si allarga fino a `Perfect Distance Max` × moltiplicatore del personaggio (DK, Wario ×1,1; Waluigi, Yoshi ×0,92; Peach, Daisy ×0,84) | `S2S 2 Button Press Yellow Dist` 0,1 (`GameTweaks.ini`); giallo × 0,75 (DK, Wario), × 1,25 (Waluigi, Yoshi), × 1,5 (Peach, Daisy) | – | – | Regola originale (i nostri personaggi usano i valori di Mario) |
| Seconda pressione | Solo in discesa e con lancetta < 0,6 | – | – | – | Regola originale |
| Risultato | `F` `DoCalcShootToScoreResult`: prima perfetta e seconda nel verde → **SUPER** (imparabile); seconda nel verde → **GOL** (portiere manca); seconda nel giallo → **parata con stordimento**, ma con probabilità crescente verso il bordo diventa respinta (`CalcShootToScoreShot`, `0,95 × caso < valore`); fuori → **respinta** | – | 4 punti = imparabile, 3 = gol | Regola diversa | Regola originale |
| Gol | `Game.cpp`: gol del capitano col Super Strike (`m_uGoalType` 6) vale 2 | – | 2 | Uguale | – |
| Rallentatore | `FindSTSDistanceAffectedPercentage`: da `S2S Slow Mo Min` (a 9 m dalla porta) a `Max` (a 18 m); dopo l'inizio della NIS 0,1; torna 1 al calcio | `S2S Slow Mo Min/Max` 0,68/0,78 (`GameTweaks.ini`: confermati) | 0,72 fisso | Fisso | Formula originale |
| Velocità del tiro | `CalcShootToScoreShot`: tempo = distanza / (1,25 × velocità del tiro); respinta 1,2 volte più lenta. Bersaglio basso (0,18 + margine + caso fino a 0,5 m) | – | 30 m/s (stima) | Stima | Formula originale |
| Portiere | Respinta: 66% (× valore) di schiaffo se lontano più di 7 m, altrimenti parata; giallo: `S2S Save Stun` (stordimento `Min/Max STS Stun Time`); gol: parata mancata; super: `S2S Blast Net` o `S2S Spin` | `Min/Max STS Stun Time` 1/2 s (`goalie.ini`: confermati). Uscita sul capitano durante la carica: riga 16 del riepilogo | Simile | Mancano lo schiaffo, la scelta e l'uscita | Più avanti |
| CPU: quando | `FD` (carica): al passaggio alla carica lunga, `Captain ShootToScore Chance` della difficoltà, e solo se `Open ≥ 0,8` e vicinanza al portiere ≤ 0,65 | `Captain ShootToScore Chance`: Rookie 0,1, Professional 0,5, Superstar 0,9, Legend 1 (`Difficulty0…3.ini`) | 25–70% a caso (stima) | Stima | Valori del disco e condizioni originali |
| CPU: pressioni | `FD` `InitDesireShoot`, `DesireShoot`, `F` `S2SShootWasPressed`: con probabilità `Captain S2S Perfect First/Second Button Chance` preme esatto, altrimenti con errore uniforme ±0,3 | Prima = seconda: Rookie 0,2, Professional 0,33, Superstar 0,6, Legend 0,975 (`Difficulty0…3.ini`) | Errore gaussiano 0,16–0,035 (stima) | Stima | Valori del disco |
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
| Istanti di contatto | Codice: tiro fotogramma 1,825; passaggio 12% della clip; spallata fotogrammi 4–14; tiri al volo e ricezioni da tabelle (`gOneTimer…ContactAnims`, `GetReceivePassBallContactAnimInfo`); parate e il resto dai trigger `.trg` | `contact` stimato dal piede più veloce | Stime | Codice + trigger in `animation/data/strikers_triggers.json` |
| Trigger | `Triggers/AnimTagScript.cpp` (`SetupAnimationTriggers`), `CharacterTriggers.cpp`: file `art/animation/<personaggio>.trg`, tempo = fotogramma / fotogrammi della clip | Decodificati (`animation/triggers.py`): `mario.trg` 267 trigger su 72 clip (8 che non abbiamo), `mariogoalie.trg` 459 su 81. Esempi: `captain_shoot_to_score` fotogrammi 14, 16, 21, 24, 67–87, 104, 116; `pass_1200` 8,1 su 10; `windup_kick` 16 su 22. Solo gli eventi delle parate hanno un significato noto; gli altri sono effetti e suoni (`CharacterTriggerHandler`) | Non usati | Usarli per parate, uscita sul Super Strike ed effetti |

## 5. Contrasti

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Velocità della scivolata | `F` `GetSlideAttackSpeed`: `WB Run Turbo Level 2 Speed` (Mario 7,5), ×1,4 con fungo o stella | `mario.ini` | 9 m/s | +20% | 7,5 |
| Direzione | `FA` `InitActionSlideAttack`: verso il punto d'intercetto del bersaglio entro 0,7 s | – | Dove guardi | – | Intercetto |
| Durata | `ActionSlideAttack`: finché B è premuto, al massimo `Slide Attack Maximum Time`, poi frenata esponenziale `Slide Attack Deceleration` per `Slide Attack Fail Up Time` | 0,35 / 0,66 / 0,35 (riferimento) | 0,35 s fissi, poi `slide_tackle_up_fail` a 1,6× | Rilascio anticipato mancante, clip accelerata | Regola originale |
| Successo | L'osso `ball` di chi scivola tocca il pallone (raggio 0,05 + 0,18) → **prende la palla** (`PickupBall`); il portatore cade (`Ball.cpp`, `InitActionSlideAttackReact`) | – | Il pallone schizza via a 7 m/s | Diverso | Regola originale |
| Spallata | `FA` `InitActionHit`: velocità = spostamento della clip tra i fotogrammi 4 e 14 / 0,333 s, mirata sull'intercetto; clip a 1,5× con root motion | – | 7,5 m/s per 0,3 s, portata 1,2 × `SIZE` × 0,75 | Diverso | Regola originale |
| Chi subisce | `InitActionHitReact`: perde la palla (`ShootBallDueToContact`, velocità dell'attaccante); clip scelta tra 4 direzioni; resta giù per tutta la clip | – | Pallone a 5 m/s in direzione casuale; clip giusta; stordimento 1,9/1,7 s | Pallone | Regola originale |
| Raggio per decidere la scivolata (CPU) | `Do Slide Attack Radius` | 2,5 (`GameTweaks.ini`, riserva 2,15). Durata 0,35 + 0,35 s, decelerazione 0,66: confermati | 2,5 | – | – |

## 6. Passaggi

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Velocità | `Player.cpp` `DoCalculatePassSpeed`: da `Pass … Speed Min` a `Max` secondo la distanza tra `Pass Speed Min Dist` e `Max Dist`, **meno metà della velocità con cui il compagno si avvicina**; `DoClampPassSpeed` la tiene sempre tra i limiti del passaggio **a terra**, anche per quello alto | `mario.ini`; 1 e 10 m (riferimento) | Interpolazione sulla distanza, senza correzione né limite | Manca la correzione per il compagno che viene incontro | Formula originale |
| Passaggio a terra | `Player.cpp` (rilascio del passaggio): velocità dritta = distanza / tempo, verticale 0,5–2,0 m/s secondo la distanza | – | `shootAtFast` con verticale ≤ 1,2 | Diverso | Formula originale |
| Passaggio alto | `ShootAtFast` con tempo = distanza / velocità; verticale ≤ 14 m/s | – | Tempo × 1,6, arrivo a 0,9 m | Diverso | Formula originale |
| Anticipo | `SuggestPassTargetPosition` + `CalcInterceptXY` con la velocità di corsa del compagno; controllo corsetta/corsa | – | 0,8 × velocità × tempo | Stima | Formula originale |
| Rilascio | `FA` `ActionPass`: `TestTrigger(0.12)` (12% della clip) | – | `contact` stimato (0,05 s) | Vicino | 12% |
| Clip | `InitActionPass`: `pass_1200/300/600/900` secondo l'angolo col compagno | – | Sempre `pass_1200` | Mancano 3 direzioni | Aggiungere |
| Passaggio perfetto | `DoCalcCanDoPerfectPass` (vicino alla porta, compagno libero), rallentatore `Perfect Pass Slow Mo` | 0,17 (`GameTweaks.ini`, riserva 0,5) | Assente | – | Più avanti |

## 7. CPU e difficoltà

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Quale tabella | `GameInfo.cpp` `ApplyDifficultySettings`: lato con giocatori umani → `DifficultyHuman.ini`; lato CPU → `DifficultyBraindead` (allenamento), `Difficulty0` (Rookie), `Difficulty1` (Professional), `Difficulty2` (Superstar), `Difficulty3` (Legend). `SkillTweaks::Init` (la miscela tra due file del codice non viene mai chiamata). Poi `Game.cpp` `ApplyDifficulty` copia su **entrambe** le squadre Shot Value/Chance, STS Windup Time, Attack Carrier Range, Loose Ball Range e Goalie Intercept Pass del livello scelto. `DifficultySuperhuman.ini` non è raggiungibile dai menu | Tutti letti: tabella completa (72 valori × 7 file) in `STRIKERS_REFERENCE.md` §9 bis | Livelli 0–3 con tabelle stimate (`cpuTune`) | – | Usare le tabelle del disco |
| Valori | `GT` `SkillTweaks::SkillTweaks`: 45 valori più 27 di uso dei power-up (`Offensive/Defensive/Loose <power-up> Chance`). Un valore assente nel file vale 0,5 | Esempi, Rookie / Professional / Superstar / Legend: Shooting Chance 0,1 / 0,525 / 0,95 / 1; Deke Chance 0 / 0,36 / 0,72 / 1; Slide Attack Chance 0,02 / 0,15 / 0,5 / 1; Reaction 0 / 0,25 / 0,67 / 1 (Human e Braindead non lo hanno: 0,5); Marking 0,05 / 0,2 / 0,55 / 1; Goalie Deke Speed 1 / 1,1 / 1,2 / 1,3 | – | – | – |
| Velocità della CPU | Nessuna differenza: velocità dai `.ini` dei personaggi | – | ×0,9 / 1 / 1,05 / 1,08 | Inventato | Togliere |
| Decisioni | Script `AI/Scripts/Plays/DefaultOffensive.cpp`, `DefaultDefensive.cpp`, `CommonScript.cpp`, `Fuzzy.cpp`: ogni azione ha una probabilità `CalcSelectChance(valore della tabella, attributo del personaggio)`; reazione `0,3 × (1 − Reaction)` | – | Probabilità al secondo scelte a mano (tiro sotto 14,5 m, scivolata 1,6/s, finta 2,5%…) | Tutto stimato | Prima le probabilità e le reazioni della tabella, poi le condizioni degli script |

## 8. Altro (portiere e pallone)

| Cosa | Originale (fonte) | Valori `.ini` | Nostro gioco | Differenza | Correzione |
|---|---|---|---|---|---|
| Palla in mano | `Goalie Ball Time` | 2 s (riferimento) | Rilancia a 1,2 s | – | 2 s (o prima, se c'è un compagno libero: da verificare in `GoalieActions.cpp`) |
| Rinvio | `Goalie::DoPassRelease` | `Minimum/Maximum Kick Velocity`, angoli (riferimento) | Formula nostra con ×0,9 e ×0,6 | Da verificare | Formula originale |
| Pallone oltre 50 m/s | `PhysicsBall` taglia prima e dopo ogni passo | – | Fino a 69 m/s in una partita (problema noto) | – | Da correggere insieme al tiro |

---

## Dati letti dal disco (31 ottobre, sera)

Letti dall'ISO europea in una cartella temporanea; nel repository vanno solo i numeri, con la fonte.

| File (sul disco) | Cosa se ne è ricavato | Dove |
|---|---|---|
| `GameTweaks.ini` | tutti i valori `S2S …`, pesi della barra, `Shot Meter Max Onetimer Speed`, `Pass Speed Min/Max Dist`, `Slide Attack …`, `Do Slide Attack Radius`, `Perfect Pass Slow Mo` e ogni altro valore di `GameTweaks::Init`. Diversi da prima: `S2S 2 Button Press Yellow Dist` 0,1, `Perfect Pass Slow Mo` 0,17 | `STRIKERS_REFERENCE.md` §5, §9 bis |
| `Difficulty*.ini` (7 file) | tutta la tabella della difficoltà | `STRIKERS_REFERENCE.md` §9 bis |
| `mario.ini` e gli altri 12 personaggi | fotogrammi S2S 3/26/27/106, Shooting, Passing, Dekeing, Aggression, velocità di tiro e pallonetto, turbo con palla. `Shot Windup …` non sta nei `.ini`: è in `g_pTweaks` (75000, 4000, 6) | `STRIKERS_REFERENCE.md` §4, §9 bis |
| `goalie.ini` | tutti i valori di `GoalieTweaks::Init`. Diversi da prima: `Fatigue Catch Threshold` 90, `STS Attack Max Distance` 2 | `STRIKERS_REFERENCE.md` §6, §9 bis |
| `art/animation/mario.trg`, `mariogoalie.trg` | trigger di ogni clip, eventi delle parate | `animation/data/strikers_triggers.json` |
| `main.dol` | SHA-1 `6dc83dc9…`; `g_pTweaks` e la costante 1,825 del tiro trovati identici | – |

**Mancano** (né nel codice né nel disco): il significato degli eventi dei trigger che non sono parate (sono hash di nomi di effetti e suoni non presenti come testo); la curva del tiro dei gregari, che hanno `Shot Min/Max Speed` 0 nel `.ini` (da cercare nel codice).
