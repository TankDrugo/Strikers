import * as THREE from 'three';
import { FIELD, TACKLE } from './config.js';
import { angleDiff } from './player.js';

const v = new THREE.Vector3();

function dist2(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function moveTo(p, x, z, speed, turbo = false) {
  const dx = x - p.pos.x, dz = z - p.pos.z, d = Math.hypot(dx, dz);
  if (d < 0.25) { p.desiredSpeed = 0; return d; }
  p.desiredDir = Math.atan2(dz, dx);
  p.desiredSpeed = Math.min(speed, d * 3.5);
  p.turbo = turbo && d > 4;
  return d;
}

// Rough "how free is this spot" score: distance to the nearest opponent.
function openness(game, p, x, z) {
  let m = 99;
  for (const o of game.players) if (o.team !== p.team && !o.isGoalie) m = Math.min(m, Math.hypot(o.pos.x - x, o.pos.z - z));
  return m;
}

export function bestPassTarget(game, p, dirHint = null) {
  let best = null, bestScore = -1e9;
  for (const t of game.players) {
    if (t.team !== p.team || t === p || t.isGoalie || t.stun > 0) continue;
    const dx = t.pos.x - p.pos.x, dz = t.pos.z - p.pos.z, d = Math.hypot(dx, dz);
    if (d < 2) continue;
    let s = (t.pos.x - p.pos.x) * p.attackDir * 0.35 + openness(game, t, t.pos.x, t.pos.z) * 0.8 - Math.abs(d - 9) * 0.15;
    if (dirHint !== null) s -= Math.abs(angleDiff(dirHint, Math.atan2(dz, dx))) * 6;
    if (s > bestScore) { bestScore = s; best = t; }
  }
  return best;
}

export function fielderAI(game, p, dt) {
  const ball = game.ball;
  const owner = ball.owner;
  const goalX = p.attackDir * FIELD.halfLength;
  p.turbo = false;
  if (p.state !== 'free') return;

  // Carrying the ball
  if (owner === p) {
    p.aiTimer = (p.aiTimer || 0) + dt;
    const dGoal = Math.hypot(goalX - p.pos.x, p.pos.z);
    let nearest = 99, nearestAhead = false;
    for (const o of game.players) if (o.team !== p.team && !o.isGoalie && o.stun <= 0) {
      const d = dist2(o.pos, p.pos);
      if (d < nearest) { nearest = d; nearestAhead = (o.pos.x - p.pos.x) * p.attackDir > -0.3; }
    }
    const aimZ = Math.max(-3, Math.min(3, -p.pos.z * 0.3));
    if (dGoal < 14.5 && Math.abs(p.pos.z) < 9.5 && p.aiTimer > 0.35) {
      game.startWindup(p, 0.25 + Math.random() * 0.45);
      return;
    }
    if (nearest < 2.4 && nearestAhead && p.aiTimer > 0.4) {
      const r = Math.random();
      if (r < 0.025) { game.startDeke(p, Math.random() < 0.5 ? 1 : -1); return; }
      if (r < 0.07) { const t = bestPassTarget(game, p); if (t) { game.doPass(p, t, false); return; } }
    }
    if (p.aiTimer > 1.2 && Math.random() < dt * 0.6) {
      const t = bestPassTarget(game, p);
      if (t && (t.pos.x - p.pos.x) * p.attackDir > 2 && openness(game, t, t.pos.x, t.pos.z) > 3) { game.doPass(p, t, Math.random() < 0.3); return; }
    }
    moveTo(p, goalX - p.attackDir * 4, aimZ, p.cfg.runWithBall, dGoal > 18);
    if (dGoal > 18) p.turbo = true;
    return;
  }
  p.aiTimer = 0;

  // Receiving a pass
  if (ball.passTarget === p && !owner) {
    const meet = game.ballMeetPoint(p);
    moveTo(p, meet.x, meet.z, p.cfg.run, true);
    return;
  }

  const myTeamHasBall = owner && owner.team === p.team;
  const role = game.roleOf(p);

  if (!owner) {
    if (role === 'chaser') {
      const meet = game.ballMeetPoint(p);
      moveTo(p, meet.x, meet.z, p.cfg.run, true);
      return;
    }
  } else if (!myTeamHasBall) {
    if (role === 'chaser') {
      const lead = 0.35;
      const tx = owner.pos.x + Math.cos(owner.facing) * owner.speed * lead;
      const tz = owner.pos.z + Math.sin(owner.facing) * owner.speed * lead;
      const d = moveTo(p, tx, tz, p.cfg.run, true);
      if (d < TACKLE.slideConsiderRadius && p.tackleCooldown <= 0) {
        const facingOk = Math.abs(angleDiff(p.facing, Math.atan2(owner.pos.z - p.pos.z, owner.pos.x - p.pos.x))) < 0.6;
        if (facingOk && Math.random() < dt * 1.6) { game.startSlide(p); return; }
        if (d < 1.4 && Math.random() < dt * 1.2) { game.startHit(p); return; }
      }
      return;
    }
    if (role === 'marker') {
      // goal-side of the carrier
      const ownGoalX = -p.attackDir * FIELD.halfLength;
      moveTo(p, owner.pos.x + (ownGoalX - owner.pos.x) * 0.35, owner.pos.z * 0.7, p.cfg.run, true);
      return;
    }
  }

  // Shape: home spot shifted with the ball
  const shift = Math.max(-9, Math.min(9, ball.pos.x * 0.55)) + (myTeamHasBall ? 3.5 * p.attackDir : -2 * p.attackDir);
  let hx = p.home.x + shift, hz = p.home.z + (ball.pos.z - p.home.z) * 0.18;
  hx = Math.max(-FIELD.halfLength + 2.5, Math.min(FIELD.halfLength - 2.5, hx));
  moveTo(p, hx, hz, myTeamHasBall ? p.cfg.run : p.cfg.jog);
}
