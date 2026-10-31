// Headless check of Ultimate Team in the built game: welcome pack, squad, a gold pack with its walkout,
// a full CPU-played match with card stats and the credits it gives. Fails on page errors.
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
  await page.goto('file://' + file);
  await page.waitForFunction(() => window.__proto && window.__proto.template, null, { timeout: 180000 });
  await page.evaluate(() => localStorage.clear());
  const shot = async (name) => { if (shots) await page.screenshot({ path: `${shots}_${name}.png` }); };
  await page.click('#ut');
  await page.waitForSelector('#starter');
  await shot('hub');
  await page.click('#starter');
  await page.waitForSelector('#ok');
  await page.waitForTimeout(800);
  await shot('starter');
  await page.click('#squad');
  await page.waitForSelector('.formation');
  await shot('squad');
  const squad = await page.evaluate(() => window.__proto.ut.save.squad);
  if (squad.some((x) => !x)) errors.push('starter squad incomplete: ' + JSON.stringify(squad));
  // gold pack with walkout
  await page.evaluate(() => { window.__proto.ut.save.credits += 3000; });
  await page.click('#back');
  await page.click('#shop');
  await page.click('[data-p="oro"]');
  await page.waitForSelector('.ut-walk', { timeout: 10000 });
  for (const t of [1200, 2600, 4200, 5600, 6800]) { await page.waitForTimeout(t === 1200 ? 1200 : 1400); await shot('walkout_' + t); }
  await page.waitForSelector('#ok', { timeout: 20000 });
  await page.waitForTimeout(800);
  await shot('reveal');
  await page.click('#ok');
  // a match: CPU plays both sides with the UT squads
  const before = await page.evaluate(() => window.__proto.ut.save.credits);
  await page.click('#play');
  await page.waitForSelector('#go');
  await shot('prematch');
  await page.click('#go');
  await page.waitForTimeout(1500);
  const report = await page.evaluate(() => {
    const g = window.__proto.game;
    g.aiOnly = true; g.setHuman(null);
    let nan = 0;
    const cfg = g.players.map((p) => +(p.cfg.run || 0).toFixed(2));
    for (let i = 0; i < 50 * 400 && g.phase !== 'end'; i++) {
      g.fixedStep(0.02);
      for (const p of g.players) if (!isFinite(p.pos.x + p.pos.z)) nan++;
    }
    return { score: g.score, phase: g.phase, nan, runSpeeds: cfg, teams: g.teams.map((t) => t.name) };
  });
  console.log(JSON.stringify(report));
  await page.waitForSelector('#hub', { timeout: 10000 });
  await shot('reward');
  const after = await page.evaluate(() => window.__proto.ut.save);
  console.log(JSON.stringify({ ...report, creditsBefore: before, creditsAfter: after.credits, record: after.record, owned: Object.keys(after.owned).length }));
  if (after.credits <= before) errors.push('no match reward');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('calcio-ut-save-v1') || 'null'));
  if (!stored || stored.credits !== after.credits) errors.push('save not written to localStorage');
  await browser.close();
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length || report.nan ? 1 : 0);
})();
