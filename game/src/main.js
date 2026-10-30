import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Game } from './game.js';
import { Hud } from './hud.js';
import { Input, PadMenus } from './input.js';
import { MATCH, FIELDER, GOALIE, RIG_HEIGHT, TEAM_DEFAULTS } from './config.js';
import { Player } from './player.js';

// assets/roster.json lists the characters (one retargeted .glb + clip facts each) and the 5 per team
// (slots 0-3 fielders, slot 4 goalie). The built game embeds them; the dev page fetches them.
async function loadAssets() {
  const embedded = document.getElementById('asset-roster');
  const roster = embedded ? JSON.parse(embedded.textContent) : await (await fetch('/assets/roster.json')).json();
  const byId = {};
  for (const ch of roster.characters) {
    let glbBuffer, meta;
    const tag = document.getElementById('asset-glb-' + ch.id);
    if (tag) {
      const bin = atob(tag.textContent.trim());
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      glbBuffer = bytes.buffer;
      meta = JSON.parse(document.getElementById('asset-clips-' + ch.id).textContent);
    } else {
      glbBuffer = await (await fetch('/assets/' + ch.glb)).arrayBuffer();
      meta = await (await fetch('/assets/' + ch.clips)).json();
    }
    const gltf = await new GLTFLoader().parseAsync(glbBuffer, '');
    const clips = {};
    for (const a of gltf.animations) clips[a.name] = a;
    let material = null;
    gltf.scene.traverse((o) => { if (o.isMesh && !material) material = o.material; });
    byId[ch.id] = { id: ch.id, name: ch.name, scene: gltf.scene, clips, meta: meta.clips, height: meta.model_height,
      teamMaterials: ch.recolor ? teamMaterials(material) : null };
  }
  const first = byId[roster.characters[0].id];
  // the default template doubles as the shared one (clip facts are the same for every character)
  const teams = TEAM_DEFAULTS.map((d, i) => ({ ...d, ...(roster.teamInfo || [])[i] }));
  return { ...first, roster, byId, teams, forSlot: (team, slot) => byId[roster.teams[team][slot]] || first };
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

function screen(html) {
  const s = document.createElement('div');
  s.className = 'screen';
  s.innerHTML = `<div class="card">${html}</div>`;
  document.body.appendChild(s);
  return s;
}

const PAD_KEYS = `<div class="keys">
<kbd>Levetta sx</kbd><span>muovi (anche croce direzionale)</span>
<kbd>RT</kbd><span>turbo</span>
<kbd>A</kbd><span>passaggio</span>
<kbd>B</kbd><span>tieni premuto per caricare il tiro, rilascia per tirare · senza palla: scivolata</span>
<kbd>Y</kbd><span>pallonetto</span>
<kbd>X</kbd><span>finta · senza palla: spallata</span>
<kbd>LB</kbd><span>cambia giocatore</span>
<kbd>Menu ☰</kbd><span>pausa · nella pausa <kbd>View ⧉</kbd> ricomincia la partita</span></div>`;

const KEYS = `<div class="keys">
<kbd>WASD</kbd><span>muovi (anche frecce o levetta)</span>
<kbd>Shift</kbd><span>turbo</span>
<kbd>J</kbd><span>passaggio · senza palla: cambia giocatore</span>
<kbd>K</kbd><span>tieni premuto per caricare il tiro, rilascia per tirare · senza palla: scivolata</span>
<kbd>L</kbd><span>pallonetto · senza palla: spallata</span>
<kbd>Spazio</kbd><span>finta</span>
<kbd>+</kbd> <kbd>-</kbd><span>zoom della telecamera (anche rotella del mouse)</span>
<kbd>P</kbd><span>pausa</span></div>
<p>Rilascia il tiro con la barra piena (verde) per un <b>tiro perfetto</b> a effetto. Il portiere della tua squadra gioca da solo.</p>`;

const HELP_KEYS = '<kbd>WASD</kbd> muovi · <kbd>Shift</kbd> turbo · <kbd>J</kbd> passa / cambia · <kbd>K</kbd> tiro (tieni) / scivolata · <kbd>L</kbd> pallonetto / spallata · <kbd>Spazio</kbd> finta · <kbd>+</kbd>/<kbd>-</kbd> zoom · <kbd>P</kbd> pausa';
const HELP_PAD = '<kbd>A</kbd> passa · <kbd>B</kbd> tiro (tieni) / scivolata · <kbd>Y</kbd> pallonetto · <kbd>X</kbd> finta / spallata · <kbd>RT</kbd> turbo · <kbd>LB</kbd> cambia · <kbd>☰</kbd> pausa';

function controlsHtml() {
  const pad = navigator.getGamepads && [...navigator.getGamepads()].some((g) => g);
  return pad ? `<p><b>Controller collegato.</b></p>${PAD_KEYS}<details><summary>Tastiera</summary>${KEYS}</details>`
    : `${KEYS}<p><small>Collega un controller Xbox e premi un tasto: i comandi compaiono qui.</small></p>`;
}

async function boot() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  const loading = screen('<h1>Caricamento…</h1><p>Preparo il campo e le 183 animazioni.</p>');
  const template = await loadAssets();
  loading.remove();

  const hud = new Hud();
  hud.onSfx = makeAudio();
  hud.show(false);
  let game = null, input = null, paused = false, mode = 'menu', viewer = null;

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight);
    const cam = game ? game.camera : viewer?.camera;
    if (cam) { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
  };
  addEventListener('resize', resize);

  function startMatch({ aiOnly = false, seconds = MATCH.seconds } = {}) {
    if (viewer) { viewer.dispose(); viewer = null; }
    game = new Game(renderer, template, hud);
    game.aiOnly = aiOnly;
    if (aiOnly) game.setHuman(null);
    game.clock = seconds;
    input = input || new Input(game);
    input.game = game;
    input.resumeGuard = true;
    input.onPause = () => togglePause();
    hud.setTeams(game.teams);
    hud.show(true);
    hud.el.querySelector('#help').style.display = aiOnly ? 'none' : '';
    hud.onEnd = (score, humanTeam, stats) => {
      setTimeout(() => {
        const res = aiOnly ? 'Fine partita' : score[humanTeam] > score[1 - humanTeam] ? 'Vittoria!' : score[humanTeam] < score[1 - humanTeam] ? 'Sconfitta' : 'Pareggio';
        const s = screen(`<h1>${res} ${score[0]} – ${score[1]}</h1>
          <table><tr><td></td><td style="color:${game.teams[0].color}">${game.teams[0].name}</td><td style="color:${game.teams[1].color}">${game.teams[1].name}</td></tr>
          <tr><td>Tiri</td><td>${stats.shots[0]}</td><td>${stats.shots[1]}</td></tr>
          <tr><td>Parate</td><td>${stats.saves[0]}</td><td>${stats.saves[1]}</td></tr>
          <tr><td>Passaggi</td><td>${stats.passes[0]}</td><td>${stats.passes[1]}</td></tr>
          <tr><td>Scivolate</td><td>${stats.tackles[0]}</td><td>${stats.tackles[1]}</td></tr></table>
          <div class="row"><button id="again">Rigioca</button><button class="alt" id="menu">Menu</button></div>`);
        s.querySelector('#again').onclick = () => { s.remove(); startMatch({ aiOnly, seconds }); };
        s.querySelector('#menu').onclick = () => { s.remove(); showMenu(); };
        s.querySelector('#again').focus();
      }, 2500);
    };
    mode = 'game';
    resize();
  }

  let pauseScreen = null;
  function togglePause() {
    if (mode !== 'game' || !game || game.phase === 'end') return;
    paused = !paused;
    if (paused) {
      pauseScreen = screen(`<h1>Pausa</h1>${controlsHtml()}<div class="row"><button id="resume">Riprendi</button><button class="alt" id="restart">Ricomincia</button><button class="alt" id="quit">Esci al menu</button></div>`);
      pauseScreen.querySelector('#restart').onclick = restartFromPause;
      pauseScreen.querySelector('#resume').onclick = togglePause;
      pauseScreen.querySelector('#quit').onclick = () => { paused = false; pauseScreen.remove(); pauseScreen = null; showMenu(); };
    } else if (pauseScreen) { pauseScreen.remove(); pauseScreen = null; game.input.actions.clear(); if (input) input.resumeGuard = true; }
  }

  function restartFromPause() {
    if (!pauseScreen) return;
    paused = false; pauseScreen.remove(); pauseScreen = null;
    startMatch({ aiOnly: game.aiOnly, seconds: MATCH.seconds });
  }

  function showMenu() {
    mode = 'menu';
    hud.show(false);
    if (viewer) { viewer.dispose(); viewer = null; }
    if (!game) { game = new Game(renderer, template, hud); game.aiOnly = true; game.setHuman(null); game.clock = 9999; }
    const s = screen(`<h1>Calcio arcade · prototipo</h1>
      <p>5 contro 5 su un campo di 41 × 24 m chiuso da barriere, con le misure e la fisica del documento di riferimento. Tutti i giocatori usano il tuo personaggio con le animazioni adattate.</p>
      <div id="ctl">${controlsHtml()}</div>
      <div class="row"><button id="play">Gioca (3 minuti)</button><button class="alt" id="cpu">Guarda CPU contro CPU</button><button class="alt" id="anim">Visualizzatore animazioni</button></div>`);
    s.querySelector('#play').onclick = () => { s.remove(); startMatch(); };
    s.querySelector('#cpu').onclick = () => { s.remove(); startMatch({ aiOnly: true }); };
    s.querySelector('#anim').onclick = () => { s.remove(); openViewer(); };
    s.querySelector('#play').focus();
    const refresh = () => { const c = s.querySelector('#ctl'); if (c && s.isConnected) c.innerHTML = controlsHtml(); };
    addEventListener('gamepadconnected', refresh);
    addEventListener('gamepaddisconnected', refresh);
  }

  function openViewer() {
    mode = 'viewer';
    hud.show(false);
    game = null;
    viewer = new AnimViewer(renderer, template, () => { viewer.dispose(); viewer = null; showMenu(); });
    resize();
  }

  window.__proto = { get game() { return game; }, startMatch, openViewer, template };

  const padMenus = new PadMenus();
  const helpEl = hud.el.querySelector('#help');
  let helpPad = null;
  let last = performance.now();
  renderer.setAnimationLoop((now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    padMenus.poll(dt, {
      onBack: (top) => { if (top === pauseScreen) togglePause(); },
      onRestart: (top) => { if (top === pauseScreen) restartFromPause(); },
      onViewer: mode === 'viewer' && viewer ? (c) => viewer.pad(c) : null,
    });
    if (mode === 'viewer' && viewer) { viewer.update(dt); renderer.render(viewer.scene, viewer.camera); return; }
    if (!game) return;
    if (input && mode === 'game') {
      input.suspended = paused || !!document.querySelector('.screen');
      input.poll();
      if (helpPad !== input.usingPad) { helpPad = input.usingPad; helpEl.innerHTML = helpPad ? HELP_PAD : HELP_KEYS; }
    }
    if (!paused) game.update(dt);
    renderer.render(game.scene, game.camera);
  });
  showMenu();
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
  screen(`<h1>Errore</h1><p>${String(e && e.message || e)}</p>`);
});
