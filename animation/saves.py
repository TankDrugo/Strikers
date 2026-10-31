"""The original goalkeeper save table, rebuilt without the disc: animation/data/strikers_saves.json.

For every entry of gSaveInfo (smstrikers-decomp, src/Game/AI/GoalieSave.cpp) it gives the clip (named as in
game/assets/characters/*.clips.json, mirrored when the game mirrors it: AnimProps/goalieanimproperties.cpp flag
16777216), the save type, the fail/recover clips, the connected saves the game blends with, the milestones from
the .trg triggers (GoalieSave::TriggerCallback: crouch, takeoff, contact, end) and the position of the `ball`
bone at contact (GoalieSave::InitData, GetJointPositionFuture with root motion), in metres at the original size,
in the goalie's frame: x forward, y lateral (+ = the side of the unmirrored clip), z up. The save time is
(contact - crouch) x clip duration, or 0.6 x contact time when the clip has no crouch trigger (FindBestInList).

  python3 animation/saves.py      (needs data/strikers_source.npz and data/strikers_triggers.json)
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import retarget  # noqa: E402

NET_WIDTH, NET_HEIGHT = 5.692, 2.559  # NetCorner helper (reference/STRIKERS_REFERENCE.md §2)
TYPES = {0x1: "catch", 0x2: "dive_catch", 0x4: "deflect", 0x8: "dive_deflect", 0x10: "punch", 0x20: "leg",
         0x10000: "sts_save_stun", 0x20000: "sts_blast_net", 0x40000: "sts_spin", 0x100000: "miss_chip"}
MILESTONES = {"0x56264bbe": "crouch", "0x0f9524ba": "takeoff", "0xcf84e7cd": "contact", "0x045424b9": "end"}

149
ANIMS = {
    46: ("anticipate", False),
    47: ("catch_super_high_jump", False),
    48: ("catch_high_jump", False),
    49: ("catch_high", False),
    50: ("catch_med", False),
    51: ("catch_low", False),
    52: ("catch_super_right_high_jump", False),
    53: ("catch_right_high_jump", False),
    54: ("catch_right_high", False),
    55: ("catch_right_med", False),
    56: ("catch_right_low", False),
    57: ("catch_super_right_high_jump", True),
    58: ("catch_right_high_jump", True),
    59: ("catch_right_high", True),
    60: ("catch_right_med", True),
    61: ("catch_right_low", True),
    62: ("dive_catch_near_right_high", False),
    63: ("dive_catch_near_right_med", False),
    64: ("dive_catch_near_right_low", False),
    65: ("dive_catch_near_right_high", True),
    66: ("dive_catch_near_right_med", True),
    67: ("dive_catch_near_right_low", True),
    68: ("dive_catch_far_right_high", False),
    69: ("dive_catch_far_right_med", False),
    70: ("dive_catch_far_right_low", False),
    71: ("dive_catch_far_right_high", True),
    72: ("dive_catch_far_right_med", True),
    73: ("dive_catch_far_right_low", True),
    74: ("dvng_defl_parry_near_right_low", False),
    75: ("dvng_defl_parry_near_right_med", False),
    76: ("dvng_defl_parry_near_right_high", False),
    77: ("dvng_defl_parry_far_right_low", False),
    78: ("dvng_defl_parry_far_right_med", False),
    79: ("dvng_defl_parry_far_right_high", False),
    80: ("dvng_defl_parry_near_right_low", True),
    81: ("dvng_defl_parry_near_right_med", True),
    82: ("dvng_defl_parry_near_right_high", True),
    83: ("dvng_defl_parry_far_right_low", True),
    84: ("dvng_defl_parry_far_right_med", True),
    85: ("dvng_defl_parry_far_right_high", True),
    86: ("right_leg_low", False),
    87: ("right_leg_low", True),
    88: ("stand_defl_center_parry_super_high_jump", False),
    89: ("stand_defl_center_parry_high_jump", False),
    90: ("stand_defl_center_parry_high", False),
    91: ("stand_defl_center_parry_med", False),
    92: ("stand_defl_center_parry_low", False),
    93: ("stand_defl_right_parry_super_high_jump", False),
    94: ("stand_defl_right_parry_high_jump", False),
    95: ("stand_defl_right_parry_high", False),
    96: ("stand_defl_right_parry_med", False),
    97: ("stand_defl_right_parry_low", False),
    98: ("stand_defl_right_parry_super_high_jump", True),
    99: ("stand_defl_right_parry_high_jump", True),
    100: ("stand_defl_right_parry_high", True),
    101: ("stand_defl_right_parry_med", True),
    102: ("stand_defl_right_parry_low", True),
    103: ("stand_defl_center_punch_high", False),
    104: ("stand_defl_right_punch_high", True),
    105: ("stand_defl_right_punch_high", False),
    106: ("dive_catch_far_right_high_special_twist", False),
    107: ("dive_catch_far_right_high_special_twist", True),
    108: ("s2s_blast_into_net", False),
    109: ("s2s_jump_crossbar_hit", False),
    110: ("s2s_knocked_out_start", False),
    111: ("s2s_defl_knocked_out_loop", False),
    112: ("s2s_defl_knocked_out_recovery", False),
    113: ("attack_s2s_high", False),
    114: ("s2s_spin", False),
    115: ("s2s_spin", True),
    116: ("s2s_prone_getup", False),
    117: ("s2s_prone_getup", True),
    118: ("pick_up", False),
    119: ("dive_catch_forward", False),
    120: ("dive_catch_900", False),
    121: ("dive_catch_600", False),
    122: ("dive_catch_900", True),
    123: ("dive_catch_600", True),
    124: ("trap_attack", False),
    125: ("catch_above", False),
    126: ("dive_catch_back", False),
    127: ("foot_flick_fwd", False),
    128: ("catch_miss_chip", False),
    129: ("catch_miss_chip", True),
    130: ("catch_miss_chip_short", False),
    131: ("catch_miss_chip_short", True),
    132: ("recover_with_ball_side", False),
    133: ("recover_with_ball_side", True),
    134: ("recover_without_ball", False),
    135: ("recover_without_ball", True),
}
SAVES = [
    (47, 88, -1, 0x00000001, (-1, 48, 52, 57), "Ctch Ctr XHiJmp"),
    (48, 89, -1, 0x00000001, (47, 49, 53, 58), "Ctch Ctr Hi Jmp"),
    (49, 90, -1, 0x00000001, (48, 50, 54, 59), "Catch Ctr Hi"),
    (50, 91, -1, 0x00000001, (49, 51, 55, 60), "Catch Ctr Med"),
    (51, 92, -1, 0x00000001, (50, -1, 56, 61), "Catch Ctr Lo"),
    (52, 93, -1, 0x00000001, (-1, 53, -1, 47), "Catch Rt XHiJmp"),
    (53, 94, -1, 0x00000001, (52, 54, -1, 48), "Catch Rt Hi Jmp"),
    (54, 95, -1, 0x00000001, (53, 55, -1, 49), "Catch Rt Hi"),
    (55, 96, -1, 0x00000001, (54, 56, -1, 50), "Catch Rt Med"),
    (56, 97, -1, 0x00000001, (55, -1, -1, 51), "Catch Rt Lo"),
    (57, 98, -1, 0x00000001, (-1, 58, 47, -1), "Catch Lf XHiJmp"),
    (58, 99, -1, 0x00000001, (57, 59, 48, -1), "Catch Lft HiJmp"),
    (59, 100, -1, 0x00000001, (58, 60, 49, -1), "Catch Lft Hi"),
    (60, 101, -1, 0x00000001, (59, 61, 50, -1), "Catch Lft Med"),
    (61, 101, -1, 0x00000001, (60, -1, 51, -1), "Catch Lft Lo"),
    (106, 79, -1, 0x00000002, (-1, -1, -1, -1), "DiveCatchRHiSpc"),
    (107, 85, -1, 0x00000002, (-1, -1, -1, -1), "DiveCatchLHiSpc"),
    (62, 76, 132, 0x00000002, (-1, 63, 68, -1), "Dive Catch R Hi"),
    (63, 75, 132, 0x00000002, (62, 64, 69, -1), "Dive Catch R Md"),
    (64, 74, 132, 0x00000002, (63, -1, 70, -1), "Dive Catch R Lo"),
    (65, 82, 133, 0x00000002, (-1, 66, -1, 71), "Dive Catch L Hi"),
    (66, 81, 133, 0x00000002, (65, 67, -1, 72), "Dive Catch L Md"),
    (67, 80, 133, 0x00000002, (66, -1, -1, 73), "Dive Catch L Lo"),
    (68, 79, 132, 0x00000002, (-1, 69, -1, 62), "DiveCtch RHiFar"),
    (69, 78, 132, 0x00000002, (68, 70, -1, 63), "DiveCtch RMdFar"),
    (70, 77, 132, 0x00000002, (69, -1, -1, 64), "DiveCtch RLoFar"),
    (71, 85, 133, 0x00000002, (-1, 72, 65, -1), "DiveCtch LHiFar"),
    (72, 84, 133, 0x00000002, (71, 73, 66, -1), "DiveCtch LMdFar"),
    (73, 83, 133, 0x00000002, (72, -1, 67, -1), "DiveCtch LLoFar"),
    (88, -1, -1, 0x00000004, (-1, 89, 93, 98), "Deflect XHi Jmp"),
    (89, -1, -1, 0x00000004, (88, 90, 94, 99), "Deflect Hi Jmp"),
    (90, -1, -1, 0x00000004, (89, 91, 95, 100), "Deflect Hi"),
    (91, -1, -1, 0x00000004, (90, 92, 96, 101), "Deflect Med"),
    (92, -1, -1, 0x00000004, (91, -1, 97, 102), "Deflect Lo"),
    (93, -1, -1, 0x00000004, (-1, 94, -1, 88), "Defl R XHi Jmp"),
    (94, -1, -1, 0x00000004, (93, 95, -1, 89), "Defl R Hi Jmp"),
    (95, -1, -1, 0x00000004, (94, 96, -1, 90), "Deflect R Hi"),
    (96, -1, -1, 0x00000004, (95, 97, -1, 91), "Deflect R Med"),
    (97, -1, -1, 0x00000004, (96, -1, -1, 92), "Deflect R Lo"),
    (98, -1, -1, 0x00000004, (-1, 99, 88, -1), "Defl L XHi Jmp"),
    (99, -1, -1, 0x00000004, (98, 100, 89, -1), "Defl L Hi Jmp"),
    (100, -1, -1, 0x00000004, (99, 101, 90, -1), "Deflect L Hi"),
    (101, -1, -1, 0x00000004, (100, 102, 91, -1), "Deflect L Med"),
    (102, -1, -1, 0x00000004, (101, -1, 92, -1), "Deflect L Lo"),
    (76, -1, 134, 0x00000008, (-1, 75, 79, -1), "Dive Dfl R Hi"),
    (75, -1, 134, 0x00000008, (76, 74, 78, -1), "Dive Dfl R Med"),
    (74, -1, 134, 0x00000008, (75, -1, 77, -1), "Dive Dfl R Lo"),
    (79, -1, 134, 0x00000008, (-1, 78, -1, 76), "DiveDfl R HiFar"),
    (78, -1, 134, 0x00000008, (79, 77, -1, 75), "DiveDfl R MdFar"),
    (77, -1, 134, 0x00000008, (78, -1, -1, 74), "DiveDfl R LoFar"),
    (82, -1, 135, 0x00000008, (-1, 81, -1, 85), "Dive Dfl L Hi"),
    (81, -1, 135, 0x00000008, (82, 80, -1, 84), "Dive Dfl L Med"),
    (80, -1, 135, 0x00000008, (81, -1, -1, 83), "Dive Dfl L Lo"),
    (85, -1, 135, 0x00000008, (-1, 84, 82, -1), "DiveDfl L HiFar"),
    (84, -1, 135, 0x00000008, (85, 83, 81, -1), "DiveDfl L MdFar"),
    (83, -1, 135, 0x00000008, (84, -1, 80, -1), "DiveDfl L LoFar"),
    (86, -1, -1, 0x00000020, (-1, -1, -1, -1), "Leg R Lo"),
    (87, -1, -1, 0x00000020, (-1, -1, -1, -1), "Leg L Lo"),
    (103, -1, -1, 0x00000010, (-1, -1, 104, 105), "Punch Hi"),
    (104, -1, -1, 0x00000010, (-1, -1, -1, 103), "Punch R Hi"),
    (105, -1, -1, 0x00000010, (-1, -1, 103, -1), "Punch L Hi"),
    (108, -1, -1, 0x00020000, (-1, -1, -1, -1), "S2S Blast Net"),
    (114, -1, 116, 0x00040000, (-1, -1, -1, -1), "S2S Spin L"),
    (115, -1, 117, 0x00040000, (-1, -1, -1, -1), "S2S Spin R"),
    (110, -1, 111, 0x00010000, (-1, -1, -1, -1), "S2S Save Stun"),
    (128, -1, 134, 0x00100000, (-1, -1, -1, -1), "Miss Chip R"),
    (129, -1, 135, 0x00100000, (-1, -1, -1, -1), "Miss Chip L"),
    (130, -1, 134, 0x00100000, (-1, -1, -1, -1), "MissChipShort R"),
    (131, -1, 135, 0x00100000, (-1, -1, -1, -1), "MissChipShort L"),
]


def clip_ref(anim_id):
    if anim_id < 0:
        return None
    name, mirrored = ANIMS[anim_id]
    return {"clip": "gk_" + name, "mirrored": mirrored}


def ball_at(clip, bones, t):
    """Ball bone at normalized time t in the clip's start frame (game axes: x forward, y lateral, z up)."""
    keys = clip["pos"].shape[0]
    f = min(max(t * keys, 0.0), keys - 1.0)
    k0 = int(f)
    k1 = min(k0 + 1, keys - 1)
    a = f - k0
    b = bones.index("ball")
    lp = clip["pos"][k0, b] * (1 - a) + clip["pos"][k1, b] * a  # C maps game (x, y, z) to (y, z, x)
    lx, ly, lz = lp[2], lp[0], lp[1]
    r0, r1 = clip["meta"]["root"][k0], clip["meta"]["root"][k1]
    fwd, left, yaw = [r0[i] * (1 - a) + r1[i] * a for i in range(3)]
    return (fwd + math.cos(yaw) * lx - math.sin(yaw) * ly, left + math.sin(yaw) * lx + math.cos(yaw) * ly, lz)


def main():
    src = retarget.Source.load(os.path.join(HERE, "data", "strikers_source.npz"))
    goalie = src.chars["MarioGoalie"]
    clips = {c["name"]: c for c in goalie["clips"]}
    trig = json.load(open(os.path.join(HERE, "data", "strikers_triggers.json")))["characters"]["mariogoalie"]
    out = []
    for i, (anim, fail, recover, stype, connected, label) in enumerate(SAVES):
        ref = clip_ref(anim)
        clip = clips[ref["clip"]]
        dur = clip["meta"]["keys"] / 30.0
        ms = {}
        for tr in trig.get(ref["clip"], {}).get("triggers", []):
            if tr["event"] in MILESTONES:
                ms.setdefault(MILESTONES[tr["event"]], tr["t"])
        entry = dict(ref, id=anim, label=label, type=TYPES[stype], duration=round(dur, 4),
                     milestones=ms, fail=clip_ref(fail), recover=clip_ref(recover),
                     connected=[c if c >= 0 else None for c in connected])
        if "contact" in ms:
            x, y, z = ball_at(clip, goalie["bones"], ms["contact"])
            if ref["mirrored"]:
                y = -y
            entry["ball_at_contact"] = [round(x, 3), round(y, 3), round(z, 3)]
            entry["grid_cell"] = [min(max(int(7 * (0.5 * NET_WIDTH + y) / NET_WIDTH), 0), 6),
                                  min(max(int(5 * z / NET_HEIGHT), 0), 4)]
            start = ms.get("crouch")
            entry["save_time"] = round((ms["contact"] - start) * dur if start else 0.6 * ms["contact"] * dur, 4)
            if "takeoff" in ms:
                entry["save_time_from_takeoff"] = round((ms["contact"] - ms["takeoff"]) * dur, 4)
        out.append(entry)
    path = os.path.join(HERE, "data", "strikers_saves.json")
    with open(path, "w") as f:
        json.dump({"source": "gSaveInfo (GoalieSave.cpp) + mariogoalie.trg + MarioGoalie.sanim; metres at original size",
                   "net": [NET_WIDTH, NET_HEIGHT], "saves": out}, f, indent=1)
    print("%d saves, %d with a contact trigger -> %s" % (len(out), sum("save_time" in e for e in out), path))


if __name__ == "__main__":
    main()
