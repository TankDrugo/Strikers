// Every number here comes from STRIKERS_REFERENCE.md (game files + decompilation).
// World axes: X along the pitch (goals at ±X), Z across (sidelines at ±Z), Y up. Units: metres, seconds.

export const PHYSICS_DT = 0.02; // FixedUpdateTask: 50 Hz

// Body size vs the original. The Strikers characters are 0.89 m (fielder) and 1.09 m (goalie); the
// animations were retargeted at those heights (RIG_HEIGHT). SIZE draws everybody larger, and every
// body-related distance below (reach, dribble, contact) scales with it.
export const RIG_HEIGHT = { fielder: 0.89, goalie: 1.09 };
export const SIZE = 1.3;

export const FIELD = {
  halfLength: 20.602, // FieldCorner helper, every main stadium
  halfWidth: 12.083,
  cornerRadius: 3.0, // Field.cpp
  penaltyX: 13.339, // PenaltyCorner helper
  penaltyHalfWidth: 5.006,
  goalHalfWidth: 2.846, // NetCorner helper
  goalHeight: 2.559,
  goalDepth: 1.9,
  postRadius: 0.08, // GoalPostDimensions.ini, Pipeline Central
  centerCircle: 4.0, // drawn only
};

export const BALL = {
  radius: 0.13, // Ball.cpp uses 0.18; smaller here so the ball reads right next to the larger players
  gravity: -14.0, // PhysicsBall.cpp
  airResistance: 0.1, // g_BallAirResistance
  rollingResistance: 5.0, // g_BallRollingResistance
  bounceGround: 0.375,
  bounceWall: 0.45,
  bounceOther: 0.25,
  maxSpeed: 50.0,
  magnusXZ: 0.075,
  magnusY: 0.04,
  noPickupAfterKick: 0.2, // Fielder.cpp SetNoPickUpTime(0.2)
  pickupRadius: 0.55 * SIZE,
  pickupHeight: 0.85 * SIZE,
};

export const FIELDER = {
  height: RIG_HEIGHT.fielder * SIZE, // Mario-sized (head bone 0.72 m + head) times SIZE
  jog: 4.5,
  run: 6.1,
  strafe: 4.9,
  turbo: 7.0,
  runWithBall: 6.0,
  turboWithBall: [7.0, 7.5, 8.0], // levels while turbo is held
  turnRun: 110000, // 16-bit angle units per second (65536 = 360°)
  turnWithBall: 80000,
  turnTurbo: 70000,
  turnTurboWithBall: 90000,
  turnFalloff: 4000,
  accel: 25, decel: 45, stopDecel: 9.5, // g_pTweaks
  accelWB: 25, decelWB: 18,
  accelTurbo: 22.5, decelTurbo: 18,
  capsuleRadius: (0.33 / 2 + 0.1) * SIZE,
  passGround: [8.5, 19.0], // mario.ini
  passVolley: [8.5, 11.5],
  shot: [29.0, 34.0],
  chip: [8.5, 15.0],
};

export const GOALIE = {
  height: RIG_HEIGHT.goalie * SIZE, // Kritter: head bone 0.98 m + head, times SIZE
  jog: 4.0,
  run: 6.0,
  turn: 105000,
  capsuleRadius: (0.65 / 2) * SIZE,
  kick: [15.0, 19.0], kickAngle: [50, 60], kickMinDist: 13.0,
  throwMinDist: 7.0,
  pass: [9.0, 19.0],
  // goalie.ini (GoalieTweaks::Init, CharacterTweaks.cpp), STRIKERS_REFERENCE.md §6 and §9 bis
  holdTime: 2.0, // Goalie Ball Time: throws within 2 s
  holdLookTime: 0.6, // estimate: before that, he throws as soon as a teammate is free (VERIFICA §8: "da verificare")
  catchTolerance: 0.6 * SIZE, // Catch Save Tolerance: a real catch if the ball passes this close to the hands (×SIZE)
  limbTolerance: 0.8 * SIZE, // estimate: CheckForLimbEndZoneCollision, farther than this the ball misses the body
  interceptTolerance: 0.5 * SIZE, // Intercept Save Tolerance
  catchAllowDist: 0.5, // GoalieSave mfCatchAllowDistSq 0.25: a catch save only if its point is within 0.5 m (original metres)
  catchMaxShotPower: 0.3, // Catch Save Max Speed: catches only for a charge below 0.3...
  fatigueCatch: 90, // Fatigue Catch Threshold (riserva del codice 60): ...and an energy of at least 90
  missSaveDelay: 0.1, // Miss Save Delay: added when the dice roll says the keeper must miss
  lobStumbleChance: 0.3, // Lob Shot Stumble Chance (chip shots, not in our game yet)
  saveIgnoreMargin: 1.0, // Save Ignore Margin: no dive for a shot that misses the goal by more than 1 m
  savePlane: 0.2 * SIZE, // Goalie::CalcTimeToPlane: the plane 0.2 m in front of the keeper, turned towards the ball
  saveTurn: 100000, saveTurnFalloff: 4000, // Save Turn Speed/Falloff: turning while he waits for the dive
  saveGrid: [7, 5], // GoalieSave::FindBestSave: the net (5.692 × 2.559 m) split in 7 × 5 cells
  // fatigue per save type, recovery per second (Shot Fatigue ..., Fatigue Recover Rate)
  fatigue: { catch: 5, dive_catch: 10, deflect: 7, dive_deflect: 15, punch: 7, leg: 6, stsSave: 15, stsStun: 25, recover: 2 },
  pounceRange: 1.0 * SIZE, // Pounce Range: dives on the ball at the carrier's feet within catch distance + 1 m
  attackRunScale: 1.5, // Goalie.cpp: runs at the ball carrier at 1.5×
  readyDistance: 1.2, // Goalie.cpp: against a carrier winding up he crouches if within 1.2 m of his spot
  passThreatMargin: 1.0, // IsPassThreat: pass intercept inside the penalty box widened by 1 m
  // FindDesiredGoaliePosition: aim at ball + 0.18 s of its velocity, stand on the line from 0.5 m behind the goal
  // centre, at a distance from that point that depends on the target's distance d (m): see goalie.js
  lead: 0.18, behindLine: 0.5, keepNow: 0.2, // final point = 0.8 × wanted + 0.2 × current position
  lineMargin: 1.0, // behind the goal line he stays within half the goal width − 1 m
};

export const SHOT = {
  windupSeconds: 0.66, // Shot Windup Seconds (GameTweaks.ini)
  chargeMin: 0.25, // ShotMeter::ShotReleased: charge = Interpolate(0.25, 1.0, t / Shot Windup Seconds); 1 once the bar is full
  perfectFrom: 0.99, // Fielder.cpp: windup_powershot and Magnus only with charge >= 0.99 (bar held to the end)
  contactFrame: 1.825, // FielderActions.cpp ActionShot: TestFrameTrigger(1.825), the kick clip plays at rate 1 (30 frames/s)
  // Fielder.cpp DoFindBestShotTarget: speed = InterpolateRangeClamped(Shot Min, Shot Max, 3, 18, d × (0.3 + charge)),
  // d = distance from the ball to the nearest post
  speedRange: [3, 18], speedChargeBias: 0.3,
  offsetFromPost: 0.5, // Shot Offset From Post (GameTweaks.ini): ball centre 0.5 m inside the post, and as far from ground and bar
  highShotDistance: 19.0, // High Shot Distance (GameTweaks.ini): from farther, always under the bar
  straightDistance: 3.0, // estimate: DoFindBestShotTarget shoots at the centre "close to the goal"; the threshold is not in our notes
  // CalcRegularShot: error scale = flight time × (1.1 − bar value), × Shot Width/Height Variance (GameTweaks.ini).
  // The unit is not written down: we read it as a fraction of the goal width and height.
  widthVariance: 0.08, heightVariance: 0.04, errorBias: 1.1,
  // ShotMeter.cpp CalcScoreValue: Shooting × 0.06 + charge × 0.29 + net open × 0.40 + distance × 0.25
  // (Shot Ratings / Net Open / Player Distance Weight, GameTweaks.ini; the 0.29 is in the code)
  weights: { rating: 0.06, charge: 0.29, netOpen: 0.40, distance: 0.25 },
  netOpenAngle: 35, // Shot Net Open Angle (GameTweaks.ini): the widest gap beside the keeper, in degrees, over 35
  keeperHalfWidth: (0.65 / 2) * SIZE, // estimate: what the keeper covers in that gap (his capsule radius, goalie.ini)
  valueDistance: [20, 7.5], // Shot Distance Min/Max (FuzzyTweaks.ini): distance term 0 at 20 m from the goal, 1 at 7.5 m
  // Fielder.cpp CalcRegularShot: the bar value goes through the Shot Value / Shot Chance curve of the chosen level
  // (SKILL below); the keeper must miss when 100 × random < chance
  windupTurn: 75000, windupTurnFalloff: 4000, // Shot Windup Direction Seek Speed/Falloff (g_pTweaks, CharacterTweaks.cpp)
  windupDecel: [6, 50], // asmRunningWB: brake = speed / time left, between Shot Windup Decel (g_pTweaks) and 50
  maxOnetimer: 0.8, // Shot Meter Max Onetimer Speed (GameTweaks.ini), not used yet
};

// Difficulty tables (Difficulty0..3.ini = Rookie, Professional, Superstar, Legend; DifficultyHuman.ini for a side with
// human players), read by SkillTweaks::Init (GameTweaks.cpp); values in STRIKERS_REFERENCE.md §9 bis. `level` is
// indexed by the chosen level 0..3. Game.cpp ApplyDifficulty copies the keys in SKILL_FROM_LEVEL from the chosen level
// onto both teams (also the human one). A value missing from a file is 0.5 (SkillTweaks default).
export const SKILL = {
  shotValue: [0.25, 0.6, 0.75], // Shot Value 1..3: same in every file
  shotChance: { level: [[1, 5, 20, 35, 55], [1, 3, 17.5, 35, 55], [1, 1, 15, 35, 55], [1, 1, 15, 35, 55]] }, // Shot Chance 0..4 (%)
  stsWindup: { level: [0.25, 0.25, 0.25, 0.25], human: 0.25 }, // STS Windup Time
  attackCarrierRange: { level: [2.5, 3, 4, 4], human: 4 },
  looseBallRange: { level: [-1, 1, 2, 2], human: 2 },
  goalieInterceptPass: { level: [0, 1, 1, 1], human: 1 },
  goalieDekeChance: { level: [0.5, 0.5, 0.5, 0.5], human: 0.5 },
  goalieDekeSpeed: { level: [1, 1.1, 1.2, 1.3], human: 0.5 },
  captainS2SChance: { level: [0.1, 0.5, 0.9, 1], human: 1 }, // Captain ShootToScore Chance
  captainS2SPerfect: { level: [0.2, 0.33, 0.6, 0.975], human: 0.4 }, // Captain S2S Perfect First = Second Button Chance
  shootingChance: { level: [0.1, 0.525, 0.95, 1], human: 0.95 },
  groundPassChance: { level: [0.05, 0.3, 0.672, 0.85], human: 0.75 },
  volleyPassChance: { level: [0.05, 0.3, 0.672, 0.85], human: 0.7 },
  dekeChance: { level: [0, 0.358, 0.717, 1], human: 0.65 },
  turboWithBallChance: { level: [0, 0.333, 0.667, 1], human: 0.75 },
  reaction: { level: [0, 0.25, 0.667, 1], human: 0.5 }, // reaction delay = 0.3 × (1 − Reaction) (CommonScript.cpp)
  slideAttackChance: { level: [0.02, 0.15, 0.5, 1], human: 0 },
  heavyAttackChance: { level: [0.02, 0.15, 0.5, 0.95], human: 0 },
  markingEffectiveness: { level: [0.05, 0.2, 0.55, 1], human: 0.6 },
};
export const SKILL_FROM_LEVEL = ['shotChance', 'stsWindup', 'attackCarrierRange', 'looseBallRange', 'goalieInterceptPass'];

// Super Strike (Shoot-to-Score), captain only, never the keeper (reference/VERIFICA.md §3, §9.3, §10).
// The charge is Shot Windup Seconds + STS Windup Time (SKILL.stsWindup, 0.25 at every level): 0.91 s.
// Frames are frames of captain_shoot_to_score (127 frames at 30 per second), which plays at rate 1 in game time.
export const SUPER = {
  jumpFrame: 3, nisBeginFrame: 26, kickFrame: 27, nisEndFrame: 106, // S2S 1st Jump / Nis Begin / Kick / Nis End Frame (mario.ini, same in all 13)
  attackUntilFrame: 24, // trigger 0x85181b83 of the clip: the keeper can come out on the captain only before it (Goalie.cpp)
  superTimeFrame: 63, // super only: time back to 1, team camera from 0.4, flash (ActionShootToScore)
  effectFrame: 67, lightOffFrame: 94, // <team>_captain_sts_effect and the special light on the captain, off at 94
  noReturnFrame: 103.9, // first kick: the world fades back, point of no return (super: the orbit around the ball)
  marks: [0.84, 0.16], // S2S Perfect First/Second Button Time (GameTweaks.ini)
  perfectMin: 0.02, perfectMax: 0.06, // S2S Perfect Distance Min/Max: first press snaps within Min; green of the second Min..Max
  yellow: 0.1, // S2S 2 Button Press Yellow Dist (GameTweaks.ini)
  secondBelow: 0.6, // the second press counts only going down and below 0.6
  greenScale: 1, yellowScale: 1, // per character (DK, Wario ×1.1/×0.75; Waluigi, Yoshi ×0.92/×1.25; Peach, Daisy ×0.84/×1.5): ours use Mario's
  yellowBounce: 0.95, // CalcShootToScoreShot: a yellow press is punched away when 0.95 × random < value
  slowMo: [0.68, 0.78], slowMoDist: [9, 18], // S2S Slow Mo Min/Max from 9 to 18 m (FindSTSDistanceAffectedPercentage)
  waitSlowMo: 0.1, // past the NIS begin frame without the second press
  orbitScale: 0.005, orbitSeconds: 4.25, orbitTurns: 0.61, orbitFov: 50, // super: camera around the ball at the first kick
  speedScale: 1.25, // CalcShootToScoreShot: flight time = distance / (1.25 × the shot speed)
  bounceSlow: 1.2, // a strike that gets punched away flies 1.2 times slower
  targetLow: 0.5, // low target: ball radius + post + random up to 0.5 m
  swatDistance: 7, swatChance: 0.66, // punched away from beyond 7 m: gk_ball_swat with 66% × value
  saveCatchShare: 0.75, saveExtraTime: 0.1, wideIfFarther: 1.0, // otherwise a normal save: 75% catches, +0.1 s, wide if the save is 1 m off
  missDelay: 0.2, // "goal": the keeper plays a missed save at least 0.2 s late
  points: 2, // a Super Strike goal counts double (Game.cpp m_uGoalType 6)
  keeperStun: [1, 2], // Min/Max STS Stun Time (goalie.ini)
  blastBehind: 1.5, // gk_s2s_blast_into_net: the keeper ends 1.5 m behind the goal line
  attackClose: 1.0 * SIZE, attackMax: 2.0 * SIZE, attackChance: 0.01, // STS Attack Close/Max Distance, Chance Per Frame (goalie.ini)
  nearGoalLine: 2.0, // InitActionShootToScore: within 2 m of the goal line and in front of the goal it is a normal shot
  endOfMatch: 5, // estimate: "at the end of the match" it is a normal shot (seconds left on the clock)
  cpuError: 0.3, // FD / S2SShootWasPressed: without the exact press (Captain S2S Perfect Button Chance) a uniform ±0.3 error
  cpuOpen: 0.8, cpuKeeperNear: 0.65, // FD: the CPU tries it only with Open >= 0.8 and keeper closeness <= 0.65
  cpuOpenDist: 1.5, cpuKeeperDist: [3, 12], // estimate of those two fuzzy terms: Open 1 with nobody within 1.5 m; keeper closeness 1 at 3 m, 0 at 12 m
};

export const TACKLE = {
  slideConsiderRadius: 2.5,
  slideTime: 0.35, slideRecover: 0.35, slideSpeed: 9.0,
  hitRange: 1.2 * SIZE,
  stunSlide: 1.7, stunHit: 1.9, // react clip lengths
};

export const PASS = { minDist: 1.0, maxDist: 10.0, volleyMinDist: 3.0 };

export const MATCH = { seconds: 180, goalPause: 3.0 };

// Used when assets/roster.json has no teamInfo.
export const TEAM_DEFAULTS = [{ name: 'Gialli', color: '#ffd23f' }, { name: 'Rossi', color: '#ff4f4f' }];

// Animation playback follows Character.cpp: rate = speed / clip speed, clamped.
export const ANIM_RATE_MIN = 0.6;
export const ANIM_RATE_MAX = 1.4;
