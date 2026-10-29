import * as THREE from 'three';
import { BALL, FIELD, PHYSICS_DT } from './config.js';

const R = BALL.radius;
const F = FIELD;
const tmp = new THREE.Vector3();

// One physics step for a free ball, as in PhysicsBall::PreUpdate / AddResistanceForces / PostUpdate.
export function integrate(pos, vel, spin, magnus, dt) {
  const s0 = vel.length();
  if (s0 > BALL.maxSpeed) vel.multiplyScalar(BALL.maxSpeed / s0);
  let ax = -BALL.airResistance * vel.x, ay = BALL.gravity - BALL.airResistance * vel.y, az = -BALL.airResistance * vel.z;
  const onGround = pos.y <= R + 0.001 && Math.abs(vel.y) < 0.5;
  const hs = Math.hypot(vel.x, vel.z);
  if (onGround && hs > 0.01) {
    const k = Math.min(BALL.rollingResistance, hs / dt) / hs;
    ax -= k * vel.x; az -= k * vel.z;
  }
  if (magnus && pos.y > R + 0.02 && vel.lengthSq() > 1 && spin.lengthSq() > 1) {
    tmp.crossVectors(spin, vel);
    ax += BALL.magnusXZ * tmp.x; az += BALL.magnusXZ * tmp.z; ay += BALL.magnusY * tmp.y;
  }
  vel.x += ax * dt; vel.y += ay * dt; vel.z += az * dt;
  const s1 = vel.length();
  if (s1 > BALL.maxSpeed) vel.multiplyScalar(BALL.maxSpeed / s1);
  if (pos.y > 20 && vel.y > 0) vel.y *= 0.9;
  pos.addScaledVector(vel, dt);
  if (pos.y < R) {
    pos.y = R;
    vel.y = Math.abs(vel.y) > 0.6 ? -vel.y * BALL.bounceGround : 0;
    vel.x *= 0.97; vel.z *= 0.97;
  }
}

// Ghost flight with no collisions except the ground: FakeBallWorld in the original.
export function predict(pos, vel, spin, magnus, seconds, step = PHYSICS_DT) {
  const p = pos.clone(), v = vel.clone(), w = spin.clone();
  const out = [];
  for (let t = 0; t <= seconds; t += step) {
    out.push({ t, p: p.clone(), v: v.clone() });
    integrate(p, v, w, magnus, step);
  }
  return out;
}

// cBall::ShootAtFast: closed-form launch velocity that reaches target after t seconds with linear drag.
export function shootAtFast(from, target, t) {
  const k = BALL.airResistance, g = 1.025 * BALL.gravity, e = Math.exp(-k * t);
  return new THREE.Vector3(
    (k * (target.x - from.x)) / (1 - e),
    (k * (target.y - from.y - (g * t) / k)) / (1 - e) + g / k,
    (k * (target.z - from.z)) / (1 - e));
}

export class Ball {
  constructor(mesh) {
    this.mesh = mesh;
    this.pos = new THREE.Vector3(0, R, 0);
    this.prevPos = new THREE.Vector3(0, R, 0); // position before the last fixed step
    this.rpos = new THREE.Vector3(0, R, 0); // drawn position, between prevPos and pos
    this.vel = new THREE.Vector3();
    this.spin = new THREE.Vector3();
    this.magnus = false;
    this.owner = null;
    this.lastTouch = null;
    this.noPickup = 0;
    this.shotTimer = 0; // > 0 while a shot is in flight (goalie reacts)
    this.shotPower = 0;
    this.shotPerfect = false;
    this.passTarget = null;
    this.inGoal = 0; // side of the goal it went in, once
    this.events = [];
    this.q = new THREE.Quaternion();
  }

  reset(x = 0, z = 0) {
    this.pos.set(x, R, z); this.vel.set(0, 0, 0); this.spin.set(0, 0, 0);
    this.magnus = false; this.owner = null; this.noPickup = 0; this.shotTimer = 0; this.inGoal = 0; this.passTarget = null;
  }

  kick(vel, spin = null, opts = {}) {
    if (this.owner) this.lastTouch = this.owner;
    this.owner = null;
    this.vel.copy(vel);
    this.spin.copy(spin || new THREE.Vector3());
    this.magnus = !!opts.magnus;
    this.noPickup = opts.noPickup ?? BALL.noPickupAfterKick;
    this.shotTimer = opts.shot ? 1.5 : 0;
    this.shotPower = opts.power || 0;
    this.shotPerfect = !!opts.perfect;
    this.passTarget = opts.passTarget || null;
  }

  step(dt) {
    this.noPickup = Math.max(0, this.noPickup - dt);
    this.shotTimer = Math.max(0, this.shotTimer - dt);
    if (this.owner) return;
    integrate(this.pos, this.vel, this.spin, this.magnus, dt);
    this.collideGoalFrames();
    this.collideWalls();
  }

  bounce(nx, ny, nz, restitution, tangentKeep = 0.85) {
    const vn = this.vel.x * nx + this.vel.y * ny + this.vel.z * nz;
    if (vn >= 0) return;
    this.vel.x -= (1 + restitution) * vn * nx; this.vel.y -= (1 + restitution) * vn * ny; this.vel.z -= (1 + restitution) * vn * nz;
    const vn2 = this.vel.x * nx + this.vel.y * ny + this.vel.z * nz;
    this.vel.x = (this.vel.x - vn2 * nx) * tangentKeep + vn2 * nx;
    this.vel.y = (this.vel.y - vn2 * ny) * tangentKeep + vn2 * ny;
    this.vel.z = (this.vel.z - vn2 * nz) * tangentKeep + vn2 * nz;
    if (Math.abs(vn) > 2) this.events.push({ type: 'hit', speed: Math.abs(vn) });
    this.magnus = false; // PhysicsBall::Contact: anything but the ground cancels the curve
  }

  collideSegment(ax, ay, az, bx, by, bz, radius, restitution) {
    const p = this.pos;
    const abx = bx - ax, aby = by - ay, abz = bz - az;
    const t = Math.max(0, Math.min(1, ((p.x - ax) * abx + (p.y - ay) * aby + (p.z - az) * abz) / (abx * abx + aby * aby + abz * abz)));
    const cx = ax + abx * t, cy = ay + aby * t, cz = az + abz * t;
    const dx = p.x - cx, dy = p.y - cy, dz = p.z - cz, d = Math.hypot(dx, dy, dz), min = R + radius;
    if (d < min && d > 1e-6) {
      const nx = dx / d, ny = dy / d, nz = dz / d;
      p.x = cx + nx * min; p.y = cy + ny * min; p.z = cz + nz * min;
      this.bounce(nx, ny, nz, restitution, 0.9);
      this.events.push({ type: 'post' });
      return true;
    }
    return false;
  }

  collideGoalFrames() {
    const w = F.goalHalfWidth, h = F.goalHeight, pr = F.postRadius;
    for (const s of [-1, 1]) {
      const gx = s * (F.halfLength - 0.065);
      if (Math.abs(this.pos.x - gx) > 1.5) continue;
      this.collideSegment(gx, 0, -w, gx, h, -w, pr, BALL.bounceOther);
      this.collideSegment(gx, 0, w, gx, h, w, pr, BALL.bounceOther);
      this.collideSegment(gx, h, -w, gx, h, w, pr, BALL.bounceOther);
    }
  }

  collideWalls() {
    const p = this.pos, hl = F.halfLength, hw = F.halfWidth, r = F.cornerRadius, w = F.goalHalfWidth, h = F.goalHeight;
    const ax = Math.abs(p.x), az = Math.abs(p.z), sx = Math.sign(p.x) || 1, sz = Math.sign(p.z) || 1;
    // inside a goal: the net soaks the ball up
    if (ax > hl - 0.065) {
      const insideMouth = az < w - R * 0.5 && p.y < h;
      if (insideMouth || ax > hl + R) {
        if (ax > hl + R && az < w && p.y < h + R && !this.inGoal) {
          this.inGoal = sx;
          this.events.push({ type: 'goal', side: sx });
        }
        const back = hl + F.goalDepth - R;
        if (ax > back) { p.x = sx * back; this.bounce(-sx, 0, 0, 0.1, 0.5); }
        if (ax > hl && az > w - R) { p.z = sz * (w - R); this.bounce(0, 0, -sz, 0.1, 0.6); }
        if (ax > hl && p.y > h - R) { p.y = h - R; this.bounce(0, -1, 0, 0.1, 0.6); }
        return;
      }
    }
    const cx = hl - r, cz = hw - r;
    if (ax > cx && az > cz) {
      const dx = ax - cx, dz = az - cz, d = Math.hypot(dx, dz), lim = r - R;
      if (d > lim) {
        const nx = dx / d, nz = dz / d;
        p.x = sx * (cx + nx * lim); p.z = sz * (cz + nz * lim);
        this.bounce(-sx * nx, 0, -sz * nz, BALL.bounceWall);
        this.events.push({ type: 'wall' });
      }
      return;
    }
    if (ax > hl - R) { p.x = sx * (hl - R); this.bounce(-sx, 0, 0, BALL.bounceWall); this.events.push({ type: 'wall' }); }
    if (az > hw - R) { p.z = sz * (hw - R); this.bounce(0, 0, -sz, BALL.bounceWall); this.events.push({ type: 'wall' }); }
  }

  updateMesh(dt, alpha = 1) {
    if (this.prevPos.distanceToSquared(this.pos) > 9) this.prevPos.copy(this.pos);
    this.rpos.lerpVectors(this.prevPos, this.pos, alpha);
    this.mesh.position.copy(this.rpos);
    // roll the ball: rotation axis perpendicular to horizontal velocity, or the flight spin
    const hv = Math.hypot(this.vel.x, this.vel.z);
    if (!this.owner && this.spin.lengthSq() > 1 && this.pos.y > R + 0.05) {
      const a = this.spin.length();
      tmp.copy(this.spin).divideScalar(a);
      this.q.setFromAxisAngle(tmp, a * dt);
      this.mesh.quaternion.premultiply(this.q);
    } else if (hv > 0.01) {
      tmp.set(this.vel.z, 0, -this.vel.x).divideScalar(hv);
      this.q.setFromAxisAngle(tmp, (hv / R) * dt);
      this.mesh.quaternion.premultiply(this.q);
    }
  }
}
