// Squads for quick play and cups: the preset teams of game/assets/roster.json ("teams" with "teamInfo", then the
// extra "squads") and the line-up editor (any character in any slot, no one twice, captain among the four
// fielders). A line-up is { name, color, slots: [defender, midfielder, winger, striker, keeper], captain: 0-3 }.
import { t } from './i18n.js';

const ROLE = ['DIF', 'CEN', 'ALA', 'ATT', 'POR'];
const ALT_COLORS = ['#ff7b1c', '#ff3d6e', '#8a4dff', '#ffd21f', '#2bc0ff'];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function presets(roster) {
  const base = roster.teams.map((slots, i) => ({ name: roster.teamInfo?.[i]?.name || `${i + 1}`, color: roster.teamInfo?.[i]?.color || '#ffffff', slots: [...slots], captain: 3 }));
  const extra = (roster.squads || []).map((s) => ({ name: s.name, color: s.color, slots: [...s.slots], captain: s.captain ?? 3 }));
  return [...base, ...extra];
}

export const cloneLineup = (l) => ({ name: l.name, color: l.color, slots: [...l.slots], captain: l.captain ?? 3, preset: l.preset, custom: !!l.custom });

export function presetLineup(roster, i) {
  const all = presets(roster);
  const k = ((i % all.length) + all.length) % all.length;
  return { ...cloneLineup(all[k]), preset: k, custom: false };
}

// the two sides must not wear the same colour
export function sidesColors(a, b) {
  if (a.color.toLowerCase() !== b.color.toLowerCase()) return [a, b];
  return [a, { ...b, color: ALT_COLORS.find((c) => c.toLowerCase() !== a.color.toLowerCase()) }];
}

export const charName = (id) => { const s = t('ut.char.' + id); return s === 'ut.char.' + id ? id : s; };
export const lineupLabel = (l) => esc(l.name) + (l.custom ? ` <small>(${t('lineup.custom')})</small>` : '');

export function installSquads(Menu) {
  const P = Menu.prototype;

  // ◀ ▶ on a team row: next preset (a custom line-up goes back to the presets)
  P.cyclePreset = function (lineup, d) {
    return presetLineup(this.roster, (lineup.preset ?? 0) + d);
  };

  // Line-up editor: one row per slot (◀ ▶ changes the character, swapping if it is already in the team) and the captain.
  P.showLineup = function (lineup, done) {
    const ids = this.roster.characters.map((c) => c.id);
    const st = cloneLineup(lineup);
    const pic = (id, gk) => { const src = this.portrait ? this.portrait(id, gk) : null; return src ? `<img src="${src}" alt="" style="height:2.3em;width:2.5em;object-fit:contain;flex:none;margin:-.3em 0">` : ''; };
    const rows = () => st.slots.map((id, s) => `<button class="opt-row" data-nav data-opt="s${s}" style="padding:.25em .9em">
        <span class="lbl">${t('ut.roleLong.' + ROLE[s])}${s === st.captain ? ' <b style="color:var(--sun)">©</b>' : ''}</span>
        <span class="val" style="display:flex;align-items:center;gap:.5em"><span class="arrow">◀</span>${pic(id, s === 4)}${esc(charName(id))}<span class="arrow">▶</span></span></button>`).join('')
      + `<button class="opt-row" data-nav data-opt="cap" style="padding:.25em .9em"><span class="lbl">${t('lineup.captain')}</span><span class="val"><span class="arrow">◀</span>${esc(charName(st.slots[st.captain]))}<span class="arrow">▶</span></span></button>`;
    const l = this.layer('dim', `<div class="center"><div class="panel" style="gap:.6em">
      <h1 class="title">${t('lineup.title')}</h1><p class="sub">${esc(st.name)} · ${t('lineup.hint')}</p>
      <div class="grid" id="rows" style="gap:.4em">${rows()}</div>
      <div class="row-btns"><button class="btn primary" data-nav data-act="ok">${t('lineup.done')}</button><button class="btn" data-nav data-act="back">${t('foot.back')}</button></div>
      <div class="footer" style="color:var(--ink);-webkit-text-stroke:0"><span><span class="btnLR">◀</span><span class="btnLR">▶</span>${t('foot.change')}</span><span><span class="btnB">B</span>${t('foot.back')}</span></div></div></div>`, {
      onMove: (dx, dy, cur) => { if (!dx || !cur || !cur.dataset.opt) return false; change(cur.dataset.opt, dx); return true; },
      act: (a) => {
        if (a === 'back') return this.nav.pop(l);
        this.nav.pop(l);
        const same = lineup.slots.every((id, i) => id === st.slots[i]);
        done({ ...st, custom: lineup.custom || !same });
      },
      onBack: () => this.nav.pop(l),
    });
    const change = (k, d) => {
      if (k === 'cap') st.captain = (st.captain + d + 4) % 4;
      else {
        const s = +k.slice(1), cur = st.slots[s];
        const next = ids[(ids.indexOf(cur) + d + ids.length) % ids.length];
        const other = st.slots.indexOf(next);
        if (other >= 0) st.slots[other] = cur; // already in the team: swap places
        st.slots[s] = next;
      }
      this.sfx('tab');
      l.el.querySelector('#rows').innerHTML = rows();
      this.nav.focus(l.el.querySelector(`[data-opt="${k}"]`), false);
    };
    l.el.querySelector('#rows').addEventListener('click', (e) => { const r = e.target.closest('[data-opt]'); if (r) change(r.dataset.opt, 1); });
    this.nav.push(l);
  };
}
