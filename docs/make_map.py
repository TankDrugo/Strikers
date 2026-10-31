"""Builds docs/mappa.html, the navigable map of the project, from graphify-out/graph.json.

  python3 docs/make_map.py [--repo https://github.com/OWNER/REPO] [--artifact PATH]

--artifact also writes the page body alone (no <html>/<head>), the form claude.ai Artifacts publish.

The map groups graph nodes into areas by folder (AREAS below), draws the areas like players on a
tactics board with lines for the links between them, and lets you open an area, a file, a node and
its neighbours. File links point to the GitHub repository. The page is self-contained.
"""

import datetime
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
GRAPH = os.path.join(ROOT, "graphify-out", "graph.json")
OUT = os.path.join(HERE, "mappa.html")
TEMPLATE = os.path.join(HERE, "map_template.html")
DEFAULT_REPO = "https://github.com/TankDrugo/Strikers"

# key, name, folder prefixes, readme, position on the board (x, y in 0..1).
# Status, description, done and next come from the "## Stato" section of each README (read_status), so the map
# and the README table follow the READMEs by themselves: update the README, not this file.
AREAS = [
    ("riferimento", "Riferimento", ["reference/"], "reference/README.md", (0.10, 0.50)),
    ("animazioni", "Animazioni", ["animation/"], "animation/README.md", (0.32, 0.22)),
    ("personaggi", "Personaggi", ["characters/", "game/assets/"], "characters/README.md", (0.32, 0.78)),
    ("gioco", "Gioco", ["game/"], "game/README.md", (0.55, 0.50)),
    ("interfaccia", "Interfaccia gioco", ["interfaccia-gioco/", "game/src/ui/", "game/src/cups/"], "interfaccia-gioco/README.md", (0.80, 0.22)),
    ("ultimate", "Ultimate Team", ["ultimate-team/"], "ultimate-team/README.md", (0.80, 0.78)),
    ("progetto", "Progetto", ["README.md", "CLAUDE.md", "docs/"], "README.md", (0.55, 0.10)),
]

MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"]


def read_status(readme):
    """'## Stato' of a README: '**status** · description', then 'Fatto:' and 'Prossimo:' bullet lists."""
    try:
        text = open(os.path.join(ROOT, readme), encoding="utf-8").read()
    except OSError:
        return {"status": "", "desc": "", "done": [], "next": []}
    m = re.search(r"^## Stato\n(.*?)(?=^## |\Z)", text, re.S | re.M)
    body = m.group(1) if m else ""
    out = {"status": "", "desc": "", "done": [], "next": []}
    lst = None
    for line in body.splitlines():
        t = line.strip()
        if t.startswith("Fatto:"):
            lst = out["done"]
        elif t.startswith("Prossimo:"):
            lst = out["next"]
        elif t.startswith("- ") and lst is not None:
            lst.append(re.sub(r"[`*]", "", t[2:]))
        elif t and lst is None and not out["desc"]:
            sm = re.match(r"\*\*(.+?)\*\*\s*·\s*(.*)", t)
            out["status"], out["desc"] = (sm.group(1), sm.group(2)) if sm else ("", t)
    return out


def last_update():
    """Date of the last commit, in Italian (today if git is not available)."""
    try:
        d = subprocess.run(["git", "-C", ROOT, "log", "-1", "--format=%cs"], capture_output=True, text=True, check=True).stdout.strip()
        y, mo, da = (int(x) for x in d.split("-"))
    except (OSError, subprocess.CalledProcessError, ValueError):
        t = datetime.date.today(); y, mo, da = t.year, t.month, t.day
    return f"{da} {MONTHS[mo - 1]} {y}"


def write_readme_table(areas):
    """Area table of the root README, between the aree:inizio / aree:fine markers."""
    path = os.path.join(ROOT, "README.md")
    text = open(path, encoding="utf-8").read()
    rows = ["| Area | Cartella | Stato |", "|---|---|---|"]
    for a in areas:
        if a["key"] == "progetto":
            continue
        folder = a["readme"].rsplit("/", 1)[0] + "/"
        rows.append(f"| **{a['name']}** ({a['desc'].rstrip('.')}) | [`{folder}`]({a['readme']}) | {a['status']} |")
    new = re.sub(r"(<!-- aree:inizio[^>]*-->\n).*?(<!-- aree:fine -->)", lambda m: m.group(1) + "\n".join(rows) + "\n" + m.group(2), text, flags=re.S)
    if new != text:
        open(path, "w", encoding="utf-8").write(new)


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
    areas = [{"key": k, "name": name, "readme": readme, "x": pos[0], "y": pos[1], **read_status(readme)}
             for k, name, _, readme, pos in AREAS]
    write_readme_table(areas)
    data = {"repo": repo, "updated": last_update(), "areas": areas, "nodes": nodes, "edges": edges,
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
