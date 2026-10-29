#!/usr/bin/env python3
"""Super Mario Strikers (GameCube) animation converter.

Reads the game's skeleton (.shier), animation bundle (.sanim) and optional
retarget table (animretarget/*.bin) and turns them into:

  * a Blender armature with one Action per clip (run inside Blender), or
  * one .bvh file per clip, or a JSON dump (run from a normal terminal).

The file formats are implemented from the decompilation at
https://github.com/yannicksuter/smstrikers-decomp (commit d1f357f):

  src/Game/SAnim.cpp                 cSAnim::Initialize, BlendRot/Trans/Scale
  src/Game/SHierarchy.cpp            cSHierarchy::Initialize
  src/Game/SAnim/AnimRetargeter.cpp  AnimRetargetList::Initialize
  src/Game/SAnim/pnSAnimController.cpp  node remap, mirroring, root motion
  src/Game/PoseAccumulator.cpp       local matrix construction, mirror math
  src/NL/nlString.cpp                nlStringHash / nlStringLowerHash

Terminal usage:
  python3 strikers_anim.py info  mario.sanim mario.shier
  python3 strikers_anim.py bvh   mario.sanim mario.shier -o out_dir
  python3 strikers_anim.py json  mario.sanim mario.shier -o mario.json

Blender usage (4.2 or newer):
  blender --python strikers_anim.py -- mario.sanim mario.shier [options]
  or install this file as an add-on: File > Import > Mario Strikers (.sanim)
"""

bl_info = {
    "name": "Mario Strikers animations (.sanim)",
    "author": "smstrikers-decomp format notes",
    "version": (1, 0, 0),
    "blender": (4, 2, 0),
    "location": "File > Import > Mario Strikers (.sanim)",
    "description": "Imports Super Mario Strikers skeletons and animations",
    "category": "Import-Export",
}

import argparse
import json
import math
import os
import re
import struct
import sys

FPS = 30  # cSAnim::GetDuration: m_nNumKeys / 30

CHUNK_SANIM = 0x80017000
CHUNK_SANIM_NODE = 0x80017100
CHUNK_SANIM_PAD = 0x00001001
CHUNK_ROT = 0x00017101
CHUNK_TRANS = 0x00017102
CHUNK_SCALE = 0x00017103
CHUNK_RETARGET = 0x80017104
CHUNK_SHIER = 0x80018000

PROP_ROT_Z_ONLY = 0x1
PROP_ROT_CONST = 0x2
PROP_TRANS_CONST = 0x4
PROP_SCALE_CONST = 0x8

ROT_SCALE = 1.0 / 16384.0  # 0.000061035156f
SCALE_SCALE = 1.0 / 4096.0  # 0.000244140625f
U16_TO_RAD = 2.0 * math.pi / 65536.0  # 0.0000958738f


class FormatError(Exception):
    pass


# ---------------------------------------------------------------- hashing

def string_hash(s):
    """nlStringHash: used for clip and skeleton names."""
    h = 0xFFFFFFFF
    for c in s.encode("latin-1"):
        h = (h + (h << 5) + c) & 0xFFFFFFFF
    return h


def string_lower_hash(s):
    """nlStringLowerHash: used for bone (node) IDs."""
    return string_hash(s.lower())


def _biped_names():
    """3ds Max Character Studio names, which the game's skeletons use."""
    names = ["bip01", "bip01 pelvis", "bip01 neck", "bip01 neck1", "bip01 head",
             "bip01 headnub", "bip01 footsteps", "bip01 prop1", "bip01 prop2"]
    names += ["bip01 spine"] + ["bip01 spine%d" % i for i in range(1, 5)]
    for chain in ("ponytail", "ponytail1", "ponytail2", "tail", "xtra"):
        names += ["bip01 %s" % chain] + ["bip01 %s%d" % (chain, i) for i in range(1, 10)]
        names += ["bip01 %snub" % chain]
    for side in ("l", "r"):
        p = "bip01 %s " % side
        names += [p + n for n in ("clavicle", "upperarm", "forearm", "hand", "upperarmtwist",
                                  "forearmtwist", "thigh", "calf", "foot", "horselink",
                                  "toe0", "toe01", "toe02", "toe0nub", "handnub")]
        for f in range(5):
            names += [p + "finger%d" % f, p + "finger%d1" % f, p + "finger%d2" % f,
                      p + "finger%dnub" % f]
    extras = ["ball", "root", "prop", "hat", "cap", "jaw", "mouth", "nose", "tongue",
              "eyes", "l eye", "r eye", "eye l", "eye r", "shell", "tail", "camera"]
    return [n.title() for n in names] + extras


class NameBook:
    """Turns 32-bit node IDs back into bone names."""

    def __init__(self):
        self.by_hash = {}
        for n in _biped_names():
            self.add(n)

    def add(self, name):
        name = name.strip()
        if name:
            self.by_hash.setdefault(string_lower_hash(name), name)

    def harvest_bytes(self, data):
        for m in re.finditer(rb"[\x20-\x7e]{3,64}", data):
            self.add(m.group().decode("ascii"))

    def harvest_path(self, path):
        paths = [path]
        if os.path.isdir(path):
            paths = [os.path.join(d, f) for d, _, fs in os.walk(path) for f in fs]
        for p in paths:
            try:
                if os.path.getsize(p) <= 64 * 1024 * 1024:
                    with open(p, "rb") as fh:
                        self.harvest_bytes(fh.read())
            except OSError:
                pass

    def name(self, node_id):
        return self.by_hash.get(node_id, "node_%08x" % node_id)


# ---------------------------------------------------------------- chunks

class Chunk:
    """nlChunk: 8-byte big-endian header (ID, size) followed by data.

    Bits 0x7F000000 of the ID hold the data alignment as a power of two;
    bit 0x80000000 marks a chunk whose data is a list of child chunks.
    """

    def __init__(self, buf, off, limit):
        if off + 8 > limit:
            raise FormatError("chunk header past end at 0x%x" % off)
        self.buf = buf
        self.off = off
        self.raw_id, self.size = struct.unpack_from(">II", buf, off)
        self.id = self.raw_id & 0x80FFFFFF
        exp = (self.raw_id >> 24) & 0x7F
        self.data = off + 8
        if exp:
            align = 1 << exp
            self.data = (off + 8 + align - 1) & ~(align - 1)
        self.next = off + 8 + self.size
        if self.next > limit:
            raise FormatError("chunk 0x%08x at 0x%x overruns its parent" % (self.raw_id, off))

    def children(self):
        off = self.off + 8
        while off + 8 <= self.next:  # a few trailing bytes are padding, not a chunk
            c = Chunk(self.buf, off, self.next)
            yield c
            off = c.next


def top_level_chunks(buf):
    off = 0
    while off + 8 <= len(buf):
        c = Chunk(buf, off, len(buf))
        yield c
        if c.next <= off:
            raise FormatError("zero-length chunk at 0x%x" % off)
        off = c.next


def _u32(buf, off):
    return struct.unpack_from(">I", buf, off)[0]


def _cstr(buf, off):
    end = buf.index(b"\0", off)
    return buf[off:end].decode("latin-1")


# ---------------------------------------------------------------- skeleton

class Skeleton:
    def __init__(self, buf, chunk):
        kids = list(chunk.children())
        if len(kids) < 11:
            raise FormatError("skeleton chunk has %d parts, expected 11" % len(kids))
        hdr = kids[0].data
        self.hash = _u32(buf, hdr + 4)
        n = self.num_nodes = struct.unpack_from(">i", buf, hdr + 8)[0]
        self.pelvis, self.spine = struct.unpack_from(">ii", buf, hdr + 0x24)
        self.name = _cstr(buf, kids[1].data)
        self.node_ids = list(struct.unpack_from(">%dI" % n, buf, kids[2].data))
        self.parents = list(struct.unpack_from(">%di" % n, buf, kids[3].data))
        self.num_children = list(struct.unpack_from(">%di" % n, buf, kids[4].data))
        # kids[5] child pointer table, kids[6] push/pop flags: rebuilt at runtime
        self.mirror = list(struct.unpack_from(">%di" % n, buf, kids[8].data))
        flat = struct.unpack_from(">%df" % (3 * n), buf, kids[9].data)
        self.offsets = [flat[i * 3:i * 3 + 3] for i in range(n)]
        self.preserve = list(buf[kids[10].data:kids[10].data + n])
        for i, p in enumerate(self.parents):
            if p >= i:
                raise FormatError("node %d has parent %d: nodes are not in depth-first order" % (i, p))
            if not -1 <= self.mirror[i] < n:
                self.mirror[i] = i


# ---------------------------------------------------------------- animation

class Clip:
    def __init__(self, buf, chunk):
        kids = list(chunk.children())
        if len(kids) < 7:
            raise FormatError("animation chunk too short")
        hdr = kids[0].data
        self.buf = buf
        self.hash = _u32(buf, hdr + 4)
        self.num_keys, self.num_nodes, self.num_morphs = struct.unpack_from(">III", buf, hdr + 8)
        self.num_root_keys = _u32(buf, hdr + 0x24)
        self.signature = _u32(buf, hdr + 0x44)
        self.name = _cstr(buf, kids[1].data)
        nr = self.num_root_keys
        self.root_rot = list(struct.unpack_from(">%dH" % nr, buf, kids[5].data)) if nr else []
        flat = struct.unpack_from(">%df" % (3 * nr), buf, kids[6].data) if nr else ()
        self.root_trans = [flat[i * 3:i * 3 + 3] for i in range(nr)]

        self.rot = [None] * self.num_nodes
        self.trans = [None] * self.num_nodes
        self.scale = [None] * self.num_nodes
        node = 0
        i = 7
        while i < len(kids) and kids[i].id in (CHUNK_SANIM_NODE, CHUNK_SANIM_PAD):
            if kids[i].id == CHUNK_SANIM_NODE:
                for sub in kids[i].children():
                    if node >= self.num_nodes:
                        break
                    if sub.id == CHUNK_ROT:
                        self.rot[node] = sub.data
                    elif sub.id == CHUNK_TRANS:
                        self.trans[node] = sub.data
                    elif sub.id == CHUNK_SCALE:
                        self.scale[node] = sub.data
                node += 1
            i += 1
        rest = kids[i:]
        if len(rest) < 4:
            raise FormatError("clip %r: missing morph or node-property tables" % self.name)
        nm = self.num_morphs
        self.morph_counts = list(struct.unpack_from(">%dI" % nm, buf, rest[0].data)) if nm else []
        self.morph_ids = list(struct.unpack_from(">%dI" % nm, buf, rest[1].data)) if nm else []
        self.morph_keys = rest[2].data
        self.props = list(struct.unpack_from(">%dI" % self.num_nodes, buf, rest[3].data))
        self.linear_speed = 0.0
        if nr:
            a, b = self.root_trans[0], self.root_trans[-1]
            self.linear_speed = math.dist(a, b) / (self.num_keys / FPS) if self.num_keys else 0.0

    @property
    def duration(self):
        return self.num_keys / FPS

    def rot_key(self, node, k):
        """Local rotation quaternion (w, x, y, z) or None when the node has no rotation track."""
        off = self.rot[node]
        if off is None or node >= self.num_nodes:
            return None
        props = self.props[node]
        idx = 0 if props & PROP_ROT_CONST else k
        if props & PROP_ROT_Z_ONLY:
            a = struct.unpack_from(">H", self.buf, off + 2 * idx)[0] * U16_TO_RAD
            return (math.cos(a / 2), 0.0, 0.0, math.sin(a / 2))
        x, y, z, w = struct.unpack_from(">4h", self.buf, off + 8 * idx)
        return (w * ROT_SCALE, x * ROT_SCALE, y * ROT_SCALE, z * ROT_SCALE)

    def trans_key(self, node, k):
        off = self.trans[node]
        if off is None or node >= self.num_nodes:
            return None
        idx = 0 if self.props[node] & PROP_TRANS_CONST else k
        return struct.unpack_from(">3f", self.buf, off + 12 * idx)

    def scale_key(self, node, k):
        off = self.scale[node]
        if off is None or node >= self.num_nodes:
            return None
        idx = 0 if self.props[node] & PROP_SCALE_CONST else k
        return tuple(v * SCALE_SCALE for v in struct.unpack_from(">3h", self.buf, off + 6 * idx))

    def root_key(self, k):
        """Root motion at key k as (x, y, z, yaw_u16), like GetRootTrans/GetRootRot."""
        nr = self.num_root_keys
        if not nr:
            return (0.0, 0.0, 0.0, 0)
        t = k / (self.num_keys - 1) if self.num_keys > 1 else 1.0
        if t >= 1.0 or nr == 1:
            return tuple(self.root_trans[-1]) + (self.root_rot[-1],)
        real = t * (nr - 1)
        i = int(real)
        f = real - i
        a, b = self.root_trans[i], self.root_trans[i + 1]
        pos = tuple((1 - f) * a[j] + f * b[j] for j in range(3))
        diff = (self.root_rot[i + 1] - self.root_rot[i] + 0x8000) % 0x10000 - 0x8000
        return pos + ((self.root_rot[i] + int(f * diff)) & 0xFFFF,)


class Retargets:
    """AnimRetargetList: per source-skeleton signature, a map skeleton node -> clip node."""

    def __init__(self, buf, chunk):
        # 0x17105 header, then a nested 0x80017106 holding the 12-byte entry table (0x17107)
        # followed by one s16 map per entry (0x17108). The game reaches the table at +0x10.
        kids = list(chunk.children())
        count = struct.unpack_from(">i", buf, kids[0].data + 8)[0]
        parts = []
        for k in kids[1:]:
            parts += list(k.children()) if k.raw_id & 0x80000000 else [k]
        if count and len(parts) < 1 + count:
            raise FormatError("retarget table lists %d maps but holds %d" % (count, len(parts) - 1))
        self.maps = {}
        for i in range(count):
            sig, nbones = struct.unpack_from(">Ii", buf, parts[0].data + 12 * i)
            self.maps[sig] = list(struct.unpack_from(">%dh" % nbones, buf, parts[1 + i].data))


def load_chunks(path, wanted):
    with open(path, "rb") as fh:
        buf = fh.read()
    found = [c for c in top_level_chunks(buf) if c.id == wanted]
    if not found:
        ids = sorted({"0x%08x" % c.id for c in top_level_chunks(buf)})
        raise FormatError("%s: no chunk 0x%08x (found %s)" % (path, wanted, ", ".join(ids) or "none"))
    return buf, found


def load_skeletons(path):
    buf, chunks = load_chunks(path, CHUNK_SHIER)
    return [Skeleton(buf, c) for c in chunks]


def load_clips(path):
    buf, chunks = load_chunks(path, CHUNK_SANIM)
    return [Clip(buf, c) for c in chunks]


def load_retargets(path):
    buf, chunks = load_chunks(path, CHUNK_RETARGET)
    maps = {}
    for c in chunks:
        maps.update(Retargets(buf, c).maps)
    return maps


# ---------------------------------------------------------------- posing

def _quat_norm(q):
    n = math.sqrt(sum(c * c for c in q)) or 1.0
    return tuple(c / n for c in q)


def _mirror_rot(q, node, skel):
    """cPoseAccumulator::BlendRot with bMirror. q is (w, x, y, z)."""
    w, x, y, z = q
    if node in (skel.spine, skel.pelvis):
        x, y, z, w = -w, z, y, -x
    elif node < skel.pelvis:
        x, z = -x, -z
    else:
        x, y = -x, -y
    return (w, x, y, z)


def _mirror_trans(t, node, skel):
    """cPoseAccumulator::BlendTrans with bMirror."""
    x, y, z = t
    if node <= skel.pelvis or node == skel.spine:
        return (x, -y, z)
    return (x, y, -z)


class Pose:
    """Evaluates a clip on a skeleton key by key, the way cPN_SAnimController does."""

    def __init__(self, clip, skel, retargets=None, mirror=False):
        self.clip = clip
        self.skel = skel
        self.mirror = mirror
        self.remap = (retargets or {}).get(clip.signature)

    def source_node(self, i):
        src = self.skel.mirror[i] if self.mirror else i
        if src < 0:
            return -1
        if self.remap is not None:
            return self.remap[src] if src < len(self.remap) else -1
        return src

    def local(self, i, k):
        """Local (translation, rotation wxyz, scale) of skeleton node i at key k."""
        skel, clip = self.skel, self.clip
        src = self.source_node(i)
        if src == -1:
            return tuple(skel.offsets[i]), (1.0, 0.0, 0.0, 0.0), (1.0, 1.0, 1.0)
        q = clip.rot_key(src, k) if src < clip.num_nodes else None
        if q is None:
            q = (1.0, 0.0, 0.0, 0.0)
        elif self.mirror and not clip.props[src] & PROP_ROT_Z_ONLY:
            q = _mirror_rot(q, i, skel)
        if skel.preserve[i]:
            t = tuple(skel.offsets[i])
        else:
            t = clip.trans_key(src, k) if src < clip.num_nodes else None
            if t is None:
                t = (0.0, 0.0, 0.0)
            elif self.mirror:
                t = _mirror_trans(t, i, skel)
        s = (clip.scale_key(src, k) if src < clip.num_nodes else None) or (1.0, 1.0, 1.0)
        return tuple(t), _quat_norm(q), tuple(s)

    def root(self, k):
        """Root motion relative to the first key: (x, y, z) and yaw in radians."""
        x0, y0, z0, r0 = self.clip.root_key(0)
        x, y, z, r = self.clip.root_key(k)
        a = -r0 * U16_TO_RAD
        dx, dy = x - x0, y - y0
        lx, ly = dx * math.cos(a) - dy * math.sin(a), dx * math.sin(a) + dy * math.cos(a)
        yaw = ((r - r0 + 0x8000) % 0x10000 - 0x8000) * U16_TO_RAD
        if self.mirror:
            ly, yaw = -ly, -yaw
        return (lx, ly, z - z0), yaw


def rest_offsets(skel, clips, retargets=None):
    """Rest translations: the skeleton's own offsets, or the first clip's first key if those are empty."""
    if any(abs(c) > 1e-6 for o in skel.offsets for c in o) or not clips:
        return [tuple(o) for o in skel.offsets]
    pose = Pose(clips[0], skel, retargets)
    return [pose.local(i, 0)[0] for i in range(skel.num_nodes)]


# ---------------------------------------------------------------- state table

def clip_states(clip_name):
    return ANIM_STATES.get(clip_name, [])


# ---------------------------------------------------------------- BVH / JSON

def _quat_to_mat(q):
    w, x, y, z = q
    return [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
            [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
            [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]]


def _mat_to_euler_zxy(m):
    """Angles (z, x, y) in degrees with R = Rz * Rx * Ry, the BVH 'Zrotation Xrotation Yrotation' order."""
    sx = max(-1.0, min(1.0, m[2][1]))
    x = math.asin(sx)
    if abs(sx) < 0.99999:
        z = math.atan2(-m[0][1], m[1][1])
        y = math.atan2(-m[2][0], m[2][2])
    else:
        z = math.atan2(m[1][0], m[0][0])
        y = 0.0
    return [math.degrees(z), math.degrees(x), math.degrees(y)]


def _unwrap(prev, cur):
    if prev is None:
        return cur
    return [c + 360.0 * round((p - c) / 360.0) for p, c in zip(prev, cur)]


def write_bvh(path, clip, skel, names, retargets=None, mirror=False, root_motion=True):
    pose = Pose(clip, skel, retargets, mirror)
    rest = rest_offsets(skel, [clip], retargets)
    n = skel.num_nodes
    kids = [[] for _ in range(n)]
    roots = []
    for i, p in enumerate(skel.parents):
        (kids[p] if p >= 0 else roots).append(i)
    lines = ["HIERARCHY"]
    order = []
    chan = "6 Xposition Yposition Zposition Zrotation Xrotation Yrotation"

    def joint(i, depth, keyword):
        pad = "  " * depth
        o = rest[i]
        lines.append("%s%s %s" % (pad, keyword, names.name(skel.node_ids[i]).replace(" ", "_")))
        lines.append(pad + "{")
        lines.append("%s  OFFSET %.6f %.6f %.6f" % (pad, o[0], o[1], o[2]))
        lines.append("%s  CHANNELS %s" % (pad, chan))
        order.append(i)
        for c in kids[i]:
            joint(c, depth + 1, "JOINT")
        if not kids[i]:
            lines.append("%s  End Site" % pad)
            lines.append("%s  {" % pad)
            lines.append("%s    OFFSET 0.000000 0.050000 0.000000" % pad)
            lines.append("%s  }" % pad)
        lines.append(pad + "}")

    use_root = root_motion and clip.num_root_keys > 0
    if use_root:
        lines += ["ROOT root_motion", "{", "  OFFSET 0.000000 0.000000 0.000000", "  CHANNELS " + chan]
        order.append("root")
        for r in roots:
            joint(r, 1, "JOINT")
        lines.append("}")
    else:
        for r in roots:
            joint(r, 0, "ROOT")
    lines += ["MOTION", "Frames: %d" % clip.num_keys, "Frame Time: %.8f" % (1.0 / FPS)]
    prev = {}
    for k in range(clip.num_keys):
        row = []
        for i in order:
            if i == "root":
                t, yaw = pose.root(k)
                eul = [math.degrees(yaw), 0.0, 0.0]
            else:
                t, q, _ = pose.local(i, k)
                eul = _mat_to_euler_zxy(_quat_to_mat(q))
            eul = _unwrap(prev.get(i), eul)
            prev[i] = eul
            row += list(t) + eul
        lines.append(" ".join("%.6f" % v for v in row))
    with open(path, "w") as fh:
        fh.write("\n".join(lines) + "\n")


def dump_json(clips, skel, names, retargets=None):
    out = {
        "skeleton": {
            "name": skel.name,
            "nodes": [{"index": i, "id": "0x%08x" % skel.node_ids[i], "name": names.name(skel.node_ids[i]),
                       "parent": skel.parents[i], "mirror": skel.mirror[i], "offset": list(skel.offsets[i]),
                       "preserve_length": bool(skel.preserve[i])} for i in range(skel.num_nodes)],
            "pelvis": skel.pelvis, "spine": skel.spine,
        },
        "clips": [],
    }
    for c in clips:
        pose = Pose(c, skel, retargets)
        out["clips"].append({
            "name": c.name, "keys": c.num_keys, "duration_s": round(c.duration, 4),
            "nodes": c.num_nodes, "morph_channels": c.num_morphs, "signature": "0x%08x" % c.signature,
            "linear_speed_mps": round(c.linear_speed, 4),
            "states": [s[0] for s in clip_states(c.name)],
            "frames": [[[list(v) for v in pose.local(i, k)] for i in range(skel.num_nodes)]
                       for k in range(c.num_keys)],
        })
    return out


# ---------------------------------------------------------------- Blender

def _blender_fcurve_bag(action, obj):
    """FCurve container for Blender 4.4+ (slotted actions) or the older flat action.fcurves."""
    if hasattr(action, "slots"):
        from bpy_extras import anim_utils
        slot = action.slots.new(id_type="OBJECT", name=obj.name)
        bag = anim_utils.action_ensure_channelbag_for_slot(action, slot)
        return bag, slot
    return action, None


def _blender_add_curve(bag, path, index, group, frames, values, interp_linear):
    fc = bag.fcurves.new(path, index=index)
    fc.group = bag.groups.get(group) or bag.groups.new(group)
    if all(abs(v - values[0]) < 1e-6 for v in values):
        frames, values = frames[:1], values[:1]
    fc.keyframe_points.add(len(frames))
    co = [0.0] * (2 * len(frames))
    co[0::2] = frames
    co[1::2] = values
    fc.keyframe_points.foreach_set("co", co)
    try:
        fc.keyframe_points.foreach_set("interpolation", [interp_linear] * len(frames))
    except (TypeError, AttributeError):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    fc.update()


def import_into_blender(sanim, shier, retarget=None, names_from=(), mirrored=False,
                        root_motion=True, only=None, skeleton_name=None, report=print):
    import bpy

    names = NameBook()
    for p in names_from:
        names.harvest_path(p)
    skels = load_skeletons(shier)
    skel = skels[0]
    if skeleton_name:
        match = [s for s in skels if s.name.lower() == skeleton_name.lower()]
        if not match:
            raise FormatError("skeleton %r not in %s (has %s)" % (skeleton_name, shier, ", ".join(s.name for s in skels)))
        skel = match[0]
    clips = load_clips(sanim)
    if only:
        rx = re.compile(only)
        clips = [c for c in clips if rx.search(c.name) or any(rx.search(s[0]) for s in clip_states(c.name))]
    retargets = load_retargets(retarget) if retarget else None

    # Armature: every bone points along +Y with roll 0, so its rest orientation is the identity
    # and the game's local rotations can be keyed unchanged.
    rest = rest_offsets(skel, clips, retargets)
    arm = bpy.data.armatures.new(skel.name)
    obj = bpy.data.objects.new(skel.name, arm)
    bpy.context.scene.collection.objects.link(obj)
    for o in bpy.context.selected_objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    heads = []
    bone_names = []
    used = set()
    for i in range(skel.num_nodes):
        nm = names.name(skel.node_ids[i])
        while nm in used:
            nm += "_"
        used.add(nm)
        bone_names.append(nm)
    root_name = "root_motion"
    if root_motion:
        rb = arm.edit_bones.new(root_name)
        rb.head, rb.tail = (0, 0, 0), (0, 0.15, 0)
    for i in range(skel.num_nodes):
        p = skel.parents[i]
        base = heads[p] if p >= 0 else (0.0, 0.0, 0.0)
        head = tuple(base[j] + rest[i][j] for j in range(3))
        heads.append(head)
        eb = arm.edit_bones.new(bone_names[i])
        eb.head = head
        eb.tail = (head[0], head[1] + 0.04, head[2])
        eb.roll = 0.0
        if p >= 0:
            eb.parent = arm.edit_bones[bone_names[p]]
        elif root_motion:
            eb.parent = arm.edit_bones[root_name]
        eb.inherit_scale = "NONE"  # the game scales only the child's offset, not its frame
        eb["strikers_node"] = i
        eb["strikers_id"] = "0x%08x" % skel.node_ids[i]
    bpy.ops.object.mode_set(mode="POSE")
    for pb in obj.pose.bones:
        pb.rotation_mode = "QUATERNION"
    bpy.ops.object.mode_set(mode="OBJECT")

    scene = bpy.context.scene
    scene.render.fps = FPS
    scene.render.fps_base = 1.0
    obj.animation_data_create()
    prefs = bpy.context.preferences.edit
    old_interp = prefs.keyframe_new_interpolation_type
    prefs.keyframe_new_interpolation_type = "LINEAR"
    linear = 1  # enum index of 'LINEAR' in Keyframe.interpolation
    first = None
    variants = [False, True] if mirrored else [False]
    try:
        for clip in clips:
            for mir in variants:
                pose = Pose(clip, skel, retargets, mir)
                act = bpy.data.actions.new(clip.name + ("_mirror" if mir else ""))
                act.use_fake_user = True
                act.frame_range = (1, max(2, clip.num_keys))
                states = clip_states(clip.name)
                act["strikers_states"] = ", ".join(s[0] for s in states if s[4] == mir) or "-"
                act["strikers_keys"] = clip.num_keys
                act["strikers_linear_speed"] = clip.linear_speed
                if states:
                    act["strikers_play_mode"] = states[0][2]
                    act["strikers_ball_rotation"] = states[0][5]
                bag, slot = _blender_fcurve_bag(act, obj)
                frames = [float(k + 1) for k in range(clip.num_keys)]
                for i in range(skel.num_nodes):
                    locs, rots, scls = [], [], []
                    prev = None
                    for k in range(clip.num_keys):
                        t, q, s = pose.local(i, k)
                        if prev is not None and sum(a * b for a, b in zip(prev, q)) < 0:
                            q = tuple(-c for c in q)
                        prev = q
                        locs.append(tuple(t[j] - rest[i][j] for j in range(3)))
                        rots.append(q)
                        scls.append(s)
                    base = 'pose.bones["%s"].' % bone_names[i].replace('"', '\\"')
                    for j in range(3):
                        _blender_add_curve(bag, base + "location", j, bone_names[i], frames, [v[j] for v in locs], linear)
                    for j in range(4):
                        _blender_add_curve(bag, base + "rotation_quaternion", j, bone_names[i], frames, [v[j] for v in rots], linear)
                    if any(abs(c - 1.0) > 1e-4 for v in scls for c in v):
                        for j in range(3):
                            _blender_add_curve(bag, base + "scale", j, bone_names[i], frames, [v[j] for v in scls], linear)
                if root_motion and clip.num_root_keys:
                    rl, rr = [], []
                    for k in range(clip.num_keys):
                        t, yaw = pose.root(k)
                        rl.append(t)
                        rr.append((math.cos(yaw / 2), 0.0, 0.0, math.sin(yaw / 2)))
                    base = 'pose.bones["%s"].' % root_name
                    for j in range(3):
                        _blender_add_curve(bag, base + "location", j, root_name, frames, [v[j] for v in rl], linear)
                    for j in range(4):
                        _blender_add_curve(bag, base + "rotation_quaternion", j, root_name, frames, [v[j] for v in rr], linear)
                if first is None:
                    first = (act, slot, clip)
    finally:
        prefs.keyframe_new_interpolation_type = old_interp

    if first:
        act, slot, clip = first
        obj.animation_data.action = act
        if slot is not None:
            obj.animation_data.action_slot = slot
        scene.frame_start, scene.frame_end = 1, max(2, clip.num_keys)
    unnamed = sum(1 for n in bone_names if n.startswith("node_"))
    report("Imported skeleton %r (%d bones, %d without a known name) and %d clips"
           % (skel.name, skel.num_nodes, unnamed, len(clips) * len(variants)))
    return obj


def _register_addon():
    import bpy
    from bpy.props import BoolProperty, StringProperty
    from bpy_extras.io_utils import ImportHelper

    class IMPORT_OT_strikers_sanim(bpy.types.Operator, ImportHelper):
        """Import a Super Mario Strikers skeleton and its animations"""
        bl_idname = "import_anim.strikers_sanim"
        bl_label = "Import Mario Strikers (.sanim)"
        bl_options = {"REGISTER", "UNDO"}
        filename_ext = ".sanim"
        filter_glob: StringProperty(default="*.sanim", options={"HIDDEN"})
        shier: StringProperty(name="Skeleton (.shier)", description="Empty: same folder and name as the .sanim", subtype="FILE_PATH")
        retarget: StringProperty(name="Retarget (.bin)", description="Optional animretarget table", subtype="FILE_PATH")
        names_from: StringProperty(name="Bone names from", description="main.dol or the extracted disc folder, to recover bone names", subtype="FILE_PATH")
        only: StringProperty(name="Only clips matching", description="Regular expression on clip or state names, e.g. run|shoot")
        mirrored: BoolProperty(name="Also mirrored copies", default=False)
        root_motion: BoolProperty(name="Root motion bone", default=True)

        def execute(self, context):
            sanim = self.filepath
            shier = self.shier or os.path.splitext(sanim)[0] + ".shier"
            try:
                import_into_blender(sanim, shier, self.retarget or None,
                                    [self.names_from] if self.names_from else [],
                                    self.mirrored, self.root_motion, self.only or None,
                                    report=lambda m: self.report({"INFO"}, m))
            except (FormatError, OSError, struct.error) as e:
                self.report({"ERROR"}, str(e))
                return {"CANCELLED"}
            return {"FINISHED"}

    def menu(self, context):
        self.layout.operator(IMPORT_OT_strikers_sanim.bl_idname, text="Mario Strikers (.sanim)")

    bpy.utils.register_class(IMPORT_OT_strikers_sanim)
    bpy.types.TOPBAR_MT_file_import.append(menu)
    _register_addon.cls, _register_addon.menu = IMPORT_OT_strikers_sanim, menu


def register():
    _register_addon()


def unregister():
    import bpy
    bpy.types.TOPBAR_MT_file_import.remove(_register_addon.menu)
    bpy.utils.unregister_class(_register_addon.cls)


# ---------------------------------------------------------------- CLI

def _common_args(ap):
    ap.add_argument("sanim", help="animation bundle, e.g. art/animation/mario.sanim")
    ap.add_argument("shier", nargs="?", help="skeleton, default: same name with .shier")
    ap.add_argument("--retarget", help="animretarget .bin, e.g. art/characters/mario/animretarget/mario.bin")
    ap.add_argument("--names-from", action="append", default=[], metavar="PATH",
                    help="file or folder to harvest bone names from (main.dol, extracted disc); repeatable")
    ap.add_argument("--skeleton", help="skeleton name when the .shier holds several")
    ap.add_argument("--only", help="regex on clip or state names")


def _load_cli(a):
    shier = a.shier or os.path.splitext(a.sanim)[0] + ".shier"
    skels = load_skeletons(shier)
    skel = next((s for s in skels if a.skeleton and s.name.lower() == a.skeleton.lower()), skels[0])
    clips = load_clips(a.sanim)
    if a.only:
        rx = re.compile(a.only)
        clips = [c for c in clips if rx.search(c.name) or any(rx.search(s[0]) for s in clip_states(c.name))]
    names = NameBook()
    for p in a.names_from:
        names.harvest_path(p)
    retargets = load_retargets(a.retarget) if a.retarget else None
    return skels, skel, clips, names, retargets


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    p_info = sub.add_parser("info", help="list the skeleton and the clips")
    _common_args(p_info)
    p_bvh = sub.add_parser("bvh", help="write one .bvh per clip")
    _common_args(p_bvh)
    p_bvh.add_argument("-o", "--out", default="bvh_out")
    p_bvh.add_argument("--mirror", action="store_true", help="write the mirrored version instead")
    p_bvh.add_argument("--no-root-motion", action="store_true")
    p_json = sub.add_parser("json", help="dump everything decoded as JSON")
    _common_args(p_json)
    p_json.add_argument("-o", "--out", default="-")
    a = ap.parse_args(argv)
    try:
        skels, skel, clips, names, retargets = _load_cli(a)
    except (FormatError, OSError, struct.error) as e:
        print("error: %s" % e, file=sys.stderr)
        return 1

    if a.cmd == "info":
        for s in skels:
            known = sum(1 for nid in s.node_ids if not names.name(nid).startswith("node_"))
            print("skeleton %-16s %3d nodes, %d named, pelvis=%d spine=%d"
                  % (s.name, s.num_nodes, known, s.pelvis, s.spine))
        print()
        for i in range(skel.num_nodes):
            depth, p = 0, skel.parents[i]
            while p >= 0:
                depth, p = depth + 1, skel.parents[p]
            print("  %3d %s%s" % (i, "  " * depth, names.name(skel.node_ids[i])))
        print()
        remapped = 0
        for c in clips:
            states = ", ".join(s[0] for s in clip_states(c.name)) or "-"
            rt = ""
            if retargets is not None and c.signature in retargets:
                rt, remapped = " [retarget]", remapped + 1
            elif c.num_nodes != skel.num_nodes:
                rt = " [nodes %d != %d]" % (c.num_nodes, skel.num_nodes)
            print("%-40s %4d keys %5.2fs  %s%s" % (c.name, c.num_keys, c.duration, states, rt))
        print("\n%d clips" % len(clips))
    elif a.cmd == "bvh":
        os.makedirs(a.out, exist_ok=True)
        for c in clips:
            fn = re.sub(r"[^\w.-]", "_", c.name) + ("_mirror" if a.mirror else "") + ".bvh"
            write_bvh(os.path.join(a.out, fn), c, skel, names, retargets, a.mirror, not a.no_root_motion)
        print("wrote %d files to %s" % (len(clips), a.out))
    elif a.cmd == "json":
        data = json.dumps(dump_json(clips, skel, names, retargets), indent=1)
        if a.out == "-":
            print(data)
        else:
            with open(a.out, "w") as fh:
                fh.write(data)
    return 0


def _blender_cli(argv):
    ap = argparse.ArgumentParser(prog="blender --python strikers_anim.py --")
    _common_args(ap)
    ap.add_argument("--mirrored", action="store_true", help="also create the mirrored copy of each clip")
    ap.add_argument("--no-root-motion", action="store_true")
    ap.add_argument("--save", help="save the .blend here and quit")
    a = ap.parse_args(argv)
    shier = a.shier or os.path.splitext(a.sanim)[0] + ".shier"
    import_into_blender(a.sanim, shier, a.retarget, a.names_from, a.mirrored,
                        not a.no_root_motion, a.only, a.skeleton)
    if a.save:
        import bpy
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.save))


# Generated from src/Game/AnimProps/*.cpp (smstrikers-decomp d1f357f).
# clip -> [(state, table, play_mode, blend_s, mirrored, ball_rotation, end_phase, match_speed)]
ANIM_STATES = {
    'anticipate': [('GANIM_CROUCH', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'arm_powerup': [('ANIM_THROW_POWERUP_LEFT', 'fielder', 'hold', 0.0, True, 'velocity', 0, False), ('ANIM_THROW_POWERUP_RIGHT', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'arm_powerup_600': [('ANIM_THROW_POWERUP_LEFT_BACK', 'fielder', 'hold', 0.0, True, 'velocity', 0, False), ('ANIM_THROW_POWERUP_RIGHT_BACK', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'attack_s2s_high': [('GANIM_S2S_ATTACK_HIGH', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'backwards_to_forwards_recover': [('ANIM_RUN_STRAFE_BACK_2_FRONT_RECOVER', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'backwards_to_forwards_start': [('ANIM_RUN_STRAFE_BACK_2_FRONT_START', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'backwards_to_forwards_stop': [('ANIM_RUN_STRAFE_BACK_STOP', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'ball_swat': [('GANIM_SWAT_BALL_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_SWAT_BALL_L', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'banana_peel_react_1200': [('ANIM_BANANA_REACT_1200', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'banana_peel_react_600': [('ANIM_BANANA_REACT_600', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'bomb_react_1200': [('ANIM_BOMB_REACT_1200', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'bomb_react_600': [('ANIM_BOMB_REACT_600', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'captain_shoot_to_score': [('ANIM_SHOOT_TO_SCORE', 'fielder', 'hold', 0.1, False, 'animated', 0, False), ('ANIM_SHOOT_TO_SCORE_LEFT', 'fielder', 'hold', 0.1, True, 'animated', 0, False)],
    'catch_above': [('GANIM_PICKUP_ABOVE', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'catch_high': [('GANIM_CATCH_HI', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'catch_high_jump': [('GANIM_CATCH_HI_JMP', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'catch_low': [('GANIM_CATCH_LO', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'catch_med': [('GANIM_CATCH_MD', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'catch_miss_chip': [('GANIM_MISS_CHIP_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_MISS_CHIP_L', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'catch_miss_chip_short': [('GANIM_MISS_CHIP_SHORT_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_MISS_CHIP_SHORT_L', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'catch_right_high': [('GANIM_CATCH_R_HI', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_CATCH_L_HI', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'catch_right_high_jump': [('GANIM_CATCH_R_HI_JMP', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_CATCH_L_HI_JMP', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'catch_right_low': [('GANIM_CATCH_R_LO', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_CATCH_L_LO', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'catch_right_med': [('GANIM_CATCH_R_MD', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_CATCH_L_MD', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'catch_super_high_jump': [('GANIM_CATCH_XHI_JMP', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'catch_super_right_high_jump': [('GANIM_CATCH_R_XHI_JMP', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_CATCH_L_XHI_JMP', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dejected_01': [('GANIM_DEJECTED1', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'dejected_02': [('GANIM_DEJECTED2', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'dejected_03': [('GANIM_DEJECTED3', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'dejected_04': [('GANIM_DEJECTED4', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'dejected_05': [('GANIM_DEJECTED5', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'deke_300': [('ANIM_DEKE_900', 'fielder', 'hold', 0.133, True, 'animated', 0, False), ('ANIM_DEKE_300', 'fielder', 'hold', 0.133, False, 'animated', 0, False)],
    'dive_catch_600': [('GANIM_DIVE_PICKUP_L180', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_PICKUP_R180', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dive_catch_900': [('GANIM_DIVE_PICKUP_L90', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_PICKUP_R90', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dive_catch_back': [('GANIM_PICKUP_BACK', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'dive_catch_far_right_high': [('GANIM_DIVE_CATCH_R_HI_FAR', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_CATCH_L_HI_FAR', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dive_catch_far_right_high_special_twist': [('GANIM_DIVE_CATCH_R_HI_SPEC', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_CATCH_L_HI_SPEC', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dive_catch_far_right_low': [('GANIM_DIVE_CATCH_R_LO_FAR', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_CATCH_L_LO_FAR', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dive_catch_far_right_med': [('GANIM_DIVE_CATCH_R_MD_FAR', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_CATCH_L_MD_FAR', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dive_catch_forward': [('GANIM_DIVE_CATCH_FWD', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'dive_catch_near_right_high': [('GANIM_DIVE_CATCH_R_HI', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_CATCH_L_HI', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dive_catch_near_right_low': [('GANIM_DIVE_CATCH_R_LO', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_CATCH_L_LO', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dive_catch_near_right_med': [('GANIM_DIVE_CATCH_R_MD', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_CATCH_L_MD', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dvng_defl_parry_far_right_high': [('GANIM_DIVE_DEFL_R_HI_FAR', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_DEFL_L_HI_FAR', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dvng_defl_parry_far_right_low': [('GANIM_DIVE_DEFL_R_LO_FAR', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_DEFL_L_LO_FAR', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dvng_defl_parry_far_right_med': [('GANIM_DIVE_DEFL_R_MD_FAR', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_DEFL_L_MD_FAR', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dvng_defl_parry_near_right_high': [('GANIM_DIVE_DEFL_R_HI', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_DEFL_L_HI', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dvng_defl_parry_near_right_low': [('GANIM_DIVE_DEFL_R_LO', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_DEFL_L_LO', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'dvng_defl_parry_near_right_med': [('GANIM_DIVE_DEFL_R_MD', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DIVE_DEFL_L_MD', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'electrocution_stage1': [('ANIM_ELECTROCUTION_1200', 'fielder', 'cyclic', 0.0, False, 'velocity', 0, False)],
    'electrocution_stage2': [('ANIM_ELECTROCUTION_FALL_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'electrocution_stage3': [('ANIM_ELECTROCUTION_LAND_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'foot_flick_fwd': [('GANIM_PICKUP_FOOT', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'hard_stop_recover_with_ball': [('ANIM_HARD_STOP_RECOVER', 'fielder', 'hold', 0.0, False, 'velocity', 0, False), ('ANIM_HARD_STOP_RECOVER_WB', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'hard_stop_turn_with_ball': [('ANIM_HARD_STOP_TURN', 'fielder', 'hold', 0.0, False, 'velocity', 0, False), ('ANIM_HARD_STOP_TURN_WB', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'hard_stop_with_ball': [('ANIM_HARD_STOP', 'fielder', 'hold', 0.133, False, 'velocity', 0, False), ('ANIM_HARD_STOP_WB', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'hit_1200': [('ANIM_HIT_1200', 'fielder', 'hold', 0.067, False, 'velocity', 1, False)],
    'hit_react_1200': [('ANIM_HIT_REACT_1200', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'hit_react_300': [('ANIM_HIT_REACT_0300', 'fielder', 'hold', 0.067, False, 'velocity', 0, False), ('ANIM_HIT_REACT_0900', 'fielder', 'hold', 0.067, True, 'velocity', 0, False)],
    'hit_react_600': [('ANIM_HIT_REACT_0600', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'idle': [('ANIM_IDLE', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False), ('ANIM_IDLE_WB', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False), ('GANIM_IDLE', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    'idle_onetimer_air_1200': [('ANIM_ONETIMER_AIR_IDLE_1200', 'fielder', 'hold', 0.0, False, 'velocity', 1, False)],
    'idle_onetimer_air_300': [('ANIM_ONETIMER_AIR_IDLE_0300', 'fielder', 'hold', 0.0, False, 'velocity', 0, False), ('ANIM_ONETIMER_AIR_IDLE_0900', 'fielder', 'hold', 0.0, True, 'velocity', 0, False)],
    'idle_onetimer_air_600': [('ANIM_ONETIMER_AIR_IDLE_0600', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'idle_onetimer_ground_1200': [('ANIM_ONETIMER_GROUND_IDLE_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'idle_onetimer_ground_300': [('ANIM_ONETIMER_GROUND_IDLE_0300', 'fielder', 'hold', 0.0, False, 'velocity', 0, False), ('ANIM_ONETIMER_GROUND_IDLE_0900', 'fielder', 'hold', 0.0, True, 'velocity', 0, False)],
    'idle_onetimer_ground_600': [('ANIM_ONETIMER_GROUND_IDLE_0600', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'idle_pass_receive_air_1200': [('ANIM_PASS_RECEIVE_VOLLEY_IDLE_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'idle_pass_receive_ground_1200': [('ANIM_PASS_RECEIVE_GROUND_IDLE_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'idle_to_run_turn_300': [('ANIM_RUN_START_1200_TURN_0300', 'fielder', 'hold', 0.1, False, 'velocity', 0, False), ('ANIM_RUN_START_1200_TURN_0900', 'fielder', 'hold', 0.1, True, 'velocity', 0, False)],
    'idle_to_run_turn_600': [('ANIM_RUN_START_1200_TURN_0600', 'fielder', 'hold', 0.1, False, 'velocity', 0, False)],
    'idle_to_run_with_ball_turn_300': [('ANIM_RUN_START_WB_300', 'fielder', 'hold', 0.133, False, 'animated', 0, False), ('ANIM_RUN_START_WB_900', 'fielder', 'hold', 0.133, True, 'animated', 0, False)],
    'idle_to_run_with_ball_turn_600': [('ANIM_RUN_START_WB_600', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'idle_turn_300': [('ANIM_IDLE_TURN_300', 'fielder', 'hold', 0.133, False, 'velocity', 0, False), ('ANIM_IDLE_TURN_900', 'fielder', 'hold', 0.133, True, 'velocity', 0, False)],
    'idle_turn_600': [('ANIM_IDLE_TURN_600', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'idle_with_ball': [('GANIM_IDLE_WB', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    'jog': [('ANIM_JOG', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, True), ('ANIM_JOG_WB', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, True)],
    'jog_forward_with_ball_1200': [('GANIM_JOG_FORWARD_WB', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    'jog_forward_with_ball_1200_left': [('GANIM_JOG_FORWARD_WB_L', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    'jog_forward_with_ball_1200_right': [('GANIM_JOG_FORWARD_WB_R', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    'kick_goal_fast': [('GANIM_RUN_KICK_GOAL', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'kick_long': [('GANIM_KICK_LONG', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'kick_posession': [('GANIM_RUN_KICK_DRIBBLE_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_RUN_KICK_DRIBBLE_L', 'goalie', 'hold', 0.1, True, 'animated', 2, False)],
    'onetimer_air_1200': [('ANIM_ONETIMER_AIR_RUN_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'onetimer_air_300': [('ANIM_ONETIMER_AIR_RUN_0300', 'fielder', 'hold', 0.0, False, 'velocity', 0, False), ('ANIM_ONETIMER_AIR_RUN_0900', 'fielder', 'hold', 0.0, True, 'velocity', 0, False)],
    'onetimer_air_600': [('ANIM_ONETIMER_AIR_RUN_0600', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'onetimer_ground_1200': [('ANIM_ONETIMER_GROUND_RUN_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'onetimer_ground_300': [('ANIM_ONETIMER_GROUND_RUN_0300', 'fielder', 'hold', 0.0, False, 'velocity', 1, False), ('ANIM_ONETIMER_GROUND_RUN_0900', 'fielder', 'hold', 0.0, True, 'velocity', 0, False)],
    'onetimer_ground_600': [('ANIM_ONETIMER_GROUND_RUN_0600', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'pass_1200': [('ANIM_PASS_1200', 'fielder', 'hold', 0.0, False, 'velocity', 1, False)],
    'pass_300': [('ANIM_PASS_0300', 'fielder', 'hold', 0.0, False, 'velocity', 1, False), ('ANIM_PASS_0900', 'fielder', 'hold', 0.0, True, 'velocity', 0, False)],
    'pass_600': [('ANIM_PASS_0600', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'pass_receive_air_1200': [('ANIM_PASS_RECEIVE_VOLLEY_RUN_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'pass_receive_air_300': [('ANIM_PASS_RECEIVE_VOLLEY_RUN_0300', 'fielder', 'hold', 0.0, False, 'velocity', 0, False), ('ANIM_PASS_RECEIVE_VOLLEY_RUN_0900', 'fielder', 'hold', 0.0, True, 'velocity', 0, False)],
    'pass_receive_air_onetimer_1200': [('ANIM_LATE_ONETIMER_FROM_VOLLEY_1200', 'fielder', 'hold', 0.0, False, 'velocity', 1, False)],
    'pass_receive_air_onetimer_300': [('ANIM_LATE_ONETIMER_FROM_VOLLEY_0300', 'fielder', 'hold', 0.0, False, 'velocity', 0, False), ('ANIM_LATE_ONETIMER_FROM_VOLLEY_0900', 'fielder', 'hold', 0.0, True, 'velocity', 0, False)],
    'pass_receive_air_onetimer_600': [('ANIM_LATE_ONETIMER_FROM_VOLLEY_0600', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'pass_receive_ground_1200': [('ANIM_PASS_RECEIVE_GROUND_RUN_1200', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'pass_receive_ground_300': [('ANIM_PASS_RECEIVE_GROUND_RUN_0300', 'fielder', 'hold', 0.0, False, 'velocity', 0, False), ('ANIM_PASS_RECEIVE_GROUND_RUN_0900', 'fielder', 'hold', 0.0, True, 'velocity', 0, False)],
    'pass_receive_ground_600': [('ANIM_PASS_RECEIVE_GROUND_RUN_0600', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'pick_up': [('GANIM_PICKUP', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'protect_front': [('GANIM_PROTECT_F', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'protect_left': [('GANIM_PROTECT_L', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'protect_right': [('GANIM_PROTECT_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'ready_idle': [('GANIM_IDLE_READY', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    'recover_dejected': [('GANIM_RECOVER_DEJECTED_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_RECOVER_DEJECTED_L', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'recover_dejected_2': [('GANIM_RECOVER_DEJECTED2_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_RECOVER_DEJECTED2_L', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'recover_dejected_loop': [('GANIM_RECOVER_DEJECTED_LOOP_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_RECOVER_DEJECTED_LOOP_L', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'recover_trap_with_ball': [('GANIM_RECOVER_TRAP_WB', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'recover_trap_without_ball': [('GANIM_RECOVER_TRAP', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'recover_with_ball_side': [('GANIM_RECOVER_R_WB', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_RECOVER_L_WB', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'recover_without_ball': [('GANIM_RECOVER_R', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_RECOVER_L', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'right_leg_low': [('GANIM_LEGSAVE_R_LO', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_LEGSAVE_L_LO', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'run_backwards': [('ANIM_RUN_0600', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, True), ('ANIM_RUN_BACKWARDS', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, True)],
    'run_backwards_to_run_forwards': [('ANIM_RUN_BACK_RUN_2_RUN', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'run_bwd': [('GANIM_RUN_BACKWARD', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    'run_bwd_to_fwd': [('GANIM_RUN_B2F', 'goalie', 'hold', 0.2, False, 'animated', 3, False)],
    'run_forwards_to_run_backwards': [('ANIM_RUN_FRONT_2_BACK', 'fielder', 'hold', 0.133, False, 'velocity', 1, False)],
    'run_fwd': [('GANIM_RUN_FORWARD', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    'run_fwd_to_run_bwd': [('GANIM_RUN_F2B', 'goalie', 'hold', 0.2, False, 'animated', 3, False)],
    'run_strafe_right': [('ANIM_RUN_0300', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, True), ('ANIM_RUN_0900', 'fielder', 'cyclic', 0.133, True, 'velocity', 0, True), ('ANIM_RUN_STRAFE_LEFT', 'fielder', 'cyclic', 0.133, True, 'velocity', 0, True), ('ANIM_RUN_STRAFE_RIGHT', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, True)],
    'run_to_idle': [('ANIM_RUN_STOP', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'run_to_position': [('GANIM_RUN_POSITION_R', 'goalie', 'hold', 0.2, True, 'animated', 2, False), ('GANIM_RUN_POSITION_L', 'goalie', 'hold', 0.2, False, 'animated', 3, False)],
    'run_to_position_facing': [('GANIM_RUN_POSITION_FACING_R', 'goalie', 'hold', 0.2, True, 'animated', 2, False), ('GANIM_RUN_POSITION_FACING_L', 'goalie', 'hold', 0.2, False, 'animated', 3, False)],
    'run_with_ball': [('ANIM_RUN', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, True), ('ANIM_RUN_WB', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, True)],
    'run_with_ball_lean_left': [('ANIM_RUN_LEFT', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False), ('ANIM_RUN_LEFT_WB', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False)],
    'run_with_ball_lean_right': [('ANIM_RUN_RIGHT', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False), ('ANIM_RUN_RIGHT_WB', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False)],
    'run_with_ball_to_idle': [('ANIM_RUN_WB_STOP', 'fielder', 'hold', 0.133, False, 'animated', 0, False)],
    's2s_blast_into_net': [('GANIM_S2S_BLAST_NET', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    's2s_defl_knocked_out_loop': [('GANIM_S2S_SAVE_STUN_LOOP', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False)],
    's2s_defl_knocked_out_recovery': [('GANIM_S2S_SAVE_STUN_RECOVER', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    's2s_jump_crossbar_hit': [('GANIM_S2S_JUMP_BLAST', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    's2s_knocked_out_start': [('GANIM_S2S_SAVE_STUN_START', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    's2s_prone_getup': [('GANIM_S2S_GETUP', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_S2S_GETUP_R', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    's2s_spin': [('GANIM_S2S_SPIN_L', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_S2S_SPIN_R', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'slide_tackle_1200': [('ANIM_SATTACK', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'slide_tackle_react_1200': [('ANIM_SATTACK_REACT_1200', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'slide_tackle_react_300': [('ANIM_SATTACK_REACT_300', 'fielder', 'hold', 0.067, False, 'velocity', 0, False), ('ANIM_SATTACK_REACT_900', 'fielder', 'hold', 0.067, True, 'velocity', 0, False)],
    'slide_tackle_react_600': [('ANIM_SATTACK_REACT_600', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'slide_tackle_up_fail': [('ANIM_SATTACK_UP_FAIL', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'squash': [('ANIM_SQUASH', 'fielder', 'hold', 0.1, False, 'animated', 0, False)],
    'stand_defl_center_parry_high': [('GANIM_DEFLECT_HI', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'stand_defl_center_parry_high_jump': [('GANIM_DEFLECT_HI_JMP', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'stand_defl_center_parry_low': [('GANIM_DEFLECT_LO', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'stand_defl_center_parry_med': [('GANIM_DEFLECT_MD', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'stand_defl_center_parry_super_high_jump': [('GANIM_DEFLECT_XHI_JMP', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'stand_defl_center_punch_high': [('GANIM_PUNCH_HI', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'stand_defl_right_parry_high': [('GANIM_DEFLECT_R_HI', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DEFLECT_L_HI', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'stand_defl_right_parry_high_jump': [('GANIM_DEFLECT_R_HI_JMP', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DEFLECT_L_HI_JMP', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'stand_defl_right_parry_low': [('GANIM_DEFLECT_R_LO', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DEFLECT_L_LO', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'stand_defl_right_parry_med': [('GANIM_DEFLECT_R_MD', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DEFLECT_L_MD', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'stand_defl_right_parry_super_high_jump': [('GANIM_DEFLECT_R_XHI_JMP', 'goalie', 'hold', 0.1, False, 'animated', 3, False), ('GANIM_DEFLECT_L_XHI_JMP', 'goalie', 'hold', 0.1, True, 'animated', 3, False)],
    'stand_defl_right_punch_high': [('GANIM_PUNCH_R_HI', 'goalie', 'hold', 0.1, True, 'animated', 3, False), ('GANIM_PUNCH_L_HI', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'step_back_1200': [('GANIM_STEP_BACK_R', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False), ('GANIM_STEP_BACK_L', 'goalie', 'cyclic', 0.2, True, 'animated', 2, False)],
    'step_forward_1200': [('GANIM_STEP_FORWARD_R', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False), ('GANIM_STEP_FORWARD_L', 'goalie', 'cyclic', 0.2, True, 'animated', 2, False)],
    'step_right_1200': [('GANIM_STEP_RIGHT', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False), ('GANIM_STEP_LEFT', 'goalie', 'cyclic', 0.2, True, 'animated', 2, False)],
    'strafe_300': [('GANIM_STRAFE_RIGHT', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False), ('GANIM_STRAFE_LEFT', 'goalie', 'cyclic', 0.2, True, 'animated', 2, False)],
    'strafe_back_1200': [('GANIM_STRAFE_BACK_R', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False), ('GANIM_STRAFE_BACK_L', 'goalie', 'cyclic', 0.2, True, 'animated', 2, False)],
    'strafe_forward_1200': [('GANIM_STRAFE_FORWARD_R', 'goalie', 'cyclic', 0.2, False, 'animated', 3, False), ('GANIM_STRAFE_FORWARD_L', 'goalie', 'cyclic', 0.2, True, 'animated', 2, False)],
    'strafe_hard_stop_right': [('ANIM_RUN_STRAFE_STOP_RIGHT', 'fielder', 'hold', 0.133, False, 'velocity', 0, False), ('ANIM_RUN_STRAFE_STOP_LEFT', 'fielder', 'hold', 0.133, True, 'velocity', 0, False)],
    'strafe_to_idle': [('ANIM_RUN_STRAFE_STOP_IDLE_LEFT', 'fielder', 'hold', 0.133, True, 'velocity', 0, False), ('ANIM_RUN_STRAFE_STOP_IDLE_RIGHT', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'sts_hit_react': [('ANIM_STS_HIT_REACT', 'fielder', 'hold', 0.067, False, 'velocity', 0, False)],
    'throw_over_hand': [('GANIM_THROW_LONG', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'throw_underhand': [('GANIM_THROW_SHORT', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'trap_attack': [('GANIM_TRAP_ATTACK', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'turbo_run': [('ANIM_RUN_TURBO', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False)],
    'turbo_run_lean_left': [('ANIM_RUN_LEFT_TURBO', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False)],
    'turbo_run_lean_right': [('ANIM_RUN_RIGHT_TURBO', 'fielder', 'cyclic', 0.133, False, 'velocity', 0, False)],
    'turbo_turn_with_ball_300': [('ANIM_RUN_WB_TURBO_TURN_300', 'fielder', 'hold', 0.133, False, 'animated', 0, False), ('ANIM_RUN_WB_TURBO_TURN_900', 'fielder', 'hold', 0.133, True, 'animated', 0, False)],
    'turbo_turn_with_ball_600': [('ANIM_RUN_WB_TURBO_TURN_600', 'fielder', 'hold', 0.133, False, 'velocity', 0, False)],
    'turbo_with_ball_level_1': [('ANIM_RUN_WB_TURBO', 'fielder', 'hold', 0.133, False, 'animated', 0, False)],
    'turbo_with_ball_level_2': [('ANIM_RUN_WB_TURBO_2', 'fielder', 'hold', 0.133, False, 'animated', 0, False)],
    'turbo_with_ball_level_3': [('ANIM_RUN_WB_TURBO_3', 'fielder', 'hold', 0.133, False, 'animated', 0, False)],
    'turn_180_in_place': [('GANIM_IDLE_TURN180_R', 'goalie', 'hold', 0.2, False, 'animated', 3, False), ('GANIM_IDLE_TURN180_L', 'goalie', 'hold', 0.2, True, 'animated', 3, False)],
    'turn_90_in_place': [('GANIM_IDLE_TURN90_R', 'goalie', 'hold', 0.2, False, 'animated', 3, False), ('GANIM_IDLE_TURN90_L', 'goalie', 'hold', 0.2, True, 'animated', 3, False)],
    'turn_bwd_to_fwd_run_135': [('GANIM_TURN_B2F_R', 'goalie', 'hold', 0.2, False, 'animated', 3, False), ('GANIM_TURN_B2F_L', 'goalie', 'hold', 0.2, True, 'animated', 2, False)],
    'turn_fwd_to_bwd_run_135': [('GANIM_TURN_F2B_R', 'goalie', 'hold', 0.2, False, 'animated', 3, False), ('GANIM_TURN_F2B_L', 'goalie', 'hold', 0.2, True, 'animated', 2, False)],
    'wave': [('ANIM_WAVE', 'fielder', 'hold', 0.0, False, 'velocity', 0, False)],
    'wave_high_with_ball': [('GANIM_WAVE_HIGH_WB', 'goalie', 'hold', 0.1, False, 'animated', 3, False)],
    'windup': [('ANIM_WINDUP_WB', 'fielder', 'hold', 0.067, False, 'velocity', 0, False), ('ANIM_WINDUP_WB_LEFT', 'fielder', 'hold', 0.067, True, 'velocity', 0, False)],
    'windup_kick': [('ANIM_WINDUP_WB_KICK', 'fielder', 'hold', 0.067, False, 'velocity', 0, False), ('ANIM_WINDUP_WB_KICK_LEFT', 'fielder', 'hold', 0.067, True, 'velocity', 0, False)],
    'windup_powershot': [('ANIM_WINDUP_WB_SUPER_KICK', 'fielder', 'hold', 0.067, False, 'velocity', 0, False), ('ANIM_WINDUP_WB_SUPER_KICK_LEFT', 'fielder', 'hold', 0.067, True, 'velocity', 0, False)],
}



if __name__ == "__main__":
    try:
        import bpy  # noqa: F401
        in_blender = True
    except ImportError:
        in_blender = False
    if in_blender:
        args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
        if args:
            _blender_cli(args)
        else:
            register()
    else:
        sys.exit(main())
