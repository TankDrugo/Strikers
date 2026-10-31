import * as THREE from 'three';
import SAVE_TABLE from '../../animation/data/strikers_saves.json' with { type: 'json' };
import { FIELD, GOALIE, SIZE } from './config.js';
import { predict } from './ball.js';
import { seekDirection } from './player.js';
import { t } from './ui/i18n.js';

// The keeper as in the original (reference/VERIFICA.md §9): position and coming out (§9.1, Goalie.cpp ActionMove) and
// the save (§9.2, Goalie::CalcSaveParameters, GoalieSave::FindBestSave). Saves come from the table rebuilt from the
// disc data, animation/data/strikers_saves.json (gSaveInfo: clip, type, timings, ball bone at contact, connected saves).
// Table points are in original metres for the 1.09 m keeper: ours is SIZE times taller, so they are scaled by SIZE.

const [NET_W, NET_H] = SAVE_TABLE.net;
const [GX, GY] = GOALIE.saveGrid;
const SAVES = SAVE_TABLE.saves.map((s) => ({ ...s, pt: [s.ball_at_contact[1], s.ball_at_contact[2]], centre: s.grid_cell[0] === 3 }));
const BY_ID = new Map(SAVES.map((s) => [s.id, s]));
const NORMAL = new Set(['catch', 'dive_catch', 'deflect', 'dive_deflect', 'leg', 'punch']);
const CATCH = new Set(['catch', 'dive_catch']);
const DEFLECT = new Set(['deflect', 'dive_deflect']);
const tmp = new THREE.Vector3();
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export const saveTable = SAVES;

function cellOf(lat, h) {
  return [clamp(Math.floor((lat + NET_W / 2) / (NET_W / GX)), 0, GX - 1), clamp(Math.floor(h / (NET_H / GY)), 0, GY - 1)];
}

// Two saves blend only if the model mirror can be the same for both: same side, or one of them is a centre save
// (a centre clip mirrored is the same save)
function blendable(s, n) { return n && (n.mirrored === s.mirrored || s.centre || n.centre) && n.clip !== s.clip; }

// GoalieSave GetClosestBlendedPos: a save blends with its connected saves (up, down, sides), so it covers the
// segments towards them. Returns the closest point to (lat, h), the partner and the blend weight.
function blended(s, lat, h) {
  let best = { d: Math.hypot(s.pt[0] - lat, s.pt[1] - h), w: 0, other: null, pt: s.pt };
  for (const id of s.connected) {
    const n = BY_ID.get(id);
    if (!blendable(s, n)) continue;
    const dx = n.pt[0] - s.pt[0], dy = n.pt[1] - s.pt[1], L2 = dx * dx + dy * dy;
    const k = L2 > 1e-6 ? clamp(((lat - s.pt[0]) * dx + (h - s.pt[1]) * dy) / L2, 0, 1) : 0;
    const pt = [s.pt[0] + dx * k, s.pt[1] + dy * k], d = Math.hypot(pt[0] - lat, pt[1] - h);
    if (d < best.d - 1e-6) best = { d, w: k, other: n, pt };
  }
  return best;
}

function saveTime(s, fromTakeoff) { return fromTakeoff && s.save_time_from_takeoff != null ? s.save_time_from_takeoff : s.save_time; }

// FindBestSave / FindBestInList: saves of the cell that arrive in time, the closest blended point wins; a catch only
// within catchAllowDist. If the cell has none, the cells around it, ring by ring.
export function findBestSave(lat, h, t, { allowCatch, fromTakeoff = false, rate = 1 }) {
  const [cx, cy] = cellOf(lat, h);
  for (let r = 0; r < Math.max(GX, GY); r++) {
    let best = null;
    for (const s of SAVES) {
      if (!NORMAL.has(s.type) || (!allowCatch && CATCH.has(s.type))) continue;
      if (Math.max(Math.abs(s.grid_cell[0] - cx), Math.abs(s.grid_cell[1] - cy)) !== r) continue;
      const b = blended(s, lat, h);
      const time = (saveTime(s, fromTakeoff) * (1 - b.w) + (b.other ? saveTime(b.other, fromTakeoff) : 0) * b.w) / rate;
      if (time > t) continue;
      if (CATCH.has(s.type) && b.d > GOALIE.catchAllowDist) continue;
      if (!best || b.d < best.d) best = { ...b, s, time, fromTakeoff };
    }
    if (best) return best;
  }
  return null;
}

// CalcSaveParameters, no save in time: the closest deflection, played as a missed save
function nearestDeflection(lat, h) {
  let best = null;
  for (const s of SAVES) {
    if (!DEFLECT.has(s.type)) continue;
    const b = blended(s, lat, h);
    if (!best || b.d < best.d) best = { ...b, s, time: s.save_time, fromTakeoff: false };
  }
  return best;
}

// root motion of a clip at time t: [forward, left, yaw] in the clip's start frame (meta.root, 30 samples per second)
function rootAt(meta, t) {
  const r = meta.root, k = clamp(t * 30, 0, r.length - 1), i = Math.floor(k), f = k - i, a = r[i], b = r[Math.min(i + 1, r.length - 1)];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

export class Keeper {
  constructor(game) { this.game = game; }

  // Ball.cpp (shot released) → Goalie::InitActionSaveSetup: the keeper reacts at once. Returns true if he dives.
  onShot(g) {
    const game = this.game, b = game.ball;
    if (g.state !== 'free') return false;
    const out = g.attackDir, gx = -out * FIELD.halfLength;
    const path = predict(b.pos, b.vel, b.spin, b.magnus, 2.5);
    // Save Ignore Margin: a shot that misses the goal by more than 1 m gets no dive
    const line = path.find((s) => (s.p.x - gx) * out <= 0);
    if (!line || Math.abs(line.p.z) > FIELD.goalHalfWidth + GOALIE.saveIgnoreMargin || line.p.y > FIELD.goalHeight + GOALIE.saveIgnoreMargin) return false;
    // CalcTimeToPlane: the plane 0.2 m in front of the keeper, turned towards the ball
    const f = Math.atan2(b.pos.z - g.pos.z, b.pos.x - g.pos.x);
    const fx = Math.cos(f), fz = Math.sin(f);
    const side = (q) => (q.x - g.pos.x) * fx + (q.z - g.pos.z) * fz - GOALIE.savePlane;
    let cross = null;
    for (let i = 1; i < path.length; i++) {
      const s0 = side(path[i - 1].p), s1 = side(path[i].p);
      if (s0 > 0 && s1 <= 0) {
        const k = s0 / (s0 - s1);
        cross = { t: path[i - 1].t + (path[i].t - path[i - 1].t) * k, p: path[i - 1].p.clone().lerp(path[i].p, k) };
        break;
      }
    }
    if (!cross) return false;
    // contact point in the keeper's frame: lateral along the table's +y (the "left" of applyRootMotion), height
    const lx = Math.sin(f), lz = -Math.cos(f);
    const reach = SIZE * (g.cfg.saveReach ?? 1);
    const lat = ((cross.p.x - g.pos.x) * lx + (cross.p.z - g.pos.z) * lz) / reach, h = cross.p.y / reach;
    // CalcRegularShot: catches only for a chip shot, or a rested keeper (energy >= 90) and a soft shot (charge < 0.3)
    const allowCatch = b.isChip || (g.energy >= GOALIE.fatigueCatch && b.shotPower < GOALIE.catchMaxShotPower);
    const rate = g.cfg.saveRate ?? 1;
    let save = null, miss = false, delay = 0;
    if (!b.shouldMiss) save = findBestSave(lat, h, cross.t, { allowCatch, rate }) || findBestSave(lat, h, cross.t, { allowCatch, rate, fromTakeoff: true });
    if (!save) { save = nearestDeflection(lat, h); miss = true; if (b.shouldMiss) delay = GOALIE.missSaveDelay; }
    if (!save) return false;
    this.startSave(g, save, { t: cross.t + delay, f, cross, lat, h, miss, allowCatch, rate, kick: b.kickId });
    return true;
  }

  // InitActionSaveSetup: the clip starts so that its contact falls when the ball arrives; with little time it skips
  // the start of the clip up to the crouch (or the take-off); with time to spare he waits in gk_ready_idle
  startSave(g, save, o) {
    const game = this.game, s = save.s, meta = game.template.meta;
    let other = save.other, w = save.w;
    let mirror = s.mirrored;
    if (other && other.mirrored !== s.mirrored && s.centre) mirror = other.mirrored;
    if (!meta[s.clip]) return;
    if (other && !meta[other.clip]) { other = null; w = 0; }
    const r = o.rate;
    const dur = s.duration, contact = s.milestones.contact * dur;
    const skipTo = (save.fromTakeoff ? s.milestones.takeoff ?? s.milestones.crouch : s.milestones.crouch ?? 0) * dur;
    const startA = clamp(contact - o.t * r, 0, skipTo || 0);
    const wait = Math.max(0, o.t - (contact - startA) / r);
    let startB = 0, rateB = r;
    if (other) {
      const cb = other.milestones.contact * other.duration, need = o.t - wait; // seconds from the clip start to the contact
      startB = cb - need * r;
      if (startB < 0) { rateB = cb / Math.max(0.05, need); startB = 0; }
    }
    g.setState('dive', { save: s, other, w, mirror, wait, startA, startB, rateA: r, rateB, started: false, resolved: false,
      contactAt: wait + (contact - startA) / r, endAt: wait + (dur - startA) / r, f: o.f, pos0: g.pos.clone(),
      lat: o.lat, h: o.h, pt: save.pt, cross: o.cross, miss: o.miss, allowCatch: o.allowCatch, kick: o.kick });
    g.facing = o.f;
    if (wait > 0) g.play('gk_ready_idle', { loop: true, fade: 0.067 });
  }

  // ActionSave: plays the (blended) save with its root motion; contact at the trigger
  dive(g, dt) {
    const game = this.game, b = game.ball, d = g.stateData, meta = game.template.meta;
    if (!d.started) {
      if (g.stateTime + 1e-6 < d.wait) { g.facing = seekDirection(g.facing, d.f, GOALIE.saveTurn, GOALIE.saveTurnFalloff, dt); return; }
      d.started = true; d.t0 = g.stateTime;
      g.facing = d.f; d.pos0.copy(g.pos);
      g.playBlend(d.save.clip, d.other ? d.other.clip : null, d.w, { mirror: d.mirror, startA: d.startA, startB: d.startB, rateA: d.rateA, rateB: d.rateB, fade: 0.04 });
      d.root0 = this.rootSample(d, 0);
    }
    // root motion of the blend, in the frame the dive started from (×SIZE, mirrored to the save side)
    const el = g.stateTime - d.t0;
    const rs = this.rootSample(d, el), k = (g.cfg.height / g.rigHeight) * (g.cfg.saveReach ?? 1), m = d.mirror ? -1 : 1;
    const df = (rs[0] - d.root0[0]) * k, dl = (rs[1] - d.root0[1]) * k * m;
    const c = Math.cos(d.f), s = Math.sin(d.f);
    g.pos.x = d.pos0.x + c * df + s * dl; g.pos.z = d.pos0.z + s * df - c * dl;
    g.facing = d.f - (rs[2] - d.root0[2]) * m;
    if (!d.resolved && g.stateTime >= d.contactAt) { d.resolved = true; this.contact(g, d); }
    if (g.stateTime >= d.endAt) {
      if (b.owner === g) { g.setState('hold', {}); g.play('gk_idle_with_Ball', { loop: true, fade: 0.15 }); return; }
      // InitActionDiveRecover: the recovery clip of the save, or the generic one
      const rec = d.save.recover && meta[d.save.recover.clip] ? d.save.recover : { clip: 'gk_recover_without_ball', mirrored: d.mirror };
      g.setState('react', {});
      g.stun = (meta[rec.clip]?.duration ?? 0.45) * 0.95;
      g.play(rec.clip, { fade: 0.1, mirror: rec.mirrored });
    }
  }

  rootSample(d, el) {
    const meta = this.game.template.meta;
    const a = rootAt(meta[d.save.clip], d.startA + el * d.rateA);
    if (!d.other || !meta[d.other.clip]) return a;
    const b = rootAt(meta[d.other.clip], d.startB + el * d.rateB);
    return a.map((v, i) => v + (b[i] - v) * d.w);
  }

  // CheckForLimbEndZoneCollision: catch if the ball passes close to the hands, deflect if it touches an arm or a leg
  contact(g, d) {
    const game = this.game, b = game.ball;
    if (d.miss || b.owner || b.lastTouch?.team === g.team) return;
    // where the ball is in the keeper's frame: the predicted plane crossing, or the real ball if something touched it
    let lat = d.lat, h = d.h;
    const reach = SIZE * (g.cfg.saveReach ?? 1);
    if (b.kickId !== d.kick) {
      const lx = Math.sin(d.f), lz = -Math.cos(d.f);
      lat = ((b.pos.x - d.pos0.x) * lx + (b.pos.z - d.pos0.z) * lz) / reach; h = b.pos.y / reach;
      const fwd = (b.pos.x - d.pos0.x) * Math.cos(d.f) + (b.pos.z - d.pos0.z) * Math.sin(d.f);
      if (Math.abs(fwd) > 1.5 * SIZE) return;
    }
    const dist = Math.hypot(lat - d.pt[0], h - d.pt[1]) * reach;
    const type = d.save.type;
    if (dist > GOALIE.limbTolerance) return;
    const tired = GOALIE.fatigue[type] ?? 10;
    g.energy = Math.max(0, g.energy - tired);
    game.stats.saves[g.team]++;
    game.emit('save', { team: g.team });
    if (CATCH.has(type) && d.allowCatch && dist <= g.cfg.catchTolerance) {
      b.owner = g; b.vel.set(0, 0, 0); b.magnus = false; b.shotTimer = 0; b.passTarget = null;
      game.hud.flash(t('flash.save'));
      return;
    }
    // CheckForDelflectAwayFromNet: away from the goal, towards the side of the save
    const sp = b.vel.length() * 0.35;
    const sideSign = Math.sign(d.pt[0]) || (Math.random() < 0.5 ? 1 : -1);
    const away = (g.attackDir > 0 ? 0 : Math.PI);
    const lateral = Math.atan2(-Math.cos(d.f), Math.sin(d.f)); // world angle of the table's +y
    const dir = Math.atan2(Math.sin(away) + Math.sin(lateral) * sideSign * 0.8, Math.cos(away) + Math.cos(lateral) * sideSign * 0.8) + (Math.random() - 0.5) * 0.5;
    b.kick(new THREE.Vector3(Math.cos(dir) * sp, 3 + Math.random() * 3, Math.sin(dir) * sp), null, { noPickup: 0.3 });
    b.lastTouch = g;
    game.hud.flash(t('flash.parry'));
  }

  // ---------------------------------------------------------------- §9.1, every step without a shot

  // FindDesiredGoaliePosition
  desiredPosition(g, out) {
    const b = this.game.ball, o = b.owner;
    const dir = g.attackDir, gx = -dir * FIELD.halfLength;
    const vx = o ? Math.cos(o.facing) * o.speed : b.vel.x, vz = o ? Math.sin(o.facing) * o.speed : b.vel.z;
    const tx = (o ? o.pos.x : b.pos.x) + vx * GOALIE.lead, tz = (o ? o.pos.z : b.pos.z) + vz * GOALIE.lead;
    const ox = gx - dir * GOALIE.behindLine;
    const d = Math.max(0.01, Math.hypot(tx - ox, tz));
    let dist;
    if (d > 23) dist = 8;
    else if (d > 19) dist = 2.5 + (8 - 2.5) * (d - 19) / 4;
    else if (d > 12) dist = 2.5;
    else if (d > 7) dist = 4 + (2.5 - 4) * (d - 7) / 5;
    else dist = d - 3;
    dist = clamp(dist, 0.5, Math.max(0.5, d - 3));
    let px = ox + (tx - ox) / d * dist, pz = tz / d * dist;
    if ((px - gx) * dir < 0) pz = clamp(pz, -(FIELD.goalHalfWidth - GOALIE.lineMargin), FIELD.goalHalfWidth - GOALIE.lineMargin);
    out.set(px * (1 - GOALIE.keepNow) + g.pos.x * GOALIE.keepNow, 0, pz * (1 - GOALIE.keepNow) + g.pos.z * GOALIE.keepNow);
    return out;
  }

  inBox(g, pt, extra = 0) {
    const gx = -g.attackDir * FIELD.halfLength;
    return Math.abs(pt.x - gx) < FIELD.halfLength - FIELD.penaltyX + extra && Math.abs(pt.z) < FIELD.penaltyHalfWidth + extra;
  }

  // Goalie ActionMove, in the original order: pass threat, Super Strike attack (game.js), loose ball, ball carrier
  think(g, dt) {
    const game = this.game, b = game.ball;
    g.energy = Math.min(100, (g.energy ?? 100) + GOALIE.fatigue.recover * dt);
    if (b.owner === g) { g.setState('hold', {}); g.play('gk_idle_with_Ball', { loop: true, fade: 0.1 }); return; }
    const spot = this.desiredPosition(g, tmp);
    // IsPassThreat / CanInterceptPass (Goalie Intercept Pass of the chosen level, from Professional up)
    if (!b.owner && b.passTarget && b.passTarget.team !== g.team) {
      const meet = game.ballMeetPoint(g);
      if (this.inBox(g, meet, GOALIE.passThreatMargin)) {
        if (game.skill('goalieInterceptPass', g.team) >= 0.5) { game.goalieMove(g, meet.x, meet.z, g.cfg.run); return; }
        const t = b.passTarget;
        spot.set((spot.x + t.pos.x) / 2, 0, (spot.z + t.pos.z) / 2);
      }
    }
    // IsLooseBallClose(Loose Ball Range): a free ball within the box plus that distance (Rookie −1: never out of it)
    const lbr = game.skill('looseBallRange', g.team);
    if (!b.owner && !(b.shotTimer > 0 && b.lastTouch && b.lastTouch.team !== g.team) && b.pos.y < 1.5 && this.inBox(g, b.pos, lbr)) {
      const meet = game.ballMeetPoint(g);
      game.goalieMove(g, meet.x, meet.z, g.cfg.run);
      return;
    }
    // IsOpponentBallCarrierInRange: carrier inside the box and within Attack Carrier Range (never during a Super Strike)
    const o = b.owner;
    if (o && o.team !== g.team && !game.superStrike && this.inBox(g, o.pos) && Math.hypot(o.pos.x - g.pos.x, o.pos.z - g.pos.z) < game.skill('attackCarrierRange', g.team)) {
      const dd = Math.hypot(b.pos.x - g.pos.x, b.pos.z - g.pos.z);
      if (dd < g.cfg.catchTolerance + GOALIE.pounceRange) { this.startTrap(g); return; }
      if (o.state === 'windup') {
        if (Math.hypot(spot.x - g.pos.x, spot.z - g.pos.z) < GOALIE.readyDistance) {
          g.speed = 0; g.facing = seekDirection(g.facing, Math.atan2(b.pos.z - g.pos.z, b.pos.x - g.pos.x), GOALIE.saveTurn, GOALIE.saveTurnFalloff, dt);
          g.play('gk_anticipate', { fade: 0.067, restart: false });
          return;
        }
        game.goalieMove(g, spot.x, spot.z, g.cfg.run);
        return;
      }
      // attack him at 1.5×, or (Goalie Deke Chance) get beaten by the dribble and run at Goalie Deke Speed
      if (g.attackFor !== o) { g.attackFor = o; g.deked = Math.random() < game.skill('goalieDekeChance', g.team); }
      const scale = g.deked ? game.skill('goalieDekeSpeed', g.team) : GOALIE.attackRunScale;
      game.goalieMove(g, b.pos.x, b.pos.z, g.cfg.run * scale, true);
      return;
    }
    g.attackFor = null;
    game.goalieMove(g, spot.x, spot.z, Math.hypot(b.pos.x - g.pos.x, b.pos.z - g.pos.z) < 18 ? g.cfg.run : g.cfg.jog);
  }

  // gk_trap_attack: a dive at the carrier's feet
  startTrap(g) {
    const b = this.game.ball;
    g.setState('trap', { done: false, f: Math.atan2(b.pos.z - g.pos.z, b.pos.x - g.pos.x) });
    g.facing = g.stateData.f;
    g.play('gk_trap_attack', { fade: 0.05 });
  }

  trap(g, dt) {
    const game = this.game, b = game.ball, d = g.stateData, meta = game.template.meta.gk_trap_attack;
    g.applyRootMotion();
    if (!d.done && g.stateTime >= (meta?.contact ?? 0.15)) {
      d.done = true;
      if (Math.hypot(b.pos.x - g.pos.x, b.pos.z - g.pos.z) < g.cfg.catchTolerance + GOALIE.pounceRange * 0.5 && b.pos.y < 1.0 * SIZE) {
        const o = b.owner;
        if (o && o !== g && o.state === 'windup') o.setState('free');
        b.owner = g; b.vel.set(0, 0, 0); b.magnus = false; b.shotTimer = 0; b.passTarget = null;
        game.stats.saves[g.team]++;
        game.emit('save', { team: g.team });
      }
    }
    if (g.stateTime > (meta?.duration ?? 0.33)) {
      if (b.owner === g) { g.setState('hold', {}); g.play('gk_recover_trap_with_ball', { fade: 0.1 }); }
      else { g.setState('react', {}); g.stun = game.template.meta.gk_recover_trap_without_ball?.duration ?? 0.45; g.play('gk_recover_trap_without_ball', { fade: 0.1 }); }
    }
  }
}

