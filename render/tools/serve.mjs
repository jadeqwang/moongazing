// Static server for the renderer: render/ at /, plus read-only /analysis/* and /inputs/* from the repo.
//   node tools/serve.mjs   -> http://127.0.0.1:8765/index.html?t=1.2  (or ?play=1 for a live preview with audio)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(ROOT, '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.mp4': 'video/mp4',
};

export function serve(port = 8765) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let p = decodeURIComponent(url.pathname);
    if (p === '/__ls') { // list files of a repo media dir (for assets that may land while we work)
      const d = path.join(REPO, url.searchParams.get('dir') || '');
      if (!d.startsWith(path.join(REPO, 'media') + path.sep)) { res.writeHead(403); return res.end(); }
      let list = []; try { list = fs.readdirSync(d).map((f) => ({ f, mtime: fs.statSync(path.join(d, f)).mtimeMs })); } catch (e) { /* missing */ }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return res.end(JSON.stringify(list));
    }
    if (p === '/') p = '/index.html';
    const file = /^\/(analysis|inputs|media\/keyframes|media\/chars|media\/gen)\//.test(p) ? path.join(REPO, p) : path.join(ROOT, p);
    if (!file.startsWith(REPO + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const port = Number(process.env.PORT || 8765);
  serve(port).then(() => console.log(`serving ${ROOT} on http://127.0.0.1:${port}/index.html`));
}
