// Ultimate Team card catalogue (ultimate-team/DESIGN.md): one base card per character, tier from its overall,
// and the variants of the gold characters (gold rare, three holo levels, numbered 1-10 and the 1/1 for the 85+).
// Numbers come from ultimate-team/data/cards.json and economy.json; nothing here is tuned by hand.
import DATA from '../../../ultimate-team/data/cards.json' with { type: 'json' };
import ECO from '../../../ultimate-team/data/economy.json' with { type: 'json' };

export { ECO };
export const RARITIES = ['bronze', 'silver', 'gold', 'goldRare', 'holo', 'holoRare', 'holoEpic', 'numbered', 'oneOfOne'];
export const RANK = Object.fromEntries(RARITIES.map((r, i) => [r, i]));
export const SPECIAL = ['numbered', 'oneOfOne'];
const HOLO_FX = { holo: ['h-rainbow', 'h-glitter'], holoRare: ['h-lava'], holoEpic: ['h-prism', 'h-galaxy'] };
export const STAT_KEYS = { fielder: ['vel', 'tir', 'pas', 'con'], goalie: ['par', 'rif', 'usc', 'vel'] };

const weights = DATA.weights;
const ovrOf = (role, stats) => Math.round(Object.entries(weights[role]).reduce((a, [k, w]) => a + stats[k] * w, 0));
const tierOf = (ovr) => (ovr >= DATA.tiers.gold ? 'gold' : ovr >= DATA.tiers.silver ? 'silver' : 'bronze');

// Every card that exists: id = "<character>:<rarity>".
export const CATALOG = [];
export const CHARACTERS = Object.keys(DATA.characters);
CHARACTERS.forEach((char, ci) => {
  const c = DATA.characters[char];
  const baseOvr = ovrOf(c.role, c.stats);
  const tier = tierOf(baseOvr);
  const rarities = tier === 'gold' ? ['gold', 'goldRare', 'holo', 'holoRare', 'holoEpic'] : [tier];
  if (baseOvr >= ECO.rarities.numbered.minBaseOvr) rarities.push('numbered', 'oneOfOne');
  for (const rarity of rarities) {
    const bonus = rarity === 'goldRare' ? 2 : ECO.rarities[rarity]?.ovrBonus || 0; // gold rare: +2 like tools/economy_sim.py
    const stats = Object.fromEntries(Object.entries(c.stats).map(([k, v]) => [k, Math.min(99, v + bonus)]));
    const fx = HOLO_FX[rarity] ? HOLO_FX[rarity][ci % HOLO_FX[rarity].length] : '';
    CATALOG.push({ id: `${char}:${rarity}`, char, role: c.role, gk: c.role === 'POR', rarity, baseOvr, ovr: ovrOf(c.role, stats), stats, fx });
  }
});
export const CARD = Object.fromEntries(CATALOG.map((c) => [c.id, c]));
export const cardsOf = (char) => CATALOG.filter((c) => c.char === char);
export const tradable = (rarity) => ECO.rarities[rarity]?.tradable !== false && !!ECO.market.basePrice[rarity];

// Market value of a card today: base price of the rarity, +8 % per point above the rarity's average, and a daily
// drift within ±15 % (ECONOMIA.md, Mercato simulato).
const avgOvr = {};
for (const r of RARITIES) { const l = CATALOG.filter((c) => c.rarity === r); if (l.length) avgOvr[r] = l.reduce((a, c) => a + c.ovr, 0) / l.length; }
export function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
export function value(card, day) {
  const base = ECO.market.basePrice[card.rarity];
  if (!base) return 0;
  const drift = 1 + (hash(card.id + ':' + day) * 2 - 1) * 0.15;
  return Math.max(50, Math.round(base * (1 + ECO.market.ovrPriceFactorPerPoint * (card.ovr - avgOvr[card.rarity])) * drift / 10) * 10);
}
