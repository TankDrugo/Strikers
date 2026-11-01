import * as THREE from 'three';
import { BALL, FIELD, FIELDER, GOALIE, SHOT, SUPER, TACKLE, PASS, MATCH, PHYSICS_DT, SIZE, SKILL, SKILL_FROM_LEVEL } from './config.js';
import { Ball, predict, shootAtFast } from './ball.js';
import { buildField, buildBallMesh } from './field.js';
import { Stadium } from './stadium.js';
import { stadiumTheme } from './stadiums.js';
import { Player, angleDiff, seekDirection } from './player.js';
import { fielderAI, bestPassTarget } from './ai.js';
import { Keeper, findBestSave } from './goalie.js';
import { t } from './ui/i18n.js';

const R = BALL.radius;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
// InterpolateRangeClamped(a, b, x0, x1, x)
const lerpRange = (a, b, x0, x1, x) => a + (b - a) * clamp01((x - x0) / (x1 - x0));
const FPS = 30; // the clips are sampled at 30 frames per second (trigger frames are clip frames)
const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

// Home spots for the four fielders of team 0 (attacking +X); team 1 is mirrored.
const HOMES = [[-11, -5], [-11, 5], [-4, -3.5], [-4, 3.5]];

export class Game {
  // opts.stadium: one of the stadiums of stadiums.js (default the Electric Arena)
  constructor(renderer, template, hud, opts = {}) {
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
    const theme = stadiumTheme(opts.stadium);
    this.stadiumId = theme.id;
    buildField(this.scene, { stadium: true, grass: theme.grass });
    this.stadium = new Stadium(this.scene, this.teams, theme.id);
    // the stadium's light rig
    const L = theme.light;
    this.hemi.color.setHex(L.sky); this.hemi.groundColor.setHex(L.ground); this.hemi.intensity = L.hemi;
    this.sun.color.setHex(L.sun); this.sun.intensity = L.sunI; this.sun.position.set(...L.sunPos);
    this.lightBase = { hemi: L.hemi, sun: L.sunI };
    this.ball = new Ball(buildBallMesh());
    this.keeper = new Keeper(this);
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
      g.energy = 100; // goalie fatigue (goalie.ini Shot Fatigue ...): catches need 90
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
    this.effects = []; // short-lived meshes (the Super Strike burst)
    this.camLift = 0;
    this.stats = { shots: [0, 0], saves: [0, 0], passes: [0, 0], tackles: [0, 0], posts: 0 };
    this.kickoff(0);
    // opening shot: the camera goes round the stadium for a few seconds before the first kick-off (any button skips)
    this.intro = { t: 0, dur: 3.6 };
    this.hud.flash(t('stadium.' + this.stadiumId), '#ffffff', 2.8);
  }

  emit(type, data) { if (this.onEvent) this.onEvent(type, data); }

  // A value of the difficulty tables (config.js SKILL). A side with human players reads DifficultyHuman.ini, a CPU side
  // the file of the chosen level; the keys in SKILL_FROM_LEVEL come from the chosen level for both (Game.cpp
  // ApplyDifficulty). Our menus also use fractional levels (Ultimate Team divisions, cup finals): those blend the two
  // whole levels around them (our choice; the original only has whole levels).
  skill(key, team = null) {
    const e = SKILL[key];
    if (team !== null && e.human !== undefined && !SKILL_FROM_LEVEL.includes(key) && !this.isCpuTeam(team)) return e.human;
    const l = Math.max(0, Math.min(3, this.cpuLevel)), i = Math.floor(l), k = l - i;
    const a = e.level[i], b = e.level[Math.min(3, i + 1)];
    return Array.isArray(a) ? a.map((v, j) => v + (b[j] - v) * k) : a + (b - a) * k;
  }

  // Fielder.cpp CalcRegularShot: chance (0..1) that the keeper must miss, from the bar value and the chosen level's curve
  shotMissChance(value) {
    const c = this.skill('shotChance'), v = [0, ...SKILL.shotValue, 1];
    const x = clamp01(value);
    for (let i = 1; i < v.length; i++) if (x <= v[i]) return (c[i - 1] + (c[i] - c[i - 1]) * (x - v[i - 1]) / (v[i] - v[i - 1])) / 100;
    return c[c.length - 1] / 100;
  }

  // ShotMeter.cpp CalcScoreValue: Shooting × 0.06 + charge × 0.29 + net open × 0.40 + distance × 0.25
  shotValue(p, charge, from, gk) {
    const goalX = p.attackDir * FIELD.halfLength, W = SHOT.weights, [d0, d1] = SHOT.valueDistance;
    const near = clamp01((d0 - Math.hypot(goalX - from.x, from.z)) / (d0 - d1));
    return (p.cfg.shooting ?? 1) * W.rating + charge * W.charge + this.netOpen(p, from, gk).open * W.netOpen + near * W.distance;
  }

  // The goal as seen from the ball: angles of the two posts and of the keeper, and the widest gap beside him over
  // Shot Net Open Angle (ShotMeter.cpp). Angles grow towards +Z for both teams.
  netOpen(p, from, gk) {
    const goalX = p.attackDir * FIELD.halfLength;
    const ang = (x, z) => Math.atan2((z - from.z) * p.attackDir, Math.max(0.05, (x - from.x) * p.attackDir)) * p.attackDir;
    const a0 = ang(goalX, -FIELD.goalHalfWidth), a1 = ang(goalX, FIELD.goalHalfWidth);
    const lo = Math.min(a0, a1), hi = Math.max(a0, a1);
    let ak = (lo + hi) / 2, gap = hi - lo, gaps = [gap / 2, gap / 2];
    if (gk && (gk.pos.x - from.x) * p.attackDir > 0.1) {
      const dk = Math.hypot(gk.pos.x - from.x, gk.pos.z - from.z), hw = Math.atan(SHOT.keeperHalfWidth / dk);
      ak = Math.max(lo, Math.min(hi, ang(gk.pos.x, gk.pos.z)));
      gaps = [Math.max(0, ak - hw - lo), Math.max(0, hi - ak - hw)];
      gap = Math.max(gaps[0], gaps[1]);
    }
    // gaps[0] is on the -Z post (side -1), gaps[1] on the +Z post (side +1)
    return { open: Math.min(1, gap * 180 / Math.PI / SHOT.netOpenAngle), sideAngles: [Math.max(0, ak - lo), Math.max(0, hi - ak)] };
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
    this.hemi = new THREE.HemisphereLight(0xcfe0ff, 0x2a3a2a, 1.35);
    this.scene.add(this.hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    this.sun = sun;
    // the Super Strike scene: the world goes dark, a special light on the captain (ActionShootToScore)
    this.capLight = new THREE.PointLight(0xfff1c0, 0, 9 * SIZE, 1.5);
    this.scene.add(this.capLight);
    this.darkness = 0;
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
      if (p.isGoalie) p.energy = 100;
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

  // CalcInterceptXY: where a target moving at velocity (vx, vz) meets something leaving `from` at `speed`; null if never
  // within `maxT` seconds
  interceptPoint(from, pos, vx, vz, speed, maxT) {
    const dx = pos.x - from.x, dz = pos.z - from.z;
    const a = vx * vx + vz * vz - speed * speed, b = 2 * (dx * vx + dz * vz), c = dx * dx + dz * dz;
    let T;
    if (Math.abs(a) < 1e-6) T = b < 0 ? -c / b : null;
    else {
      const disc = b * b - 4 * a * c;
      if (disc < 0) return null;
      const r = Math.sqrt(disc), t1 = (-b - r) / (2 * a), t2 = (-b + r) / (2 * a);
      T = [t1, t2].filter((x) => x > 0).sort((x, y) => x - y)[0] ?? null;
    }
    if (T === null || T > maxT) return null;
    return { x: pos.x + vx * T, z: pos.z + vz * T, t: T };
  }

  doPass(p, target, lob) {
    if (this.ball.owner !== p) return;
    const b = this.ball;
    const d0 = Math.hypot(target.pos.x - p.pos.x, target.pos.z - p.pos.z);
    // the receiver keeps running as he is (jog or run): SuggestPassTargetPosition + CalcInterceptXY
    const vx = Math.cos(target.facing) * target.speed, vz = Math.sin(target.facing) * target.speed;
    // Player.cpp DoCalculatePassSpeed: by the distance, minus half the speed at which he comes towards the passer
    const range = p.isGoalie ? p.cfg.pass : lob ? p.cfg.passVolley : p.cfg.passGround;
    const approach = -(vx * (target.pos.x - p.pos.x) + vz * (target.pos.z - p.pos.z)) / Math.max(0.01, d0);
    let speed = lerpRange(range[0], range[1], PASS.minDist, PASS.maxDist, d0) - PASS.approachShare * Math.max(0, approach);
    const lim = p.isGoalie ? p.cfg.pass : p.cfg.passGround; // DoClampPassSpeed: always within the ground pass limits
    speed = Math.max(lim[0], Math.min(lim[1], speed));
    const meet = this.interceptPoint(b.pos, target.pos, vx, vz, speed, PASS.leadMax) || { x: target.pos.x, z: target.pos.z };
    const tx = Math.max(-FIELD.halfLength + 0.5, Math.min(FIELD.halfLength - 0.5, meet.x)), tz = Math.max(-FIELD.halfWidth + 0.5, Math.min(FIELD.halfWidth - 0.5, meet.z));
    const from = b.pos.clone(), d = Math.hypot(tx - from.x, tz - from.z);
    let vel;
    if (lob) {
      // ShootAtFast with time = distance / speed, vertical at most 14 m/s
      vel = shootAtFast(from, new THREE.Vector3(tx, 0.9, tz), Math.max(0.2, d / speed));
      vel.y = Math.min(vel.y, PASS.lobMaxUp);
    } else {
      // straight at the speed, with a small vertical push of 0.5..2 m/s by the distance
      vel = new THREE.Vector3((tx - from.x) / Math.max(0.01, d) * speed, lerpRange(PASS.groundUp[0], PASS.groundUp[1], PASS.minDist, PASS.maxDist, d), (tz - from.z) / Math.max(0.01, d) * speed);
    }
    if (p.cfg.passError) vel.applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() * 2 - 1) * p.cfg.passError); // card passing stat
    p.setState('pass', { vel, lob, target });
    let clipName, mirror = false;
    if (p.isGoalie) {
      clipName = d > GOALIE.throwMinDist ? 'gk_throw_over_hand' : 'gk_throw_underhand';
      p.facing = Math.atan2(tz - p.pos.z, tx - p.pos.x);
    } else {
      // InitActionPass: pass_1200 / 300 / 600 / 900 (the 300 mirrored) by the angle to the receiver
      const rel = angleDiff(p.facing, Math.atan2(tz - p.pos.z, tx - p.pos.x));
      if (Math.abs(rel) <= Math.PI / 4) clipName = 'pass_1200';
      else if (Math.abs(rel) >= 3 * Math.PI / 4) clipName = 'pass_600';
      else { clipName = 'pass_300'; mirror = rel < 0; }
      if (!this.template.clips[clipName]) { clipName = 'pass_1200'; mirror = false; }
    }
    p.play(clipName, { fade: 0, mirror }); // globalanimproperties.cpp: passes blend in 0 s
    const dur = this.template.meta[clipName]?.duration ?? 0.33;
    p.stateData.release = p.isGoalie ? (this.template.meta[clipName]?.contact ?? 0.05) : PASS.release * dur; // ActionPass: TestTrigger(0.12)
    p.stateData.end = p.isGoalie ? 0.6 : dur;
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
    p.play('windup', { fade: 0.067 }); // globalanimproperties.cpp: windup blends in 0.067 s
  }

  // ShotMeter::ShotReleased: charge 0.25..1 over Shot Windup Seconds, 1 once the bar is full
  shotCharge(t) { return t >= SHOT.windupSeconds ? 1 : SHOT.chargeMin + (1 - SHOT.chargeMin) * t / SHOT.windupSeconds; }

  releaseShot(p) {
    const charge = this.shotCharge(p.stateTime);
    const perfect = charge >= SHOT.perfectFrom;
    const c = this.controllerOf(p);
    const aimZ = c ? c.input.z : null;
    p.setState('kick', { charge, perfect, aimZ });
    const target = this.shotTarget(p, this.ball.pos, aimZ);
    p.stateData.target = target;
    // InitActionShot: windup_kick, or windup_powershot with charge >= 0.99; the LEFT versions are the clips mirrored
    const clip = perfect ? 'windup_powershot' : 'windup_kick';
    const mirror = angleDiff(p.facing, Math.atan2(target.z - p.pos.z, target.x - p.pos.x)) < 0;
    p.play(clip, { fade: 0.04, mirror });
    p.stateData.release = SHOT.contactFrame / FPS; // ActionShot: TestFrameTrigger(1.825) at rate 1
    p.stateData.end = this.template.meta[clip]?.duration ?? 0.7;
  }

  // Fielder.cpp DoFindBestShotTarget: one of the posts (by the angles post/keeper, or the stick), a height between
  // the ground and the bar margins, always high from beyond High Shot Distance, the centre when very close
  shotTarget(p, from, aimZ) {
    const goalX = p.attackDir * FIELD.halfLength, gk = this.goalieOf(1 - p.team);
    const margin = R + FIELD.postRadius + SHOT.offsetFromPost;
    const dist = Math.hypot(goalX - from.x, from.z);
    let side;
    if (aimZ !== null && aimZ !== undefined && Math.abs(aimZ) > 0.2) side = Math.sign(aimZ);
    else {
      const [g0, g1] = this.netOpen(p, from, gk).sideAngles;
      side = Math.random() * (g0 + g1) < g1 ? 1 : -1;
    }
    const target = new THREE.Vector3(goalX, 0, side * (FIELD.goalHalfWidth - margin));
    target.y = dist > SHOT.highShotDistance ? FIELD.goalHeight - margin : margin + Math.random() * (FIELD.goalHeight - 2 * margin);
    if (dist < SHOT.straightDistance) target.z = 0;
    return target;
  }

  shootBall(p) {
    const { charge, perfect } = p.stateData;
    const b = this.ball;
    const goalX = p.attackDir * FIELD.halfLength;
    const gk = this.goalieOf(1 - p.team);
    const from = b.pos.clone();
    const target = p.stateData.target.clone();
    // speed from the distance to the nearest post and the charge (DoFindBestShotTarget)
    const dPost = Math.min(Math.hypot(goalX - from.x, -FIELD.goalHalfWidth - from.z), Math.hypot(goalX - from.x, FIELD.goalHalfWidth - from.z));
    const speed = lerpRange(p.cfg.shot[0], p.cfg.shot[1], SHOT.speedRange[0], SHOT.speedRange[1], dPost * (SHOT.speedChargeBias + charge));
    const value = this.shotValue(p, charge, from, gk);
    let flight = Math.max(0.1, from.distanceTo(target) / speed);
    // CalcRegularShot: aim error grows with the flight time and a low bar value
    const sc = flight * (SHOT.errorBias - value);
    target.z += (Math.random() * 2 - 1) * sc * SHOT.widthVariance * 2 * FIELD.goalHalfWidth;
    target.y = Math.max(R, target.y + (Math.random() * 2 - 1) * sc * SHOT.heightVariance * FIELD.goalHeight);
    flight = Math.max(0.1, from.distanceTo(target) / speed);
    let vel = shootAtFast(from, target, flight);
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
    // the dice roll: must the keeper miss this one? (mbShouldMiss)
    const shouldMiss = Math.random() < this.shotMissChance(value);
    b.kick(vel, spin, { magnus: perfect, shot: true, power: charge, perfect, value, shouldMiss });
    this.stats.shots[p.team]++;
    this.emit('shot', { team: p.team, perfect });
    this.hud.flash(perfect ? t('flash.perfect') : null);
    p.stateData.released = true;
    if (gk) this.keeper.onShot(gk);
  }

  // the nearest opponent with the ball, or the loose ball: what a slide or a shoulder charge is aimed at
  tackleTarget(p) {
    const b = this.ball;
    if (b.owner && b.owner.team !== p.team && !b.owner.isGoalie) {
      const o = b.owner;
      return { pos: o.pos, vx: Math.cos(o.facing) * o.speed, vz: Math.sin(o.facing) * o.speed };
    }
    if (!b.owner) return { pos: b.pos, vx: b.vel.x, vz: b.vel.z };
    return null;
  }

  // aim at the target's intercept point (FA InitActionSlideAttack / InitActionHit), if it is roughly ahead
  aimTackle(p, speed) {
    const tg = this.tackleTarget(p);
    if (!tg) return;
    const m = this.interceptPoint(p.pos, tg.pos, tg.vx, tg.vz, speed, TACKLE.slideInterceptTime);
    if (!m) return;
    const dir = Math.atan2(m.z - p.pos.z, m.x - p.pos.x);
    if (Math.abs(angleDiff(p.facing, dir)) < Math.PI / 2) p.facing = dir;
  }

  startSlide(p) {
    // F GetSlideAttackSpeed: WB Run Turbo Level 2 Speed (card tackling: ±0.4 % per point)
    const speed = p.cfg.turboWithBall[1] * (p.cfg.slideSpeed ?? 1);
    this.aimTackle(p, speed);
    p.setState('slide', { hit: false, held: true, foot: null });
    p.play('slide_tackle_1200', { fade: 0.05 });
    p.speed = speed;
    p.tackleCooldown = 1.2;
    this.stats.tackles[p.team]++;
  }

  // FA InitActionHit: speed = the clip's move between frames 4 and 14 over 0.333 s (for the aim); clip at 1.5×
  hitSpeed(p) {
    const r = this.template.meta.hit_1200?.root;
    if (!r) return 7.5;
    const [f0, f1] = TACKLE.hitFrames;
    return (r[Math.min(f1, r.length - 1)][0] - r[f0][0]) * (p.cfg.height / p.rigHeight) / ((f1 - f0) / FPS);
  }

  startHit(p) {
    this.aimTackle(p, this.hitSpeed(p));
    p.setState('hit', { done: false });
    p.play('hit_1200', { fade: 0.05, rate: TACKLE.hitRate });
    p.speed = 0;
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
      if (kind === 'slide') {
        // the slider's foot is on the ball: he takes it (PickupBall)
        b.owner = attacker; b.passTarget = null; b.shotTimer = 0; b.lastTouch = attacker;
        if (attacker.team !== this.possTeam) { this.passChain[attacker.team] = 0; this.possTeam = attacker.team; }
        this.giveToTeamHuman(attacker);
      } else {
        // ShootBallDueToContact: the ball goes on with the attacker's speed
        const sp = this.hitSpeed(attacker) * TACKLE.hitRate * 0.6;
        b.kick(new THREE.Vector3(Math.cos(attacker.facing) * sp, 1.5, Math.sin(attacker.facing) * sp), null, { noPickup: 0.25 });
        b.lastTouch = attacker;
      }
    }
    // pick the react clip by where the hit came from: 1200 front, 300 right, 600 back, 900 left (mirrored 300)
    const rel = angleDiff(victim.facing, Math.atan2(attacker.pos.z - victim.pos.z, attacker.pos.x - victim.pos.x));
    let dirName = '1200', mirror = false;
    if (Math.abs(rel) > 2.35) dirName = '600';
    else if (rel > 0.8) { dirName = '300'; }
    else if (rel < -0.8) { dirName = '300'; mirror = true; }
    const base = kind === 'slide' ? 'slide_tackle_react_' : 'hit_react_';
    const name = kind === 'slide' ? base + dirName : base + dirName;
    const clip = this.template.clips[name] ? name : base + '1200';
    victim.setState('react', {});
    // InitActionHitReact: down for the whole clip (card tackling of the victim: shorter)
    victim.stun = (this.template.meta[clip]?.duration ?? (kind === 'slide' ? TACKLE.stunSlide : TACKLE.stunHit)) * (victim.cfg.stunTime ?? 1);
    victim.speed = 0;
    victim.play(clip, { fade: 0.067, mirror });
    this.hud.sfx('hit');
  }

  // ------------------------------------------------------------- Super Strike

  // the only player who can do it: the team's captain (slot 0-3, never the keeper)
  isCaptain(p) { return !p.isGoalie && p.index === (this.teams?.[p.team]?.captain ?? 3); }

  canSuper(p) {
    return this.phase === 'play' && !this.superStrike && this.isCaptain(p) && this.ball.owner === p && p.pos.x * p.attackDir > 0;
  }

  // ShotMeter::Update, GetTotalDuration: Shot Windup Seconds + STS Windup Time
  superChargeSeconds(p) { return SHOT.windupSeconds + this.skill('stsWindup', p.team); }

  // FD (charge): at the switch to the long charge the CPU tries it with Captain ShootToScore Chance, only when free
  // (Open >= 0.8) and not too close to the keeper (closeness <= 0.65). The two fuzzy terms are estimates (config.js).
  cpuWantsSuper(p) {
    let near = 99;
    for (const o of this.players) if (o.team !== p.team && !o.isGoalie && o.stun <= 0) near = Math.min(near, Math.hypot(o.pos.x - p.pos.x, o.pos.z - p.pos.z));
    const k = this.goalieOf(1 - p.team), dk = Math.hypot(k.pos.x - p.pos.x, k.pos.z - p.pos.z);
    const [k0, k1] = SUPER.cpuKeeperDist;
    return clamp01(near / SUPER.cpuOpenDist) >= SUPER.cpuOpen && clamp01((k1 - dk) / (k1 - k0)) <= SUPER.cpuKeeperNear
      && Math.random() < this.skill('captainS2SChance', p.team);
  }

  startSuper(p) {
    const goalX = p.attackDir * FIELD.halfLength;
    // InitActionShootToScore: next to the goal line in front of the goal, or at the end of the match: a normal shot
    if ((Math.abs(goalX - p.pos.x) < SUPER.nearGoalLine && Math.abs(p.pos.z) < FIELD.goalHalfWidth) || this.clock < SUPER.endOfMatch) { this.releaseShot(p); return; }
    const dist = Math.hypot(goalX - p.pos.x, p.pos.z);
    const meta = this.template.meta.captain_shoot_to_score;
    // CPU presses: exact with Captain S2S Perfect First/Second Button Chance, otherwise a uniform error of ±0.3
    const pc = this.skill('captainS2SPerfect', p.team);
    const aim = (m) => (Math.random() < pc ? m : m + (Math.random() * 2 - 1) * SUPER.cpuError);
    this.superStrike = { p, keeper: this.goalieOf(1 - p.team), t: 0, dur: meta?.duration ?? 127 / FPS, phase: 'meter', needle: 0, up: true,
      n: [null, null], green: SUPER.perfectMin, outcome: null, value: 1, human: p.humanControlled,
      cpu: p.humanControlled ? null : [aim(SUPER.marks[0]), aim(SUPER.marks[1])], pressT: null,
      slow: lerpRange(SUPER.slowMo[0], SUPER.slowMo[1], SUPER.slowMoDist[0], SUPER.slowMoDist[1], dist), dist,
      frozen: false, dark: 0, light: 0, orbit: null, sceneT: 0 };
    p.setState('super', {});
    p.speed = 0;
    p.facing = Math.atan2(-p.pos.z, goalX - p.pos.x); // CalcAnimTurnAdjust: turned to the goal
    p.play('captain_shoot_to_score', { fade: 0.1, mirror: p.pos.z * p.attackDir > 0 }); // mirrored by the side of the pitch
    this.timeScale = this.superStrike.slow; // FindSTSDistanceAffectedPercentage
    this.hud.flash(t('flash.super'), '#ffd21f', 1.4);
    this.emit('superStart', { team: p.team });
  }

  // ActionShootToScore: the needle from the clip frame: up from the jump frame to the centre, down to the NIS begin frame
  superNeedle(f) {
    const j = SUPER.jumpFrame, n = SUPER.nisBeginFrame, c = (j + n) / 2;
    if (f < j) return 0;
    return f <= c ? (f - j) / (c - j) : Math.max(0, 1 - (f - c) / (n - c));
  }

  superUpdate(p, dt) {
    const s = this.superStrike;
    p.speed = 0;
    const dur = this.template.meta.captain_shoot_to_score?.duration ?? 127 / FPS;
    if (!s || s.p !== p || s.phase === 'flight') {
      // the ball is gone (or the strike was stopped): the clip runs to its end, then play on
      if (p.stateTime >= dur - 0.05) { p.setState('free'); p.play('idle', { loop: true, fade: 0.133 }); }
      return;
    }
    s.t += dt; // the clip plays at rate 1 in game time
    const f = s.t * FPS;
    if (s.phase === 'meter') {
      const c = (SUPER.jumpFrame + SUPER.nisBeginFrame) / 2;
      s.up = f <= c;
      s.needle = this.superNeedle(f);
      // a press counts at its own moment: the needle moves 0.05 per 50 Hz step, more than the green is wide
      if (s.pressT !== null && s.pressT !== undefined) {
        const fp = Math.min(s.pressT, s.t) * FPS;
        this.superPress(s, this.superNeedle(fp), fp <= c);
        s.pressT = null;
      }
      if (s.cpu && f >= SUPER.jumpFrame) {
        if (s.n[0] === null && s.up && s.needle >= s.cpu[0]) this.superPress(s, Math.max(s.cpu[0], 0), true);
        else if (s.n[0] !== null && !s.up && s.n[1] === null && s.cpu[1] >= 0 && s.needle <= Math.min(s.cpu[1], SUPER.secondBelow - 1e-3)) this.superPress(s, Math.min(s.cpu[1], SUPER.secondBelow - 1e-3), false);
      }
      if (!s.up && s.n[0] === null) s.n[0] = 1; // no first press by the centre: it counts as 1
      if (s.n[0] !== null) s.green = this.superGreen(s.n[0]);
      if (f >= SUPER.nisBeginFrame && s.n[1] === null) this.timeScale = SUPER.waitSlowMo;
      if (f >= SUPER.kickFrame) this.superResult(s);
    } else if (s.phase === 'scene') {
      if (s.outcome === 'super' && !s.atTime && f >= SUPER.superTimeFrame) { s.atTime = true; this.timeScale = 1; this.hud.flash(t('flash.super'), '#ffffff', 0.6); }
      if (!s.fx && f >= SUPER.effectFrame) { s.fx = true; s.light = 1; this.superEffect(p); }
      if (!s.lightOff && f >= SUPER.lightOffFrame) { s.lightOff = true; s.light = 0; }
      if (!s.noReturn && f >= SUPER.noReturnFrame) {
        s.noReturn = true; s.dark = 0; // fade_from_dark: the world comes back
        if (s.outcome === 'super') { s.orbit = { real: 0 }; this.timeScale = SUPER.orbitScale; }
      }
      if (f >= SUPER.nisEndFrame) this.superShoot(p, s);
    }
  }

  superPress(s, v, up) {
    // first press: only past Perfect Second Button Time; within Perfect Distance Min it is exactly perfect
    if (s.n[0] === null && up && v >= SUPER.marks[1]) s.n[0] = Math.abs(v - SUPER.marks[0]) < SUPER.perfectMin ? SUPER.marks[0] : v;
    // second press: only going down and below 0.6
    else if (s.n[0] !== null && !up && s.n[1] === null && v < SUPER.secondBelow) s.n[1] = v;
  }

  // green of the second press: Perfect Distance Min, widened up to Max × the character's multiplier when the first
  // press was within the yellow (the closer, the wider)
  superGreen(n0) {
    const d1 = Math.abs(n0 - SUPER.marks[0]), y = SUPER.yellow * SUPER.yellowScale;
    return d1 <= y ? SUPER.perfectMin + (SUPER.perfectMax * SUPER.greenScale - SUPER.perfectMin) * (1 - d1 / y) : SUPER.perfectMin;
  }

  // Fielder.cpp DoCalcShootToScoreResult, at the kick frame (27)
  superResult(s) {
    const y = SUPER.yellow * SUPER.yellowScale, green = this.superGreen(s.n[0]);
    const d2 = s.n[1] === null ? 1 : Math.abs(s.n[1] - SUPER.marks[1]);
    if (d2 <= green) s.outcome = s.n[0] === SUPER.marks[0] ? 'super' : 'goal';
    else if (d2 <= y) { s.value = (d2 - green) / (y - green); s.outcome = SUPER.yellowBounce * Math.random() < s.value ? 'saved' : 'yellow'; }
    else { s.outcome = 'saved'; s.value = 1; }
    s.green = green;
    s.phase = 'scene';
    s.dark = 1; // fade_to_dark_amount 1
    s.frozen = s.outcome === 'super'; // FreezeEveryoneButCaptain
    this.timeScale = s.outcome === 'super' ? s.slow : 1;
    this.emit('superResult', { team: s.p.team, outcome: s.outcome });
  }

  superBallPoint(p, out) {
    if (p._hips === undefined) { p._hips = null; p.model.traverse((o) => { if (!p._hips && o.isBone && o.name.replace(':', '').endsWith('Hips')) p._hips = o; }); }
    const y = p._hips ? p._hips.getWorldPosition(tmp2).y : 1;
    const lead = 0.55 * SIZE;
    return out.set(p.pos.x + Math.cos(p.facing) * lead, Math.max(R, y + 0.1), p.pos.z + Math.sin(p.facing) * lead);
  }

  // Fielder.cpp CalcShootToScoreShot, at frame 106: a low ball at 1.25 × the shot speed; the keeper's part by result
  superShoot(p, s) {
    const b = this.ball, k = s.keeper, goalX = p.attackDir * FIELD.halfLength;
    s.phase = 'flight'; s.frozen = false; s.orbit = null; s.dark = 0; s.light = 0; this.timeScale = 1;
    const from = b.pos.clone();
    const dPost = Math.min(Math.hypot(goalX - from.x, -FIELD.goalHalfWidth - from.z), Math.hypot(goalX - from.x, FIELD.goalHalfWidth - from.z));
    let speed = SUPER.speedScale * lerpRange(p.cfg.shot[0], p.cfg.shot[1], SHOT.speedRange[0], SHOT.speedRange[1], dPost * (SHOT.speedChargeBias + 1));
    const side = k.pos.z > 0 ? -1 : 1;
    let target = new THREE.Vector3(goalX, R + FIELD.postRadius + Math.random() * SUPER.targetLow, side * (FIELD.goalHalfWidth - R - FIELD.postRadius - SHOT.offsetFromPost));
    const kf = Math.atan2(from.z - k.pos.z, from.x - k.pos.x);
    let keeperDo = null;
    if (s.outcome === 'yellow') {
      // gk_s2s_knocked_out_start: the ball hits him (its ball bone at contact, ×SIZE)
      target = this.keeper.worldPoint(k, kf, 0.02, 1.172);
      keeperDo = 'stun';
    } else if (s.outcome === 'saved') {
      speed /= SUPER.bounceSlow;
      if (s.dist > SUPER.swatDistance && Math.random() < SUPER.swatChance * s.value) { target = this.keeper.worldPoint(k, kf, 0, 1.0); keeperDo = 'swat'; }
      else keeperDo = 'save';
    }
    let flight = Math.max(0.15, from.distanceTo(target) / speed);
    b.kick(shootAtFast(from, target, flight), null, { shot: true, power: 1, perfect: s.outcome === 'super', noPickup: 9 });
    b.superStrike = { team: p.team, outcome: s.outcome };
    if (keeperDo === 'save') {
      // a normal save with 75% catches and 0.1 s more; if its point is more than 1 m off, the ball goes just wide
      const pl = k.state === 'free' || k.state === 'react' ? this.keeper.plan(k) : null;
      const sv = pl && findBestSave(pl.lat, pl.h, pl.cross.t + SUPER.saveExtraTime, { allowCatch: Math.random() < SUPER.saveCatchShare, rate: k.cfg.saveRate ?? 1 });
      if (sv && sv.d <= SUPER.wideIfFarther) {
        target = this.keeper.worldPoint(k, pl.f, sv.pt[0], sv.pt[1]);
        flight = Math.max(0.15, from.distanceTo(target) / speed);
        b.vel.copy(shootAtFast(from, target, flight));
        k.setState('free');
        this.keeper.startSave(k, sv, { t: flight, f: pl.f, cross: { t: flight, p: target.clone() }, lat: sv.pt[0], h: sv.pt[1], miss: false, allowCatch: true, rate: k.cfg.saveRate ?? 1, kick: b.kickId });
      } else {
        target.z = side * (FIELD.goalHalfWidth + 0.35);
        flight = Math.max(0.15, from.distanceTo(target) / speed);
        b.vel.copy(shootAtFast(from, target, flight));
        k.setState('free'); this.keeper.onShot(k, { forceMiss: true, delay: SUPER.missDelay });
      }
    } else if (s.outcome === 'goal') {
      k.setState('free'); this.keeper.onShot(k, { forceMiss: true, delay: SUPER.missDelay }); // a missed save, at least 0.2 s late
    } else {
      // stun, swat, or the unstoppable strike (FindSTSMissData: blast into the net or spin): timed on the contact trigger
      const kind = keeperDo || (Math.random() < 0.5 ? 'blast' : 'spin');
      const clip = { stun: 'gk_s2s_knocked_out_start', swat: 'gk_ball_swat', blast: 'gk_s2s_blast_into_net', spin: 'gk_s2s_spin' }[kind];
      const m = this.template.meta[clip];
      const contact = kind === 'swat' ? 5 / 45 * (m?.duration ?? 1.5) : kind === 'stun' ? 0.32 * (m?.duration ?? 1.167) : 0.08; // trigger 0xcf84e7cd
      k.setState('sts', { kind, clip, contactAt: Math.max(0, flight - contact), started: false, hitAt: flight, from: k.pos.clone(), f: kf,
        mirror: kind === 'spin' ? (k.pos.z - target.z) * k.attackDir < 0 : false });
      k.facing = kf;
    }
    this.stats.shots[p.team]++;
    this.emit('shot', { team: p.team, perfect: s.outcome === 'super', superStrike: true });
    s.t = 0; s.arrive = flight;
  }

  // the keeper's Super Strike clips (state 'sts'): stunned save, swat, blasted into the net, spin
  superKeeper(k, dt) {
    const d = k.stateData, b = this.ball, meta = this.template.meta;
    if (!d.started && k.stateTime >= d.contactAt) { d.started = true; k.play(d.clip, { fade: 0.05, mirror: d.mirror }); d.t0 = k.stateTime; }
    if (d.kind === 'blast' && d.started) {
      // ends 1.5 m behind the goal line, through the net (no collisions)
      const goalX = -k.attackDir * (FIELD.halfLength + SUPER.blastBehind);
      const u = clamp01((k.stateTime - d.t0) / ((meta[d.clip]?.duration ?? 2.2) * 0.5));
      k.pos.x = d.from.x + (goalX - d.from.x) * u;
      k.pos.z = d.from.z * (1 - u * 0.3);
    } else if (d.kind === 'spin' && d.started) k.applyRootMotion();
    if (!d.hit && k.stateTime >= d.hitAt) {
      d.hit = true;
      if (d.kind === 'stun' || d.kind === 'swat') {
        // the ball bounces off him (a save: m_uGoalType 4 for the stun)
        const ang = (k.attackDir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.6, sp = b.vel.length() * 0.3;
        b.kick(new THREE.Vector3(Math.cos(ang) * sp, 4 + Math.random() * 3, Math.sin(ang) * sp), null, { noPickup: 0.35 });
        b.lastTouch = k; b.superStrike = null;
        k.energy = Math.max(0, k.energy - (d.kind === 'stun' ? GOALIE.fatigue.stsStun : GOALIE.fatigue.stsSave));
        this.stats.saves[k.team]++;
        this.emit('save', { team: k.team, superStrike: true });
        this.hud.flash(t('flash.superSaved'));
        if (d.kind === 'stun') d.stunUntil = k.stateTime + Math.max(0, (meta[d.clip]?.duration ?? 1.17) - (k.stateTime - d.t0)) + SUPER.keeperStun[0] + Math.random() * (SUPER.keeperStun[1] - SUPER.keeperStun[0]);
        this.superStrike = null;
      }
    }
    const len = meta[d.clip]?.duration ?? 1.5;
    if (d.kind === 'stun' && d.started) {
      // gk_s2s_knocked_out_start, then gk_s2s_defl_knocked_out_loop for Min..Max STS Stun Time, then the recovery
      if (!d.loop && k.stateTime - d.t0 >= len) { d.loop = true; k.play('gk_s2s_defl_knocked_out_loop', { loop: true, fade: 0.1 }); }
      if (d.loop && !d.rec && d.stunUntil && k.stateTime >= d.stunUntil) { d.rec = true; d.recAt = k.stateTime; k.play('gk_s2s_defl_knocked_out_recovery', { fade: 0.1 }); }
      if (d.rec && k.stateTime - d.recAt >= (meta.gk_s2s_defl_knocked_out_recovery?.duration ?? 1)) k.setState('free');
      return;
    }
    if (d.kind === 'spin' && d.started && !d.getup && k.stateTime - d.t0 >= len) { d.getup = true; d.getAt = k.stateTime; k.play('gk_s2s_prone_getup', { fade: 0.1 }); }
    const end = d.kind === 'spin' ? (d.getup ? d.getAt + (meta.gk_s2s_prone_getup?.duration ?? 2.5) : Infinity) : (d.t0 ?? Infinity) + len;
    if (d.started && k.stateTime >= end) {
      if (d.kind === 'blast') { k.pos.x = -k.attackDir * (FIELD.halfLength - 0.8); k.pos.z = 0; }
      k.setState('free');
    }
  }

  // ball flight of a strike that must go in: a post or the edge of the net cannot stop it
  superFlight(dt) {
    const s = this.superStrike, b = this.ball;
    s.t += dt;
    if ((s.outcome === 'super' || s.outcome === 'goal') && !b.inGoal && s.t >= s.arrive + 0.35) {
      b.inGoal = s.p.attackDir; b.events.push({ type: 'goal', side: s.p.attackDir });
    } else if (s.t > s.arrive + 2.5 || (b.owner && b.owner !== s.p)) { b.superStrike = null; b.noPickup = 0; this.superStrike = null; }
    else if (s.outcome === 'saved' && b.lastTouch === s.keeper) {
      this.hud.flash(t('flash.superSaved'));
      b.superStrike = null; b.noPickup = Math.min(b.noPickup, 0.35); this.superStrike = null;
    }
  }

  // CheckForSTSAttack (Goalie.cpp): while the captain charges, up to frame 24, the keeper may come out on him
  superAttackCheck(g) {
    const s = this.superStrike;
    const c = s ? s.p : this.players.find((p) => p.team !== g.team && p.state === 'windup' && this.canSuper(p) && p.stateTime > SHOT.windupSeconds);
    if (!c || c.team === g.team || (s && (s.keeper !== g || s.phase !== 'meter' || s.t * FPS >= SUPER.attackUntilFrame))) return false;
    const d = Math.hypot(c.pos.x - g.pos.x, c.pos.z - g.pos.z);
    if (d <= g.cfg.catchTolerance + SUPER.attackClose || (d <= SUPER.attackMax && Math.random() < SUPER.attackChance)) {
      g.setState('stsAttack', { target: c, done: false });
      g.facing = Math.atan2(c.pos.z - g.pos.z, c.pos.x - g.pos.x);
      g.play('gk_attack_s2s_high', { fade: 0.05 });
      return true;
    }
    return false;
  }

  // gk_attack_s2s_high: leaps at the captain; at the contact trigger (frame 13 of 37) he takes the ball if he is there
  superAttack(g, dt) {
    const d = g.stateData, c = d.target, b = this.ball, m = this.template.meta.gk_attack_s2s_high;
    const dc = Math.hypot(c.pos.x - g.pos.x, c.pos.z - g.pos.z);
    if (dc > 0.4 * SIZE) g.applyRootMotion(g.stateTime);
    if (!d.done && g.stateTime >= 13 / 37 * (m?.duration ?? 1.233)) {
      d.done = true;
      if (b.owner === c && dc < g.cfg.catchTolerance + 0.5 * SIZE) {
        if (this.superStrike && this.superStrike.p === c) { this.superStrike = null; this.timeScale = 1; }
        b.owner = g; b.vel.set(0, 0, 0); b.superStrike = null; b.passTarget = null;
        c.setState('react', {}); c.stun = TACKLE.stunHit; c.play('hit_react_1200', { fade: 0.067 });
        this.stats.saves[g.team]++;
        this.emit('save', { team: g.team, superStrike: true });
      }
    }
    if (g.stateTime >= (m?.duration ?? 1.2)) {
      if (b.owner === g) { g.setState('hold', {}); g.play('gk_idle_with_Ball', { loop: true, fade: 0.15 }); }
      else { g.setState('react', {}); g.stun = 0.45; g.play('gk_recover_without_ball', { fade: 0.1 }); }
    }
  }

  // <team>_captain_sts_effect at frame 67: a burst of the team colour around the captain
  superEffect(p) {
    const col = new THREE.Color(this.teams?.[p.team]?.color || '#ffd21f');
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.6 * SIZE, 0.08 * SIZE, 8, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.copy(p.rpos); m.position.y = 1.2 * SIZE; m.rotation.x = Math.PI / 2;
    this.scene.add(m);
    this.effects.push({ mesh: m, t: 0, life: 0.9 });
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
      const s = this.superStrike;
      if (s.pressT === null || s.pressT === undefined) s.pressT = s.t + dt; // no time from the frame: at this step
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
          fielderAI(this, p, dt); // the CPU runs at the speeds of the .ini files at every level
        }
        if (p.state === 'free') p.locomotion(dt);
        break;
      case 'pass':
        p.speed *= 0.9;
        p.pos.x += Math.cos(p.facing) * p.speed * dt; p.pos.z += Math.sin(p.facing) * p.speed * dt;
        if (!p.stateData.released && p.stateTime >= p.stateData.release) {
          if (this.ball.owner === p) this.releasePass(p); else p.stateData.released = true;
        }
        if (p.stateTime > (p.stateData.end ?? 0.3)) p.setState('free');
        break;
      case 'windup': {
        // asmRunningWB: turn towards the goal (Shot Windup Direction Seek Speed/Falloff), brake to a stop by the end
        const left = Math.max(0.01, SHOT.windupSeconds - p.stateTime);
        p.speed = Math.max(0, p.speed - Math.max(SHOT.windupDecel[0], Math.min(SHOT.windupDecel[1], p.speed / left)) * dt);
        const goalX = p.attackDir * FIELD.halfLength;
        p.facing = seekDirection(p.facing, Math.atan2(-p.pos.z, goalX - p.pos.x), SHOT.windupTurn, SHOT.windupTurnFalloff, dt);
        p.pos.x += Math.cos(p.facing) * p.speed * dt; p.pos.z += Math.sin(p.facing) * p.speed * dt;
        if (this.ball.owner !== p) { p.setState('free'); break; }
        // ShotMeter::Update: a full bar releases the shot, except the captain in the opponents' half (Super Strike)
        const sup = this.canSuper(p);
        const superAt = this.superChargeSeconds(p);
        // the CPU captain decides at the switch to the long charge
        if (sup && !p.humanControlled && p.stateTime >= SHOT.windupSeconds && !p.stateData.rolled) {
          p.stateData.rolled = true;
          if (!this.cpuWantsSuper(p)) { this.releaseShot(p); break; }
          p.stateData.aiHold = superAt + 1;
        }
        if (sup && p.stateTime >= superAt) { this.startSuper(p); break; }
        if (p.stateData.aiHold !== null && p.stateData.aiHold !== undefined && p.stateTime >= p.stateData.aiHold) this.releaseShot(p);
        else if (!sup && p.stateTime >= SHOT.windupSeconds) this.releaseShot(p);
        else if (sup && !p.humanControlled && p.stateData.aiHold > superAt && this.players.some((o) => o.team !== p.team && !o.isGoalie && o.stun <= 0
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
        if (p.stateTime > (p.stateData.end ?? 0.55)) { p.setState('free'); p.play('idle', { loop: true, fade: 0.133 }); }
        break;
      case 'slide': {
        // ActionSlideAttack: on while the button is held, at most Slide Attack Maximum Time; then the exponential brake
        const d = p.stateData, ctl = p.humanControlled && this.controllerOf(p);
        if (d.held && (p.stateTime >= TACKLE.slideTime || (ctl && !ctl.input.shootHeld))) {
          d.held = false; d.brakeAt = p.stateTime;
          if (this.ball.owner !== p) p.play('slide_tackle_up_fail', { fade: 0.08 });
        }
        if (!d.held) p.speed *= Math.pow(TACKLE.slideDecel, dt * 10);
        p.pos.x += Math.cos(p.facing) * p.speed * dt; p.pos.z += Math.sin(p.facing) * p.speed * dt;
        if (d.held && !d.hit) {
          // the slider's "ball" bone: a point ahead of him, swept since the last step so a fast slide cannot skip the ball
          const fx = p.pos.x + Math.cos(p.facing) * TACKLE.footReach, fz = p.pos.z + Math.sin(p.facing) * TACKLE.footReach;
          const px = d.foot ? d.foot[0] : fx, pz = d.foot ? d.foot[1] : fz;
          d.foot = [fx, fz];
          const b = this.ball, sx = fx - px, sz = fz - pz, L2 = sx * sx + sz * sz;
          const k = L2 > 1e-9 ? Math.max(0, Math.min(1, ((b.pos.x - px) * sx + (b.pos.z - pz) * sz) / L2)) : 0;
          if (Math.hypot(b.pos.x - (px + sx * k), b.pos.z - (pz + sz * k)) < TACKLE.footRadius + R && b.pos.y < 0.6 * SIZE) {
            const victim = b.owner;
            if (victim && victim.team !== p.team && !victim.isGoalie) { this.knockDown(victim, p, 'slide'); d.hit = true; }
            else if (!victim && b.noPickup <= 0) { b.owner = p; b.vel.set(0, 0, 0); b.passTarget = null; b.shotTimer = 0; b.lastTouch = p; this.giveToTeamHuman(p); d.hit = true; }
          }
          for (const o of this.players) {
            if (o.team === p.team || o.isGoalie || o.state === 'react' || d.hit) continue;
            if (Math.hypot(o.pos.x - fx, o.pos.z - fz) < FIELDER.capsuleRadius * 1.5) { this.knockDown(o, p, 'slide'); d.hit = true; }
          }
        }
        // with the ball: up after the brake; without: the whole slide_tackle_up_fail
        const upFail = this.template.meta.slide_tackle_up_fail?.duration ?? 1.0;
        if (!d.held && p.stateTime >= d.brakeAt + (this.ball.owner === p ? TACKLE.slideRecover : Math.max(TACKLE.slideRecover, upFail))) {
          p.setState('free');
          if (this.ball.owner === p) p.play('run_with_ball', { loop: true, fade: 0.1 });
        }
        break;
      }
      case 'hit': {
        // root motion of hit_1200 at 1.5×; contact during frames 4..14 of the clip
        const ct = p.stateTime * TACKLE.hitRate;
        p.applyRootMotion(ct);
        const [f0, f1] = TACKLE.hitFrames;
        if (!p.stateData.done && ct >= f0 / FPS && ct <= f1 / FPS) for (const o of this.players) {
          if (o.team === p.team || o.isGoalie || o.state === 'react') continue;
          if (Math.hypot(o.pos.x - p.pos.x, o.pos.z - p.pos.z) < TACKLE.hitReach * (p.cfg.tackleReach ?? 1)) { this.knockDown(o, p, 'hit'); p.stateData.done = true; }
        }
        if (ct >= (this.template.meta.hit_1200?.duration ?? 0.9)) p.setState('free');
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
      case 'dive': this.keeper.dive(p, dt); break;
      case 'trap': this.keeper.trap(p, dt); break;
      case 'sts': this.superKeeper(p, dt); break;
      case 'stsAttack': this.superAttack(p, dt); break;
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
    if (this.superAttackCheck(g)) return;
    if (this.superStrike && this.superStrike.keeper === g && this.superStrike.phase !== 'flight') { g.desiredSpeed = 0; g.locomotion(dt); return; } // reacts at the kick
    this.keeper.think(g, dt);
  }

  // rush: running at the ball carrier (no strafing)
  goalieMove(g, x, z, speed, rush = false) {
    const dx = x - g.pos.x, dz = z - g.pos.z, dd = Math.hypot(dx, dz);
    const faceBall = Math.atan2(this.ball.pos.z - g.pos.z, this.ball.pos.x - g.pos.x);
    if (dd < 0.15) { g.desiredSpeed = 0; g.facing += angleDiff(g.facing, faceBall) * 0.15; g.speed = 0; g.locomotionAnim(); return; }
    // short moves sideways keep facing the ball (strafe), long ones run
    if (dd < 2.5 && !rush) {
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

  goalieAction(g, dt) {
    const b = this.ball;
    if (g.state === 'hold') {
      g.speed = 0;
      g.facing += angleDiff(g.facing, g.attackDir > 0 ? 0 : Math.PI) * 0.1;
      // Goalie Ball Time: out within 2 s, earlier if a teammate is free
      if (g.stateTime > GOALIE.holdLookTime) {
        const t = bestPassTarget(this, g);
        const free = t && this.players.every((o) => o.team === t.team || o.isGoalie || Math.hypot(o.pos.x - t.pos.x, o.pos.z - t.pos.z) > 4);
        if (t && (free || g.stateTime >= GOALIE.holdTime)) {
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
      if (b.vel.length() > BALL.maxSpeed) b.vel.setLength(BALL.maxSpeed); // a carried ball snapping to the hands is not a flight
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
        const sp = b.vel.length();
        // a hard shot flying past a fielder deflects instead of sticking
        if (!p.isGoalie && sp > 22 && b.shotTimer > 0) {
          if (b.lastTouch && b.lastTouch.team !== p.team) { b.vel.multiplyScalar(-0.3); b.vel.y = Math.abs(b.vel.y) + 2; b.magnus = false; b.noPickup = 0.2; b.lastTouch = p; }
          continue;
        }
        if (p.isGoalie) {
          // within the box (plus Loose Ball Range); an opponent's shot in flight is only stopped by a save (goalie.js)
          const extra = Math.max(0.5, this.skill('looseBallRange', p.team));
          const inBox = Math.abs(p.pos.x) > FIELD.penaltyX - extra && Math.abs(p.pos.z) < FIELD.penaltyHalfWidth + extra;
          if (!inBox || p.state === 'dive' || p.state === 'trap') continue;
          if (b.shotTimer > 0 && b.lastTouch && b.lastTouch.team !== p.team && sp > 5) continue;
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
      if (this.intro) {
        this.intro.t += dt;
        if (this.intro.t >= this.intro.dur || this.controllers.some((c) => c.input.actions.size)) { this.intro = null; this.phaseTime = 0; }
        for (const c of this.controllers) c.input.actions.clear();
      }
      if (this.phaseTime > 1.2 && !this.intro) this.phase = 'play';
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

    // during the unstoppable Super Strike everybody but the captain is frozen (FreezeEveryoneButCaptain)
    const frozen = this.superStrike && this.superStrike.frozen ? this.superStrike.p : null;
    for (const c of this.controllers) if (c.player && (!frozen || c.player === frozen)) this.humanControl(c, dt);
    for (const p of this.players) if (!frozen || p === frozen) this.updateState(p, dt);
    if (!frozen) this.separatePlayers();
    this.ballStep(dt);
    if (this.superStrike && this.superStrike.phase === 'flight') this.superFlight(dt);
    for (const p of this.players) if (!frozen || p === frozen) p.update(dt);

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
      if (p.isGoalie) p.energy = 100; // the fatigue goes back to zero at every goal
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
    const ss = this.superStrike;
    // super: the camera turns around the ball for 4.25 real seconds with the time at 0.005, then the time is 1 again
    if (ss && ss.orbit) { ss.orbit.real += Math.min(0.1, realDt); if (ss.orbit.real >= SUPER.orbitSeconds && this.timeScale < 1) this.timeScale = 1; }
    this.acc += Math.min(0.1, realDt) * this.timeScale;
    // Super Strike meter: a press seen this frame happened at the game time not yet stepped (s.t + acc)
    if (ss && ss.phase === 'meter' && ss.p.humanControlled && (ss.pressT === null || ss.pressT === undefined)) {
      const c = this.controllerOf(ss.p);
      if (c && (c.input.actions.has('shootOrSlide') || c.input.actions.has('shoot'))) ss.pressT = ss.t + this.acc;
    }
    while (this.acc >= PHYSICS_DT) { this.fixedStep(PHYSICS_DT); this.acc -= PHYSICS_DT; }
    const alpha = this.acc / PHYSICS_DT, frameDt = Math.min(0.1, realDt) * this.timeScale;
    const frozen = this.superStrike && this.superStrike.frozen ? this.superStrike.p : null;
    for (const p of this.players) p.render(frozen && p !== frozen ? 0 : frameDt, alpha);
    this.updateSuperLook(Math.min(0.1, realDt));
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

  // world darkness, the captain's light and the burst of the Super Strike scene (real time)
  updateSuperLook(dt) {
    const s = this.superStrike;
    const want = s && s.phase === 'scene' ? s.dark * (s.outcome === 'super' ? 0.85 : 0.6) : 0;
    this.darkness += (want - this.darkness) * (1 - Math.exp(-dt * (want > this.darkness ? 6 : 3)));
    this.hemi.intensity = this.lightBase.hemi * (1 - this.darkness);
    this.sun.intensity = this.lightBase.sun * (1 - this.darkness);
    const lightOn = s && s.phase === 'scene' ? (s.light ? 1 : 0.35) * Math.min(1, this.darkness * 2) : 0;
    this.capLight.intensity += (lightOn * 6 - this.capLight.intensity) * (1 - Math.exp(-dt * 8));
    if (s) this.capLight.position.set(s.p.rpos.x, 2.6 * SIZE, s.p.rpos.z + 1.2);
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.t += dt;
      const k = e.t / e.life;
      e.mesh.scale.setScalar(1 + k * 3);
      e.mesh.material.opacity = 0.9 * (1 - k);
      if (k >= 1) { this.scene.remove(e.mesh); e.mesh.geometry.dispose(); e.mesh.material.dispose(); this.effects.splice(i, 1); }
    }
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
    const ss = this.superStrike;
    if (this.intro) {
      // from high above, outside the stands (the scenery shows), down in an arc to the touchline camera
      const u = Math.min(1, this.intro.t / this.intro.dur), e = u * u * (3 - 2 * u);
      const end = new THREE.Vector3(0, 0.5 + 5.7 * this.camZoom, 0.3 + 8.9 * this.camZoom);
      const r1 = Math.hypot(end.x, end.z), a = Math.PI / 2 + 1.05 * (1 - e), r = 74 + (r1 - 74) * e;
      if (this.camera.fov !== 42) { this.camera.fov = 42; this.camera.updateProjectionMatrix(); }
      this.camera.position.set(Math.cos(a) * r, 34 + (end.y - 34) * e, Math.sin(a) * r);
      this.camera.lookAt(0, 6 * (1 - e) + 0.65 * e, -14 * (1 - e) + 0.3 * e);
      this.camTarget.set(0, 0, 0);
      return;
    }
    if (ss && ss.phase === 'scene') { this.superCamera(ss, dt); return; }
    if (this.camera.fov !== 42) { this.camera.fov = 42; this.camera.updateProjectionMatrix(); }
    // Super Strike: closer, and looking up at the captain in the air
    const sup = ss && ss.phase === 'meter';
    this.camLift += ((sup ? 1 : 0) - this.camLift) * (1 - Math.exp(-dt * 3));
    const zoom = this.camZoom * (1 - 0.22 * this.camLift);
    this.camera.position.set(this.camTarget.x, 0.5 + 5.7 * zoom, Math.min(this.camTarget.z + 0.3 + 8.9 * zoom, FIELD.halfWidth + 6.8));
    this.camera.lookAt(this.camTarget.x, 0.65 + 1.6 * this.camLift, this.camTarget.z + 0.3);
  }

  // the scene from frame 27 (we have no camera animation of the original: a slow move around the captain, low; at the
  // point of no return of a super, 0.61 turns around the ball in 4.25 s with a 50° lens)
  superCamera(s, dt) {
    const p = s.p, b = this.ball.rpos;
    s.sceneT += dt;
    const back = -p.attackDir;
    if (s.orbit) {
      const a = Math.PI / 2 + s.orbit.real / SUPER.orbitSeconds * SUPER.orbitTurns * Math.PI * 2;
      if (this.camera.fov !== SUPER.orbitFov) { this.camera.fov = SUPER.orbitFov; this.camera.updateProjectionMatrix(); }
      this.camera.position.set(b.x + Math.cos(a) * 3.2 * back, b.y + 0.6, b.z + Math.sin(a) * 3.2);
      this.camera.lookAt(b.x, b.y, b.z);
      return;
    }
    const a = 1.15 + 0.12 * s.sceneT;
    const cx = p.rpos.x + Math.cos(a) * 6.5 * back, cz = p.rpos.z + Math.sin(a) * 6.5;
    const k = 1 - Math.exp(-dt * 4);
    this.camera.position.x += (cx - this.camera.position.x) * k;
    this.camera.position.y += (1.4 * SIZE - this.camera.position.y) * k;
    this.camera.position.z += (cz - this.camera.position.z) * k;
    this.camera.lookAt(p.rpos.x, 1.6 * SIZE, p.rpos.z);
  }
}
