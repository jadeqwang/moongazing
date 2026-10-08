// SECTION 6 · BREAKDOWN — 111.95–122.77 — RUBBING (white on black). 举头望明月 rises on Earth; 低头思故乡 sinks on the
// Moon; one huge trembling 乡 is held 118.8–122.6.
// THE NIGHT (Oct 7 revision): not Mid-Autumn but the new Moon fifteen days before it (2037-Sep-10 02:30 UT, Sep 9 in
// Austin): at every Mid-Autumn full Moon 2035–2040 the Earth is below Guanghan's horizon and 0.3% lit; at this new Moon
// it is FULL and 4.8° up (JPL Horizons: docs/technical_accuracy_notes.md "Earth from Guanghan"). So:
//   6.1  Austin, a moonless sky: the children rehearse — T's flashlight (the Sun of the 3.4 lesson) lights M's toy Moon
//   6.2a wide on the Shackleton rim: she lifts her head from the crater and turns to the full Earth (two beats)
//   6.2c / 6.2d (Jade, Oct 8: "action shots of other astronauts, mid-action, looking at Earth"): two of the crew, each
//        caught mid-task, stop and look up at the same Earth — Adaeze with a feeder plug a hand short of its socket,
//        Layla mid-stride with a container from the lander in her arms (two beats each; visors down, everyone faces LEFT to the Earth,
//        the Sun behind them so every shadow runs toward it)
//   6.2b close: her face, ONE beat (Oct 8: "a way shorter shot of my face"; FACE = false drops it)
//   6.3  乡 + "home": the wide again, push past her into the Earth
//   6.4  what she sees: the whole daylit disc fills the frame → the museum globe
// ENGLISH (Oct 8): the line is "I think of home". "I think" comes on 思, "of" on 故, and "home" lands with the sung 乡
// as its gloss, on the same baseline under the character; "I think of" then leaves and 乡 / home are held together.
// MOTION ON RUBBING PAPER: the ink / silk redraw of the roto scene cannot sit on white-on-black paper (it lays dark
// pigment) and it re-inks faces. Here each take only MOVES the painted keyframe (tools/roto_prep_rubbing.py: static
// pixels are the painting, moving ones the painting carried by the take's optical flow, Jade's head one rigid layer of
// the painted head, so her likeness is the painted one in every frame); the frames come pre-toned as a rubbing and
// the roto scene plays them as they are (RUB below). Takes generated FROM a held pose are played reversed, so the
// shot ends exactly on the painted keyframe. No take → the painted still (plate, grade 'rubbing').
// THE EARTH is never painted: scenes/earthview.js draws it (the only colour on the Moon), same sky in every shot.
import { lyricZH, card, hud, ph, PALE, WHITE, smooth, clamp, easeInOutSine } from './_lib.js';
import { earthView, EARTH_KEYS, EARTH_INSETS, EARTH_INSET_KEYS } from '../scenes/earthview.js';

export const range = [111.95, 122.77];

// the sky of 2037-Sep-10 02:30 UT seen from Guanghan (screen-up = the station's zenith); the same in every Moon shot
const SKY = { subLat: 6.6, subLon: 147.7, north: 131.3, phase: 6.2, sunPA: 25.8 };
const HOME = { subLat: 30.25, subLon: 120.15 };          // West Lake, Hangzhou

// EARTH CALL SITES — centre and radius in KEYFRAME uv (radius in units of the keyframe's width). Drawn 1.2x its true
// 2.05° so it reads; its centre is 2.35 diameters (= 4.8°) above the true horizon in all three shots.
const E62A = { uv: [0.360, 0.200], r: 0.0225 };          // K_6.2ii: horizon top at v 0.39, lens HFOV 55°
const E62B = { uv: [0.400, 0.218], r: 0.0314 };          // J_6.2: horizon at v 0.48, lens HFOV ~41°
// the crew shots (rev2, Oct 8): the same rule (radius 1.2 x 1.025° / HFOV, centre 2.35 diameters above the horizon)
const E62C = { uv: [0.326, 0.194], r: 0.0256 };          // K_6.2c: horizon top at v 0.41, lens HFOV ~48°
const E62D = { uv: [0.325, 0.200], r: 0.0225 };          // K_6.2d: horizon top at v 0.39, lens HFOV ~55°
// Jade's face before 乡: one beat (true), or not at all (false: 6.2d then runs to 乡)
const FACE = true;
// the reflection on the clear visor in J_6.2_visor: on the glass between her eyes and the bubble's front edge, where a
// convex mirror shows something far off to her front-left; squashed toward the bubble's limb, mirrored, a little dimmer
const R63 = { uv: [0.500, 0.3826], r: 0.0265, squash: [0.56, 1], rot: -8, mirror: true, gain: 0.8, opacity: 0.7, haze: 0.9 };

// keyframe uv → design px under a view {from, to} (the roto scene's mapping; a plate adds a 0.004 guard band)
function viewMap(pp, lt, dur, ar, pad = 0) {
  const u = easeInOutSine(clamp(lt / dur)), a = pp.from, b = pp.to || pp.from;
  const v = [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.zoom + (b.zoom - a.zoom) * u];
  const rar = 1920 / 1080, span = ar > rar ? [rar / ar, 1] : [1, ar / rar];
  const h = [span[0] / v[2] * 0.5 + pad, span[1] / v[2] * 0.5 + pad];
  const c = [clamp(v[0], h[0], 1 - h[0]), clamp(v[1], h[1], 1 - h[1])];
  const sx = 1920 * v[2] / span[0], sy = 1080 * v[2] / span[1];
  return { sx, at: ([x, y]) => [960 + (x - c[0]) * sx, 540 + (y - c[1]) * sy] };
}
const AR = { 'K_6.2ii': 2752 / 1536, 'J_6.2': 1672 / 941, 'J_6.2_visor': 1672 / 941, 'K_6.2c': 2752 / 1536, 'K_6.2d': 2752 / 1536 };
function earthAt(ctx, key, live, pp, lt, dur, E, extra = {}) {
  const M = viewMap(pp, lt, dur, AR[key], live ? 0 : 0.004), [x, y] = M.at(E.uv);
  earthView(ctx, { ...SKY, ...E, ...extra, x, y, r: E.r * M.sx });
}

// the Sun stays where it is over the Earth while the 6.4 camera travels: phase and sunPA for another sub-observer point
// and roll (same bases as the earthview shader: view x right, y up, z toward the camera)
const RAD = Math.PI / 180;
function basis(lat, lon, north) {
  const sl = Math.sin(lat * RAD), cl = Math.cos(lat * RAD), so = Math.sin(lon * RAD), co = Math.cos(lon * RAD), sn = Math.sin(north * RAD), cn = Math.cos(north * RAD);
  return { Z: [cl * co, cl * so, sl], E: [-so, co, 0], N: [-sl * co, -sl * so, cl], sn, cn };   // out, east, north (Earth-fixed)
}
function sunFixed(s) {    // the Sun's direction in Earth-fixed axes, from a sky {subLat, subLon, north, phase, sunPA}
  const B = basis(s.subLat, s.subLon, s.north), ph = s.phase * RAD, pa = s.sunPA * RAD;
  const v = [Math.sin(ph) * Math.sin(pa), Math.sin(ph) * Math.cos(pa), Math.cos(ph)];          // view space
  // view x = te·(E,N) with te = (cos N, −sin N), view y = tn·(E,N) with tn = (sin N, cos N)   [east, north components]
  const e = v[0] * B.cn - v[1] * B.sn, n = v[0] * B.sn + v[1] * B.cn;
  return [0, 1, 2].map((i) => v[2] * B.Z[i] + e * B.E[i] + n * B.N[i]);
}
function sunSeenFrom(S, lat, lon, north) {
  const B = basis(lat, lon, north), dot = (a) => a[0] * S[0] + a[1] * S[1] + a[2] * S[2];
  const z = dot(B.Z), e = dot(B.E), n = dot(B.N), x = e * B.cn + n * B.sn, y = -e * B.sn + n * B.cn;
  return { phase: Math.acos(clamp(z, -1, 1)) / RAD, sunPA: Math.atan2(x, y) / RAD };
}
const SUN = sunFixed(SKY);

export default function shots(B, X, L) {
  const bar = (n, b = 1) => B.bar(n, b);
  // cuts: 低 (line onset) | bar 63 beat 3 | bar 64 | bar 64 beat 3 (only with FACE) | 乡 sung (118.8) | bar 66 | drop
  const S61 = L.L14a.start, S62 = L.L14b.start, S62c = bar(63, 3), S62d = bar(64), S63 = 118.8, S62b = FACE ? bar(64, 3) : S63, S64 = bar(66), DROP = bar(67);
  const gloss = (ctx, key, s, t, a, b) => card(ctx, key, { lines: [[{ t: s, font: 'CormorantItalic' }]], size: 32, x: 960, y: 1040, align: 'center', color: PALE }, t, a, b, 'over');
  const edge = (ctx, s, lt, dur) => hud(ctx, s, 64, 72, { size: 13, rgb: '240,232,214', a: 0.8 }, smooth(0.15, 0.6, lt) * (1 - smooth(dur - 0.35, dur - 0.05, lt)));
  const XX = 470, XY = 230; // the held 乡 stays put across 6.3 → 6.4
  const xiang = (ctx, t) => lyricZH(ctx, L.L14b, { from: 4, key: 'xiang', size: 560, x: XX, y: XY, color: WHITE, seed: 130, until: 122.62, shake: 2.2 * smooth(118.8, 119.6, t), early: 0.0, halo: 18 }, t, 'over');
  // ---- type shared by the four Moon shots before 乡 (6.2a, c, d, b): it stays put across their cuts
  // 低头思故: one small column in the black sky at the left, where 乡 will stand; no sinking (home, not down)
  const column = (ctx, t) => lyricZH(ctx, L.L14b, { to: 4, key: 'col', size: 76, x: 238, y: 118, color: WHITE, seed: 132, until: S63 + 0.05, halo: 8 }, t, 'over');
  // a card drawn pale with a soft dark halo of its own shape (the ground under it changes with every cut)
  const haloed = (ctx, draw, seed) => {
    ctx.pipe.layer((g) => { g.filter = 'brightness(0) blur(9px)'; g.globalAlpha = 0.9; draw(g); draw(g); }, { mode: 'ink', seed: seed + 1 });
    ctx.pipe.layer((g) => draw(g), { mode: 'over', seed });
  };
  // "I think of home": one baseline under the 乡. "I think" is brushed on 思, "of" on 故 (the whispered onsets);
  // "home" (larger) is brushed with the sung 乡 and held with it; "I think of" leaves once the line has been read
  const EN = { font: 'CormorantItalic', x: 70, y: 892, align: 'left', color: PALE, tracking: 0.02, leading: 1.1 };
  const iThink = (ctx) => ctx.type.card('en62-i', { ...EN, size: 46, lines: [[{ t: 'I think' }]] });
  const ofCard = (ctx) => ctx.type.card('en62-of', { ...EN, size: 46, x: iThink(ctx).runEdges()[0][0].x1 + 15, lines: [[{ t: 'of' }]] });
  const think = (ctx, t) => {
    const W = L.L14b.words, a = 1 - smooth(S63 + 0.9, S63 + 1.6, t);
    if (a <= 0) return;
    [[iThink(ctx), W[2].start], [ofCard(ctx), W[3].start]].forEach(([c, on], i) => {
      const w = smooth(on - 0.04, on + 0.28, t);
      if (w > 0) haloed(ctx, (g) => c.draw(g, w, a), 51 + 4 * i);
    });
  };
  const home = (ctx, t) => {
    const a = 1 - smooth(122.62 - 0.4, 122.62, t), w = smooth(S63 + 0.02, S63 + 0.42, t);
    if (w <= 0 || a <= 0) return;
    const c = ctx.type.card('en62-home', { ...EN, x: ofCard(ctx).runEdges()[0][0].x1 + 18, size: 88, lines: [[{ t: 'home' }]] });
    haloed(ctx, (g) => c.draw(g, w, a), 53);
  };
  // the label of the Moon side runs through the three suited shots
  const where = (ctx, t) => hud(ctx, 'GUANGHAN  ·  FULL EARTH  ·  4.8° ABOVE THE HORIZON', 64, 72, { size: 13, rgb: '240,232,214', a: 0.8 }, smooth(S62 + 0.15, S62 + 0.6, t) * (1 - smooth(S62b - 0.35, S62b - 0.05, t)));
  const moonType = (ctx, t) => { column(ctx, t); think(ctx, t); where(ctx, t); };
  // views (no parallax, so the Earth registers exactly). 6.1 and 6.2a both tilt UP: heads are raised on both worlds
  const P61 = { from: { x: 0.52, y: 0.615, zoom: 1.3 }, to: { x: 0.53, y: 0.40, zoom: 1.3 } };
  const P62a = { from: { x: 0.56, y: 0.49, zoom: 1.13 }, to: { x: 0.52, y: 0.47, zoom: 1.08 } };
  const P62b = { from: { x: 0.51, y: 0.455, zoom: 1.08 }, to: { x: 0.52, y: 0.44, zoom: 1.12 } };
  // the crew shots: a slow push toward the Earth side of the frame
  const P62c = { from: { x: 0.50, y: 0.50, zoom: 1.04 }, to: { x: 0.485, y: 0.485, zoom: 1.09 } };
  const P62d = { from: { x: 0.505, y: 0.485, zoom: 1.05 }, to: { x: 0.49, y: 0.475, zoom: 1.10 } };
  // 6.3 (Jade, Oct 7): on 乡 we go back to the suited figure facing the Earth and push past her into the Earth itself
  // (not her face): the wide take continues, slowed, and the view ends with the Earth dead centre, horizon out of frame
  const P63 = { from: { x: 0.50, y: 0.47, zoom: 1.12 }, to: { x: 0.36, y: 0.20, zoom: 3.0 } };
  // a take prepped by tools/roto_prep_rubbing.py, played as it is on our rubbing paper — or the painted still
  const RUB = { paper: 'silk', redrawAll: 1, style: { snapAmt: 0, shade: 0, gran: 0, lineA: 0, boldA: 0 } };
  const still = (img, pp) => ({ name: 'plate', params: { img, grade: 'rubbing', ...pp, dolly: 0, par: [0, 0] } });
  const live = (key) => !!X.pick(key);
  const moving = (key, pp, offset, title, more = {}) => (X.pick(key) ? { type: 'roto', clip: X.pick(key).clip, offset, lock: 0, ...RUB, ...pp, ...more }
    : X.has(key) ? still(key, pp) : ph(title, key));
  // 6.4: the Earth as she sees it, then a push to her old home. u: 0 = the whole disc, 1 = the Yangtze delta
  const R63end = viewMap(P63, 1, 1, AR['K_6.2ii']), C64 = R63end.at(E62A.uv), R64 = E62A.r * R63end.sx;
  // 6.4 (Jade, Oct 7): the push goes into the Earth as a whole, never toward one country: the same face she sees (the
  // sub-observer point is over the open western Pacific), the same south-up tilt, no roll, until the disc overfills the frame
  const earth64 = (lt) => {
    const u = Math.pow(smooth(0.0, 1.35, lt), 1.5);
    const r = Math.exp(Math.log(R64) + (Math.log(1500) - Math.log(R64)) * u);
    const c = smooth(0.0, 0.45, lt);
    return { ...SKY, x: C64[0] + (960 - C64[0]) * c, y: C64[1] + (540 - C64[1]) * c, r };
  };
  return [
    // 6.1 — EARTH, a moonless night: Kenton lifts M, M holds her toy Moon where the Moon should be, T's flashlight finds
    //       it: they make their own bright Moon; the camera tilts up with their faces
    { id: '6.1', t0: S61, t1: S62, paper: 'rubbing', grain: 61, focus: [1040, 430],
      scene: [moving('K_6.1', P61, 0.5, 'The family make their own Moon on a moonless night')],
      type(ctx, t, lt) {
        lyricZH(ctx, L.L14a, { size: 118, x: 1720, y: 300, color: WHITE, seed: 131, until: S62 + 0.05, dy: (tt) => -150 * smooth(S61, S62, tt) }, t, 'over');
        gloss(ctx, 'g61', 'I raise my head and gaze at the bright Moon,', t, S61 + 0.4, S62 + 0.05);
        edge(ctx, 'AUSTIN  ·  NEW MOON  ·  15 DAYS TO MID-AUTUMN', lt, S62 - S61);
      } },
    // 6.2a — MOON, the same hour: on the rim of Shackleton she lifts her head from the crater and turns to the Earth
    //        (two beats: the take from 1.0 s at 1.4x: her head is already up at the cut and she turns; it ends where 6.3 picks the take up)
    { id: '6.2a', t0: S62, t1: S62c, paper: 'rubbing', grain: 62, focus: [900, 400], needs: [...EARTH_KEYS],
      scene: [moving('K_6.2ii', P62a, 1.0, 'Jade on the rim of Shackleton turns to the full Earth', { rate: 1.4 })],
      type(ctx, t, lt) { earthAt(ctx, 'K_6.2ii', live('K_6.2ii'), P62a, lt, S62c - S62, E62A); moonType(ctx, t); } },
    // 6.2c — Adaeze Okafor, reactor engineer, at the power feeder north of the station: on one knee at a junction box,
    //        the cable's connector in both gloves a hand short of its socket; her helmet has come up to the Earth
    { id: '6.2c', t0: S62c, t1: S62d, paper: 'rubbing', grain: 66, focus: [1200, 420], needs: [...EARTH_KEYS],
      scene: [moving('K_6.2c', P62c, 2.6 / 24, 'Adaeze, a feeder plug half home, looks up at the Earth')],   // 24 prepared frames, reversed: ends on the painting
      type(ctx, t, lt) { earthAt(ctx, 'K_6.2c', live('K_6.2c'), P62c, lt, S62d - S62c, E62C); moonType(ctx, t); } },
    // 6.2d — Layla Al-Mansoori, pilot, at the lander beside the pad: a cargo container from it in both arms, her
    //        helmet already lifted to the Earth; she finishes the step she was in and comes to a standstill
    { id: '6.2d', t0: S62d, t1: S62b, paper: 'rubbing', grain: 67, focus: [1200, 430], needs: [...EARTH_KEYS],
      scene: [moving('K_6.2d', P62d, 1 / 24, 'Layla, a container from the lander in her arms, looks up at the Earth', { rate: FACE ? 1 : 0.66 })],   // 23 prepared frames, FORWARD from the painting: the last step, then she stands (slowed to fill the shot when there is no face shot)
      type(ctx, t, lt) { earthAt(ctx, 'K_6.2d', live('K_6.2d'), P62d, lt, S62b - S62d, E62D); moonType(ctx, t); } },
    // 6.2b — close, ONE beat: her face inside the helmet settles on the Earth (the take ends on the painted frame)
    ...(FACE ? [{ id: '6.2b', t0: S62b, t1: S63, paper: 'rubbing', grain: 63, focus: [1040, 320], needs: [...EARTH_KEYS],
      scene: [moving('J_6.2', P62b, 21 / 24, 'Jade lifts her face to the Earth', { rate: 1.4, twos: false })],   // the last 7° of the lift, settled at the cut
      type(ctx, t, lt) { earthAt(ctx, 'J_6.2', live('J_6.2'), P62b, lt, S63 - S62b, E62B); column(ctx, t); think(ctx, t); } }] : []),
    // 6.3 — 乡 held: back to the wide. She stands turned to the Earth, small at the right; the camera pushes past her
    //       into the Earth, which ends dead centre; 6.4 carries the same push on into its daylit face
    { id: '6.3', t0: S63, t1: S64, paper: 'rubbing', grain: 64, focus: [900, 440], needs: [...EARTH_KEYS],
      scene: [X.pick('K_6.2ii') ? { ...moving('K_6.2ii', P63, 2.3, ''), rate: 0.45, twos: false } : moving('K_6.2ii', P63, 0, 'Jade faces the full Earth; push into the Earth')],
      type(ctx, t, lt) { earthAt(ctx, 'K_6.2ii', live('K_6.2ii'), P63, lt, S64 - S63, E62A); xiang(ctx, t); think(ctx, t); home(ctx, t); } },
    // 6.4 — build gap: the push goes on. The Earth is where 6.3 left it, centre frame, and we fall toward its whole
    //       daylit face until it fills the frame; it soaks away into silk (a paper dissolve) and is the glowing relief
    //       globe in the museum (J_3.7) — memory
    { id: '6.4', t0: S64, t1: DROP, paper: 'rubbing', grain: 65, needs: [...EARTH_KEYS, ...EARTH_INSET_KEYS],
      scene: [{ name: 'earthview', params: { earth: (t, lt) => earth64(lt) } },
        ...(X.has('J_3.7') ? [{ name: 'paperfade', params: { paperTo: 'silk', fade: (t, lt) => smooth(0.95, 1.45, lt) } },
          { name: 'plate', params: { img: 'J_3.7', grade: 'native', from: { x: 0.44, y: 0.66, zoom: 1.5 }, to: { x: 0.5, y: 0.58, zoom: 1.22 }, opacity: (t, lt) => smooth(1.05, 1.55, lt) } }] : [])],
      type(ctx, t) { xiang(ctx, t); home(ctx, t); } },
  ];
}
