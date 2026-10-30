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
  // result: 'won' | 'drawn' | 'lost'
  addResult(result) {
    const p = this.active(); if (!p) return;
    p.record.played++; p.record[result]++; store();
  },
};
