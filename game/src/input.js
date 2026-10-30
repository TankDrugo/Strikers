// Keyboard and Xbox controller (W3C "standard" gamepad mapping).
// Screen axes: the camera looks from the +Z touchline, so right on screen is +X and up is -Z.
//
// Controller layout (chosen with the player, EA FC style):
//   left stick / d-pad  move           RT  turbo
//   A  pass                            B   shoot (hold to charge) · without ball: slide tackle
//   Y  lob                             X   deke · without ball: body check
//   LB switch player                   Menu pause · View restart (from the pause screen)

export const PAD = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, MENU: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
const DEADZONE = 0.22;

export function readPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const gp of pads) if (gp && gp.connected !== false) return gp;
  return null;
}

export function readPads() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  return [...pads].filter((gp) => gp && gp.connected !== false);
}

export function padPressed(gp, i) {
  const b = gp && gp.buttons[i];
  if (!b) return false;
  return i === PAD.RT || i === PAD.LT ? b.pressed || b.value > 0.3 : b.pressed;
}

// Left stick with a radial deadzone, rescaled so it still reaches full speed.
export function padStick(gp) {
  let x = gp.axes[0] || 0, y = gp.axes[1] || 0;
  const m = Math.hypot(x, y);
  if (m < DEADZONE) { x = 0; y = 0; } else { const k = Math.min(1, (m - DEADZONE) / (1 - DEADZONE)) / m; x *= k; y *= k; }
  if (padPressed(gp, PAD.LEFT)) x = -1;
  if (padPressed(gp, PAD.RIGHT)) x = 1;
  if (padPressed(gp, PAD.UP)) y = -1;
  if (padPressed(gp, PAD.DOWN)) y = 1;
  return [x, y];
}

// Which device drives which human: bind([{ device: 'any', ctrl: 0 }]) for one human (keyboard and every pad),
// bind([{ device: 'kb', ctrl: 0 }, { device: 'pad', index: 0, ctrl: 1 }]) for two. ctrl = index in game.controllers.
export class Input {
  constructor(game) {
    this.game = game;
    this.keys = new Set();
    this.prev = {}; // per pad index: buttons that count (held ones from a menu are ignored until released)
    this.prevRaw = {};
    this.ignore = {};
    this.resumeGuard = true;
    this.usingPad = false;
    this.bindings = [{ device: 'any', ctrl: 0 }];
    addEventListener('keydown', (e) => this.key(e, true));
    addEventListener('keyup', (e) => this.key(e, false));
    addEventListener('blur', () => this.keys.clear());
    addEventListener('wheel', (e) => this.zoom(e.deltaY > 0 ? 1.08 : 1 / 1.08), { passive: true });
  }

  bind(list) { this.bindings = list; this.keys.clear(); this.resumeGuard = true; }

  ctrlFor(device, index) {
    const b = this.bindings.find((x) => x.device === 'any' || (x.device === device && (device === 'kb' || x.index === index)));
    return b ? this.game.controllers[b.ctrl] : null;
  }

  key(e, down) {
    const k = e.key.toLowerCase();
    if (this.suspended && this.menuOwnsKeys) return;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (down) {
      if (this.keys.has(k)) return;
      this.keys.add(k);
      this.usingPad = false;
      if (this.suspended) return;
      if (k === 'p' || k === 'escape') { this.onPause && this.onPause(); return; }
      if (k === '+' || k === '=') this.zoom(1 / 1.12);
      if (k === '-') this.zoom(1.12);
      const c = this.ctrlFor('kb');
      if (!c) return;
      const a = c.input.actions;
      if (k === 'j') a.add('passOrSwitch');
      if (k === 'k') a.add('shootOrSlide');
      if (k === 'l') a.add('lobOrHit');
      if (k === ' ') a.add('deke');
    } else this.keys.delete(k);
  }

  zoom(f) {
    const g = this.game;
    if (g) g.camZoom = Math.max(0.6, Math.min(1.5, g.camZoom * f));
  }

  poll() {
    const g = this.game;
    const acc = new Map(); // controller -> { x, z, turbo, shootHeld }
    const get = (c) => { if (!acc.has(c)) acc.set(c, { x: 0, z: 0, turbo: false, shootHeld: false }); return acc.get(c); };
    for (const c of g.controllers) get(c);

    const kc = this.ctrlFor('kb');
    if (kc) {
      const K = this.keys, o = get(kc);
      if (K.has('a') || K.has('arrowleft')) o.x -= 1;
      if (K.has('d') || K.has('arrowright')) o.x += 1;
      if (K.has('w') || K.has('arrowup')) o.z -= 1;
      if (K.has('s') || K.has('arrowdown')) o.z += 1;
      if (K.has('shift')) o.turbo = true;
      if (K.has('k')) o.shootHeld = true;
    }

    for (const gp of readPads()) {
      const id = gp.index;
      const now = gp.buttons.map((_, i) => padPressed(gp, i));
      if (now.some(Boolean) || Math.hypot(gp.axes[0] || 0, gp.axes[1] || 0) > DEADZONE) this.usingPad = true;
      const ign = this.ignore[id] || (this.ignore[id] = new Set());
      // after a menu or the pause, buttons still held from it must be released before they count again
      if (this.suspended || this.resumeGuard) for (let i = 0; i < now.length; i++) if (now[i]) ign.add(i);
      for (const i of [...ign]) if (!now[i]) ign.delete(i);
      const live = now.map((v, i) => v && !ign.has(i));
      const prev = this.prev[id] || [], prevRaw = this.prevRaw[id] || [];
      const edge = (i) => live[i] && !prev[i];
      if (now[PAD.MENU] && !prevRaw[PAD.MENU]) this.onPause && this.onPause();
      const c = this.ctrlFor('pad', id);
      if (c && !this.suspended) {
        const o = get(c), inp = c.input;
        const [px, py] = padStick(gp);
        if (px || py) { o.x = px; o.z = py; }
        if (edge(PAD.A)) inp.actions.add('pass');
        if (edge(PAD.B)) inp.actions.add('shootOrSlide');
        if (edge(PAD.Y)) inp.actions.add('lob');
        if (edge(PAD.X)) inp.actions.add('dekeOrHit');
        if (edge(PAD.LB)) inp.actions.add('switch');
        if (live[PAD.B]) o.shootHeld = true;
        if (now[PAD.RT]) o.turbo = true;
      }
      this.prev[id] = live;
      this.prevRaw[id] = now;
    }
    this.resumeGuard = false;

    for (const [c, o] of acc) {
      let { x, z } = o;
      if (this.suspended) { x = 0; z = 0; }
      const m = Math.hypot(x, z);
      if (m > 1) { x /= m; z /= m; }
      Object.assign(c.input, { x, z, turbo: o.turbo, shootHeld: o.shootHeld });
    }
  }
}

// Menus with the controller: d-pad or stick moves between buttons, A confirms, B goes back.
export class PadMenus {
  constructor() { this.prev = []; this.repeat = 0; }

  poll(dt, { onBack, onViewer, onRestart } = {}) {
    const gp = readPad();
    if (!gp) return;
    const now = gp.buttons.map((_, i) => padPressed(gp, i));
    const edge = (i) => now[i] && !this.prev[i];
    const [sx, sy] = [gp.axes[0] || 0, gp.axes[1] || 0];
    let dir = 0;
    if (now[PAD.DOWN] || now[PAD.RIGHT] || sy > 0.6 || sx > 0.6) dir = 1;
    if (now[PAD.UP] || now[PAD.LEFT] || sy < -0.6 || sx < -0.6) dir = -1;
    this.repeat -= dt;
    const screens = document.querySelectorAll('.screen');
    const top = screens[screens.length - 1];
    if (top) {
      const buttons = [...top.querySelectorAll('button')];
      if (buttons.length) {
        let i = buttons.indexOf(document.activeElement);
        if (i < 0) { buttons[0].focus(); i = 0; }
        if (dir && this.repeat <= 0) {
          buttons[(i + dir + buttons.length) % buttons.length].focus();
          this.repeat = this.held ? 0.18 : 0.45; // first repeat waits longer, like console menus
          this.held = true;
        }
        if (!dir) { this.repeat = 0; this.held = false; }
        if (edge(PAD.A)) document.activeElement.click();
        if (edge(PAD.B) && onBack) onBack(top);
        if (edge(PAD.VIEW) && onRestart) onRestart(top);
      }
    } else if (onViewer) {
      onViewer({ next: dir && this.repeat <= 0 ? dir : 0, back: edge(PAD.B), mirror: edge(PAD.X) });
      if (dir && this.repeat <= 0) { this.repeat = this.held ? 0.12 : 0.45; this.held = true; }
      if (!dir) { this.repeat = 0; this.held = false; }
    }
    this.prev = now;
  }
}
