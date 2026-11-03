// Secret characters (decided with the user on 3 November): four characters stay a "?" until unlocked. Each one asks
// for a number of cup stars (every cup, Normal and Hard); with those stars its secret mission shows, and completing
// the mission in a cup match unlocks the character for quick play, cups and tournaments. Until then the preset
// squads field a stand-in in its place; the computer's cup teams may still field it (you meet it before you have it).
// The progress lives in the profile: profile.secrets = { missionId: true }.

export const SECRETS = [
  { char: 'snake_usa', stars: 12, mission: 'shock3' },
  { char: 'piccolo_norvegia', stars: 30, mission: 'buzzer' },
  { char: 'vegeta_italia', stars: 55, mission: 'superGoal' },
  { char: 'goku_ssj_germania', stars: 85, mission: 'hardCup' },
];

// facts of one cup match for one human team (main.js collects them from the game events)
export const MISSIONS = {
  shock3: (f) => f.shocks >= 3, // three opponents shocked by the electric barrier in one match
  buzzer: (f) => f.buzzer, // a buzzer beater goal
  superGoal: (f) => f.superGoal, // a Super Strike goal
  hardCup: () => false, // win a cup on Hard (set when the cup is won, cupsMenu.js finishRun)
};

export function totalStars(profile) {
  let n = 0;
  for (const rec of Object.values(profile?.cups || {})) for (const lv of ['normal', 'hard']) for (const s of Object.values(rec.stars?.[lv] || {})) n += s;
  return n;
}

// [{ char, stars, mission, revealed, done, unlocked }] for a profile (no profile: everything locked)
export function secretState(profile) {
  const have = totalStars(profile), done = profile?.secrets || {};
  return SECRETS.map((s) => {
    const revealed = have >= s.stars, ok = !!done[s.mission];
    return { ...s, have, revealed, done: ok, unlocked: revealed && ok };
  });
}

export function lockedChars(profile) { return new Set(secretState(profile).filter((s) => !s.unlocked).map((s) => s.char)); }
