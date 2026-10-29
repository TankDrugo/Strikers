"""Writes a small synthetic skeleton, animation bundle and retarget table in the
game's chunk format, so the converter can be tested without game data.

The writer follows the same reading of the format as strikers_anim.py, so it
checks the decoding, posing and Blender/BVH output, not the format guess itself.
"""

import math
import os
import struct
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from strikers_anim import (CHUNK_RETARGET, CHUNK_ROT, CHUNK_SANIM, CHUNK_SANIM_NODE, CHUNK_SANIM_PAD,
                           CHUNK_SCALE, CHUNK_SHIER, CHUNK_TRANS, string_hash, string_lower_hash)

ALIGN16 = 4  # exponent stored in ID bits 0x7F000000


class Writer:
    def __init__(self):
        self.buf = bytearray()

    def leaf(self, cid, data, align=0):
        off = len(self.buf)
        self.buf += b"\0" * 8
        if align:
            a = 1 << align
            while len(self.buf) % a:
                self.buf += b"\0"
        self.buf += data
        while len(self.buf) % 8:
            self.buf += b"\0"
        struct.pack_into(">II", self.buf, off, cid | (align << 24), len(self.buf) - off - 8)

    def begin(self, cid):
        off = len(self.buf)
        self.buf += b"\0" * 8
        return off, cid

    def end(self, token):
        off, cid = token
        struct.pack_into(">II", self.buf, off, cid, len(self.buf) - off - 8)


BONES = [  # name, parent, rest offset
    ("Bip01", -1, (0.0, 0.0, 0.9)),
    ("Bip01 Pelvis", 0, (0.0, 0.0, 0.0)),
    ("Bip01 L Thigh", 1, (0.0, 0.1, -0.05)),
    ("Bip01 L Calf", 2, (0.0, 0.0, -0.4)),
    ("Bip01 R Thigh", 1, (0.0, -0.1, -0.05)),
    ("Bip01 R Calf", 4, (0.0, 0.0, -0.4)),
    ("Bip01 Spine", 1, (0.0, 0.0, 0.1)),
    ("Bip01 Spine1", 6, (0.0, 0.0, 0.2)),
    ("Bip01 Head", 7, (0.0, 0.0, 0.25)),
    ("ball", 0, (0.3, 0.0, -0.72)),
]
PELVIS, SPINE = 1, 6
MIRROR = [0, 1, 4, 5, 2, 3, 6, 7, 8, 9]
NKEYS = 12
NROOT = 12


def write_skeleton(path, name="sample"):
    n = len(BONES)
    w = Writer()
    top = w.begin(CHUNK_SHIER)
    hdr = bytearray(0x34)
    struct.pack_into(">Ii", hdr, 4, string_hash(name), n)
    struct.pack_into(">ii", hdr, 0x24, PELVIS, SPINE)
    w.leaf(0x18001, bytes(hdr), ALIGN16)
    w.leaf(0x18002, name.encode() + b"\0")
    w.leaf(0x18003, struct.pack(">%dI" % n, *[string_lower_hash(b[0]) for b in BONES]))
    w.leaf(0x18004, struct.pack(">%di" % n, *[b[1] for b in BONES]))
    kids = [[j for j, b in enumerate(BONES) if b[1] == i] for i in range(n)]
    w.leaf(0x18005, struct.pack(">%di" % n, *[len(k) for k in kids]))
    w.leaf(0x18006, b"\0" * 4 * n)
    w.leaf(0x18007, b"\0" * 4 * n)
    flat = [c for k in kids for c in k]
    w.leaf(0x18008, struct.pack(">%di" % len(flat), *flat))
    w.leaf(0x18009, struct.pack(">%di" % n, *MIRROR))
    w.leaf(0x1800A, struct.pack(">%df" % (3 * n), *[c for b in BONES for c in b[2]]), ALIGN16)
    w.leaf(0x1800B, bytes([0] * n))
    w.end(top)
    with open(path, "wb") as fh:
        fh.write(w.buf)


def sample_quat(node, k):
    """Smooth test rotation (w, x, y, z) per node and key."""
    ax = [(1, 0, 0), (0, 1, 0), (0, 0, 1), (1, 1, 0), (0, 1, 1)][node % 5]
    l = math.sqrt(sum(c * c for c in ax))
    ang = 0.6 * math.sin(0.5 * k + node) + 0.2 * node
    s = math.sin(ang / 2)
    return (math.cos(ang / 2), ax[0] / l * s, ax[1] / l * s, ax[2] / l * s)


def sample_props(i):
    return {8: 0x2 | 0x4, 9: 0x1, 7: 0x0, 3: 0x4}.get(i, 0)


def sample_trans(i, k):
    o = BONES[i][2]
    if i == 0:
        return (o[0] + 0.02 * math.sin(k), o[1], o[2] + 0.03 * math.cos(k))
    return o


def sample_scale(i, k):
    if i == 7:
        s = 1.0 + 0.15 * math.sin(0.7 * k)
        return (s, 1.0, 2.0 - s)
    return None


def write_clip(w, name, order, signature):
    """order[j] = skeleton node stored as clip node j."""
    n = len(order)
    top = w.begin(CHUNK_SANIM)
    hdr = bytearray(0x48)
    struct.pack_into(">IIII", hdr, 4, string_hash(name), NKEYS, n, 0)
    struct.pack_into(">I", hdr, 0x24, NROOT)
    struct.pack_into(">I", hdr, 0x44, signature)
    w.leaf(0x17001, bytes(hdr), ALIGN16)
    w.leaf(0x17002, name.encode() + b"\0")
    for cid in (0x17003, 0x17004, 0x17005):
        w.leaf(cid, b"\0" * 4 * n)
    yaw = [int(round(k * 300)) & 0xFFFF for k in range(NROOT)]
    w.leaf(0x17006, struct.pack(">%dH" % NROOT, *yaw))
    w.leaf(0x17007, struct.pack(">%df" % (3 * NROOT), *[c for k in range(NROOT) for c in (0.25 * k, 0.05 * k, 0.0)]), ALIGN16)
    for j, i in enumerate(order):
        node = w.begin(CHUNK_SANIM_NODE)
        p = sample_props(i)
        if p & 0x1:
            vals = [int(round((k * 0.3) / (2 * math.pi) * 65536)) & 0xFFFF for k in range(NKEYS)]
            w.leaf(CHUNK_ROT, struct.pack(">%dH" % len(vals), *vals))
        else:
            keys = [sample_quat(i, 0)] if p & 0x2 else [sample_quat(i, k) for k in range(NKEYS)]
            data = b"".join(struct.pack(">4h", *[int(round(c * 16384)) for c in (q[1], q[2], q[3], q[0])]) for q in keys)
            w.leaf(CHUNK_ROT, data)
        keys = [sample_trans(i, 0)] if p & 0x4 else [sample_trans(i, k) for k in range(NKEYS)]
        w.leaf(CHUNK_TRANS, b"".join(struct.pack(">3f", *t) for t in keys), ALIGN16)
        if sample_scale(i, 0):
            w.leaf(CHUNK_SCALE, b"".join(struct.pack(">3h", *[int(round(c * 4096)) for c in sample_scale(i, k)]) for k in range(NKEYS)))
        w.end(node)
        if j == 3:
            w.leaf(CHUNK_SANIM_PAD, b"\0" * 8)
    w.leaf(0x17008, b"")
    w.leaf(0x17009, b"")
    w.leaf(0x1700A, b"")
    w.leaf(0x1700B, struct.pack(">%dI" % n, *[sample_props(i) for i in order]), ALIGN16)
    w.end(top)


def write_bundle(path):
    n = len(BONES)
    w = Writer()
    write_clip(w, "run_with_ball", list(range(n)), 0x11111111)
    write_clip(w, "deke_300", list(reversed(range(n))), 0x22222222)
    with open(path, "wb") as fh:
        fh.write(w.buf)


def write_retarget(path):
    n = len(BONES)
    w = Writer()
    top = w.begin(CHUNK_RETARGET)
    hdr = bytearray(0x10)
    struct.pack_into(">i", hdr, 8, 1)
    w.leaf(0x17105, bytes(hdr))
    group = w.begin(0x80017106)  # as on the disc: entry table and maps nested in one chunk
    w.leaf(0x17107, struct.pack(">Iii", 0x22222222, n, 0))
    w.leaf(0x17108, struct.pack(">%dh" % n, *[n - 1 - i for i in range(n)]))
    w.end(group)
    w.end(top)
    with open(path, "wb") as fh:
        fh.write(w.buf)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "sample"
    os.makedirs(out, exist_ok=True)
    write_skeleton(os.path.join(out, "sample.shier"))
    write_bundle(os.path.join(out, "sample.sanim"))
    write_retarget(os.path.join(out, "sample_retarget.bin"))
    print("wrote", out)
