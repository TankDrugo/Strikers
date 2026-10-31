// Profiles and progress. Today they live in the browser (localStorage); later a private server will hold
// them too. Everything goes through this module, so only this file changes then.

const KEY = 'calcio-arcade-save';
const VERSION = 1;

function blank() { return { version: VERSION, lang: null, activeId: null, profiles: [] }; }

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const d = JSON.parse(raw);
    return d && d.version === VERSION && Array.isArray(d.profiles) ? d : blank();
  } catch { return blank(); }
}

function store() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private window or storage off: progress lasts this session only */ }
}

export const PROFILE_COLORS = ['#ff3d6e', '#ff7b1c', '#ffd21f', '#41c24a', '#2bc0ff', '#8a4dff'];

export const save = {
  get lang() { return data.lang; },
  set lang(l) { data.lang = l; store(); },
  profiles() { return data.profiles; },
  active() { return data.profiles.find((p) => p.id === data.activeId) || null; },
  select(id) { data.activeId = id; const p = this.active(); if (p) p.lastPlayed = Date.now(); store(); },
  create(name, color) {
    const p = {
      id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
      name, color, created: Date.now(), lastPlayed: Date.now(),
      record: { played: 0, won: 0, drawn: 0, lost: 0 },
      cups: {},            // per cup: best grade, stars (stage 3)
      ultimate: { credits: 0, cards: [] }, // stage 4
    };
    data.profiles.push(p); data.activeId = p.id; store();
    return p;
  },
  remove(id) {
    data.profiles = data.profiles.filter((p) => p.id !== id);
    if (data.activeId === id) data.activeId = null;
    store();
  },
  byId(id) { return data.profiles.find((p) => p.id === id) || null; },
  // Ultimate Team numbered cards and 1/1s are unique in the whole game: until the private server exists,
  // "the whole game" is every profile in this browser, so the register sits next to the profiles.
  registry() { return data.registry || (data.registry = { numbered: {}, oneOfOne: {} }); },
  store,
  // Cups: per profile and cup { normalWon, hardWon, stars: { normal: { round: best }, hard: {…} } }
  cupRecord(profileId, cupId) {
    const p = this.byId(profileId); if (!p) return null;
    p.cups = p.cups || {};
    return p.cups[cupId] || (p.cups[cupId] = { normalWon: false, hardWon: false, stars: { normal: {}, hard: {} } });
  },
  addStars(profileId, cupId, level, round, stars) {
    const r = this.cupRecord(profileId, cupId); if (!r) return;
    r.stars[level][round] = Math.max(r.stars[level][round] || 0, stars); store();
  },
  cupWon(profileId, cupId, level) {
    const r = this.cupRecord(profileId, cupId); if (!r) return;
    r[level === 'hard' ? 'hardWon' : 'normalWon'] = true; store();
  },
  // the single-player cup in progress, so "Continua la coppa" works after closing the game
  run(profileId) { return this.byId(profileId)?.cupRun || null; },
  setRun(profileId, run) { const p = this.byId(profileId); if (p) { p.cupRun = run; store(); } },
  // result: 'won' | 'drawn' | 'lost'
  addResult(result, profileId = data.activeId) {
    const p = this.byId(profileId); if (!p) return;
    p.record.played++; p.record[result]++; store();
  },
};
