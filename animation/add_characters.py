"""Makes every character in characters/ (repo root) playable: retargets the 183 Strikers clips onto
it and registers it in game/assets/roster.json.

  python3 animation/add_characters.py            # new or changed models only
  python3 animation/add_characters.py --all      # redo every character
  python3 animation/add_characters.py --audit    # also print the clip audit for each one

Input: characters/<id>.glb, a Mixamo-rigged character (bone names "mixamorig:Hips", ...).
Output: game/assets/characters/<id>.glb (model + animations, textures shrunk) and <id>.clips.json.
The animation source is animation/data/strikers_source.npz, so no disc files are needed.
New characters are added to the roster but not put in a team: edit "teams" in roster.json.
"""

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import retarget as rt  # noqa: E402

SOURCE = os.path.join(HERE, "data", "strikers_source.npz")
MODELS = os.path.join(ROOT, "characters")
ASSETS = os.path.join(ROOT, "game", "assets")
ROSTER = os.path.join(ASSETS, "roster.json")
REQUIRED = [name for name in rt.MAP] + ["mixamorig:HeadTop_End", "mixamorig:Neck"]


def check_rig(path):
    names = set(n.get("name") for n in rt.Glb(path).j["nodes"])
    missing = [n for n in REQUIRED if n not in names]
    return missing


def main():
    redo_all, audit = "--all" in sys.argv, "--audit" in sys.argv
    roster = json.load(open(ROSTER))
    known = {c["id"]: c for c in roster["characters"]}
    source = None
    for fn in sorted(os.listdir(MODELS)):
        if not fn.lower().endswith(".glb"):
            continue
        cid = os.path.splitext(fn)[0].lower().replace(" ", "_")
        src = os.path.join(MODELS, fn)
        out_glb = os.path.join(ASSETS, "characters", cid + ".glb")
        out_meta = os.path.join(ASSETS, "characters", cid + ".clips.json")
        fresh = os.path.exists(out_glb) and os.path.getmtime(out_glb) >= os.path.getmtime(src)
        if fresh and not redo_all and cid in known:
            print("%-16s up to date" % cid)
            continue
        missing = check_rig(src)
        if missing:
            print("%-16s SKIPPED: not a Mixamo rig, missing %s" % (cid, ", ".join(missing[:5])))
            continue
        if source is None:
            source = rt.Source.load(SOURCE)
        sys.argv = ["retarget.py", SOURCE, src, out_glb, out_meta]
        rt.main(source)
        if cid not in known:
            entry = {"id": cid, "name": cid.replace("_", " ").title(),
                     "glb": "characters/%s.glb" % cid, "clips": "characters/%s.clips.json" % cid, "recolor": False}
            roster["characters"].append(entry)
            known[cid] = entry
            print("%-16s added to roster.json (put it in a team under \"teams\")" % cid)
        if audit:
            import audit as au
            rep = au.audit(SOURCE, out_glb, out_meta)
            worst = max(rep.items(), key=lambda kv: kv[1]["ground_below"])
            print("%-16s audit: worst ground_below %.2f m (%s)" % (cid, worst[1]["ground_below"], worst[0]))
    with open(ROSTER, "w") as fh:
        json.dump(roster, fh, indent=2)
        fh.write("\n")


if __name__ == "__main__":
    main()
