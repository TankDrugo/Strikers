// Headless measure of goals per shot at each difficulty level, CPU against CPU (both sides read the level's tables).
// Counts normal shots and Super Strikes apart, the keeper's dice rolls (must miss) and saves. Fails on page errors or NaN.
//   node tools/goalrate.cjs [seconds per level, default 900] [path/to/gioco.html]
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const secs = +(process.argv[2] || 900);
  const file = path.resolve(process.argv[3] || path.join(__dirname, '..', 'dist', 'gioco.html'));
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file://' + file);
  await page.waitForFunction(() => window.__proto && window.__proto.template, null, { timeout: 180000 });
  await page.evaluate(() => window.__proto.menu.nav.clear());
  const names = ['Rookie', 'Professional', 'Superstar', 'Legend'];
  const rows = [];
  for (let level = 0; level < 4; level++) {
    const r = await page.evaluate(({ level, secs }) => {
      window.__proto.startMatch({ kind: 'watch', humans: [], bindings: [], cpuLevel: level });
      const g = window.__proto.game;
      const c = { shots: 0, perfect: 0, goals: 0, perfectGoals: 0, superTries: 0, superGoals: 0, saves: 0, mustMiss: 0, nan: 0, passes: 0, tackles: 0 };
      let lastShot = null;
      g.onEvent = (type, d) => {
        if (type === 'shot' && !d.superStrike) { c.shots++; if (d.perfect) c.perfect++; lastShot = { perfect: d.perfect, t: g.time }; if (g.ball.shouldMiss) c.mustMiss++; }
        if (type === 'superStart') c.superTries++;
        if (type === 'save') c.saves++;
        if (type === 'goal') {
          if (d.superStrike) c.superGoals++;
          else { c.goals++; if (lastShot && lastShot.perfect && g.time - lastShot.t < 4) c.perfectGoals++; }
        }
      };
      g.clock = secs + 10;
      for (let i = 0; i < 50 * secs; i++) {
        g.fixedStep(0.02);
        const b = g.ball.pos;
        if (!isFinite(b.x + b.y + b.z)) c.nan++;
        for (const p of g.players) if (!isFinite(p.pos.x + p.pos.z)) c.nan++;
        if (g.phase === 'end') break;
      }
      c.passes = g.stats.passes[0] + g.stats.passes[1];
      c.tackles = g.stats.tackles[0] + g.stats.tackles[1];
      return c;
    }, { level, secs });
    r.level = names[level];
    r.goalsPerShot = +(r.goals / Math.max(1, r.shots)).toFixed(3);
    r.perfectGoalsPerShot = +(r.perfectGoals / Math.max(1, r.perfect)).toFixed(3);
    r.mustMissShare = +(r.mustMiss / Math.max(1, r.shots)).toFixed(3);
    rows.push(r);
    console.log(JSON.stringify(r));
  }
  await browser.close();
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length || rows.some((r) => r.nan) ? 1 : 0);
})();
