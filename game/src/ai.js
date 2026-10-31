import * as THREE from 'three';
import { FIELD, TACKLE, SIZE } from './config.js';
import { angleDiff } from './player.js';

// CPU fielders. Every choice is a chance of the difficulty table of the player's side (config.js SKILL: Difficulty0..3
// for a CPU side, DifficultyHuman for the computer-run teammates of a human), as in the DefaultOffensive /
// DefaultDefensive scripts: CalcSelectChance(table value, character attribute), with Fielder Attributes Weight 0
// (GameTweaks.ini), so the table value alone. Reaction delay 0.3 × (1 − Reaction) (CommonScript.cpp). When each
// choice is offered (range, pressure, decision rate) is ours: the script conditions are not written down yet.

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
  const chance = (key) => Math.random() < game.skill(key, p.team);
  // reaction: a new situation (the ball changed hands) is answered after 0.3 × (1 − Reaction) s
  if (p.seenOwner !== owner) { p.seenOwner = owner; p.seenAt = game.time; }
  const reacted = game.time - p.seenAt >= 0.3 * (1 - game.skill('reaction', p.team));
  p.decideT = (p.decideT ?? Math.random() * TACKLE.decisionTime) - dt;
  const decide = reacted && p.decideT <= 0;
  if (decide) p.decideT = TACKLE.decisionTime;

  // Carrying the ball
  if (owner === p) {
    p.aiTimer = (p.aiTimer || 0) + dt;
    if (p.aiTurbo === undefined) p.aiTurbo = chance('turboWithBallChance'); // decided when the ball arrives
    const dGoal = Math.hypot(goalX - p.pos.x, p.pos.z);
    let nearest = 99, nearestAhead = false;
    for (const o of game.players) if (o.team !== p.team && !o.isGoalie && o.stun <= 0) {
      const d = dist2(o.pos, p.pos);
      if (d < nearest) { nearest = d; nearestAhead = (o.pos.x - p.pos.x) * p.attackDir > -0.3; }
    }
    const aimZ = Math.max(-3, Math.min(3, -p.pos.z * 0.3));
    if (decide) {
      // shot (Shooting Chance): the captain in the opponents' half from up to 18 m (the Super Strike distances), the others
      // from 14.5 m; the captain holds to the full bar, where the Super Strike is decided (game.js cpuWantsSuper)
      const sup = game.canSuper(p);
      if (dGoal < (sup ? 18 : 14.5) && Math.abs(p.pos.z) < 9.5 && chance('shootingChance')) {
        game.startWindup(p, sup ? null : 0.25 + Math.random() * 0.45);
        return;
      }
      // under pressure: pass (Ground Pass Chance) or deke (Deke Chance)
      if (nearest < 2.4 && nearestAhead) {
        const t = bestPassTarget(game, p);
        if (t && chance('groundPassChance')) { game.doPass(p, t, false); return; }
        if (game.time - (p.lastDeke ?? -9) > 1.5 && chance('dekeChance')) { game.startDeke(p, Math.random() < 0.5 ? 1 : -1); return; }
      }
      // a teammate free ahead: ground pass, or lob (Volley Pass Chance)
      if (p.aiTimer > 1.2) {
        const t = bestPassTarget(game, p);
        if (t && (t.pos.x - p.pos.x) * p.attackDir > 2 && openness(game, t, t.pos.x, t.pos.z) > 3) {
          const lob = Math.random() < 0.3;
          if (chance(lob ? 'volleyPassChance' : 'groundPassChance')) { game.doPass(p, t, lob); return; }
        }
      }
    }
    moveTo(p, goalX - p.attackDir * 4, aimZ, p.cfg.runWithBall, p.aiTurbo && dGoal > 18);
    if (p.aiTurbo && dGoal > 18) p.turbo = true;
    return;
  }
  p.aiTimer = 0;
  p.aiTurbo = undefined;

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
      // Do Slide Attack Radius: slide (Slide Attack Chance); close enough for the shoulder: Heavy Attack Chance
      if (decide && d < TACKLE.slideConsiderRadius && p.tackleCooldown <= 0) {
        const facingOk = Math.abs(angleDiff(p.facing, Math.atan2(owner.pos.z - p.pos.z, owner.pos.x - p.pos.x))) < 0.6;
        if (facingOk && chance('slideAttackChance')) { game.startSlide(p); return; }
        if (d < 1.4 * SIZE && chance('heavyAttackChance')) { game.startHit(p); return; }
      }
      return;
    }
    if (role === 'marker') {
      // Marking Effectiveness: from the team shape (0) to tight on the goal side of the carrier (1)
      const ownGoalX = -p.attackDir * FIELD.halfLength;
      const m = game.skill('markingEffectiveness', p.team);
      const sx = shapeSpot(game, p, false), tx = owner.pos.x + (ownGoalX - owner.pos.x) * 0.35, tz = owner.pos.z * 0.7;
      moveTo(p, sx.x + (tx - sx.x) * m, sx.z + (tz - sx.z) * m, p.cfg.run, m > 0.5);
      return;
    }
  }

  // Shape: home spot shifted with the ball
  const h = shapeSpot(game, p, myTeamHasBall);
  moveTo(p, h.x, h.z, myTeamHasBall ? p.cfg.run : p.cfg.jog);
}

const spot = new THREE.Vector3();
function shapeSpot(game, p, myTeamHasBall) {
  const ball = game.ball;
  const shift = Math.max(-9, Math.min(9, ball.pos.x * 0.55)) + (myTeamHasBall ? 3.5 * p.attackDir : -2 * p.attackDir);
  const hx = Math.max(-FIELD.halfLength + 2.5, Math.min(FIELD.halfLength - 2.5, p.home.x + shift));
  return spot.set(hx, 0, p.home.z + (ball.pos.z - p.home.z) * 0.18);
}
