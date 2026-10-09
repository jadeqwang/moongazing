// Minimal WebGL2 layer: programs, textures, render targets, fullscreen passes.
// Conventions (so shaders never fight orientation):
//   * every shader works in DESIGN pixels P (1920x1080, top-left origin): P = PX() .
//   * image/canvas textures are uploaded unflipped: sample them with top-left uv  -> IMG(tex, uv)
//   * render targets are sampled at design pixels                                  -> FBO(tex, P)

export const GLSL_LIB = /* glsl */`
uniform vec2 uRes;      // render size in device px
uniform float uScale;   // device px per design px (H/1080)
vec2 PX(){ return vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uScale; }
vec4 FBO(sampler2D s, vec2 P){ vec2 d = P * uScale; return texture(s, vec2(d.x, uRes.y - d.y) / uRes); }
vec4 IMG(sampler2D s, vec2 uv){ return texture(s, uv); }
float hash12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec2 hash22(vec2 p){ vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3+=dot(p3,p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p=p*2.03+vec2(17.1,9.2); a*=.5; } return v/.96875; }
float fbm3(vec2 p){ float v=0., a=.5; for(int i=0;i<3;i++){ v+=a*vnoise(p); p=p*2.03+vec2(17.1,9.2); a*=.5; } return v/.875; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float luma(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
float sat01(float x){ return clamp(x, 0., 1.); }
// subtractive ink: density d (0..~3) of an ink with absorption 'ab' (per channel) over a base colour
vec3 inkOver(vec3 base, vec3 ab, float d){ return base * exp(-ab * d); }
// gold ink (泥金): powdered gold in glue. matte, granular, slightly uneven; never glossy.
vec3 goldInk(vec2 P, float seed){
  float g = vnoise(P*0.9 + seed) * .55 + vnoise(P*3.1 + seed*1.7) * .45;
  float spark = smoothstep(.86, .97, hash12(floor(P*1.2) + seed));
  vec3 a = vec3(0.74, 0.57, 0.28), b = vec3(0.91, 0.75, 0.41);
  return mix(a, b, g) + spark * vec3(.10,.08,.04);
}
`;

const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0., 1.); }`;

export class GL {
  constructor(canvas, W, H) {
    this.W = W; this.H = H; this.S = H / 1080;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
    this.halfFloat = !!gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.buf = buf;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);   // set once, here: field() used to switch it on first use, so array uploads differed before and after
    this.cache = new Map();
  }

  program(frag, name = 'prog') {
    if (this.cache.has(frag)) return this.cache.get(frag);
    const gl = this.gl;
    const src = `#version 300 es
precision highp float;
precision highp sampler2D;
${GLSL_LIB}
${frag}`;
    const mk = (type, s) => {
      const sh = gl.createShader(type); gl.shaderSource(sh, s); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        const lines = s.split('\n').map((l, i) => `${i + 1}: ${l}`);
        const m = /0:(\d+)/.exec(log); const ln = m ? +m[1] : 0;
        throw new Error(`shader ${name}: ${log}\n${lines.slice(Math.max(0, ln - 4), ln + 2).join('\n')}`);
      }
      return sh;
    };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, src));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`link ${name}: ${gl.getProgramInfoLog(p)}`);
    const uni = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      const nm = info.name.replace(/\[0\]$/, '');
      uni[nm] = { loc: gl.getUniformLocation(p, info.name), type: info.type, size: info.size };
    }
    const prog = { p, uni, name };
    this.cache.set(frag, prog);
    return prog;
  }

  // texture from an image / canvas / ImageBitmap
  texture(source, { filter = 'linear', wrap = 'clamp', mip = false } = {}) {
    const gl = this.gl;
    const tex = gl.createTexture();
    const t = { tex, w: source.width, h: source.height, mip };
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    this._params(filter, wrap, mip);
    return t;
  }
  update(t, source) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    if (source.width !== t.w || source.height !== t.h) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); t.w = source.width; t.h = source.height;
    } else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
    if (t.mip) gl.generateMipmap(gl.TEXTURE_2D);
  }
  // single-channel float field (Float32Array, w*h) -> R16F texture (filterable)
  field(data, w, h, { filter = 'linear' } = {}) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, w, h, 0, gl.RED, gl.FLOAT, data);
    this._params(filter, 'clamp', false);
    return { tex, w, h };
  }
  _params(filter, wrap, mip) {
    const gl = this.gl;
    const f = filter === 'nearest' ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    const w = wrap === 'repeat' ? gl.REPEAT : wrap === 'mirror' ? gl.MIRRORED_REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, w);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, w);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
  }

  target(w = this.W, h = this.H) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (this.halfFloat) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    this._params('linear', 'clamp', false);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fb, w, h };
  }

  // run a fullscreen pass. uniforms: number | [..] | texture-like {tex} | {i: int}
  pass(prog, uniforms = {}, target = null) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
    gl.viewport(0, 0, target ? target.w : this.W, target ? target.h : this.H);
    gl.useProgram(prog.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const all = { uRes: [target ? target.w : this.W, target ? target.h : this.H], uScale: (target ? target.h : this.H) / 1080, ...uniforms };
    let unit = 0;
    for (const [k, v] of Object.entries(all)) {
      const u = prog.uni[k];
      if (!u || v === undefined || v === null) continue;
      if (v.tex) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, v.tex); gl.uniform1i(u.loc, unit); unit++; continue; }
      if (typeof v === 'object' && 'i' in v) { gl.uniform1i(u.loc, v.i); continue; }
      if (typeof v === 'number' || typeof v === 'boolean') {
        if (u.type === gl.INT || u.type === gl.BOOL) gl.uniform1i(u.loc, +v); else gl.uniform1f(u.loc, +v);
        continue;
      }
      const a = v;
      if (u.size > 1 || a.length > 4) {
        if (u.type === gl.FLOAT_VEC2) gl.uniform2fv(u.loc, a);
        else if (u.type === gl.FLOAT_VEC3) gl.uniform3fv(u.loc, a);
        else if (u.type === gl.FLOAT_VEC4) gl.uniform4fv(u.loc, a);
        else gl.uniform1fv(u.loc, a);
      } else if (a.length === 2) gl.uniform2fv(u.loc, a);
      else if (a.length === 3) gl.uniform3fv(u.loc, a);
      else if (a.length === 4) gl.uniform4fv(u.loc, a);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
