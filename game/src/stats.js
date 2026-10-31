import { FIELDER, GOALIE } from './config.js';

// Per-player numbers from card stats (Ultimate Team). Every stat goes from 40 to 99; at 75 the player
// is exactly the original (FIELDER/GOALIE in config.js, from STRIKERS_REFERENCE.md). Each point away
// from 75 changes the related values by the percentage written next to them, so a 99 is a few percent
// better than the original and a 50 a few percent worse: cards change the feel without breaking the
// physics. A player without a card gets the original values.
//   fielder: vel (pace), tir (shooting), pas (passing), dri (dribbling), dif (defending), fis (physical)
//   goalie:  tuf (diving), rif (reflexes), pre (handling), pos (positioning), rin (kicking)

export const STAT_BASE = 75;
const f = (s, k) => 1 + ((s ?? STAT_BASE) - STAT_BASE) * k;
const scale = (a, m) => a.map((v) => v * m);

export function fielderConfig(st = {}) {
  const vel = f(st.vel, 0.004); // ±0.4 % top speed per point
  const acc = f(st.vel, 0.006);
  const dri = f(st.dri, 0.006); // turning with the ball
  const sho = f(st.tir, 0.004); // shot speed
  const pas = f(st.pas, 0.003);
  return {
    ...FIELDER,
    jog: FIELDER.jog * vel, run: FIELDER.run * vel, strafe: FIELDER.strafe * vel, turbo: FIELDER.turbo * vel,
    runWithBall: FIELDER.runWithBall * vel * f(st.dri, 0.002), turboWithBall: scale(FIELDER.turboWithBall, vel * f(st.dri, 0.002)),
    accel: FIELDER.accel * acc, accelWB: FIELDER.accelWB * acc, accelTurbo: FIELDER.accelTurbo * acc,
    turnWithBall: FIELDER.turnWithBall * dri, turnTurboWithBall: FIELDER.turnTurboWithBall * dri,
    shot: scale(FIELDER.shot, sho),
    passGround: scale(FIELDER.passGround, pas), passVolley: scale(FIELDER.passVolley, pas), chip: scale(FIELDER.chip, pas),
    // extras read by game.js
    shotSpread: Math.max(0.4, f(st.tir, -0.02)), // aim error vs SHOT.widthVariance: 99 = 0.52×, 50 = 1.5×
    perfectWindow: f(st.tir, 0.01), // width of the green zone on the shot meter
    passError: Math.max(0, (STAT_BASE + 5 - (st.pas ?? STAT_BASE + 5)) * 0.003), // radians of random error
    tackleReach: f(st.dif, 0.005), slideSpeed: f(st.dif, 0.004),
    stunTime: Math.max(0.6, f(st.fis, -0.008)), // knocked down for shorter
    strength: st.fis ?? STAT_BASE, // shoulder charges: the stronger player can keep the ball
  };
}

export function goalieConfig(st = {}) {
  const pos = f(st.pos, 0.004);
  return {
    ...GOALIE,
    jog: GOALIE.jog * pos, run: GOALIE.run * pos,
    diveReach: GOALIE.diveReach * f(st.tuf, 0.006),
    kick: scale(GOALIE.kick, f(st.rin, 0.004)), pass: scale(GOALIE.pass, f(st.rin, 0.003)),
    saveChance: f(st.rif, 0.008), // multiplies the chance of reaching a shot
    catchChance: Math.min(0.95, 0.65 * f(st.pre, 0.012)), // 0.65 is the original chance to hold a soft shot
  };
}
