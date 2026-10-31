import { FIELDER, GOALIE } from './config.js';

// Per-player numbers from Ultimate Team card stats (ultimate-team/DESIGN.md: "le statistiche cambiano il gioco",
// starting from FIELDER/GOALIE as the average). Stats go from 40 to 99; at 75 the player is exactly the original
// (config.js, from STRIKERS_REFERENCE.md). Each point away from 75 changes the related values by the percentage
// written next to them: a 99 is a few percent better than the original, a 55 a few percent worse.
// A player without a card (quick play, cups) gets the original values.
//   fielder: vel (pace), tir (shooting), pas (passing), con (tackling, contrasto)
//   goalie:  par (diving, parata), rif (reflexes), usc (coming out, uscite), vel (pace)

export const STAT_BASE = 75;
const f = (s, k) => 1 + ((s ?? STAT_BASE) - STAT_BASE) * k;
const scale = (a, m) => a.map((v) => v * m);

export function fielderConfig(st = {}) {
  const vel = f(st.vel, 0.004); // ±0.4 % top speed per point
  const acc = f(st.vel, 0.006); // ±0.6 % acceleration
  const sho = f(st.tir, 0.004); // ±0.4 % shot speed
  const pas = f(st.pas, 0.003); // ±0.3 % pass speed
  return {
    ...FIELDER,
    jog: FIELDER.jog * vel, run: FIELDER.run * vel, strafe: FIELDER.strafe * vel, turbo: FIELDER.turbo * vel,
    runWithBall: FIELDER.runWithBall * vel, turboWithBall: scale(FIELDER.turboWithBall, vel),
    accel: FIELDER.accel * acc, accelWB: FIELDER.accelWB * acc, accelTurbo: FIELDER.accelTurbo * acc,
    shot: scale(FIELDER.shot, sho),
    passGround: scale(FIELDER.passGround, pas), passVolley: scale(FIELDER.passVolley, pas), chip: scale(FIELDER.chip, pas),
    // extras read by game.js and hud.js
    shotSpread: Math.max(0.4, f(st.tir, -0.02)), // aim error: 99 = 0.52×, 55 = 1.4×
    perfectWindow: f(st.tir, 0.01), // green zone of the shot meter: ±1 % per point
    passError: Math.max(0, (80 - (st.pas ?? 80)) * 0.003), // radians of random error below 80
    tackleReach: f(st.con, 0.005), slideSpeed: f(st.con, 0.004), // shoulder charge reach, slide speed
    stunTime: Math.max(0.6, f(st.con, -0.008)), // knocked down for shorter
    strength: st.con ?? STAT_BASE, // shoulder charges: the stronger ball carrier can keep the ball
  };
}

export function goalieConfig(st = {}) {
  const vel = f(st.vel, 0.004);
  return {
    ...GOALIE,
    jog: GOALIE.jog * vel, run: GOALIE.run * vel,
    diveSpeed: GOALIE.diveSpeed * f(st.par, 0.005), diveReach: GOALIE.diveReach * f(st.par, 0.004),
    saveReact: GOALIE.saveReact * f(st.rif, -0.01), // reaction time: −1 % per point
    kick: scale(GOALIE.kick, f(st.usc, 0.004)), pass: scale(GOALIE.pass, f(st.usc, 0.003)),
    catchChance: Math.min(0.95, 0.65 * f(st.usc, 0.012)), // 0.65 is the original chance to hold a soft shot
  };
}
