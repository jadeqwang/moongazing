// SECTION 3 · VERSE 2 — 46.82–76.11 (kit 47.14; strings 51; full band lift 61.65). Type grows: English lyrics at
// ~60–80 px, the Li Bai couplet as big calligraphy across the wall, HUD labels in the training montage.
import { lyricEN, lyricZH, calli, card, hud, kf, ph, bump, INK, INKC, PALE, PALEC, WHITE, smooth, easeInOutSine } from './_lib.js';
import { plateMap } from '../scenes/plate.js';

export const range = [46.82, 76.11];


// 3.6a — the human centrifuge as a RIGID rotation of the painted arm (K_3.6a split offline by
// scratchpad centrifuge.py into a clean floor plate + arm / gondola / hub sprites in keyframe px). The arm turns in the
// floor plane about the hub axis: in screen space that is M = T(p)·S(1,k)·R(θ)·S(1,1/k)·T(−p) (parallel oblique
// projection, rings are ellipses of ratio k), drawn with a short motion-blur shutter; the gondola rides the arm tip
// (translated, not rotated: it is a body of revolution); the hub is drawn on top.
const KW = 2752, KH = 1536, PIV = [1385, 1055], RK = 0.578, TIP = [2190, 719];
function centrifuge(t0, t1) {
  const view = { from: { x: 0.6, y: 0.47, zoom: 1.22 }, to: { x: 0.62, y: 0.46, zoom: 1.32 } };
  const P = { img: 'K_3.6a_floor', grade: 'native', ...view, par: [0, 0], dolly: 0 };
  const W0 = -0.09, OMEGA = 1.95, SHUTTER = 0.022, N = 10;           // rad, rad/s (≈19 rpm on screen), s
  const theta = (lt) => W0 + OMEGA * lt;
  const M = (th) => { const c = Math.cos(th), s = Math.sin(th);
    const a = c, b = -s / RK, d = RK * s, e = c;                         // S(1,k) R S(1,1/k)
    return [a, d, b, e, PIV[0] - a * PIV[0] - b * PIV[1], PIV[1] - d * PIV[0] - e * PIV[1]]; };   // canvas order a,b,c,d,e,f
  return {
    needs: ['K_3.6a_floor', 'K_3.6a_arm', 'K_3.6a_gondola', 'K_3.6a_hub'], focus: [1300, 420],
    scene: [{ name: 'plate', params: P }],
    spin(ctx, t, lt) {
      const map = plateMap(P, lt, t1 - t0, { width: KW, height: KH });
      const base = (g) => g.transform(map.a[0] / KW, 0, 0, map.a[1] / KH, map.b[0], map.b[1]);
      const blur = (img, place) => ctx.pipe.layer((g) => {
        if (!img) return;
        base(g); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 / N;
        for (let k = 0; k < N; k++) { g.save(); place(g, theta(lt - SHUTTER * k / (N - 1))); g.drawImage(img, 0, 0, KW, KH); g.restore(); }
      }, { mode: 'over', seed: 361 });
      blur(ctx.assets['K_3.6a_arm'], (g, th) => g.transform(...M(th)));
      blur(ctx.assets['K_3.6a_gondola'], (g, th) => { const m = M(th);
        g.translate(m[0] * TIP[0] + m[2] * TIP[1] + m[4] - TIP[0], m[1] * TIP[0] + m[3] * TIP[1] + m[5] - TIP[1]); });
      ctx.pipe.layer((g) => { const img = ctx.assets['K_3.6a_hub']; if (img) { base(g); g.drawImage(img, 0, 0, KW, KH); } }, { mode: 'over', seed: 362 });
    },
  };
}

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  const W = (id, i) => L[id].words[i].start;
  const S31 = L.L05.start, S32 = L.L06.start, S33 = W('L06', 2), S34 = L.L07.start, S34b = W('L07', 3), S34c = bar(30);   // 3.4: wide | side view from 明 | close from the bar-30 downbeat
  // 3.5 (rev 4, ENV): each take holds its drawings two or three frames, so both shots show one of the take's own drawings
  // for every two film frames (the take's frame numbers, in order). AB35: his hand lets go (7-19), she holds both ends
  // (21-26), turns it over (28 tilted, 31 steep, 34 edge-on, 37-51 the sealed back coming round), it lands (54) and settles.
  // C35: the packet comes out and down to her (4-24), two drawings of her hold, the top panel up and the bottom panel down
  // at the take's own speed (40-56), the open page.
  const AB35 = [7, 10, 12, 13, 15, 16, 18, 19, 21, 24, 26, 28, 31, 34, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63];
  const C35 = [4, 8, 12, 14, 16, 18, 20, 22, 24, 30, 36, 40, 42, 44, 46, 48, 50, 52, 54, 56, 60, 64];
  const drawings35 = (D) => (lt) => (D[Math.min(D.length - 1, Math.max(0, Math.floor(lt * 12 + 1e-3)))] + 0.25) / 24;
  const S35 = L.L08.start, S36 = bar(33), S37 = L.L09.start, S38 = bar(38, 2), HOOK = bar(41);
  const mid = { size: 66, font: 'Cormorant', tracking: 0.02 };
  const FINE = { lineA: 0.3, lineW: 0.09, snapAmt: 0.2, shade: 0.2 };   // 3.4 wide + side view: small faces, so a thin quiet line and the take's own colour
  const gloss = (ctx, t, a, b, color, y = 1046) => card(ctx, 'gloss07', { lines: [[{ t: 'I raise my cup to invite the bright Moon; with my shadow, we make three.', font: 'CormorantItalic' }]], size: 30, x: 960, y, align: 'center', color }, t, a, b, color === INK ? 'ink' : 'over');
  // the montage: one drawing per beat. Each training shot is a redrawn motion base (roto) on its own paper; the
  // centrifuge is a JS rigid rotation of the painted arm (the generated spin loses the gondola).
  const HAS_F = X.has('K_3.6f');
  const mt = [bar(33), bar(33, 2), bar(33, 3), bar(33, 4), bar(34), HAS_F ? bar(34, 4) : S37];
  const mont = [
    ['K_3.6a', 'HUMAN CENTRIFUGE  ·  8 G', null],
    ['K_3.6b', 'NEUTRAL BUOYANCY  ·  12 M', { type: 'roto', clip: 'K_3.6b/take_6', paper: 'silk', offset: 0.5, lock: 0.12, from: { x: 0.4, y: 0.5, zoom: 1.3 }, to: { x: 0.39, y: 0.49, zoom: 1.38 } }],
    ['K_3.6c', 'PARABOLIC FLIGHT  ·  0 G  ·  22 S', { type: 'roto', clip: 'K_3.6c/take_4', paper: 'silk', offset: 0.35, lock: 0.12, from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.5, y: 0.5, zoom: 1.12 } }],
    // the hammer is up at the cut and strikes two frames in (take frame 12); chips fly through the beat
    ['K_3.6d', 'ICELAND  ·  BASALT FIELD', { type: 'roto', clip: 'K_3.6d/take_2', paper: 'silk', offset: 0.42, lock: 0.0, from: { x: 0.55, y: 0.48, zoom: 1.12 }, to: { x: 0.56, y: 0.48, zoom: 1.18 } }],
    // 3.6e: no lock, cut in at 0.5 s (she is already writing). Her face is the key plate's face carried on the head
    // (meta.keep, tools/roto_keep.py): the ink redraw collapsed it. The laptop (a LaTeX paper + a music player) and the far
    // page (a textbook page on the Hohmann transfer) are composited into the roto key by tools/desk_comp.py.
    ['J_3.6e', 'ORBITAL MECHANICS  ·  03:00', { type: 'roto', clip: 'J_3.6e/take_2', paper: 'ink', offset: 0.5, lock: 0, keepOcc: false, from: { x: 0.5, y: 0.5, zoom: 1.04 }, to: { x: 0.5, y: 0.5, zoom: 1.12 } }],
  ];
  const montage = mont.map(([img, label, roto], i) => ({
    id: `3.6${'abcde'[i]}`, t0: mt[i], t1: mt[i + 1], paper: i === 4 ? 'xuan' : 'silk', grain: 360 + i, post: (t, lt) => bump(lt, 0.012),
    ...(i === 0 ? centrifuge(mt[0], mt[1]) : { scene: [roto] }),
    type(ctx, t, lt) {
      if (i === 0) this.spin(ctx, t, lt);
      hud(ctx, label, 64, 72, { size: 15, rgb: '232,72,52', a: 0.95 }, 1);
      hud(ctx, `T−${String(14 - i).padStart(2, '0')} WEEKS`, 64, 98, { size: 13, rgb: i === 4 ? '30,30,34' : '240,232,214' }, 1);
      if (i === 4) lyricEN(ctx, L.L08, { ...mid, key: 'm', size: 74, x: 1840, y: 860, align: 'right', color: INK, breaks: [4], text: { 3: 'you —' } }, t);   // in the wash, clear of her
      else lyricEN(ctx, L.L08, { ...mid, key: 'm', size: 74, x: 120, y: 980, color: PALE, breaks: [4], panel: 'dark', text: { 3: 'you —' } }, t, 'over');
    },
  }));
  return [
    // 3.1 — kit hits: the teahouse table, three generations (Jade, her mother, M), snow outside
    { id: '3.1', t0: S31, t1: S32, paper: 'silk', grain: 31, focus: [1000, 640],
      // J_3.1: Jade, her mother and M at a Hangzhou teahouse table, blossoms, silk lanterns, snow outside (K_3.1 until
      // it lands); continues 2.5's pull-back from behind the opened lattice doors
      // J_3.1 v3 keyframe (mother's painted eyes lowered to the pour) + take_6 (rev2_tea, Jade's note on v4): Jade bows
      // her head to M and kisses her forehead, M tilts her face up with her eyes shut; her mother pours by the handle,
      // fingertips on the lid, eyes on the stream, then rights the pot. The clip clock continues from 2.5, which runs the
      // same take slowed (see there) and hands over at 0.255 + 0.7 * (S31 - bar(24)) = 1.33 s at rate 1; from here
      // the rate follows the knots K [shot seconds, rate] (1.06 through the kiss, 0.75 for the drawing back), so the
      // lips touch two frames after the cut, the kiss settles on the kit hit (47.14), is released on "watching" (48.9,
      // bar 26) and Jade is drawn back, still looking at M, for the last second; the shot ends at 4.76 s of the take,
      // before the figures settle (they are still from 4.85 s: do not run later). Only the mother's painted face is carried (meta.keep, tools/roto_keep.py).
      scene: [X.pick('J_3.1') ? { type: 'roto', clip: X.pick('J_3.1').clip, paper: 'silk', offset: 0.255 + 0.7 * (S31 - bar(24)), time: (lt) => { const K = [[0, 1.06], [2.0, 1.06], [2.4, 0.75], [9, 0.75]]; let c = 0.255 + 0.7 * (S31 - bar(24)); for (let i = 0; i + 1 < K.length && lt > K[i][0]; i++) { const u = Math.min(lt, K[i + 1][0]) - K[i][0]; c += K[i][1] * u + (K[i + 1][1] - K[i][1]) * u * u / (2 * (K[i + 1][0] - K[i][0])); } return c; }, lock: 0, style: { snapAmt: 0.12, lineTh: 0.62, lineA: 0.62 }, from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.04 } }
        : X.has('J_3.1') ? kf('J_3.1', { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.04 }, par: [0, 0], dolly: -0.04, masks: { base: [0.0, 0.6] } })
        : X.has('K_3.1') ? kf('K_3.1', { from: { x: 0.5, y: 0.5, zoom: 1.12 }, to: { x: 0.5, y: 0.52, zoom: 1.04 }, par: [0, 0], dolly: -0.04,
          masks: { base: [0.0, 0.6], polys: [{ pts: [[0.25, 0.3], [0.85, 0.3], [0.85, 1], [0.25, 1]], depth: 0.85, blur: 10 }] },
          mist: { color: [0.95, 0.94, 0.9], amount: 0.18, y0: 80, y1: 360, speed: 6 } }) : ph('Afternoon teahouse; Jade, her mother and M at the table; snow', 'J_3.1')],
      type(ctx, t) { lyricEN(ctx, L.L05, { ...mid, x: 80, y: 600, breaks: X.has('J_3.1') ? [2, 3] : [], color: INK, ...(X.has('J_3.1') ? {} : { x: 960, y: 170, align: 'center', panel: 'light' }) }, t); } },   // J_3.1: on the plain wall, left of the family
    // 3.2 — a tangyuan bitten into a crescent (月缺) on the same table: J_3.2 (macro still, slow push) when it lands;
    //       until then K_3.2/take_2 (Seedance: the chopsticks lift the bitten crescent out of the bowl)
    //       J_3.2/take_3 from 0.5 s (tight on the bowl: one focal point): the spoon hand is alive in every half second (it tilts and turns the spoon, the
    //       bitten tangyuan rocks in the broth) while her mother's hand comes in from the right for the chopsticks on
    //       the rest. No lock (no still frame at the cut). The spoon hand stills after 2.25 s of the take: keep offset.
    { id: '3.2', t0: S32, t1: S33, paper: 'silk', grain: 32,
      scene: [X.pick('J_3.2') ? { type: 'roto', clip: X.pick('J_3.2').clip, paper: 'silk', offset: 0.5, lock: 0, style: { snapAmt: 0.12, lineTh: 0.62, lineA: 0.62 }, from: { x: 0.43, y: 0.52, zoom: 1.2 }, to: { x: 0.42, y: 0.5, zoom: 1.3 } }
        : X.has('J_3.2') ? kf('J_3.2', { from: { x: 0.5, y: 0.52, zoom: 1.06 }, to: { x: 0.49, y: 0.5, zoom: 1.16 }, dolly: 0.08, masks: { base: [0.1, 0.7] } })
        : { type: 'roto', clip: 'K_3.2/take_2', paper: 'silk', offset: 1.7, lock: 0.0, from: { x: 0.45, y: 0.52, zoom: 1.08 }, to: { x: 0.43, y: 0.5, zoom: 1.18 } }],
      // the lyric sits low on the dark table, under the bowl
      type(ctx, t) { lyricEN(ctx, L.L06, { ...mid, key: 'a', x: 1860, y: 1030, align: 'right', color: PALE, panel: 'dark', w1: 2, text: { 1: 'tea.' }, until: S33 + 0.1 }, t, 'over'); } },
    // 3.3 — "That line—": the inscription 举杯邀明月 is old ink on the teahouse wall from the first frame; Jade's finger
    //       reads down the column beside it. K_3.3_hand/take_6 (a hand moving down a BLANK wall) is redrawn on the clean
    //       wall plate K_3.3_wall (tools/wallread_prep.py: the subject matte is the hand and its shadow only); the JS
    //       column is laid on the wall just left of the fingertip's path, clear of the hand. Rev 3 (Jade: "let the hand
    //       move smoothly down"): ONE glide, no dwell at each character. take_6g = take_6 resampled offline
    //       (tools/glide_resample.py, optical-flow in-betweens) so that its frame PAD + n is film frame n and the
    //       fingertip falls from beside 举 to the foot of 月 at an even pace that eases off a little (speed 120% -> 80%
    //       of the mean); drawn on ONES (twos: false): a new drawing every film frame. Beside 杯 at 0.42 s, 邀 0.82,
    //       明 1.27, 月 1.74; moving at the cut, still moving at the end.
    (() => {
      const dur = S34 - S33, N = 5;
      const SZ = 116, LEAD = 1.06;                                       // column pitch in take px = SZ * LEAD / 1.5 = 82
      const YTOP = 79.4, XR = 626;                                       // take px: column top; its right edge (fingertip x 638–651, minus a gap)
      const PAD = 3;                                                     // glide_resample --pad: the clip's frame 3 is the shot's first frame
      const time = (lt) => (PAD + Math.max(0, Math.floor(lt * 24 + 1e-3)) + 0.5) / 24;
      const from = { x: 0.5, y: 0.47, zoom: 1.0 }, to = { x: 0.5, y: 0.47, zoom: 1.06 };
      return { id: '3.3', t0: S33, t1: S34, paper: 'silk', grain: 33, focus: [1000, 430], needs: ['K_3.3_wall'],
        scene: [{ type: 'roto', clip: 'K_3.3_hand/take_6g', paper: 'silk', time, twos: false, lock: 0, from, to, style: { snapAmt: 0.05, lineTh: 0.62, lineA: 0.6 } }],
        type(ctx, t, lt) {
          // the column follows the roto view (16:9 take: screen = ((p / size − centre) · zoom + 0.5) · frame)
          const u = easeInOutSine(lt / dur), z = from.zoom + (to.zoom - from.zoom) * u, h = 0.5 / z;
          const cx = Math.min(Math.max(from.x + (to.x - from.x) * u, h), 1 - h), cy = Math.min(Math.max(from.y + (to.y - from.y) * u, h), 1 - h);
          const it = ctx.type.inkText('wall33r', { text: '举杯邀明月', font: 'MaShanZheng', size: SZ, x: XR * 1.5, y: YTOP * 1.5, color: [0.1, 0.085, 0.075], seed: 33, lead: LEAD });
          ctx.pipe.layer((g) => {
            g.translate((0.5 - cx * z) * 1920, (0.5 - cy * z) * 1080); g.scale(z, z);
            g.globalAlpha = 0.86; it.draw(g, N + 0.25, 1);                 // complete from the first frame: old, dry ink
          }, { mode: 'ink', absorb: 0.6, seed: 332 });
          lyricEN(ctx, L.L06, { ...mid, key: 'b', size: 60, x: 150, y: 900, color: INK, w0: 2, italic: [0, 1], text: { 1: 'line—' }, until: S34 + 0.02 }, t);   // faded out by the cut (it used to be cut off half-faded)
        } };
    })(),
    // 3.4 — the Copernican lesson, three views of ONE staging and ONE light (3D blockout: render/scenes/blockouts/3.4_lesson;
    //       the flashlight is the only lamp; the Moon ball's shadow shaft ends as a dark round spot on the globe; the
    //       children's plain cast shadows stand in the pool of light on the wall; no corona disc anywhere).
    //       举杯邀 = the wide (K_3.4_lesson); 明月，对影 = the side view (K_3.4_wall); 成三人 = close along the beam
    //       (K_3.4_beam: the spot rests on Anatolia, T grins at his sister; this replaces the lip-sync shot LS2).
    //       Every take is cut in with the motion under way (offset >= 0.5, lock 0). The calligraphy crosses the dim wall
    //       above their heads, each character on its sung onset.
    ...[['3.4a', S34, S34b, 'K_3.4_lesson', 0.6, { x: 0.5, y: 0.52, zoom: 1.05 }, { x: 0.53, y: 0.5, zoom: 1.12 }, [1060, 470], FINE],
      ['3.4b', S34b, S34c, 'K_3.4_wall', 0.6, { x: 0.5, y: 0.52, zoom: 1.03 }, { x: 0.54, y: 0.53, zoom: 1.11 }, [1090, 500], FINE],
      // 2.5 s (frame 60, even: the take is on twos): T watches the spot, tilts his head and grins at his sister.
      // rev3 KIDS (Oct 8): the globe has real coastlines and the Moon's shadow sits on central Anatolia (Jade's Easter egg
      // for the Battle of Halys film); in all three views the painted globe is CARRIED on the take (tools/roto_keep.py), so
      // its map and the spot cannot drift, and in the two wider views T's repainted head (fuller cheeks) is carried too.
      ['3.4c', S34c, S35, 'K_3.4_beam', 2.5, { x: 0.52, y: 0.54, zoom: 1.03 }, { x: 0.55, y: 0.55, zoom: 1.1 }, [1130, 640], {}]].map(([id, a, b, key, offset, from, to, focus, style], j) => ({
      id, t0: a, t1: b, paper: 'silk', grain: 340 + j, focus, vignette: 0.22,
      // the whole picture is redrawn from the take (redrawAll): the children move against a plain wall, and a held keyframe
      // under a moving child leaves ghosts of hair and face
      scene: [X.pick(key) ? { type: 'roto', clip: X.pick(key).clip, paper: 'silk', offset, lock: 0, from, to, redrawAll: 1, keepOcc: false, style }
        : X.has(key) ? kf(key, { from, to, dolly: 0.05, masks: { base: [0.15, 0.6] } }) : ph('The Copernican lesson', key)],
      type(ctx, t) {
        // pale brush on the dim wall, in all three views; no wash
        lyricZH(ctx, L.L07, { size: 104, vertical: false, lead: 1.0, x: 300, y: 28, color: PALEC, seed: 70, until: S35 + 0.05 }, t, 'over');   // 人 is sung 0.3 s before the cut: it is brushed with 三 (lyricZH joins a late last character)
        gloss(ctx, t, S34 + 0.6, S35 + 0.05, PALE);
      },
    })),
    // 3.5 — the mission assignment (docs/research_mission_assignment.md): the formal signed copy, handed to her after the
    //       chief's call. Rev 4 (Jade on v6: a sticker seal, the words must stay on the envelope, a real trifold that she
    //       opens, no jump at 0:59). A real US No. 10 envelope and US Letter sheet, painted over the true-size blockout
    //       scenes/blockouts/3.5/blockout.py. TWO shots (3.5b is now part of 3.5a: the turn is one continuous take, so
    //       there is no cut inside it), each with a painted first AND last frame:
    //       3.5a to the bar-32 downbeat: Kenton's larger hand (navy cuff, from the right) lets go and leaves; the FRONT is
    //            legible (MISSION ASSIGNMENT / 飞行任务通知书 / Dr. Jade Wang, set in JS on the paper, which is measured
    //            in every drawing: scenes/papertype.js sheet envelopeFront10, tools/paper_quad.py); she takes both ends
    //            and turns it over sideways; the type goes round with the face; the back lands, its flap SEALED with the
    //            pale-blue-dot sticker (K_3.5_front/take_6, first frame K_3.5_front, last K_3.5_back).
    //       3.5c the flap is open (the cut stands for her breaking the seal; the sticker stays on the envelope's body):
    //            the letter comes out as a folded packet a third of the page tall, she brings it to her, opens the top
    //            panel up and away, the bottom panel down toward her; the print is inside (grey lines too small to read,
    //            baked into the take) (K_3.5_letter/take_7, first frame K_3.5_letter, last K_3.5_letter_end).
    ...[['3.5a', S35, bar(32), 'K_3.5_front', { offset: AB35[0] / 24, time: drawings35(AB35), redrawAll: 1 }, { x: 0.5, y: 0.5, zoom: 1.04 }, { x: 0.5, y: 0.495, zoom: 1.09 }, [1000, 480],
        [{ sheet: 'envelopeFront10', track: 'env' }]],
      ['3.5c', bar(32), S36, 'K_3.5_letter', { offset: C35[0] / 24, time: drawings35(C35), redrawAll: 1 }, { x: 0.5, y: 0.5, zoom: 1.03 }, { x: 0.505, y: 0.51, zoom: 1.08 }, [1000, 470], []]].map(([id, a, b, key, clock, from, to, focus, sheets], j) => ({
      id, t0: a, t1: b, paper: 'silk', grain: 35 + j * 315, focus, vignette: 0.2, needs: ['emblem_final_small'],
      scene: X.pick(key) ? [{ type: 'roto', clip: X.pick(key).clip, paper: 'silk', ...clock, lock: 0, from, to, style: FINE },
        ...sheets.map((sh) => ({ name: 'papertype', params: { clip: X.pick(key).clip, ...clock, from, to, ...sh } }))]
        : [X.has(key) ? kf(key, { from, to, par: [0, 0], dolly: 0 }) : ph('The mission assignment', key)],
      // the lyric stacks on the bare desk at the top left, the one area clear of the envelope, the flap, the letter and all
      // three hands in 3.5a, b and c (TYPE, Oct 8: the right margin now holds Kenton's hand and cuff, then her sleeve)
      type(ctx, t) { lyricEN(ctx, L.L08, { ...mid, size: 48, x: 250, y: 112, color: PALE, breaks: [4, 5], text: { 3: 'you —' }, until: S36 + 0.05 }, t, 'over'); } })),
    // 3.6 — BAND LIFT: training montage, one frame per beat
    ...montage,
    ...(HAS_F ? [{ id: '3.6f', t0: mt[5], t1: S37, paper: 'silk', grain: 366, post: (t, lt) => bump(lt, 0.012),
      scene: [kf('K_3.6f', { from: { x: 0.5, y: 0.5, zoom: 1.06 }, to: { x: 0.5, y: 0.5, zoom: 1.16 }, dolly: 0.08 })],
      type(ctx, t) { hud(ctx, 'WUSHU  ·  EVA POSTURE', 64, 72, { size: 15, rgb: '232,72,52', a: 0.95 }, 1, 'ink'); } }] : []),
    // 3.7 — the last evening before quarantine: Jade holds M; both look down at a glowing relief of the Earth
    //       (J_3.7, then J_3.7_close on bar 37 when it lands). The lyric stays in the left third.
    ...[['3.7', S37, X.has('J_3.7_close') ? bar(37) : S38, 'J_3.7'], ...(X.has('J_3.7_close') ? [['3.7b', bar(37), S38, 'J_3.7_close']] : [])].map(([id, a, b, img], i) => ({
      id, t0: a, t1: b, paper: 'silk', grain: 37 + i * 100,
      // J_3.7/take_11 (M reaches down to the Earth) then J_3.7_close/take_8 (her fingers move over the mountains), redrawn
      // on silk. These takes hold the light constant (the old ones rippled cyan projection light over skin, which the
      // palette snap turned into a flickering fringe) and the two FACES are the painted keyframe itself, carried on each
      // head's tracked motion (meta.keep from tools/roto_keep.py), never redrawn from the take. No lock: moving at the cut.
      // 3.7b, rev4 FACE: M's WHOLE painted head (hair, braid, face) is carried too, in front of Jade's painted head, and
      // Jade's layer carries a strip of M's painted hair beside her cheek, so the two paintings meet hair on hair;
      // keepOcc off there (3.7b only), so the take can never show through either head.
      scene: [X.pick(img) ? { type: 'roto', clip: X.pick(img).clip, paper: 'silk', offset: 0.5, lock: 0, eyelock: false, ...(id === '3.7b' ? { keepOcc: false } : {}), style: { snapAmt: 0.12, lineTh: 0.62, lineA: 0.62 },
        from: { x: 0.52, y: 0.5, zoom: 1.03 }, to: { x: 0.56, y: 0.48, zoom: 1.12 } }
        : X.has(img) ? kf(img, { from: { x: 0.52, y: 0.5, zoom: 1.03 }, to: { x: 0.56, y: 0.48, zoom: 1.12 }, dolly: 0.06, masks: { base: [0.1, 0.5] } }) : ph('Jade holds M; both look down at a glowing relief of the Earth', img)],
      type(ctx, t) { lyricEN(ctx, L.L09, { ...mid, size: 80, x: 110, y: 480, color: PALE, breaks: [2], hold: 1.6 }, t, 'over'); },   // pale on the dark museum wall
    })),
    // 3.8 — strapping in, six moving shots of different crew in real procedural order (docs/research_capsule_interior.md
    //       section 7): glove lock (suit-up room) · walkout (Flight E1-A, from behind) · white room and hatch · the harness
    //       hauled tight · Jade's buckle (the tongue clicks home on 74.4) · her visor comes down and her helmet turns to the
    //       photograph of M and T. Faces are behind visors or out of frame; hands, straps and hardware carry it. No red on
    //       suits (emblem = the pale-blue dot). 2, 2, 2, 1, 1 beats, then 3 beats on the photograph before ignition.
    //       Each take is cut in with the motion under way (offset >= 0.5, lock 0).
    ...[['3.8a', S38, bar(38, 4), 'K_3.8a_glove', 1.25, { x: 0.52, y: 0.48, zoom: 1.04 }, { x: 0.52, y: 0.46, zoom: 1.12 }],
      ['3.8b', bar(38, 4), bar(39, 2), 'K_3.8b_walkout', 0.5, { x: 0.56, y: 0.5, zoom: 1.04 }, { x: 0.6, y: 0.48, zoom: 1.12 }],
      ['3.8c', bar(39, 2), bar(39, 4), 'K_3.8c_whiteroom', 0.6, { x: 0.52, y: 0.48, zoom: 1.22 }, { x: 0.54, y: 0.44, zoom: 1.34 }],
      ['3.8d', bar(39, 4), bar(40), 'K_3.8d_harness', 0.5, { x: 0.5, y: 0.47, zoom: 1.05 }, { x: 0.5, y: 0.46, zoom: 1.1 }],
      ['3.8e', bar(40), bar(40, 2), 'K_3.8e_buckle', 0.6, { x: 0.5, y: 0.5, zoom: 1.08 }, { x: 0.5, y: 0.47, zoom: 1.14 }],   // take time of the click = offset + (74.4 − bar 40)
      ['3.8f', bar(40, 2), HOOK, 'K_3.8f_visor', 1.3, { x: 0.5, y: 0.5, zoom: 1.03 }, { x: 0.62, y: 0.46, zoom: 1.2 }]].map(([id, a, b, key, offset, from, to], j) => ({
      id, t0: a, t1: b, paper: 'indigo', grain: 380 + j, ...(j === 5 ? { focus: [1560, 560], vignette: 0.2 } : {}),
      scene: [X.pick(key) ? { type: 'roto', clip: X.pick(key).clip, paper: 'silk', style: { ink: [0.80, 0.66, 0.38], lineA: 0.8 }, offset, lock: 0, from, to }
        : X.has(key) ? kf(key, { from, to, dolly: 0.05, grade: 'native' }) : ph('Strapping in', key)],
      type(ctx, t) {
        const T0 = 76.17, s = Math.max(0, T0 - t);
        hud(ctx, `T−00:00:${String(Math.floor(s)).padStart(2, '0')}.${String(Math.floor((s % 1) * 10))}`, 64, 1030, { size: 20, rgb: '255,255,255' }, 1);
        hud(ctx, 'HARNESS  ·  LOCKED', 64, 1000, { size: 14, rgb: '232,72,52', a: 0.95 }, smooth(74.4, 74.45, t));
      },
    })),
  ];
}
