"""Decoder for the original animation trigger files (art/animation/<character>.trg).

Format (smstrikers-decomp, src/Game/Triggers/AnimTagScript.cpp and include/Game/Triggers/BinaryTriggerFile.h),
big-endian:
  header  'NLBT', u16 version, u16 anim count, u16 bytecode offset, u16 reserved
  anims   per clip: u32 nlStringHash(clip name), u16 trigger count, u16 first trigger index (sorted by hash)
  trigger per trigger: f32 frame, u32 event id, u32 script offset
The game registers each trigger at normalized time frame / clip keys (SetupAnimationTriggers) and passes
the event id to the callbacks (GetAnimTriggerInfo). Goalie save milestones (GoalieSave::TriggerCallback):
  0xCF84E7CD contact, 0x56264BBE milestone 0, 0x0F9524BA milestone 1, 0x045424B9 milestone 3.

  python3 animation/triggers.py DISC animation/data/strikers_triggers.json
DISC is the .iso itself or an extracted disc folder. Only numbers go into the JSON.
"""
import json
import os
import re
import struct
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CLIPS_JSON = os.path.join(HERE, "..", "game", "assets", "characters", "celestini_portiere.clips.json")
FILES = (("mario.trg", ""), ("mariogoalie.trg", "gk_"))  # our goalie clips carry the gk_ prefix
SAVE_EVENTS = {0xCF84E7CD: "save_contact", 0x56264BBE: "save_milestone_0",
               0x0F9524BA: "save_milestone_1", 0x045424B9: "save_milestone_3"}


def string_hash(s):
    """nlStringHash, as in strikers_anim.py."""
    h = 0xFFFFFFFF
    for c in s.encode("latin-1"):
        h = (h + (h << 5) + c) & 0xFFFFFFFF
    return h


def read_disc(disc, wanted):
    """{lowercase file name: bytes} for the wanted names, from an .iso (GameCube FST) or a folder."""
    out = {}
    if os.path.isfile(disc):
        with open(disc, "rb") as f:
            hdr = f.read(0x440)
            fst_off, fst_size = struct.unpack(">II", hdr[0x424:0x42C])
            f.seek(fst_off)
            fst = f.read(fst_size)
            n = struct.unpack(">I", fst[8:12])[0]
            strtab = fst[n * 12:]
            for i in range(1, n):
                e = fst[i * 12:i * 12 + 12]
                if e[0]:
                    continue
                noff = int.from_bytes(e[1:4], "big")
                name = strtab[noff:strtab.index(b"\0", noff)].decode("latin-1").lower()
                if name in wanted:
                    off, size = struct.unpack(">II", e[4:])
                    f.seek(off)
                    out[name] = f.read(size)
    else:
        for d, _, fs in os.walk(disc):
            for fn in fs:
                if fn.lower() in wanted:
                    with open(os.path.join(d, fn), "rb") as fh:
                        out[fn.lower()] = fh.read()
    return out


def event_names(blobs):
    """Event ids back to names, trying every printable string of main.dol and the .trg files."""
    book = {}
    for data in blobs:
        for m in re.finditer(rb"[\x20-\x7e]{2,80}", data):
            s = m.group().decode("ascii")
            for v in (s, s.lower()):
                book.setdefault(string_hash(v), v)
    book.update(SAVE_EVENTS)
    return book


def decode(data, clip_names, prefix, book):
    tag, _, count, _, _ = struct.unpack(">4sHHHH", data[:12])
    if tag != b"NLBT":
        raise ValueError("not a trigger file")
    ours = {string_hash(k[len(prefix):]): k for k in clip_names
            if k.startswith(prefix) and (prefix or not k.startswith("gk_"))}
    base = 12 + 8 * count
    clips, events = {}, {}
    for i in range(count):
        h, n, first = struct.unpack(">IHH", data[12 + 8 * i:20 + 8 * i])
        name = ours.get(h, "0x%08x" % h)  # clips we do not ship keep their hash
        keys = clip_names[name]["keys"] if name in clip_names else None
        rows = []
        for j in range(n):
            frame, ev, _ = struct.unpack(">fII", data[base + 12 * (first + j):base + 12 * (first + j) + 12])
            rows.append({"event": "0x%08x" % ev, "frame": round(frame, 4),
                         "t": round(frame / keys, 5) if keys else None})
            if ev in book:
                events["0x%08x" % ev] = book[ev]
        clips[name] = {"keys": keys, "triggers": rows}
    return clips, events


def main(disc, out_path):
    clip_names = json.load(open(CLIPS_JSON))["clips"]
    files = read_disc(disc, {f for f, _ in FILES} | {"main.dol"})
    book = event_names(files.values())
    result = {"source": "art/animation/*.trg, disc G4QP01; t = frame / clip keys (normalized clip time)",
              "event_names": {}, "characters": {}}
    for fn, prefix in FILES:
        clips, events = decode(files[fn], clip_names, prefix, book)
        result["characters"][fn[:-4]] = clips
        result["event_names"].update(events)
        n = sum(len(c["triggers"]) for c in clips.values())
        print("%s: %d clips, %d triggers, %d clips not in our set" %
              (fn, len(clips), n, sum(k.startswith("0x") for k in clips)))
    result["event_names"] = dict(sorted(result["event_names"].items()))
    with open(out_path, "w") as f:
        json.dump(result, f, indent=1)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
