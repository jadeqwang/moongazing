#!/usr/bin/env python3
"""Regenerate docs/production_tracker.md from docs/script.md + media/keyframes + media/gen/<shot>/ (sidecars, sync.json)
+ media/gen/picks.json ({"<shot>": {"take": "take_N", "note": "..."}}).

    .venv/bin/python tools/tracker.py
"""
import glob
import json
import os
import re
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = os.path.join(ROOT, "media", "gen")
KF = os.path.join(ROOT, "media", "keyframes")

# keyframes being redone by other agents (moonbase, family/home, crew) -> WAIT
WAIT = {"1.5", "5.2", "5.3", "5.4", "6.2", "7.A1", "7.A2", "7.A3", "7.A4", "7.B2", "7.B3", "7.B4", "7.B6", "7.C6",
        "7.E1", "7.E2"}
WAIT_WHY = {"6.2": "moon rim (K_6.2i-iii, J_6.2) - moonbase look being redone",
            "7.C1": "Moon side (station) waits for the moonbase layout; Earth side done"}
# lip-sync shot -> script id
LS = {"2.3": "LS1", "3.4": "LS2", "4.3": "LS3"}
# script id -> generated-clip folder(s) in media/gen
CLIPS = {"0.3": ["K_0.3"], "1.4": ["J_1.4"], "2.1": ["K_2.1"], "2.3": ["LS1"], "3.4": ["LS2"], "4.3": ["LS3"],
         "3.6": ["K_3.6a", "K_3.6b", "K_3.6c", "K_3.6d", "J_3.6e"], "3.7": ["J_3.7"], "4.9": ["K_4.9"], "5.1": ["K_5.1"],
         "7.B1": ["K_7.B1"], "7.D1": ["K_7.D1"], "7.D2": ["J_7.D2"],
         "0.5": ["K_0.5"], "0.6": ["K_0.6"], "1.6": ["K_1.6"], "2.2": ["K_2.2"], "2.4": ["K_2.4"],
         "3.1": ["K_3.0_bridge", "K_3.1"], "3.2": ["K_3.2"], "4.2": ["K_4.2"], "4.5": ["K_4.5"], "6.1": ["K_6.1"],
         "7.C1": ["K_7.C1_earth"], "7.C2": ["K_7.C2"], "7.C3": ["K_7.C3"], "7.D4": ["K_7.D4"], "8.1": ["K_8.1"],
         "8.2": ["K_8.2"], "8.3": ["K_8.3"],
         "7.C4": ["K_7.C4"] + [f"K_7.C4_{c}" for c in ("c1_chen", "c2_anastasia", "c3_adaeze", "c4_arjun", "c5_lucia",
                                                    "c6_kenji", "c7_layla", "c8_jade")]}
# methods for the drop bullets (no method column in the script)
DROP_METHOD = {"7.A1": "JS", "7.A2": "JS", "7.A3": "JS", "7.A4": "JS", "7.B1": "video base + roto", "7.B2": "video base + roto",
               "7.B3": "still+parallax", "7.B4": "JS", "7.B5": "JS (ballistic dust)", "7.B6": "JS",
               "7.C1": "video base + roto", "7.C2": "video base + roto", "7.C3": "video base + roto", "7.C4": "video base + roto",
               "7.C5": "JS (chat UI)", "7.C6": "still+parallax", "3.6a": "JS (rigid rotation)", "7.D1": "video base + roto", "7.D2": "video base + roto",
               "7.D3": "JS (match cut)", "7.D4": "video base + roto", "7.E1": "video base + roto", "7.E2": "JS",
               "7.E3": "JS", "7.E4": "JS"}


def method_of(sid, text):
    if sid in LS:
        return f"lip-sync ({LS[sid]})"
    if sid in DROP_METHOD:
        return DROP_METHOD[sid]
    t = text.lower()
    if "seedance ls" in t:
        return "lip-sync"
    if "parallax" in t:
        return "still+parallax"
    if any(k in t for k in ("h3", "seedance", "gen-v")):
        return "video base + roto"
    if "js" in t:
        return "JS"
    return "still"


def shots():
    out = []
    for line in open(os.path.join(ROOT, "docs", "script.md"), encoding="utf-8"):
        m = re.match(r"^\| (\d\.\d+) \| ([^|]+)\| ([^|]+)\|.*\| ([^|]+)\|\s*$", line)
        if m:
            out.append((m.group(1), m.group(2).strip(), m.group(3).strip()[:70], m.group(4).strip()))
            continue
        m = re.match(r"^- (7\.[A-E]\d) (.+)$", line)
        if m:
            out.append((m.group(1), "", m.group(2).strip()[:70], ""))
    return out


def keyframes(sid):
    hits = sorted(glob.glob(os.path.join(KF, f"K_{sid}.jpg")) + glob.glob(os.path.join(KF, f"K_{sid}[a-z_]*.jpg"))
                  + glob.glob(os.path.join(KF, f"K_{sid}i*.jpg")))
    hits = [h for h in hits if not h.endswith("_v1.jpg") and "plate" not in h and "earth" not in h]
    j = glob.glob(os.path.join(KF, "jade", f"J_{sid}*.png"))
    if sid in LS:
        j = glob.glob(os.path.join(KF, "jade", f"J_{LS[sid]}.png")) + j
    if sid.startswith("7.") and not hits:
        hits = glob.glob(os.path.join(KF, f"K_{sid[:3]}.jpg"))
    return [os.path.relpath(p, ROOT) for p in sorted(set(j)) + hits]


def clip_status(folder, picks):
    d = os.path.join(GEN, folder)
    if not os.path.isdir(d):
        return None
    rows = []
    for p in sorted(glob.glob(os.path.join(d, "take_*.json"))):
        if p.endswith((".spec.json", ".sync.json", ".mouth.json")):
            continue
        rows.append(json.load(open(p)))
    if not rows:
        return None
    done = [r for r in rows if r["state"] == "done"]
    err = [r for r in rows if r["state"] in ("error", "collected_error")]
    pend = [r for r in rows if r["state"] in ("queued", "running", "ready", "stale")]
    models = sorted({r["model"].split("/")[1] for r in rows})
    st = f"{len(done)} done" + (f", {len(pend)} pending" if pend else "") + (f", {len(err)} error" if err else "")
    res = sorted({str(r.get("res")) for r in done})
    pick = picks.get(folder, {})
    sync = os.path.join(d, "sync.json")
    lag = ""
    if os.path.exists(sync):
        s = json.load(open(sync))
        t = pick.get("take") or s.get("best")
        tr = s["takes"].get(t, {}) if t else {}
        if tr.get("lag_s") is not None:
            lag = f"{tr['lag_s']:+.3f} s (score {tr['score']}, {tr['verdict']})"
    return {"folder": folder, "status": f"{'/'.join(models)} {'/'.join(res)}: {st}", "take": pick.get("take", ""),
            "note": pick.get("note", ""), "lag": lag}


def main():
    picks = json.load(open(os.path.join(GEN, "picks.json"))) if os.path.exists(os.path.join(GEN, "picks.json")) else {}
    L = ["# Production tracker", "",
         f"Generated by `tools/tracker.py` on {time.strftime('%Y-%m-%d %H:%M')} from docs/script.md, media/keyframes, "
         "media/gen/<shot>/take_N.json + sync.json and media/gen/picks.json. Edit picks.json, then re-run; do not hand-edit.", "",
         "Method: **JS** = drawn in the render engine; **still+parallax** = keyframe layers; **video base + roto** = generated "
         "clip used only as motion reference for the JS redraw; **lip-sync** = Seedance 2.5 with the vocal-stem window as "
         "reference audio. Lag convention: clip_time = song_time - ref_t0 + lag (see media/gen/LS*/sync.json). "
         "**WAIT** = keyframe being redone by another agent; no video until it is locked.", "",
         "| ID | Time | Shot | Keyframe | Method | Video status | Chosen take | Lag |", "|---|---|---|---|---|---|---|---|"]
    for sid, tm, pic, meth in shots():
        method = method_of(sid, meth)
        kfs = keyframes(sid)
        kf = "<br>".join(f"`{k}`" for k in kfs) or "—"
        clips = [c for c in (clip_status(f, picks) for f in CLIPS.get(sid, [])) if c]
        if clips:
            vs = "<br>".join(f"{c['folder']}: {c['status']}" for c in clips)
            take = "<br>".join(f"{c['folder']}/{c['take']}" + (f" ({c['note']})" if c["note"] else "") for c in clips if c["take"]) or "—"
            lag = "<br>".join(c["lag"] for c in clips if c["lag"]) or ("—" if "lip" not in method else "not measured")
        else:
            vs = "—" if method in ("JS", "still", "still+parallax") or method.startswith("JS") else "not started"
            take, lag = "—", "—"
        if sid in WAIT or sid in WAIT_WHY:
            vs = "**WAIT**" + (f" ({WAIT_WHY[sid]})" if sid in WAIT_WHY else "") + ("<br>" + vs if clips else "")
        L.append(f"| {sid} | {tm} | {pic.replace('|', '/')} | {kf} | {method} | {vs} | {take} | {lag} |")
    spend = 0.0
    sp = os.path.join(GEN, "spend.jsonl")
    if os.path.exists(sp):
        for line in open(sp):
            r = json.loads(line)
            spend += r.get("est_usd", 0) if r["event"] == "submit" else -r.get("refund_usd", 0)
    L += ["", f"Video spend so far (list-price estimate, errors refunded): **${spend:.2f}** of the $300 cap "
          "(media/gen/spend.jsonl)."]
    open(os.path.join(ROOT, "docs", "production_tracker.md"), "w").write("\n".join(L) + "\n")
    print("wrote docs/production_tracker.md")


if __name__ == "__main__":
    main()
