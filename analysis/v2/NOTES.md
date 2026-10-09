# New-track timing notes

Source: `inputs/Moongazing - 2 semitones down.mp3`, 208.360 s, gapless decoded audio only. All JSON times use this source, not the 210.860 s repaired master. The master preserves the dry source until 207.002 s; its added tail requires a separate render-end decision.

Bars 1-104 retain the original 4/4 music and section identities. No metric bar was added or removed. The drop is 120.959-187.325 s (b67-b104). The tracker half-time gaps were filled by counted pulses and checked against new drum attacks; late tracker downbeat-phase mistakes were rejected. Bars 105-111 use the guzheng pulse and are less certain. After b111.1 (198.141 s), progressively slowing plucks are free time; grid entries are flagged extrapolated. Old b116.4 and b117.1 are only virtual tail addresses and lie beyond the new file under uniform tempo continuation, not removed musical bars.

The warp contains every old beat. After old b111.1 it is an approximate monotonic transport, anchored to the new final pluck and source end; it cannot encode the rearranged ending. `events` and lyric timings take precedence. In particular the old boom maps to 204.205 s while old later separate plucks have no unique counterparts and receive explicitly low-confidence warp guesses.

Tempo (BPM, from counted beat intervals):

| Section | Old | New |
|---|---:|---:|
| Intro b1-16 | 128.95 | 129.99 |
| V1 b17-24 | 130.59 | 133.39 |
| V2 b25-40 | 132.44 | 134.93 |
| Hook b41-54 | 133.22 | 135.74 |
| Breakdown/build b61-66 | 134.52 | 136.49 |
| Drop b67-104 | 135.95 | 137.42 |
| Interlude b55-60 | 134.13 | 136.20 |
| Outro pulse b105-110 | 132.94 | 133.14 |

Same lyric IDs/text/order, no credible extra or repeated lyric line. Weak/swallowed `in`, and near-homophone recognition errors, are flagged rather than silently changing text. First consonants often precede CTC vowels by 0.2-0.3 s. Two MMS passes plus stable-ts/ASR and stem energy were checked; L11 swallowed I syllables required re-attack corrections.

Vocal/arrangement changes: intro vocalise begins 16.689 s (old 18.6); its old distinct 22.75 s ah bloom has no unique new counterpart. A bowed instrumental phrase at 7.523-13.671 s leaks into both vocal stems: AST violin/erhu evidence rejects it as singing. The opening chord is also a RoFormer false positive. The old 134.24-134.87 s vocal chop is absent in its new corresponding region. Drop wordless lead lasts about 159.997-171.15 s, longer than before. A probable new wordless/synthetic singing passage runs 176.042-191.954 s (identity medium confidence). Old 186.9-190.1 erhu-only attribution no longer holds there. Old wine falsetto is absent: new wine ends with a lower tone around 221 Hz. 乡 holds ~440 Hz and flips to ~880 Hz at 120.48, before the 120.959 drop.

Ending: groove cuts at 187.325 s; a final drum attack/tail appears near 189.05-189.3, and drums are below -75 dB by about 189.5. New voice-like lead decays across the cut to 191.95. Humming then re-enters independently at 192.505 and stays above -42 dB to 196.621 (faint tail to ~198.5), later against the beat than the old hum. Guzheng plucks continue and slow: about 198.62, 198.85, 199.08, 199.31, 199.55, 199.79, 200.06, 200.37, 200.68, 201.02, 201.45, 201.93, 202.32 s (onset precision about 10-20 ms). There is no old-style 200.5-201.3 silent dip at the corresponding phrase point. Final solo G3 hum has breath/lead-in ~202.79, full voice 203.024-204.15; RoFormer attenuates it, Demucs and AST recover it. Final chord starts building ~204.01; the principal last pluck attacks at 204.190 (upper-band novelty 204.196), with low boom/sub attack about 204.205 and low-band peaks 204.225-204.243. No independent subsequent pluck; the tail decays to source end 208.360. The old ordered boom -> 205.7/207.0/208.3 plucks -> 210.04 last pluck is rearranged, not simply sped up.

Low confidence: all following old event times explicitly carry uncertainty: 2.43, 2.49, 2.55, 2.62, 9.14, 22.75, 45.3, 77.4, 83.3, 83.4, 86.1, 92.2, 119.6, 122.62, 173.0, 197.04, 200.5, 205.7, 207.0, 208.3. The rolled opening chord has changed and its individual 2.43/2.49/2.55 attacks cannot be uniquely paired. 2.62 is a broad spectral/strum-peak match, also low confidence. L11 you/ad-lib split is approximate (+/-0.3 s); swallowed I and weak consonants are marked per word. Voice/instrument attribution of the late synthetic lead remains medium confidence. Final solo hum timing is medium confidence because separator outputs differ.

Lyric starts relative to nearest beat; movement compares the new onset with the new counterpart of the OLD nearest beat (so a beat change cannot conceal vocal movement):

| Line | Old start / nearest beat | New start / nearest beat | Movement vs matched old beat |
|---|---|---|---:|
| L01 | 32.141; 16.4 +187 ms | 31.948; 16.4 +169 ms | -18 ms |
| L02 | 35.846; 18.4 +189 ms | 35.422; 18.4 +10 ms | -179 ms |
| L03 | 39.531; 20.4 +201 ms | 38.986; 20.4 -22 ms | -223 ms |
| L04 | 43.155; 22.4 +158 ms | 42.533; 22.4 -56 ms | -214 ms |
| L05 | 46.820; 24.4 +159 ms | 46.155; 24.4 -24 ms | -183 ms |
| L06 | 50.490; 26.4 +187 ms | 49.714; 26.4 -28 ms | -215 ms |
| L07 | 54.090; 28.4 +149 ms | 53.249; 28.4 -63 ms | -212 ms |
| L08 | 57.849; 31.1 -179 ms | 57.149; 31.1 -177 ms | +2 ms |
| L09 | 65.750; 35.2 +31 ms | 64.871; 35.2 +0 ms | -31 ms |
| L10 | 77.160; 41.3 +143 ms | 76.463; 41.4 +46 ms | +347 ms |
| L11 | 86.620; 46.4 +134 ms | 85.258; 46.4 -3 ms | -137 ms |
| L12 | 92.213; 50.1 -121 ms | 90.887; 50.1 -116 ms | +5 ms |
| L13 | 94.900; 51.3 -132 ms | 93.484; 51.3 -167 ms | -35 ms |
| L14a | 111.950; 61.1 -120 ms | 110.283; 61.1 -126 ms | -6 ms |
| L14b | 115.566; 63.1 -75 ms | 113.860; 63.1 -68 ms | +7 ms |

Checks (onset strength: 1024-point centered mel STFT, hop 128 at 22050 Hz, correctly compensated 1024 FFT onset latency; local max +/-12 ms on beats versus halfway between beats):

| Section | Source | n | On beat | Between | Ratio | Best residual |
|---|---|---:|---:|---:|---:|---:|
| Intro A | dr | 28 | 1.355 | 1.250 | 1.084 | +4 ms |
| Intro A | mix | 28 | 1.313 | 1.185 | 1.108 | +16 ms |
| Intro B | dr | 32 | 2.821 | 2.899 | 0.973 | -2 ms |
| Intro B | mix | 32 | 1.218 | 1.147 | 1.062 | +4 ms |
| gap | dr | 4 | 1.322 | 1.026 | 1.287 | -2 ms |
| gap | mix | 4 | 1.373 | 1.016 | 1.352 | +4 ms |
| V1 | dr | 32 | 0.064 | 0.091 | 0.698 | -40 ms |
| V1 | mix | 32 | 1.187 | 1.159 | 1.024 | +14 ms |
| V2 | dr | 64 | 4.507 | 2.970 | 1.518 | +0 ms |
| V2 | mix | 64 | 1.671 | 1.310 | 1.275 | +6 ms |
| Hook | dr | 56 | 3.638 | 1.934 | 1.881 | +2 ms |
| Hook | mix | 56 | 1.286 | 0.857 | 1.502 | +8 ms |
| Interlude | dr | 24 | 2.382 | 2.047 | 1.163 | +4 ms |
| Interlude | mix | 24 | 1.895 | 1.538 | 1.232 | +4 ms |
| Brk | dr | 16 | 4.527 | 3.663 | 1.236 | -4 ms |
| Brk | mix | 16 | 1.349 | 1.135 | 1.188 | +2 ms |
| Build | dr | 8 | 6.181 | 5.277 | 1.171 | -2 ms |
| Build | mix | 8 | 2.549 | 2.394 | 1.065 | +0 ms |
| Drop | dr | 152 | 7.859 | 6.686 | 1.176 | +4 ms |
| Drop | mix | 152 | 2.193 | 1.929 | 1.137 | +10 ms |
| Outro | dr | 25 | 0.482 | 0.208 | 2.319 | +8 ms |
| Outro | mix | 25 | 1.962 | 1.380 | 1.422 | +8 ms |

Eighth-note guzheng arpeggios and syncopated drums put legitimate attacks between quarter beats, so ratios near/below one in sparse intro/V1 are expected. V1 drum-stem energy is leakage, not a tempo measurement. No claim is made that every beat has a drum attack; absent hits use the surrounding counted tracker pulse.

Validation: 64/64 requested events; 63 musical/reference events strictly before source end, one explicit end boundary at 208.360. Warp 468 knots, 465/465 old beat times included; both columns strictly increasing (minimum steps 0.226000 s old, 0.146211 s new). Grid 463 entries, 441 observed/counted pulse references, remainder extrapolated. Drum-onset support within +/-35 ms on 279/320 quarter beats in b25-b104 (others include syncopated/absent hits). 15/15 lyric lines in order, identical IDs/text/units; 87 word/Chinese-character units, all valid intervals and contained in their lines. All starts have vocal energy above -45 dB within 80 ms; minimum active fraction above -42 dB across a line 0.934. Stem/mix duration agrees at 208.360 s. Full per-line energy and onset check numbers: `analysis/work/v2/validation.json`. CPU MMS, faster-whisper/stable-ts, AST, pYIN/librosa; supplied external GPU stems only. No model download needed.
