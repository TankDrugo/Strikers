# Grafo e mappa del progetto

Il progetto ha un grafo della conoscenza costruito con [graphify](https://pypi.org/project/graphifyy/): ogni file, funzione, classe e concetto dei documenti è un nodo, e gli archi dicono chi usa, chiama o spiega chi.

| File | A cosa serve |
|---|---|
| `docs/mappa.html` | **La mappa da guardare.** Le sei aree del progetto (Gioco, Animazioni, Personaggi, Riferimento, Ultimate Team, Interfaccia gioco); cliccando un'area si vedono i suoi nodi, cliccando un nodo i suoi collegamenti, anche verso le altre aree. Si apre con un doppio clic |
| `graphify-out/graph.html` | Il grafo completo, interattivo, colorato per comunità |
| `graphify-out/GRAPH_REPORT.md` | Sintesi: nodi più collegati, comunità, collegamenti sorprendenti |
| `graphify-out/graph.json` | I dati del grafo, per `graphify query`, `path`, `explain` |

## Interrogare il grafo

```bash
pip install graphifyy
```
```bash
graphify query "come arriva un personaggio in campo"
```
```bash
graphify path "add_characters.py" "Player" --undirected
```
```bash
graphify explain "Game"
```

In una chat di Claude Code nel progetto basta chiedere: le regole in `CLAUDE.md` fanno usare il grafo prima di leggere i file.

## Aggiornare dopo una modifica

Solo codice (veloce, senza modelli linguistici):

```bash
graphify update .
```
```bash
python3 docs/make_map.py
```

Se cambiano README o documenti, in Claude Code esegui `/graphify . --update`: rilegge i documenti cambiati e aggiorna i concetti. Poi rigenera la mappa con `python3 docs/make_map.py`.

## Aree della mappa

Le aree corrispondono alle cartelle. Quando nasce una cartella nuova (per esempio `ultimate-team/src/`), i suoi nodi finiscono nell'area giusta da soli. Per aggiungere un'area nuova, aggiungi una riga ad `AREAS` in `docs/make_map.py`.
