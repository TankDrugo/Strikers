// Menu navigation for keyboard and every connected controller, EA FC style:
// LB / RB (keyboard Q / E) switch tabs, d-pad / stick / arrows move between [data-nav] items by position,
// A / Enter confirm, B / Esc go back. Menus are stacked "layers"; only the top one listens.
import { readPads, padPressed, PAD } from '../input.js';

// layer = { el, onBack(), onTab(dir), onMove(dir, el) -> true if handled, onRaw(device, what) -> true if handled,
//           onText(ch), textEntry, onShow() }
export class UiNav {
  constructor(root) {
    this.root = root;
    this.layers = [];
    this.prev = {};
    this.repeat = 0;
    this.held = false;
    this.onSound = null;
    addEventListener('keydown', (e) => this.keydown(e));
    root.addEventListener('pointerover', (e) => {
      const it = e.target.closest('[data-nav]');
      if (it && this.top && this.top.el.contains(it)) this.focus(it, false);
    });
  }

  get top() { return this.layers[this.layers.length - 1] || null; }
  get active() { return this.layers.length > 0; }

  push(layer) {
    this.layers.push(layer);
    this.root.appendChild(layer.el);
    layer.el.classList.add('layer-in');
    this.focusFirst();
    return layer;
  }

  pop(layer = this.top) {
    const i = this.layers.indexOf(layer);
    if (i < 0) return;
    this.layers.splice(i, 1);
    layer.el.remove();
    if (this.top) { this.top.onShow && this.top.onShow(); this.refocus(); }
  }

  clear() { while (this.layers.length) this.pop(); }

  items() { return this.top ? [...this.top.el.querySelectorAll('[data-nav]')].filter((e) => !e.disabled && e.offsetParent !== null) : []; }

  focus(el, sound = true) {
    if (!el || !this.top) return;
    for (const e of this.top.el.querySelectorAll('.focus')) e.classList.remove('focus');
    el.classList.add('focus');
    this.top.focused = el;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (sound && this.onSound) this.onSound('move');
  }

  focusFirst() {
    const it = this.items();
    const pref = it.find((e) => e.dataset.autofocus !== undefined) || it[0];
    if (pref) this.focus(pref, false);
  }

  refocus() {
    const f = this.top && this.top.focused;
    if (f && f.isConnected && this.top.el.contains(f)) this.focus(f, false); else this.focusFirst();
  }

  // Move to the nearest item in direction (dx, dy): distance along the direction plus double the sideways offset.
  move(dx, dy) {
    const top = this.top; if (!top) return;
    const cur = top.focused && top.focused.isConnected ? top.focused : null;
    if (top.onMove && top.onMove(dx, dy, cur)) return;
    const it = this.items(); if (!it.length) return;
    if (!cur) { this.focus(it[0]); return; }
    const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bs = Infinity;
    for (const e of it) {
      if (e === cur) continue;
      const q = e.getBoundingClientRect();
      // nearest edge distance along the axis, centre offset across it
      const along = dx ? (dx > 0 ? q.left - r.right : r.left - q.right) : (dy > 0 ? q.top - r.bottom : r.top - q.bottom);
      const ex = q.left + q.width / 2, ey = q.top + q.height / 2;
      const ahead = dx ? (ex - cx) * dx > 4 : (ey - cy) * dy > 4;
      if (!ahead) continue;
      const across = dx ? Math.abs(ey - cy) : Math.abs(ex - cx);
      const s = Math.max(0, along) + across * 2;
      if (s < bs) { bs = s; best = e; }
    }
    if (best) this.focus(best);
  }

  confirm() {
    const f = this.top && this.top.focused;
    if (f && f.isConnected) { if (this.onSound) this.onSound('ok'); f.click(); }
  }

  back() { const top = this.top; if (top && top.onBack) { if (this.onSound) this.onSound('back'); top.onBack(); } }
  tab(dir) { const top = this.top; if (top && top.onTab) { if (this.onSound) this.onSound('tab'); top.onTab(dir); } }

  keydown(e) {
    const top = this.top; if (!top) return;
    const k = e.key.toLowerCase();
    if (top.onRaw && (k === 'enter' || k === 'escape') && top.onRaw('kb', k === 'enter' ? 'confirm' : 'back')) { e.preventDefault(); return; }
    if (top.textEntry) {
      if (k.length === 1 && /[\p{L}\p{N} ._-]/u.test(e.key)) { top.onText(e.key); e.preventDefault(); return; }
      if (k === 'backspace') { top.onText('\b'); e.preventDefault(); return; }
    }
    const typing = top.textEntry;
    const map = {
      arrowleft: () => this.move(-1, 0), arrowright: () => this.move(1, 0), arrowup: () => this.move(0, -1), arrowdown: () => this.move(0, 1),
      enter: () => this.confirm(), ' ': () => this.confirm(), escape: () => this.back(),
      ...(typing ? {} : {
        a: () => this.move(-1, 0), d: () => this.move(1, 0), w: () => this.move(0, -1), s: () => this.move(0, 1),
        q: () => this.tab(-1), e: () => this.tab(1), backspace: () => this.back(),
      }),
    };
    if (map[k]) {
      // a focused real button already turns Enter/Space into a click
      if ((k === 'enter' || k === ' ') && document.activeElement === top.focused && top.focused.tagName === 'BUTTON') return;
      e.preventDefault();
      map[k]();
    }
  }

  poll(dt) {
    this.repeat -= dt;
    let dir = null;
    for (const gp of readPads()) {
      const id = gp.index;
      const now = gp.buttons.map((_, i) => padPressed(gp, i));
      const prev = this.prev[id] || [];
      const edge = (i) => now[i] && !prev[i];
      this.prev[id] = now;
      const top = this.top;
      if (!top) continue;
      if (edge(PAD.A) && !(top.onRaw && top.onRaw('pad' + id, 'confirm'))) this.confirm();
      if (edge(PAD.B) && !(top.onRaw && top.onRaw('pad' + id, 'back'))) this.back();
      if (edge(PAD.LB)) this.tab(-1);
      if (edge(PAD.RB)) this.tab(1);
      if (edge(PAD.Y) && top.onRaw) top.onRaw('pad' + id, 'y');
      const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      if (now[PAD.LEFT] || ax < -0.6) dir = [-1, 0];
      else if (now[PAD.RIGHT] || ax > 0.6) dir = [1, 0];
      else if (now[PAD.UP] || ay < -0.6) dir = [0, -1];
      else if (now[PAD.DOWN] || ay > 0.6) dir = [0, 1];
    }
    if (!this.top) { this.held = false; return; }
    if (dir && this.repeat <= 0) {
      this.move(dir[0], dir[1]);
      this.repeat = this.held ? 0.16 : 0.42; // first repeat waits longer, like console menus
      this.held = true;
    }
    if (!dir) { this.repeat = 0; this.held = false; }
  }
}

export function el(html) {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild;
}
