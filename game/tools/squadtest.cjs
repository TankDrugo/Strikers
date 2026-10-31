// Headless check of team choice: quick play set-up (preset teams, line-up editor, captain), the match uses the
// chosen line-ups; cup detail with a custom line-up. Fails on page errors.
//   node tools/squadtest.cjs [path/to/gioco.html] [screenshot-prefix]
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
  const click = async (sel) => { await page.waitForSelector(sel, { timeout: 15000 }); await page.click(sel); await page.waitForTimeout(250); };
  const top = '.layer:last-child ';

  // quick play against the computer: third preset for us, line-up edited, captain moved
  await page.evaluate('window.__proto.menu.setTab(1)');
  await page.waitForTimeout(300);
  await click('[data-act="q-cpu"]');
  await click(top + '[data-opt="team0"]');
  await click(top + '[data-opt="team0"]');
  await shot('setup');
  await click(top + '[data-opt="edit0"]');
  await click(top + '[data-opt="s4"]'); // keeper → next character
  await click(top + '[data-opt="cap"]');
  await shot('lineup');
  await click(top + '[data-act="ok"]');
  const sides = await page.evaluate(() => window.__proto.menu.sides().map((s) => ({ ...s })));
  await click(top + '[data-act="go"]');
  await page.waitForTimeout(1500);
  await shot('match');
  const inMatch = await page.evaluate(() => {
    const g = window.__proto.game;
    return { teams: g.teams.map((t) => ({ ...t })), slots: [0, 1].map((tm) => g.players.filter((p) => p.team === tm).sort((a, b) => a.index - b.index).map((p) => p.charId)) };
  });
  if (sides[0].name !== 'Leggende') errors.push('preset not chosen: ' + sides[0].name);
  if (!sides[0].custom || sides[0].captain !== 0) errors.push('line-up edit lost: ' + JSON.stringify(sides[0]));
  if (JSON.stringify(inMatch.slots[0]) !== JSON.stringify(sides[0].slots)) errors.push('match slots ' + JSON.stringify(inMatch.slots[0]) + ' vs ' + JSON.stringify(sides[0].slots));
  if (inMatch.teams[0].captain !== 0) errors.push('captain not passed: ' + JSON.stringify(inMatch.teams[0]));
  await page.evaluate(() => { const g = window.__proto.game; for (let i = 0; i < 50 * 20; i++) g.fixedStep(0.02); });

  // cups: the same line-up is offered as our team
  await page.evaluate(() => window.__proto.showMenu());
  await page.waitForTimeout(300);
  await page.evaluate(() => { const m = window.__proto.menu; m.state = { mode: 'cups', tab: 2, sub: 0 }; m.renderHub(false); });
  await page.waitForTimeout(300);
  await click('[data-act="cup"][data-cup="c1"]');
  await shot('cup');
  await click(top + '[data-act="solo"]');
  const team = await page.evaluate(() => { const r = window.__proto.menu.sides && JSON.parse(localStorage.getItem('calcio-arcade-save')).profiles[0].cupRun; return r && r.teams[0]; });
  if (!team || JSON.stringify(team.slots) !== JSON.stringify(sides[0].slots)) errors.push('cup team: ' + JSON.stringify(team));
  await browser.close();
  console.log(JSON.stringify({ sides: sides.map((s) => [s.name, s.slots.join(','), s.captain]), match: inMatch.slots, cup: team && team.slots }));
  if (errors.length) console.log('errors:\n' + errors.slice(0, 15).join('\n'));
  process.exit(errors.length ? 1 : 0);
})();
