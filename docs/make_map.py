"""Builds docs/mappa.html, the navigable map of the project, from graphify-out/graph.json.

  python3 docs/make_map.py [--repo https://github.com/OWNER/REPO] [--artifact PATH]

--artifact also writes the page body alone (no <html>/<head>), the form claude.ai Artifacts publish.

The map groups graph nodes into areas by folder (AREAS below), draws the areas like players on a
tactics board with lines for the links between them, and lets you open an area, a file, a node and
its neighbours. File links point to the GitHub repository. The page is self-contained.
"""

import json
import os
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
GRAPH = os.path.join(ROOT, "graphify-out", "graph.json")
OUT = os.path.join(HERE, "mappa.html")
TEMPLATE = os.path.join(HERE, "map_template.html")
DEFAULT_REPO = "https://github.com/TankDrugo/Strikers"

# key, name, folder prefixes, readme, status, one-line description, position on the board (x, y in 0..1)
AREAS = [
    ("riferimento", "Riferimento", ["reference/"], "reference/README.md", "completo",
     "Misure e dinamiche del gioco originale, con le fonti. La base di tutte le costanti.", (0.10, 0.50)),
    ("animazioni", "Animazioni", ["animation/"], "animation/README.md", "funziona",
     "Clip originali decodificate, retarget sugli scheletri Mixamo, controlli automatici.", (0.32, 0.22)),
    ("personaggi", "Personaggi", ["characters/", "game/assets/"], "characters/README.md", "5 su 10",
     "Modelli dei giocatori, roster e formazioni delle due squadre.", (0.32, 0.78)),
    ("gioco", "Gioco", ["game/"], "game/README.md", "funziona",
     "Partita 5 contro 5: campo, stadio, pallone, giocatori, IA, comandi.", (0.55, 0.50)),
    ("interfaccia", "Interfaccia gioco", ["interfaccia-gioco/"], "interfaccia-gioco/README.md", "da iniziare",
     "Menu, HUD, schermate prima e dopo la partita.", (0.80, 0.22)),
    ("ultimate", "Ultimate Team", ["ultimate-team/"], "ultimate-team/README.md", "da iniziare",
     "Collezione di personaggi, carte e squadre.", (0.80, 0.78)),
    ("progetto", "Progetto", ["README.md", "CLAUDE.md", "docs/"], "README.md", "",
     "Istruzioni per Claude, mappa e grafo.", (0.55, 0.10)),
]


def area_of(path):
    if not path:
        return None
    best = None
    for key, _, prefixes, *_ in AREAS:
        for p in prefixes:
            if path == p or path.startswith(p):
                if best is None or len(p) > best[1]:
                    best = (key, len(p))
    return best[0] if best else None


def kind_of(n):
    ft = n.get("file_type")
    if ft == "code":
        return "codice"
    if ft == "rationale":
        return "nota"
    if ft == "document":
        return "documento"
    return "concetto"


def main():
    repo = DEFAULT_REPO
    if "--repo" in sys.argv:
        repo = sys.argv[sys.argv.index("--repo") + 1].rstrip("/")
    g = json.load(open(GRAPH))
    links = g.get("links") or g.get("edges") or []
    nodes, index = [], {}
    for n in g["nodes"]:
        src = n.get("source_file") or ""
        area = area_of(src)
        if not area:
            continue  # external modules (three, numpy…) are not part of the map
        loc = n.get("source_location") or ""
        index[n["id"]] = len(nodes)
        nodes.append([n["id"], n.get("label") or n["id"], src, loc, kind_of(n), area, n.get("community_name") or ""])
    edges = []
    for e in links:
        s, t = index.get(e["source"]), index.get(e["target"])
        if s is None or t is None or s == t:
            continue
        edges.append([s, t, e.get("relation", ""), e.get("confidence", "")])
    cross = Counter()
    for s, t, *_ in edges:
        a, b = nodes[s][5], nodes[t][5]
        if a != b:
            cross[tuple(sorted((a, b)))] += 1
    areas = [{"key": k, "name": name, "readme": readme, "status": status, "desc": desc, "x": pos[0], "y": pos[1]}
             for k, name, _, readme, status, desc, pos in AREAS]
    data = {"repo": repo, "areas": areas, "nodes": nodes, "edges": edges,
            "cross": [[a, b, c] for (a, b), c in sorted(cross.items())]}
    body = open(TEMPLATE, encoding="utf-8").read().replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write('<!doctype html>\n<html lang="it"><head><meta charset="utf-8">'
                 '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head>\n<body>\n')
        fh.write(body)
        fh.write("\n</body></html>\n")
    if "--artifact" in sys.argv:
        with open(sys.argv[sys.argv.index("--artifact") + 1], "w", encoding="utf-8") as fh:
            fh.write(body)
    per_area = Counter(n[5] for n in nodes)
    print("wrote %s: %d nodes, %d links; %s" % (OUT, len(nodes), len(edges), ", ".join("%s %d" % kv for kv in per_area.items())))


if __name__ == "__main__":
    main()
