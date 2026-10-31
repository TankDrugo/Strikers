"""Decoder for the original cut-scene files (.nis): character clips and camera paths.

A .nis holds, at top level:
  0x80017000  one clip per character in the scene, same layout as a .sanim clip (strikers_anim.Clip),
              named "nis", with root motion in world space (metres, Z up, X along the pitch)
  0x80015501  one camera: name, then per key position (0x15509), rotation (0x15511), scale (0x1550b),
              the position of its look-at target (0x1550c, with 0x15512/0x1550e), horizontal field of
              view in degrees (0x1550f) and camera-target distance (0x15510). 30 keys per second.

The .nis files carry no skeleton, so the bone hierarchy is rebuilt from the Biped layout the clips
share with the .sanim files: 38 nodes = the fielder layout (same order as Mario in
data/strikers_source.npz), 39 nodes = the same without the head extra and with a two-bone tail.
The rebuilt skeleton was checked by drawing every clip next to the original stick figures
(feet on the ground, mirror-symmetric limbs, bone lengths constant over the clip).

  python3 animation/nis.py DIR_WITH_NIS_FILES animation/data/strikers_nis.npz   (decode once)
"""
import json
import math
import os
import struct
import sys
from types import SimpleNamespace

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "tests"))
import strikers_anim as sa  # noqa: E402
from test_converter import mul_rows, quat_rows, to4  # noqa: E402

CHUNK_CAMERA = 0x80015501

_ARM = ["Clavicle", "Upperarm", "Forearm", "Hand", "Finger0", "Finger01", "Finger02", "Finger1", "Finger11", "Finger12"]
_LEG = ["Thigh", "Calf", "Foot", "Toe0"]


def biped_layout(num_nodes):
    """Bone names and parents for the two layouts used by the cut scenes."""
    names = ["root", "ball", "Bip01", "Bip01 Footsteps", "Bip01 Pelvis"]
    for s in "LR":
        names += ["Bip01 %s %s" % (s, b) for b in _LEG]
    names += ["Bip01 Spine", "Bip01 Spine1"] + ["Bip01 L " + b for b in _ARM] + ["Bip01 Neck", "Bip01 Head"]
    if num_nodes == 38:
        names += ["Bip01 Head Extra"]
    names += ["Bip01 R " + b for b in _ARM]
    if num_nodes == 39:
        names += ["Bip01 Tail", "Bip01 Tail1"]
    if len(names) != num_nodes:
        raise sa.FormatError("no Biped layout for %d nodes" % num_nodes)
    idx = {n: i for i, n in enumerate(names)}
    parent_of = {"root": None, "ball": "root", "Bip01": "root", "Bip01 Footsteps": "Bip01", "Bip01 Pelvis": "Bip01",
                 "Bip01 Spine": "Bip01", "Bip01 Spine1": "Bip01 Spine", "Bip01 Neck": "Bip01 Spine1",
                 "Bip01 Head": "Bip01 Neck", "Bip01 Head Extra": "Bip01 Head",
                 "Bip01 Tail": "Bip01 Pelvis", "Bip01 Tail1": "Bip01 Tail"}
    for s in "LR":
        p = "Bip01 %s " % s
        parent_of.update({p + "Thigh": "Bip01 Pelvis", p + "Calf": p + "Thigh", p + "Foot": p + "Calf", p + "Toe0": p + "Foot",
                          p + "Clavicle": "Bip01 Spine1", p + "Upperarm": p + "Clavicle", p + "Forearm": p + "Upperarm",
                          p + "Hand": p + "Forearm"})
        for f in "01":
            parent_of.update({p + "Finger" + f: p + "Hand", p + "Finger%s1" % f: p + "Finger" + f, p + "Finger%s2" % f: p + "Finger%s1" % f})
    parents = [idx[parent_of[n]] if parent_of[n] else -1 for n in names]
    return names, parents


def skeleton_for(clip):
    names, parents = biped_layout(clip.num_nodes)
    n = clip.num_nodes
    return SimpleNamespace(num_nodes=n, parents=parents, mirror=list(range(n)), preserve=[0] * n,
                           offsets=[(0.0, 0.0, 0.0)] * n, pelvis=names.index("Bip01 Pelvis"),
                           spine=names.index("Bip01 Spine"), names=names)


def read_camera(buf, chunk):
    kids = {k.id: k for k in chunk.children()}
    n = struct.unpack_from(">I", buf, kids[0x15508].data)[0]

    def arr(cid, w):
        return np.array(struct.unpack_from(">%df" % (n * w), buf, kids[cid].data), np.float64).reshape(n, w)
    return {"name": sa._cstr(buf, kids[0x15503].data), "keys": n, "pos": arr(0x15509, 3), "target": arr(0x1550c, 3),
            "fov": arr(0x1550f, 1)[:, 0], "dist": arr(0x15510, 1)[:, 0]}


# game axes (X forward, Y left, Z up) -> glTF axes, as in retarget.py
C = np.array([[0, 1, 0], [0, 0, 1], [1, 0, 0]], dtype=float)


def world_mats(pose, k):
    """Like test_converter.game_world, but with the absolute root (cut scenes place it in the stadium)."""
    x, y, z, r = pose.clip.root_key(k)
    yaw = r * sa.U16_TO_RAD
    world = to4(quat_rows((math.cos(yaw / 2), 0, 0, math.sin(yaw / 2))), (x, y, z))
    mats = []
    for i in range(pose.skel.num_nodes):
        t, q, _ = pose.local(i, k)
        p = pose.skel.parents[i]
        mats.append(mul_rows(to4(quat_rows(q), t), mats[p] if p >= 0 else world))
    return mats


def clip_frames(clip):
    """World rotation/position of every bone per key (glTF axes, world space with the root motion)."""
    skel = skeleton_for(clip)
    pose = sa.Pose(clip, skel)
    rot = np.zeros((clip.num_keys, skel.num_nodes, 3, 3))
    pos = np.zeros((clip.num_keys, skel.num_nodes, 3))
    for k in range(clip.num_keys):
        mats = world_mats(pose, k)
        for i in range(skel.num_nodes):
            m = np.array(mats[i])
            rot[k, i] = C @ m[:3, :3].T @ C.T
            pos[k, i] = C @ m[3, :3]
    return skel.names, rot, pos


def decode(path):
    with open(path, "rb") as fh:
        buf = fh.read()
    clips, cams = [], []
    for c in sa.top_level_chunks(buf):
        if c.id == sa.CHUNK_SANIM:
            clip = sa.Clip(buf, c)
            names, rot, pos = clip_frames(clip)
            clips.append({"bones": names, "rot": rot, "pos": pos})
        elif c.id == CHUNK_CAMERA:
            cam = read_camera(buf, c)
            cam["pos"] = cam["pos"] @ C.T
            cam["target"] = cam["target"] @ C.T
            cams.append(cam)
    return clips, cams


def scene_name(path):
    base = os.path.basename(path)[:-4]
    base = base.split("-", 1)[1] if "-" in base and len(base.split("-", 1)[0]) == 8 else base  # upload prefix
    return base


def export(paths, out):
    arrays, index = {}, {}
    for p in sorted(paths):
        name = scene_name(p)
        clips, cams = decode(p)
        index[name] = {"clips": [], "cameras": []}
        for i, c in enumerate(clips):
            arrays["%s_c%d_rot" % (name, i)] = c["rot"].astype(np.float32)
            arrays["%s_c%d_pos" % (name, i)] = c["pos"].astype(np.float32)
            index[name]["clips"].append({"bones": c["bones"], "keys": int(c["rot"].shape[0])})
        for cam in cams:
            index[name]["cameras"].append({"name": cam["name"], "keys": cam["keys"],
                                           "pos": np.round(cam["pos"], 4).tolist(), "target": np.round(cam["target"], 4).tolist(),
                                           "fov": np.round(cam["fov"], 3).tolist(), "dist": np.round(cam["dist"], 4).tolist()})
    arrays["index"] = np.frombuffer(json.dumps(index).encode(), np.uint8)
    np.savez_compressed(out, **arrays)
    return index


def load(path):
    z = np.load(path)
    index = json.loads(bytes(z["index"]).decode())
    for name, sc in index.items():
        for i, c in enumerate(sc["clips"]):
            c["rot"] = z["%s_c%d_rot" % (name, i)].astype(np.float64)
            c["pos"] = z["%s_c%d_pos" % (name, i)].astype(np.float64)
    return index


if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    files = [os.path.join(src, f) for f in os.listdir(src) if f.endswith(".nis")] if os.path.isdir(src) else sys.argv[1:-1]
    idx = export(files, out)
    for n, sc in idx.items():
        print(n, "%d clip(s), cameras: %s" % (len(sc["clips"]), ", ".join(c["name"] for c in sc["cameras"]) or "-"))
    print("wrote", out, "%.1f MB" % (os.path.getsize(out) / 1e6))


# ---------------------------------------------------------------- walkout clips for the game

# Clips the game uses (pack walkouts), as (game clip name, scene, clip index in the scene).
WALKOUT_CLIPS = (
    ("nis_walkout", "camera_establish_home_0", 0),  # the captain runs out of the tunnel
    ("nis_win_high", "birdo_goal_winner_high_0", 0),  # goal celebrations, two cameras each
    ("nis_win_low", "birdo_goal_winner_low_0", 0),
)
PACK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "strikers_nis.npz")


def leg_length(pos, side="L"):
    return (np.linalg.norm(pos["Bip01 %s Thigh" % side] - pos["Bip01 %s Calf" % side])
            + np.linalg.norm(pos["Bip01 %s Calf" % side] - pos["Bip01 %s Foot" % side]))


def split_path(clip):
    """Frames with the pelvis kept above the origin, plus the pelvis path on the ground (glTF axes,
    original metres). The game moves the whole model along the path, so the clip itself stays in place."""
    bones, rot, pos = clip["bones"], clip["rot"], clip["pos"]
    pel = pos[:, bones.index("Bip01 Pelvis")]
    path = pel[:, [0, 2]].copy()
    frames = []
    for k in range(rot.shape[0]):
        p = pos[k].copy()
        p[:, 0] -= path[k, 0]
        p[:, 2] -= path[k, 1]
        frames.append(({nm: rot[k, b] for b, nm in enumerate(bones)}, {nm: p[b] for b, nm in enumerate(bones)}))
    return frames, path


def retarget_walkouts(rig, offsets, ground_model, rt):
    """Retargets WALKOUT_CLIPS onto rig with the fielder calibration (the Biped bone axes are the same in
    every skeleton). Returns [(name, times, tracks)] and {name: hips scale}, or nothing without the pack."""
    if not os.path.exists(PACK):
        return [], {}
    scenes = load(PACK)
    rig_leg = (np.linalg.norm(rig.rest_pos[rig.idx("mixamorig:LeftUpLeg")] - rig.rest_pos[rig.idx("mixamorig:LeftLeg")])
               + np.linalg.norm(rig.rest_pos[rig.idx("mixamorig:LeftLeg")] - rig.rest_pos[rig.idx("mixamorig:LeftFoot")]))
    out, scales = [], {}
    for name, scene, ci in WALKOUT_CLIPS:
        clip = scenes[scene]["clips"][ci]
        frames, _ = split_path(clip)
        hips_scale = rig_leg / leg_length(frames[0][1])
        # lowest original point over the clip = the model's lowest point standing (feet on the ground)
        s_low = min(min(pos[b][1] for b in rt.GROUND_POINTS.values()) for _, pos in frames) * hips_scale
        idle_pelvis = frames[0][1]["Bip01 Pelvis"][1]
        times, tracks = rt.retarget_clip(rig, frames, offsets, hips_scale, idle_pelvis, (ground_model, s_low))
        out.append((name, times, tracks))
        scales[name] = round(float(hips_scale), 4)
    return out, scales


def walkout_json():
    """Character-independent walkout data for game/assets/walkout.json: model path and cameras,
    in glTF axes and original metres, relative to each clip's start (pelvis above the origin)."""
    scenes = load(PACK)
    res = {"_doc": "Pack walkouts from the original cut scenes (animation/nis.py). Positions: metres of the original, "
                   "Y up, relative to the clip's start; the game scales them by the character's nis_scale.", "clips": {}}
    for name, scene, ci in WALKOUT_CLIPS:
        clip = scenes[scene]["clips"][ci]
        _, path = split_path(clip)
        o = np.array([path[0, 0], 0.0, path[0, 1]])
        cams = []
        for cam in scenes[scene]["cameras"]:
            cams.append({"name": cam["name"], "pos": np.round(np.array(cam["pos"]) - o, 3).tolist(),
                         "target": np.round(np.array(cam["target"]) - o, 3).tolist(), "fov": cam["fov"]})
        head = float(clip["pos"][0, clip["bones"].index("Bip01 Head")][1])
        res["clips"][name] = {"scene": scene, "keys": int(clip["rot"].shape[0]), "head": round(head, 3),
                              "path": np.round(path - path[0], 4).tolist(), "cameras": cams}
    if "camera_establish_0" in scenes:  # stadium shot without characters, world coordinates
        cam = scenes["camera_establish_0"]["cameras"][0]
        res["establish"] = {"pos": np.round(cam["pos"], 3).tolist(), "target": np.round(cam["target"], 3).tolist(), "fov": cam["fov"]}
    # where the tunnel walkout starts in the stadium (original world, glTF axes)
    clip = scenes["camera_establish_home_0"]["clips"][0]
    p0 = split_path(clip)[1][0]
    res["clips"]["nis_walkout"]["start"] = [round(float(p0[0]), 3), 0.0, round(float(p0[1]), 3)]
    return res
