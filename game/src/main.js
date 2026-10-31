import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Game } from './game.js';
import { Hud } from './hud.js';
import { Input, PadMenus } from './input.js';
import { Menu } from './ui/menu.js';
import { t } from './ui/i18n.js';
import { save } from './ui/save.js';
import { Tracker } from './cups/objectives.js';
import { MATCH, FIELDER, GOALIE, RIG_HEIGHT, TEAM_DEFAULTS } from './config.js';
import { Player } from './player.js';
import { WalkoutStage } from './ut/walkout3d.js';
import * as UTC from './ut/club.js';
import * as UTCARDS from './ut/cards.js';

// assets/roster.json lists the characters (one retargeted .glb + clip facts each) and the 5 per team
// (slots 0-3 fielders, slot 4 goalie). The built game embeds them; the dev page fetches them.
// where the dev page and the web build fetch assets from (the single-file build embeds them instead)
const ASSETS = window.__ASSETS || '/assets/';

async function fetchOk(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res;
}

async function loadAssets(onProgress = () => {}) {
  const embedded = document.getElementById('asset-roster');
  const roster = embedded ? JSON.parse(embedded.textContent) : await (await fetchOk(ASSETS + 'roster.json')).json();
  const byId = {};
  let done = 0;
  onProgress(0, roster.characters.length);
  // all characters at once: on the online link most of the time is download
  await Promise.all(roster.characters.map(async (ch) => {
    let glbBuffer, meta;
    const tag = document.getElementById('asset-glb-' + ch.id);
    if (tag) {
      const bin = atob(tag.textContent.trim());
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      glbBuffer = bytes.buffer;
      meta = JSON.parse(document.getElementById('asset-clips-' + ch.id).textContent);
    } else {
      const res = await fetchOk(ASSETS + ch.glb);
      if (ch.glb.endsWith('.gz.txt')) {
        // web build: gzip + base64 text, unpacked in the browser
        const bin = Uint8Array.from(atob((await res.text()).trim()), (c) => c.charCodeAt(0));
        glbBuffer = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      } else glbBuffer = await res.arrayBuffer();
      meta = await (await fetchOk(ASSETS + ch.clips)).json();
    }
    const gltf = await new GLTFLoader().parseAsync(glbBuffer, '');
    const clips = {};
    for (const a of gltf.animations) clips[a.name] = a;
    let material = null;
    gltf.scene.traverse((o) => { if (o.isMesh && !material) material = o.material; });
    byId[ch.id] = { id: ch.id, name: ch.name, scene: gltf.scene, clips, meta: meta.clips, height: meta.model_height, nisScale: meta.nis_scale,
      teamMaterials: ch.recolor ? teamMaterials(material) : null };
    onProgress(++done, roster.characters.length);
  }));
  const first = byId[roster.characters[0].id];
  // the default template doubles as the shared one (clip facts are the same for every character)
  const teams = TEAM_DEFAULTS.map((d, i) => ({ ...d, ...(roster.teamInfo || [])[i] }));
  // Ultimate Team pack walkout clips (animation/nis.py)
  const wTag = document.getElementById('asset-walkout');
  let walkout = null;
  try { walkout = wTag ? JSON.parse(wTag.textContent) : await (await fetchOk(ASSETS + 'walkout.json')).json(); } catch { walkout = null; }
  return { ...first, roster, byId, teams, walkout, forSlot: (team, slot) => byId[roster.teams[team][slot]] || first };
}

// Card art for Ultimate Team: each character rendered once in its idle pose, transparent background.
function makePortraits(renderer, template) {
  const cache = {};
  return (charId, gk) => {
    const key = charId + (gk ? ':gk' : '');
    if (cache[key] !== undefined) return cache[key];
    const tpl = template.byId[charId];
    if (!tpl) return (cache[key] = null);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2.4));
    const d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(1, 2, 3); scene.add(d);
    const p = new Player({ scene, teams: [{ color: '#fff' }] }, tpl, 0, gk ? 'goalie' : 'fielder', 0);
    p.ring.visible = false; p.shadow.visible = false;
    p.play(gk ? 'gk_ready_idle' : 'idle', { loop: true, fade: 0 });
    p.mixer.update(0.3);
    p.root.rotation.y = 0.35;
    const h = p.cfg.height;
    const cam = new THREE.PerspectiveCamera(26, 168 / 160, 0.05, 20);
    cam.position.set(0, h * 0.78, h * 1.7); cam.lookAt(0, h * 0.6, 0);
    const W = 168, H = 160;
    const rt = new THREE.WebGLRenderTarget(W, H, { colorSpace: THREE.SRGBColorSpace });
    const prev = renderer.getRenderTarget(), prevColor = renderer.getClearColor(new THREE.Color()), prevAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam);
    const px = new Uint8Array(W * H * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, W, H, px);
    renderer.setRenderTarget(prev); renderer.setClearColor(prevColor, prevAlpha); rt.dispose();
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), img = g.createImageData(W, H);
    for (let y = 0; y < H; y++) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
    g.putImageData(img, 0, 0);
    return (cache[key] = c.toDataURL());
  };
}

// Team 0 keeps the model's yellow shirt; team 1 gets it recoloured red (only strongly yellow pixels change).
function teamMaterials(base) {
  const red = base.clone();
  const img = base.map && base.map.image;
  if (img) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const r = p[i], gr = p[i + 1], b = p[i + 2];
      const max = Math.max(r, gr, b), min = Math.min(r, gr, b);
      if (max > 90 && max - min > 70 && r > b + 60 && gr > b + 40 && Math.abs(r - gr) < 90) {
        const l = (r + gr) / 2;
        p[i] = Math.min(255, l * 1.05); p[i + 1] = l * 0.22; p[i + 2] = l * 0.2;
      }
    }
    g.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = base.map.colorSpace; t.flipY = base.map.flipY; t.wrapS = base.map.wrapS; t.wrapT = base.map.wrapT;
    red.map = t;
  }
  return [base, red];
}

function makeAudio() {
  let ctx = null;
  const ensure = () => { if (!ctx) { try { ctx = new AudioContext(); } catch { ctx = null; } } return ctx; };
  addEventListener('pointerdown', ensure, { once: true });
  addEventListener('keydown', ensure, { once: true });
  return (name) => {
    const a = ctx; if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    const spec = { hit: [140, 0.12, 'square'], post: [880, 0.18, 'triangle'], wall: [220, 0.06, 'sine'], goal: [520, 0.6, 'sawtooth'] }[name] || [300, 0.1, 'sine'];
    o.type = spec[2]; o.frequency.value = spec[0];
    if (name === 'goal') o.frequency.linearRampToValueAtTime(1040, a.currentTime + 0.5);
    g.gain.setValueAtTime(0.12, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + spec[1]);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + spec[1]);
  };
}

async function boot() {
  const menu = new Menu();
  menu.showLoading();
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  let template;
  try { template = await loadAssets((d, n) => menu.setProgress(d, n)); } catch (e) { console.error(e); menu.showError(e); return; }
  menu.hideLoading();
  menu.teams = template.teams;
  menu.roster = template.roster;

  // cups: the same characters under other team names, colours and line-ups
  // Ultimate Team: line-ups also carry the card stats of every slot (game/src/stats.js)
  // captain: slot 0-3 of the only player who can do the Super Strike (default the striker)
  const withLineups = (lineups) => ({ ...template, teams: lineups.map((l) => ({ name: l.name, color: l.color, captain: l.captain ?? 3 })),
    forSlot: (team, slot) => template.byId[lineups[team].slots[slot]] || template.forSlot(team, slot),
    statsFor: (team, slot) => lineups[team].stats?.[slot] || null });
  menu.portrait = makePortraits(renderer, template);
  menu.walkout = template.walkout ? new WalkoutStage(renderer, template, template.walkout) : null;

  const hud = new Hud();
  hud.onSfx = makeAudio();
  hud.show(false);
  let game = null, input = null, paused = false, mode = 'menu', viewer = null, match = null, trackers = [], trackT = 0;

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight);
    const cam = game ? game.camera : viewer?.camera;
    if (menu.walkout) menu.walkout.resize();
    if (cam) { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
  };
  addEventListener('resize', resize);

  // opts from the quick play menu: { kind: 'cpu'|'friend'|'coop'|'watch', humans: [team…], bindings, seconds, cpuLevel }
  function startMatch(opts = {}) {
    if (opts.aiOnly) opts = { kind: 'watch', humans: [], bindings: [] }; // old API (tools/playtest.cjs)
    match = { kind: 'cpu', humans: [0], bindings: [{ device: 'any', ctrl: 0 }], seconds: MATCH.seconds, cpuLevel: 1, ...opts };
    if (viewer) { viewer.dispose(); viewer = null; }
    game = new Game(renderer, match.lineups ? withLineups(match.lineups) : template, hud);
    game.setHumans(match.humans);
    game.knockout = !!match.knockout;
    // star objectives: one tracker per human team playing the computer
    trackers = (match.objectives || []).map((o) => {
      const tr = new Tracker(game, o.team, o.ids);
      tr.onChange = (i, st) => hud.toast(t(st === 'done' ? 'obj.toastDone' : 'obj.toastFailed', { text: t('obj.' + o.ids[i]) }), st === 'done' ? '#d8f7c9' : '#f3d6dc');
      return tr;
    });
    game.onEvent = trackers.length ? (type, d) => { for (const tr of trackers) tr.event(type, d); } : null;
    game.cpuLevel = match.cpuLevel;
    game.clock = match.seconds;
    for (const tr of trackers) tr.f.length = game.clock;
    input = input || new Input(game);
    input.game = game;
    input.menuOwnsKeys = true;
    input.bind(match.bindings);
    input.onPause = () => togglePause();
    hud.setTeams(game.teams);
    hud.show(true);
    hud.el.querySelector('#help').style.display = match.humans.length ? '' : 'none';
    hud.onEnd = (score, humanTeam, stats) => {
      if (match.onFinish) {
        const g = game, res = { score: [...score], winner: g.winner, golden: g.golden && score[0] !== score[1], decided: score[0] === score[1],
          trackers: trackers.map((tr) => ({ team: tr.f.me, ids: tr.ids, stars: tr.finish(g.winner === tr.f.me), status: [...tr.status] })) };
        if (res.decided) res.score[g.winner]++; // decided on shots: the winner goes through by one
        setTimeout(() => { if (mode === 'game' && game === g) { mode = 'menu'; hud.show(false); game = null; match.onFinish(res); } }, 2500);
        return;
      }
      if (match.kind === 'cpu' || match.kind === 'coop' || match.kind === 'friend') {
        const me = score[humanTeam], them = score[1 - humanTeam];
        save.addResult(me > them ? 'won' : me < them ? 'lost' : 'drawn');
      }
      setTimeout(() => {
        if (mode !== 'game') return;
        menu.showEnd({ score, teams: game.teams, stats, humanTeam, kind: match.kind,
          onAgain: () => startMatch(match), onMenu: () => showMenu() });
      }, 2500);
    };
    paused = false;
    mode = 'game';
    resize();
  }

  function togglePause() {
    if (mode !== 'game' || !game || game.phase === 'end') return;
    if (paused) { if (menu.nav.top && menu.nav.top.isPause) { menu.nav.pop(); resume(); } return; }
    paused = true;
    const objectives = trackers.map((tr) => ({ n: game.controllers.findIndex((c) => c.team === tr.f.me) + 1,
      items: tr.ids.map((id, i) => ({ text: t('obj.' + id), status: tr.status[i] })) }));
    const quit = () => { paused = false; if (match.onQuit) { mode = 'menu'; hud.show(false); game = null; match.onQuit(); } else showMenu(); };
    const l = menu.showPause({ onResume: resume, onRestart: () => { paused = false; startMatch(match); }, onQuit: quit, objectives });
    l.isPause = true;
  }

  function resume() { paused = false; for (const c of game.controllers) c.input.actions.clear(); if (input) { input.keys.clear(); input.resumeGuard = true; } }

  function showMenu() {
    mode = 'menu';
    hud.show(false);
    if (viewer) { viewer.dispose(); viewer = null; }
    game = null;
    menu.nav.clear();
    menu.showHub();
  }

  function openViewer() {
    mode = 'viewer';
    hud.show(false);
    game = null;
    viewer = new AnimViewer(renderer, template, () => { viewer.dispose(); viewer = null; showMenu(); });
    resize();
  }

  menu.onStart = startMatch;
  menu.onViewer = openViewer;
  window.__proto = { get game() { return game; }, startMatch, openViewer, showMenu, template, menu, ut: { club: UTC, cards: UTCARDS } };

  const padMenus = new PadMenus();
  const helpEl = hud.el.querySelector('#help');
  let helpPad = null;
  let last = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    menu.poll(dt);
    if (mode === 'viewer' && viewer) {
      if (!menu.active) padMenus.poll(dt, { onViewer: (c) => viewer.pad(c) });
      viewer.update(dt); renderer.render(viewer.scene, viewer.camera); return;
    }
    if (!game) {
      if (menu.walkout && menu.walkout.active) { menu.walkout.update(dt); menu.walkout.render(); } else renderer.clear();
      return;
    }
    if (input && mode === 'game') {
      input.suspended = paused || menu.active;
      input.poll();
      if (helpPad !== input.usingPad) { helpPad = input.usingPad; helpEl.innerHTML = t(helpPad ? 'help.pad' : 'help.kb'); }
    }
    if (!paused) game.update(dt);
    if (trackers.length && (trackT += dt) > 0.25) { trackT = 0; for (const tr of trackers) tr.tick(); }
    renderer.render(game.scene, game.camera);
  });
  menu.start();
}

class AnimViewer {
  constructor(renderer, template, onClose) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1d2738);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 2));
    const d = new THREE.DirectionalLight(0xffffff, 1.8); d.position.set(3, 6, 4); this.scene.add(d);
    const grid = new THREE.GridHelper(8, 16, 0x5a6d8c, 0x34445f); this.scene.add(grid);
    this.camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.05, 100);
    this.camera.position.set(2.2, 1.3, 3.2);
    this.camera.lookAt(0.6, 0.55, 0);
    this.template = template;
    this.setCharacter(template.id);
    this.meta = template.meta;
    this.names = Object.keys(template.clips).sort((a, b) => (a.startsWith('gk_') - b.startsWith('gk_')) || a.localeCompare(b));
    this.mirror = false;
    this.panel = document.createElement('div');
    this.panel.className = 'viewer';
    this.panel.innerHTML = `<strong>Animazioni (${this.names.length})</strong><small>84 da giocatore + 99 da portiere (prefisso gk_)</small>
      ${Object.keys(template.byId).length > 1 ? `<select id="vc" aria-label="Personaggio">${Object.values(template.byId).map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}</select>` : ''}
      <input id="vf" placeholder="Cerca: run, shoot, dive…" aria-label="Cerca animazione">
      <label style="font-size:13px"><input type="checkbox" id="vm"> Specchiata (sinistra)</label>
      <div id="vinfo" style="font-size:12px;opacity:.85;min-height:32px"></div><ul id="vl"></ul><button id="vclose">Torna al menu</button><small>Controller: croce su/giù cambia animazione, X specchia, B esce.</small>`;
    document.body.appendChild(this.panel);
    this.list = this.panel.querySelector('#vl');
    this.panel.querySelector('#vf').oninput = (e) => this.fill(e.target.value);
    this.panel.querySelector('#vm').onchange = (e) => { this.mirror = e.target.checked; if (this.cur) this.select(this.cur); };
    this.panel.querySelector('#vclose').onclick = onClose;
    const vc = this.panel.querySelector('#vc');
    if (vc) vc.onchange = (e) => { this.setCharacter(e.target.value); this.select(this.cur); };
    this.fill('');
    this.select('run_with_ball');
  }

  fill(q) {
    this.list.innerHTML = '';
    for (const n of this.names) {
      if (q && !n.toLowerCase().includes(q.toLowerCase()) && !(this.meta[n]?.states || []).join(' ').toLowerCase().includes(q.toLowerCase())) continue;
      const li = document.createElement('li');
      li.textContent = n; li.dataset.name = n; li.tabIndex = 0;
      li.onclick = () => this.select(n);
      li.onkeydown = (e) => { if (e.key === 'Enter') this.select(n); };
      if (n === this.cur) li.className = 'on';
      this.list.appendChild(li);
    }
  }

  setCharacter(id) {
    if (this.fielder) this.scene.remove(this.fielder.root);
    this.fielder = new Player({ scene: this.scene }, this.template.byId[id], 0, 'fielder', 0);
    this.fielder.ring.visible = false;
  }

  select(n) {
    this.cur = n;
    const gk = n.startsWith('gk_');
    this.fielder.scale = (gk ? GOALIE.height : FIELDER.height) / this.fielder.baseHeight;
    this.fielder.rigHeight = gk ? RIG_HEIGHT.goalie : RIG_HEIGHT.fielder;
    this.fielder.model.scale.setScalar(this.fielder.scale);
    this.fielder.play(n, { loop: true, fade: 0.1, mirror: this.mirror });
    for (const li of this.list.children) li.className = li.dataset.name === n ? 'on' : '';
    const m = this.meta[n] || {};
    this.panel.querySelector('#vinfo').textContent = `${(m.duration || 0).toFixed(2)} s · ${m.keys || 0} chiavi${m.states && m.states.length ? ' · ' + m.states.slice(0, 3).join(', ') : ''}`;
  }

  pad({ next, back, mirror }) {
    if (back) { this.panel.querySelector('#vclose').click(); return; }
    if (mirror) { const cb = this.panel.querySelector('#vm'); cb.checked = !cb.checked; cb.onchange({ target: cb }); }
    if (next) {
      const items = [...this.list.children];
      const i = items.findIndex((li) => li.dataset.name === this.cur);
      const n = items[Math.max(0, Math.min(items.length - 1, i + next))];
      if (n) { this.select(n.dataset.name); n.scrollIntoView({ block: 'nearest' }); }
    }
  }

  update(dt) { this.fielder.update(dt); this.fielder.render(dt); }
  dispose() { this.panel.remove(); }
}

boot().catch((e) => {
  console.error(e);
  const d = document.createElement('pre');
  d.style.cssText = 'position:fixed;inset:16px;color:#fff;background:#1b1036;padding:16px;white-space:pre-wrap;z-index:9';
  d.textContent = 'Errore / Error\n' + String(e && (e.stack || e.message) || e);
  document.body.appendChild(d);
});
