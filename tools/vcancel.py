#!/usr/bin/env python3
"""Cancel our still-queued relay jobs for SHOT(s) (delete our own KV job key before its cron minute) and/or mark all
their takes superseded.   .venv/bin/python tools/vcancel.py SHOT [...] [--why="..."]"""
import json, sys, time
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import gen, vgen

why = next((a[6:] for a in sys.argv if a.startswith("--why=")), "superseded")
for shot in [a for a in sys.argv[1:] if not a.startswith("--")]:
    for k, p in vgen.takes(shot):
        side = json.load(open(p))
        side["superseded"] = why
        if side["state"] == "queued":
            jid = side["job"]
            with gen.locked() as m:
                j = m["jobs"][jid]
                key = f"job:{j['bucket']}:{jid}"
                if gen.kv_get(key, raw=True) is not None and not gen.kv_get("state:" + jid):
                    gen.kv_delete(key)
                    j["state"] = "rejected"; j["notes"] += " | CANCELLED before start"
                    side["state"] = "cancelled"; side["refunded"] = True
                    vgen.log_spend({"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "event": "cancel",
                                    "shot": shot, "take": k, "job": jid, "refund_usd": side["est_usd"], "note": why})
        json.dump(side, open(p, "w"), indent=1, ensure_ascii=False)
        print(shot, k, side["state"], "superseded")
print("spend", vgen.spend_total())
