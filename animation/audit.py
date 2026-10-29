"""Checks every retargeted clip in player.glb against the original Strikers pose.

  python3 audit.py SOURCE player.glb clips.json report.json   (SOURCE = strikers_source.npz or DISC_DIR)

Per clip and frame it measures:
  ground   lowest body point of the model vs the original (scaled): feet through the floor or floating
  flips    largest rotation change of any joint between two frames, vs the same joint in the original
  dirs     angle between each model bone and the matching original bone (should be ~0)
  knees    knee bend of the model vs the original
"""

import json
import math
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import retarget as rt  # noqa: E402

LOW_JOINTS = {  # model joint -> original bone, used for "lowest point" comparisons
    "mixamorig:LeftToeBase": "Bip01 L Toe0", "mixamorig:RightToeBase": "Bip01 R Toe0",
    "mixamorig:LeftFoot": "Bip01 L Foot", "mixamorig:RightFoot": "Bip01 R Foot",
    "mixamorig:LeftHand": "Bip01 L Hand", "mixamorig:RightHand": "Bip01 R Hand",
    "mixamorig:Hips": "Bip01 Pelvis", "mixamorig:Head": "Bip01 Head",
    "mixamorig:LeftLeg": "Bip01 L Calf", "mixamorig:RightLeg": "Bip01 R Calf",
    "mixamorig:LeftForeArm": "Bip01 L Forearm", "mixamorig:RightForeArm": "Bip01 R Forearm",
}


def sample(times, vals, t):
    if t <= times[0]:
        return vals[0]
    if t >= times[-1]:
        return vals[-1]
    i = int(np.searchsorted(times, t) - 1)
    f = (t - times[i]) / (times[i + 1] - times[i])
    return vals[i] * (1 - f) + vals[i + 1] * f


def model_frames(glb, rig, anim):
    """World positions/rotations of every joint, per original key."""
    ch = {}
    for c in anim["channels"]:
        s = anim["samplers"][c["sampler"]]
        ch[(c["target"]["node"], c["target"]["path"])] = (glb.read(s["input"])[:, 0], glb.read(s["output"]))
    times = ch[next(iter(ch))][0]
    out = []
    for t in times:
        cache = {}

        def world(i):
            if i in cache:
                return cache[i]
            r, tr, sc = rig.local(i)
            if (i, "rotation") in ch:
                q = sample(*ch[(i, "rotation")], t)
                r = rt.quat_to_mat(q / np.linalg.norm(q))
            if (i, "translation") in ch:
                tr = sample(*ch[(i, "translation")], t)
            if i in rig.parent:
                pr, pt, ps = world(rig.parent[i])
                res = (pr @ r, pt + pr @ (tr * ps), ps * sc)
            else:
                res = (r, tr, sc)
            cache[i] = res
            return res
        out.append({rig.names[j]: world(j) for j in rig.joints})
    return out


def angle(a, b):
    a = a / (np.linalg.norm(a) + 1e-9)
    b = b / (np.linalg.norm(b) + 1e-9)
    return math.degrees(math.acos(max(-1.0, min(1.0, float(np.dot(a, b))))))


def rot_angle(m):
    return math.degrees(math.acos(max(-1.0, min(1.0, (np.trace(m) - 1) / 2))))


def audit(source_path, glb_path, meta_path):
    glb = rt.Glb(glb_path)
    rig = rt.Rig(glb)
    meta = json.load(open(meta_path))
    source = rt.open_source(source_path)
    anims = {a["name"]: a for a in glb.j["animations"]}
    report = {}
    for char, _ in rt.Source.CHARS:
        bones = source.chars[char]["bones"]
        scale = meta["hips_scale_" + char]
        for clip in source.chars[char]["clips"]:
            name = clip["name"]
            frames = rt.Source.frames(bones, clip)
            mf = model_frames(glb, rig, anims[name])
            r = {"any_below": 0.0, "ground_below": 0.0, "ground_float": 0.0, "flip": 0.0, "flip_joint": "", "dir": 0.0, "dir_joint": "",
                 "knee": 0.0, "frames": len(frames)}
            prev_m, prev_s = None, None
            for k, (srot, spos) in enumerate(frames):
                m = mf[k]
                # ground: lowest of the key joints, model vs original scaled to the model's size
                r["any_below"] = max(r["any_below"], -min(v[1][1] for v in m.values()))
                m_low = min(m[j][1][1] for j in LOW_JOINTS)
                s_low = min(spos[b][1] for b in LOW_JOINTS.values()) * scale
                g = meta.get("ground_" + char, [0.0, 0.0])
                diff = (m_low - g[0]) - (s_low - g[1])
                r["ground_below"] = max(r["ground_below"], -diff)
                r["ground_float"] = max(r["ground_float"], diff)
                # bone directions
                for jn, (sb, sc, mc) in rt.MAP.items():
                    if sc is None:
                        continue
                    a = angle(m[mc][1] - m[jn][1], spos[sc] - spos[sb])
                    if a > r["dir"]:
                        r["dir"], r["dir_joint"] = a, jn
                # knees
                for side, s in (("Left", "L"), ("Right", "R")):
                    mk = angle(m[f"mixamorig:{side}Leg"][1] - m[f"mixamorig:{side}UpLeg"][1], m[f"mixamorig:{side}Foot"][1] - m[f"mixamorig:{side}Leg"][1])
                    sk = angle(spos[f"Bip01 {s} Calf"] - spos[f"Bip01 {s} Thigh"], spos[f"Bip01 {s} Foot"] - spos[f"Bip01 {s} Calf"])
                    r["knee"] = max(r["knee"], abs(mk - sk))
                # flips: model joint rotation jump beyond what the original joint does
                if prev_m is not None:
                    for jn, (sb, _, _) in rt.MAP.items():
                        dm = rot_angle(prev_m[jn][0].T @ m[jn][0])
                        ds = rot_angle(prev_s[sb].T @ srot[sb])
                        if dm - ds > r["flip"]:
                            r["flip"], r["flip_joint"] = dm - ds, jn
                prev_m, prev_s = m, srot
            report[name] = {k2: (round(v, 3) if isinstance(v, float) else v) for k2, v in r.items()}
    return report


if __name__ == "__main__":
    source_path, glb_path, meta_path, out = sys.argv[1:5]
    rep = audit(source_path, glb_path, meta_path)
    json.dump(rep, open(out, "w"), indent=1)
    for key, lim in (("any_below", 0.0), ("ground_below", 0.05), ("ground_float", 0.08), ("flip", 20), ("dir", 3), ("knee", 5)):
        bad = sorted(((v[key], n) for n, v in rep.items() if v[key] > lim), reverse=True)
        print("%-13s > %-5s : %3d clips  %s" % (key, lim, len(bad), ", ".join("%s %.2f" % (n, v) for v, n in bad[:6])))
