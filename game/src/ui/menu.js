// The game's menus (stage 1 of interfaccia-gioco/DESIGN.md): language, profiles, the FC-style hub with LB/RB tabs,
// Cups and Ultimate Team as separate parts of the menu with their own tabs and colours, quick play set-up,
// players joining with their controller, pause and full-time screens.
import { UiNav, el } from './nav.js';
import { installTheme, cardHtml } from './theme.js';
import { t, setLang, getLang } from './i18n.js';
import { save, PROFILE_COLORS } from './save.js';
import { readPads } from '../input.js';
import { installCups } from './cupsMenu.js';
import { installUt } from './utMenu.js';
import { installSquads, presets, presetLineup, sidesColors, lineupLabel } from './squads.js';
import { CARD, RANK } from '../ut/cards.js';
import { clubOf, squadRating, divName } from '../ut/club.js';
import { cupById, roundKey } from '../cups/cups.js';

const MAIN = ['home', 'quick', 'cups', 'ut', 'opts'];
const SUB = { cups: ['cups', 'private', 'trophies'], ut: ['club', 'squad', 'market', 'divisions', 'album'] };
const SUB_KEY = { cups: 'sub.cups', private: 'sub.private', trophies: 'sub.trophies', club: 'sub.club', squad: 'sub.squad', market: 'sub.market', divisions: 'sub.divisions', album: 'sub.album' };
const CUPS = [['c1', 3], ['c2', 4], ['c3', 5], ['c4', 5]];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Synth blips for menu moves (same idea as the drafts page; real sounds come later, CC0 only).
function makeBlips() {
  let ac = null;
  const blip = (f1, f2, dur, type, vol) => {
    try {
      ac = ac || new AudioContext();
      if (ac.state === 'suspended') ac.resume();
      const o = ac.createOscillator(), g = ac.createGain(), now = ac.currentTime;
      o.type = type; o.frequency.setValueAtTime(f1, now); o.frequency.exponentialRampToValueAtTime(f2, now + dur);
      g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g).connect(ac.destination); o.start(now); o.stop(now + dur + 0.02);
    } catch { /* no audio */ }
  };
  return (name) => ({
    move: () => blip(660, 880, 0.05, 'square', 0.03),
    tab: () => blip(320, 640, 0.09, 'triangle', 0.07),
    ok: () => blip(200, 700, 0.14, 'triangle', 0.08),
    back: () => blip(600, 200, 0.13, 'triangle', 0.07),
    enter: () => { blip(200, 900, 0.25, 'sawtooth', 0.04); setTimeout(() => blip(500, 1200, 0.2, 'triangle', 0.06), 120); },
  }[name] || (() => {}))();
}

export class Menu {
  constructor() {
    installTheme();
    if (save.lang) setLang(save.lang);
    this.root = el('<div class="ui"></div>');
    document.body.appendChild(this.root);
    this.nav = new UiNav(this.root);
    this.sfx = makeBlips();
    this.nav.onSound = (n) => this.sfx(n);
    this.state = { mode: 'main', tab: 0, sub: 0 };
    this.setup = { kind: 'cpu', seconds: 180, cpuLevel: 1, sides: null };
    this.newsIdx = 0;
    setInterval(() => this.rotateNews(), 7000);
  }

  get active() { return this.nav.active; }

  // the two line-ups of quick play (side 0 is player 1's team): presets until changed in the set-up
  sides() {
    if (!this.setup.sides) this.setup.sides = this.roster ? [presetLineup(this.roster, 0), presetLineup(this.roster, 1)] : [{ name: 'Celestini' }, { name: 'Rivali' }];
    return this.setup.sides;
  }
  poll(dt) { this.nav.poll(dt); }

  layer(cls, html, opts = {}) {
    const l = { el: el(`<div class="layer ${cls}">${html}</div>`), ...opts };
    l.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (b && l.el.contains(b) && l.act) l.act(b.dataset.act, b);
    });
    return l;
  }

  // ------------------------------------------------------------- loading

  showLoading() {
    this.loading = this.nav.push(this.layer('', `<div class="bg"></div><div class="center"><div class="panel" style="width:min(30em,100%)">
      <h1 class="title">${t('loading.title')}</h1><div class="bar-load"><i></i></div><p class="sub" id="ld"></p></div></div>`));
  }

  setProgress(done, total) {
    if (!this.loading) return;
    this.loading.el.querySelector('.bar-load i').style.width = `${Math.round(done / total * 100)}%`;
    this.loading.el.querySelector('#ld').textContent = t('loading.detail', { done, total });
  }

  showError(err) {
    this.nav.clear();
    const msg = String(err && (err.stack || err.message) || err);
    this.nav.push(this.layer('', `<div class="bg"></div><div class="center"><div class="panel">
      <h1 class="title">${t('loading.error')}</h1><p class="sub">${t('loading.errorHint')}</p><pre class="errtxt">${esc(msg)}</pre></div></div>`));
  }

  hideLoading() { if (this.loading) { this.nav.pop(this.loading); this.loading = null; } }

  // ------------------------------------------------------------- start: language and profile

  start() {
    if (!save.lang) this.showLanguage(() => this.showProfiles());
    else if (!save.active()) this.showProfiles();
    else this.showHub();
  }

  showLanguage(then) {
    const l = this.layer('', `<div class="bg"></div><div class="center"><div class="panel" style="width:min(36em,100%)">
      <h1 class="title">Lingua · Language</h1>
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <button class="tile" data-nav data-act="it" ${getLang() === 'it' ? 'data-autofocus' : ''}><span class="big">IT</span><h3>Italiano</h3></button>
        <button class="tile" data-nav data-act="en" ${getLang() === 'en' ? 'data-autofocus' : ''}><span class="big">EN</span><h3>English</h3></button>
      </div><p class="sub">Potrai cambiarla dalle Impostazioni · You can change it later in Settings.</p></div></div>`, {
      act: (a) => { setLang(a); save.lang = a; this.nav.pop(l); then && then(); },
      onBack: then ? null : () => this.nav.pop(l),
    });
    this.nav.push(l);
  }

  showProfiles() {
    const ps = save.profiles();
    const tiles = ps.map((p) => `<button class="tile profile-tile" data-nav data-act="pick" data-id="${p.id}">
        <span class="av" style="background:${p.color}">${esc(p.name[0].toUpperCase())}</span><h3>${esc(p.name)}</h3>
        <p>${t('profiles.played', { n: p.record.played })}</p></button>`).join('');
    const l = this.layer('', `<div class="bg"></div><div class="center"><div class="panel">
      <h1 class="title">${t('profiles.title')}</h1>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(10em,1fr))">${tiles}
        <button class="tile profile-tile" data-nav data-act="new"><span class="av" style="background:#fff;color:var(--ink);-webkit-text-stroke:0">+</span><h3>${t('profiles.new')}</h3><p>${t('profiles.newHint')}</p></button>
      </div></div></div>`, {
      act: (a, b) => {
        if (a === 'pick') { save.select(b.dataset.id); this.nav.clear(); this.showHub(); }
        if (a === 'new') this.showCreateProfile(() => { this.nav.clear(); this.showHub(); });
      },
      onBack: save.active() ? () => { this.nav.pop(l); } : null,
    });
    this.nav.push(l);
  }

  showCreateProfile(done) {
    let name = '', color = PROFILE_COLORS[save.profiles().length % PROFILE_COLORS.length];
    const letters = 'QWERTYUIOPASDFGHJKLÀZXCVBNMÈÉÒ'.split('');
    const keys = letters.map((c) => `<button class="key" data-nav data-act="k" data-k="${c}">${c}</button>`).join('');
    const l = this.layer('', `<div class="bg"></div><div class="center"><div class="panel">
      <h1 class="title">${t('profiles.create')}</h1>
      <div style="display:flex;gap:1em;align-items:center"><span class="av" id="pav" style="width:3.6em;height:3.6em;font-size:1.5em"></span><div class="name-box" style="flex:1"><span id="pname"></span><span class="caret"></span></div></div>
      <p class="sub">${t('profiles.typeHint')}</p>
      <div class="kb">${keys}<button class="key wide" data-nav data-act="sp">${t('profiles.space')}</button><button class="key wide" data-nav data-act="del">⌫ ${t('profiles.del')}</button><button class="key wide" data-nav data-act="ok" style="background:var(--leaf);color:#fff">${t('profiles.ok')}</button></div>
      <div style="display:flex;gap:1em;align-items:center"><b style="font-family:var(--fd);font-weight:400;font-size:1.2em">${t('profiles.color')}</b>
      <div class="colors">${PROFILE_COLORS.map((c) => `<button class="swatch" data-nav data-act="c" data-c="${c}" style="background:${c}"></button>`).join('')}</div></div>
      <p class="err" id="perr"></p></div></div>`, {
      textEntry: true,
      onText: (ch) => { if (ch === '\b') name = name.slice(0, -1); else if (name.length < 12) name += ch; paint(); },
      act: (a, b) => {
        if (a === 'k' && name.length < 12) name += name ? b.dataset.k.toLowerCase() : b.dataset.k;
        if (a === 'sp' && name && name.length < 12) name += ' ';
        if (a === 'del') name = name.slice(0, -1);
        if (a === 'c') color = b.dataset.c;
        if (a === 'ok') {
          if (!name.trim()) { l.el.querySelector('#perr').textContent = t('profiles.nameMissing'); return; }
          save.create(name.trim(), color); this.nav.pop(l); done();
          return;
        }
        paint();
      },
      onRaw: (dev, what) => {
        if (what === 'y') { l.act('del'); return true; }
        if (dev === 'kb' && what === 'confirm') { l.act('ok'); return true; } // typing on a keyboard: Enter = done
        return false;
      },
      onBack: () => this.nav.pop(l),
    });
    const paint = () => {
      l.el.querySelector('#pname').textContent = name;
      const av = l.el.querySelector('#pav'); av.style.background = color; av.textContent = (name[0] || '?').toUpperCase();
      for (const s of l.el.querySelectorAll('.swatch')) s.classList.toggle('on', s.dataset.c === color);
      l.el.querySelector('#perr').textContent = '';
    };
    this.nav.push(l);
    paint();
  }

  // ------------------------------------------------------------- hub

  showHub() {
    this.root.dataset.mode = 'main';
    const l = this.layer('hub', `<div class="bg"></div><div class="hub-ui">
        <div class="bar"><div class="crumb"></div><div class="tabs"></div><div class="chip-profile"></div></div>
        <div class="stage"></div><div class="footer"></div></div><div class="iris"></div><div class="banner"></div>`, {
      onTab: (d) => this.shiftTab(d),
      onBack: () => this.hubBack(),
      act: (a, b) => this.hubAct(a, b),
      onShow: () => this.renderHub(false),
    });
    l.el.querySelector('.tabs').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      e.stopPropagation();
      if (b.dataset.dir) this.shiftTab(+b.dataset.dir); else this.setTab(+b.dataset.i);
    });
    this.hub = l;
    this.nav.push(l);
    this.renderHub(false);
  }

  list() { return this.state.mode === 'main' ? MAIN : SUB[this.state.mode]; }
  cur() { return this.state.mode === 'main' ? this.state.tab : this.state.sub; }
  viewId() { return this.state.mode === 'main' ? MAIN[this.state.tab] : SUB[this.state.mode][this.state.sub]; }
  modeName(m) { return t('tab.' + m); }

  renderHub(anim = true) {
    const l = this.hub, st = this.state, p = save.active();
    if (!l || !p) return;
    this.root.dataset.mode = st.mode;
    this.root.dataset.sub = st.mode === 'ut' ? SUB.ut[st.sub] : '';
    const names = this.list().map((id) => st.mode === 'main' ? t('tab.' + id) : t(SUB_KEY[id]));
    l.el.querySelector('.tabs').innerHTML = `<button class="shoulder" data-dir="-1">LB</button>${names.map((n, i) => `<button class="tab${i === this.cur() ? ' on' : ''}" data-i="${i}">${n}</button>`).join('')}<button class="shoulder" data-dir="1">RB</button>`;
    // inside a mode the coloured tag says where you are; the lit tab says which section
    l.el.querySelector('.crumb').innerHTML = st.mode === 'main' ? names[st.tab] : `<span class="mode-tag">${this.modeName(st.mode)}</span>`;
    l.el.querySelector('.chip-profile').innerHTML = `<span class="av" style="background:${p.color}">${esc(p.name[0].toUpperCase())}</span><div><b>${esc(p.name)}</b><small>${p.ultimate.credits.toLocaleString(getLang())} ${t('credits')}</small></div>`;
    const id = this.viewId();
    const enter = st.mode === 'main' && (id === 'cups' || id === 'ut');
    l.el.querySelector('.footer').innerHTML = `<span><span class="btnA">A</span>${t(enter ? 'foot.enter' : 'foot.select')}</span>`
      + (st.mode !== 'main' ? `<span><span class="btnB">B</span>${t('foot.exit', { mode: this.modeName(st.mode) })}</span>` : '')
      + `<span><span class="btnLR">LB</span><span class="btnLR">RB</span>${st.mode === 'main' ? t('foot.tabs') : t('foot.sections', { mode: this.modeName(st.mode) })}</span>`;
    const stage = l.el.querySelector('.stage');
    stage.innerHTML = this.view(id);
    if (anim) stage.firstElementChild.classList.add('enter');
    l.focused = null;
    this.nav.focusFirst();
  }

  view(id) {
    const p = save.active(), r = p.record, teams = this.sides();
    const tile = (act, h, text = '', extra = '', style = '', cls = '') => `<button class="tile ${cls}" data-nav data-act="${act}" style="${style}"><h3>${h}</h3>${text ? `<p>${text}</p>` : ''}${extra}</button>`;
    const soon = (h, text) => `<div class="tile soon locked" data-nav tabindex="-1"><span class="soon-tag">${t('ut.soon')}</span><h3>${h}</h3><p>${text}</p></div>`;
    switch (id) {
      case 'home': {
        const n = this.newsIdx + 1;
        return `<div class="view" style="grid-template-columns:1.7fr 1fr;grid-template-rows:repeat(4,1fr)">
          <button class="tile news" data-nav data-act="news" style="grid-row:span 4"><span class="lab">${t('news.label')} · ${n} / 3</span>
            <h3>${t(`news.${n}.title`)}</h3><p>${t(`news.${n}.text`)}</p>
            <div class="mini-cards">${cardHtml({ ovr: 86, role: 'ATT', name: 'Attaccante', cls: 'h-rainbow', seed: 0 })}${cardHtml({ ovr: 88, role: 'CEN', name: 'Centrocampista', shirt: '#3fbf5f', cls: 'h-lava', seed: 3 })}${cardHtml({ ovr: 91, role: 'ATT', name: 'Attaccante', shirt: '#3fbf5f', cls: 'h-galaxy', seed: 1 })}</div>
            <div class="dots">${[1, 2, 3].map((i) => `<i class="${i === n ? 'on' : ''}"></i>`).join('')}</div></button>
          ${tile('playNow', t('home.playNow'), t('home.playNowText', { a: esc(teams[0].name), b: esc(teams[1].name), min: Math.round(this.setup.seconds / 60) }), '', '', '')}
          ${tile('friend', t('home.friend'), t('home.friendText'))}
          ${(() => { const run = save.run(p.id); return run
            ? tile('continueCup', t('cup.continue'), t('cup.inRun', { cup: t('cups.' + run.cupId), round: t('cup.r.' + roundKey(cupById(run.cupId), run.bracket.length - 1)) }), '', 'background:var(--sun)')
            : tile('watch', t('home.watch'), t('home.watchText')); })()}
          ${tile('record', t('home.record'), t('home.recordText', { w: r.won, d: r.drawn, l: r.lost }), '', 'cursor:default')}
        </div>`;
      }
      case 'quick':
        return `<div class="view" style="grid-template-columns:repeat(4,1fr);grid-template-rows:1fr .5fr">
          ${tile('q-cpu', t('quick.vsCpu'), t('quick.vsCpuText'), `<span class="big" style="margin-top:auto">${t('quick.big1')}</span>`)}
          ${tile('q-friend', t('quick.vsFriend'), t('quick.vsFriendText'), `<span class="big" style="margin-top:auto">${t('quick.big2')}</span>`)}
          ${tile('q-coop', t('quick.coop'), t('quick.coopText'), `<span class="big" style="margin-top:auto">${t('quick.big3')}</span>`)}
          ${tile('q-watch', t('quick.watch'), t('quick.watchText'), `<span class="big" style="margin-top:auto">${t('quick.big4')}</span>`)}
          <div class="tile" style="grid-column:span 4;cursor:default;justify-content:center"><div class="keys" style="grid-template-columns:auto 1fr auto 1fr">
            <b>${t('setup.team')}</b><span>${this.roster ? presets(this.roster).map((x) => esc(x.name)).join(' · ') : ''} · ${t('lineup.custom')}</span><b>${t('setup.time')}</b><span>2 · 3 · 5 min</span>
            <b>${t('setup.cpu')}</b><span>${t('setup.easy')} · ${t('setup.normal')} · ${t('setup.hard')}</span><b>${t('setup.stadium')}</b><span>${t('setup.stadiumMain')}</span></div></div>
        </div>`;
      case 'cups':
        if (this.state.mode === 'main') {
          return `<div class="view" style="grid-template-columns:1.2fr 1fr 1fr;grid-template-rows:1fr 1fr">
            ${tile('enter-cups', t('tab.cups'), t('cups.intro'), `<span class="hint"><span class="btnA">A</span>${t('foot.enter')}</span>`, 'grid-row:span 2', '')}
            ${CUPS.map(([c, n]) => `<div class="tile locked"><h3>${t('cups.' + c)}</h3><p>${t('cups.' + c + 't')} · ${t('cups.matches', { n })}</p></div>`).join('')}
          </div>`;
        }
        return this.cupsView();
      case 'private':
        return this.privateView();
      case 'trophies':
        return this.trophiesView();
      case 'ut':
        return `<div class="view" style="grid-template-columns:1.2fr 1fr;grid-template-rows:1fr 1fr">
          ${tile('enter-ut', t('tab.ut'), t('ut.intro'), `<span class="hint"><span class="btnA">A</span>${t('foot.enter')}</span>`, 'grid-row:span 2;background:linear-gradient(135deg,#2a1260,#6a2fd8);color:#fff', '')}
          ${(() => { const c = clubOf(p); if (!c.started) return `<div class="tile locked"><h3>${t('sub.divisions')}</h3><p>${t('ut.divisions')}</p></div><div class="tile locked"><h3>${t('sub.album')}</h3><p>${t('ut.album')}</p></div>`;
            const best = c.cards.map((i) => ({ i, c: CARD[i.id] })).sort((a, b) => RANK[b.c.rarity] - RANK[a.c.rarity] || b.c.ovr - a.c.ovr)[0];
            return `<div class="tile locked"><h3>${t('ut.div.name', { n: divName(c.division.div) })}</h3><p>${t('ut.squad.rating')} <b>${squadRating(c)}</b> · ${t('ut.div.points', { n: c.division.pts })}</p></div>
              <div class="tile locked" style="flex-direction:row;align-items:center;gap:.8em">${best ? `<div style="width:4.2em;flex:none">${this.utCard(best.c, { serial: best.i.serial })}</div>` : ''}<div><h3>${t('ut.club.best')}</h3><p>${t('ut.club.collectionText', { n: c.cards.length, a: Object.keys(c.album).length, b: Object.keys(CARD).length })}</p></div></div>`; })()}
        </div>`;
      case 'club': case 'squad': case 'market': case 'divisions': case 'album':
        return this.utView(id);
      case 'opts':
        return `<div class="view" style="grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr">
          ${tile('o-lang', t('opts.lang'), getLang() === 'it' ? 'Italiano' : 'English')}
          ${tile('o-controls', t('opts.controls'), t('opts.controlsText'))}
          ${tile('o-profile', t('opts.profile'), esc(p.name))}
          ${tile('o-viewer', t('opts.viewer'), t('opts.viewerText'))}
          ${tile('o-delete', t('opts.deleteProfile'), esc(p.name))}
        </div>`;
    }
    return '';
  }

  rotateNews() {
    if (!this.hub || this.nav.top !== this.hub || this.viewId() !== 'home' || this.state.mode !== 'main') return;
    this.newsIdx = (this.newsIdx + 1) % 3;
    const focusedAct = this.hub.focused && this.hub.focused.dataset.act;
    this.renderHub(false);
    const again = focusedAct && this.hub.el.querySelector(`[data-act="${focusedAct}"]`);
    if (again) this.nav.focus(again, false);
  }

  setTab(i) {
    const n = this.list().length;
    i = (i + n) % n;
    if (this.state.mode === 'main') this.state.tab = i; else this.state.sub = i;
    this.renderHub();
  }

  shiftTab(d) { this.setTab(this.cur() + d); }

  transition(label, fn) {
    const iris = this.hub.el.querySelector('.iris'), b = this.hub.el.querySelector('.banner');
    iris.classList.remove('run'); b.classList.remove('run'); void iris.offsetWidth;
    iris.classList.add('run');
    setTimeout(() => { fn(); if (label) { b.textContent = label; b.classList.add('run'); } }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320);
  }

  enterMode(m) {
    this.sfx('enter');
    this.transition(this.modeName(m), () => { this.state.mode = m; this.state.sub = 0; this.renderHub(false); if (m === 'ut') this.utEnter(); });
  }

  hubBack() {
    if (this.state.mode === 'main') return;
    const from = this.state.mode;
    this.transition('', () => { this.state.mode = 'main'; this.state.tab = MAIN.indexOf(from); this.renderHub(false); });
  }

  hubAct(a, b) {
    if (a.startsWith('ut-') && this.utAct(a, b)) return;
    const go = (kind) => { this.setup.kind = kind; this.showSetup(); };
    switch (a) {
      case 'playNow': this.launch({ ...this.setup, kind: 'cpu' }); break;
      case 'friend': go('friend'); break;
      case 'watch': this.launch({ ...this.setup, kind: 'watch' }); break;
      case 'news': this.setTab(MAIN.indexOf('ut')); break;
      case 'q-cpu': go('cpu'); break;
      case 'q-friend': go('friend'); break;
      case 'q-coop': go('coop'); break;
      case 'q-watch': go('watch'); break;
      case 'enter-cups': this.enterMode('cups'); break;
      case 'enter-ut': this.enterMode('ut'); break;
      case 'o-lang': this.showLanguage(null); break;
      case 'o-controls': this.showControls(); break;
      case 'o-profile': this.showProfiles(); break;
      case 'o-viewer': this.nav.clear(); this.hub = null; this.onViewer(); break;
      case 'o-delete': this.confirmDelete(); break;
      case 'cup': this.showCupDetail(b.dataset.cup); break;
      case 'private': this.showTournamentSetup(null); break;
      case 'friendsCup': this.setTab(0); break;
      case 'continueCup': this.showBracket(save.run(save.active().id)); break;
    }
  }

  confirmDelete() {
    const p = save.active();
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(32em,100%)">
      <h1 class="title">${t('profiles.delete')}</h1><p class="sub">${t('profiles.deleteAsk', { name: esc(p.name) })}</p>
      <div class="row-btns"><button class="btn" data-nav data-act="no" data-autofocus>${t('profiles.deleteNo')}</button><button class="btn" data-nav data-act="yes" style="background:var(--cherry);color:#fff">${t('profiles.deleteYes')}</button></div></div></div>`, {
      act: (a) => {
        if (a === 'no') { this.nav.pop(l); return; }
        save.remove(p.id); this.nav.clear(); this.hub = null; this.state = { mode: 'main', tab: 0, sub: 0 }; this.showProfiles();
      },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  }

  controlsHtml() {
    const pad = readPads().length > 0;
    return `${pad ? `<div class="keys">${t('keys.pad')}</div>` : ''}<div class="keys">${t('keys.kb')}</div><p class="sub">${t('keys.perfect')}</p><p class="sub">${t('keys.menu')}</p>`;
  }

  showControls() {
    const l = this.layer('dim', `<div class="center"><div class="panel"><h1 class="title">${t('controls.title')}</h1>${this.controlsHtml()}
      <div class="row-btns"><button class="btn" data-nav data-act="close">${t('foot.back')}</button></div></div></div>`, {
      act: () => this.nav.pop(l), onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  }

  // ------------------------------------------------------------- quick play set-up

  showSetup() {
    const s = this.setup, sides = this.sides();
    const rows = () => {
      const vsCpu = s.kind !== 'friend';
      const lbl = { cpu: ['setup.yourTeam', 'setup.opponent'], coop: ['setup.yourTeam', 'setup.opponent'], friend: ['setup.teamP1', 'setup.teamP2'], watch: ['setup.side1', 'setup.side2'] }[s.kind];
      return [
        ['team0', t(lbl[0]), lineupLabel(sides[0]), true],
        ['edit0', t('setup.lineup'), t('setup.lineupEdit'), true, true],
        ['team1', t(lbl[1]), lineupLabel(sides[1]), true],
        ['edit1', t('setup.lineup'), t('setup.lineupEdit'), true, true],
        ['stadium', t('setup.stadium'), t('setup.stadiumMain'), false],
        ['time', t('setup.time'), t('setup.minutes', { n: s.seconds / 60 }), true],
        ...(vsCpu ? [['cpu', t('setup.cpu'), [t('setup.easy'), t('setup.normal'), t('setup.hard')][s.cpuLevel], s.kind !== 'watch']] : []),
      ].map(([k, lbl, val, can, btn]) => btn
        ? `<button class="opt-row" data-nav data-opt="${k}"><span class="lbl">${lbl}</span><span class="val">${val} <span class="btnA" style="margin-left:.4em">A</span></span></button>`
        : `<button class="opt-row${can ? '' : ' fixed'}" data-nav data-opt="${k}"><span class="lbl">${lbl}</span><span class="val"><span class="arrow">◀</span>${val}<span class="arrow">▶</span></span></button>`).join('');
    };
    const title = { cpu: t('quick.vsCpu'), friend: t('quick.vsFriend'), coop: t('quick.coop'), watch: t('quick.watch') }[s.kind];
    const l = this.layer('dim', `<div class="center"><div class="panel">
      <h1 class="title">${title}</h1><p class="sub">${t('setup.title')}</p><div class="grid" id="rows" style="gap:.4em">${rows()}</div>
      <div class="row-btns"><button class="btn primary" data-nav data-act="go">${t('setup.go')}</button><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div>
      <div class="footer" style="color:var(--ink);-webkit-text-stroke:0"><span><span class="btnLR">◀</span><span class="btnLR">▶</span>${t('foot.change')}</span><span><span class="btnB">B</span>${t('foot.back')}</span></div></div></div>`, {
      onMove: (dx, dy, cur) => {
        if (!dx || !cur || !cur.dataset.opt || cur.dataset.opt.startsWith('edit')) return false;
        change(cur.dataset.opt, dx); return true;
      },
      act: (a) => { if (a === 'go') this.afterSetup(l); if (a === 'back') this.nav.pop(l); },
      onBack: () => this.nav.pop(l),
    });
    const repaint = (k) => {
      l.el.querySelector('#rows').innerHTML = rows();
      this.nav.focus(l.el.querySelector(`[data-opt="${k}"]`), false);
    };
    const change = (k, d) => {
      if (k.startsWith('edit')) {
        const i = +k.slice(4);
        this.showLineup(sides[i], (lu) => { sides[i] = lu; repaint(k); });
        return;
      }
      if (k.startsWith('team')) { const i = +k.slice(4); sides[i] = this.cyclePreset(sides[i], d); }
      else if (k === 'time') { const o = [120, 180, 300]; s.seconds = o[(o.indexOf(s.seconds) + d + 3) % 3]; }
      else if (k === 'cpu' && s.kind !== 'watch') s.cpuLevel = (s.cpuLevel + d + 3) % 3;
      else return;
      this.sfx('tab');
      repaint(k);
    };
    l.el.querySelector('#rows').addEventListener('click', (e) => { const r = e.target.closest('[data-opt]'); if (r) change(r.dataset.opt, 1); });
    this.nav.push(l);
  }

  afterSetup(setupLayer) {
    const s = this.setup;
    if (s.kind === 'friend' || s.kind === 'coop') this.showJoin(2, setupLayer, (devs) => this.launch({ ...this.setup, bindings: devs.map((d, i) => d === 'kb' ? { device: 'kb', ctrl: i } : { device: 'pad', index: +d.slice(3), ctrl: i }) }));
    else { this.nav.pop(setupLayer); this.launch({ ...s }); }
  }

  // Couch-style join: each device presses A / Enter to take the next free slot; done(devices) when all are in.
  showJoin(n, hideLayer, done) {
    const slots = new Array(n).fill(null);
    const devName = (d) => d === 'kb' ? t('join.keyboard') : t('join.pad', { n: +d.slice(3) + 1 });
    const paint = () => {
      l.el.querySelector('.slots').innerHTML = slots.map((d, i) => `<div class="slot${d ? ' on' : ''}"><b>${t('join.slot', { n: i + 1 })}</b>
        <span class="dev">${d ? devName(d) : t('join.empty')}</span></div>`).join('');
      const free = slots.indexOf(null);
      l.el.querySelector('#jw').textContent = free < 0 ? t('join.start') : t('join.waiting', { n: free + 1 });
    };
    const l = this.layer('dim', `<div class="center"><div class="panel">
      <h1 class="title">${t('join.title')}</h1><p class="sub">${t('join.hint')}</p><div class="slots"></div><p class="sub" id="jw" style="font-weight:800"></p>
      <div class="row-btns"><button class="btn" data-nav data-act="kb">${t('join.useKb')}</button><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      onRaw: (dev, what) => {
        if (what === 'confirm') {
          if (slots.includes(dev)) return true;
          const free = slots.indexOf(null);
          if (free < 0) return true;
          slots[free] = dev; this.sfx('ok'); paint();
          if (!slots.includes(null)) setTimeout(() => go(), 450);
          return true;
        }
        if (what === 'back') {
          const i = slots.indexOf(dev);
          if (i >= 0) { slots[i] = null; this.sfx('back'); paint(); return true; }
          return false;
        }
        return false;
      },
      act: (a) => { if (a === 'kb') l.onRaw('kb', 'confirm'); if (a === 'back') close(); },
      onBack: () => close(),
    });
    const close = () => { hideLayer.el.style.visibility = ''; this.nav.pop(l); };
    hideLayer.el.style.visibility = 'hidden';
    let started = false;
    const go = () => {
      if (started || !l.el.isConnected) return;
      started = true;
      hideLayer.el.style.visibility = '';
      this.nav.pop(l);
      done([...slots]);
    };
    this.nav.push(l);
    paint();
  }

  launch(opts) {
    const humans = opts.kind === 'watch' ? [] : opts.kind === 'friend' ? [0, 1] : opts.kind === 'coop' ? [0, 0] : [0];
    const bindings = opts.bindings || (humans.length ? [{ device: 'any', ctrl: 0 }] : []);
    const lineups = sidesColors(...this.sides()).map((x) => ({ name: x.name, color: x.color, slots: [...x.slots], captain: x.captain }));
    this.lastLaunch = { ...opts, humans, bindings, lineups };
    this.nav.clear(); this.hub = null;
    this.onStart(this.lastLaunch);
  }

  // ------------------------------------------------------------- in match

  showPause({ onResume, onRestart, onQuit, objectives = [] }) {
    const obj = objectives.map((o) => `<div class="grid" style="gap:.3em"><h3 style="font-family:var(--fd);font-weight:400;font-size:1.3em;margin:0">${t('cup.objectives')}${objectives.length > 1 ? ` · ${t('hud.p', { n: o.n })}` : ''}</h3>
      ${o.items.map((it) => `<div class="obj ${it.status}">${it.status === 'done' ? '★' : it.status === 'failed' ? '✗' : '☆'} ${it.text}</div>`).join('')}</div>`).join('');
    const l = this.layer('dim', `<div class="center"><div class="panel">
      <h1 class="title">${t('pause.title')}</h1>${obj}${obj ? `<details><summary style="cursor:pointer;font-weight:800">${t('controls.title')}</summary>${this.controlsHtml()}</details>` : this.controlsHtml()}
      <div class="row-btns"><button class="btn primary" data-nav data-act="resume" data-autofocus>${t('pause.resume')}</button><button class="btn" data-nav data-act="restart">${t('pause.restart')}</button><button class="btn" data-nav data-act="quit">${t('pause.quit')}</button></div></div></div>`, {
      act: (a) => { this.nav.pop(l); ({ resume: onResume, restart: onRestart, quit: onQuit })[a](); },
      onBack: () => { this.nav.pop(l); onResume(); },
    });
    this.nav.push(l);
    return l;
  }

  showEnd({ score, teams, stats, humanTeam, kind, onAgain, onMenu }) {
    const res = kind === 'watch' || kind === 'friend' ? (kind === 'friend' ? (score[0] === score[1] ? t('end.draw') : `${esc(teams[score[0] > score[1] ? 0 : 1].name)}!`) : t('end.over'))
      : score[humanTeam] > score[1 - humanTeam] ? t('end.win') : score[humanTeam] < score[1 - humanTeam] ? t('end.loss') : t('end.draw');
    const row = (k, a) => `<tr><td>${t(k)}</td><td>${a[0]}</td><td>${a[1]}</td></tr>`;
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(34em,100%)">
      <h1 class="title">${res} ${score[0]} – ${score[1]}</h1>
      <table class="stats"><tr><td></td><td style="color:${teams[0].color};font-weight:800">${esc(teams[0].name)}</td><td style="color:${teams[1].color};font-weight:800">${esc(teams[1].name)}</td></tr>
      ${row('end.shots', stats.shots)}${row('end.saves', stats.saves)}${row('end.passes', stats.passes)}${row('end.tackles', stats.tackles)}</table>
      <div class="row-btns"><button class="btn primary" data-nav data-act="again" data-autofocus>${t('end.again')}</button><button class="btn" data-nav data-act="menu">${t('end.menu')}</button></div></div></div>`, {
      act: (a) => { this.nav.pop(l); (a === 'again' ? onAgain : onMenu)(); },
      onBack: () => { this.nav.pop(l); onMenu(); },
    });
    this.nav.push(l);
  }
}

installCups(Menu);
installUt(Menu);
installSquads(Menu);
