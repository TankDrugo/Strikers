import * as THREE from 'three';
import { SHOT, SUPER } from './config.js';
import { t } from './ui/i18n.js';

const PAD_COLORS = ['#2b8cff', '#ff3b3b', '#ffc21f', '#2fbf4a']; // P1 blue, P2 red, P3 yellow, P4 green, like FC

const css = `
.hud{position:fixed;inset:0;pointer-events:none;font-family:"Trebuchet MS",system-ui,sans-serif;color:#fff;user-select:none}
.hud .score{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);display:flex;gap:14px;align-items:center;background:rgba(10,16,28,.72);padding:6px 18px;border-radius:999px;font-weight:700;font-size:22px;font-variant-numeric:tabular-nums;letter-spacing:.02em}
.hud .team{display:flex;align-items:center;gap:8px}.hud .dot{width:14px;height:14px;border-radius:50%;box-shadow:0 0 0 2px rgba(0,0,0,.35)}
.hud .tname{font-size:13px;letter-spacing:.08em;text-transform:uppercase}
.hud .clock{font-size:16px;opacity:.85;min-width:52px;text-align:center}
.hud .meter{position:absolute;width:86px;height:10px;border-radius:6px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.6);overflow:hidden;display:none}
.hud .meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd23f,#ff7b2f)}
.hud .meter b{position:absolute;right:0;top:0;bottom:0;width:1%;background:rgba(120,255,160,.85)}
.hud .smeter{position:absolute;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(520px,80vw);display:none;text-align:center;font-family:"Bungee","Arial Black",sans-serif}
.hud .smeter .sbar{position:relative;height:30px;border-radius:15px;border:3px solid #fff;background:linear-gradient(90deg,#3a1260,#7a2fd8);box-shadow:0 4px 0 rgba(0,0,0,.45);overflow:hidden}
.hud .smeter .z{position:absolute;top:0;bottom:0}.hud .smeter .z.y{background:#ffd23fa8}.hud .smeter .z.d{background:#17b34f}
.hud .smeter .nd{position:absolute;top:-4px;bottom:-4px;width:5px;margin-left:-2px;background:#fff;box-shadow:0 0 6px #fff}
.hud .smeter .nd.stop{background:#ffd21f;box-shadow:0 0 6px #ffd21f}
.hud .smeter b{display:block;font-size:22px;letter-spacing:.04em;color:#ffd21f;text-shadow:0 3px 0 #1b1036}
.hud .smeter small{display:block;font-size:12px;opacity:.9;margin-top:4px}
.hud .meter.super i{background:linear-gradient(90deg,#b07bff,#ffd21f)}
.hud .flash{position:absolute;top:22%;left:0;right:0;text-align:center;font-size:44px;font-weight:900;letter-spacing:.04em;text-shadow:0 4px 0 rgba(0,0,0,.35);opacity:0;transition:opacity .2s}
.hud .help{position:absolute;bottom:calc(10px + env(safe-area-inset-bottom,0px));left:max(12px,env(safe-area-inset-left,0px));font-size:13px;line-height:1.5;background:rgba(10,16,28,.6);padding:8px 12px;border-radius:8px;opacity:.9}
.hud .help kbd{font-family:inherit;background:rgba(255,255,255,.18);border-radius:4px;padding:0 5px}
.screen{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,12,22,.78);font-family:"Trebuchet MS",system-ui,sans-serif;color:#fff;padding:16px;z-index:5}
.screen .card{max-width:560px;width:100%;background:#152033;border-radius:14px;padding:24px 26px;box-shadow:0 20px 60px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:14px}
.screen h1{margin:0;font-size:30px;letter-spacing:.02em}.screen p{margin:0;opacity:.9;line-height:1.5}
.screen .row{display:flex;gap:10px;flex-wrap:wrap}
.screen button{pointer-events:auto;font:inherit;font-weight:700;font-size:16px;border:0;border-radius:10px;padding:11px 18px;cursor:pointer;background:#ffd23f;color:#1b1b10}
.screen button.alt{background:#2c3d5a;color:#fff}
.screen button:focus-visible{outline:3px solid #8fd3ff;outline-offset:2px}
.screen table{border-collapse:collapse;font-size:14px}.screen td{padding:3px 10px 3px 0}
.screen .keys{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px}
.screen kbd{font-family:inherit;background:rgba(255,255,255,.16);border-radius:4px;padding:1px 6px;white-space:nowrap}
.viewer{position:fixed;top:12px;right:max(12px,env(safe-area-inset-right,0px));bottom:12px;width:300px;background:rgba(10,16,28,.88);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;font-family:system-ui,sans-serif;color:#fff;z-index:4}
.viewer input{font:inherit;padding:7px 9px;border-radius:8px;border:1px solid #3b4d6b;background:#0e1626;color:#fff}
.viewer ul{list-style:none;margin:0;padding:0;overflow:auto;flex:1;font-size:13px}
.viewer li{padding:5px 8px;border-radius:6px;cursor:pointer}.viewer li:hover{background:#22314d}.viewer li.on{background:#ffd23f;color:#1b1b10}
.viewer small{opacity:.7}.viewer button{font:inherit;border:0;border-radius:8px;padding:8px;background:#2c3d5a;color:#fff;cursor:pointer}
`;

export class Hud {
  constructor() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    this.el = document.createElement('div'); this.el.className = 'hud';
    this.el.innerHTML = `<div class="score"><span class="team"><span class="tname" id="n0">Gialli</span><span class="dot" id="d0" style="background:#ffd23f"></span><span id="s0">0</span></span><span class="clock" id="clock">3:00</span><span class="team"><span id="s1">0</span><span class="dot" id="d1" style="background:#ff4f4f"></span><span class="tname" id="n1">Rossi</span></span></div>
      <div class="meter" id="meter"><i></i><b></b></div><div class="flash" id="flash"></div>
      <div class="smeter" id="smeter"><b>SUPER STRIKE</b><div class="sbar"></div><small></small></div>
      <div class="help" id="help"><kbd>WASD</kbd>/<kbd>frecce</kbd> muovi · <kbd>Shift</kbd> turbo · <kbd>J</kbd> passa / cambia · <kbd>K</kbd> tiro (tieni) / scivolata · <kbd>L</kbd> pallonetto / spallata · <kbd>Spazio</kbd> finta · <kbd>+</kbd>/<kbd>-</kbd> o rotella: zoom · <kbd>P</kbd> pausa</div>`;
    document.body.appendChild(this.el);
    this.meter = this.el.querySelector('#meter');
    this.smeter = this.el.querySelector('#smeter');
    // the meter (game/src/config.js SUPER): yellow bands, green marks (the second one widens after a good first press), one needle
    const zone = (m, w, cls, id = '') => `<i class="z ${cls}" ${id} style="left:${(m - w) * 100}%;width:${w * 200}%"></i>`;
    this.smeter.querySelector('.sbar').innerHTML = SUPER.marks.map((m, i) => zone(m, SUPER.yellow * SUPER.yellowScale, 'y') + zone(m, SUPER.perfectMin, 'd', i ? 'data-g="1"' : '')).join('') + '<i class="nd stop"></i><i class="nd cur"></i>';
    this.green2 = this.smeter.querySelector('[data-g]');
    this.flashEl = this.el.querySelector('#flash');
    this.flashT = 0;
    this.v = new THREE.Vector3();
    this.onSfx = null;
  }

  show(on) { this.el.style.display = on ? '' : 'none'; }

  // short message at the bottom (star objectives)
  toast(text, color = '#fff5dc') {
    if (!this.toastEl) { this.toastEl = document.createElement('div'); this.toastEl.className = 'toast'; this.el.appendChild(this.toastEl); }
    const e = this.toastEl;
    e.textContent = text; e.style.background = color; e.classList.add('on');
    clearTimeout(this.toastT); this.toastT = setTimeout(() => e.classList.remove('on'), 2600);
  }

  // Team names and colours on the score, from roster.json (teamInfo)
  setTeams(teams) {
    this.teams = teams;
    teams.forEach((t, i) => {
      this.el.querySelector('#d' + i).style.background = t.color;
      const n = this.el.querySelector('#n' + i); n.textContent = t.name; n.style.color = t.color;
    });
  }
  sfx(name) { this.onSfx && this.onSfx(name); }

  flash(text, color = '#fff', secs = 1.1) {
    if (!text) return;
    this.flashEl.textContent = text; this.flashEl.style.color = color; this.flashEl.style.opacity = 1; this.flashT = secs;
  }

  goal(team, score) { this.flash(t('flash.goal'), this.teams ? this.teams[team].color : team === 0 ? '#ffd23f' : '#ff6b6b', 2.4); this.sfx('goal'); }

  end(score, humanTeam, stats) { this.onEnd && this.onEnd(score, humanTeam, stats); }

  update(game) {
    this.el.querySelector('#s0').textContent = game.score[0];
    this.el.querySelector('#s1').textContent = game.score[1];
    const c = Math.ceil(game.clock);
    this.el.querySelector('#clock').textContent = `${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`;
    if (this.flashT > 0) { this.flashT -= 1 / 60; if (this.flashT <= 0) this.flashEl.style.opacity = 0; }
    // FIFA-style marker over every human-controlled player: "P1" in the controller's colour, arrow down to the head
    const tags = game.controllers;
    this.tags = this.tags || [];
    while (this.tags.length < tags.length) { const e = document.createElement('div'); e.className = 'ptag'; this.el.appendChild(e); this.tags.push(e); }
    this.tags.forEach((e, i) => {
      const c = tags[i];
      if (!c || !c.player || c.player.state === 'super') { e.style.display = 'none'; return; }
      this.v.set(c.player.rpos.x, c.player.cfg.height * 1.08 + 0.1, c.player.rpos.z).project(game.camera);
      e.style.display = 'block';
      e.textContent = t('hud.p', { n: i + 1 }) + (game.isCaptain && game.isCaptain(c.player) ? ' ©' : '');
      e.style.setProperty('--pc', PAD_COLORS[i % PAD_COLORS.length]);
      e.style.left = `${(this.v.x * 0.5 + 0.5) * innerWidth}px`;
      e.style.top = `${(-this.v.y * 0.5 + 0.5) * innerHeight}px`;
    });
    // Super Strike meter: needles in game time, shown to everyone (also when the computer does it)
    const ss = game.superStrike;
    if (ss && ss.phase === 'meter') {
      this.smeter.style.display = 'block';
      const [stop, cur] = this.smeter.querySelectorAll('.nd');
      cur.style.left = `${ss.needle * 100}%`;
      stop.style.display = ss.n[0] === null ? 'none' : ''; if (ss.n[0] !== null) stop.style.left = `${ss.n[0] * 100}%`;
      this.green2.style.left = `${(SUPER.marks[1] - ss.green) * 100}%`; this.green2.style.width = `${ss.green * 200}%`;
      this.smeter.querySelector('small').textContent = ss.human ? t('hud.superHint') : '';
    } else this.smeter.style.display = 'none';
    const h = game.controllers.map((c) => c.player).find((p) => p && p.state === 'windup');
    if (h && game.canSuper && game.canSuper(h) && h.stateTime > SHOT.windupSeconds) {
      // past the normal bar: the captain charges the Super Strike
      const f = Math.min(1, (h.stateTime - SHOT.windupSeconds) / (game.superChargeSeconds(h) - SHOT.windupSeconds));
      this.v.set(h.rpos.x, h.cfg.height * 1.08 + 0.1, h.rpos.z).project(game.camera);
      this.meter.style.display = 'block'; this.meter.classList.add('super');
      this.meter.style.left = `${(this.v.x * 0.5 + 0.5) * innerWidth - 43}px`;
      this.meter.style.top = `${(-this.v.y * 0.5 + 0.5) * innerHeight - 48}px`;
      this.meter.firstChild.style.width = `${f * 100}%`;
      this.meter.firstChild.style.background = '';
    } else if (h) {
      this.meter.classList.remove('super');
      // ShotMeter: the bar shows the charge, 0.25 at the press and 1 (perfect, green) when full
      const f = h.stateTime >= SHOT.windupSeconds ? 1 : SHOT.chargeMin + (1 - SHOT.chargeMin) * h.stateTime / SHOT.windupSeconds;
      this.v.set(h.rpos.x, h.cfg.height * 1.08 + 0.1, h.rpos.z).project(game.camera); // just above the P1 marker
      this.meter.style.display = 'block';
      this.meter.style.left = `${(this.v.x * 0.5 + 0.5) * innerWidth - 43}px`;
      this.meter.style.top = `${(-this.v.y * 0.5 + 0.5) * innerHeight - 48}px`;
      this.meter.firstChild.style.width = `${f * 100}%`;
      this.meter.firstChild.style.background = f >= SHOT.perfectFrom ? '#7dffa8' : '';
    } else this.meter.style.display = 'none';
  }
}
