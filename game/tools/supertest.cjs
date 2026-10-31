// Headless check of the Super Strike (game/src/config.js SUPER, reference/VERIFICA.md §3, §9.3, §10): the captain holds
// the shot in the opponents' half for 0.91 s, one needle goes up and down on the clip time; first press on 0.84 and
// second on 0.16 = unstoppable (+2), second only on the green = goal (+2), second outside = punched away, keeper down.
// A non-captain or a captain in his own half only shoots normally; the keeper comes out on a captain charging next to
// him; the CPU captain tries it. Fails on page errors or wrong results.
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

  // put the human's captain (slot 3) on the ball at (x, z), holding shoot; then run the sequence.
  // aim: [first, second] needle values to press at (null = no press); stopAt: return at that phase
  await page.evaluate(() => {
    window.__ss = (x, aim, stopAt, slot = 3, z = 1, keeperAt = null) => {
      const g = window.__proto.game, c = g.controllers[0];
      g.phase = 'play'; g.phaseTime = 0; g.clock = 999;
      const p = g.players.find((q) => q.team === 0 && q.index === slot);
      g.setControlled(c, p);
      for (const q of g.players) { q.setState('free'); q.stun = 0; if (q !== p && !q.isGoalie) q.pos.set(-12 + q.index * 2, 0, -6 + q.index * 3); }
      const k = g.goalieOf(1); k.pos.copy(keeperAt || k.home); k.energy = 100;
      p.pos.set(x, 0, z); p.facing = 0; p.speed = 0;
      g.ball.owner = p; g.ball.superStrike = null; g.superStrike = null;
      const score0 = [...g.score], saves0 = g.stats.saves[1];
      g.startWindup(p);
      c.input.shootHeld = true;
      const log = { started: false, phases: [], n: null, outcome: null, charge: null };
      for (let i = 0; i < 50 * 12; i++) {
        if (keeperAt && k.state === 'free') k.pos.copy(keeperAt), k.speed = 0; // the keeper stays next to the captain until he decides
        if (p.state === 'windup') log.windup = p.stateTime;
        const s = g.superStrike;
        if (s) {
          if (!log.started) { log.started = true; log.charge = +(log.windup + 0.02).toFixed(2); }
          keeperAt = null;
          if (log.phases[log.phases.length - 1] !== s.phase) log.phases.push(s.phase);
          if (stopAt && s.phase === stopAt) return log;
          c.input.shootHeld = false;
          if (s.phase === 'meter' && aim) {
            // press at the exact moment the needle reaches the aim (frames: up from 3 to 14.5, down to 26), like a real
            // frame-timed press between two 50 Hz steps
            const tUp = (v) => (3 + v * 11.5) / 30, tDown = (v) => (14.5 + (1 - v) * 11.5) / 30;
            if (s.n[0] === null && aim[0] !== null && s.t + 0.02 >= tUp(aim[0])) s.pressT = tUp(aim[0]);
            else if (s.n[0] !== null && s.n[1] === null && aim[1] !== null && s.t + 0.02 >= tDown(aim[1])) s.pressT = tDown(aim[1]);
          }
          if (s.outcome) { log.n = s.n.map((v) => (v === null ? null : +v.toFixed(3))); log.outcome = s.outcome; }
        }
        g.fixedStep(0.02);
        if (g.phase === 'goal') break;
        if (!g.superStrike && (log.started || p.state !== 'windup') && g.ball.owner && g.ball.owner !== p) break;
        if (!g.superStrike && log.phases.includes('flight') && (g.ball.owner || g.ball.vel.length() < 1)) break;
      }
      log.goals = g.score[0] - score0[0]; log.saves = g.stats.saves[1] - saves0; log.phase = g.phase;
      log.keeper = g.goalieOf(1).currentName; log.owner = g.ball.owner ? (g.ball.owner.isGoalie ? 'keeper' : 'player') : null;
      return log;
    };
  });

  const start = () => page.evaluate(() => window.__proto.startMatch({ kind: 'cpu', humans: [0], bindings: [{ device: 'any', ctrl: 0 }] }));
  await start();
  await page.waitForTimeout(1500);
  const air = await page.evaluate(() => window.__ss(8, null, 'meter'));
  await page.waitForTimeout(700);
  await shot('meter');
  await start(); await page.waitForTimeout(800);
  const perfect = await page.evaluate(() => window.__ss(8, [0.84, 0.16]));
  await page.waitForTimeout(400);
  await shot('goal');
  await start(); await page.waitForTimeout(800);
  const goal = await page.evaluate(() => window.__ss(8, [null, 0.17]));
  await start(); await page.waitForTimeout(800);
  const miss = await page.evaluate(() => window.__ss(8, [0.3, 0.5]));
  await page.waitForTimeout(300);
  await shot('saved');
  const ownHalf = await page.evaluate(() => window.__ss(-4, [0.84, 0.16]));
  const notCaptain = await page.evaluate(() => window.__ss(8, [0.84, 0.16], null, 2));
  // the keeper next to a captain charging the strike comes out on him (gk_attack_s2s_high) and takes the ball
  await start(); await page.waitForTimeout(800);
  const attack = await page.evaluate(() => { const THREE_V = window.__proto.game.ball.pos.constructor; return window.__ss(12, [0.84, 0.16], null, 3, 0, new THREE_V(13.6, 0, 0)); });

  // CPU against CPU for a long while: the computer captains try it, nothing breaks
  const cpu = await page.evaluate(() => {
    window.__proto.startMatch({ kind: 'watch', humans: [], bindings: [], cpuLevel: 3 });
    const g = window.__proto.game; let supers = 0, superGoals = 0, nan = 0; const outcomes = {};
    g.onEvent = (type, d) => { if (type === 'superStart') supers++; if (type === 'superResult') outcomes[d.outcome] = (outcomes[d.outcome] || 0) + 1; if (type === 'goal' && d.superStrike) superGoals++; };
    g.clock = 2000;
    for (let i = 0; i < 50 * 1200 && supers < 4; i++) {
      g.fixedStep(0.02);
      if (!isFinite(g.ball.pos.x + g.ball.pos.y + g.ball.pos.z)) nan++;
      if (g.phase === 'end') break;
    }
    return { supers, superGoals, outcomes, nan, score: g.score };
  });

  await browser.close();
  const out = { air: { phases: air.phases, charge: air.charge }, perfect, goal, miss, ownHalf: ownHalf.started, notCaptain: notCaptain.started, attack, cpu };
  console.log(JSON.stringify(out));
  if (!air.started) errors.push('no Super Strike from the captain');
  if (air.charge > 0.95 || air.charge < 0.88) errors.push('charge should be 0.91 s: ' + air.charge);
  if (perfect.outcome !== 'super' || perfect.goals !== 2) errors.push('perfect strike: ' + JSON.stringify(perfect));
  if (goal.outcome !== 'goal' || goal.goals !== 2) errors.push('second press only: ' + JSON.stringify(goal));
  if (miss.outcome !== 'saved' || miss.goals !== 0 || miss.saves !== 1) errors.push('missed strike: ' + JSON.stringify(miss));
  if (ownHalf.started) errors.push('Super Strike from the own half');
  if (notCaptain.started) errors.push('Super Strike by a non-captain');
  if (attack.owner !== 'keeper' || attack.goals) errors.push('keeper did not come out on the charging captain: ' + JSON.stringify(attack));
  if (cpu.nan) errors.push('NaN in CPU match');
  if (!cpu.supers) errors.push('the CPU captain never tried a Super Strike');
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length ? 1 : 0);
})();
