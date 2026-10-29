// Bundles src/ with three.js and embeds the roster and every character it uses, so the game is one
// HTML file that opens with a double click (no server, no internet).
//   node tools/build.mjs [out.html]
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'assets');
const out = process.argv[2] || path.join(root, 'dist', 'gioco.html');
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
const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Calcio arcade · prototipo</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#1d2738}</style>
</head><body>
<script type="application/json" id="asset-roster">${JSON.stringify(roster)}</script>
${embeds}
<script>${js}</script>
</body></html>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1e6).toFixed(1)} MB, ${chars.length} character(s))`);
