// Headless check of the built game: opens dist/gioco.html, plays 150 s of CPU vs CPU and fails on
// page errors or NaN positions. Needs Playwright with Chromium (npm i -D playwright, npx playwright install chromium).
//   node tools/playtest.cjs [path/to/gioco.html] [screenshot-prefix]
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
  await page.evaluate(() => { window.__proto.menu.nav.clear(); window.__proto.startMatch({ aiOnly: true }); });
  await page.waitForTimeout(1500);
  if (shots) await page.screenshot({ path: shots + '_kickoff.png' });
  const report = await page.evaluate(() => {
    const g = window.__proto.game;
    let nan = 0, maxSpeed = 0;
    for (let i = 0; i < 50 * 150; i++) {
      g.fixedStep(0.02);
      const b = g.ball.pos;
      if (!isFinite(b.x + b.y + b.z)) nan++;
      for (const p of g.players) if (!isFinite(p.pos.x + p.pos.z)) nan++;
      maxSpeed = Math.max(maxSpeed, g.ball.vel.length());
    }
    return { score: g.score, stats: g.stats, nan, maxSpeed: +maxSpeed.toFixed(1) };
  });
  await page.waitForTimeout(500);
  if (shots) await page.screenshot({ path: shots + '_play.png' });
  await browser.close();
  console.log(JSON.stringify(report));
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length || report.nan ? 1 : 0);
})();
