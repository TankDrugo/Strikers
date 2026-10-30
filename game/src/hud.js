import * as THREE from 'three';
import { SHOT } from './config.js';

const css = `
.hud{position:fixed;inset:0;pointer-events:none;font-family:"Trebuchet MS",system-ui,sans-serif;color:#fff;user-select:none}
.hud .score{position:absolute;top:calc(12px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);display:flex;gap:14px;align-items:center;background:rgba(10,16,28,.72);padding:6px 18px;border-radius:999px;font-weight:700;font-size:22px;font-variant-numeric:tabular-nums;letter-spacing:.02em}
.hud .team{display:flex;align-items:center;gap:8px}.hud .dot{width:14px;height:14px;border-radius:50%;box-shadow:0 0 0 2px rgba(0,0,0,.35)}
.hud .tname{font-size:13px;letter-spacing:.08em;text-transform:uppercase}
.hud .clock{font-size:16px;opacity:.85;min-width:52px;text-align:center}
.hud .meter{position:absolute;width:86px;height:10px;border-radius:6px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.6);overflow:hidden;display:none}
.hud .meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd23f,#ff7b2f)}
.hud .meter b{position:absolute;right:0;top:0;bottom:0;width:6%;background:rgba(120,255,160,.85)}
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
      <div class="help" id="help"><kbd>WASD</kbd>/<kbd>frecce</kbd> muovi · <kbd>Shift</kbd> turbo · <kbd>J</kbd> passa / cambia · <kbd>K</kbd> tiro (tieni) / scivolata · <kbd>L</kbd> pallonetto / spallata · <kbd>Spazio</kbd> finta · <kbd>+</kbd>/<kbd>-</kbd> o rotella: zoom · <kbd>P</kbd> pausa</div>`;
    document.body.appendChild(this.el);
    this.meter = this.el.querySelector('#meter');
    this.flashEl = this.el.querySelector('#flash');
    this.flashT = 0;
    this.v = new THREE.Vector3();
    this.onSfx = null;
  }

  show(on) { this.el.style.display = on ? '' : 'none'; }

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

  goal(team, score) { this.flash('GOL!', this.teams ? this.teams[team].color : team === 0 ? '#ffd23f' : '#ff6b6b', 2.4); this.sfx('goal'); }

  end(score, humanTeam, stats) { this.onEnd && this.onEnd(score, humanTeam, stats); }

  update(game) {
    this.el.querySelector('#s0').textContent = game.score[0];
    this.el.querySelector('#s1').textContent = game.score[1];
    const c = Math.ceil(game.clock);
    this.el.querySelector('#clock').textContent = `${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`;
    if (this.flashT > 0) { this.flashT -= 1 / 60; if (this.flashT <= 0) this.flashEl.style.opacity = 0; }
    const h = game.human;
    if (h && h.state === 'windup' && !game.aiOnly) {
      const f = Math.min(1, h.stateTime / SHOT.windupSeconds);
      this.v.set(h.pos.x, h.cfg.height + 0.45, h.pos.z).project(game.camera);
      this.meter.style.display = 'block';
      this.meter.style.left = `${(this.v.x * 0.5 + 0.5) * innerWidth - 43}px`;
      this.meter.style.top = `${(-this.v.y * 0.5 + 0.5) * innerHeight - 14}px`;
      this.meter.firstChild.style.width = `${f * 100}%`;
      this.meter.firstChild.style.background = f >= 1 - SHOT.perfectWindow ? '#7dffa8' : '';
    } else this.meter.style.display = 'none';
  }
}
