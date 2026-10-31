// Star objectives: three per cup match, drawn from a pool (Normal or Hard) with a seed, so the same match always
// asks the same things. Each one looks at the match facts the tracker collects and answers
// 'done', 'failed' or 'pending'; at full time pending ones are settled. Stars count only if the match is won.
import { rng } from './cups.js';

// f = facts (see Tracker), me = human team index. live(f) during the match, end(f) at full time.
const POOL = {
  normal: [
    { id: 'win2', live: () => 'pending', end: (f) => f.diff >= 2 },
    { id: 'first', live: (f) => f.firstGoal === null ? 'pending' : f.firstGoal === f.me ? 'done' : 'failed' },
    { id: 'perfect1', live: (f) => f.perfectGoals >= 1 ? 'done' : 'pending' },
    { id: 'early', live: (f) => f.firstOwnGoalAt !== null && f.firstOwnGoalAt <= 60 ? 'done' : f.elapsed > 60 ? 'failed' : 'pending' },
    { id: 'shots3h', live: (f) => f.shotsFirstHalf >= 3 ? 'done' : f.elapsed > f.length / 2 ? 'failed' : 'pending' },
    { id: 'steals3', live: (f) => f.steals >= 3 ? 'done' : 'pending' },
    { id: 'scorers2', live: (f) => f.scorers.size >= 2 ? 'done' : 'pending' },
    { id: 'chain4', live: (f) => f.bestChainGoal >= 4 ? 'done' : 'pending' },
    { id: 'concede1', live: (f) => f.conceded >= 2 ? 'failed' : 'pending', end: (f) => f.conceded <= 1 },
    { id: 'deke', live: (f) => f.dekeGoals >= 1 ? 'done' : 'pending' },
    { id: 'saves2', live: (f) => f.saves >= 2 ? 'done' : 'pending' },
    { id: 'goals3', live: (f) => f.goals >= 3 ? 'done' : 'pending' },
  ],
  hard: [
    { id: 'clean', live: (f) => f.conceded > 0 ? 'failed' : 'pending', end: (f) => f.conceded === 0 },
    { id: 'win4', live: () => 'pending', end: (f) => f.diff >= 4 },
    { id: 'perfect2', live: (f) => f.perfectGoals >= 2 ? 'done' : 'pending' },
    { id: 'comeback', live: () => 'pending', end: (f) => f.wasBehind && f.diff > 0 },
    { id: 'last10', live: (f) => f.lateGoal ? 'done' : 'pending' },
    { id: 'scorers3', live: (f) => f.scorers.size >= 3 ? 'done' : 'pending' },
    { id: 'chain6', live: (f) => f.bestChainGoal >= 6 ? 'done' : 'pending' },
    { id: 'noShotsH1', live: (f) => f.oppShotsFirstHalf > 0 ? 'failed' : f.elapsed > f.length / 2 ? 'done' : 'pending' },
    { id: 'hattrick', live: (f) => Math.max(0, ...f.goalsBy.values()) >= 3 ? 'done' : 'pending' },
    { id: 'noTurbo', live: (f) => f.turbo ? 'failed' : 'pending', end: (f) => !f.turbo },
    { id: 'steals5', live: (f) => f.steals >= 5 ? 'done' : 'pending' },
    { id: 'goals5', live: (f) => f.goals >= 5 ? 'done' : 'pending' },
  ],
};

export function drawObjectives(level, seed) {
  const r = rng(seed), pool = [...POOL[level]], out = [];
  while (out.length < 3) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0].id);
  return out;
}

const DEF = Object.fromEntries([...POOL.normal, ...POOL.hard].map((o) => [o.id, o]));

// Collects facts from game events (Game.onEvent) for one human team.
export class Tracker {
  constructor(game, me, ids) {
    this.ids = ids; this.game = game;
    this.f = {
      me, length: game.clock, elapsed: 0, goals: 0, conceded: 0, diff: 0, firstGoal: null, firstOwnGoalAt: null,
      perfectGoals: 0, dekeGoals: 0, shotsFirstHalf: 0, oppShotsFirstHalf: 0, steals: 0, saves: 0,
      scorers: new Set(), goalsBy: new Map(), bestChainGoal: 0, wasBehind: false, lateGoal: false, turbo: false,
    };
    this.status = ids.map(() => 'pending');
    this.onChange = null;
  }

  event(type, d) {
    const f = this.f, g = this.game;
    f.elapsed = f.length - Math.max(0, g.clock);
    const firstHalf = !g.golden && f.elapsed < f.length / 2;
    if (type === 'goal') {
      if (f.firstGoal === null) f.firstGoal = d.team;
      if (d.team === f.me) {
        f.goals++;
        if (f.firstOwnGoalAt === null) f.firstOwnGoalAt = f.elapsed;
        if (d.perfect) f.perfectGoals++;
        if (d.afterDeke) f.dekeGoals++;
        if (d.scorer) { f.scorers.add(d.scorer); f.goalsBy.set(d.scorer, (f.goalsBy.get(d.scorer) || 0) + 1); }
        f.bestChainGoal = Math.max(f.bestChainGoal, d.chain || 0);
        if (!g.golden && g.clock <= 10) f.lateGoal = true;
      } else f.conceded++;
      f.diff = f.goals - f.conceded;
      if (f.diff < 0) f.wasBehind = true;
    } else if (type === 'shot') {
      if (firstHalf) { if (d.team === f.me) f.shotsFirstHalf++; else f.oppShotsFirstHalf++; }
    } else if (type === 'steal') { if (d.team === f.me) f.steals++; }
    else if (type === 'save') { if (d.team === f.me) f.saves++; }
    else if (type === 'turbo') { if (d.team === f.me) f.turbo = true; }
    this.refresh();
  }

  tick() { this.f.elapsed = this.f.length - Math.max(0, this.game.clock); this.refresh(); }

  refresh() {
    this.ids.forEach((id, i) => {
      if (this.status[i] !== 'pending') return;
      const s = DEF[id].live(this.f);
      if (s !== 'pending') { this.status[i] = s; this.onChange && this.onChange(i, s); }
    });
  }

  // At full time: settle pending objectives. Returns the stars earned (0 if the match was lost).
  finish(won) {
    this.ids.forEach((id, i) => {
      if (this.status[i] !== 'pending') return;
      const end = DEF[id].end;
      this.status[i] = end ? (end(this.f) ? 'done' : 'failed') : 'failed';
    });
    return won ? this.status.filter((s) => s === 'done').length : 0;
  }
}
