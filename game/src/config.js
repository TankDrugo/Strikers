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
  pass: [9.0, 19.0],
};

export const SHOT = {
  windupSeconds: 0.66, // Shot Windup Seconds
  perfectFrom: 0.99, // Magnus only above 0.99 (Fielder.cpp)
  perfectWindow: 0.06, // generous window on top of the meter (S2S Perfect Distance Max)
  offsetFromPost: 0.5, // Shot Offset From Post
  highShotDistance: 19.0,
  widthVariance: 0.08,
  heightVariance: 0.04,
  maxOnetimer: 0.8,
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
