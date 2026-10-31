// Ultimate Team rules: collection, credits, packs, squad, match rewards, CPU opponents.
// Pure logic (no DOM, no three.js), so the rules in DESIGN.md live in one place.
import { CARDS, RARITIES } from '../data/cards.js';

export { CARDS, RARITIES };
export const byId = Object.fromEntries(CARDS.map((c) => [c.id, c]));
export const rarityOf = (id) => RARITIES.find((r) => r.id === id);
export const RARITY_RANK = Object.fromEntries(RARITIES.map((r, i) => [r.id, i]));

// Squad slots: the game's team slots (0-3 fielders, 4 goalie). The label is where the card lines up.
export const SLOTS = [
  { label: 'DIF', gk: false }, { label: 'CEN', gk: false }, { label: 'ALA', gk: false }, { label: 'ATT', gk: false }, { label: 'POR', gk: true },
];

export const START_CREDITS = 800;
export const QUICK_SELL = { bronzo: 60, argento: 200, oro: 600, informa: 1800, icona: 4000 };
export const REWARDS = { win: 500, draw: 300, loss: 150, perGoal: 40, cleanSheet: 100 };

// weights: chance of each rarity for every card; guarantee: the best card is at least this rarity
export const PACKS = [
  { id: 'bronzo', name: 'Pacchetto Bronzo', price: 400, cards: 3, weights: { bronzo: 80, argento: 18, oro: 2 } },
  { id: 'argento', name: 'Pacchetto Argento', price: 1200, cards: 3, guarantee: 'argento', weights: { bronzo: 30, argento: 60, oro: 9, informa: 1 } },
  { id: 'oro', name: 'Pacchetto Oro', price: 3000, cards: 3, guarantee: 'oro', weights: { argento: 40, oro: 52, informa: 7, icona: 1 } },
  { id: 'campioni', name: 'Pacchetto Campioni', price: 7500, cards: 5, guarantee: 'oro', weights: { oro: 70, informa: 22, icona: 8 } },
];

export function newSave() {
  return { v: 1, credits: START_CREDITS, owned: {}, squad: [null, null, null, null, null], starter: false,
    record: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 }, packsOpened: 0, created: Date.now() };
}

// Accepts whatever was stored (older or damaged saves) and returns a valid save.
export function normalize(s) {
  const base = newSave();
  if (!s || typeof s !== 'object') return base;
  const out = { ...base, ...s, record: { ...base.record, ...(s.record || {}) } };
  out.owned = {};
  for (const [id, n] of Object.entries(s.owned || {})) if (byId[id] && n > 0) out.owned[id] = Math.floor(n);
  out.squad = SLOTS.map((slot, i) => {
    const id = (s.squad || [])[i];
    return id && out.owned[id] && byId[id].gk === slot.gk ? id : null;
  });
  out.credits = Math.max(0, Math.floor(+out.credits || 0));
  return out;
}

function pickWeighted(weights, rnd) {
  const entries = Object.entries(weights);
  let r = rnd() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of entries) { if ((r -= w) < 0) return k; }
  return entries[entries.length - 1][0];
}
const pickCard = (rarity, rnd, filter = () => true) => {
  const pool = CARDS.filter((c) => c.rarity === rarity && filter(c));
  return pool[Math.floor(rnd() * pool.length)];
};

// Opens a pack: returns the cards drawn, best first. Does not change the save (see buyPack).
export function drawPack(pack, rnd = Math.random) {
  const rarities = Array.from({ length: pack.cards }, () => pickWeighted(pack.weights, rnd));
  if (pack.guarantee && !rarities.some((r) => RARITY_RANK[r] >= RARITY_RANK[pack.guarantee])) rarities[0] = pack.guarantee;
  return rarities.map((r) => pickCard(r, rnd)).sort((a, b) => b.ovr - a.ovr);
}

// Free welcome pack: one bronze card for every slot, so the first squad is complete.
export function starterCards(rnd = Math.random) {
  return SLOTS.map((slot) => pickCard('bronzo', rnd, (c) => c.role === slot.label));
}

export function addCards(save, cards) {
  for (const c of cards) save.owned[c.id] = (save.owned[c.id] || 0) + 1;
  // empty slots fill themselves with the best fitting new card
  autoFill(save, false);
}

export function buyPack(save, packId, rnd = Math.random) {
  const pack = PACKS.find((p) => p.id === packId);
  if (!pack || save.credits < pack.price) return null;
  save.credits -= pack.price;
  const cards = drawPack(pack, rnd);
  addCards(save, cards);
  save.packsOpened++;
  return cards;
}

export function claimStarter(save, rnd = Math.random) {
  if (save.starter) return null;
  const cards = starterCards(rnd);
  save.starter = true;
  addCards(save, cards);
  return cards;
}

// copies of a card that are not in the squad (the squad keeps one)
export function spare(save, id) { return (save.owned[id] || 0) - (save.squad.includes(id) ? 1 : 0); }

export function quickSell(save, id) {
  if (spare(save, id) <= 0) return 0;
  const value = QUICK_SELL[byId[id].rarity];
  save.owned[id]--;
  if (!save.owned[id]) delete save.owned[id];
  save.credits += value;
  return value;
}

// Can card `id` go in `slot`? Goalies only in goal, and the same character only once in the squad.
export function canPlace(save, slot, id) {
  const c = byId[id];
  if (!c || !save.owned[id] || c.gk !== SLOTS[slot].gk) return false;
  return !save.squad.some((other, i) => other && i !== slot && byId[other].char === c.char);
}

export function place(save, slot, id) {
  if (!canPlace(save, slot, id)) return false;
  save.squad[slot] = id;
  return true;
}

// Fills empty slots (or all, with replace) with the best owned cards, preferring the matching role.
export function autoFill(save, replace = true) {
  if (replace) save.squad = [null, null, null, null, null];
  const order = [4, 3, 2, 1, 0];
  for (const slot of order) {
    if (save.squad[slot]) continue;
    const options = Object.keys(save.owned).filter((id) => canPlace(save, slot, id))
      .sort((a, b) => (byId[b].role === SLOTS[slot].label) - (byId[a].role === SLOTS[slot].label) || byId[b].ovr - byId[a].ovr);
    if (options.length) save.squad[slot] = options[0];
  }
}

export const squadComplete = (save) => save.squad.every(Boolean);
export const squadRating = (ids) => {
  const list = ids.filter(Boolean).map((id) => byId[id].ovr);
  return list.length ? Math.round(list.reduce((a, b) => a + b, 0) / 5) : 0;
};

// Lineup for game.js: [{ char, stats }] by slot.
export const lineup = (ids) => ids.map((id) => ({ char: byId[id].char, stats: byId[id].stats, card: id }));

const OPPONENT_NAMES = ['Fulmini', 'Tempesta', 'Vulcani', 'Comete', 'Squali', 'Lupi', 'Meteore', 'Uragani', 'Falchi', 'Draghi'];
const OPPONENT_COLORS = ['#ff6b4a', '#ffb02e', '#c86bff', '#ff4f9a', '#f2f2f2', '#ffd23f'];

// CPU squad near the player's rating (a little stronger on average), one card per role.
export function opponent(save, rnd = Math.random) {
  const target = squadRating(save.squad) + Math.round(rnd() * 6 - 2);
  const ids = [];
  for (const slot of SLOTS) {
    const used = new Set(ids.map((id) => byId[id].char));
    const pool = CARDS.filter((c) => c.role === slot.label && !used.has(c.char))
      .sort((a, b) => Math.abs(a.ovr - target) - Math.abs(b.ovr - target) || rnd() - 0.5);
    const near = pool.filter((c) => Math.abs(c.ovr - target) <= Math.abs(pool[0].ovr - target) + 3);
    ids.push(near[Math.floor(rnd() * near.length)].id);
  }
  return { name: OPPONENT_NAMES[Math.floor(rnd() * OPPONENT_NAMES.length)], color: OPPONENT_COLORS[Math.floor(rnd() * OPPONENT_COLORS.length)], squad: ids };
}

// Credits for a finished match (my = goals scored, their = goals conceded).
export function reward(my, their) {
  const result = my > their ? 'win' : my < their ? 'loss' : 'draw';
  const parts = [[result === 'win' ? 'Vittoria' : result === 'draw' ? 'Pareggio' : 'Sconfitta', REWARDS[result]]];
  if (my) parts.push([`Gol segnati (${my})`, my * REWARDS.perGoal]);
  if (!their) parts.push(['Porta inviolata', REWARDS.cleanSheet]);
  return { result, parts, total: parts.reduce((a, [, v]) => a + v, 0) };
}

export function applyMatch(save, my, their) {
  const r = reward(my, their);
  save.credits += r.total;
  const rec = save.record;
  rec.played++; rec.goalsFor += my; rec.goalsAgainst += their;
  rec[r.result === 'win' ? 'won' : r.result === 'draw' ? 'drawn' : 'lost']++;
  return r;
}
