// Bundles src/ with three.js and embeds the roster and every character it uses, so the game is one
// HTML file that opens with a double click (no server, no internet).
//   node tools/build.mjs [out.html]
//   node tools/build.mjs --web [out_dir]   page + assets/ as separate files, for the private online link (see README)
import { build } from 'esbuild';
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'assets');
const web = process.argv[2] === '--web';
const out = web ? process.argv[3] || path.join(root, 'dist', 'web') : process.argv[2] || path.join(root, 'dist', 'gioco.html');
const roster = JSON.parse(fs.readFileSync(path.join(assets, 'roster.json'), 'utf8'));
const used = new Set(roster.teams.flat());
const chars = roster.characters; // all of them: the animation viewer can show characters not in a team
for (const id of used) if (!roster.characters.some((c) => c.id === id)) console.warn(`roster: "${id}" is in a team but not in characters (falls back to ${roster.characters[0].id})`);
const embeds = chars.map((c) => `<script type="application/octet-stream" id="asset-glb-${c.id}">${fs.readFileSync(path.join(assets, c.glb)).toString('base64')}</script>
<script type="application/json" id="asset-clips-${c.id}">${fs.readFileSync(path.join(assets, c.clips), 'utf8')}</script>`).join('\n');

const res = await build({
  entryPoints: [path.join(root, 'src', 'main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  target: ['es2020'],
  define: { 'process.env.NODE_ENV': '"production"' },
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

if (web) {
  // The page is published without <html>/<head> (the host adds them); characters load from assets/.
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'assets', 'characters'), { recursive: true });
  // the host serves no .glb, so each model goes as gzip + base64 text (smaller than the raw .glb)
  const webRoster = { ...roster, characters: chars.map((c) => ({ ...c, glb: c.glb + '.gz.txt' })) };
  fs.writeFileSync(path.join(out, 'assets', 'roster.json'), JSON.stringify(webRoster));
  fs.copyFileSync(path.join(assets, 'walkout.json'), path.join(out, 'assets', 'walkout.json'));
  for (const c of chars) {
    fs.writeFileSync(path.join(out, 'assets', c.glb + '.gz.txt'), zlib.gzipSync(fs.readFileSync(path.join(assets, c.glb)), { level: 9 }).toString('base64'));
    fs.copyFileSync(path.join(assets, c.clips), path.join(out, 'assets', c.clips));
  }
  fs.writeFileSync(path.join(out, 'index.html'), `<title>Calcio arcade</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#1d2738}</style>
<script>window.__ASSETS = 'assets/';</script>
<script>(function start() { if (!document.body) return document.addEventListener('DOMContentLoaded', start, { once: true }); ${js} })();</script>
`);
  console.log(`wrote ${out}/index.html (${(fs.statSync(path.join(out, 'index.html')).size / 1e6).toFixed(1)} MB) + assets for ${chars.length} character(s)`);
  process.exit(0);
}
const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Calcio arcade · prototipo</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#1d2738}</style>
</head><body>
<script type="application/json" id="asset-roster">${JSON.stringify(roster)}</script>
<script type="application/json" id="asset-walkout">${fs.readFileSync(path.join(assets, 'walkout.json'), 'utf8')}</script>
${embeds}
<script>${js}</script>
</body></html>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1e6).toFixed(1)} MB, ${chars.length} character(s))`);
