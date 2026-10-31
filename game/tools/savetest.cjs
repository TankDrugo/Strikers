// Headless check of the keeper's saves (game/src/goalie.js, reference/VERIFICA.md §9.2): shots from a grid of spots and
// charges, once with the dice roll forced to "save" and once to "must miss". With "save" the keeper must stop nearly
// every shot on target; with "must miss" nearly every one goes in. Prints which saves of the table were used.
// Fails on page errors, NaN, or rates out of range.
//   node tools/savetest.cjs [path/to/gioco.html] [screenshot-prefix]
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
  await page.evaluate(() => { window.__proto.menu.nav.clear(); window.__proto.startMatch({ kind: 'watch', humans: [], bindings: [], cpuLevel: 1 }); });
  await page.evaluate(() => {
    // one shot by team 0 from (x, z) after holding t seconds; force: 'save' | 'miss'
    window.__shoot = (x, z, hold, force, stopAtContact = false) => {
      const g = window.__proto.game;
      g.phase = 'play'; g.phaseTime = 0; g.clock = 999; g.superStrike = null; g.ball.superStrike = null;
      const p = g.players.find((q) => q.team === 0 && q.index === 2);
      for (const q of g.players) { q.setState('free'); q.stun = 0; q.speed = 0; if (q !== p && !q.isGoalie) q.pos.set(-15 + q.index, 0, -10 + q.index * 0.5); }
      const k = g.goalieOf(1); k.energy = 100;
      k.pos.copy(k.home); k.facing = Math.PI;
      for (let i = 0; i < 25; i++) { g.keeper.desiredPosition(k, k.pos); }
      p.pos.set(x, 0, z); p.facing = Math.atan2(-z, 20.6 - x); p.speed = 0;
      g.ball.reset(x, z); g.ball.owner = p; p.dribblePoint(g.ball.pos);
      const chance = g.shotMissChance;
      g.shotMissChance = () => (force === 'miss' ? 1 : 0); // the dice roll of shootBall
      g.startWindup(p, hold);
      const score0 = g.score[0];
      const out = { clip: null, other: null, w: 0, miss: null, result: 'wide', type: null };
      for (let i = 0; i < 50 * 4; i++) {
        g.fixedStep(0.02);
        if (k.state === 'dive' && !out.clip) { const d = k.stateData; out.clip = d.save.clip + (d.mirror ? ' M' : ''); out.type = d.save.type; out.other = d.other?.clip || null; out.w = +d.w.toFixed(2); out.miss = d.miss; out.id = d.save.id; }
        if (stopAtContact && k.state === 'dive' && k.stateData.resolved) { g.shotMissChance = chance; return out; }
        if (g.phase === 'goal') { out.result = 'goal'; break; }
        if (g.ball.owner === k) { out.result = 'catch'; break; }
        if (g.ball.lastTouch === k && g.ball.vel.length() > 0.5) { out.result = 'parry'; break; }
        if (g.ball.vel.length() < 1 && !g.ball.owner) break;
      }
      g.shotMissChance = chance;
      if (g.score[0] > score0 && out.result !== 'goal') out.result = 'goal';
      return out;
    };
  });
  const spots = [];
  for (const x of [5, 9, 12, 15]) for (const z of [-6, -2, 0, 3, 7]) for (const hold of [0.1, 0.4, 0.7]) spots.push([x, z, hold]);
  const run = async (force) => {
    const res = { save: 0, goal: 0, wide: 0, catch: 0, parry: 0, n: 0, clips: {} };
    for (const [x, z, hold] of spots) {
      const r = await page.evaluate(([x, z, hold, force]) => window.__shoot(x, z, hold, force), [x, z, hold, force]);
      res.n++;
      if (r.result === 'goal') res.goal++; else if (r.result === 'catch') { res.catch++; res.save++; } else if (r.result === 'parry') { res.parry++; res.save++; } else res.wide++;
      if (r.clip) res.clips[r.clip] = (res.clips[r.clip] || 0) + 1;
    }
    return res;
  };
  const saveRun = await run('save');
  const missRun = await run('miss');
  // a few dives frozen at the contact, for the eye
  if (shots) {
    let i = 0;
    for (const [x, z, hold] of [[12, -2, 0.7], [9, 6, 0.4], [14, 0, 0.1], [6, -5, 0.7]]) {
      const r = await page.evaluate(([x, z, hold]) => { const o = window.__shoot(x, z, hold, 'save', true); window.__proto.game.timeScale = 0; return o; }, [x, z, hold]);
      const where = await page.evaluate(() => {
        // the fixed steps above ran without drawing: put the clips at the dive's time before the picture
        const g = window.__proto.game, k = g.goalieOf(1), d = k.stateData, el = k.stateTime - d.t0;
        k.current.time = d.startA + el * d.rateA;
        if (k.blendAction) k.blendAction.time = d.startB + el * d.rateB;
        for (const a of Object.values(k.actions)) if (a !== k.current && a !== k.blendAction) a.stop();
        k.current.setEffectiveWeight(k.blendAction ? 1 - d.w : 1); if (k.blendAction) k.blendAction.setEffectiveWeight(d.w);
        k.mixer.update(0); k.prevPos.copy(k.pos); k.prevFacing = k.facing; g.ball.prevPos.copy(g.ball.pos);
        g.camTarget.set(k.pos.x - 3, 0, k.pos.z);
        const r = (v) => [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)];
        return { keeper: r(k.pos), ball: r(g.ball.pos), cross: r(d.cross.p) };
      });
      console.log('at contact', JSON.stringify(where));
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${shots}_dive${i++}.png` });
      console.log('dive', JSON.stringify(r));
      await page.evaluate(() => { window.__proto.game.timeScale = 1; });
    }
  }
  await browser.close();
  console.log(JSON.stringify({ save: saveRun, miss: missRun }));
  const onTarget = (r) => r.n - r.wide;
  if (saveRun.save < 0.8 * onTarget(saveRun)) errors.push(`forced save: only ${saveRun.save} of ${onTarget(saveRun)} shots on target saved`);
  if (missRun.goal < 0.8 * onTarget(missRun)) errors.push(`forced miss: only ${missRun.goal} of ${onTarget(missRun)} shots on target went in`);
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length ? 1 : 0);
})();
