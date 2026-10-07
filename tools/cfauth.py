"""Cloudflare auth for the moongazing toolkit.

Reads the wrangler OAuth token from ~/.config/.wrangler/config/default.toml at call time
(never cached on disk, never printed). If it is expired (or within 2 min of expiry), runs
`npx -y wrangler whoami`, which refreshes it, then re-reads. CLOUDFLARE_API_TOKEN, if set, wins.
"""
import datetime
import os
import subprocess
import tomllib

WRANGLER_CFG = os.path.expanduser(os.environ.get("WRANGLER_CONFIG", "~/.config/.wrangler/config/default.toml"))
ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "78885e7db58a4c34423a7e62c8471b75")
API = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}"


def _read():
    with open(WRANGLER_CFG, "rb") as f:
        d = tomllib.load(f)
    exp = d.get("expiration_time")
    exp = datetime.datetime.fromisoformat(exp.replace("Z", "+00:00")) if exp else None
    return d.get("oauth_token"), exp


def token():
    env = os.environ.get("CLOUDFLARE_API_TOKEN")
    if env:
        return env
    tok, exp = _read()
    now = datetime.datetime.now(datetime.timezone.utc)
    if not tok or (exp and exp - now < datetime.timedelta(minutes=2)):
        subprocess.run(["npx", "-y", "wrangler", "whoami"], stdout=subprocess.DEVNULL,
                       stderr=subprocess.DEVNULL, timeout=180, check=False)
        tok, exp = _read()
        if not tok or (exp and exp < now):
            raise RuntimeError("wrangler OAuth token expired and refresh failed; run `npx wrangler login`")
    return tok


def headers(extra=None):
    h = {"Authorization": f"Bearer {token()}"}
    if extra:
        h.update(extra)
    return h
