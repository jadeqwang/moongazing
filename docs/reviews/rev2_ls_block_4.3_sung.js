    // 4.3 — 我思念, sung: Jade in the capsule seat, close on her face. CLIP is a p-video-avatar take driven by the vocal
    //       stem from 78.91 s (the take's audio is the stem at 0 ms), started from a 1.3x crop of the painted J_LS3
    //       (media/keyframes/jade/J_LS3_close.png). The take's OWN mouth is drawn (no JS mouth), on ones; its teeth
    //       are flattened to one pale band and the painted keyframe's eyes, glasses and nose ride on the head
    //       (tools/ls_sung_prep.py). Previous pick, non-singing: J_4.3/take_1 (offset 0.55, from 0.52/0.5/1.04).
    { id: '4.3', t0: S43, t1: S43b, paper: 'indigo', grain: 43, post: (t, lt) => punch(t, lt), focus: [1150, 500],
      scene: [{ type: 'roto', clip: 'CLIP', paper: 'gold', lock: 0, mouth: false, eyelock: false, redrawAll: 1, twos: false,
        // song time -> take time. The take's audio is the stem from 78.91 s, so "t - 78.91" is already in sync; the model
        // closes into the s of 思 about 4 frames early, so 我's vowel is held (rate 0.75) and the time is given back
        // during the static 思 (rate 1.21): [song s, take s] anchors, linear between them
        time: (lt, t) => { const A = SUNG; let i = 0; while (i < A.length - 2 && t >= A[i + 1][0]) i++; return A[i][1] + (t - A[i][0]) * (A[i + 1][1] - A[i][1]) / (A[i + 1][0] - A[i][0]); },
        from: { x: 0.5, y: 0.5, zoom: 1.02 }, to: { x: 0.5, y: 0.49, zoom: 1.05 } }],
      type(ctx, t) {
        lyricZH(ctx, L.L10, { from: 5, to: 8, size: 180, x: 290, y: 110, color: WHITE, seed: 103, until: S43b + 0.05, key: 'c', halo: 12 }, t, 'gold');
        hud(ctx, 'MAX-Q  ·  3.2 G', 64, 1030, { size: 15, rgb: '255,255,255' }, 1);
      } },
