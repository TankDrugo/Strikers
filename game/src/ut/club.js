// Ultimate Team club of a profile: credits, cards, squad, packs, simulated market, Divisions, daily objectives,
// album. Pure rules (no DOM); every number comes from ultimate-team/data/economy.json (ECONOMIA.md).
// The club lives in the profile (save.js: profile.ultimate), the numbered register next to the profiles.
import { ECO, CATALOG, CARD, RANK, SPECIAL, CHARACTERS, cardsOf, tradable, value, hash } from './cards.js';

export const SLOTS = ['DIF', 'CEN', 'ALA', 'ATT', 'POR']; // game slots 0-3 fielders, 4 goalie
export const DIVISIONS = 10;
const DAY = 86400000;
export const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);
const pick = (list, rnd) => list[Math.floor(rnd() * list.length)];

export function newClub() {
  return { v: 1, started: false, credits: 0, cards: [], squad: [null, null, null, null, null], bench: new Array(ECO.start.benchSize).fill(null),
    album: {}, albumPaid: {}, pity: 0, packsOpened: 0, nextUid: 1,
    division: { div: 0, played: 0, pts: 0, w: 0, d: 0, l: 0, seasons: 0, best: 0, last: null },
    daily: { day: '', played: 0, won: 0, goals: 0, paid: [] }, market: { day: '', bought: [], listings: [], watch: [], log: [] } };
}

// The club of a profile, created (or repaired) on first use.
export function clubOf(profile) {
  const u = profile.ultimate;
  if (!u || !u.v) profile.ultimate = { ...newClub(), credits: u?.credits || 0 };
  const c = profile.ultimate, blank = newClub();
  for (const k of Object.keys(blank)) if (c[k] === undefined) c[k] = blank[k];
  return c;
}

export const inst = (club, uid) => club.cards.find((x) => x.uid === uid) || null;
export const cardOf = (club, uid) => { const i = inst(club, uid); return i ? CARD[i.id] : null; };

function addCard(club, id, serial = null) {
  const i = { uid: club.nextUid++, id, t: Date.now() };
  if (serial) i.serial = serial;
  club.cards.push(i);
  club.album[id] = true;
  return i;
}

// First visit: starting credits and the starter squad (economy.json "start").
export function startClub(club) {
  if (club.started) return [];
  club.started = true;
  club.credits += ECO.start.credits;
  const got = ECO.start.squad.map((char) => addCard(club, cardsOf(char)[0].id));
  got.forEach((g, i) => { club.squad[i] = g.uid; });
  return got;
}

// ---------------------------------------------------------------- packs

export const PACKS = Object.entries(ECO.packs).map(([id, p]) => ({ id, ...p }));

function drawRarity(pack, rnd) {
  let x = rnd();
  for (const [r, pr] of Object.entries(pack.special || {})) { if (x < pr) return r; x -= pr; }
  x = rnd();
  let acc = 0;
  const odds = Object.entries(pack.odds);
  for (const [r, pr] of odds) { acc += pr; if (x < acc) return r; }
  return odds[odds.length - 1][0];
}

// A card of that rarity: higher overalls are rarer inside a rarity (weight ×0.8 per point, like the simulator).
// Numbered: the next free serial of a star character; 1/1: only if nobody has it. Sold out: holo epic instead.
function drawCard(rarity, registry, rnd) {
  if (SPECIAL.includes(rarity)) {
    const pool = CATALOG.filter((c) => c.rarity === rarity).filter((c) => rarity === 'numbered'
      ? (registry.numbered[c.char] || []).length < ECO.rarities.numbered.copies : !registry.oneOfOne[c.char]);
    if (!pool.length) return drawCard('holoEpic', registry, rnd);
    const card = pick(pool, rnd);
    if (rarity === 'numbered') {
      const taken = registry.numbered[card.char] || (registry.numbered[card.char] = []);
      const free = [...Array(ECO.rarities.numbered.copies).keys()].map((i) => i + 1).filter((n) => !taken.includes(n));
      const serial = pick(free, rnd);
      taken.push(serial);
      return { card, serial };
    }
    registry.oneOfOne[card.char] = true;
    return { card, serial: 1 };
  }
  const pool = CATALOG.filter((c) => c.rarity === rarity);
  const min = Math.min(...pool.map((c) => c.ovr));
  const w = pool.map((c) => 0.8 ** (c.ovr - min));
  let x = rnd() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { if ((x -= w[i]) < 0) return { card: pool[i] }; }
  return { card: pool[pool.length - 1] };
}

// Buys and opens a pack: returns the cards, best first, each { card, inst, isNew }. null if credits are short.
export function buyPack(club, packId, registry, rnd = Math.random) {
  const pack = ECO.packs[packId];
  if (!pack || club.credits < pack.price) return null;
  club.credits -= pack.price;
  const rar = Array.from({ length: pack.cards }, () => drawRarity(pack, rnd));
  if (pack.guarantee && !rar.some((r) => RANK[r] >= RANK[pack.guarantee])) rar[0] = pack.guarantee;
  // soft protection only for holo in Premium Gold packs (never for numbered and 1/1)
  if (packId === 'premiumGold') {
    if (rar.some((r) => RANK[r] >= RANK.holo)) club.pity = 0;
    else if (++club.pity >= ECO.pity.holoEveryPremiumPacks) { rar[0] = 'holo'; club.pity = 0; }
  }
  const drawn = rar.map((r) => drawCard(r, registry, rnd));
  club.packsOpened++;
  return drawn.map(({ card, serial }) => {
    const isNew = !club.album[card.id];
    return { card, inst: addCard(club, card.id, serial), isNew };
  }).sort((a, b) => RANK[b.card.rarity] - RANK[a.card.rarity] || b.card.ovr - a.card.ovr);
}

// ---------------------------------------------------------------- squad

export const where = (club, uid) => club.squad.includes(uid) ? 'squad' : club.bench.includes(uid) ? 'bench' : 'club';
export const squadCards = (club) => club.squad.map((u) => cardOf(club, u));
export const squadComplete = (club) => club.squad.every((u) => u && inst(club, u));
export function squadRating(club) {
  const l = squadCards(club).filter(Boolean);
  return l.length ? Math.round(l.reduce((a, c) => a + c.ovr, 0) / SLOTS.length) : 0;
}

// Goalkeepers only in goal, outfield players anywhere in the four outfield slots, a character only once on the pitch.
export function canPlace(club, slot, uid) {
  const c = cardOf(club, uid);
  if (!c || c.gk !== (slot === 4)) return false;
  return !club.squad.some((u, i) => u && i !== slot && cardOf(club, u)?.char === c.char);
}

// Puts a card in a squad slot; the card that was there goes where the new one came from (bench or club).
export function place(club, slot, uid) {
  if (!canPlace(club, slot, uid)) return false;
  const old = club.squad[slot], b = club.bench.indexOf(uid), s = club.squad.indexOf(uid);
  if (s >= 0) club.squad[s] = old;
  else if (b >= 0) club.bench[b] = old;
  club.squad[slot] = uid;
  return true;
}

export function toBench(club, uid) {
  if (where(club, uid) !== 'club') return false;
  const free = club.bench.indexOf(null);
  if (free < 0) return false;
  club.bench[free] = uid;
  return true;
}
export function fromBench(club, uid) { const b = club.bench.indexOf(uid); if (b < 0) return false; club.bench[b] = null; return true; }

// Best squad from the whole club: strongest goalkeeper, then the four strongest different outfield characters.
export function autoSquad(club) {
  const byOvr = club.cards.map((i) => ({ i, c: CARD[i.id] })).sort((a, b) => b.c.ovr - a.c.ovr);
  const gk = byOvr.find((x) => x.c.gk);
  const used = new Set(gk ? [gk.c.char] : []), out = [];
  for (const x of byOvr) if (!x.c.gk && !used.has(x.c.char) && out.length < 4) { used.add(x.c.char); out.push(x.i.uid); }
  const order = [...out].sort((a, b) => SLOTS.indexOf(cardOf(club, a).role) - SLOTS.indexOf(cardOf(club, b).role));
  club.squad = [order[0] || null, order[1] || null, order[2] || null, order[3] || null, gk ? gk.i.uid : null];
  club.bench = club.bench.map((u) => (u && club.squad.includes(u) ? null : u));
}

// Quick sell: only cards outside the squad, never numbered or 1/1 (economy.json: quickSell 0).
export function quickSellValue(card) { return ECO.rarities[card.rarity]?.quickSell || 0; }
export function quickSell(club, uid) {
  const c = cardOf(club, uid);
  if (!c || where(club, uid) === 'squad' || !quickSellValue(c) || club.market.listings.some((l) => l.uid === uid)) return 0;
  fromBench(club, uid);
  club.cards = club.cards.filter((x) => x.uid !== uid);
  club.credits += quickSellValue(c);
  return quickSellValue(c);
}

// ---------------------------------------------------------------- simulated market

const OFFERS_PER_DAY = 14;
// CPU traders' offers today: cards worth a market (gold and up, no numbered), at 110-160 % of their value.
export function offers(club, profileId, now = Date.now()) {
  const day = today(now);
  if (club.market.day !== day) { club.market.day = day; club.market.bought = []; }
  const pool = CATALOG.filter((c) => tradable(c.rarity));
  const weight = (c) => ({ gold: 10, goldRare: 6, holo: 1.2, holoRare: 0.35, holoEpic: 0.1 }[c.rarity] || 0);
  const total = pool.reduce((a, c) => a + weight(c), 0);
  const out = [];
  for (let i = 0; i < OFFERS_PER_DAY; i++) {
    let x = hash(`${profileId}:${day}:o${i}`) * total, card = pool[0];
    for (const c of pool) { if ((x -= weight(c)) < 0) { card = c; break; } }
    const [lo, hi] = ECO.market.buyNowMarkup;
    const price = Math.round(value(card, day) * (lo + hash(`${profileId}:${day}:p${i}`) * (hi - lo)) / 10) * 10;
    out.push({ idx: i, card, price, sold: club.market.bought.includes(i) });
  }
  return out;
}

export function buyOffer(club, profileId, idx) {
  const o = offers(club, profileId).find((x) => x.idx === idx);
  if (!o || o.sold || club.credits < o.price) return null;
  club.credits -= o.price;
  club.market.bought.push(idx);
  return addCard(club, o.card.id);
}

// Selling: the CPU buyers pay around 35 % of the value. At that price a card sells in about 2 hours; asking more
// takes longer, up to 3 days, and above about twice that the card does not sell. Tax 5 %.
export function fair(card, now = Date.now()) { return Math.round(value(card, today(now)) * ECO.market.cpuBuyerShare / 10) * 10; }
export function fillDays(card, price, now = Date.now()) {
  const r = price / Math.max(1, fair(card, now));
  if (r > 2.2) return null;
  const [a, b] = ECO.market.sellDaysToFill;
  return a + (b - a) * Math.max(0, Math.min(1, (r - 1) / 1.2));
}
export function listCard(club, uid, price, now = Date.now()) {
  const c = cardOf(club, uid);
  if (!c || !tradable(c.rarity) || where(club, uid) === 'squad' || club.market.listings.some((l) => l.uid === uid)) return false;
  fromBench(club, uid);
  const d = fillDays(c, price, now);
  club.market.listings.push({ uid, id: c.id, price, listedAt: now, fillAt: d === null ? null : now + d * DAY });
  return true;
}
export function cancelListing(club, uid) { club.market.listings = club.market.listings.filter((l) => l.uid !== uid); }
// Settles the listings whose time has come; returns what was sold.
export function settleMarket(club, now = Date.now()) {
  const sold = club.market.listings.filter((l) => l.fillAt !== null && l.fillAt <= now);
  for (const l of sold) {
    const got = Math.round(l.price * (1 - ECO.market.tax));
    club.credits += got;
    club.cards = club.cards.filter((x) => x.uid !== l.uid);
    club.market.log.unshift({ id: l.id, price: l.price, got, t: l.fillAt });
  }
  club.market.log = club.market.log.slice(0, 10);
  club.market.listings = club.market.listings.filter((l) => !sold.includes(l));
  return sold;
}
export function toggleWatch(club, id) {
  const w = club.market.watch;
  const i = w.indexOf(id);
  if (i >= 0) w.splice(i, 1); else w.push(id);
}

// ---------------------------------------------------------------- Divisions

// div 0 = Division 10 … 9 = Division 1. CPU strength 58 in Division 10, 94 in Division 1 (ECONOMIA.md).
export const divName = (div) => DIVISIONS - div;
export const cpuRating = (div) => 58 + 4 * div;
export const cpuLevel = (div) => Math.min(3, div * 0.3); // the AI also gets sharper up the ladder

const UT_TEAMS = ['Bulloni Volanti', 'Officina 42', 'Circuiti Ribelli', 'Laser Lampo', 'Ingranaggi FC', 'Robot Riuniti', 'Chiave a Stella',
  'Saldatori', 'Turbina United', 'Megavolt', 'Placche Madri', 'Satellite Club', 'Pistoni Pazzi', 'Nanobot', 'Plasma Rosso', 'Antenna Blu'];
const UT_COLORS = ['#ff3d6e', '#ff7b1c', '#ffd21f', '#41c24a', '#2bc0ff', '#ff4fd8', '#31d6c2', '#f5e2b8'];

// The next opponent: one card per slot, as close as possible to the division's strength; same every time until played.
export function opponent(club, profileId) {
  const d = club.division, seed = `${profileId}:${d.seasons}:${d.played}`;
  const target = cpuRating(d.div);
  const used = new Set(), slots = [], stats = [], cards = [];
  SLOTS.forEach((role, s) => {
    const pool = CATALOG.filter((c) => c.gk === (s === 4) && !used.has(c.char) && !SPECIAL.includes(c.rarity))
      .sort((a, b) => Math.abs(a.ovr - target) - Math.abs(b.ovr - target) || hash(seed + a.id) - hash(seed + b.id));
    const near = pool.filter((c) => Math.abs(c.ovr - target) <= Math.abs(pool[0].ovr - target) + 2);
    const c = near[Math.floor(hash(seed + role) * near.length)];
    used.add(c.char); slots.push(c.char); stats.push(c.stats); cards.push(c.id);
  });
  return { name: UT_TEAMS[Math.floor(hash(seed + 'n') * UT_TEAMS.length)], color: UT_COLORS[Math.floor(hash(seed + 'c') * UT_COLORS.length)],
    slots, stats, cards, rating: target };
}

// After a Divisions match: credits (× division), season points, promotion or relegation after 10 matches.
export function divisionResult(club, my, their) {
  const e = ECO.earnings, d = club.division, mult = e.divisionMultiplier[d.div];
  const res = my > their ? 'win' : my < their ? 'loss' : 'draw';
  const parts = [[res, Math.round(e.division[res] * mult)]];
  if (my) parts.push(['goals', my * e.division.perGoal]);
  if (!their) parts.push(['cleanSheet', e.division.cleanSheet]);
  d.played++; d.pts += res === 'win' ? 3 : res === 'draw' ? 1 : 0;
  d[res === 'win' ? 'w' : res === 'draw' ? 'd' : 'l']++;
  let season = null;
  if (d.played >= e.seasonMatches) {
    const reward = e.seasonReward[d.div];
    parts.push(['season', reward]);
    const move = d.pts >= e.promotePoints ? 1 : d.pts < e.holdPoints ? -1 : 0;
    season = { pts: d.pts, from: d.div, move };
    d.div = Math.max(0, Math.min(DIVISIONS - 1, d.div + move));
    d.best = Math.max(d.best, d.div);
    d.seasons++; d.played = 0; d.pts = 0; d.w = 0; d.d = 0; d.l = 0;
  }
  const total = parts.reduce((a, [, v]) => a + v, 0);
  club.credits += total;
  d.last = { my, their, res };
  const daily = trackDaily(club, { played: 1, won: res === 'win' ? 1 : 0, goals: my });
  return { res, parts, total, season, daily };
}

// ---------------------------------------------------------------- daily objectives (3 × 400 credits)

export function daily(club, now = Date.now()) {
  const day = today(now);
  if (club.daily.day !== day) club.daily = { day, played: 0, won: 0, goals: 0, paid: [] };
  return ECO.dailyList.map((o, i) => ({ ...o, have: Math.min(o.n, club.daily[o.what]), done: club.daily.paid.includes(i) }));
}
function trackDaily(club, add) {
  daily(club);
  for (const k in add) club.daily[k] += add[k];
  const paid = [];
  ECO.dailyList.forEach((o, i) => {
    if (!club.daily.paid.includes(i) && club.daily[o.what] >= o.n) { club.daily.paid.push(i); club.credits += ECO.earnings.dailyObjectives.credits; paid.push(o.id); }
  });
  return paid;
}

// ---------------------------------------------------------------- album

// One page per character: every version; the page is complete with all versions except numbered and 1/1.
export function albumPage(club, char) {
  const all = cardsOf(char), need = all.filter((c) => !SPECIAL.includes(c.rarity));
  return { char, all, found: all.filter((c) => club.album[c.id]).length, complete: need.every((c) => club.album[c.id]), need: need.length };
}
// Pays the page and album rewards not yet paid; returns [[kind, char, credits]].
export function albumRewards(club) {
  const out = [];
  for (const ch of CHARACTERS) {
    const pg = albumPage(club, ch);
    if (club.albumPaid[ch] || !pg.complete) continue;
    // a page with a single version (bronze and silver characters) counts for the album but pays nothing
    club.albumPaid[ch] = true;
    if (pg.need > 1) { club.credits += ECO.album.page; out.push(['page', ch, ECO.album.page]); }
  }
  if (!club.albumPaid.__all && CHARACTERS.every((ch) => club.albumPaid[ch])) { club.albumPaid.__all = true; club.credits += ECO.album.all; out.push(['all', null, ECO.album.all]); }
  return out;
}

// Line-up for a match: characters and stats by slot (main.js withLineups).
export function lineup(club, name, color) {
  const cards = squadCards(club);
  return { name, color, slots: cards.map((c) => c.char), stats: cards.map((c) => c.stats) };
}
