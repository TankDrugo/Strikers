import * as THREE from 'three';
import { BALL, FIELD, FIELDER, GOALIE, SHOT, SUPER, TACKLE, PASS, MATCH, PHYSICS_DT, SIZE } from './config.js';
import { Ball, predict, shootAtFast } from './ball.js';
import { buildField, buildBallMesh } from './field.js';
import { Stadium } from './stadium.js';
import { Player, angleDiff } from './player.js';
import { fielderAI, bestPassTarget } from './ai.js';
import { t } from './ui/i18n.js';

const R = BALL.radius;
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

// Home spots for the four fielders of team 0 (attacking +X); team 1 is mirrored.
const HOMES = [[-11, -5], [-11, 5], [-4, -3.5], [-4, 3.5]];

export class Game {
  constructor(renderer, template, hud) {
    this.renderer = renderer;
    this.template = template;
    this.teams = template.teams; // [{ name, color }] per team, from roster.json
    this.hud = hud;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1d2738);
    this.scene.fog = new THREE.Fog(0x1d2738, 60, 120);
    this.camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 300);
    this.camTarget = new THREE.Vector3();
    this.camZoom = 1; // 0.6 (closer) .. 2.2 (whole pitch)
    this.setupLights();
    buildField(this.scene, { stadium: true });
    this.stadium = new Stadium(this.scene, this.teams);
    this.ball = new Ball(buildBallMesh());
    this.scene.add(this.ball.mesh);
    this.ballShadow = new THREE.Mesh(new THREE.CircleGeometry(R * 1.1, 16), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
    this.ballShadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.ballShadow);
    this.players = [];
    for (let team = 0; team < 2; team++) {
      for (let i = 0; i < 4; i++) {
        const p = new Player(this, template.forSlot(team, i), team, 'fielder', i, template.statsFor ? template.statsFor(team, i) : null);
        const [hx, hz] = HOMES[i];
        p.home.set(team === 0 ? hx : -hx, 0, team === 0 ? hz : -hz);
        p.tackleCooldown = 0;
        this.players.push(p);
      }
      const g = new Player(this, template.forSlot(team, 4), team, 'goalie', 4, template.statsFor ? template.statsFor(team, 4) : null);
      g.home.set((team === 0 ? -1 : 1) * (FIELD.halfLength - 1.2), 0, 0);
      g.tackleCooldown = 0;
      this.players.push(g);
    }
    this.score = [0, 0];
    this.clock = MATCH.seconds;
    this.phase = 'kickoff';
    this.phaseTime = 0;
    this.kickoffTeam = 0;
    // One controller per human (keyboard or pad): its team, its input and the player it moves.
    // Quick play sets them with setHumans([0]) (1 vs CPU), [0, 1] (1 vs 1), [0, 0] (2 vs CPU) or [] (CPU vs CPU).
    this.controllers = [];
    this.cpuLevel = 1; // 0 easy, 1 normal, 2 hard, 3 very hard (fractions blend): only teams without humans
    this.setHumans([0]);
    // cups: match facts for the star objectives, golden goal in knockouts
    this.onEvent = null;
    this.knockout = false;
    this.golden = false;
    this.winner = null;
    this.time = 0;
    this.passChain = [0, 0];
    this.possTeam = null;
    this.acc = 0;
    this.timeScale = 1;
    this.superStrike = null; // the Super Strike in progress: { p, keeper, phase, needle, n, outcome, ... }
    this.camLift = 0;
    this.stats = { shots: [0, 0], saves: [0, 0], passes: [0, 0], tackles: [0, 0], posts: 0 };
    this.kickoff(0);
  }

  emit(type, data) { if (this.onEvent) this.onEvent(type, data); }

  // value for the current CPU level from a table per whole level (0..3), blended for fractions
  cpuTune(table) {
    const l = Math.max(0, Math.min(table.length - 1, this.cpuLevel)), i = Math.floor(l), k = l - i;
    return table[i] + ((table[i + 1] ?? table[i]) - table[i]) * k;
  }

  newInput() { return { x: 0, z: 0, turbo: false, shootHeld: false, actions: new Set() }; }

  setHumans(teams) {
    for (const c of this.controllers || []) if (c.player) c.player.humanControlled = false;
    this.controllers = teams.map((team) => ({ team, input: this.newInput(), player: null }));
    if (this.players.length) this.assignKickoffPlayers(this.kickoffTeam || 0);
  }

  // The first controller is "the" human for the HUD, the shot meter and the end screen.
  get aiOnly() { return this.controllers.length === 0; }
  set aiOnly(v) { if (v) this.setHumans([]); }
  get human() { return this.controllers[0]?.player || null; }
  get humanTeam() { return this.controllers[0]?.team ?? 0; }
  get input() { return this.controllers[0]?.input || this._noInput || (this._noInput = this.newInput()); }

  controllerOf(p) { return this.controllers.find((c) => c.player === p) || null; }
  isCpuTeam(t) { return !this.controllers.some((c) => c.team === t); }

  // Give player p to controller c; if another human on the same team had p, they swap.
  setControlled(c, p) {
    if (!c || !p || c.player === p) return;
    const other = this.controllerOf(p);
    const prev = c.player;
    if (prev) prev.humanControlled = false;
    c.player = p; p.humanControlled = true;
    if (other) { other.player = prev; if (prev) prev.humanControlled = true; }
  }

  // Ball won by a teammate: the human of that team closest to it takes over (if none already has it).
  giveToTeamHuman(p) {
    if (p.isGoalie || this.controllerOf(p)) return;
    let best = null, bd = 1e9;
    for (const c of this.controllers) {
      if (c.team !== p.team) continue;
      const d = c.player ? Math.hypot(c.player.pos.x - p.pos.x, c.player.pos.z - p.pos.z) : 0;
      if (d < bd) { bd = d; best = c; }
    }
    if (best) this.setControlled(best, p);
  }

  assignKickoffPlayers(team) {
    for (const c of this.controllers) { if (c.player) c.player.humanControlled = false; c.player = null; }
    for (const c of this.controllers) {
      const order = c.team === team ? [3, 2, 1, 0] : [3, 1, 2, 0];
      const p = order.map((i) => this.players.find((q) => q.team === c.team && q.index === i)).find((q) => q && !this.controllerOf(q));
      if (p) { c.player = p; p.humanControlled = true; }
    }
  }

  setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x2a3a2a, 1.35));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(-10, 34, 14); // floodlight key light
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const c = sun.shadow.camera; c.left = -26; c.right = 26; c.top = 18; c.bottom = -18; c.near = 1; c.far = 80;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);
  }

  teamOf(t) { return this.players.filter((p) => p.team === t); }
  goalieOf(t) { return this.players.find((p) => p.team === t && p.isGoalie); }

  kickoff(team) {
    this.kickoffTeam = team;
    this.ball.reset(0, 0);
    this.ball.superStrike = null; this.superStrike = null; this.timeScale = 1;
    for (const p of this.players) {
      p.setState('free'); p.stun = 0; p.speed = 0; p.turbo = false;
      p.pos.copy(p.home);
      if (!p.isGoalie) p.pos.x = Math.sign(p.home.x) * Math.max(Math.abs(p.home.x), 2.5);
      p.facing = p.team === 0 ? 0 : Math.PI;
      p.desiredSpeed = 0; p.desiredDir = p.facing;
      p.play(p.isGoalie ? 'gk_ready_idle' : 'idle', { loop: true });
    }
    const taker = this.players.find((p) => p.team === team && p.index === 3);
    taker.pos.set(-taker.attackDir * 0.6, 0, 0);
    this.ball.owner = taker;
    taker.dribblePoint(this.ball.pos);
    this.assignKickoffPlayers(team);
    this.phase = 'kickoff';
    this.phaseTime = 0;
  }

  // Old single-human API (CPU vs CPU used setHuman(null)).
  setHuman(p) { if (p === null) this.setHumans([]); else this.setControlled(this.controllers[0], p); }

  roleOf(p) {
    // per team: nearest fielder to the ball chases, second nearest marks (human player is excluded)
    if (!this._roles || this._rolesStep !== this.step) {
      this._roles = new Map(); this._rolesStep = this.step;
      for (const t of [0, 1]) {
        const target = this.ball.owner ? this.ball.owner.pos : this.ball.pos;
        const list = this.players.filter((q) => q.team === t && !q.isGoalie && !q.humanControlled && q.stun <= 0)
          .sort((a, b) => Math.hypot(a.pos.x - target.x, a.pos.z - target.z) - Math.hypot(b.pos.x - target.x, b.pos.z - target.z));
        list.forEach((q, i) => this._roles.set(q, i === 0 ? 'chaser' : i === 1 ? 'marker' : 'shape'));
      }
    }
    return this._roles.get(p) || 'shape';
  }

  ballMeetPoint(p) {
    const b = this.ball;
    let best = b.pos.clone();
    if (b.vel.lengthSq() < 0.5) return best;
    const path = predict(b.pos, b.vel, b.spin, b.magnus, 2.0, 0.05);
    const sp = p.turbo ? 7 : 6.1;
    for (const s of path) {
      if (s.p.y > 1.2) continue;
      const d = Math.hypot(s.p.x - p.pos.x, s.p.z - p.pos.z);
      best = s.p;
      if (d / sp <= s.t + 0.05) break;
    }
    best.x = Math.max(-FIELD.halfLength + 0.4, Math.min(FIELD.halfLength - 0.4, best.x));
    best.z = Math.max(-FIELD.halfWidth + 0.4, Math.min(FIELD.halfWidth - 0.4, best.z));
    return best;
  }

  // ------------------------------------------------------------- actions

  doPass(p, target, lob) {
    if (!this.ball.owner === p) return;
    const b = this.ball;
    const dx = target.pos.x - p.pos.x, dz = target.pos.z - p.pos.z, d = Math.hypot(dx, dz);
    const f = Math.max(0, Math.min(1, (d - PASS.minDist) / (PASS.maxDist - PASS.minDist)));
    const range = p.isGoalie ? p.cfg.pass : lob ? p.cfg.passVolley : p.cfg.passGround;
    const speed = range[0] + (range[1] - range[0]) * f;
    let t = lob ? Math.max(0.6, d / speed * 1.6) : Math.max(0.15, d / speed);
    // lead the receiver
    const lead = Math.min(t, 1.2);
    const tx = target.pos.x + Math.cos(target.facing) * target.speed * lead * 0.8;
    const tz = target.pos.z + Math.sin(target.facing) * target.speed * lead * 0.8;
    const from = b.pos.clone();
    const to = new THREE.Vector3(tx, lob ? 0.9 : R, tz);
    let vel = shootAtFast(from, to, t);
    if (p.cfg.passError) vel.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() * 2 - 1) * p.cfg.passError); // card passing stat
    if (!lob) { vel.y = Math.min(vel.y, 1.2); }
    p.facing = Math.atan2(tz - p.pos.z, tx - p.pos.x);
    p.setState('pass', { vel, lob, target });
    const clipName = p.isGoalie ? (d > GOALIE.throwMinDist ? 'gk_throw_over_hand' : 'gk_throw_underhand') : 'pass_1200';
    p.play(clipName, { fade: 0.05 });
    p.stateData.release = this.template.meta[clipName]?.contact ?? 0.05;
    this.stats.passes[p.team]++;
  }

  releasePass(p) {
    const { vel, target, lob } = p.stateData;
    this.ball.kick(vel, null, { passTarget: target, noPickup: 0.12 });
    const c = this.controllerOf(p);
    if (c && !target.isGoalie) this.setControlled(c, target);
    this.passChain[p.team]++;
    p.stateData.released = true;
  }

  startWindup(p, aiHold = null) {
    p.setState('windup', { aiHold });
    p.play('windup', { fade: 0.08 });
  }

  releaseShot(p) {
    const charge = Math.min(1, p.stateTime / SHOT.windupSeconds);
    const perfect = charge >= 1 - SHOT.perfectWindow * (p.cfg.perfectWindow ?? 1) && p.stateTime <= SHOT.windupSeconds + 0.12;
    p.setState('kick', { charge, perfect });
    const clip = perfect ? 'windup_powershot' : 'windup_kick';
    p.play(clip, { fade: 0.04, rate: perfect ? 1.35 : 1.25 });
    p.stateData.release = (this.template.meta[clip]?.contact ?? 0.15) / (perfect ? 1.35 : 1.25);
    const c = this.controllerOf(p);
    p.stateData.aimZ = c ? c.input.z : null;
  }

  shootBall(p) {
    const { charge, perfect } = p.stateData;
    const b = this.ball;
    const goalX = p.attackDir * FIELD.halfLength;
    const gk = this.goalieOf(1 - p.team);
    const w = FIELD.goalHalfWidth - SHOT.offsetFromPost;
    let side;
    if (p.stateData.aimZ !== null && p.stateData.aimZ !== undefined && Math.abs(p.stateData.aimZ) > 0.2) side = Math.sign(p.stateData.aimZ);
    else side = gk.pos.z > 0 ? -1 : 1;
    const dist = Math.hypot(goalX - b.pos.x, b.pos.z);
    const target = new THREE.Vector3(goalX, 0, side * w + (Math.random() * 2 - 1) * SHOT.widthVariance * (p.cfg.shotSpread ?? 1) * 2 * w);
    target.y = dist > SHOT.highShotDistance ? FIELD.goalHeight - 0.4 : 0.35 + Math.random() * 1.3;
    target.y += (Math.random() * 2 - 1) * SHOT.heightVariance * FIELD.goalHeight;
    const power = perfect ? 1 : 0.15 + 0.85 * charge;
    const speed = p.cfg.shot[0] + (p.cfg.shot[1] - p.cfg.shot[0]) * power;
    const from = b.pos.clone();
    const flight = Math.max(0.25, from.distanceTo(target) / speed);
    let vel = shootAtFast(from, target, flight);
    // weak shots are less accurate
    const err = (1 - power) * 0.12 * (p.cfg.shotSpread ?? 1);
    vel.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() * 2 - 1) * err);
    let spin = new THREE.Vector3();
    if (perfect) {
      // Fielder.cpp: random spin in the shooter's frame (fwd ±7.5, side ±15, vertical 10..25), Magnus on
      const f = p.facing;
      const fwd = new THREE.Vector3(Math.cos(f), 0, Math.sin(f)), left = new THREE.Vector3(Math.sin(f), 0, -Math.cos(f));
      const vz = (10 + Math.random() * 15) * (Math.random() < 0.5 ? 1 : -1);
      spin.addScaledVector(fwd, 7.5 - Math.random() * 15).addScaledVector(left, 15 - Math.random() * 30).add(new THREE.Vector3(0, vz, 0));
      // cBall::Shoot: fly a ghost ball, then rotate the launch so the curve ends on target
      const path = predict(from, vel, spin, true, 2.0);
      const d0 = from.distanceTo(target);
      const at = path.find((s) => s.p.distanceTo(from) >= d0) || path[path.length - 1];
      const q = new THREE.Quaternion().setFromUnitVectors(tmp.copy(at.p).sub(from).normalize(), tmp2.copy(target).sub(from).normalize());
      vel.applyQuaternion(q);
      if (vel.y < 1 && from.y < 1) vel.y = 1;
    }
    b.kick(vel, spin, { magnus: perfect, shot: true, power, perfect });
    this.stats.shots[p.team]++;
    this.emit('shot', { team: p.team, perfect });
    this.hud.flash(perfect ? t('flash.perfect') : null);
    p.stateData.released = true;
  }

  startSlide(p) {
    p.setState('slide', { hit: false });
    p.play('slide_tackle_1200', { fade: 0.05 });
    p.speed = Math.max(p.speed, TACKLE.slideSpeed * (p.cfg.slideSpeed ?? 1));
    p.tackleCooldown = 1.2;
    this.stats.tackles[p.team]++;
  }

  startHit(p) {
    p.setState('hit', { done: false });
    p.play('hit_1200', { fade: 0.05 });
    p.tackleCooldown = 1.0;
  }

  startDeke(p, side) {
    p.lastDeke = this.time;
    p.setState('deke', {});
    p.play('deke_300', { fade: 0.06, mirror: side < 0 });
  }

  knockDown(victim, attacker, kind) {
    if (victim.state === 'react' || victim.state === 'super' || victim.isGoalie) return;
    const b = this.ball;
    if (kind === 'hit' && b.owner === victim) {
      // card tackling stat: a stronger ball carrier can shrug off a weaker player's shoulder charge
      const edge = ((victim.cfg.strength ?? 75) - (attacker.cfg.strength ?? 75)) / 60;
      if (edge > 0 && Math.random() < Math.min(0.5, edge)) { this.hud.sfx('hit'); return; }
    }
    if (b.owner === victim && attacker.team !== victim.team) this.emit('steal', { team: attacker.team });
    if (b.owner === victim) {
      const dir = Math.atan2(victim.pos.z - attacker.pos.z, victim.pos.x - attacker.pos.x) + (Math.random() - 0.5);
      b.kick(new THREE.Vector3(Math.cos(dir) * 5, 2.5, Math.sin(dir) * 5), null, { noPickup: 0.35 });
      b.lastTouch = attacker;
    }
    // pick the react clip by where the hit came from: 1200 front, 300 right, 600 back, 900 left (mirrored 300)
    const rel = angleDiff(victim.facing, Math.atan2(attacker.pos.z - victim.pos.z, attacker.pos.x - victim.pos.x));
    let dirName = '1200', mirror = false;
    if (Math.abs(rel) > 2.35) dirName = '600';
    else if (rel > 0.8) { dirName = '300'; }
    else if (rel < -0.8) { dirName = '300'; mirror = true; }
    const base = kind === 'slide' ? 'slide_tackle_react_' : 'hit_react_';
    const name = kind === 'slide' ? base + dirName : base + dirName;
    victim.setState('react', {});
    victim.stun = (kind === 'slide' ? TACKLE.stunSlide : TACKLE.stunHit) * (victim.cfg.stunTime ?? 1);
    victim.speed = 0;
    victim.play(this.template.clips[name] ? name : base + '1200', { fade: 0.05, mirror });
    this.hud.sfx('hit');
  }

  // ------------------------------------------------------------- Super Strike

  // the only player who can do it: the team's captain (slot 0-3, never the keeper)
  isCaptain(p) { return !p.isGoalie && p.index === (this.teams?.[p.team]?.captain ?? 3); }

  canSuper(p) {
    return this.phase === 'play' && !this.superStrike && this.isCaptain(p) && this.ball.owner === p && p.pos.x * p.attackDir > 0;
  }

  startSuper(p) {
    const err = this.cpuTune(SUPER.cpuError), gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 1.15;
    this.superStrike = { p, keeper: this.goalieOf(1 - p.team), phase: 'jump', t: 0, needle: 0, n: [null, null], outcome: null,
      human: p.humanControlled, cpuStops: SUPER.marks.map((m) => m + gauss() * err), pressed: false };
    p.setState('super', {});
    p.speed = 0;
    p.play('captain_shoot_to_score', { fade: 0.06 });
    this.setSuperClip(p, 0);
    this.timeScale = SUPER.slowMotion;
    this.hud.flash(t('flash.super'), '#ffd21f', 1.4);
    this.emit('superStart', { team: p.team });
  }

  // the clip is driven by the sequence (the meter can last any time), not by the mixer
  setSuperClip(p, time) {
    const a = p.actions.captain_shoot_to_score;
    if (!a) return;
    a.time = Math.min(time, a.getClip().duration - 0.001);
    a.timeScale = 0;
  }

  superUpdate(p, dt) {
    const s = this.superStrike;
    if (!s || s.p !== p || s.phase === 'flight') {
      // strike gone (goal, kickoff) or flying: finish the landing, then play on
      const a = p.actions.captain_shoot_to_score;
      p.stateData.t = (p.stateData.t ?? a?.time ?? 0) + dt * SUPER.kickRate;
      this.setSuperClip(p, p.stateData.t);
      if (!a || p.stateData.t >= a.getClip().duration - 0.05) { p.setState('free'); p.play('idle', { loop: true, fade: 0.2 }); }
      return;
    }
    p.speed = 0;
    s.t += dt;
    const [h0, h1] = SUPER.hangClip;
    if (s.phase === 'jump') {
      this.setSuperClip(p, s.t);
      if (s.t >= h0) { s.phase = 'meter1'; s.t = 0; s.pressed = false; }
    } else if (s.phase === 'meter1' || s.phase === 'meter2') {
      const i = s.phase === 'meter1' ? 0 : 1;
      const f = Math.min(1, s.t / SUPER.needleSeconds);
      s.needle = i === 0 ? f : 1 - f;
      this.setSuperClip(p, h0 + (h1 - h0) * (i + f) / 2); // drift through the hang pose
      const cpuStop = !s.human && (i === 0 ? s.needle >= s.cpuStops[0] : s.needle <= s.cpuStops[1]);
      if (s.pressed || cpuStop || f >= 1) {
        s.pressed = false; s.n[i] = s.needle; s.t = 0;
        if (i === 0) s.phase = 'meter2';
        else { s.outcome = this.superOutcome(s.n); s.phase = 'kick'; }
      }
    } else if (s.phase === 'kick') {
      const clipT = h1 + s.t * SUPER.kickRate;
      this.setSuperClip(p, clipT);
      const contact = this.template.meta.captain_shoot_to_score?.contact ?? 3.4;
      if (clipT >= contact) { p.stateData.t = clipT; this.superShoot(p, s); }
    }
  }

  // each needle: dark green 2, light green 1, outside 0. 4 = perfect (unstoppable, keeper blasted into the net),
  // 3 = goal (the keeper misses it), less = the keeper punches it away (MarioWiki, Super Strike)
  superOutcome(n) {
    const pts = n.reduce((a, v, i) => { const d = Math.abs(v - SUPER.marks[i]); return a + (d <= SUPER.perfect ? 2 : d <= SUPER.near ? 1 : 0); }, 0);
    return pts >= 4 ? 'perfect' : pts === 3 ? 'goal' : 'saved';
  }

  superBallPoint(p, out) {
    if (p._hips === undefined) { p._hips = null; p.model.traverse((o) => { if (!p._hips && o.isBone && o.name.replace(':', '').endsWith('Hips')) p._hips = o; }); }
    const y = p._hips ? p._hips.getWorldPosition(tmp2).y : 1;
    const lead = 0.55 * SIZE;
    return out.set(p.pos.x + Math.cos(p.facing) * lead, Math.max(R, y + 0.1), p.pos.z + Math.sin(p.facing) * lead);
  }

  superShoot(p, s) {
    const b = this.ball, k = s.keeper, goalX = p.attackDir * FIELD.halfLength;
    const side = k.pos.z > 0 ? -1 : 1;
    const target = s.outcome === 'saved' ? new THREE.Vector3(k.pos.x, 1.1 * SIZE, k.pos.z)
      : new THREE.Vector3(goalX + p.attackDir * 0.4, 0.9, side * (FIELD.goalHalfWidth - 0.7));
    const from = b.pos.clone();
    const flight = Math.max(0.3, from.distanceTo(target) / SUPER.speed);
    b.kick(shootAtFast(from, target, flight), null, { shot: true, power: 1, perfect: s.outcome === 'perfect', noPickup: 9 });
    b.superStrike = { team: p.team, outcome: s.outcome };
    this.stats.shots[p.team]++;
    this.emit('shot', { team: p.team, perfect: s.outcome === 'perfect', superStrike: true });
    this.timeScale = 1;
    s.phase = 'flight'; s.t = 0; s.arrive = flight;
  }

  // keeper reaction and, when the strike was not good enough, the punch away
  superFlight(dt) {
    const s = this.superStrike, b = this.ball, k = s.keeper;
    s.t += dt;
    if (!s.reacted && s.t >= s.arrive - 0.3) {
      s.reacted = true;
      k.setState('react', {});
      if (s.outcome === 'perfect') { k.stun = 3; k.play('gk_s2s_blast_into_net', { fade: 0.05 }); }
      else if (s.outcome === 'goal') { k.stun = 3; k.play('gk_s2s_spin', { fade: 0.05 }); }
      else { k.stun = 0.6; k.play('gk_attack_s2s_high', { fade: 0.05 }); }
    }
    if (s.outcome === 'saved' && !s.deflected && (b.pos.distanceTo(tmp.set(k.pos.x, b.pos.y, k.pos.z)) < 1.0 * SIZE || s.t >= s.arrive)) {
      s.deflected = true;
      b.vel.set(k.attackDir * (10 + Math.random() * 4), 5 + Math.random() * 3, (Math.random() - 0.5) * 10);
      b.spin.set(0, 0, 0); b.magnus = false; b.noPickup = 0.35; b.shotTimer = 0; b.superStrike = null; b.lastTouch = k;
      k.stun = SUPER.keeperStun[0] + Math.random() * (SUPER.keeperStun[1] - SUPER.keeperStun[0]);
      k.play('gk_s2s_knocked_out_start', { fade: 0.05 });
      this.stats.saves[k.team]++;
      this.emit('save', { team: k.team, superStrike: true });
      this.hud.flash(t('flash.superSaved'));
      this.superStrike = null;
    } else if (s.outcome !== 'saved' && !b.inGoal && s.t >= s.arrive + 0.35) {
      // unstoppable: if a post or the net edge got in the way, it still counts
      b.inGoal = s.p.attackDir; b.events.push({ type: 'goal', side: s.p.attackDir });
    } else if (s.t > s.arrive + 2.5) { b.superStrike = null; b.noPickup = 0; this.superStrike = null; } // missed somehow: play on
  }

  // ------------------------------------------------------------- per-step logic

  humanControl(c, dt) {
    const p = c.player, inp = c.input;
    const mag = Math.hypot(inp.x, inp.z);
    if (p.state === 'free') {
      if (mag > 0.15) { p.desiredDir = Math.atan2(inp.z, inp.x); p.desiredSpeed = p.hasBall() ? p.cfg.runWithBall : p.cfg.run; }
      else p.desiredSpeed = 0;
      p.turbo = inp.turbo && mag > 0.15;
      if (p.turbo && !c.turboOn) this.emit('turbo', { team: c.team });
      c.turboOn = p.turbo;
      if (p.turbo) p.desiredSpeed = p.hasBall() ? p.cfg.turboWithBall[0] : p.cfg.turbo;
      // keyboard keys change meaning with the ball; controller buttons follow the chosen layout
      const a = inp.actions;
      const aim = mag > 0.15 ? p.desiredDir : p.facing;
      if (p.hasBall()) {
        if (a.has('pass') || a.has('passOrSwitch')) { const t = bestPassTarget(this, p, aim); if (t) this.doPass(p, t, false); }
        else if (a.has('lob') || a.has('lobOrHit')) { const t = bestPassTarget(this, p, aim); if (t) this.doPass(p, t, true); }
        else if (a.has('shootOrSlide')) this.startWindup(p);
        else if (a.has('deke') || a.has('dekeOrHit')) this.startDeke(p, inp.z * p.attackDir > 0 ? -1 : 1);
      } else {
        if (a.has('shootOrSlide') && p.tackleCooldown <= 0) this.startSlide(p);
        else if ((a.has('lobOrHit') || a.has('dekeOrHit')) && p.tackleCooldown <= 0) this.startHit(p);
        else if (a.has('switch') || a.has('passOrSwitch')) this.switchHuman(c);
      }
    } else if (p.state === 'windup' && !inp.shootHeld) {
      this.releaseShot(p);
    } else if (p.state === 'super' && (inp.actions.has('shootOrSlide') || inp.actions.has('shoot')) && this.superStrike) {
      this.superStrike.pressed = true;
    }
    inp.actions.clear();
  }

  switchHuman(c = this.controllers[0]) {
    if (!c) return;
    const target = this.ball.owner ? this.ball.owner.pos : this.ball.pos;
    let best = null, bd = 1e9;
    for (const q of this.players) {
      if (q.team !== c.team || q.isGoalie || this.controllerOf(q)) continue;
      const d = Math.hypot(q.pos.x - target.x, q.pos.z - target.z);
      if (d < bd) { bd = d; best = q; }
    }
    if (best) this.setControlled(c, best);
  }

  updateState(p, dt) {
    p.tackleCooldown = Math.max(0, p.tackleCooldown - dt);
    if (p.stun > 0) p.stun -= dt;
    switch (p.state) {
      case 'free':
        if (p.isGoalie) this.goalieAI(p, dt);
        else if (!p.humanControlled) {
          fielderAI(this, p, dt);
          if (this.isCpuTeam(p.team)) p.desiredSpeed *= this.cpuTune([0.9, 1, 1.05, 1.08]);
        }
        if (p.state === 'free') p.locomotion(dt);
        break;
      case 'pass':
        p.speed *= 0.9;
        p.pos.x += Math.cos(p.facing) * p.speed * dt; p.pos.z += Math.sin(p.facing) * p.speed * dt;
        if (!p.stateData.released && p.stateTime >= p.stateData.release) {
          if (this.ball.owner === p) this.releasePass(p); else p.stateData.released = true;
        }
        if (p.stateTime > (p.isGoalie ? 0.6 : 0.3)) p.setState('free');
        break;
      case 'windup': {
        p.speed = Math.max(0, p.speed - 6 * dt);
        const ctl = p.humanControlled && this.controllerOf(p);
        if (ctl) {
          const mag = Math.hypot(ctl.input.x, ctl.input.z);
          if (mag > 0.15) p.facing += Math.max(-dt * 6, Math.min(dt * 6, angleDiff(p.facing, Math.atan2(ctl.input.z, ctl.input.x))));
        } else {
          const goalX = p.attackDir * FIELD.halfLength;
          p.facing += Math.max(-dt * 6, Math.min(dt * 6, angleDiff(p.facing, Math.atan2(-p.pos.z * 0.6, goalX - p.pos.x))));
        }
        p.pos.x += Math.cos(p.facing) * p.speed * dt; p.pos.z += Math.sin(p.facing) * p.speed * dt;
        if (this.ball.owner !== p) { p.setState('free'); break; }
        // the captain keeps holding in the opponents' half: Super Strike
        const sup = this.canSuper(p);
        if (sup && p.stateTime >= SUPER.chargeSeconds) { this.startSuper(p); break; }
        if (p.stateData.aiHold !== null && p.stateData.aiHold !== undefined && p.stateTime >= p.stateData.aiHold) this.releaseShot(p);
        else if (!sup && p.stateTime > SHOT.windupSeconds + 0.4) this.releaseShot(p);
        else if (sup && !p.humanControlled && p.stateTime > SUPER.chargeSeconds + 0.5) this.releaseShot(p);
        else if (sup && !p.humanControlled && p.stateData.aiHold > SUPER.chargeSeconds && this.players.some((o) => o.team !== p.team && !o.isGoalie && o.stun <= 0
          && Math.hypot(o.pos.x - p.pos.x, o.pos.z - p.pos.z) < 0.5 * SIZE)) this.releaseShot(p); // CPU: someone is on it, shoot now
        break;
      }
      case 'super': {
        this.superUpdate(p, dt);
        break;
      }
      case 'kick':
        p.speed = Math.max(0, p.speed - 10 * dt);
        if (!p.stateData.released && p.stateTime >= p.stateData.release) {
          if (this.ball.owner === p) this.shootBall(p); else p.stateData.released = true;
        }
        if (p.stateTime > 0.55) { p.setState('free'); p.play('idle', { loop: true, fade: 0.2 }); }
        break;
      case 'slide': {
        const slideEnd = TACKLE.slideTime;
        if (p.stateTime < slideEnd) {
          p.speed = Math.max(3, p.speed - 8 * dt);
          p.pos.x += Math.cos(p.facing) * p.speed * dt; p.pos.z += Math.sin(p.facing) * p.speed * dt;
          // ball first: a clean tackle wins it
          const fx = p.pos.x + Math.cos(p.facing) * 0.45, fz = p.pos.z + Math.sin(p.facing) * 0.45;
          const b = this.ball;
          if (Math.hypot(b.pos.x - fx, b.pos.z - fz) < 0.55 * SIZE && b.pos.y < 0.6 * SIZE && !p.stateData.hit) {
            const victim = b.owner;
            if (victim && victim.team !== p.team) { this.knockDown(victim, p, 'slide'); p.stateData.hit = true; }
            else if (!victim) { b.kick(new THREE.Vector3(Math.cos(p.facing) * 7, 0.5, Math.sin(p.facing) * 7), null, { noPickup: 0.1 }); b.lastTouch = p; p.stateData.hit = true; }
          }
          for (const o of this.players) {
            if (o.team === p.team || o.isGoalie || o.state === 'react' || p.stateData.hit) continue;
            if (Math.hypot(o.pos.x - fx, o.pos.z - fz) < 0.55 * SIZE) { this.knockDown(o, p, 'slide'); p.stateData.hit = true; }
          }
        } else if (!p.stateData.recover) {
          p.stateData.recover = true;
          p.play('slide_tackle_up_fail', { fade: 0.08, rate: 1.6 });
        } else {
          p.speed = Math.max(0, p.speed - 20 * dt);
          if (p.stateTime > slideEnd + TACKLE.slideRecover + 0.25) p.setState('free');
        }
        break;
      }
      case 'hit': {
        if (p.stateTime < 0.3) {
          p.speed = 7.5;
          p.pos.x += Math.cos(p.facing) * p.speed * dt; p.pos.z += Math.sin(p.facing) * p.speed * dt;
          if (!p.stateData.done) for (const o of this.players) {
            if (o.team === p.team || o.isGoalie || o.state === 'react') continue;
            if (Math.hypot(o.pos.x - p.pos.x, o.pos.z - p.pos.z) < TACKLE.hitRange * 0.75 * (p.cfg.tackleReach ?? 1)) { this.knockDown(o, p, 'hit'); p.stateData.done = true; }
          }
        } else p.speed = Math.max(0, p.speed - 25 * dt);
        if (p.stateTime > 0.75) p.setState('free');
        break;
      }
      case 'deke':
        p.applyRootMotion();
        if (p.stateTime > 0.55) { p.setState('free'); p.speed = p.cfg.runWithBall * 0.7; }
        break;
      case 'react':
        p.applyRootMotion();
        if (p.stun <= 0) { p.setState('free'); p.speed = 0; }
        break;
      case 'celebrate':
      case 'dejected':
        break;
      case 'dive':
      case 'catch':
      case 'hold':
      case 'throw':
        this.goalieAction(p, dt);
        break;
    }
    if (p.humanControlled && !this.aiOnly && p.state === 'free') { /* already handled */ }
    p.clampToField();
  }

  // ------------------------------------------------------------- goalies

  goalieAI(g, dt) {
    const b = this.ball;
    const gx = -g.attackDir * FIELD.halfLength; // own goal line
    const out = g.attackDir; // direction to the pitch
    const inBox = (pt) => Math.abs(pt.x - gx) < FIELD.halfLength - FIELD.penaltyX && Math.abs(pt.z) < FIELD.penaltyHalfWidth;
    if (b.owner === g) { g.setState('hold', {}); g.play('gk_idle_with_Ball', { loop: true, fade: 0.1 }); return; }
    if (this.superStrike && this.superStrike.keeper === g) { g.desiredSpeed = 0; g.locomotion(dt); return; } // reacts in superFlight

    // incoming shot?
    if (!b.owner && (b.vel.x * -out) > 6) {
      const path = predict(b.pos, b.vel, b.spin, b.magnus, 1.4);
      const cross = path.find((s) => (s.p.x - gx) * out < 0.6);
      if (cross && Math.abs(cross.p.z) < FIELD.goalHalfWidth + GOALIE.saveIgnoreMargin && cross.p.y < FIELD.goalHeight + 0.6) {
        this.planSave(g, cross, path);
        return;
      }
    }
    // loose ball in the box: go and collect it
    if (!b.owner && inBox(b.pos) && b.vel.length() < 9 && b.pos.y < 1.5) {
      const meet = this.ballMeetPoint(g);
      this.goalieMove(g, meet.x, meet.z, g.cfg.run);
      return;
    }
    // positioning: on the line between ball and goal centre
    const bx = b.pos.x - gx, bz = b.pos.z, d = Math.hypot(bx, bz);
    const off = Math.min(2.6, 0.8 + d * 0.06);
    const tx = gx + (bx / (d || 1)) * off, tz = Math.max(-FIELD.goalHalfWidth + 0.35, Math.min(FIELD.goalHalfWidth - 0.35, (bz / (d || 1)) * off * 1.4));
    this.goalieMove(g, tx, tz, d < 18 ? g.cfg.run : g.cfg.jog);
  }

  goalieMove(g, x, z, speed) {
    const dx = x - g.pos.x, dz = z - g.pos.z, dd = Math.hypot(dx, dz);
    const faceBall = Math.atan2(this.ball.pos.z - g.pos.z, this.ball.pos.x - g.pos.x);
    if (dd < 0.15) { g.desiredSpeed = 0; g.facing += angleDiff(g.facing, faceBall) * 0.15; g.speed = 0; g.locomotionAnim(); return; }
    // short moves sideways keep facing the ball (strafe), long ones run
    if (dd < 2.5) {
      const step = Math.min(dd, g.cfg.run * 0.75 * (1 / 50));
      g.pos.x += (dx / dd) * step * 1; g.pos.z += (dz / dd) * step * 1;
      g.facing += angleDiff(g.facing, faceBall) * 0.2;
      g.speed = 0;
      const rel = angleDiff(g.facing, Math.atan2(dz, dx));
      const right = rel > 0;
      g.play('gk_strafe_300', { loop: true, restart: false, mirror: !right, rate: 1.2 });
      return;
    }
    g.desiredDir = Math.atan2(dz, dx); g.desiredSpeed = Math.min(speed, dd * 3);
    g.locomotion(1 / 50);
  }

  planSave(g, cross, path) {
    const b = this.ball;
    const out = g.attackDir;
    const right = new THREE.Vector3(-Math.sin(g.facing), 0, Math.cos(g.facing));
    const rel = tmp.copy(cross.p).sub(g.pos);
    const lateral = rel.dot(right);
    const reach = Math.abs(lateral);
    const power = b.shotPower || Math.min(1, b.vel.length() / 34);
    const time = Math.max(0.05, cross.t);
    // like the original: saved if the dive gets there in time (reaction + travel), and the ball is within reach.
    // High balls far from the body take a little longer. CPU level only changes the keeper's reaction.
    const react = g.cfg.saveReact * (this.isCpuTeam(g.team) ? this.cpuTune([1.4, 1, 0.85, 0.75]) : 1);
    const high = cross.p.y > 1.35 * SIZE && reach > GOALIE.standReach;
    // a perfect shot curves: the keeper reads it late (our choice, so the perfect shot stays the best weapon)
    const needed = react + (b.shotPerfect ? GOALIE.perfectReadDelay : 0) + Math.max(0, reach - GOALIE.standReach) / g.cfg.diveSpeed + (high ? 0.08 : 0);
    const success = time >= needed && reach <= g.cfg.diveReach + GOALIE.standReach && cross.p.y <= GOALIE.reachHeight;
    const height = cross.p.y < 0.55 * SIZE ? 'low' : cross.p.y < 1.35 * SIZE ? 'med' : 'high';
    let clip;
    const catchIt = power < GOALIE.catchMaxShotPower + 0.25 && !b.shotPerfect && Math.random() < (g.cfg.catchChance ?? 0.65);
    if (reach < 0.6 * SIZE) clip = catchIt ? 'gk_catch_' + height : 'gk_stand_defl_center_parry_' + height;
    else if (reach < 1.4 * SIZE) clip = catchIt ? 'gk_dive_catch_near_right_' + height : 'gk_dvng_defl_parry_near_right_' + height;
    else clip = catchIt ? 'gk_dive_catch_far_right_' + height : 'gk_dvng_defl_parry_far_right_' + height;
    if (!this.template.clips[clip]) clip = 'gk_dive_catch_far_right_med';
    g.setState('dive', { success, catchIt, target: cross.p.clone(), t0: time, from: g.pos.clone(), clip });
    g.play(clip, { fade: 0.04, mirror: lateral < 0 && reach >= 0.6, rate: Math.max(1, 0.45 / time) });
    g.facing = out > 0 ? 0 : Math.PI;
  }

  goalieAction(g, dt) {
    const b = this.ball;
    const d = g.stateData;
    if (g.state === 'dive') {
      const k = Math.min(1, g.stateTime / Math.max(0.12, d.t0));
      const tx = d.target.x - g.attackDir * 0.15, tz = Math.max(-FIELD.goalHalfWidth - 0.6, Math.min(FIELD.goalHalfWidth + 0.6, d.target.z));
      if (d.success) { g.pos.x = d.from.x + (tx - d.from.x) * k; g.pos.z = d.from.z + (tz - d.from.z) * k; }
      else { g.pos.x = d.from.x + (tx - d.from.x) * k * 0.5; g.pos.z = d.from.z + (tz - d.from.z) * k * 0.55; }
      if (d.success && !b.owner && !d.done) {
        const handY = Math.min(1.9, Math.max(0.3, d.target.y));
        if (Math.hypot(b.pos.x - g.pos.x, b.pos.z - g.pos.z) < 0.95 && Math.abs(b.pos.y - handY) < 1.0) {
          d.done = true;
          this.stats.saves[g.team]++;
          this.emit('save', { team: g.team });
          if (d.catchIt) { b.owner = g; b.vel.set(0, 0, 0); b.magnus = false; b.shotTimer = 0; this.hud.flash(t('flash.save')); }
          else {
            const s = b.vel.length() * 0.35;
            const ang = (g.attackDir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.6;
            b.kick(new THREE.Vector3(Math.cos(ang) * s, 3 + Math.random() * 3, Math.sin(ang) * s), null, { noPickup: 0.3 });
            b.lastTouch = g;
            this.hud.flash(t('flash.parry'));
          }
        }
      }
      if (g.stateTime > Math.max(0.9, d.t0 + 0.6)) {
        if (b.owner === g) { g.setState('hold', {}); g.play('gk_idle_with_Ball', { loop: true, fade: 0.15 }); }
        else { g.setState('free'); g.play('gk_recover_without_ball', { fade: 0.1, rate: 1.5 }); }
      }
    } else if (g.state === 'hold') {
      g.speed = 0;
      g.facing += angleDiff(g.facing, g.attackDir > 0 ? 0 : Math.PI) * 0.1;
      if (g.stateTime > GOALIE.holdTime * 0.6) {
        const t = bestPassTarget(this, g);
        if (t) {
          const dist = Math.hypot(t.pos.x - g.pos.x, t.pos.z - g.pos.z);
          if (dist > GOALIE.kickMinDist) {
            g.setState('throw', { kick: true, target: t });
            g.facing = Math.atan2(t.pos.z - g.pos.z, t.pos.x - g.pos.x);
            g.play('gk_kick_long', { fade: 0.08 });
            g.stateData.release = this.template.meta.gk_kick_long?.contact ?? 0.2;
          } else this.doPass(g, t, false), g.setState('throw', { kick: false, passDone: true, ...g.stateData });
        }
      }
    } else if (g.state === 'throw') {
      if (g.stateData.kick && !g.stateData.released && g.stateTime >= g.stateData.release && b.owner === g) {
        const t = g.stateData.target;
        const ang = (GOALIE.kickAngle[0] + Math.random() * (GOALIE.kickAngle[1] - GOALIE.kickAngle[0])) * Math.PI / 180;
        const dist = Math.hypot(t.pos.x - g.pos.x, t.pos.z - g.pos.z);
        const sp = Math.min(g.cfg.kick[1], Math.max(g.cfg.kick[0], Math.sqrt(dist * 14 / Math.sin(2 * ang)) * 0.9));
        const dir = Math.atan2(t.pos.z - g.pos.z, t.pos.x - g.pos.x);
        b.kick(new THREE.Vector3(Math.cos(dir) * Math.cos(ang) * sp, Math.sin(ang) * sp * 0.6, Math.sin(dir) * Math.cos(ang) * sp), null, { passTarget: t, noPickup: 0.4 });
        b.pos.y = 0.6;
        g.stateData.released = true;
      }
      if (g.stateData.passDone && b.owner === g && g.stateTime > 0.3) this.releasePass(g);
      if (g.stateTime > 0.9) g.setState('free');
    }
  }

  // ------------------------------------------------------------- ball & players

  ballStep(dt) {
    const b = this.ball;
    if (b.owner) {
      const o = b.owner;
      if (o.isGoalie) tmp.set(o.pos.x + Math.cos(o.facing) * 0.25 * SIZE, 0.75 * SIZE, o.pos.z + Math.sin(o.facing) * 0.25 * SIZE);
      else if (o.state === 'super') this.superBallPoint(o, tmp);
      else o.dribblePoint(tmp);
      b.vel.subVectors(tmp, b.pos).divideScalar(dt);
      b.pos.copy(tmp);
      b.lastTouch = o;
      return;
    }
    b.step(dt);
    // pickups and body deflections
    let taker = null, bestD = 1e9;
    for (const p of this.players) {
      if (p.state === 'react' || p.state === 'slide' || p.stun > 0) continue;
      const dx = b.pos.x - p.pos.x, dz = b.pos.z - p.pos.z, d = Math.hypot(dx, dz);
      const reachH = p.isGoalie ? Math.min(1.9 * SIZE, 2.5) : BALL.pickupHeight;
      const radius = p.isGoalie ? 0.75 * SIZE : BALL.pickupRadius;
      if (d < radius && b.pos.y < reachH && b.noPickup <= 0) {
        // a hard shot flying past a fielder deflects instead of sticking
        const sp = b.vel.length();
        if (!p.isGoalie && sp > 22 && b.shotTimer > 0) {
          if (b.lastTouch && b.lastTouch.team !== p.team) { b.vel.multiplyScalar(-0.3); b.vel.y = Math.abs(b.vel.y) + 2; b.magnus = false; b.noPickup = 0.2; b.lastTouch = p; }
          continue;
        }
        if (p.isGoalie) {
          const inBox = Math.abs(p.pos.x) > FIELD.penaltyX - 0.5 && Math.abs(p.pos.z) < FIELD.penaltyHalfWidth + 0.5;
          if (!inBox) continue;
        }
        if (d < bestD) { bestD = d; taker = p; }
      }
    }
    if (taker) {
      if (taker.isGoalie && b.shotTimer > 0 && b.lastTouch && b.lastTouch.team !== taker.team) {
        this.stats.saves[taker.team]++;
        this.emit('save', { team: taker.team });
        this.hud.flash(t('flash.save'));
        if (taker.state === 'dive') taker.stateData.done = true;
      }
      if (taker.team !== this.possTeam) { this.passChain[taker.team] = 0; this.possTeam = taker.team; }
      b.owner = taker; b.magnus = false; b.shotTimer = 0;
      if (b.passTarget && b.passTarget.team === taker.team && b.passTarget !== taker) { /* intercepted by a teammate: fine */ }
      b.passTarget = null;
      this.giveToTeamHuman(taker);
      taker.aiTimer = 0;
    }
  }

  separatePlayers() {
    const ps = this.players;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], c = ps[j];
      const minD = ((a.isGoalie ? 0.36 : 0.28) + (c.isGoalie ? 0.36 : 0.28)) * SIZE;
      const dx = c.pos.x - a.pos.x, dz = c.pos.z - a.pos.z, d = Math.hypot(dx, dz);
      if (d < minD && d > 1e-4) {
        const push = (minD - d) / 2, nx = dx / d, nz = dz / d;
        a.pos.x -= nx * push; a.pos.z -= nz * push; c.pos.x += nx * push; c.pos.z += nz * push;
      }
    }
  }

  fixedStep(dt) {
    this.step = (this.step || 0) + 1;
    for (const p of this.players) p.savePrev();
    this.ball.prevPos.copy(this.ball.pos);
    this.phaseTime += dt;
    this.time += dt;
    if (this.phase === 'kickoff') {
      for (const p of this.players) { p.speed = 0; p.locomotionAnim(); p.update(dt); }
      this.ballStep(dt);
      if (this.phaseTime > 1.2) this.phase = 'play';
      return;
    }
    if (this.phase === 'goal' || this.phase === 'end') {
      for (const p of this.players) {
        if (p.state === 'free' && !p.isGoalie) { p.desiredSpeed = 0; p.locomotion(dt); }
        if (p.state === 'react') p.applyRootMotion();
        p.update(dt);
      }
      this.ball.step(dt);
      if (this.phase === 'goal' && this.phaseTime > MATCH.goalPause) {
        if (this.golden) this.endMatch(); else this.kickoff(this.ball.inGoal > 0 ? 1 : 0);
      }
      return;
    }
    if (this.phase !== 'play') return;
    this.clock = Math.max(0, this.clock - dt);
    if (this.clock <= 0) {
      // knockout draw: one minute of golden goal, then the team with more shots
      if (this.knockout && !this.golden && this.score[0] === this.score[1]) {
        this.golden = true; this.clock = 60; this.hud.flash(t('flash.golden'), '#ffd21f', 2);
      } else { this.endMatch(); return; }
    }

    for (const c of this.controllers) if (c.player) this.humanControl(c, dt);
    for (const p of this.players) this.updateState(p, dt);
    this.separatePlayers();
    this.ballStep(dt);
    if (this.superStrike && this.superStrike.phase === 'flight') this.superFlight(dt);
    for (const p of this.players) p.update(dt);

    for (const e of this.ball.events) {
      if (e.type === 'goal') this.onGoal(e.side);
      else if (e.type === 'post') { this.stats.posts++; this.hud.sfx('post'); }
      else if (e.type === 'wall') this.hud.sfx('wall');
    }
    this.ball.events.length = 0;
  }

  onGoal(side) {
    // side = +1: ball went into the goal at +X, scored by team 0
    const team = side > 0 ? 0 : 1;
    const sup = this.ball.superStrike && this.ball.superStrike.team === team;
    this.score[team] += sup ? SUPER.points : 1;
    this.ball.superStrike = null; this.superStrike = null; this.timeScale = 1;
    const sc = this.ball.lastTouch && this.ball.lastTouch.team === team ? this.ball.lastTouch : null;
    this.emit('goal', { team, scorer: sc, perfect: !!this.ball.shotPerfect, chain: this.passChain[team], superStrike: sup,
      afterDeke: !!(sc && sc.lastDeke !== undefined && this.time - sc.lastDeke < 3) });
    this.phase = 'goal';
    this.phaseTime = 0;
    this.hud.goal(team, this.score);
    if (sup) this.hud.flash(t('flash.superGoal'), this.teams[team].color, 2.4);
    this.stadium.msgColor = this.teams[team].color; // scoreboard 'GOL!' in the scorer's colour
    for (const p of this.players) {
      p.desiredSpeed = 0;
      if (p.isGoalie) {
        if (p.team !== team) { p.setState('dejected'); p.play('gk_dejected_0' + (1 + Math.floor(Math.random() * 3)), { fade: 0.2 }); }
      } else if (p.team === team) { p.setState('celebrate'); p.play('wave', { fade: 0.2 }); }
    }
  }

  endMatch() {
    const [a, b] = this.score;
    this.winner = a > b ? 0 : b > a ? 1 : this.knockout
      ? (this.stats.shots[0] !== this.stats.shots[1] ? (this.stats.shots[0] > this.stats.shots[1] ? 0 : 1) : (Math.random() < 0.5 ? 0 : 1)) : null;
    this.phase = 'end';
    this.phaseTime = 0;
    for (const p of this.players) {
      p.desiredSpeed = 0;
      const won = this.score[p.team] > this.score[1 - p.team];
      if (!p.isGoalie && won) { p.setState('celebrate'); p.play('wave', { loop: true, fade: 0.3 }); }
      else if (p.isGoalie && !won && this.score[0] !== this.score[1]) { p.setState('dejected'); p.play('gk_dejected_02', { fade: 0.3 }); }
    }
    this.hud.end(this.score, this.humanTeam, this.stats);
  }

  // ------------------------------------------------------------- frame

  update(realDt) {
    this.acc += Math.min(0.1, realDt) * this.timeScale;
    while (this.acc >= PHYSICS_DT) { this.fixedStep(PHYSICS_DT); this.acc -= PHYSICS_DT; }
    const alpha = this.acc / PHYSICS_DT, frameDt = Math.min(0.1, realDt) * this.timeScale;
    for (const p of this.players) p.render(frameDt, alpha);
    this.ball.updateMesh(frameDt, alpha);
    const bp = this.ball.rpos;
    this.ballShadow.position.set(bp.x, 0.008, bp.z);
    const h = bp.y;
    this.ballShadow.scale.setScalar(1 + h * 0.25);
    this.ballShadow.material.opacity = Math.max(0.08, 0.35 - h * 0.05);
    this.updateCamera(realDt);
    this.stadium.update(realDt, this);
    this.hud.update(this);
  }

  updateCamera(dt) {
    // close side camera from the near touchline: it frames roughly 16 m of pitch around the play
    const focus = this.ball.owner ? this.ball.owner.rpos : this.ball.rpos; // drawn positions: no 50 Hz steps
    const lead = this.ball.owner ? this.ball.owner.attackDir * 1.5 : 0;
    const tx = Math.max(-16, Math.min(16, focus.x + lead));
    const tz = Math.max(-8, Math.min(7, focus.z));
    const k = 1 - Math.exp(-dt * 3.5);
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.z += (tz - this.camTarget.z) * k;
    // stay in front of the near-side stand (it starts 7.6 m behind the touchline)
    const camZ = Math.min(this.camTarget.z + 0.3 + 8.9 * this.camZoom, FIELD.halfWidth + 6.8);
    // Super Strike: closer, and looking up at the captain in the air
    const sup = this.superStrike && this.superStrike.phase !== 'flight';
    this.camLift += ((sup ? 1 : 0) - this.camLift) * (1 - Math.exp(-dt * 3));
    const zoom = this.camZoom * (1 - 0.22 * this.camLift);
    this.camera.position.set(this.camTarget.x, 0.5 + 5.7 * zoom, Math.min(this.camTarget.z + 0.3 + 8.9 * zoom, FIELD.halfWidth + 6.8));
    this.camera.lookAt(this.camTarget.x, 0.65 + 1.6 * this.camLift, this.camTarget.z + 0.3);
  }

}
