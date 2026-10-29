"""Round-trip tests on the synthetic sample.

  python3 tests/test_converter.py            decoding + BVH text checks
  <python with bpy> tests/test_converter.py  also Blender import and BVH re-import

Blender poses are compared with a direct re-implementation of
cPoseAccumulator::BuildNodeMatrices (row vectors, parent scale applied to the
child's offset only).
"""

import math
import os
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))
sys.path.insert(0, HERE)

import make_sample as ms
import strikers_anim as sa

try:
    import bpy
except ImportError:
    bpy = None

FAILS = []


def check(cond, msg):
    if not cond:
        FAILS.append(msg)
        print("FAIL", msg)


def close(a, b, tol):
    return all(abs(x - y) <= tol for x, y in zip(a, b))


def qclose(a, b, tol):
    return close(a, b, tol) or close(a, [-c for c in b], tol)


# ---------------------------------------------------------------- game FK

def quat_rows(q):
    """nlQuatToMatrix: e2[row][col], rows are the rotated basis vectors."""
    w, x, y, z = q
    return [[1 - 2 * y * y - 2 * z * z, 2 * x * y + 2 * w * z, 2 * x * z - 2 * w * y],
            [2 * x * y - 2 * w * z, 1 - 2 * x * x - 2 * z * z, 2 * y * z + 2 * w * x],
            [2 * x * z + 2 * w * y, 2 * y * z - 2 * w * x, 1 - 2 * x * x - 2 * y * y]]


def mul_rows(a, b):
    """4x4 row-vector product a * b (a applied first)."""
    return [[sum(a[r][k] * b[k][c] for k in range(4)) for c in range(4)] for r in range(4)]


def to4(rot, t):
    m = [row[:] + [0.0] for row in rot]
    m.append(list(t) + [1.0])
    return m


def game_world(pose, k, with_root=True):
    skel = pose.skel
    loc, yaw = pose.root(k) if with_root else ((0, 0, 0), 0.0)
    world = to4(quat_rows((math.cos(yaw / 2), 0, 0, math.sin(yaw / 2))), loc)
    mats, scales = [], []
    for i in range(skel.num_nodes):
        t, q, s = pose.local(i, k)
        p = skel.parents[i]
        if p >= 0:
            ps = scales[p]
            t = (t[0] * ps[0], t[1] * ps[1], t[2] * ps[2])
        local = to4(quat_rows(q), t)
        mats.append(mul_rows(local, mats[p] if p >= 0 else world))
        scales.append(s)
    return mats  # unscaled frames; heads are row 3


# ---------------------------------------------------------------- tests

def test_decode(d):
    skel = sa.load_skeletons(os.path.join(d, "sample.shier"))[0]
    clips = sa.load_clips(os.path.join(d, "sample.sanim"))
    rt = sa.load_retargets(os.path.join(d, "sample_retarget.bin"))
    names = sa.NameBook()
    check(skel.num_nodes == len(ms.BONES), "node count")
    check([names.name(i) for i in skel.node_ids] == [b[0] for b in ms.BONES], "bone names from hashes")
    check(skel.pelvis == ms.PELVIS and skel.spine == ms.SPINE, "pelvis/spine")
    check([c.name for c in clips] == ["run_with_ball", "deke_300"], "clip names")
    check(sorted(rt) == [0x22222222], "retarget signature")
    a, b = sa.Pose(clips[0], skel), sa.Pose(clips[1], skel, rt)
    for k in range(ms.NKEYS):
        for i in range(skel.num_nodes):
            t, q, s = a.local(i, k)
            p = ms.sample_props(i)
            if p & 0x1:
                ang = (int(round(k * 0.3 / (2 * math.pi) * 65536)) & 0xFFFF) * sa.U16_TO_RAD
                want_q = (math.cos(ang / 2), 0, 0, math.sin(ang / 2))
            else:
                want_q = ms.sample_quat(i, 0 if p & 0x2 else k)
            check(qclose(q, want_q, 2e-4), "rot node %d key %d" % (i, k))
            check(close(t, ms.sample_trans(i, 0 if p & 0x4 else k), 1e-6), "trans node %d key %d" % (i, k))
            check(close(s, ms.sample_scale(i, k) or (1, 1, 1), 3e-4), "scale node %d key %d" % (i, k))
            t2, q2, s2 = b.local(i, k)
            check(close(t, t2, 1e-9) and qclose(q, q2, 1e-9) and close(s, s2, 1e-9), "retarget node %d key %d" % (i, k))
    m = sa.Pose(clips[0], skel, mirror=True)
    t, q, _ = m.local(2, 3)
    t0, q0, _ = a.local(4, 3)
    check(close(t, sa._mirror_trans(t0, 2, skel), 1e-9), "mirror reads the opposite limb")
    loc, yaw = a.root(0)
    check(close(loc, (0, 0, 0), 1e-9) and abs(yaw) < 1e-9, "root motion starts at zero")
    loc, yaw = a.root(ms.NKEYS - 1)
    check(abs(yaw - (ms.NKEYS - 1) * 300 * sa.U16_TO_RAD) < 1e-6, "root yaw")
    return skel, clips, rt


def test_bvh_text(d, skel, clips, rt):
    out = os.path.join(d, "bvh")
    os.makedirs(out, exist_ok=True)
    for c in clips:
        sa.write_bvh(os.path.join(out, c.name + ".bvh"), c, skel, sa.NameBook(), rt)
    txt = open(os.path.join(out, "run_with_ball.bvh")).read().split("\n")
    frames = [l for l in txt[txt.index("MOTION") + 3:] if l.strip()]
    check(len(frames) == ms.NKEYS, "bvh frame count")
    check(all(len(l.split()) == 6 * (skel.num_nodes + 1) for l in frames), "bvh channel count")
    for q in (ms.sample_quat(3, 2), ms.sample_quat(7, 5), (0.5, 0.5, -0.5, 0.5)):
        z, x, y = [math.radians(v) for v in sa._mat_to_euler_zxy(sa._quat_to_mat(q))]
        rz = [[math.cos(z), -math.sin(z), 0], [math.sin(z), math.cos(z), 0], [0, 0, 1]]
        rx = [[1, 0, 0], [0, math.cos(x), -math.sin(x)], [0, math.sin(x), math.cos(x)]]
        ry = [[math.cos(y), 0, math.sin(y)], [0, 1, 0], [-math.sin(y), 0, math.cos(y)]]
        mm = lambda a, b: [[sum(a[r][j] * b[j][c] for j in range(3)) for c in range(3)] for r in range(3)]
        got = mm(mm(rz, rx), ry)
        want = sa._quat_to_mat(q)
        check(all(close(got[r], want[r], 1e-9) for r in range(3)), "euler ZXY round trip")
    return out


def test_blender(d, skel, clips, rt):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    obj = sa.import_into_blender(os.path.join(d, "sample.sanim"), os.path.join(d, "sample.shier"),
                                 os.path.join(d, "sample_retarget.bin"), mirrored=True)
    names = sa.NameBook()
    acts = sorted(a.name for a in bpy.data.actions)
    check(acts == sorted(["run_with_ball", "run_with_ball_mirror", "deke_300", "deke_300_mirror"]), "actions: %s" % acts)
    scene = bpy.context.scene
    for clip in clips:
        for mir in (False, True):
            act = bpy.data.actions[clip.name + ("_mirror" if mir else "")]
            obj.animation_data.action = act
            if hasattr(act, "slots"):
                obj.animation_data.action_slot = act.slots[0]
            pose = sa.Pose(clip, skel, rt, mir)
            worst = 0.0
            for k in range(ms.NKEYS):
                scene.frame_set(k + 1)
                ref = game_world(pose, k)
                for i in range(skel.num_nodes):
                    pb = obj.pose.bones[names.name(skel.node_ids[i])]
                    m = obj.matrix_world @ pb.matrix
                    head = tuple(m.translation)
                    worst = max(worst, max(abs(a - b) for a, b in zip(head, ref[i][3][:3])))
                    rot = m.to_3x3().normalized()
                    for r in range(3):  # game row r = rotated basis r = Blender column r
                        col = tuple(rot.col[r])
                        worst = max(worst, max(abs(a - b) for a, b in zip(col, ref[i][r][:3])))
            check(worst < 1e-4, "blender pose %s mirror=%s off by %.2e" % (clip.name, mir, worst))
            print("blender %-14s mirror=%-5s max error %.1e" % (clip.name, mir, worst))


def test_bvh_import(bvh_dir, skel, clips, rt):
    """Blender's own BVH importer on our file; scale is not part of BVH, so bones under the scaled spine1 are skipped."""
    clip = clips[0]
    pose = sa.Pose(clip, skel, rt)
    under_scaled = {i for i in range(skel.num_nodes) if skel.parents[i] == 7}
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_anim.bvh(filepath=os.path.join(bvh_dir, clip.name + ".bvh"), axis_forward="Y", axis_up="Z",
                            rotate_mode="NATIVE", frame_start=1, use_fps_scale=False, update_scene_fps=True)
    obj = bpy.context.object
    worst = 0.0
    for k in range(ms.NKEYS):
        bpy.context.scene.frame_set(k + 1)
        ref = game_world(pose, k)
        for i in range(skel.num_nodes):
            if i in under_scaled:
                continue
            pb = obj.pose.bones[sa.NameBook().name(skel.node_ids[i]).replace(" ", "_")]
            head = obj.matrix_world @ pb.head
            worst = max(worst, max(abs(a - b) for a, b in zip(head, ref[i][3][:3])))
    check(worst < 1e-3, "bvh re-import off by %.2e" % worst)
    print("bvh re-import max head error %.1e" % worst)


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as d:
        ms.write_skeleton(os.path.join(d, "sample.shier"))
        ms.write_bundle(os.path.join(d, "sample.sanim"))
        ms.write_retarget(os.path.join(d, "sample_retarget.bin"))
        skel, clips, rt = test_decode(d)
        bvh_dir = test_bvh_text(d, skel, clips, rt)
        if bpy is not None:
            print("Blender", bpy.app.version_string)
            test_blender(d, skel, clips, rt)
            test_bvh_import(bvh_dir, skel, clips, rt)
        else:
            print("bpy not available: Blender checks skipped")
    print("FAILED: %d" % len(FAILS) if FAILS else "all checks passed")
    sys.exit(1 if FAILS else 0)
