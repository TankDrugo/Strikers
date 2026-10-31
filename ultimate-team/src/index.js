// Ultimate Team screens. The game (game/src/main.js) passes a context with what this module needs,
// so nothing here imports three.js or game files directly:
//   ctx = { THREE, renderer, template, Player, makeStage(), walkoutData, screen(html), startMatch(opts),
//           setView(view|null), showMenu() }
import * as UT from './core.js';
import { openStorage } from './storage.js';
import { Walkout } from './walkout.js';
import { CSS } from './ui.css.js';

const STAT_LABELS = { vel: 'VEL', tir: 'TIR', pas: 'PAS', dri: 'DRI', dif: 'DIF', fis: 'FIS', tuf: 'TUF', rif: 'RIF', pre: 'PRE', pos: 'POS', rin: 'RIN' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shortName = (c) => c.name.split(' ')[0];

export class UltimateTeam {
  constructor(ctx) {
    this.ctx = ctx;
    this.store = null;
    this.portraits = {};
    if (!document.getElementById('ut-css')) {
      const st = document.createElement('style'); st.id = 'ut-css'; st.textContent = CSS; document.head.appendChild(st);
    }
  }

  get save() { return this.store.save; }

  async open() {
    if (!this.store) {
      const s = this.ctx.screen('<h1>Ultimate Team</h1><p>Carico la tua collezione…</p>');
      try { this.store = await openStorage(); } finally { s.remove(); }
    }
    this.hub();
  }

  // ---------------------------------------------------------------- helpers

  portrait(charId) {
    if (this.portraits[charId]) return this.portraits[charId];
    const { THREE, renderer, template, Player } = this.ctx;
    const tpl = template.byId[charId];
    if (!tpl) return '';
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2.4));
    const d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(1, 2, 3); scene.add(d);
    const p = new Player({ scene, teams: [{ color: '#fff' }] }, tpl, 0, 'fielder', 0);
    p.ring.visible = false; p.shadow.visible = false;
    p.play('idle', { loop: true, fade: 0 });
    p.mixer.update(0.3);
    p.root.rotation.y = 0.35;
    const h = p.cfg.height;
    const cam = new THREE.PerspectiveCamera(24, 82 / 92, 0.05, 20);
    cam.position.set(0, h * 0.82, h * 1.55); cam.lookAt(0, h * 0.66, 0);
    const W = 164, H = 184;
    const rt = new THREE.WebGLRenderTarget(W, H, { colorSpace: THREE.SRGBColorSpace });
    const prev = renderer.getRenderTarget(), prevColor = renderer.getClearColor(new THREE.Color()), prevAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, cam);
    const px = new Uint8Array(W * H * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, W, H, px);
    renderer.setRenderTarget(prev);
    renderer.setClearColor(prevColor, prevAlpha);
    rt.dispose();
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), img = g.createImageData(W, H);
    for (let y = 0; y < H; y++) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
    g.putImageData(img, 0, 0);
    return (this.portraits[charId] = c.toDataURL());
  }

  cardHtml(c, { count = 0, off = false, big = false, reveal = false } = {}) {
    const stats = Object.entries(c.stats).map(([k, v]) => `<span><b>${v}</b>${STAT_LABELS[k]}</span>`).join('');
    return `<div class="utc ${c.rarity}${off ? ' off' : ''}${big ? ' big' : ''}${reveal ? ' reveal' : ''}">
      <span class="ovr">${c.ovr}</span><span class="pos">${c.role}</span><span class="rar">${UT.rarityOf(c.rarity).name}</span>
      ${off ? '' : `<img class="face" alt="" src="${this.portrait(c.char)}">`}
      <span class="nm">${esc(shortName(c))}</span><div class="st">${stats}</div><span class="tm">${esc(c.team)}</span>
      ${count > 1 ? `<span class="cnt">×${count}</span>` : ''}</div>`;
  }

  header(title) {
    const s = this.save;
    const mode = this.store.mode === 'online' ? 'Salvataggio online' : 'Salvataggio nel browser';
    return `<header><h1>${title}</h1><span class="pill">Crediti <b>${s.credits.toLocaleString('it-IT')}</b></span>
      <span class="pill">Squadra <b>${UT.squadRating(s.squad) || '–'}</b></span><span class="pill" title="${mode}">${this.store.mode === 'online' ? '☁' : '💾'} ${mode}</span></header>
      ${this.store.error ? `<p class="warn">${esc(this.store.error)}</p>` : ''}`;
  }

  view(html, wire) {
    const s = this.ctx.screen(html);
    s.querySelector('.card').classList.add('ut');
    wire(s, (sel, fn) => { const el = s.querySelector(sel); if (el) el.onclick = () => fn(el); });
    const first = s.querySelector('button:not([disabled])');
    if (first) first.focus();
    return s;
  }

  persist() { return this.store.write(); }

  // ---------------------------------------------------------------- screens

  hub() {
    const s = this.save;
    const ready = UT.squadComplete(s);
    const r = s.record;
    this.view(`${this.header('Ultimate Team')}
      ${!s.starter ? '<p>Benvenuto! Il pacchetto di benvenuto è gratis: dentro c\'è una squadra completa di carte bronzo.</p>' : ''}
      <div class="row">
        ${!s.starter ? '<button id="starter">Apri il pacchetto di benvenuto</button>' : `<button id="play"${ready ? '' : ' disabled'}>Gioca una partita</button>`}
        <button class="alt" id="squad">Squadra</button><button class="alt" id="coll">Collezione</button><button class="alt" id="shop">Negozio</button>
        <button class="alt" id="back">Torna al menu</button></div>
      ${s.starter && !ready ? '<p class="note">La squadra è incompleta: vai in Squadra e riempi i 5 posti.</p>' : ''}
      <p class="note">Partite ${r.played} · vinte ${r.won} · pareggiate ${r.drawn} · perse ${r.lost} · gol ${r.goalsFor}–${r.goalsAgainst} · pacchetti aperti ${s.packsOpened}</p>`,
    (el, on) => {
      on('#starter', () => { el.remove(); const cards = UT.claimStarter(s); this.persist(); this.openPack({ name: 'Pacchetto di benvenuto' }, cards); });
      on('#play', () => { el.remove(); this.prematch(); });
      on('#squad', () => { el.remove(); this.squad(); });
      on('#coll', () => { el.remove(); this.collection(); });
      on('#shop', () => { el.remove(); this.shop(); });
      on('#back', () => { el.remove(); this.ctx.showMenu(); });
    });
  }

  squad() {
    const s = this.save;
    const slots = UT.SLOTS.map((slot, i) => {
      const c = s.squad[i] && UT.byId[s.squad[i]];
      return `<button class="slot s${i}" data-slot="${i}"><span class="lab">${slot.label}</span>${c ? this.cardHtml(c) : '<div class="empty">+</div>'}</button>`;
    });
    this.view(`${this.header('Squadra')}
      <div class="formation">${[3, 2, 1, 0, 4].map((i) => slots[i]).join('')}</div>
      <p class="note">Scegli un posto per cambiare la carta. Il portiere va solo in porta; lo stesso personaggio non può giocare due volte. Nessuna intesa: conta solo la forza delle carte.</p>
      <div class="row"><button class="alt" id="auto">Squadra migliore automatica</button><button id="back">Indietro</button></div>`,
    (el, on) => {
      el.querySelectorAll('[data-slot]').forEach((b) => { b.onclick = () => { el.remove(); this.pickFor(+b.dataset.slot); }; });
      on('#auto', () => { el.remove(); UT.autoFill(s); this.persist(); this.squad(); });
      on('#back', () => { el.remove(); this.hub(); });
    });
  }

  pickFor(slot) {
    const s = this.save;
    const ids = Object.keys(s.owned).filter((id) => UT.byId[id].gk === UT.SLOTS[slot].gk)
      .sort((a, b) => UT.byId[b].ovr - UT.byId[a].ovr);
    const items = ids.map((id) => {
      const ok = UT.canPlace(s, slot, id);
      return `<button class="cardbtn${s.squad[slot] === id ? ' sel' : ''}" data-id="${id}"${ok ? '' : ' disabled title="Già in squadra"'}>${this.cardHtml(UT.byId[id], { count: s.owned[id], off: !ok && s.squad[slot] !== id })}</button>`;
    }).join('');
    this.view(`${this.header('Scegli: ' + UT.SLOTS[slot].label)}
      <div class="grid">${items || '<p>Nessuna carta adatta: apri un pacchetto nel Negozio.</p>'}</div>
      <div class="row"><button class="alt" id="back">Indietro</button></div>`,
    (el, on) => {
      el.querySelectorAll('[data-id]').forEach((b) => { b.onclick = () => { if (UT.place(s, slot, b.dataset.id)) this.persist(); el.remove(); this.squad(); }; });
      on('#back', () => { el.remove(); this.squad(); });
    });
  }

  collection(filter = 'tutte') {
    const s = this.save;
    const owned = UT.CARDS.filter((c) => s.owned[c.id]).length;
    const list = UT.CARDS.filter((c) => filter === 'tutte' || c.rarity === filter)
      .sort((a, b) => b.ovr - a.ovr || a.name.localeCompare(b.name));
    const items = list.map((c) => s.owned[c.id]
      ? `<button class="cardbtn" data-id="${c.id}">${this.cardHtml(c, { count: s.owned[c.id] })}</button>`
      : `<div class="cardbtn" title="Non ancora trovata">${this.cardHtml(c, { off: true })}</div>`).join('');
    const filters = ['tutte', ...UT.RARITIES.map((r) => r.id)].map((f) => `<button class="${f === filter ? '' : 'alt'}" data-f="${f}">${f === 'tutte' ? 'Tutte' : UT.rarityOf(f).name}</button>`).join('');
    this.view(`${this.header(`Collezione · ${owned}/${UT.CARDS.length}`)}
      <div class="filters">${filters}</div><div class="grid">${items}</div>
      <div class="row"><button class="alt" id="back">Indietro</button></div>`,
    (el, on) => {
      el.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { el.remove(); this.collection(b.dataset.f); }; });
      el.querySelectorAll('button[data-id]').forEach((b) => { b.onclick = () => { el.remove(); this.cardDetail(b.dataset.id, filter); }; });
      on('#back', () => { el.remove(); this.hub(); });
    });
  }

  cardDetail(id, filter) {
    const s = this.save, c = UT.byId[id];
    const spare = UT.spare(s, id);
    const slot = UT.SLOTS.findIndex((sl) => sl.label === c.role);
    const inSquad = s.squad.includes(id);
    this.view(`${this.header(esc(c.name))}
      <div class="grid">${this.cardHtml(c, { big: true })}</div>
      <p class="note">${UT.rarityOf(c.rarity).name} · ${c.team} · copie: ${s.owned[id]}${inSquad ? ' · in squadra' : ''}. A 75 una statistica vale come nel gioco originale; sopra è più forte, sotto più debole.</p>
      <div class="row">
        ${!inSquad && UT.canPlace(s, slot, id) ? `<button id="put">Metti in squadra (${c.role})</button>` : ''}
        ${spare > 0 ? `<button class="alt" id="sell">Vendita rapida: +${UT.QUICK_SELL[c.rarity]} crediti</button>` : ''}
        <button class="alt" id="back">Indietro</button></div>`,
    (el, on) => {
      on('#put', () => { UT.place(s, slot, id); this.persist(); el.remove(); this.cardDetail(id, filter); });
      on('#sell', () => { UT.quickSell(s, id); this.persist(); el.remove(); if (s.owned[id]) this.cardDetail(id, filter); else this.collection(filter); });
      on('#back', () => { el.remove(); this.collection(filter); });
    });
  }

  shop() {
    const s = this.save;
    const odds = (p) => Object.entries(p.weights).map(([r, w]) => `${UT.rarityOf(r).name} ${Math.round(w * 100 / Object.values(p.weights).reduce((a, b) => a + b, 0))}%`).join(' · ');
    const packs = UT.PACKS.map((p) => `<button class="pack ${p.id}" data-p="${p.id}"${s.credits < p.price ? ' disabled' : ''}>
      <span>${p.name}</span><span>${p.price.toLocaleString('it-IT')} crediti · ${p.cards} carte</span>
      <small>${p.guarantee ? `Almeno una ${UT.rarityOf(p.guarantee).name.toLowerCase()}. ` : ''}${odds(p)}</small></button>`).join('');
    this.view(`${this.header('Negozio')}
      <div class="packs">${packs}</div>
      <p class="note">I crediti si guadagnano giocando: ${UT.REWARDS.win} per una vittoria, ${UT.REWARDS.draw} per un pareggio, ${UT.REWARDS.loss} per una sconfitta, più ${UT.REWARDS.perGoal} a gol e ${UT.REWARDS.cleanSheet} se non subisci gol. Le carte doppie si vendono dalla Collezione.</p>
      <div class="row"><button class="alt" id="back">Indietro</button></div>`,
    (el, on) => {
      el.querySelectorAll('[data-p]').forEach((b) => {
        b.onclick = () => {
          const cards = UT.buyPack(s, b.dataset.p);
          if (!cards) return;
          this.persist();
          el.remove();
          this.openPack(UT.PACKS.find((p) => p.id === b.dataset.p), cards);
        };
      });
      on('#back', () => { el.remove(); this.hub(); });
    });
  }

  // Best card first: gold and up get the walkout, then every card is shown.
  openPack(pack, cards) {
    const best = cards[0];
    if (UT.RARITY_RANK[best.rarity] >= UT.RARITY_RANK.oro && this.ctx.walkoutData) this.walkout(best, () => this.reveal(pack, cards));
    else this.reveal(pack, cards);
  }

  walkout(card, done) {
    const overlay = document.createElement('div');
    overlay.className = 'ut-walk';
    overlay.innerHTML = '<div class="hints"></div><button class="skip">Salta ▸</button>';
    document.body.appendChild(overlay);
    const hints = overlay.querySelector('.hints');
    const hint = (i) => {
      const parts = [[card.role, 'ruolo'], [card.team, 'squadra'], [UT.rarityOf(card.rarity).name, 'carta']];
      if (i < 3) hints.insertAdjacentHTML('beforeend', `<div class="hint">${esc(parts[i][0])}<small>${parts[i][1]}</small></div>`);
      else { hints.innerHTML = `<div class="hint">${card.ovr}<small>${esc(card.name)}</small></div>`; overlay.insertAdjacentHTML('afterbegin', '<div class="flash"></div>'); }
    };
    let w;
    const finish = () => { this.ctx.setView(null); w.dispose(); overlay.remove(); removeEventListener('keydown', key); done(); };
    w = new Walkout(this.ctx, card, { hint, onDone: finish });
    const key = (e) => { if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); w.skip(); } };
    addEventListener('keydown', key);
    overlay.querySelector('.skip').onclick = () => w.skip();
    this.ctx.setView(w);
  }

  reveal(pack, cards) {
    const s = this.save;
    const items = cards.map((c, i) => `<div style="animation-delay:${i * 0.18}s" class="reveal">${this.cardHtml(c, { count: s.owned[c.id] })}${s.owned[c.id] > 1 ? '<p class="note" style="text-align:center">doppia</p>' : '<p class="note" style="text-align:center">nuova!</p>'}</div>`).join('');
    this.view(`${this.header(esc(pack.name))}
      <div class="grid">${items}</div>
      <div class="row"><button id="ok">Continua</button><button class="alt" id="best">Metti in squadra i migliori</button><button class="alt" id="squad">Vai alla squadra</button></div>`,
    (el, on) => {
      on('#ok', () => { el.remove(); this.hub(); });
      on('#best', () => { UT.autoFill(s); this.persist(); el.remove(); this.squad(); });
      on('#squad', () => { el.remove(); this.squad(); });
    });
  }

  prematch() {
    const s = this.save;
    const opp = UT.opponent(s);
    const mine = s.squad.map((id) => UT.byId[id]);
    const rows = (list) => list.map((c) => `<div>${c.role} · ${esc(shortName(c))} <b>${c.ovr}</b></div>`).join('');
    this.view(`${this.header('Prossima partita')}
      <div class="vs"><div><div class="big" style="color:${this.ctx.template.teams[0].color}">${UT.squadRating(s.squad)}</div><b>La tua squadra</b>${rows(mine)}</div>
      <div class="big">VS</div>
      <div><div class="big" style="color:${opp.color}">${UT.squadRating(opp.squad)}</div><b>${esc(opp.name)}</b>${rows(opp.squad.map((id) => UT.byId[id]))}</div></div>
      <p class="note">3 minuti. Le statistiche delle carte cambiano velocità, tiro, passaggi, contrasti e parate. Se esci dalla partita non ricevi crediti.</p>
      <div class="row"><button id="go">Inizia</button><button class="alt" id="other">Altro avversario</button><button class="alt" id="back">Indietro</button></div>`,
    (el, on) => {
      on('#go', () => { el.remove(); this.play(opp); });
      on('#other', () => { el.remove(); this.prematch(); });
      on('#back', () => { el.remove(); this.hub(); });
    });
  }

  play(opp) {
    const s = this.save;
    const mine = { name: 'La mia squadra', color: this.ctx.template.teams[0].color };
    this.ctx.startMatch({
      lineups: [UT.lineup(s.squad), UT.lineup(opp.squad)],
      teams: [mine, { name: opp.name, color: opp.color }],
      onEnd: (score) => {
        const r = UT.applyMatch(s, score[0], score[1]);
        this.persist();
        this.view(`${this.header(`${r.result === 'win' ? 'Vittoria!' : r.result === 'draw' ? 'Pareggio' : 'Sconfitta'} ${score[0]} – ${score[1]}`)}
          <table>${r.parts.map(([k, v]) => `<tr><td>${k}</td><td><b>+${v}</b></td></tr>`).join('')}<tr><td>Totale crediti</td><td><b>+${r.total}</b></td></tr></table>
          <div class="row"><button id="shop">Negozio</button><button class="alt" id="hub">Ultimate Team</button></div>`,
        (el, on) => {
          on('#shop', () => { el.remove(); this.shop(); });
          on('#hub', () => { el.remove(); this.hub(); });
        });
      },
      onQuit: () => this.hub(),
    });
  }
}
