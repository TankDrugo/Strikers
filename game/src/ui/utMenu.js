// Ultimate Team screens (stage 4 of interfaccia-gioco/DESIGN.md), installed on Menu like the cups:
// Club (pack store, collection, daily objectives), Rosa (5 + bench), Mercato (simulated traders), Divisioni
// (10-match seasons), Album (a page per character). Pack opening is P1: clues, 3D walkout with an original
// celebration, then the card, sleeved in its case when numbered or 1/1. Rules: ultimate-team/DESIGN.md.
import { t, getLang } from './i18n.js';
import './i18n_ut.js';
import { save } from './save.js';
import { utCardHtml, caseHtml, bindTilt, installCardStyles, PACK_COLORS, BEAM } from './utCards.js';
import { ECO, CATALOG, CARD, RANK, RARITIES, SPECIAL, CHARACTERS, tradable, value } from '../ut/cards.js';
import * as C from '../ut/club.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cr = (n) => t('ut.cr', { n: Math.round(n).toLocaleString(getLang()) });
const pct = (p) => (p * 100 >= 1 ? `${+(p * 100).toFixed(1)}%` : `${+(p * 100).toPrecision(2)}%`).replace('.', getLang() === 'it' ? ',' : '.');
const wait = (ms) => new Promise((r) => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.min(ms, 60) : ms));
const charName = (c) => t('ut.char.' + c.char);

export function installUt(Menu) {
  const P = Menu.prototype;

  P.club = function () {
    const p = save.active();
    const club = C.clubOf(p);
    // test build (tools/build.mjs --prova): the club never runs short of credits, to try every pack
    if (window.__PROVA && club.started && club.credits < window.__PROVA.credits / 2) club.credits = window.__PROVA.credits;
    const sold = C.settleMarket(club);
    if (sold.length) { save.store(); this.utSold = (this.utSold || []).concat(sold); }
    return club;
  };
  P.utSave = function () { save.store(); };
  P.utCard = function (card, opts = {}) { installCardStyles(); return utCardHtml(card, { portrait: this.portrait ? this.portrait(card.char, card.gk) : null, ...opts }); };
  P.utCase = function (card, opts = {}) { return caseHtml(card, { portrait: this.portrait ? this.portrait(card.char, card.gk) : null, ...opts }); };
  P.utPick = function (card, inst, attrs = '', extra = '', cls = '') {
    return `<button class="cpick ${cls}" data-nav ${attrs}>${this.utCard(card, { serial: inst?.serial })}${extra}</button>`;
  };

  // first time in Ultimate Team: the club is created and the starter squad comes out of its pack
  P.utEnter = function () {
    installCardStyles();
    const club = this.club();
    if (club.started) return;
    const got = C.startClub(club);
    this.utSave();
    const cards = got.map((i) => ({ card: CARD[i.id], inst: i, isNew: true }));
    this.utRevealAll({ titleKey: 'ut.pack.starter' }, cards, `<p class="sub">${t('ut.welcomeText', { cr: cr(ECO.start.credits) })}</p>`);
  };

  // ---------------------------------------------------------------- hub views

  P.utView = function (id) {
    installCardStyles();
    const club = this.club();
    if (this.utSold?.length) { const s = this.utSold; this.utSold = []; setTimeout(() => this.toastLayer(s.map((l) => t('ut.mk.soldToast', { name: charName(CARD[l.id]), cr: cr(l.price * (1 - ECO.market.tax)) })).join('<br>')), 50); }
    return ({ club: () => this.utClubView(club), squad: () => this.utSquadView(club), market: () => this.utMarketView(club),
      divisions: () => this.utDivView(club), album: () => this.utAlbumView(club) })[id]();
  };

  P.utClubView = function (club) {
    const best = club.cards.map((i) => ({ i, c: CARD[i.id] })).sort((a, b) => RANK[b.c.rarity] - RANK[a.c.rarity] || b.c.ovr - a.c.ovr)[0];
    const found = Object.keys(club.album).length;
    const daily = C.daily(club).map((o) => `<div class="obj ${o.done ? 'done' : ''}">${o.done ? '★' : '☆'} ${t('ut.daily.' + o.id)} <small>(${o.have}/${o.n})</small></div>`).join('');
    const packs = Object.keys(ECO.packs).map((k) => `<span class="pk" style="--pk:${PACK_COLORS[k]};width:2.6em;display:inline-block;aspect-ratio:5/7.6;border:.15em solid var(--ink);border-radius:.35em;background:var(--pk);margin-right:.3em"></span>`).join('');
    return `<div class="view" style="grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:1fr 1fr">
      <button class="tile dark" data-nav data-act="ut-shop" style="grid-row:span 2"><h3>${t('ut.club.shop')}</h3><p>${t('ut.club.shopText')}</p>
        <div style="margin-top:auto">${packs}</div><span class="big" style="color:var(--sun)">${cr(club.credits)}</span></button>
      <button class="tile" data-nav data-act="ut-coll"><h3>${t('ut.club.collection')}</h3><p>${t('ut.club.collectionText', { n: club.cards.length, a: found, b: CATALOG.length })}</p>
        ${best ? `<div style="width:4.6em;margin-top:auto">${this.utCard(best.c, { serial: best.i.serial })}</div>` : ''}</button>
      <div class="tile" data-nav tabindex="-1" style="cursor:default"><h3>${t('ut.club.daily')}</h3><div class="grid" style="gap:.3em">${daily}</div><p class="hint">${t('ut.club.dailyText', { cr: cr(ECO.earnings.dailyObjectives.credits) })}</p></div>
      <div class="tile" data-nav tabindex="-1" style="cursor:default;grid-column:span 2"><h3>${t('ut.squad.rating')} <span class="big" style="font-size:1.4em">${C.squadRating(club)}</span></h3>
        <p>${t('ut.club.packs', { n: club.packsOpened })} · ${t('ut.div.name', { n: C.divName(club.division.div) })}</p>
        <p class="hint">${t('ut.club.pity', { n: ECO.pity.holoEveryPremiumPacks - club.pity })}</p></div>
    </div>`;
  };

  P.utSquadView = function (club) {
    const pos = [['DIF', '2 / 3'], ['CEN', '3 / 2'], ['ALA', '1 / 2'], ['ATT', '2 / 1'], ['POR', '2 / 4']]; // grid column / row
    const slots = C.SLOTS.map((role, i) => {
      const card = C.cardOf(club, club.squad[i]), inst = C.inst(club, club.squad[i]);
      const [col, row] = pos[i][1].split(' / ');
      return `<button class="slotc" data-nav data-act="ut-slot" data-slot="${i}" style="grid-column:${col};grid-row:${row}"><span class="lab">${t('ut.role.' + role)}${i === (club.captain ?? 3) ? ' ©' : ''}</span>
        ${card ? this.utCard(card, { serial: inst.serial }) : `<div class="empty">+</div>`}</button>`;
    }).join('');
    const bench = club.bench.map((u, b) => {
      const card = C.cardOf(club, u), inst = C.inst(club, u);
      return `<button class="slotc" data-nav data-act="ut-bench" data-b="${b}" style="width:5em">${card ? this.utCard(card, { serial: inst.serial }) : `<div class="empty" style="font-size:1.3em;border-color:var(--ink);color:var(--ink)">+</div>`}</button>`;
    }).join('');
    return `<div class="view" style="grid-template-columns:1.5fr 1fr;grid-template-rows:auto 1fr auto">
      <div class="pitch" style="grid-row:span 3;grid-template-rows:repeat(4,1fr);font-size:.62em;container-type:size">${slots}</div>
      <div class="tile" data-nav tabindex="-1" style="cursor:default;flex-direction:row;align-items:center;gap:1em"><span class="big">${C.squadRating(club)}</span><div><h3>${t('ut.squad.rating')}</h3><p style="font-size:.8em">${t('ut.squad.rule')}</p></div></div>
      <div class="tile" data-nav tabindex="-1" style="cursor:default"><h3>${t('ut.squad.bench')}</h3><p>${t('ut.squad.benchText')}</p><div style="display:flex;gap:.6em;margin-top:auto;font-size:.8em">${bench}</div></div>
      <div class="row-btns"><button class="btn" data-nav data-act="ut-captain" title="${t('ut.squad.captainHint')}">${t('ut.squad.captain', { name: (() => { const c = C.cardOf(club, club.squad[club.captain ?? 3]); return c ? charName(c) : '–'; })() })}</button><button class="btn" data-nav data-act="ut-auto">${t('ut.squad.auto')}</button><button class="btn primary" data-nav data-act="ut-tabdiv">${t('ut.squad.play')}</button></div>
    </div>`;
  };

  P.utMarketView = function (club) {
    const offers = C.offers(club, save.active().id);
    const log = club.market.log.slice(0, 4).map((l) => `<p>${charName(CARD[l.id])} · ${t('ut.r.' + CARD[l.id].rarity)} · <b>+${cr(l.got)}</b></p>`).join('') || `<p>${t('ut.mk.noLog')}</p>`;
    const watched = offers.filter((o) => club.market.watch.includes(o.card.id) && !o.sold).length;
    return `<div class="view" style="grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:1fr 1fr">
      <button class="tile dark" data-nav data-act="ut-mk-buy" style="grid-row:span 2"><h3>${t('ut.mk.buy')}</h3><p>${t('ut.mk.buyText')}</p>
        <div style="display:flex;gap:.5em;margin-top:auto">${offers.filter((o) => !o.sold).slice(0, 3).map((o) => `<div style="width:4.4em">${this.utCard(o.card)}</div>`).join('')}</div></button>
      <button class="tile" data-nav data-act="ut-mk-sell"><h3>${t('ut.mk.sell')}</h3><p>${t('ut.mk.sellText')}</p></button>
      <button class="tile" data-nav data-act="ut-mk-mine"><h3>${t('ut.mk.mine')}</h3><p>${t('ut.mk.mineText', { n: club.market.listings.length })}</p></button>
      <button class="tile" data-nav data-act="ut-mk-watch"><h3>${t('ut.mk.watch')}</h3><p>${t('ut.mk.watchText', { n: club.market.watch.length })}${watched ? ` · <b>${watched}</b>` : ''}</p></button>
      <div class="tile" data-nav tabindex="-1" style="cursor:default"><h3>${t('ut.mk.log')}</h3>${log}</div>
    </div>`;
  };

  P.utDivView = function (club) {
    const d = club.division, opp = C.opponent(club, save.active().id);
    const ladder = [...Array(C.DIVISIONS).keys()].map((i) => `<i class="${i === d.div ? 'on' : i < d.div ? 'done' : ''}" style="height:${1 + i * 0.35}em"></i>`).join('');
    const dots = [...Array(ECO.earnings.seasonMatches).keys()].map((i) => `<i class="${i < d.played ? 'done' : ''}" style="height:.8em"></i>`).join('');
    return `<div class="view" style="grid-template-columns:1.3fr 1fr;grid-template-rows:1fr 1fr">
      <div class="tile dark" data-nav tabindex="-1" style="cursor:default;grid-row:span 2"><h3>${t('ut.div.name', { n: C.divName(d.div) })}</h3>
        <p>${t('ut.div.season', { n: d.played + 1 })} · ${t('ut.div.points', { n: d.pts })} · ${t('ut.div.record', d)}</p>
        <div class="ladder" style="height:5em;margin-top:.5em">${ladder}</div><div class="ladder">${dots}</div>
        <p>${t('ut.div.rules', { cr: cr(ECO.earnings.seasonReward[d.div]) })}</p><p class="hint">${t('ut.div.best', { n: C.divName(d.best) })}</p></div>
      <div class="tile" data-nav tabindex="-1" style="cursor:default;--ac:${opp.color}"><h3>${t('ut.div.next')}</h3><p style="font-size:1.3em;font-weight:800;color:${opp.color};-webkit-text-stroke:.03em var(--ink)">${esc(opp.name)}</p>
        <span class="big">${opp.rating}</span></div>
      <button class="tile" data-nav data-act="ut-div-play" style="background:var(--leaf);color:#fff"><h3>${t('ut.div.play')}</h3><p>${t('ut.squad.rating')} ${C.squadRating(club)} ${t('ut.div.vs')} ${opp.rating}</p></button>
    </div>`;
  };

  P.utAlbumView = function (club) {
    const pages = CHARACTERS.map((ch) => {
      const pg = C.albumPage(club, ch), base = pg.all[0];
      const fn = pg.all.filter((c) => !SPECIAL.includes(c.rarity) && club.album[c.id]).length;
      return `<button class="tile" data-nav data-act="ut-page" data-char="${ch}" style="padding:.6em"><div style="display:flex;gap:.6em;align-items:center">
        <div style="width:3.4em;flex:none">${this.utCard(base)}</div><div style="min-width:0"><h3 style="font-size:1.05em">${t('ut.char.' + ch)}</h3>
        <p style="font-size:.8em">${t('ut.album.page', { a: fn, b: pg.need })}</p><div class="bar-mini"><i style="width:${fn / pg.need * 100}%"></i></div>
        <p style="font-size:.75em">${club.albumPaid[ch] ? '★ ' + t('ut.album.paid') : pg.need > 1 ? t('ut.album.reward', { cr: cr(ECO.album.page) }) : ''}</p></div></div></button>`;
    }).join('');
    return `<div class="view" style="grid-template-columns:repeat(5,1fr);grid-template-rows:1fr 1fr">${pages}</div>`;
  };

  // hub buttons of Ultimate Team (called from Menu.hubAct)
  P.utAct = function (a, b) {
    const club = this.club();
    switch (a) {
      case 'ut-shop': return this.utShop(), true;
      case 'ut-coll': return this.utCollection(), true;
      case 'ut-slot': return this.utPickSlot(+b.dataset.slot), true;
      case 'ut-bench': return this.utPickBench(+b.dataset.b), true;
      case 'ut-auto': C.autoSquad(club); this.utSave(); this.renderHub(false); return true;
      case 'ut-captain': C.cycleCaptain(club); this.utSave(); this.renderHub(false); this.nav.focus(this.hub.el.querySelector('[data-act="ut-captain"]'), false); return true;
      case 'ut-tabdiv': return this.setTab(3), true; // the Divisions tab (Club, Rosa, Mercato, Divisioni, Album)
      case 'ut-mk-buy': return this.utOffers(false), true;
      case 'ut-mk-watch': return this.utOffers(true), true;
      case 'ut-mk-sell': return this.utSellPick(), true;
      case 'ut-mk-mine': return this.utListings(), true;
      case 'ut-div-play': return this.utPrematch(), true;
      case 'ut-page': return this.utAlbumPage(b.dataset.char), true;
    }
    return false;
  };

  // ---------------------------------------------------------------- collection and card detail

  P.utCollection = function (filter = 'all') {
    const club = this.club();
    const order = ['all', ...RARITIES];
    const list = club.cards.map((i) => ({ i, c: CARD[i.id] })).filter((x) => filter === 'all' || x.c.rarity === filter)
      .sort((a, b) => RANK[b.c.rarity] - RANK[a.c.rarity] || b.c.ovr - a.c.ovr);
    const tabs = order.map((f) => `<span class="tab${f === filter ? ' on' : ''}" style="font-size:.85em">${f === 'all' ? t('ut.coll.all') : t('ut.r.' + f)}</span>`).join('');
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(64em,100%);height:100%">
      <h1 class="title">${t('ut.coll.title')}</h1><div class="tabs" style="flex-wrap:wrap;align-self:flex-start"><button class="shoulder">LB</button>${tabs}<button class="shoulder">RB</button></div>
      <div class="cgrid">${list.map((x) => this.utPick(x.c, x.i, `data-act="card" data-uid="${x.i.uid}"`, `<small>${t('ut.card.where.' + C.where(club, x.i.uid))}</small>`)).join('') || `<p>${t('ut.coll.empty')}</p>`}</div>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a, el) => { if (a === 'back') return this.nav.pop(l); if (a === 'card') this.utCardDetail(+el.dataset.uid, () => { this.nav.pop(l); this.utCollection(filter); }); },
      onTab: (d) => { this.nav.pop(l); this.utCollection(order[(order.indexOf(filter) + d + order.length) % order.length]); },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };

  P.utCardDetail = function (uid, refresh) {
    const club = this.club(), inst = C.inst(club, uid), card = CARD[inst.id], at = C.where(club, uid);
    const listed = club.market.listings.some((x) => x.uid === uid);
    const slot = C.SLOTS.indexOf(card.role);
    const statRows = Object.entries(card.stats).map(([k, v]) => `<b>${t('ut.statLong.' + k)}</b><span>${v}</span>`).join('');
    const bonus = card.ovr - card.baseOvr;
    const acts = [];
    if (at !== 'squad' && !listed && C.canPlace(club, slot, uid)) acts.push(['toSquad', t('ut.card.toSquad', { slot: t('ut.role.' + card.role) })]);
    if (at === 'club' && !listed && club.bench.includes(null)) acts.push(['toBench', t('ut.card.toBench')]);
    if (at === 'bench') acts.push(['fromBench', t('ut.card.fromBench')]);
    if (at !== 'squad' && !listed && tradable(card.rarity)) acts.push(['sell', t('ut.card.sell')]);
    if (at !== 'squad' && !listed && C.quickSellValue(card)) acts.push(['quick', t('ut.card.quick', { cr: cr(C.quickSellValue(card)) })]);
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(50em,100%);flex-direction:row;gap:1.6em;align-items:center">
      <div style="width:min(16em,38%);flex:none">${this.utCase(card, { serial: inst.serial, idle: true })}</div>
      <div class="grid" style="gap:.6em;min-width:0"><h1 class="title" style="font-size:1.9em">${charName(card)}</h1>
        <p class="sub"><b>${t('ut.r.' + card.rarity)}</b>${inst.serial && card.rarity === 'numbered' ? ` · ${t('ut.numberedOf', { n: String(inst.serial).padStart(2, '0') })}` : ''} · ${t('ut.roleLong.' + card.role)} · ${listed ? t('ut.card.listed') : t('ut.card.where.' + at)}</p>
        <div class="keys" style="grid-template-columns:auto auto auto auto">${statRows}</div>
        <p class="sub" style="font-size:.85em">${t('ut.card.statHint')}${bonus ? ' ' + t('ut.card.bonus', { n: bonus }) + '.' : ''}</p>
        <p class="sub" style="font-size:.85em">${tradable(card.rarity) ? t('ut.card.value', { cr: cr(value(card, C.today())) }) : SPECIAL.includes(card.rarity) ? t('ut.card.noTrade') : ''}</p>
        <div class="row-btns">${acts.map(([a, txt], i) => `<button class="btn${i ? '' : ' primary'}" data-nav data-act="${a}">${txt}</button>`).join('')}<button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div></div>`, {
      act: (a) => {
        if (a === 'back') return this.nav.pop(l);
        if (a === 'sell') { this.nav.pop(l); return this.utSellPrice(uid, refresh); }
        if (a === 'toSquad') C.place(club, slot, uid);
        if (a === 'toBench') C.toBench(club, uid);
        if (a === 'fromBench') C.fromBench(club, uid);
        if (a === 'quick') C.quickSell(club, uid);
        this.utSave(); this.nav.pop(l); refresh && refresh();
      },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
    bindTilt(l.el);
  };

  // ---------------------------------------------------------------- squad pickers

  P.utPickSlot = function (slot) {
    const club = this.club(), gk = slot === 4;
    const list = club.cards.map((i) => ({ i, c: CARD[i.id] })).filter((x) => x.c.gk === gk && !club.market.listings.some((m) => m.uid === x.i.uid))
      .sort((a, b) => b.c.ovr - a.c.ovr);
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(60em,100%);height:100%">
      <h1 class="title">${t('ut.squad.pick', { slot: t('ut.roleLong.' + C.SLOTS[slot]) })}</h1><p class="sub">${t('ut.squad.rule')}</p>
      <div class="cgrid">${list.map((x) => {
        const ok = C.canPlace(club, slot, x.i.uid), cur = club.squad[slot] === x.i.uid;
        return this.utPick(x.c, x.i, `data-act="${ok && !cur ? 'pick' : 'none'}" data-uid="${x.i.uid}"`, `<small>${cur ? '✓ ' : ''}${t('ut.card.where.' + C.where(club, x.i.uid))}</small>`, ok || cur ? '' : 'off');
      }).join('') || `<p>${t('ut.squad.none')}</p>`}</div>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a, el) => {
        if (a === 'back') return this.nav.pop(l);
        if (a !== 'pick') return;
        C.place(club, slot, +el.dataset.uid); this.utSave(); this.nav.pop(l); this.renderHub(false);
      },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };

  P.utPickBench = function (b) {
    const club = this.club(), cur = club.bench[b];
    if (cur) return this.utCardDetail(cur, () => this.renderHub(false));
    const list = club.cards.filter((i) => C.where(club, i.uid) === 'club' && !club.market.listings.some((m) => m.uid === i.uid))
      .map((i) => ({ i, c: CARD[i.id] })).sort((x, y) => y.c.ovr - x.c.ovr);
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(60em,100%);height:100%">
      <h1 class="title">${t('ut.squad.bench')}</h1><div class="cgrid">${list.map((x) => this.utPick(x.c, x.i, `data-act="pick" data-uid="${x.i.uid}"`)).join('') || `<p>${t('ut.squad.none')}</p>`}</div>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a, el) => { if (a === 'back') return this.nav.pop(l); club.bench[b] = +el.dataset.uid; this.utSave(); this.nav.pop(l); this.renderHub(false); },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };

  // ---------------------------------------------------------------- pack store and P1 opening

  P.utShop = function () {
    const club = this.club();
    const tiles = C.PACKS.map((pk) => {
      const odds = Object.entries(pk.odds).map(([r, p]) => `${t('ut.r.' + r)} ${pct(p)}`).join(' · ');
      const sp = pk.special ? `<br>${t('ut.shop.special', { a: pct(pk.special.numbered), b: pct(pk.special.oneOfOne) })}` : '';
      const can = club.credits >= pk.price;
      return `<button class="tile pk-tile${can ? '' : ' locked'}" data-nav data-act="buy" data-p="${pk.id}" style="padding:.7em"><h3 style="font-size:1.15em">${t('ut.pack.' + pk.id)}</h3>
        <div class="pk" style="--pk:${PACK_COLORS[pk.id]}"></div><b>${cr(pk.price)}</b><span style="font-size:.85em">${t('ut.shop.cards', { n: pk.cards })}${pk.guarantee ? ' · ' + t('ut.shop.guarantee', { r: t('ut.r.' + pk.guarantee).toLowerCase() }) : ''}</span>
        <span class="odds">${odds}${sp}</span>${can ? '' : `<span class="soon-tag">${t('ut.shop.short')}</span>`}</button>`;
    }).join('');
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(70em,100%)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1em"><h1 class="title">${t('ut.shop.title')}</h1><span class="big" style="font-family:var(--fd);font-size:1.8em">${cr(club.credits)}</span></div>
      <div class="grid" style="grid-template-columns:repeat(5,1fr)">${tiles}</div>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a, el) => {
        if (a === 'back') return this.nav.pop(l);
        const got = C.buyPack(club, el.dataset.p, save.registry());
        if (!got) { this.sfx('back'); return; }
        this.utSave();
        this.nav.pop(l);
        this.utOpen({ id: el.dataset.p, titleKey: 'ut.pack.' + el.dataset.p }, got);
      },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };

  // P1: the pack shakes and opens in a flash, rays in the colour of the best rarity; clues one at a time;
  // the character walks out in 3D and celebrates; the card arrives (in its case if numbered or 1/1); all cards.
  P.utOpen = function (pack, got) {
    const best = got[0].card, top = SPECIAL.includes(best.rarity), walk = RANK[best.rarity] >= RANK.goldRare;
    let skipped = false, phase = 'closed';
    const l = this.layer('', `<div class="theatre"><div class="beams"></div><div class="act"></div>
      <div class="hintline">${t('ut.open.hint')}</div><button class="btn skip" data-nav data-act="skip">${t('ut.open.skip')} ▸</button></div>`, {
      act: (a) => { if (a === 'skip' || a === 'stage') next(); },
      onRaw: (dev, what) => { if (what === 'confirm' || what === 'back') { next(); return true; } return false; },
      onBack: () => next(),
    });
    const th = l.el.querySelector('.theatre'), act = l.el.querySelector('.act'), beams = l.el.querySelector('.beams'), hint = l.el.querySelector('.hintline');
    act.innerHTML = `<div class="pack shake" style="--pk:${PACK_COLORS[pack.id] || PACK_COLORS.gold}">${t(pack.titleKey).replace(' ', '<br>')}</div>`;
    th.addEventListener('click', (e) => { if (!e.target.closest('button')) next(); });
    // the hub stays hidden under the theatre, so the 3D stage (drawn on the canvas below the menu) shows through
    const hubEl = this.hub?.el;
    if (hubEl) hubEl.style.visibility = 'hidden';
    const finish = () => { if (phase === 'done') return; phase = 'done'; this.walkout?.stop(); if (hubEl) hubEl.style.visibility = ''; this.nav.pop(l); this.utRevealAll(pack, got); };
    const next = () => {
      if (phase === 'closed') { phase = 'open'; run(); return; }
      skipped = true; this.walkout?.skip();
      if (phase === 'card') finish();
    };
    const clue = async (text, color = '#fff') => {
      if (skipped) return;
      const c = document.createElement('div'); c.className = 'clue'; c.textContent = text; c.style.color = color; act.appendChild(c); this.sfx('tab');
      await c.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(3)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.25 },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1.05)', offset: 0.8 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.8)' }], { duration: 1100, easing: 'ease-out', fill: 'forwards' }).finished;
      c.remove();
    };
    const confetti = (n) => {
      const cols = ['#ff3d6e', '#ffd21f', '#41c24a', '#2bc0ff', '#8a4dff', '#fff'];
      for (let i = 0; i < n; i++) {
        const c = document.createElement('div'); c.className = 'confetti'; c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % cols.length]; th.appendChild(c);
        c.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: `translateY(${60 + Math.random() * 50}cqh) rotate(${Math.random() * 720}deg)` }], { duration: 1600 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' });
      }
    };
    const run = async () => {
      hint.textContent = '';
      const pk = act.querySelector('.pack');
      this.sfx('enter'); await wait(skipped ? 0 : 700);
      beams.style.setProperty('--beam', BEAM[best.rarity]); beams.style.opacity = walk ? 0.55 : 0.25;
      await pk.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0, filter: 'brightness(4)' }], { duration: 450, fill: 'forwards' }).finished;
      pk.remove();
      if (!walk) return finish();
      const clues = best.rarity === 'goldRare' ? [String(best.ovr)] : [t('ut.role.' + best.role), t('ut.team.' + best.team), String(best.ovr)];
      if (best.rarity === 'numbered') clues.push(t('ut.numberedOf', { n: String(got[0].inst.serial).padStart(2, '0') }));
      if (best.rarity === 'oneOfOne') clues.push('1 / 1');
      for (const c of clues) await clue(c, c.includes('/') ? '#ffd21f' : '#fff');
      if (best.rarity !== 'goldRare' && !skipped) confetti(top ? 80 : 40);
      // the character walks out on the 3D stage and celebrates
      if (this.walkout && !skipped) {
        th.classList.add('see3d'); beams.style.opacity = 0;
        await this.walkout.start(best, BEAM[best.rarity]);
        this.walkout.stop();
        th.classList.remove('see3d'); beams.style.opacity = 0.55;
      }
      phase = 'card';
      skipped = false;
      const r = document.createElement('div'); r.className = 'reveal'; r.innerHTML = this.utCard(best, { serial: got[0].inst.serial, idle: true }); act.appendChild(r);
      r.animate([{ transform: 'translate(-50%,-50%) rotateY(180deg) scale(.2)' }, { transform: 'translate(-50%,-50%) rotateY(0) scale(1.15)', offset: 0.7 }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 900, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'forwards' });
      this.sfx('ok');
      if (top) { await wait(1300); if (!skipped) await this.utSleeve(r, best, got[0].inst, th, confetti); }
      l.el.querySelector('.skip').textContent = t('ut.open.ok') + ' ▸';
    };
    this.nav.push(l);
  };

  // the empty case slides in, the card goes in from the open top, the case clicks shut, the label is stamped on
  P.utSleeve = async function (r, card, inst, th, confetti) {
    r.classList.add('boxed');
    r.innerHTML = this.utCase(card, { serial: inst.serial, idle: true });
    const lo = r.firstElementChild, cb = lo.querySelector('.cardbox'), pl = lo.querySelector('.plate'), bars = lo.querySelector('.bars'), sh = lo.querySelector('.sheen');
    pl.style.opacity = 0; if (bars) bars.style.opacity = 0;
    cb.style.transform = 'translateY(-118%) rotate(-3deg)';
    await lo.animate([{ transform: 'translateY(45cqh) rotate(-10deg)', opacity: 0 }, { transform: 'translateY(-2cqh) rotate(1deg)', opacity: 1, offset: 0.75 }, { transform: 'none', opacity: 1 }], { duration: 550, easing: 'cubic-bezier(.3,1.3,.5,1)' }).finished;
    await wait(250);
    await cb.animate([{ transform: 'translateY(-118%) rotate(-3deg)' }, { transform: 'translateY(-60%) rotate(-1.5deg)', offset: 0.35 }, { transform: 'translateY(4%) rotate(.6deg)', offset: 0.82 },
      { transform: 'translateY(-1%) rotate(0)', offset: 0.92 }, { transform: 'none' }], { duration: 1100, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' }).finished;
    cb.style.transform = 'none';
    this.sfx('ok');
    lo.animate([{ transform: 'none' }, { transform: 'scale(1.05,.95)' }, { transform: 'scale(.98,1.02)' }, { transform: 'none' }], { duration: 300 });
    sh.animate([{ transform: 'translateX(-120%) skewX(-20deg)', opacity: 1 }, { transform: 'translateX(140%) skewX(-20deg)', opacity: 1 }], { duration: 650, easing: 'ease-out' });
    await wait(350);
    pl.style.opacity = 1; if (bars) bars.style.opacity = 0.6;
    pl.animate([{ transform: 'scale(2.2) rotate(-6deg)', opacity: 0 }, { transform: 'scale(.92) rotate(1deg)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'ease-out' });
    await wait(300);
    this.sfx('enter'); th.classList.add('screen-shake'); confetti(40);
  };

  // every card of the pack, best first, new ones tagged
  P.utRevealAll = function (pack, got, note = '') {
    const club = this.club();
    const rew = C.albumRewards(club);
    if (rew.length) this.utSave();
    const items = got.map((g, i) => `<div class="cpick" style="animation:ui-pop .45s ${i * 0.15}s both cubic-bezier(.3,1.6,.5,1)">
      <span class="tagnew${g.isNew ? '' : ' dup'}">${g.isNew ? t('ut.open.new') : t('ut.open.dup')}</span>${this.utCard(g.card, { serial: g.inst.serial })}<small>${t('ut.r.' + g.card.rarity)}</small></div>`).join('');
    const again = pack.id && ECO.packs[pack.id] && club.credits >= ECO.packs[pack.id].price;
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(60em,100%)">
      <h1 class="title">${t(pack.titleKey)}</h1>${note}<div class="packrow">${items}</div>${this.utRewardsHtml({ album: rew })}
      <div class="row-btns"><button class="btn primary" data-nav data-act="ok" data-autofocus>${t('ut.open.ok')}</button><button class="btn" data-nav data-act="squad">${t('ut.open.toSquad')}</button>
      ${again ? `<button class="btn" data-nav data-act="again">${t('ut.open.again')} · ${cr(ECO.packs[pack.id].price)}</button>` : ''}</div></div></div>`, {
      act: (a) => {
        this.nav.pop(l);
        if (a === 'squad') { this.state.mode = 'ut'; this.state.sub = 1; }
        if (a === 'again') { const g = C.buyPack(club, pack.id, save.registry()); if (g) { this.utSave(); return this.utOpen(pack, g); } }
        this.renderHub(false);
      },
      onBack: () => { this.nav.pop(l); this.renderHub(false); },
    });
    this.nav.push(l);
    bindTilt(l.el);
  };

  P.utRewardsHtml = function ({ album = [], daily = [] }) {
    const lines = [...daily.map((id) => t('ut.res.daily', { name: t('ut.daily.' + id), cr: cr(ECO.earnings.dailyObjectives.credits) })),
      ...album.map(([k, ch, n]) => (k === 'all' ? t('ut.res.albumAll', { cr: cr(n) }) : t('ut.res.album', { name: t('ut.char.' + ch), cr: cr(n) })))];
    return lines.length ? `<div class="grid" style="gap:.3em">${lines.map((x) => `<div class="obj done">★ ${x}</div>`).join('')}</div>` : '';
  };

  // ---------------------------------------------------------------- market

  P.utOffers = function (watchOnly) {
    const club = this.club(), pid = save.active().id;
    const list = C.offers(club, pid).filter((o) => !watchOnly || club.market.watch.includes(o.card.id));
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(64em,100%);height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:1em"><h1 class="title">${watchOnly ? t('ut.mk.watch') : t('ut.mk.offers')}</h1><span style="font-family:var(--fd);font-size:1.6em">${cr(club.credits)}</span></div>
      <div class="cgrid">${list.map((o) => this.utPick(o.card, null, `data-act="${o.sold ? 'none' : 'offer'}" data-i="${o.idx}"`,
        `<small>${o.sold ? t('ut.mk.sold') : cr(o.price)}${club.market.watch.includes(o.card.id) ? ' ★' : ''}</small>`, o.sold ? 'off' : '')).join('') || `<p>${t('ut.mk.watchEmpty')}</p>`}</div>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a, el) => {
        if (a === 'back') { this.nav.pop(l); return this.renderHub(false); }
        if (a !== 'offer') return;
        const o = list.find((x) => x.idx === +el.dataset.i);
        this.utConfirm(t('ut.mk.confirmBuy', { name: `${charName(o.card)} (${t('ut.r.' + o.card.rarity)})`, cr: cr(o.price) }), [
          ['buy', t('ut.mk.doBuy'), club.credits >= o.price],
          ['watch', club.market.watch.includes(o.card.id) ? t('ut.mk.delWatch') : t('ut.mk.addWatch'), true]],
        (k) => {
          if (k === 'buy') { const i = C.buyOffer(club, pid, o.idx); if (i) { C.albumRewards(club); this.sfx('enter'); } }
          if (k === 'watch') C.toggleWatch(club, o.card.id);
          this.utSave(); this.nav.pop(l); this.utOffers(watchOnly);
        }, this.utCard(o.card));
      },
      onBack: () => { this.nav.pop(l); this.renderHub(false); },
    });
    this.nav.push(l);
  };

  P.utConfirm = function (text, buttons, done, side = '') {
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(38em,100%);flex-direction:row;align-items:center;gap:1.2em">
      ${side ? `<div style="width:8em;flex:none">${side}</div>` : ''}<div class="grid"><p class="sub" style="font-size:1.15em;font-weight:700">${text}</p>
      <div class="row-btns">${buttons.map(([k, txt, on], i) => `<button class="btn${i ? '' : ' primary'}" data-nav data-act="${k}" ${on ? '' : 'disabled style="opacity:.4"'}>${txt}</button>`).join('')}
      <button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div></div>`, {
      act: (a) => { this.nav.pop(l); if (a !== 'back') done(a); },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };

  P.utSellPick = function () {
    const club = this.club();
    const list = club.cards.filter((i) => tradable(CARD[i.id].rarity) && C.where(club, i.uid) !== 'squad' && !club.market.listings.some((m) => m.uid === i.uid))
      .map((i) => ({ i, c: CARD[i.id] })).sort((a, b) => RANK[b.c.rarity] - RANK[a.c.rarity] || b.c.ovr - a.c.ovr);
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(60em,100%);height:100%">
      <h1 class="title">${t('ut.mk.pickSell')}</h1><div class="cgrid">${list.map((x) => this.utPick(x.c, x.i, `data-act="pick" data-uid="${x.i.uid}"`, `<small>${cr(value(x.c, C.today()))}</small>`)).join('') || `<p>${t('ut.mk.noSell')}</p>`}</div>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a, el) => { this.nav.pop(l); if (a === 'pick') this.utSellPrice(+el.dataset.uid, () => this.renderHub(false)); },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };

  const timeTxt = (days) => (days < 1 / 24 ? t('ut.mk.minutes', { n: Math.max(1, Math.round(days * 1440)) }) : days < 1.5 ? t('ut.mk.hours', { n: Math.round(days * 24) }) : t('ut.mk.days', { n: +days.toFixed(1) }));

  P.utSellPrice = function (uid, refresh) {
    const club = this.club(), card = C.cardOf(club, uid), fair = C.fair(card);
    const options = [1, 1.3, 1.7, 2.1, 2.6].map((k) => Math.round(fair * k / 10) * 10);
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(44em,100%);flex-direction:row;gap:1.2em;align-items:center">
      <div style="width:9em;flex:none">${this.utCard(card, { serial: C.inst(club, uid).serial })}</div>
      <div class="grid" style="gap:.5em"><h1 class="title" style="font-size:1.8em">${t('ut.mk.setPrice')}</h1><p class="sub">${t('ut.mk.fair', { cr: cr(fair) })}</p>
      ${options.map((p) => { const d = C.fillDays(card, p); return `<button class="opt-row" data-nav data-act="price" data-p="${p}"><span class="lbl">${cr(p)}</span><span class="val" style="font-weight:600">${d === null ? t('ut.mk.never') : t('ut.mk.eta', { t: timeTxt(d) })}</span></button>`; }).join('')}
      <p class="sub" style="font-size:.85em" id="tax">${t('ut.mk.tax', { cr: cr(options[0] * (1 - ECO.market.tax)) })}</p>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div></div>`, {
      act: (a, el) => {
        if (a === 'back') return this.nav.pop(l);
        C.listCard(club, uid, +el.dataset.p); this.utSave(); this.nav.pop(l); refresh && refresh();
      },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
    l.el.addEventListener('focusin', (e) => { const b = e.target.closest('[data-p]'); if (b) l.el.querySelector('#tax').textContent = t('ut.mk.tax', { cr: cr(+b.dataset.p * (1 - ECO.market.tax)) }); });
  };

  P.utListings = function () {
    const club = this.club(), now = Date.now();
    const rows = club.market.listings.map((m) => {
      const c = CARD[m.id];
      const st = m.fillAt === null ? t('ut.mk.stuck') : t('ut.mk.waiting', { t: timeTxt(Math.max(0, (m.fillAt - now) / 86400000)) });
      return this.utPick(c, C.inst(club, m.uid), `data-act="cancel" data-uid="${m.uid}"`, `<small>${cr(m.price)}</small><small style="font-weight:600">${st}</small>`);
    }).join('');
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(60em,100%);height:100%">
      <h1 class="title">${t('ut.mk.mine')}</h1><div class="cgrid">${rows || `<p>${t('ut.mk.empty')}</p>`}</div>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a, el) => {
        if (a === 'back') { this.nav.pop(l); return this.renderHub(false); }
        const uid = +el.dataset.uid;
        this.utConfirm(t('ut.mk.cancel') + '?', [['yes', t('ut.mk.cancel'), true]], () => { C.cancelListing(club, uid); this.utSave(); this.nav.pop(l); this.utListings(); }, this.utCard(C.cardOf(club, uid)));
      },
      onBack: () => { this.nav.pop(l); this.renderHub(false); },
    });
    this.nav.push(l);
  };

  // ---------------------------------------------------------------- Divisions

  P.utPrematch = function () {
    const club = this.club(), p = save.active();
    if (!C.squadComplete(club)) return this.toastLayer(t('ut.squad.incomplete'));
    const opp = C.opponent(club, p.id);
    const mine = C.squadCards(club);
    const col = (cards, name, color, rating) => `<div class="grid" style="gap:.4em;justify-items:center"><span class="big" style="font-family:var(--fd);font-size:2.6em;color:${color};-webkit-text-stroke:.05em var(--ink)">${rating}</span>
      <b style="font-family:var(--fd);font-weight:400;font-size:1.3em">${esc(name)}</b><div style="display:flex;gap:.3em">${cards.map((c) => `<div style="width:3.6em">${this.utCard(c)}</div>`).join('')}</div></div>`;
    const oppCards = opp.cards.map((id) => CARD[id]);
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(56em,100%)">
      <p class="sub" style="font-family:var(--fn)">${t('ut.div.name', { n: C.divName(club.division.div) })} · ${t('ut.div.season', { n: club.division.played + 1 })}</p>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1em">${col(mine, p.name, p.color, C.squadRating(club))}<span class="title" style="font-size:2em">${t('ut.div.vs')}</span>${col(oppCards, opp.name, opp.color, opp.rating)}</div>
      <p class="sub">${t('ut.div.pre')}</p>
      <div class="row-btns"><button class="btn primary" data-nav data-act="go" data-autofocus>${t('ut.div.kickoff')}</button><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a) => {
        if (a === 'back') return this.nav.pop(l);
        this.nav.clear(); this.hub = null;
        this.onStart({
          kind: 'cpu', humans: [0], bindings: [{ device: 'any', ctrl: 0 }], seconds: this.setup.seconds,
          cpuLevel: C.cpuLevel(club.division.div),
          lineups: [C.lineup(club, p.name, p.color), { name: opp.name, color: opp.color, slots: opp.slots, stats: opp.stats, captain: opp.captain }],
          onFinish: (res) => this.utAfterMatch(res),
          onQuit: () => this.utBackToUt(3),
        });
      },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };

  P.utBackToUt = function (sub) {
    this.state = { mode: 'ut', tab: 3, sub };
    this.showHub();
  };

  P.utAfterMatch = function (res) {
    const club = this.club();
    const my = res.score[0], their = res.score[1];
    const r = C.divisionResult(club, my, their);
    save.addResult(r.res === 'win' ? 'won' : r.res === 'loss' ? 'lost' : 'drawn');
    this.utSave();
    this.utBackToUt(3);
    const rows = r.parts.map(([k, v]) => `<tr><td>${t('ut.res.' + k)}</td><td><b>+${cr(v)}</b></td></tr>`).join('');
    const s = r.season;
    const seasonTxt = s ? `<p class="sub" style="font-weight:800">${s.move > 0 ? t('ut.res.up', { n: C.divName(s.from + 1) }) : s.move < 0 ? t('ut.res.down', { n: C.divName(s.from - 1) }) : t('ut.res.stay', { n: C.divName(s.from) })}</p>` : '';
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(36em,100%)">
      <h1 class="title">${t('ut.res.' + r.res)} ${my} – ${their}</h1>${seasonTxt}
      <table class="stats">${rows}<tr><td>${t('ut.res.total')}</td><td><b>+${cr(r.total)}</b></td></tr></table>${this.utRewardsHtml({ daily: r.daily })}
      <div class="row-btns"><button class="btn primary" data-nav data-act="ok" data-autofocus>${t('ut.open.ok')}</button><button class="btn" data-nav data-act="shop">${t('ut.club.shop')}</button></div></div></div>`, {
      act: (a) => { this.nav.pop(l); if (a === 'shop') this.utShop(); else this.renderHub(false); },
      onBack: () => { this.nav.pop(l); this.renderHub(false); },
    });
    this.nav.push(l);
  };

  // ---------------------------------------------------------------- album

  P.utAlbumPage = function (char) {
    const club = this.club(), pg = C.albumPage(club, char);
    const items = pg.all.map((c) => `<div class="cpick${club.album[c.id] ? '' : ' ghost'}" data-nav tabindex="-1">${this.utCard(c)}
      <small>${t('ut.r.' + c.rarity)}${club.album[c.id] ? '' : ' · ' + t('ut.album.missing')}</small></div>`).join('');
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(64em,100%)">
      <h1 class="title">${t('ut.char.' + char)}</h1><p class="sub">${t('ut.album.page', { a: pg.all.filter((c) => !SPECIAL.includes(c.rarity) && club.album[c.id]).length, b: pg.need })} ·
      ${club.albumPaid[char] ? '★ ' + t('ut.album.paid') : pg.need > 1 ? t('ut.album.reward', { cr: cr(ECO.album.page) }) : ''} · ${t('ut.album.allReward', { cr: cr(ECO.album.all) })}</p>
      <div class="cgrid" style="grid-template-columns:repeat(auto-fill,minmax(8em,1fr))">${items}</div><p class="sub" style="font-size:.85em">${t('ut.album.special')}</p>
      <div class="row-btns"><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: () => this.nav.pop(l), onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };
}
