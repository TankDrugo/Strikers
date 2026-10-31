// Headless check of the test build (tools/build.mjs --prova): the club tops up to 10 million credits, a real pack is
// bought and opened in the menu (walkout), then 200 packs of every kind are opened through the rules and every card
// of the catalogue is drawn: each must have its portrait and nothing may throw.
//   node tools/packtest.cjs [path/to/gioco-prova.html] [screenshot-prefix]
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const file = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist', 'gioco-prova.html'));
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
  const click = async (sel) => { await page.waitForSelector(sel, { timeout: 15000 }); await page.click(sel); await page.waitForTimeout(300); };

  if (!(await page.evaluate(() => !!window.__PROVA))) errors.push('not the test build');
  await page.evaluate('window.__proto.menu.setTab(3)');
  await click('[data-act="enter-ut"]');
  await page.waitForTimeout(1200);
  await click('.layer:last-child [data-act="ok"]');
  const credits = await page.evaluate(() => window.__proto.menu.club().credits);
  if (credits < 5e6) errors.push('credits not topped up: ' + credits);
  await shot('club');
  // one real Holo pack through the shop, with the opening
  await click('[data-act="ut-shop"]');
  await shot('shop');
  await click('.layer:last-child [data-act="buy"][data-p="holo"]');
  await page.waitForTimeout(6000);
  await shot('opening');

  const res = await page.evaluate(() => {
    const m = window.__proto.menu, C = window.__proto.ut.club, K = window.__proto.ut.cards;
    const club = m.club(), reg = { numbered: {}, oneOfOne: {} };
    const counts = {};
    for (const id of Object.keys(K.ECO.packs)) for (let i = 0; i < 200; i++) {
      club.credits = 1e9;
      const got = C.buyPack(club, id, reg);
      if (!got) throw new Error('pack refused: ' + id);
      for (const g of got) counts[g.card.rarity] = (counts[g.card.rarity] || 0) + 1;
    }
    m.club(); // top-up again
    const missing = [], bad = [];
    for (const c of K.CATALOG) {
      if (!m.portrait(c.char, c.gk)) missing.push(c.id);
      const html = m.utCard(c, { serial: 3 }), text = html.replace(/src="[^"]*"/g, ''); // base64 can spell anything
      if (!html.includes('<img') || text.includes('undefined') || text.includes('NaN')) bad.push(c.id);
    }
    // the whole catalogue on screen
    const d = document.createElement('div');
    d.className = 'ui'; d.style.cssText = 'position:fixed;inset:0;z-index:99;background:#2a1260;display:grid;grid-template-columns:repeat(14,1fr);gap:6px;padding:8px;overflow:auto';
    d.innerHTML = K.CATALOG.map((c) => `<div>${m.utCard(c, { serial: 7 })}</div>`).join('');
    document.body.appendChild(d);
    return { catalog: K.CATALOG.length, counts, missing, bad, cards: club.cards.length, credits: club.credits };
  });
  await page.waitForTimeout(1500);
  await shot('catalog');
  if (res.missing.length) errors.push('cards without portrait: ' + res.missing.join(', '));
  if (res.bad.length) errors.push('cards drawn badly: ' + res.bad.join(', '));
  await browser.close();
  console.log(JSON.stringify(res));
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length ? 1 : 0);
})();
