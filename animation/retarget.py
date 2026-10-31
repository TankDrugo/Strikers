"""Retargets Super Mario Strikers clips (Character Studio 'Bip01' skeletons) onto a
Mixamo-rigged glTF character and writes a new .glb with the clips as glTF animations.

  python3 retarget.py data/strikers_source.npz character.glb out.glb out_clips.json
  python3 retarget.py --export DISC_DIR data/strikers_source.npz   (rebuild the pack from the disc)

Usually run through add_characters.py, which does every model in characters/.

Method, per bone:
  1. Calibration on the Strikers 'idle' pose: rotate the Mixamo rest pose (swing only,
     or two-vector alignment for hips/chest) so each bone points like the Strikers bone.
  2. Every frame: apply the Strikers bone's world-space rotation change since that
     idle pose to the calibrated Mixamo bone, then convert back to local rotations.
Hips height follows the Strikers pelvis, scaled by the ratio of the two hip heights.
Root motion is not baked in: it is exported per clip in the metadata for the game to use.
"""

import io
import json
import math
import os
import struct
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "tests"))
import strikers_anim as sa  # noqa: E402
from test_converter import game_world  # noqa: E402

# game axes (X forward, Y left, Z up) -> glTF axes for a character facing +Z (X = its left, Y up)
C = np.array([[0, 1, 0], [0, 0, 1], [1, 0, 0]], dtype=float)

# Mixamo joint -> (Strikers bone, Strikers bone it points at, Mixamo joint it points at)
MAP = {
    "mixamorig:Hips": ("Bip01 Pelvis", None, None),
    "mixamorig:Spine": ("Bip01 Spine", None, None),
    "mixamorig:Spine1": ("Bip01 Spine1", "Bip01 Neck", "mixamorig:Neck"),
    "mixamorig:Neck": ("Bip01 Neck", "Bip01 Head", "mixamorig:Head"),
    "mixamorig:Head": ("Bip01 Head", None, None),
}
for side, s in (("Left", "L"), ("Right", "R")):
    MAP.update({
        f"mixamorig:{side}Shoulder": (f"Bip01 {s} Clavicle", f"Bip01 {s} Upperarm", f"mixamorig:{side}Arm"),
        f"mixamorig:{side}Arm": (f"Bip01 {s} Upperarm", f"Bip01 {s} Forearm", f"mixamorig:{side}ForeArm"),
        f"mixamorig:{side}ForeArm": (f"Bip01 {s} Forearm", f"Bip01 {s} Hand", f"mixamorig:{side}Hand"),
        f"mixamorig:{side}Hand": (f"Bip01 {s} Hand", None, None),
        f"mixamorig:{side}UpLeg": (f"Bip01 {s} Thigh", f"Bip01 {s} Calf", f"mixamorig:{side}Leg"),
        f"mixamorig:{side}Leg": (f"Bip01 {s} Calf", f"Bip01 {s} Foot", f"mixamorig:{side}Foot"),
        f"mixamorig:{side}Foot": (f"Bip01 {s} Foot", f"Bip01 {s} Toe0", f"mixamorig:{side}ToeBase"),
        f"mixamorig:{side}ToeBase": (f"Bip01 {s} Toe0", None, None),
    })


# ---------------------------------------------------------------- math

def quat_to_mat(q):  # glTF order x, y, z, w
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
                     [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
                     [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]])


def mat_to_quat(m):
    t = m[0, 0] + m[1, 1] + m[2, 2]
    if t > 0:
        s = math.sqrt(t + 1.0) * 2
        q = [(m[2, 1] - m[1, 2]) / s, (m[0, 2] - m[2, 0]) / s, (m[1, 0] - m[0, 1]) / s, 0.25 * s]
    elif m[0, 0] > m[1, 1] and m[0, 0] > m[2, 2]:
        s = math.sqrt(1.0 + m[0, 0] - m[1, 1] - m[2, 2]) * 2
        q = [0.25 * s, (m[0, 1] + m[1, 0]) / s, (m[0, 2] + m[2, 0]) / s, (m[2, 1] - m[1, 2]) / s]
    elif m[1, 1] > m[2, 2]:
        s = math.sqrt(1.0 + m[1, 1] - m[0, 0] - m[2, 2]) * 2
        q = [(m[0, 1] + m[1, 0]) / s, 0.25 * s, (m[1, 2] + m[2, 1]) / s, (m[0, 2] - m[2, 0]) / s]
    else:
        s = math.sqrt(1.0 + m[2, 2] - m[0, 0] - m[1, 1]) * 2
        q = [(m[0, 2] + m[2, 0]) / s, (m[1, 2] + m[2, 1]) / s, 0.25 * s, (m[1, 0] - m[0, 1]) / s]
    q = np.array(q)
    return q / np.linalg.norm(q)


def orthonormal(m):
    u, _, vt = np.linalg.svd(m)
    r = u @ vt
    if np.linalg.det(r) < 0:
        u[:, -1] *= -1
        r = u @ vt
    return r


def swing(a, b):
    """Shortest rotation taking direction a to direction b."""
    a = a / np.linalg.norm(a)
    b = b / np.linalg.norm(b)
    v = np.cross(a, b)
    c = float(np.dot(a, b))
    if c < -0.9999:
        axis = np.cross(a, [1, 0, 0])
        if np.linalg.norm(axis) < 1e-6:
            axis = np.cross(a, [0, 1, 0])
        axis /= np.linalg.norm(axis)
        return 2 * np.outer(axis, axis) - np.eye(3)
    vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + vx + vx @ vx / (1 + c)


def frame_from(p, s):
    """Orthonormal frame with primary axis p and secondary s."""
    x = p / np.linalg.norm(p)
    z = np.cross(x, s)
    z /= np.linalg.norm(z)
    y = np.cross(z, x)
    return np.column_stack([x, y, z])


# ---------------------------------------------------------------- glTF in/out

class Glb:
    def __init__(self, path):
        b = open(path, "rb").read()
        jl = struct.unpack_from("<I", b, 12)[0]
        self.j = json.loads(b[20:20 + jl])
        o = 20 + jl
        bl = struct.unpack_from("<I", b, o)[0]
        self.bin = b[o + 8:o + 8 + bl]

    def view_bytes(self, i):
        v = self.j["bufferViews"][i]
        return self.bin[v.get("byteOffset", 0):v.get("byteOffset", 0) + v["byteLength"]]

    def read(self, ai):
        a = self.j["accessors"][ai]
        n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}[a["type"]]
        v = self.j["bufferViews"][a["bufferView"]]
        off = v.get("byteOffset", 0) + a.get("byteOffset", 0)
        return np.frombuffer(self.bin, dtype="<f4", count=a["count"] * n, offset=off).reshape(a["count"], n)


def write_glb(src, path, animations, images):
    """Rebuilds the binary: keeps every buffer view (images swapped), appends animation data."""
    j = json.loads(json.dumps(src.j))
    out = bytearray()
    new_views = []
    image_views = {img["bufferView"]: i for i, img in enumerate(j["images"])}
    for vi, v in enumerate(j["bufferViews"]):
        data = images[image_views[vi]][0] if vi in image_views else src.view_bytes(vi)
        while len(out) % 4:
            out += b"\0"
        nv = {k: val for k, val in v.items() if k not in ("byteOffset", "byteLength")}
        nv.update(byteOffset=len(out), byteLength=len(data))
        new_views.append(nv)
        out += data
    for i, img in enumerate(j["images"]):
        img["mimeType"] = images[i][1]
    j["bufferViews"] = new_views
    accessors = j["accessors"]

    def add(arr, typ):
        nonlocal out
        while len(out) % 4:
            out += b"\0"
        data = np.ascontiguousarray(arr, dtype="<f4").tobytes()
        j["bufferViews"].append({"buffer": 0, "byteOffset": len(out), "byteLength": len(data)})
        out += data
        acc = {"bufferView": len(j["bufferViews"]) - 1, "componentType": 5126,
               "count": int(arr.shape[0]), "type": typ}
        if typ == "SCALAR":
            acc["min"], acc["max"] = [float(arr.min())], [float(arr.max())]
        accessors.append(acc)
        return len(accessors) - 1

    j["animations"] = []
    for name, times, tracks in animations:
        t_acc = add(np.asarray(times, dtype=float).reshape(-1, 1), "SCALAR")
        anim = {"name": name, "samplers": [], "channels": []}
        for node, path_, values in tracks:
            typ = "VEC4" if path_ == "rotation" else "VEC3"
            anim["samplers"].append({"input": t_acc, "output": add(np.asarray(values), typ), "interpolation": "LINEAR"})
            anim["channels"].append({"sampler": len(anim["samplers"]) - 1, "target": {"node": node, "path": path_}})
        j["animations"].append(anim)
    while len(out) % 4:
        out += b"\0"
    j["buffers"] = [{"byteLength": len(out)}]
    js = json.dumps(j, separators=(",", ":")).encode()
    while len(js) % 4:
        js += b" "
    total = 12 + 8 + len(js) + 8 + len(out)
    with open(path, "wb") as fh:
        fh.write(struct.pack("<4sII", b"glTF", 2, total))
        fh.write(struct.pack("<I4s", len(js), b"JSON") + js)
        fh.write(struct.pack("<I4s", len(out), b"BIN\0") + bytes(out))


def shrink_images(glb, base_size=1024, other_size=512):
    from PIL import Image
    res = []
    for i, img in enumerate(glb.j["images"]):
        im = Image.open(io.BytesIO(glb.view_bytes(img["bufferView"])))
        size = base_size if i == 0 else other_size
        im = im.convert("RGB").resize((size, size), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=88)
        res.append((buf.getvalue(), "image/jpeg"))
    return res


# ---------------------------------------------------------------- retarget

class Rig:
    """Mixamo rest pose in glTF space (meters, world rotations)."""

    def __init__(self, glb):
        j = glb.j
        self.nodes = j["nodes"]
        self.names = [n.get("name") for n in self.nodes]
        self.parent = {c: i for i, n in enumerate(self.nodes) for c in n.get("children", [])}
        self.joints = j["skins"][0]["joints"]
        self.rest_rot = {}
        self.rest_pos = {}
        for ji in self.joints:
            self.rest_rot[ji], self.rest_pos[ji] = self.world(ji)

    def local(self, i):
        n = self.nodes[i]
        return (quat_to_mat(n.get("rotation", [0, 0, 0, 1])), np.array(n.get("translation", [0, 0, 0]), float),
                np.array(n.get("scale", [1, 1, 1]), float))

    def world(self, i):
        chain = [i]
        while chain[-1] in self.parent:
            chain.append(self.parent[chain[-1]])
        R, T, S = np.eye(3), np.zeros(3), np.ones(3)
        for n in reversed(chain):
            r, t, s = self.local(n)
            T = T + R @ (t * S)
            R = R @ r
            S = S * s
        return R, T

    def idx(self, name):
        return self.names.index(name)


def strikers_frames(pose, skel, names, k):
    mats = game_world(pose, k, with_root=False)
    rot, pos = {}, {}
    for i in range(skel.num_nodes):
        nm = names.name(skel.node_ids[i])
        m = np.array(mats[i])
        rot[nm] = C @ m[:3, :3].T @ C.T
        pos[nm] = C @ m[3, :3]
    return rot, pos


def calibrate(rig, idle_rot, idle_pos):
    M0 = {}
    for jn, (sb, sc, mc) in MAP.items():
        ji = rig.idx(jn)
        Rr = rig.rest_rot[ji]
        if jn == "mixamorig:Hips":
            # segment-to-segment: hips -> upper spine on both rigs (Mixamo has 3 spine bones, Biped 2)
            r = frame_from(rig.rest_pos[rig.idx("mixamorig:Spine1")] - rig.rest_pos[ji],
                           rig.rest_pos[rig.idx("mixamorig:LeftUpLeg")] - rig.rest_pos[rig.idx("mixamorig:RightUpLeg")])
            d = frame_from(idle_pos["Bip01 Spine1"] - idle_pos["Bip01 Pelvis"],
                           idle_pos["Bip01 L Thigh"] - idle_pos["Bip01 R Thigh"])
            M0[jn] = d @ r.T @ Rr
        elif jn == "mixamorig:Spine":
            r = frame_from(rig.rest_pos[rig.idx("mixamorig:Spine1")] - rig.rest_pos[ji],
                           rig.rest_pos[rig.idx("mixamorig:LeftArm")] - rig.rest_pos[rig.idx("mixamorig:RightArm")])
            d = frame_from(idle_pos["Bip01 Spine1"] - idle_pos["Bip01 Spine"],
                           idle_pos["Bip01 L Upperarm"] - idle_pos["Bip01 R Upperarm"])
            M0[jn] = d @ r.T @ Rr
        elif sc is not None:
            r = rig.rest_pos[rig.idx(mc)] - rig.rest_pos[ji]
            d = idle_pos[sc] - idle_pos[sb]
            M0[jn] = swing(Rr @ (Rr.T @ r), d) @ Rr
        else:
            p = rig.parent[ji]
            pn = rig.names[p]
            M0[jn] = M0[pn] @ rig.rest_rot[p].T @ Rr if pn in M0 else Rr
    return {jn: idle_rot[MAP[jn][0]].T @ M0[jn] for jn in MAP}  # offsets O: M(t) = R_s(t) @ O


# Body points used to keep ground contact: model joint -> original bone
GROUND_POINTS = {
    "mixamorig:LeftToeBase": "Bip01 L Toe0", "mixamorig:RightToeBase": "Bip01 R Toe0",
    "mixamorig:LeftFoot": "Bip01 L Foot", "mixamorig:RightFoot": "Bip01 R Foot",
    "mixamorig:LeftHand": "Bip01 L Hand", "mixamorig:RightHand": "Bip01 R Hand",
    "mixamorig:Hips": "Bip01 Pelvis", "mixamorig:Head": "Bip01 Head",
    "mixamorig:LeftLeg": "Bip01 L Calf", "mixamorig:RightLeg": "Bip01 R Calf",
    "mixamorig:LeftForeArm": "Bip01 L Forearm", "mixamorig:RightForeArm": "Bip01 R Forearm",
}


MIN_JOINT_HEIGHT = 0.03  # joint centres stay this far above the ground (skin and shoes are thicker)


def lowest_offset(rig, W, hips):
    """Height of the model's lowest ground point relative to the hips joint (metres)."""
    rel = {hips: np.zeros(3)}

    def R(ji):
        if ji in rel:
            return rel[ji]
        p = rig.parent[ji]
        rel[ji] = R(p) + W(p) @ (rig.local(ji)[1] * 0.01)
        return rel[ji]
    return min(R(rig.idx(n))[1] for n in list(GROUND_POINTS) + ["mixamorig:HeadTop_End"])


def retarget_clip(rig, frames, offsets, hips_scale, idle_pelvis, ground=None):
    """frames = [(rot, pos)] per key of the original clip (see Source).
    ground = (model lowest point, original lowest point x scale) in the idle pose, or None to measure it."""
    hips = rig.idx("mixamorig:Hips")
    hips_parent_rot, hips_parent_pos = rig.world(rig.parent[hips])
    parent_scale = 0.01  # target_character node scale
    order = [ji for ji in rig.joints]
    tracks_rot = {ji: [] for ji in order}
    hips_t = []
    for rot, pos in frames:
        world = {}
        # parents come before children in Mixamo's skin joint list? resolve recursively instead
        def W(ji):
            if ji in world:
                return world[ji]
            nm = rig.names[ji]
            if nm in MAP:
                world[ji] = orthonormal(rot[MAP[nm][0]] @ offsets[nm])
            else:
                p = rig.parent[ji]
                world[ji] = W(p) @ rig.rest_rot[p].T @ rig.rest_rot[ji] if p in rig.rest_rot else rig.rest_rot[ji]
            return world[ji]
        for ji in order:
            W(ji)
        # torso lean: rotate hips + spine as one block so the hips->neck line matches the original
        # exactly (the two spines curve differently, so matching each segment alone leaves a lean error)
        chain = [rig.idx(n) for n in ("mixamorig:Hips", "mixamorig:Spine", "mixamorig:Spine1", "mixamorig:Spine2")]
        v_m = np.zeros(3)
        for a, b in zip(chain, chain[1:] + [rig.idx("mixamorig:Neck")]):
            v_m = v_m + world[a] @ (rig.local(b)[1] * 0.01)
        corr = swing(v_m, pos["Bip01 Neck"] - pos["Bip01 Pelvis"])
        for ji in chain:
            world[ji] = orthonormal(corr @ world[ji])
        for ji in order:
            p = rig.parent.get(ji)
            pw = W(p) if p in rig.rest_rot else hips_parent_rot
            q = mat_to_quat(pw.T @ W(ji))
            if tracks_rot[ji] and np.dot(tracks_rot[ji][-1], q) < 0:
                q = -q
            tracks_rot[ji].append(q)
        pel = pos["Bip01 Pelvis"]
        rest_h = rig.rest_pos[hips]
        # offsets from the idle pelvis, scaled by overall body size so jumps stay proportional
        world_hips = np.array([pel[0] * hips_scale, rest_h[1] + (pel[1] - idle_pelvis) * hips_scale, pel[2] * hips_scale])
        low_rel = lowest_offset(rig, W, hips)
        s_low = min(pos[b][1] for b in GROUND_POINTS.values()) * hips_scale
        if ground is None:
            return world_hips[1] + low_rel, s_low  # measuring the idle reference
        # keep ground contact: the lowest body point sits where the original's does (relative to idle),
        # so lying, kneeling and diving poses touch the floor despite the different proportions
        # never below the floor: a few original clips (electrocution) sink their feet into it
        world_hips[1] = max(ground[0] + (s_low - ground[1]), MIN_JOINT_HEIGHT) - low_rel
        hips_t.append(hips_parent_rot.T @ (world_hips - hips_parent_pos) / parent_scale)
    times = [k / sa.FPS for k in range(len(frames))]
    tracks = [(ji, "rotation", np.array(tracks_rot[ji])) for ji in order]
    tracks.append((hips, "translation", np.array(hips_t)))
    return times, tracks


def contact_time(clip, skel, names, retargets):
    """Time where a foot moves fastest: the kick/pass contact, in place of the .trg triggers."""
    pose = sa.Pose(clip, skel, retargets)
    ids = {names.name(skel.node_ids[i]): i for i in range(skel.num_nodes)}
    best, best_t, prev = 0.0, None, None
    for k in range(clip.num_keys):
        m = game_world(pose, k, with_root=False)
        cur = {f: np.array(m[ids[f]][3][:3]) for f in ("Bip01 L Toe0", "Bip01 R Toe0") if f in ids}
        if prev is not None and 0.15 * clip.num_keys <= k < 0.85 * clip.num_keys:
            for f in cur:
                v = np.linalg.norm(cur[f] - prev[f]) * sa.FPS
                if v > best:
                    best, best_t = v, (k - 0.5) / sa.FPS
        prev = cur
    return round(best_t, 3) if best_t is not None else None


def root_motion(clip):
    out = []
    x0, y0, z0, r0 = clip.root_key(0)
    for k in range(clip.num_keys):
        x, y, z, r = clip.root_key(k)
        a = -r0 * sa.U16_TO_RAD
        dx, dy = x - x0, y - y0
        fwd, left = dx * math.cos(a) - dy * math.sin(a), dx * math.sin(a) + dy * math.cos(a)
        yaw = ((r - r0 + 0x8000) % 0x10000 - 0x8000) * sa.U16_TO_RAD
        out.append([round(fwd, 4), round(left, 4), round(yaw, 4)])
    return out


class Source:
    """The original animations, decoded once: per character the Biped bone names and, per clip, the
    world rotation/position of every bone at every key plus the clip facts the game needs.

    Built from the disc files (DISC_DIR with main.dol, Mario.*, MarioGoalie.*) or loaded from the
    pack written by --export (animation/data/strikers_source.npz), so retargeting a new character
    does not need the disc."""

    CHARS = (("Mario", ""), ("MarioGoalie", "gk_"))

    def __init__(self, chars):
        self.chars = chars  # {char: {"bones": [...], "clips": [{"name", "rot", "pos", "meta"}]}}

    @classmethod
    def from_disc(cls, disc):
        names = sa.NameBook()
        names.harvest_path(os.path.join(disc, "main.dol"))
        chars = {}
        for char, prefix in cls.CHARS:
            skel = sa.load_skeletons(os.path.join(disc, char + ".shier"))[0]
            clips = sa.load_clips(os.path.join(disc, char + ".sanim"))
            rtp = os.path.join(disc, char + ".bin")
            retargets = sa.load_retargets(rtp) if os.path.exists(rtp) else None
            bones = [names.name(skel.node_ids[i]) for i in range(skel.num_nodes)]
            out = []
            for clip in clips:
                pose = sa.Pose(clip, skel, retargets)
                rot = np.zeros((clip.num_keys, len(bones), 3, 3), np.float32)
                pos = np.zeros((clip.num_keys, len(bones), 3), np.float32)
                for k in range(clip.num_keys):
                    r, p = strikers_frames(pose, skel, names, k)
                    for b, nm in enumerate(bones):
                        rot[k, b], pos[k, b] = r[nm], p[nm]
                states = sa.clip_states(clip.name)
                out.append({"name": prefix + clip.name, "rot": rot, "pos": pos, "meta": {
                    "duration": clip.duration, "keys": clip.num_keys, "linear_speed": round(clip.linear_speed, 4),
                    "root": root_motion(clip), "states": [st[0] for st in states],
                    "play_mode": states[0][2] if states else "hold",
                    "contact": contact_time(clip, skel, names, retargets),
                }})
            chars[char] = {"bones": bones, "clips": out}
        return cls(chars)

    def save(self, path):
        arrays, index = {}, {}
        for char, d in self.chars.items():
            index[char] = {"bones": d["bones"], "clips": []}
            for i, c in enumerate(d["clips"]):
                arrays["%s_%d_rot" % (char, i)] = c["rot"]
                arrays["%s_%d_pos" % (char, i)] = c["pos"]
                index[char]["clips"].append({"name": c["name"], "meta": c["meta"]})
        arrays["index"] = np.frombuffer(json.dumps(index).encode(), np.uint8)
        np.savez_compressed(path, **arrays)

    @classmethod
    def load(cls, path):
        z = np.load(path)
        index = json.loads(bytes(z["index"]).decode())
        chars = {}
        for char, d in index.items():
            clips = [{"name": c["name"], "meta": c["meta"], "rot": z["%s_%d_rot" % (char, i)].astype(np.float64),
                      "pos": z["%s_%d_pos" % (char, i)].astype(np.float64)} for i, c in enumerate(d["clips"])]
            chars[char] = {"bones": d["bones"], "clips": clips}
        return cls(chars)

    @staticmethod
    def frames(bones, clip):
        return [({nm: clip["rot"][k, b] for b, nm in enumerate(bones)}, {nm: clip["pos"][k, b] for b, nm in enumerate(bones)})
                for k in range(clip["rot"].shape[0])]


def open_source(path):
    return Source.load(path) if path.endswith(".npz") else Source.from_disc(path)


def main(source=None):
    if sys.argv[1] == "--export":
        # python3 retarget.py --export DISC_DIR strikers_source.npz
        Source.from_disc(sys.argv[2]).save(sys.argv[3])
        print("wrote", sys.argv[3], "%.1f MB" % (os.path.getsize(sys.argv[3]) / 1e6))
        return
    # python3 retarget.py SOURCE character.glb out.glb out_clips.json   (SOURCE = the .npz pack or DISC_DIR)
    source_path, src_glb, out_glb, out_meta = sys.argv[1:5]
    source = source or open_source(source_path)
    glb = Glb(src_glb)
    rig = Rig(glb)
    animations, meta = [], {"clips": {}}
    for char, prefix in Source.CHARS:
        bones, clips = source.chars[char]["bones"], source.chars[char]["clips"]
        idle = next(c for c in clips if c["name"] == prefix + "idle")
        idle_frames = Source.frames(bones, idle)
        irot, ipos = idle_frames[0]
        offsets = calibrate(rig, irot, ipos)
        idle_pelvis = ipos["Bip01 Pelvis"][1]
        hips_scale = rig.rest_pos[rig.idx("mixamorig:Head")][1] / ipos["Bip01 Head"][1]
        ground = retarget_clip(rig, idle_frames, offsets, hips_scale, idle_pelvis)
        meta["ground_" + char] = [float(ground[0]), float(ground[1])]
        for clip in clips:
            times, tracks = retarget_clip(rig, Source.frames(bones, clip), offsets, hips_scale, idle_pelvis, ground)
            animations.append((clip["name"], times, tracks))
            meta["clips"][clip["name"]] = clip["meta"]
        meta["hips_scale_" + char] = hips_scale
        if char == "Mario":
            fielder_cal = (offsets, float(ground[0]))
    # pack walkouts from the cut scenes (animation/nis.py), on the fielder calibration
    import nis
    extra, scales = nis.retarget_walkouts(rig, fielder_cal[0], fielder_cal[1], sys.modules[__name__])
    animations += extra
    for name, times, _ in extra:
        meta["clips"][name] = {"duration": round(len(times) / sa.FPS, 4), "keys": len(times), "linear_speed": 0.0,
                               "root": [[0.0, 0.0, 0.0]] * len(times), "states": [], "play_mode": "hold", "contact": None}
    if scales:
        meta["nis_scale"] = scales
    rest_hips = rig.rest_pos[rig.idx("mixamorig:Hips")]
    meta["model_height"] = float(rig.rest_pos[rig.idx("mixamorig:HeadTop_End")][1])
    meta["model_hips"] = float(rest_hips[1])
    write_glb(glb, out_glb, animations, shrink_images(glb))
    with open(out_meta, "w") as fh:
        json.dump(meta, fh, separators=(",", ":"))
    print("wrote %s (%d animations, %.1f MB) and %s" % (out_glb, len(animations), os.path.getsize(out_glb) / 1e6, out_meta))


if __name__ == "__main__":
    main()
