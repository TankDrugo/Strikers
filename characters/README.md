# Personaggi

Qui stanno i modelli originali dei personaggi, così come escono dal programma 3D: un file `.glb` per personaggio, riggato con lo scheletro **Mixamo** (ossa `mixamorig:Hips`, `mixamorig:Spine`…), in metri, rivolto verso +Z.

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

Celestini in maglia celeste, Rivali in maglia verde. Il primo personaggio usato nel prototipo (`portiere.glb`) è stato tolto: resta nella storia del repository.

Tutti i modelli sono Mixamo, circa 30.000 triangoli. Nome dei file: `<squadra>_<ruolo>.glb`.

I posti di `teams` in `game/assets/roster.json` corrispondono alle posizioni in campo: 0 difensore e 1 centrocampista stanno indietro, 2 ala e 3 attaccante avanti, 4 è il portiere.

## Aggiungere un personaggio

1. Copia il `.glb` in questa cartella. Il nome del file diventa l'id del personaggio: usa minuscole senza spazi, per esempio `attaccante_rosso.glb`.
2. Fai il retarget delle 183 animazioni:

   ```bash
   python3 animation/add_characters.py --audit
   ```

   Scrive `game/assets/characters/<id>.glb` e `<id>.clips.json` e aggiunge il personaggio a `game/assets/roster.json`. Se il modello non ha uno scheletro Mixamo completo, lo salta e dice quali ossa mancano.
3. Mettilo in squadra: in `game/assets/roster.json`, sotto `teams`, ogni squadra ha 5 posti. I posti 0–3 sono i giocatori di movimento, il posto 4 è il portiere.

   ```json
   "teams": [
     ["attaccante_rosso", "centrocampista", "difensore_a", "difensore_b", "portiere"],
     ["...", "...", "...", "...", "..."]
   ]
   ```

4. Ricompila e prova: `node game/tools/build.mjs`, poi `node game/tools/playtest.cjs`.
5. Guarda le animazioni del nuovo personaggio nel visualizzatore del gioco (menu → Visualizzatore animazioni, scegli il personaggio in alto). Per confrontarle fotogramma per fotogramma con lo scheletro originale, servi `game/` (`python3 -m http.server 8000`) e apri `http://localhost:8000/dev/sheet.html?char=<id>&clips=idle,run_with_ball,gk_dive_catch_far_right_high`.

## Note

- `recolor` in `roster.json` ricolora di rosso le parti gialle della maglia per la seconda squadra. Era servito per il primo personaggio; oggi è `false` per tutti, perché ogni squadra ha i suoi modelli.
- Gli anelli sotto i piedi e i colori del punteggio sono ancora giallo (squadra 1) e rosso (squadra 2), non i colori delle maglie: lavoro per l'interfaccia.
- Il controllo automatico dei Rivali dà gli stessi risultati dei Celestini. Il centrocampista dei Rivali ha 2 clip in più segnalate come "leggermente sollevate" (`idle_onetimer_air_600`, `banana_peel_react_600`): dipende dai capelli voluminosi, che alzano la cima della testa; a occhio le pose sono corrette.
- Altezza in campo: tutti i giocatori di movimento sono alti uguali (`FIELDER.height` in `game/src/config.js`), il portiere un po' di più. Il modello viene scalato, le proporzioni restano le sue.
- I modelli in questa cartella possono essere pesanti (texture a piena risoluzione). Il gioco usa le copie in `game/assets/characters/`, con le texture ridotte.
