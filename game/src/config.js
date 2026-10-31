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
  holdTime: 2.0, // Goalie Ball Time
  catchTolerance: 0.6,
  interceptTolerance: 0.5,
  catchMaxShotPower: 0.3, // harder shots are parried
  saveIgnoreMargin: 1.0,
  diveReach: 1.9 * SIZE, // horizontal reach of a full dive at this size (estimated from gk_dive clips)
  reachHeight: Math.min(2.0 * SIZE, 2.559),
  // Saves are not a dice roll in the original (Goalie::CalcSaveParameters, GoalieSave::FindBestSave): the keeper
  // saves when one of his save animations reaches the ball in time. We model that with a reaction time plus a dive
  // speed (both estimated: the shipped save-timing grid is not in the decompilation).
  standReach: 0.6 * SIZE, // shots this close to the body need no dive
  pass: [9.0, 19.0],
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

// Super Strike (Shoot-to-Score), captain only, never the keeper. Original values from reference/STRIKERS_REFERENCE.md
// (Super Strike §5, goalie §6); the ones marked "estimate" are not in the files we have and were tuned by hand.
export const SUPER = {
  chargeSeconds: 1.6,     // estimate: hold the shot this long (normal bar full at 0.66 s, then the captain glows)
  slowMotion: 0.72,       // original 0.68-0.78
  needleSeconds: 0.9,     // estimate: one sweep of a needle across the meter, in game time
  marks: [0.84, 0.16],    // first needle goes up and stops near 0.84, the second comes down to 0.16 (original)
  perfect: 0.05,          // dark green: within ±0.05 of the mark (original ±0.02-0.06)
  near: 0.13,             // light green around it (estimate)
  hangClip: [0.9, 2.0],   // captain_shoot_to_score: in the air from 0.9 s to 2.0 s (the meter runs here), kick at 'contact'
  kickRate: 1.35,         // the part after the meter, a little faster (estimate)
  speed: 30,              // m/s of the strike (estimate: faster than any normal shot)
  points: 2,              // a Super Strike goal counts double
  keeperStun: [1, 2],     // seconds the keeper stays down after stopping one (original 1-2 s)
  cpuChance: [0.25, 0.4, 0.55, 0.7], // CPU captain tries it on this share of its shots, per difficulty (estimate)
  cpuError: [0.16, 0.1, 0.06, 0.035], // CPU needle error, per difficulty (estimate)
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
