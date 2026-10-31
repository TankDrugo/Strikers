# Personaggi

Qui stanno i modelli originali dei personaggi, così come escono dal programma 3D: un file `.glb` per personaggio, riggato con lo scheletro **Mixamo** (ossa `mixamorig:Hips`, `mixamorig:Spine`…), in metri, rivolto verso +Z.

## Stato

**completo** · Modelli dei giocatori, roster e formazioni delle due squadre.

Fatto:
- Celestini e Rivali in gioco: 10 personaggi, 5 ruoli per squadra
- 5 personaggi nuovi con la loro nazionale (Big Smoke, Crilin, Dastardly, Goku, Goku SSJ): in Gioco rapido (squadre Leggende e Nazionali, o formazione libera), Coppe, Ultimate Team e visualizzatore
- Altri 5 (Jak, Kairi, Piccolo, Ratchet, Riku), squadra pronta Avventurieri con Piccolo in porta
- Ultimi 5 (Roxas, Snake, Sora, Spike, Vegeta), squadra pronta Campioni con Vegeta capitano: 25 personaggi in tutto, lavoro sui personaggi finito (31 ottobre)
- Roster con i ruoli per posto in campo
- Colori delle squadre su anelli, punteggio, tabellone e tifosi

Prossimo:
- Animazioni delle mosse speciali (ulti) per personaggio, dopo le regole del gioco (ordine dei lavori in `CLAUDE.md`)
- Eventuali altri personaggi dell'utente: procedura sotto; il link online va pubblicato in più passi da 10 personaggi

| File | Squadra | Ruolo (posto in `teams`) | Stato |
|---|---|---|---|
| `celestini_difensore.glb` | Celestini | difensore (0) | in gioco |
| `celestini_centrocampista.glb` | Celestini | centrocampista (1) | in gioco |
| `celestini_ala.glb` | Celestini | ala (2) | in gioco |
| `celestini_attaccante.glb` | Celestini | attaccante (3) | in gioco |
| `celestini_portiere.glb` | Celestini | portiere (4) | in gioco |
| `rivali_difensore.glb` | Rivali | difensore (0) | in gioco |
| `rivali_centrocampista.glb` | Rivali | centrocampista (1) | in gioco |
| `rivali_ala.glb` | Rivali | ala (2) | in gioco |
| `rivali_attaccante.glb` | Rivali | attaccante (3) | in gioco |
| `rivali_portiere.glb` | Rivali | portiere (4) | in gioco |
| `bigsmoke_belgio.glb` | Belgio | difensore (`DIF`, carta 76) | in gioco |
| `crilin_giappone.glb` | Giappone | centrocampista (`CEN`, carta 78) | in gioco |
| `dastardly_croazia.glb` | Croazia | ala (`ALA`, carta 74) | in gioco |
| `goku_spagna.glb` | Spagna | attaccante (`ATT`, carta 84) | in gioco |
| `goku_ssj_germania.glb` | Germania | attaccante (`ATT`, carta 90, numerate e 1/1) | in gioco |
| `jak_paesibassi.glb` | Paesi Bassi | ala (`ALA`, carta 80) | in gioco |
| `kairi_colombia.glb` | Colombia | centrocampista (`CEN`, carta 74) | in gioco |
| `piccolo_norvegia.glb` | Norvegia | portiere (`POR`, carta 81) | in gioco |
| `ratchet_inghilterra.glb` | Inghilterra | attaccante (`ATT`, carta 81) | in gioco |
| `riku_uruguay.glb` | Uruguay | difensore (`DIF`, carta 77) | in gioco |
| `roxas_senegal.glb` | Senegal | ala (`ALA`, carta 79) | in gioco |
| `snake_usa.glb` | Stati Uniti | difensore (`DIF`, carta 80) | in gioco |
| `sora_argentina.glb` | Argentina | attaccante (`ATT`, carta 83) | in gioco |
| `spike_brasile.glb` | Brasile | centrocampista (`CEN`, carta 79) | in gioco |
| `vegeta_italia.glb` | Italia | attaccante (`ATT`, carta 88, numerate e 1/1) | in gioco |

Celestini in maglia celeste, Rivali in maglia verde. Il primo personaggio usato nel prototipo (`portiere.glb`) è stato tolto: resta nella storia del repository.

Tutti i modelli sono Mixamo. Nome dei file: `<squadra>_<ruolo>.glb` per le due squadre, `<personaggio>_<nazionale>.glb` per i personaggi singoli. I personaggi singoli non hanno un posto in `teams`: stanno nelle squadre pronte di `squads` in `roster.json` (Leggende, Nazionali, Avventurieri, Campioni), nelle squadre CPU delle Coppe (che rimescolano tutto il roster; i portieri sono quelli del posto 4 di `teams` e `squads`, quindi un nuovo portiere va messo in porta in una squadra pronta), in Ultimate Team, e con l'editor della formazione ognuno può andare in qualsiasi posto. In Ultimate Team la nazionale si vede nel walkout del pacchetto: è il campo `team` della carta in `cards.json` (senza, vale la parte dell'id prima del primo `_`).

I posti di `teams` in `game/assets/roster.json` corrispondono alle posizioni in campo: 0 difensore e 1 centrocampista stanno indietro, 2 ala e 3 attaccante avanti, 4 è il portiere.

## Aggiungere un personaggio

1. Copia il `.glb` in questa cartella. Il nome del file diventa l'id del personaggio: usa minuscole senza spazi, per esempio `attaccante_rosso.glb`.
2. Fai il retarget delle 183 animazioni:

   ```bash
   python3 animation/add_characters.py --audit
   ```

   Scrive `game/assets/characters/<id>.glb` e `<id>.clips.json` e aggiunge il personaggio a `game/assets/roster.json`. Se il modello non ha uno scheletro Mixamo completo, lo salta e dice quali ossa mancano.
3. Mettilo in squadra: in `game/assets/roster.json`, sotto `teams` (le due squadre base) o `squads` (squadre pronte con nome, colore e capitano), ogni squadra ha 5 posti. I posti 0–3 sono i giocatori di movimento, il posto 4 è il portiere.

   ```json
   "teams": [
     ["attaccante_rosso", "centrocampista", "difensore_a", "difensore_b", "portiere"],
     ["...", "...", "...", "...", "..."]
   ]
   ```

4. Mettilo in Ultimate Team (senza questi due passi il personaggio gioca ma non ha carte):
   - in `ultimate-team/data/cards.json`, sotto `characters`, aggiungi `"<id>": {"role": "ATT", "stats": {"vel": 80, "tir": 82, "pas": 74, "con": 60}}` (ruoli `DIF`, `CEN`, `ALA`, `ATT`, `POR`; il portiere ha `par`, `rif`, `usc`, `vel`). La valutazione si calcola dalle statistiche: sotto 65 bronzo, 65-74 argento, da 75 oro con holo, da 85 anche numerate e 1/1;
   - se la squadra o nazionale non è la parte dell'id prima del primo `_` (per esempio `goku_spagna`), aggiungi `"team": "spagna"`;
   - in `game/src/ui/i18n_ut.js` aggiungi il nome della carta, `'ut.char.<id>'`, in italiano e in inglese (e `'ut.team.<squadra>'` se la squadra è nuova).
5. Ricompila e prova: `node game/tools/build.mjs`, poi `node game/tools/playtest.cjs` e `node game/tools/uttest.cjs`.
6. Guarda le animazioni del nuovo personaggio nel visualizzatore del gioco (Impostazioni → Visualizzatore animazioni, scegli il personaggio in alto). Per confrontarle fotogramma per fotogramma con lo scheletro originale, servi la cartella principale del progetto (`python3 -m http.server 8000`) e apri `http://localhost:8000/game/dev/sheet.html?char=<id>&clips=idle,run_with_ball,gk_dive_catch_far_right_high`.

`add_characters.py` fa il retarget anche delle 3 clip del walkout di Ultimate Team (corsa ed esultanze, da `animation/data/strikers_nis.npz`): non serve altro.

## Note

- `recolor` in `roster.json` ricolora di rosso le parti gialle della maglia per la seconda squadra. Era servito per il primo personaggio; oggi è `false` per tutti, perché ogni squadra ha i suoi modelli.
- Nomi e colori delle squadre stanno in `teamInfo` di `roster.json`: `color` colora anelli sotto i piedi, punteggio, scritta GOL!, tabellone e tifosi; `shirt` è il colore della maglia preso dalle texture. Per i Rivali `color` è un verde più chiaro della maglia (`#1b5a3c`), che sull'erba non si vedrebbe.
- Il controllo automatico dei Rivali dà gli stessi risultati dei Celestini. Il centrocampista dei Rivali ha 2 clip in più segnalate come "leggermente sollevate" (`idle_onetimer_air_600`, `banana_peel_react_600`): dipende dai capelli voluminosi, che alzano la cima della testa; a occhio le pose sono corrette.
- Spike ha qualche clip in più segnalata come sollevata dal controllo automatico (19 contro 14-16 degli altri): sono i capelli alti a punta, come per il centrocampista dei Rivali; a occhio le pose sono giuste.
- Altezza in campo: tutti i giocatori di movimento sono alti uguali (`FIELDER.height` in `game/src/config.js`), il portiere un po' di più. Il modello viene scalato, le proporzioni restano le sue.
- I modelli in questa cartella possono essere pesanti (texture a piena risoluzione). Il gioco usa le copie in `game/assets/characters/`, con le texture ridotte.
