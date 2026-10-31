// Headless check of the Super Strike (game/src/config.js SUPER): the captain holds the shot in the opponents' half,
// the two needles stop on the dark green (perfect: +2, keeper blasted into the net) or outside (keeper punches it
// away and stays down), a non-captain or a captain in his own half only shoots normally, the CPU captain tries it.
// Fails on page errors or wrong results.
//   node tools/supertest.cjs [path/to/gioco.html] [screenshot-prefix]
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
  await page.evaluate(() => window.__proto.menu.nav.clear());
  const shot = async (name) => { if (shots) await page.screenshot({ path: `${shots}_${name}.png` }); };

  // put the human's captain (slot 3) on the ball at x, holding shoot; then run the sequence.
  // aim: 'perfect' presses on the marks, 'miss' presses at once, 'none' never presses; stopAt: return at that phase
  await page.evaluate(() => {
    window.__ss = (x, aim, stopAt, slot = 3) => {
      const g = window.__proto.game, c = g.controllers[0];
      g.phase = 'play'; g.phaseTime = 0;
      const p = g.players.find((q) => q.team === 0 && q.index === slot);
      g.setControlled(c, p);
      for (const q of g.players) { q.setState('free'); q.stun = 0; if (q !== p && !q.isGoalie) q.pos.set(-12 + q.index * 2, 0, -6 + q.index * 3); }
      const k = g.goalieOf(1); k.pos.copy(k.home);
      p.pos.set(x, 0, 1); p.facing = 0; p.speed = 0;
      g.ball.owner = p; g.ball.superStrike = null; g.superStrike = null;
      const score0 = [...g.score], saves0 = g.stats.saves[1];
      c.input.actions.add('shootOrSlide'); c.input.shootHeld = true;
      const log = { started: false, phases: [], n: null, outcome: null };
      for (let i = 0; i < 50 * 12; i++) {
        const s = g.superStrike;
        if (s) {
          log.started = true;
          if (log.phases[log.phases.length - 1] !== s.phase) log.phases.push(s.phase);
          if (stopAt && s.phase === stopAt) return log;
          c.input.shootHeld = false;
          const i0 = s.phase === 'meter1' ? 0 : s.phase === 'meter2' ? 1 : -1;
          if (i0 >= 0 && aim !== 'none') {
            const mark = [0.84, 0.16][i0];
            if (aim === 'miss' ? s.t > 0.05 : Math.abs(s.needle - mark) < 0.02) c.input.actions.add('shootOrSlide');
          }
          if (s.outcome) { log.n = s.n.map((v) => +v.toFixed(3)); log.outcome = s.outcome; }
        }
        g.fixedStep(0.02);
        if (g.phase === 'goal') break;
        if (!g.superStrike && log.started && log.phases.includes('flight') && g.ball.owner) break;
      }
      log.goals = g.score[0] - score0[0]; log.saves = g.stats.saves[1] - saves0; log.phase = g.phase; log.keeper = g.goalieOf(1).currentName;
      log.captainState = p.state; log.shooterState = p.state;
      return log;
    };
  });

  await page.evaluate(() => window.__proto.startMatch({ kind: 'cpu', humans: [0], bindings: [{ device: 'any', ctrl: 0 }] }));
  await page.waitForTimeout(1500);
  // screenshots of the sequence: in the air with the meter
  const air = await page.evaluate(() => window.__ss(8, 'none', 'meter1'));
  await page.waitForTimeout(500);
  await shot('meter');
  await page.waitForTimeout(1600);
  await shot('kick');

  await page.evaluate(() => window.__proto.startMatch({ kind: 'cpu', humans: [0], bindings: [{ device: 'any', ctrl: 0 }] }));
  await page.waitForTimeout(800);
  const perfect = await page.evaluate(() => window.__ss(8, 'perfect'));
  await page.waitForTimeout(400);
  await shot('goal');
  await page.evaluate(() => window.__proto.startMatch({ kind: 'cpu', humans: [0], bindings: [{ device: 'any', ctrl: 0 }] }));
  await page.waitForTimeout(800);
  const miss = await page.evaluate(() => window.__ss(8, 'miss'));
  await page.waitForTimeout(300);
  await shot('saved');
  const ownHalf = await page.evaluate(() => window.__ss(-4, 'perfect'));
  const notCaptain = await page.evaluate(() => window.__ss(8, 'perfect', null, 2));

  // CPU against CPU for a long while: the computer captains try it, nothing breaks
  const cpu = await page.evaluate(() => {
    window.__proto.startMatch({ kind: 'watch', humans: [], bindings: [], cpuLevel: 3 });
    const g = window.__proto.game; let supers = 0, superGoals = 0, nan = 0;
    g.onEvent = (type, d) => { if (type === 'superStart') supers++; if (type === 'goal' && d.superStrike) superGoals++; };
    g.clock = 2000;
    for (let i = 0; i < 50 * 1800 && !supers; i++) {
      g.fixedStep(0.02);
      if (!isFinite(g.ball.pos.x + g.ball.pos.y + g.ball.pos.z)) nan++;
      if (g.phase === 'end') break;
    }
    return { supers, superGoals, nan, score: g.score };
  });

  await browser.close();
  const out = { air: air.phases, perfect, miss, ownHalf: ownHalf.started, notCaptain: notCaptain.started, cpu };
  console.log(JSON.stringify(out));
  if (!air.started) errors.push('no Super Strike from the captain');
  if (perfect.outcome !== 'perfect' || perfect.goals !== 2) errors.push('perfect strike: ' + JSON.stringify(perfect));
  if (miss.outcome !== 'saved' || miss.goals !== 0 || miss.saves !== 1) errors.push('missed strike: ' + JSON.stringify(miss));
  if (ownHalf.started) errors.push('Super Strike from the own half');
  if (notCaptain.started) errors.push('Super Strike by a non-captain');
  if (cpu.nan) errors.push('NaN in CPU match');
  if (!cpu.supers) errors.push('the CPU captain never tried a Super Strike');
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length ? 1 : 0);
})();
