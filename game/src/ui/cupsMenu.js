// Cup screens (stage 3): cup list with grades, cup detail, tournament with friends and private tournament set-up,
// bracket (LB/RB through the rounds), pre-match with the star objectives, result, trophy. Installed on Menu.
import { el } from './nav.js';
import { t } from './i18n.js';
import { save } from './save.js';
import { CUPS, cupById, cpuTeams, baseTeams, makeBracket, nextRound, simulate, roundKey, progress, grade, unlocked, rng } from '../cups/cups.js';
import { drawObjectives } from '../cups/objectives.js';
import { cloneLineup, presetLineup, lineupLabel, sidesColors } from './squads.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cupName = (run) => run.cupId ? t('cups.' + run.cupId) : t('cup.private');
const teamName = (tm) => tm.human ? `${esc(tm.name)} <small>(${esc(tm.human.name)})</small>` : esc(tm.name);
const roundName = (run, r) => t('cup.r.' + roundKey({ rounds: run.rounds }, r));
const starsTxt = (n, max = 3) => '★'.repeat(n) + '☆'.repeat(Math.max(0, max - n));

export function installCups(Menu) {
  const P = Menu.prototype;

  P.cupColors = function (cup) { const c = cup ? cup.colors : ['#8a4dff', '#ff7b1c', '#ffd21f']; return `--m1:${c[0]};--m2:${c[1]};--m3:${c[2]}`; };

  // ---------------------------------------------------------------- hub views

  P.cupsView = function () {
    const p = save.active();
    return `<div class="view" style="grid-template-columns:repeat(4,1fr)">${CUPS.map((c, i) => {
      const rec = p.cups?.[c.id], pct = progress(c, rec), g = grade(pct, rec), open = unlocked(i, p.cups);
      const stars = rec ? Object.values(rec.stars.normal).reduce((a, b) => a + b, 0) + Object.values(rec.stars.hard).reduce((a, b) => a + b, 0) : 0;
      return `<button class="tile${open ? '' : ' locked'}" data-nav data-act="cup" data-cup="${c.id}" style="${this.cupColors(c)}">
        ${open ? '' : `<span class="soon-tag">${t('cup.locked')}</span>`}<span class="big" style="margin-top:.6em">${open ? g : '🔒'}</span>
        <h3>${t('cups.' + c.id)}</h3><p>${t('cups.' + c.id + 't')} · ${t('cups.matches', { n: c.rounds })}</p>
        <p>${t('cup.complete', { n: pct })} · ${t('cup.stars', { n: stars, max: c.rounds * 6 })}</p></button>`;
    }).join('')}</div>`;
  };

  P.privateView = function () {
    return `<div class="view" style="grid-template-columns:1fr 1fr">
      <button class="tile" data-nav data-act="private"><h3>${t('cup.private')}</h3><p>${t('cup.privateHint')}</p><span class="big" style="margin-top:auto">2–4</span></button>
      <button class="tile" data-nav data-act="friendsCup"><h3>${t('cup.friends')}</h3><p>${t('cup.friendsHint')}</p><span class="big" style="margin-top:auto">🏆</span></button></div>`;
  };

  P.trophiesView = function () {
    const p = save.active();
    return `<div class="view" style="grid-template-columns:repeat(4,1fr)">${CUPS.map((c) => {
      const rec = p.cups?.[c.id], pct = progress(c, rec), g = grade(pct, rec), won = rec?.normalWon;
      const metal = !won ? '' : g === 'Z' ? 'filter:drop-shadow(0 0 .4em #fff) hue-rotate(160deg) saturate(2)' : rec.hardWon ? '' : 'filter:grayscale(.6)';
      return `<div class="tile${won ? '' : ' locked'}" data-nav tabindex="-1" style="${this.cupColors(c)}">
        <span class="big" style="${won ? metal : 'opacity:.25'}">🏆</span><h3>${t('cups.' + c.id)}</h3>
        <p>${won ? `${t('cup.grade')} ${g} · ${pct}%` : t('cups.noTrophy')}</p>${won ? `<p>${rec.hardWon ? t('cup.hard') : t('cup.normal')}</p>` : ''}</div>`;
    }).join('')}</div>`;
  };

  // ---------------------------------------------------------------- cup detail

  P.showCupDetail = function (cupId) {
    const cup = cupById(cupId), idx = CUPS.indexOf(cup), p = save.active();
    if (!unlocked(idx, p.cups)) { this.toastLayer(t('cup.lockedHint')); return; }
    const rec = save.cupRecord(p.id, cupId), pct = progress(cup, rec);
    const st = { level: rec.normalWon ? 'hard' : 'normal', lineup: cloneLineup(this.sides()[0]) };
    const run = save.run(p.id);
    const hasRun = run && run.cupId === cupId;
    const rows = () => {
      const lv = st.level === 'hard' ? t('cup.hard') : t('cup.normal');
      return `<button class="opt-row" data-nav data-opt="level"><span class="lbl">${t('cup.level')}</span><span class="val"><span class="arrow">◀</span>${lv}<span class="arrow">▶</span></span></button>
        <button class="opt-row" data-nav data-opt="squad"><span class="lbl">${t('cup.yourTeam')}</span><span class="val"><span class="arrow">◀</span>${lineupLabel(st.lineup)}<span class="arrow">▶</span></span></button>
        <button class="opt-row" data-nav data-opt="edit"><span class="lbl">${t('setup.lineup')}</span><span class="val">${t('setup.lineupEdit')} <span class="btnA" style="margin-left:.4em">A</span></span></button>
        <p class="err" id="cerr" style="min-height:0"></p>`;
    };
    const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
    const l = this.layer('dim', `<div class="center"><div class="panel" style="${this.cupColors(cup)}">
      <h1 class="title" style="color:var(--m3)">${t('cups.' + cupId)}</h1>
      <p class="sub">${t('cups.' + cupId + 't')} · ${t('cups.matches', { n: cup.rounds })} · ${t('cup.grade')} <b>${grade(pct, rec)}</b> · ${t('cup.complete', { n: pct })}</p>
      <div class="keys" style="grid-template-columns:auto 1fr"><b>${t('cup.normal')}</b><span>${rec.normalWon ? t('cup.won') : t('cup.notWon')} · ${starsTxt(sum(rec.stars.normal), cup.rounds * 3)}</span>
        <b>${t('cup.hard')}</b><span>${rec.normalWon ? `${rec.hardWon ? t('cup.won') : t('cup.notWon')} · ${starsTxt(sum(rec.stars.hard), cup.rounds * 3)}` : t('cup.hardLocked')}</span></div>
      <div class="grid" id="rows">${rows()}</div>
      <div class="row-btns">${hasRun ? `<button class="btn primary" data-nav data-act="continue" data-autofocus>${t('cup.continue')}</button>` : ''}
        <button class="btn${hasRun ? '' : ' primary'}" data-nav data-act="solo">${hasRun ? t('cup.restart') : t('cup.solo')}</button>
        <button class="btn" data-nav data-act="friends">${t('cup.friends')}</button><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      onMove: (dx, dy, cur) => { if (!dx || !cur || !cur.dataset.opt || cur.dataset.opt === 'edit') return false; change(cur.dataset.opt, dx); return true; },
      act: (a) => {
        if (a === 'back') return this.nav.pop(l);
        if (a === 'continue') { this.nav.pop(l); return this.showBracket(run); }
        if (a === 'solo') {
          this.nav.pop(l);
          const r = this.createRun({ cup, level: st.level, humans: [{ profileId: p.id, name: p.name, color: p.color, lineup: st.lineup }] });
          save.setRun(p.id, r);
          return this.showBracket(r);
        }
        if (a === 'friends') { this.nav.pop(l); this.showTournamentSetup(cup, st.level); }
      },
      onBack: () => this.nav.pop(l),
    });
    const change = (k, d = 1) => {
      if (k === 'edit') { this.showLineup(st.lineup, (lu) => { st.lineup = lu; this.sides()[0] = cloneLineup(lu); l.el.querySelector('#rows').innerHTML = rows(); this.nav.focus(l.el.querySelector('[data-opt="edit"]'), false); }); return; }
      if (k === 'level') { if (!rec.normalWon) { l.el.querySelector('#cerr').textContent = t('cup.hardLocked'); return; } st.level = st.level === 'hard' ? 'normal' : 'hard'; }
      if (k === 'squad') { st.lineup = this.cyclePreset(st.lineup, d); this.sides()[0] = cloneLineup(st.lineup); }
      this.sfx('tab');
      l.el.querySelector('#rows').innerHTML = rows();
      this.nav.focus(l.el.querySelector(`[data-opt="${k}"]`), false);
    };
    l.el.querySelector('#rows').addEventListener('click', (e) => { const r = e.target.closest('[data-opt]'); if (r) change(r.dataset.opt); });
    this.nav.push(l);
  };

  P.toastLayer = function (text) {
    const l = this.layer('dim', `<div class="center"><div class="panel" style="width:min(30em,100%)"><p class="sub" style="font-size:1.2em">${text}</p>
      <div class="row-btns"><button class="btn" data-nav data-act="ok">OK</button></div></div></div>`, { act: () => this.nav.pop(l), onBack: () => this.nav.pop(l) });
    this.nav.push(l);
  };

  // ---------------------------------------------------------------- tournament set-up (cup with friends, or private)

  P.showTournamentSetup = function (cup, level = 'normal') {
    const profiles = save.profiles(), me = save.active();
    const st = { n: 2, size: 8, seconds: this.setup.seconds, cpuLevel: this.setup.cpuLevel,
      players: [0, 1, 2, 3].map((i) => ({ who: i === 0 ? profiles.indexOf(me) : -1 - i, lineup: presetLineup(this.roster, i) })) };
    // who >= 0: profile index; who < 0: guest number -who
    const whoName = (w) => w >= 0 ? profiles[w].name : t('cup.guest', { n: -w });
    const cycleWho = (w, d) => { const opts = [...profiles.keys(), -1, -2, -3, -4]; return opts[(opts.indexOf(w) + d + opts.length) % opts.length]; };
    const row = (k, lbl, val) => `<button class="opt-row" data-nav data-opt="${k}"><span class="lbl">${lbl}</span><span class="val"><span class="arrow">◀</span>${val}<span class="arrow">▶</span></span></button>`;
    const rows = () => [
      row('n', t('cup.players'), st.n),
      ...st.players.slice(0, st.n).flatMap((pl, i) => [row('who' + i, `${t('cup.player', { n: i + 1 })} · ${t('cup.profile')}`, esc(whoName(pl.who))), row('squad' + i, `${t('cup.player', { n: i + 1 })} · ${t('cup.team')}`, lineupLabel(pl.lineup)),
        `<button class="opt-row" data-nav data-opt="edit${i}"><span class="lbl">${t('cup.player', { n: i + 1 })} · ${t('setup.lineup')}</span><span class="val">${t('setup.lineupEdit')} <span class="btnA" style="margin-left:.4em">A</span></span></button>`]),
      ...(cup ? [] : [row('size', t('cup.size'), st.size), row('time', t('setup.time'), t('setup.minutes', { n: st.seconds / 60 })), row('cpu', t('setup.cpu'), [t('setup.easy'), t('setup.normal'), t('setup.hard')][st.cpuLevel])]),
    ].join('') + '<p class="err" id="terr" style="min-height:0"></p>';
    const l = this.layer('dim', `<div class="center"><div class="panel" style="${this.cupColors(cup)}">
      <h1 class="title" style="color:var(--m3)">${cup ? t('cups.' + cup.id) : t('cup.private')}</h1>
      <p class="sub">${cup ? `${t('cup.friendsHint')} ${t('cup.level')}: <b>${level === 'hard' ? t('cup.hard') : t('cup.normal')}</b>` : t('cup.privateHint')}</p>
      <div class="grid" id="rows" style="gap:.5em">${rows()}</div>
      <div class="row-btns"><button class="btn primary" data-nav data-act="go">${t('setup.go')}</button><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      onMove: (dx, dy, cur) => { if (!dx || !cur || !cur.dataset.opt || cur.dataset.opt.startsWith('edit')) return false; change(cur.dataset.opt, dx); return true; },
      act: (a) => {
        if (a === 'back') return this.nav.pop(l);
        const used = st.players.slice(0, st.n).map((p) => p.who).filter((w) => w >= 0);
        if (new Set(used).size !== used.length) { l.el.querySelector('#terr').textContent = t('cup.sameProfile'); return; }
        this.showJoin(st.n, l, (devices) => {
          const humans = st.players.slice(0, st.n).map((pl) => {
            const prof = pl.who >= 0 ? profiles[pl.who] : null;
            return { profileId: prof ? prof.id : null, name: whoName(pl.who), color: prof ? prof.color : '#ffffff', lineup: pl.lineup };
          });
          const run = this.createRun({ cup, level, humans, size: st.size, seconds: st.seconds, cpuLevel: st.cpuLevel });
          run.bindings = devices.map((d) => d === 'kb' ? { device: 'kb' } : { device: 'pad', index: +d.slice(3) });
          run.devices = devices;
          this.tRun = run;
          this.nav.pop(l);
          this.showBracket(run);
        });
      },
      onBack: () => this.nav.pop(l),
    });
    const change = (k, d) => {
      if (k.startsWith('edit')) {
        const p = st.players[+k.slice(4)];
        this.showLineup(p.lineup, (lu) => { p.lineup = lu; l.el.querySelector('#rows').innerHTML = rows(); this.nav.focus(l.el.querySelector(`[data-opt="${k}"]`), false); });
        return;
      }
      if (k === 'n') st.n = Math.min(4, Math.max(2, st.n + d));
      else if (k.startsWith('who')) { const p = st.players[+k.slice(3)]; p.who = cycleWho(p.who, d); }
      else if (k.startsWith('squad')) { const p = st.players[+k.slice(5)]; p.lineup = this.cyclePreset(p.lineup, d); }
      else if (k === 'size') { const o = [4, 8, 16]; st.size = o[(o.indexOf(st.size) + d + 3) % 3]; }
      else if (k === 'time') { const o = [120, 180, 300]; st.seconds = o[(o.indexOf(st.seconds) + d + 3) % 3]; }
      else if (k === 'cpu') st.cpuLevel = (st.cpuLevel + d + 3) % 3;
      if (st.size < st.n * 2) st.size = st.n <= 2 ? 4 : 8;
      this.sfx('tab');
      l.el.querySelector('#rows').innerHTML = rows();
      this.nav.focus(l.el.querySelector(`[data-opt="${k}"]`), false);
    };
    l.el.querySelector('#rows').addEventListener('click', (e) => { const r = e.target.closest('[data-opt]'); if (r) change(r.dataset.opt, 1); });
    this.nav.push(l);
  };

  // ---------------------------------------------------------------- run

  P.createRun = function ({ cup, level = 'normal', humans, size = 8, seconds = 180, cpuLevel = 1 }) {
    const rounds = cup ? cup.rounds : Math.round(Math.log2(size));
    const n = 2 ** rounds, seed = `${cup ? cup.id : 'p'}-${level}-${Date.now()}`;
    const squads = baseTeams(this.roster);
    // h.lineup: chosen in the set-up (presets or custom); h.squad: runs saved before line-ups existed
    const teams = humans.map((h, i) => ({ ...(h.lineup ? { name: h.lineup.name, color: h.lineup.color, slots: [...h.lineup.slots], captain: h.lineup.captain, rating: 1.1 } : squads[h.squad]), human: { ...h, slot: i } }));
    teams.push(...cpuTeams(this.roster, cup ? cup.teamsKey : 'race', n - humans.length, cup ? cup.id : seed));
    return { cupId: cup ? cup.id : null, level, rounds, seconds, cpuLevel, teams, bracket: makeBracket(n, humans.map((_, i) => i), seed), seed, view: 0 };
  };

  P.persist = function (run) { if (!run.bindings && run.teams[0].human?.profileId) save.setRun(run.teams[0].human.profileId, run); };

  // next match with a human in the current round, or null after simulating the CPU-only ones
  P.advance = function (run) {
    for (;;) {
      const r = run.bracket.length - 1, round = run.bracket[r];
      const i = round.findIndex((m) => m.winner === null && (run.teams[m.a].human || run.teams[m.b].human));
      if (i >= 0) return { r, i };
      const rr = rng(run.seed + r);
      for (const m of round) if (m.winner === null) { const s = simulate(run.teams[m.a], run.teams[m.b], rr); m.score = s.score; m.winner = s.winner === 0 ? m.a : m.b; }
      if (!nextRound(run.bracket)) return null; // final played
    }
  };

  P.showBracket = function (run) {
    this.nav.clear(); this.hub = null;
    const cup = run.cupId ? cupById(run.cupId) : null;
    run.view = run.bracket.length - 1;
    const l = this.layer('hub', `<div class="bg"></div><div class="hub-ui">
        <div class="bar"><div class="crumb"></div><div class="tabs"></div><div></div></div>
        <div class="stage"></div><div class="row-btns" id="bb"></div><div class="footer"></div></div>`, {
      onTab: (d) => { run.view = Math.max(0, Math.min(run.rounds - 1, run.view + d)); paint(); },
      onBack: () => this.leaveBracket(run),
      act: (a) => { if (a === 'next') this.playNext(run); if (a === 'leave') this.leaveBracket(run); },
    });
    l.el.style.cssText = this.cupColors(cup);
    const paint = () => {
      l.el.querySelector('.crumb').innerHTML = `<span class="mode-tag">${cupName(run)}${run.cupId ? ` · ${run.level === 'hard' ? t('cup.hard') : t('cup.normal')}` : ''}</span>`;
      l.el.querySelector('.tabs').innerHTML = `<button class="shoulder">LB</button>${[...Array(run.rounds).keys()].map((r) => `<button class="tab${r === run.view ? ' on' : ''}" style="${r >= run.bracket.length ? 'opacity:.3' : ''}">${roundName(run, r)}</button>`).join('')}<button class="shoulder">RB</button>`;
      const round = run.bracket[run.view];
      const cols = round ? Math.min(4, Math.max(1, Math.ceil(round.length / 4))) : 1;
      l.el.querySelector('.stage').innerHTML = `<div class="view" style="grid-template-columns:repeat(${cols},1fr);align-content:start;overflow:auto">${round ? round.map((m) => {
        const A = run.teams[m.a], B = run.teams[m.b], wa = m.winner === m.a, wb = m.winner === m.b;
        return `<div class="match"><span class="${wa ? 'w' : wb ? 'l' : ''}" style="${A.human ? `border-left:.35em solid ${A.human.color};padding-left:.3em` : ''}">${teamName(A)}</span>
          <b class="sc">${m.score ? `${m.score[0]} – ${m.score[1]}` : t('cup.vs')}</b>
          <span class="${wb ? 'w' : wa ? 'l' : ''}" style="text-align:right;${B.human ? `border-right:.35em solid ${B.human.color};padding-right:.3em` : ''}">${teamName(B)}</span></div>`;
      }).join('') : `<div class="tile locked"><h3>${roundName(run, run.view)}</h3><p>–</p></div>`}</div>`;
      l.el.querySelector('#bb').innerHTML = `<button class="btn primary" data-nav data-act="next" data-autofocus>${t('cup.next')}</button><button class="btn" data-nav data-act="leave">${run.bindings ? t('cup.quitT') : t('cup.save')}</button>`;
      l.el.querySelector('.footer').innerHTML = `<span><span class="btnA">A</span>${t('foot.select')}</span><span><span class="btnB">B</span>${t('foot.back')}</span><span><span class="btnLR">LB</span><span class="btnLR">RB</span>${t('cup.rounds')}</span>`;
      l.focused = null; this.nav.focusFirst();
    };
    this.bracketLayer = l;
    this.nav.push(l);
    paint();
    l.repaint = paint;
  };

  P.leaveBracket = function (run) {
    if (run.bindings) this.tRun = null; else this.persist(run);
    this.nav.clear();
    this.state = { mode: 'cups', tab: 2, sub: run.cupId ? 0 : 1 };
    this.showHub();
  };

  P.playNext = function (run) {
    const nx = this.advance(run);
    this.persist(run);
    if (!nx) return this.finishRun(run);
    const m = run.bracket[nx.r][nx.i], A = run.teams[m.a], B = run.teams[m.b];
    const cup = run.cupId ? cupById(run.cupId) : null;
    const duel = A.human && B.human;
    const human = A.human ? A : B;
    const ids = duel ? null : drawObjectives(run.level, `${run.cupId || 'p'}-${run.level}-${nx.r}-${human.human.slot}`);
    const devName = (slot) => { const d = run.devices?.[slot]; return !d ? '' : d === 'kb' ? t('join.keyboard') : t('join.pad', { n: +d.slice(3) + 1 }); };
    const who = [A, B].filter((x) => x.human).map((x) => `<b>${esc(x.human.name)}</b>${run.devices ? ` <small>(${t('cup.playsWith', { dev: devName(x.human.slot) })})</small>` : ''}`).join(' · ');
    const l = this.layer('dim', `<div class="center"><div class="panel" style="${this.cupColors(cup)}">
      <p class="sub" style="font-family:var(--fn)">${cupName(run)} · ${roundName(run, nx.r)}</p>
      <h1 class="title" style="font-size:2em;color:var(--m3)">${teamName(A)} ${t('cup.vs')} ${teamName(B)}</h1>
      ${run.devices ? `<p class="sub">${who}</p>` : ''}
      ${duel ? `<p class="sub" style="font-weight:800">${t('cup.duel')}</p>` : `<h3 style="font-family:var(--fd);font-weight:400;font-size:1.4em;margin:0">${t('cup.objectives')}</h3>
        <div class="grid" style="gap:.4em">${ids.map((id) => `<div class="obj">☆ ${t('obj.' + id)}</div>`).join('')}</div><p class="sub">${t('cup.objHint')}</p>`}
      <div class="row-btns"><button class="btn primary" data-nav data-act="go" data-autofocus>${t('cup.kickoff')}</button><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div></div></div>`, {
      act: (a) => {
        if (a === 'back') return this.nav.pop(l);
        this.nav.clear(); this.hub = null;
        const humans = [], bindings = [], objectives = [];
        [A, B].forEach((tm, side) => {
          if (!tm.human) return;
          bindings.push(run.bindings ? { ...run.bindings[tm.human.slot], ctrl: humans.length } : { device: 'any', ctrl: 0 });
          humans.push(side);
          if (ids) objectives.push({ team: side, ids });
        });
        const final = nx.r === run.rounds - 1;
        this.onStart({
          kind: 'cup', humans, bindings, seconds: run.seconds, knockout: true, objectives,
          cpuLevel: cup ? cup.cpu[run.level] + (final ? 0.5 : 0) : run.cpuLevel,
          lineups: sidesColors(...[A, B].map((tm) => ({ name: tm.name, color: tm.color, slots: tm.slots, captain: tm.captain }))),
          onFinish: (res) => this.afterCupMatch(run, nx, res),
          onQuit: () => this.showBracket(run),
        });
      },
      onBack: () => this.nav.pop(l),
    });
    this.nav.push(l);
  };

  // res: { score, winner (side), golden, decided, trackers: [{ team, ids, status, stars }] }
  P.afterCupMatch = function (run, nx, res) {
    const m = run.bracket[nx.r][nx.i], sides = [m.a, m.b];
    m.score = res.score; m.winner = sides[res.winner];
    const cup = run.cupId ? cupById(run.cupId) : null;
    for (const tr of res.trackers) {
      const h = run.teams[sides[tr.team]].human;
      if (cup && h.profileId && tr.stars > 0) save.addStars(h.profileId, cup.id, run.level, nx.r, tr.stars);
    }
    const humansLeft = () => run.teams.some((tm, i) => tm.human && !run.bracket.some((rd) => rd.some((mm) => mm.winner !== null && (mm.a === i || mm.b === i) && mm.winner !== i)));
    const winnerTeam = run.teams[m.winner];
    const lostHuman = run.teams[sides[1 - res.winner]].human;
    this.persist(run);
    const lines = res.trackers.map((tr) => `<div class="grid" style="gap:.3em">${tr.ids.map((id, i) => `<div class="obj ${tr.status[i]}">${tr.status[i] === 'done' ? '★' : '✗'} ${t('obj.' + id)}</div>`).join('')}</div>
      <p class="sub" style="font-family:var(--fd);font-size:2em;color:var(--m1)">${starsTxt(tr.stars)}</p>`).join('');
    const single = !run.bindings;
    const out = single && lostHuman;
    const title = winnerTeam.human ? (single ? t('cup.matchWon') : `${esc(winnerTeam.human.name)}: ${t('cup.matchWon')}`) : t('cup.matchLost');
    const note = res.decided ? `<p class="sub">${t('cup.decided')}</p>` : res.golden ? `<p class="sub">${t('cup.golden')}</p>` : '';
    const l = this.layer('', `<div class="bg"></div><div class="center"><div class="panel">
      <h1 class="title">${title}</h1><p class="sub" style="font-size:1.3em"><b>${teamName(run.teams[m.a])} ${res.score[0]} – ${res.score[1]} ${teamName(run.teams[m.b])}</b></p>${note}${lines}
      <div class="row-btns">${out ? `<button class="btn primary" data-nav data-act="retry" data-autofocus>${t('cup.retry')}</button><button class="btn" data-nav data-act="menu">${t('cup.toMenu')}</button>`
        : `<button class="btn primary" data-nav data-act="on" data-autofocus>${t('cup.goOn')}</button>`}</div></div></div>`, {
      act: (a) => {
        if (a === 'retry') {
          const h = run.teams.find((tm) => tm.human).human;
          const r = this.createRun({ cup, level: run.level, humans: [h] }); save.setRun(h.profileId, r); return this.showBracket(r);
        }
        if (a === 'menu') { save.setRun(run.teams[0].human.profileId, null); this.leaveBracket({ ...run, bindings: true }); return; }
        if (!humansLeft()) { this.advanceAll(run); return this.finishRun(run); }
        const nxt = this.advance(run); this.persist(run);
        if (!nxt) return this.finishRun(run);
        this.showBracket(run);
      },
      onBack: () => {},
    });
    l.el.style.cssText = this.cupColors(cup);
    this.nav.clear(); this.nav.push(l);
  };

  // no humans left: play out the rest of the bracket
  P.advanceAll = function (run) { this.advance(run); };

  P.finishRun = function (run) {
    const final = run.bracket[run.rounds - 1]?.[0];
    const champ = final && final.winner !== null ? run.teams[final.winner] : null;
    const cup = run.cupId ? cupById(run.cupId) : null;
    let extra = '';
    if (champ?.human && cup && champ.human.profileId) {
      save.cupWon(champ.human.profileId, cup.id, run.level);
      const rec = save.cupRecord(champ.human.profileId, cup.id), pct = progress(cup, rec);
      extra = `<p class="sub">${t('cup.trophy')}</p><p class="sub" style="font-size:1.3em"><b>${t('cup.newGrade', { g: grade(pct, rec), n: pct })}</b></p>`;
    }
    if (!run.bindings) save.setRun(run.teams[0].human.profileId, null);
    const title = champ?.human ? t('cup.winnerIs', { name: esc(champ.human.name) }) : champ ? t('cup.cpuWins', { name: esc(champ.name) }) : t('cup.allOut');
    const l = this.layer('', `<div class="bg"></div><div class="center"><div class="panel" style="text-align:center;align-items:center">
      <span style="font-size:6em;line-height:1;${champ?.human ? '' : 'filter:grayscale(1);opacity:.4'}" class="trophy">🏆</span>
      <h1 class="title" style="transform:none">${title}</h1><p class="sub">${cupName(run)}</p>${extra}
      <div class="row-btns"><button class="btn primary" data-nav data-act="ok" data-autofocus>${t('cup.toMenu')}</button></div></div></div>`, {
      act: () => { this.tRun = null; this.leaveBracket({ ...run, bindings: true }); },
      onBack: () => {},
    });
    l.el.style.cssText = this.cupColors(cup);
    this.nav.clear(); this.nav.push(l);
    if (champ?.human) this.sfx('enter');
  };
}
