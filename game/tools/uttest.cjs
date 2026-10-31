// Headless check of Ultimate Team inside the menu: first visit (starter squad), squad, pack store and a P1
// opening with walkout, a numbered card sleeved in its case, collection, market (buy, list, sale), a Divisions
// match with the card stats and its rewards, album. Fails on page errors.
//   node tools/uttest.cjs [path/to/gioco.html] [screenshot-prefix]
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const file = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'gioco.html'));
  const shots = process.argv[3];
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    const now = Date.now();
    localStorage.setItem('calcio-arcade-save', JSON.stringify({ version: 1, lang: 'it', activeId: 'pt', profiles: [{ id: 'pt', name: 'Prova', color: '#2bc0ff',
      created: now, lastPlayed: now, record: { played: 0, won: 0, drawn: 0, lost: 0 }, cups: {}, ultimate: { credits: 0, cards: [] } }] }));
  });
  await page.goto('file://' + file);
  await page.waitForFunction(() => window.__proto && window.__proto.template && window.__proto.menu.hub, null, { timeout: 180000 });
  const shot = async (name) => { if (shots) await page.screenshot({ path: `${shots}_${name}.png` }); };
  const M = 'window.__proto.menu';
  const click = async (sel) => { await page.waitForSelector(sel, { timeout: 15000 }); await page.click(sel); };

  // enter Ultimate Team: starter squad
  await page.evaluate(`${M}.setTab(3)`);
  await page.waitForTimeout(400);
  await shot('ut_tab');
  await click('[data-act="enter-ut"]');
  await page.waitForTimeout(1500);
  await shot('starter');
  const start = await page.evaluate(() => { const c = window.__proto.menu.club(); return { credits: c.credits, cards: c.cards.length, squad: c.squad.filter(Boolean).length }; });
  if (start.cards !== 5 || start.squad !== 5 || start.credits !== 2000) errors.push('starter club wrong: ' + JSON.stringify(start));
  await click('.layer:last-child [data-act="ok"]');
  await page.waitForTimeout(500);
  await shot('club');
  // squad
  await page.evaluate(`${M}.setTab(1)`);
  await page.waitForTimeout(500);
  await shot('squad');
  // shop: Premium Gold with walkout
  await page.evaluate(`${M}.club().credits += 200000; ${M}.utSave(); ${M}.setTab(0)`);
  await click('[data-act="ut-shop"]');
  await page.waitForTimeout(500);
  await shot('shop');
  // force the best card of the pack to be a holo so the walkout runs
  await page.evaluate(() => {
    const m = window.__proto.menu, { club: C, cards } = window.__proto.ut;
    const club = m.club();
    club.credits -= 7500;
    const holo = cards.CATALOG.find((c) => c.rarity === 'holoRare');
    const mk = (card) => { const i = { uid: club.nextUid++, id: card.id, t: Date.now() }; club.cards.push(i); club.album[card.id] = true; return { card, inst: i, isNew: true }; };
    const got = [mk(holo), mk(cards.CATALOG.find((c) => c.rarity === 'gold')), mk(cards.CATALOG.find((c) => c.rarity === 'goldRare'))];
    m.nav.pop(); m.utOpen({ id: 'premiumGold', titleKey: 'ut.pack.premiumGold' }, got);
  });
  await page.waitForTimeout(600);
  await shot('open_pack');
  await page.click('.theatre');
  await page.waitForTimeout(2600);
  await shot('open_clues');
  await page.waitForFunction(() => window.__proto.menu.walkout && window.__proto.menu.walkout.active, null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  await shot('walkout_walk');
  await page.waitForTimeout(3500);
  await shot('walkout_celebrate');
  await page.waitForFunction(() => !window.__proto.menu.walkout.active, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await shot('open_card');
  await page.click('.theatre .skip');
  await page.waitForTimeout(800);
  await shot('open_all');
  await click('.layer:last-child [data-act="ok"]');
  // a real pack bought through the store
  const real = await page.evaluate(() => { const m = window.__proto.menu, C = window.__proto.ut.club; const g = C.buyPack(m.club(), 'gold', window.__proto.ut ? JSON.parse('{"numbered":{},"oneOfOne":{}}') : null); return g.map((x) => x.card.rarity); });
  if (real.length !== 5) errors.push('gold pack did not give 5 cards');
  // numbered card: straight to the card and the case
  await page.evaluate(() => {
    const m = window.__proto.menu, { cards } = window.__proto.ut, club = m.club();
    const num = cards.CATALOG.find((c) => c.rarity === 'numbered');
    const i = { uid: club.nextUid++, id: num.id, t: Date.now(), serial: 4 }; club.cards.push(i); club.album[num.id] = true;
    window.__num = i.uid;
    m.walkout = null; // no 3D here: clues, then the case
    m.utOpen({ id: 'holo', titleKey: 'ut.pack.holo' }, [{ card: num, inst: i, isNew: true }]);
  });
  await page.click('.theatre');
  await page.waitForTimeout(9000);
  await shot('numbered_case');
  await page.click('.theatre .skip');
  await click('.layer:last-child [data-act="ok"]');
  // collection and card detail
  await click('[data-act="ut-coll"]');
  await page.waitForTimeout(500);
  await shot('collection');
  await page.click('.layer:last-child [data-act="card"]');
  await page.waitForTimeout(500);
  await shot('card_detail');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  // market: buy an offer, list a card, settle the sale
  await page.evaluate(`${M}.setTab(2)`);
  await page.waitForTimeout(300);
  await shot('market');
  const mk = await page.evaluate(() => {
    const m = window.__proto.menu, C = window.__proto.ut.club, club = m.club(), pid = 'pt';
    const before = club.cards.length;
    const o = C.offers(club, pid).find((x) => !x.sold);
    const got = C.buyOffer(club, pid, o.idx);
    const sellable = club.cards.find((i) => C.where(club, i.uid) === 'club' && window.__proto.ut.cards.tradable(window.__proto.ut.cards.CARD[i.id].rarity));
    const card = window.__proto.ut.cards.CARD[sellable.id];
    const price = C.fair(card);
    const ok = C.listCard(club, sellable.uid, price);
    const cr0 = club.credits;
    club.market.listings[0].fillAt = Date.now() - 1;
    const sold = C.settleMarket(club);
    return { bought: !!got, listed: ok, sold: sold.length, gain: club.credits - cr0, cards: club.cards.length - before };
  });
  if (!mk.bought || !mk.listed || mk.sold !== 1 || mk.gain <= 0) errors.push('market: ' + JSON.stringify(mk));
  // Divisions: prematch, a full CPU-played match with the card stats, rewards
  await page.evaluate(`${M}.setTab(3)`);
  await page.waitForTimeout(300);
  await shot('divisions');
  await click('[data-act="ut-div-play"]');
  await page.waitForTimeout(500);
  await shot('prematch');
  await click('.layer:last-child [data-act="go"]');
  await page.waitForTimeout(1500);
  const match = await page.evaluate(() => {
    const g = window.__proto.game;
    g.setHumans([]);
    const runs = g.players.map((p) => +(p.cfg.run || 0).toFixed(2));
    let nan = 0;
    for (let i = 0; i < 50 * 400 && g.phase !== 'end'; i++) { g.fixedStep(0.02); for (const p of g.players) if (!isFinite(p.pos.x + p.pos.z)) nan++; }
    return { score: g.score, phase: g.phase, nan, runs, teams: g.teams.map((t) => t.name) };
  });
  console.log(JSON.stringify(match));
  await page.waitForFunction(() => window.__proto.menu.club().division.played === 1, null, { timeout: 15000 });
  await page.waitForTimeout(800);
  await shot('result');
  await page.keyboard.press('Escape');
  // album
  await page.evaluate(`${M}.setTab(4)`);
  await page.waitForTimeout(400);
  await shot('album');
  await click('[data-act="ut-page"]');
  await page.waitForTimeout(400);
  await shot('album_page');
  // every card of the catalogue, for a look at all rarities and holo foils
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const m = window.__proto.menu, { cards } = window.__proto.ut, club = m.club();
    for (const c of cards.CATALOG.filter((x) => x.char === 'celestini_attaccante' || x.char === 'celestini_portiere')) { if (!club.cards.some((i) => i.id === c.id)) club.cards.push({ uid: club.nextUid++, id: c.id, t: Date.now(), serial: c.rarity === 'numbered' ? 7 : undefined }); }
    m.utSave(); m.utCollection(); });
  await page.waitForTimeout(800);
  await shot('all_cards');
  await page.keyboard.press('Escape');
  const club = await page.evaluate(() => { const c = window.__proto.menu.club(); return { credits: c.credits, cards: c.cards.length, div: c.division, daily: c.daily }; });
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('calcio-arcade-save')).profiles[0].ultimate.cards.length);
  console.log(JSON.stringify({ start, mk, club, stored }));
  if (stored !== club.cards) errors.push('club not saved');
  if (match.phase !== 'end' || match.nan) errors.push('match did not finish cleanly');
  await browser.close();
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length ? 1 : 0);
})();
