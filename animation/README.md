# Animazioni

Tutto quello che porta le animazioni del gioco originale sui personaggi del nostro gioco.

## Stato

**funziona** · Clip originali decodificate, retarget sugli scheletri Mixamo, controlli automatici.

Fatto:
- 183 clip originali decodificate (84 giocatore, 99 portiere)
- Retarget su qualsiasi scheletro Mixamo, senza bisogno del disco
- Tutte le clip controllate su tutti i 10 personaggi

Prossimo:
- Comprimere le animazioni per alleggerire il gioco
- Esultanze del walkout dai file art/nis/ del disco

| File | Cosa fa |
|---|---|
| `data/strikers_source.npz` | Le 183 clip originali già decodificate (84 di Mario, 99 del portiere): per ogni fotogramma, rotazione e posizione di ogni osso, più durata, velocità, root motion, stati di gioco e istante del contatto col pallone. Sostituisce i file del disco |
| `add_characters.py` | **Da usare per i personaggi nuovi.** Prende ogni `.glb` in `characters/`, fa il retarget e lo registra in `game/assets/roster.json` |
| `retarget.py` | Il retarget: adatta le clip originali (scheletro Biped) a uno scheletro Mixamo. Con `--export` ricrea il `.npz` dal disco |
| `audit.py` | Controllo automatico di ogni clip, fotogramma per fotogramma: piedi nel terreno, personaggio sospeso, scatti delle articolazioni, direzione delle ossa, ginocchia |
| `strikers_anim.py` | Decodifica dei formati originali (`.sanim`, `.shier`, `.bin`) e convertitore per Blender (sotto) |
| `tests/` | Prove del convertitore su file sintetici |

## Retarget su un personaggio

```bash
python3 animation/add_characters.py --audit
```

Il metodo:

1. **Calibrazione** sulla posa di riposo originale (`idle`): ogni osso Mixamo viene ruotato per puntare come l'osso Biped corrispondente. Bacino e colonna si allineano segmento per segmento.
2. **Ogni fotogramma:** l'osso Mixamo riceve la rotazione dell'osso originale rispetto alla posa di riposo. Bacino e colonna ruotano poi insieme, in modo che la linea bacino-collo coincida con l'originale.
3. **Altezza:** gli spostamenti del bacino sono scalati sul rapporto tra le altezze della testa. Il punto più basso del corpo resta dove sta nell'originale (rispetto alla posa di riposo) e mai sotto 3 cm dal terreno.
4. Il root motion non è dentro l'animazione: sta nei metadati (`*.clips.json`) e lo applica il gioco.

Valori di `audit.py` per `portiere` (soglie nel file):

- `ground_float` sopra 8 cm in 13 clip, voluto: nell'originale il personaggio affonda nel terreno (scossa elettrica, schiacciamento) oppure la testa del nostro modello è più alta;
- `dir` fino a 12° sull'osso `Spine1` in 143 clip: è il prezzo della correzione del busto al punto 2;
- nessuna articolazione che scatta, nessun ginocchio al contrario.

Tutte le 183 clip sono state controllate anche a occhio, con `game/dev/sheet.html` (fotogrammi del modello affiancati allo scheletro originale).

## Rifare il pacchetto dal disco

Serve solo se cambia la decodifica. I file del disco non vanno mai nel repository.

```bash
python3 animation/retarget.py --export CARTELLA_FILE_DISCO animation/data/strikers_source.npz
```

La cartella deve contenere `main.dol`, `Mario.sanim`, `Mario.shier`, `Mario.bin`, `MarioGoalie.sanim`, `MarioGoalie.shier`.

## Convertitore per Blender (`strikers_anim.py`)

Converte le animazioni di **Super Mario Strikers** (GameCube) per Blender. Legge tre file del disco:

| File sul disco | Contenuto |
|---|---|
| `art/animation/<personaggio>.shier` | Lo scheletro: ossa, gerarchia, posizioni di riposo, tabella di specchiatura |
| `art/animation/<personaggio>.sanim` | Tutte le clip del personaggio (corsa, tiri, finte, esultanze…) |
| `art/characters/<personaggio>/animretarget/<personaggio>.bin` | Facoltativo: adatta le clip fatte per un altro scheletro |

I personaggi sono `mario`, `luigi`, `peach`, `daisy`, `yoshi`, `wario`, `waluigi`, `donkeykong`, `birdo`, `toad`, `koopa`, `hammerbro`, `superteam` e `mariogoalie` (i portieri Kritter).

Il formato è ricostruito dal codice di [smstrikers-decomp](https://github.com/yannicksuter/smstrikers-decomp) (commit `d1f357f`). I riferimenti esatti sono all'inizio di `strikers_anim.py`.

### Uso in Blender (4.2 o più recente)

Da terminale, crea un file `.blend` con l'armatura e una Action per ogni clip:

```bash
blender --background --python strikers_anim.py -- art/animation/mario.sanim --names-from sys/main.dol --save mario_anim.blend
```

Oppure come add-on: in Blender *Edit → Preferences → Add-ons → Install from Disk*, scegli `strikers_anim.py`, poi *File → Import → Mario Strikers (.sanim)*.

Cosa ottieni:

- un'armatura con lo stesso nome dello scheletro, con le ossa Biped (`Bip01 Pelvis`, `Bip01 L Foot`…) e l'osso `ball` per il pallone;
- un osso `root_motion` in cima: porta lo spostamento e la rotazione del personaggio nel campo (disattivabile con `--no-root-motion`);
- una Action per clip a 30 fps, con interpolazione lineare come nel gioco. Ogni Action ha le proprietà personalizzate `strikers_states` (gli stati di gioco che la usano, es. `ANIM_RUN, ANIM_RUN_WB`), `strikers_play_mode` (ciclica o una volta), `strikers_ball_rotation` e `strikers_linear_speed`;
- con `--mirrored`, anche la copia specchiata di ogni clip (`_mirror`), calcolata come fa il gioco per le direzioni 0900 (sinistra).

Per passare da una clip all'altra: *Dope Sheet → Action Editor* e scegli l'Action dal menu.

### Uso da terminale, senza Blender

```bash
python3 strikers_anim.py info art/animation/mario.sanim --names-from sys/main.dol
python3 strikers_anim.py bvh  art/animation/mario.sanim -o mario_bvh --names-from sys/main.dol
python3 strikers_anim.py json art/animation/mario.sanim -o mario.json
```

- `info` stampa lo scheletro e l'elenco delle clip, con durata e stati di gioco.
- `bvh` scrive un file `.bvh` per clip, apribile in Blender (*File → Import → Motion Capture*, con *Up* = Z e *Forward* = Y) e in quasi tutti i programmi 3D. Il BVH non porta la scala delle ossa.
- `json` scrive tutto quello che è stato decodificato, fotogramma per fotogramma.

Opzioni comuni:

| Opzione | Effetto |
|---|---|
| `--names-from PERCORSO` | Recupera i nomi delle ossa da un file o da una cartella (vedi sotto). Ripetibile |
| `--retarget FILE.bin` | Usa la tabella di retargeting del personaggio |
| `--only REGEX` | Solo le clip il cui nome o stato corrisponde, es. `--only "shoot|deke"` |
| `--skeleton NOME` | Sceglie lo scheletro se il `.shier` ne contiene più di uno |

### Nomi delle ossa

Nei file le ossa non hanno un nome, solo un hash a 32 bit del nome (`nlStringLowerHash`). Lo script conosce già i nomi standard di 3ds Max Character Studio. Per le ossa extra (cappelli, code, gusci…) prova tutte le stringhe trovate nei file indicati con `--names-from`: conviene passare `sys/main.dol` o direttamente la cartella del disco estratto. Le ossa rimaste senza nome compaiono come `node_1234abcd`.

### Limiti noti

- **Verificato sui file del disco europeo (G4QP01).** Si aprono tutti i 47 `.sanim` (tranne `FrontEnd`, che non ha scheletro, e `Goalie`, in un formato più vecchio e non usato). Per le 84 clip di Mario la posa in Blender coincide con quella calcolata come nel gioco entro 0,000002 m. Le prove in `tests/` usano invece file sintetici.
- La posa di riposo dell'armatura usa le traslazioni dello scheletro con rotazioni nulle, perché la vera posa di legame sta nei modelli `.glg`, che non vengono letti. Le animazioni sono comunque esatte: ogni fotogramma riproduce la posa calcolata dal gioco.
- Fotogrammi chiave: il gioco distribuisce N chiavi su una durata di N/30 s. Qui stanno ai fotogrammi interi 1…N a 30 fps, quindi la clip dura 1/30 s in meno.
- Non vengono esportati i canali morph del viso (servirebbe il modello) né i trigger `.trg` (suoni ed effetti).

### Prove

```bash
python3 tests/test_converter.py
```

Senza Blender verifica la decodifica e i BVH. Con un Python che ha il modulo `bpy` (`pip install bpy`) importa anche in Blender e confronta ogni osso, a ogni fotogramma, con la posa calcolata come in `cPoseAccumulator::BuildNodeMatrices`. Poi reimporta i BVH con l'importer di Blender e confronta di nuovo.
