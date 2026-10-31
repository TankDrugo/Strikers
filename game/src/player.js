import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { FIELDER, GOALIE, FIELD, BALL, SIZE, RIG_HEIGHT, ANIM_RATE_MIN, ANIM_RATE_MAX } from './config.js';
import { fielderConfig, goalieConfig } from './stats.js';

const U16 = (Math.PI * 2) / 65536; // 16-bit angle unit in radians
const tmpV = new THREE.Vector3();

export function angleDiff(a, b) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// AiUtil.cpp SeekDirection: constant turn rate, easing in over the last `falloff` units.
export function seekDirection(cur, desired, speedUnits, falloffUnits, dt) {
  const diff = angleDiff(cur, desired);
  const abs = Math.abs(diff) / U16;
  if (abs < 1e-3) return desired;
  let step;
  if (abs < falloffUnits) {
    const coef = (falloffUnits * falloffUnits) / speedUnits;
    step = abs - coef / (dt + coef / abs);
  } else step = dt * speedUnits;
  if (step >= abs) return desired;
  return cur + Math.sign(diff) * step * U16;
}

export function seekSpeed(cur, desired, accel, decel, dt) {
  if (cur <= desired) return Math.min(desired, cur + accel * dt);
  return Math.max(desired, cur - decel * dt);
}

export class Player {
  // stats: Ultimate Team card stats (see stats.js), or nothing for the original values
  constructor(game, template, team, role, index, stats = null) {
    this.game = game;
    this.team = team; // 0 or 1; team 0 attacks +X
    this.role = role; // 'fielder' | 'goalie'
    this.index = index;
    this.isGoalie = role === 'goalie';
    this.charId = template.id;
    this.stats = stats;
    this.cfg = this.isGoalie ? goalieConfig(stats || {}) : fielderConfig(stats || {});
    this.model = SkeletonUtils.clone(template.scene);
    this.baseHeight = template.height;
    this.rigHeight = this.isGoalie ? RIG_HEIGHT.goalie : RIG_HEIGHT.fielder;
    this.scale = this.cfg.height / template.height;
    this.model.scale.setScalar(this.scale);
    this.model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.frustumCulled = false;
        if (template.teamMaterials) o.material = template.teamMaterials[team];
      }
    });
    this.prevPos = new THREE.Vector3();
    this.rpos = new THREE.Vector3();
    this.prevFacing = 0;
    this.root = new THREE.Group();
    this.root.add(this.model);
    game.scene.add(this.root);
    const teamColor = game.teams?.[team]?.color ?? (team === 0 ? '#ffd23f' : '#ff4f4f');
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.28 * SIZE, 0.36 * SIZE, 28), new THREE.MeshBasicMaterial({ color: teamColor, transparent: true, opacity: 0.8, depthWrite: false }));
    // dark edge around the ring so any team colour reads on the grass
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x0b1410, transparent: true, opacity: 0.55, depthWrite: false });
    for (const [a, b] of [[0.255, 0.28], [0.36, 0.39]]) this.ring.add(new THREE.Mesh(new THREE.RingGeometry(a * SIZE, b * SIZE, 28), edgeMat));
    this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = 0.012;
    this.root.add(this.ring);
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.33 * SIZE, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2; this.shadow.position.y = 0.006;
    this.root.add(this.shadow);

    this.mixer = new THREE.AnimationMixer(this.model);
    this.clips = template.clips;
    this.meta = template.meta;
    this.actions = {};
    this.current = null;
    this.currentName = '';
    this.mirrored = false;

    this.pos = new THREE.Vector3();
    this.facing = 0; // radians, 0 = +X
    this.speed = 0;
    this.desiredDir = 0;
    this.desiredSpeed = 0;
    this.turbo = false;
    this.state = 'free';
    this.stateTime = 0;
    this.stateData = {};
    this.stun = 0;
    this.humanControlled = false;
    this.home = new THREE.Vector3();
    this.lastRoot = null;
  }

  get attackDir() { return this.team === 0 ? 1 : -1; }
  get forward() { return tmpV.set(Math.cos(this.facing), 0, Math.sin(this.facing)); }
  hasBall() { return this.game.ball.owner === this; }

  action(name) {
    if (!this.actions[name]) {
      const clip = this.clips[name];
      if (!clip) return null;
      const a = this.mixer.clipAction(clip);
      this.actions[name] = a;
    }
    return this.actions[name];
  }

  play(name, { loop = false, fade = 0.12, rate = 1, mirror = false, restart = true, start = 0 } = {}) {
    const a = this.action(name);
    if (!a) return;
    if (this.currentName === name && !restart && this.mirrored === mirror) { a.timeScale = rate; return; }
    a.reset();
    a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    a.clampWhenFinished = !loop;
    a.timeScale = rate;
    a.time = start;
    a.enabled = true;
    a.setEffectiveWeight(1);
    if (this.current && this.current !== a) this.current.crossFadeTo(a, this.mirrored !== mirror ? 0.04 : fade, false);
    a.play();
    this.current = a;
    this.currentName = name;
    this.mirrored = mirror;
    this.model.scale.x = mirror ? -this.scale : this.scale; // mirrored clips: like m_bMirror in the original
    this.lastRoot = null;
  }

  clipTime() { return this.current ? this.current.time : 0; }
  clipDone() { return !this.current || (this.current.time >= this.current.getClip().duration - 1e-3 && !this.current.isRunning()) || this.current.time >= this.current.getClip().duration - 1e-3; }

  // Root motion of the current clip, moved into world space (for slides, hits, reactions, dekes).
  applyRootMotion() {
    const m = this.meta[this.currentName];
    if (!m || !this.current) return;
    const t = Math.min(this.current.time, m.duration);
    const k = Math.min(m.root.length - 1, Math.max(0, t * 30));
    const i = Math.floor(k), f = k - i, a = m.root[i], b = m.root[Math.min(i + 1, m.root.length - 1)];
    const fwd = a[0] + (b[0] - a[0]) * f, left = (a[1] + (b[1] - a[1]) * f) * (this.mirrored ? -1 : 1);
    const sizeK = this.cfg.height / this.rigHeight;
    if (this.lastRoot) {
      const df = (fwd - this.lastRoot[0]) * sizeK, dl = (left - this.lastRoot[1]) * sizeK;
      const c = Math.cos(this.facing), s = Math.sin(this.facing);
      // game axes: forward = facing, left = facing + 90° (towards -Z when facing +X in this world)
      this.pos.x += c * df + s * dl;
      this.pos.z += s * df - c * dl;
    }
    this.lastRoot = [fwd, left];
  }

  setState(state, data = {}) {
    this.state = state;
    this.stateTime = 0;
    this.stateData = data;
    this.lastRoot = null;
  }

  locomotion(dt) {
    const hasBall = this.hasBall();
    let topSpeed = this.desiredSpeed;
    const c = this.isGoalie ? FIELDER : this.cfg;
    let turn = this.cfg.turnRun ?? this.cfg.turn, accel = c.accel, decel = c.decel;
    if (!this.isGoalie) {
      if (hasBall) { turn = this.turbo ? c.turnTurboWithBall : c.turnWithBall; accel = c.accelWB; decel = c.decelWB; }
      else if (this.turbo) { turn = c.turnTurbo; accel = c.accelTurbo; decel = c.decelTurbo; }
    }
    if (this.desiredSpeed > 0.05) this.facing = seekDirection(this.facing, this.desiredDir, turn, FIELDER.turnFalloff, dt);
    const align = Math.max(0, Math.cos(angleDiff(this.facing, this.desiredDir)));
    this.speed = seekSpeed(this.speed, topSpeed * (0.35 + 0.65 * align), accel, this.desiredSpeed < 0.05 ? FIELDER.stopDecel * 3 : decel, dt);
    this.pos.x += Math.cos(this.facing) * this.speed * dt;
    this.pos.z += Math.sin(this.facing) * this.speed * dt;
    this.locomotionAnim();
  }

  locomotionAnim() {
    const hasBall = this.hasBall();
    let name;
    if (this.isGoalie) {
      name = this.speed < 0.3 ? (hasBall ? 'gk_idle_with_Ball' : 'gk_ready_idle') : 'gk_run_fwd';
    } else if (this.speed < 0.3) name = 'idle';
    else if (this.turbo && this.speed > 6.2) name = hasBall ? 'turbo_with_ball_level_1' : 'turbo_run';
    else if (this.speed < 4.6) name = 'jog';
    else name = 'run_with_ball'; // ANIM_RUN and ANIM_RUN_WB both use this clip
    const m = this.meta[name];
    let rate = 1;
    if (this.speed >= 0.3 && m && m.linear_speed > 0.1) {
      rate = Math.min(ANIM_RATE_MAX, Math.max(ANIM_RATE_MIN, this.speed / (m.linear_speed * (this.cfg.height / this.rigHeight))));
    }
    this.play(name, { loop: true, rate, restart: false, fade: 0.133 });
  }

  // Fixed step (50 Hz): game time only. Drawing happens in render().
  update(dt) {
    this.stateTime += dt;
  }

  // Remember where the body was before a fixed step, so render() can draw between two steps.
  savePrev() {
    this.prevPos.copy(this.pos);
    this.prevFacing = this.facing;
  }

  // Every displayed frame: animation advances by the real frame time and the body is drawn
  // between the last two physics steps (alpha 0..1). Without this, a 60/120 Hz screen shows
  // positions that only change at 50 Hz, which reads as judder/blur when anybody moves.
  render(frameDt, alpha = 1) {
    this.mixer.update(frameDt);
    if (this.prevPos.distanceToSquared(this.pos) > 4) this.prevPos.copy(this.pos); // teleport (kickoff)
    this.rpos.lerpVectors(this.prevPos, this.pos, alpha);
    this.root.position.copy(this.rpos);
    this.root.rotation.y = Math.PI / 2 - (this.prevFacing + angleDiff(this.prevFacing, this.facing) * alpha);
    this.ring.material.opacity = this.humanControlled ? 1 : 0.85;
    this.ring.scale.setScalar(this.humanControlled ? 1.35 : 1);
  }

  // Ball carried at the feet while dribbling (the original follows the 'ball' bone of each clip).
  dribblePoint(out) {
    const lead = this.isGoalie ? 0.0 : 0.42 * SIZE + Math.min(this.speed, 8) * 0.025;
    const bob = this.isGoalie ? 0.55 * SIZE : 0;
    out.set(this.pos.x + Math.cos(this.facing) * lead, BALL.radius + bob, this.pos.z + Math.sin(this.facing) * lead);
    if (!this.isGoalie && this.speed > 0.5) {
      const ph = (this.clipTime() * 2 * Math.PI) / Math.max(0.3, (this.current?.getClip().duration || 0.57));
      out.x += Math.cos(this.facing) * Math.sin(ph) * 0.12;
      out.z += Math.sin(this.facing) * Math.sin(ph) * 0.12;
    }
    return out;
  }

  clampToField() {
    const hl = FIELD.halfLength - 0.35, hw = FIELD.halfWidth - 0.35;
    this.pos.x = Math.max(-hl, Math.min(hl, this.pos.x));
    this.pos.z = Math.max(-hw, Math.min(hw, this.pos.z));
  }
}
