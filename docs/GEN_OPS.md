# GEN_OPS — generative media for Moongazing

Tools: `tools/cf.py` (sync: images, TTS, music, ASR), `tools/gen.py` (async video queue), `tools/catalog.py`
(catalog refresh), `tools/cfauth.py` (auth). Log: `media/genlog.jsonl` (every call: model, prompt sha + text,
input summary, est. cost, outputs, seconds). Video manifest: `media/gen/manifest.json`. Always run with `.venv/bin/python`.

## Auth and account
- Account `78885e7db58a4c34423a7e62c8471b75`. Auth is the wrangler OAuth token, read from
  `~/.config/.wrangler/config/default.toml` at call time. Within 2 min of expiry `cfauth` runs `npx -y wrangler whoami`
  to refresh it. `CLOUDFLARE_API_TOKEN`, if set, takes precedence. Tokens are never printed or logged.
- The token works for unified `/ai/run`, Workers/KV reads, and KV value read/write. `GET /ai/runs/{id}` returns 405 (no polling of background runs).
- There is no proxy and no 30 s cap here, unlike the old sandbox. Sync image calls take 17–29 s.

## Commands
```bash
# image (sync). Output extension follows the real content. Logs to media/genlog.jsonl
.venv/bin/python tools/cf.py google/nano-banana-pro media/stills/x.jpg --prompt "..." \
    --set aspect_ratio=16:9 --set image_size=2K [--set 'image_input=["file:inputs/a.png"]'] [--dry-run] [--tag=x]
# video (async, via relay cron queue)
.venv/bin/python tools/gen.py spec shot01 bytedance/seedance-2.5 --prompt "..." --image media/stills/x.jpg \
    --ref-image inputs/jade_watercolor.png --audio inputs/moongazing.mp3@62.40+5 --set duration=5 --set resolution=720p
.venv/bin/python tools/gen.py submit media/gen/specs/shot01.json --dry-run   # schema check + cost, no spend
.venv/bin/python tools/gen.py submit media/gen/specs/shot01.json             # queues for a cron minute >=2 min ahead
.venv/bin/python tools/gen.py wait <id>      # or: status / collect [ids]  -> media/gen/<tag>_<id>.mp4
.venv/bin/python tools/gen.py audio-ref SRC START DUR OUT.mp3              # exact window -> mp3 (192k/44.1k)
.venv/bin/python tools/catalog.py            # refresh docs/gen_catalog + live probe (free)
```
- Python: `gen.audio_ref_data_uri(src, start, dur)` returns `data:audio/mpeg;base64,...`. `gen.ref_image(path)` returns a ≤2048 px JPEG.
  Any `"file:<path>"` string in an input becomes a data URI at send time.
- `gen.py` fills required defaults (Seedance 2.5: fps 24, watermark false, output mp4, avatar false, audio off, 480p,
  16:9, 5 s). For `minimax/h3*` you can write `prompt/image/last_frame_image/reference_*`, and it builds `content[]` for you.

## Async path (relay)
`gen.py submit` PUTs `job:<minute>:moongazing/<tag>-<id>` into KV `rare-earth-v3-jobs` (`5f8f1f38…`). The existing
Worker `rare-earth-v3-relay` (cron `* * * * *`, `AI` binding) runs exactly that minute's jobs with `env.AI.run`.
It mirrors the outputs to `media:<job>:<n>` and writes `res:<job>`. The deployed source was read on 2026-10-07 and it matches this protocol.
**We never deploy, modify or delete Workers or KV namespaces.** Bucket choice also counts other projects' queued keys (2/minute).
Job body ≤24 MiB. Results expire after 21 days, so collect promptly. Worker wall time is about 15 min per job.

## Catalog (docs/gen_catalog: 103 media cards from cloudflare-docs @5317ba3, 2026-10-06; LIVE.tsv: every one answers on /ai/run)
**No Kling, no "Hailuo 3", no ElevenLabs sound-effects model** (probed `minimax/hailuo-3`, `hailuo-03`, `kling*`,
`elevenlabs/sound-effects`/`sfx*`, all return 7003 Model not found). MiniMax's newest video model is **`minimax/h3`**.

| model | key params | limits | price |
|---|---|---|---|
| bytedance/seedance-2.5 | prompt≤2000, image, last_frame_image, reference_images≤30, reference_videos≤10, reference_audios≤10, generate_audio | 4–30 s or -1, 480p/720p, 24 fps; refs ≤30 s total | $0.1028/s 480p, $0.2312/s 720p; with video refs $0.4304 / $0.9676 |
| bytedance/seedance-2.0 (/-fast/-mini) | image, last_frame_image, reference_images 1–4, reference_video; mini: reference_audio | 4–12 s; 2.0 up to 4k | 2.0 $0.07/0.15/0.37 (480/720/1080); fast 0.06/0.12; mini 0.04/0.09 |
| minimax/h3 | content[] text/image_url(first_frame, last_frame, reference_image)/video_url/audio_url | 4–15 s, 768P/2K, ratio | $0.08/s 768P, $0.13/s 2K |
| minimax/h3-max (the *fast* variant) | same content[], extra.prompt_expansion_mode | 5–15 s, 480P/768P | $0.05 / $0.08/s |
| minimax/hailuo-2.3 (-fast: i2v only) | prompt, first_frame_image, prompt_optimizer | 6 or 10 s, 768P/1080P | 6 s 768P $0.28 (fast $0.19) |
| google/veo-3.1 (-fast) | prompt, image_input, duration "4s/6s/8s", generate_audio | ≤8 s, 720p/1080p/4k | $0.20/s ($0.40/s with audio); fast $0.08 ($0.10) |
| alibaba/wan-3.0 (-prime), wan-2.7-i2v | prompt, ratio adaptive | 1–15 s, 480–1080P; 2.7/hh1* image must be URL (no base64) | wan-3.0 $0.05/0.10/0.20 per s |
| others | runwayml/gen-4.5 ($0.12/s), aleph-2 (v2v edit, $0.336/s), vidu/q3-pro/turbo, pixverse/v6, ltx-2-5-fast, flux-3-video, pruna/p-video(-avatar: image+audio lip-sync, $0.025/s), flux-video-upscale | | see cards |
| xai/grok-imagine-video(-1.5-preview) | **unusable**: the ZDR account needs `output.upload_url` | | $0.05–0.14/s |
| google/nano-banana-pro | prompt, image_input≤3, aspect_ratio (16:9, 21:9…), image_size 1K/2K/4K | | about $0.134 (1K/2K), $0.24 (4K) |
| google/nano-banana-2 (/-lite) | as pro + `resolution`, google_search | | half / quarter of pro |
| openai/gpt-image-2.5-sunburst (best) / -flare (fast) / gpt-image-2 | prompt, images≤16 (edit), quality low…max, size 1024²/1536x1024/1024x1536 | **no 16:9, max 1536x1024** | $30/1M out tokens: about $0.19 high at 1536x1024 |
| xai/grok-imagine-image-2.0 | prompt, aspect_ratio, resolution 1k/2k, images≤5, mask, **response_format:"b64_json" required (ZDR)** | | $0.04 (+$0.01/input image); base model $0.02 |
| bytedance/seedream-5-pro, flux-2-*, krea-2-*, recraftv4-1 (+vector), qwen-image-3.0-pro | | | $0.015–0.30/image |
| elevenlabs/eleven-v3, multilingual-v2, turbo/flash-v2-5 | text, voice_id, output_format, voice_settings, seed | | $0.0001 or $0.00005/char |
| elevenlabs/music-v2 (also the SFX substitute) | prompt or composition_plan, music_length_ms 3 s–10 min, force_instrumental | | $0.0025/s |
| ASR | xai/grok-stt ($0.0017/min, word timings), assemblyai/universal-3.5-pro, openai/gpt-4o-transcribe | | |

## Gotchas
- Seedance 2.5: required keys plus `additionalProperties:false`, which `gen.py` fills. With `image`, set `aspect_ratio:"adaptive"`.
  `camera_fixed` has no effect, so say it in the prompt. Realistic faces can trip the face filter (`use_virtual_avatar:true`).
  With the song as `reference_audios`, keep `generate_audio:false` to avoid the copyright filter on output audio.
  Reference images must have aspect 0.39–2.5.
- The mp3 from `audio_ref` carries about 25 ms of LAME encoder delay. It is gapless-tagged, so align on the decoded audio.
- Costs here are list-price estimates. The account bill cannot be read with this token. Errored runs are normally not billed.
- There is no `ffprobe`, so `gen.py` probes with PyAV. Use `.venv/bin/ffmpeg` (no drawtext).

## Smoke tests (2026-10-07, media/tests + media/gen)
Prompt: "a single full moon painted in Chinese ink wash on white xuan paper, vast negative space, a small red seal in the corner".

| output | model | result |
|---|---|---|
| media/tests/moon_nano_banana_pro.jpg | google/nano-banana-pro 16:9 2K | OK, 23.6 s, 2752x1536, about $0.134 |
| media/tests/moon_gpt_image_2_5_sunburst.png | openai/gpt-image-2.5-sunburst high 1536x1024 | OK, 29.1 s, 3:2 (no 16:9 size), about $0.19 |
| media/tests/moon_grok_imagine_2.png | xai/grok-imagine-image-2.0 16:9 2k | OK, 18.4 s, 2816x1584, $0.04 |
| media/gen/smoke_seedance25_i2v_de01921b07.mp4 | seedance-2.5 i2v 480p 4 s (nano image) | OK. Gen 138 s in Worker, **295 s submit→result**. 854x480, 24 fps, 97 frames, no audio, $0.41 |
| media/gen/smoke_h3_i2v_6335439d8d.mp4 | minimax/h3 i2v 768P 6 s (same image, data URI OK) | OK. Gen 179 s, **335 s submit→result**. 1344x768, 6.58 s, **includes an AAC audio track**, $0.48 |

Total smoke spend is about $1.25 at list price. Latency is about 2 min of queue lead plus generation time.
**minimax/h3 via env.AI.run returns the raw provider task** (`result.task.content.url` on video-product.cdn.minimax.io).
The relay does not mirror that, so `gen.py collect` downloads it from the MiniMax CDN. Collect promptly because that URL expires. Strip H3 audio with `-an` if not wanted.
