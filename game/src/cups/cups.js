// Cups (stage 3 of interfaccia-gioco/DESIGN.md): nine knockout cups (four quote PS2 games, five the worlds of our
// characters), each in its stadium, Normal and Hard
// levels, three stars per match and a grade from D to Z. CPU teams remix every character of the roster under new
// names and colours.

// rounds: 3 = 8 teams, 4 = 16, 5 = 32. cpu: computer level per level (0 easy … 3 very hard), the final adds 0.5.
// stadium: where every match of the cup is played (stadiums.js); the CPU teams are made mostly of that stadium's cast.
// Order = unlock order, from the easiest. c1-c4 quote PS2 games (interfaccia-gioco/DESIGN.md); c5-c9 (1 November) are
// the worlds our characters come from, each with its stadium.
export const CUPS = [
  { id: 'c1', rounds: 3, cpu: { normal: 0, hard: 1.5 }, colors: ['#e03a1e', '#ff9a1f', '#ffc65a'], teamsKey: 'jungle', stadium: 'giungla' },
  { id: 'c2', rounds: 4, cpu: { normal: 0.5, hard: 2 }, colors: ['#1f6fe0', '#ffd21f', '#ffffff'], teamsKey: 'race', stadium: 'circuito' },
  { id: 'c5', rounds: 4, cpu: { normal: 0.5, hard: 2 }, colors: ['#4a3f8a', '#ffa86a', '#ffe0b0'], teamsKey: 'heart', stadium: 'isole' },
  { id: 'c6', rounds: 4, cpu: { normal: 1, hard: 2 }, colors: ['#1a7a8a', '#5af0ff', '#e8ffd0'], teamsKey: 'eco', stadium: 'eco' },
  { id: 'c3', rounds: 5, cpu: { normal: 1, hard: 2.5 }, colors: ['#5a4026', '#d9a640', '#f5e2b8'], teamsKey: 'mob', stadium: 'arena' },
  { id: 'c7', rounds: 5, cpu: { normal: 1, hard: 2.5 }, colors: ['#1f6a2a', '#2fd16a', '#ffd88a'], teamsKey: 'hood', stadium: 'quartiere' },
  { id: 'c8', rounds: 5, cpu: { normal: 1.5, hard: 2.5 }, colors: ['#26344e', '#c8e8ff', '#ffd23f'], teamsKey: 'arctic', stadium: 'base' },
  { id: 'c4', rounds: 5, cpu: { normal: 1.5, hard: 3 }, colors: ['#2a1260', '#31d6c2', '#6a2fd8'], teamsKey: 'space', stadium: 'bullone' },
  { id: 'c9', rounds: 5, cpu: { normal: 2, hard: 3 }, colors: ['#c8321e', '#ff8a1a', '#ffe8c0'], teamsKey: 'tournament', stadium: 'torneo' },
];

export const cupById = (id) => CUPS.find((c) => c.id === id);

// CPU team names by cup theme (no real clubs, no trademarks).
const NAMES = {
  jungle: ['Banane Ribelli', 'Liane United', 'Scimmie Urlatrici', 'Retini d\'Oro', 'Cocco Team', 'Tucani Volanti', 'Palme Pazze', 'Gorilla Grigi', 'Vulcano FC', 'Pappagalli Rossi', 'Felci Furiose', 'Tamburi Tribali', 'Mango Club', 'Iguane Verdi', 'Cascata Blu', 'Bambù Bomber'],
  race: ['Turbo Tartarughe', 'Marmitte Matte', 'Bandiera a Scacchi', 'Pistoni Pazzi', 'Gomme Lisce', 'Scorciatoia FC', 'Sgommata United', 'Carburatori', 'Rally del Fango', 'Freno a Mano', 'Nitro Club', 'Paraurti Allegri', 'Clacson Team', 'Curva Parabolica', 'Pit Stop', 'Ruote Quadrate'],
  mob: ['Cappelli Neri', 'Grammofono FC', 'Gessati United', 'Contrabbando', 'Bar Centrale', 'Violini Muti', 'Panama Club', 'Ghette Bianche', 'Distilleria', 'Porto Nebbioso', 'Tram Notturno', 'Il Consiglio', 'Biliardo Team', 'Ventilatori', 'Lucky Seven', 'Neon Rossi',
    'Molo 13', 'Sigari Spenti', 'Valigette', 'Macchine Lucide', 'Stazione Est', 'Pellicce', 'Jazz Band', 'Retrobottega', 'Ponte di Ferro', 'Lampioni', 'Fedora FC', 'Fisarmoniche', 'Tabaccheria', 'Vicolo Cieco', 'Cinegiornale'],
  space: ['Bulloni Spaziali', 'Chiave Inglese', 'Robot Ribelli', 'Nebulosa FC', 'Asteroidi', 'Laser Club', 'Navicella 9', 'Saturno United', 'Cometa Rossa', 'Motore a Curvatura', 'Pianeta Rotondo', 'Satelliti', 'Officina Orbitale', 'Gravità Zero', 'Luna Storta', 'Androidi',
    'Pulsar', 'Buco Nero', 'Meteora Team', 'Galassia Spirale', 'Stazione Alfa', 'Raggio Traente', 'Antenne Blu', 'Ingranaggi', 'Supernova', 'Viaggiatori', 'Razzi Rossi', 'Dischi Volanti', 'Plasma Club', 'Quasar', 'Bulldozer Lunare'],
};
Object.assign(NAMES, {
  heart: ['Cuori Luminosi', 'Isola Paopu', 'Chiavi d\'Argento', 'Onda Lunga', 'Tramonto FC', 'Barca di Legno', 'Stelle Cadenti', 'Spiaggia Bianca', 'Conchiglie', 'Torre dell\'Orologio', 'Gelato Blu', 'Ombre United', 'Luce Interiore', 'Gabbiani', 'Porta del Destino', 'Vento di Mare'],
  eco: ['Eco Blu', 'Eco Rosso', 'Eco Verde', 'Eco Giallo', 'Rovine Antiche', 'Silos FC', 'Spiaggia Sabbiosa', 'Precursori', 'Lurker Team', 'Zoomer Club', 'Celle di Energia', 'Isola della Nebbia', 'Saggio Verde', 'Monte Ghiaccio', 'Vulcano Rosso', 'Porto Pesce'],
  hood: ['Ragazzi del Viale', 'Palme Alte', 'Bassi Profondi', 'Lowrider FC', 'Rispetto United', 'Quartiere Verde', 'Strada Dritta', 'Hamburger Club', 'Ciambelle FC', 'Biciclette', 'Graffiti Team', 'Sirene Spente', 'Muretto', 'Garage 77', 'Tramonto Rosso', 'Collina dei Ricchi',
    'Vicolo Blu', 'Canestro FC', 'Molo Nord', 'Autolavaggio', 'Radio Notte', 'Benzina Club', 'Cappellini', 'Ponte Grande', 'Tatuaggi', 'Marciapiede', 'Lattine', 'Parcheggio', 'Polli Fritti', 'Insegne Neon', 'Pista di Pattini'],
  arctic: ['Scatole di Cartone', 'Lupi Bianchi', 'Volpi Artiche', 'Hangar 1', 'Radar FC', 'Codec Club', 'Sentinelle', 'Bufera United', 'Ghiaccio Nero', 'Corvi', 'Fucilieri a Salve', 'Mimetiche', 'Elicotteri', 'Pianificatori', 'Visori Notturni', 'Base Ovest',
    'Neve Fresca', 'Pinguini Spia', 'Sotterraneo', 'Allarme Rosso', 'Torretta 3', 'Cartoni Animati', 'Pattuglia', 'Missile Club', 'Sigarette di Cioccolato', 'Ghiacciaio', 'Esploratori', 'Cancelli Chiusi', 'Fari Accesi', 'Silenziosi', 'Infiltrati'],
  tournament: ['Nuvola Dorata', 'Bastone Magico', 'Tartarughe Eremite', 'Gru Bianche', 'Pugni di Fuoco', 'Tempio Celeste', 'Fagioli Magici', 'Isola dei Maestri', 'Codini Rossi', 'Allievi del Vecchio', 'Onda Energetica', 'Vento Divino', 'Montagna dei Cinque', 'Capsule FC', 'Draghi del Torneo', 'Monaci Calvi',
    'Stelle a Sette Punte', 'Gravità x10', 'Stanza dello Spirito', 'Saiyan del Sud', 'Namecc FC', 'Robot Rossi', 'Androidi 17', 'Pianeta Verde', 'Combattenti', 'Kame Club', 'Torre Alta', 'Arena Rotta', 'Cielo Azzurro', 'Lupi del Deserto', 'Sfere Arancioni'],
});
const PALETTE = ['#ff3d6e', '#ff7b1c', '#ffd21f', '#41c24a', '#2bc0ff', '#8a4dff', '#ff4fd8', '#31d6c2', '#e03a1e', '#f5e2b8', '#d9a640', '#9aa6b8'];

// small seeded random, so a cup always has the same teams and the same objectives
export function rng(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) | 0;
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// roster: game/assets/roster.json. Goalkeepers are the characters in slot 4 of the teams and preset squads.
// cast: characters of the cup's world: about half of the places go to them (the rest is the whole roster)
export function cpuTeams(roster, key, count, seed, cast = []) {
  const r = rng(seed);
  const keepers = [...new Set([...roster.teams, ...(roster.squads || []).map((q) => q.slots)].map((t) => t[4]))];
  const fielders = roster.characters.map((c) => c.id).filter((id) => !keepers.includes(id));
  const ids = new Set(roster.characters.map((c) => c.id));
  const castF = cast.filter((id) => ids.has(id) && !keepers.includes(id)), castK = cast.filter((id) => keepers.includes(id));
  const names = [...(NAMES[key] || NAMES.jungle)];
  const out = [];
  for (let i = 0; i < count; i++) {
    const n = names.splice(Math.floor(r() * names.length), 1)[0] || `Squadra ${i + 1}`;
    const pick = () => (castF.length && r() < 0.5 ? castF[Math.floor(r() * castF.length)] : fielders[Math.floor(r() * fielders.length)]);
    const keeper = castK.length && r() < 0.5 ? castK[Math.floor(r() * castK.length)] : keepers[Math.floor(r() * keepers.length)];
    out.push({
      name: n, color: PALETTE[Math.floor(r() * PALETTE.length)],
      slots: [pick(), pick(), pick(), pick(), keeper],
      rating: 0.75 + r() * 0.5, // only for simulated matches
    });
  }
  return out;
}

export function baseTeams(roster) {
  return roster.teams.map((slots, i) => ({ ...(roster.teamInfo || [])[i], slots: [...slots], rating: 1.1 }));
}

// Bracket: teams[] (index), rounds[r] = [{ a, b, winner, score }]. Humans are spread so they meet as late as possible.
export function makeBracket(teamCount, humanIdx, seed) {
  const r = rng(seed);
  const order = [...Array(teamCount).keys()].filter((i) => !humanIdx.includes(i)).sort(() => r() - 0.5);
  const slots = new Array(teamCount).fill(null);
  // place humans at the start of each quarter/half: 0, n/2, n/4, 3n/4
  const spots = [0, teamCount / 2, teamCount / 4, (3 * teamCount) / 4].slice(0, humanIdx.length);
  humanIdx.forEach((h, i) => { slots[spots[i]] = h; });
  for (let i = 0; i < teamCount; i++) if (slots[i] === null) slots[i] = order.shift();
  const first = [];
  for (let i = 0; i < teamCount; i += 2) first.push({ a: slots[i], b: slots[i + 1], winner: null, score: null });
  return [first];
}

export function nextRound(bracket) {
  const last = bracket[bracket.length - 1];
  if (last.length === 1 || last.some((m) => m.winner === null)) return false;
  const nxt = [];
  for (let i = 0; i < last.length; i += 2) nxt.push({ a: last[i].winner, b: last[i + 1].winner, winner: null, score: null });
  bracket.push(nxt);
  return true;
}

// Quick result for a match nobody plays: goals ~ Poisson, stronger team scores more; no draws in a knockout.
export function simulate(ta, tb, r = Math.random) {
  const pois = (l) => { let k = 0, p = Math.exp(-l), s = p; const u = r(); while (u > s && k < 9) { k++; p *= l / k; s += p; } return k; };
  const ga = pois(2.4 * ta.rating / tb.rating), gb = pois(2.4 * tb.rating / ta.rating);
  let winner = ga > gb ? 0 : gb > ga ? 1 : (r() < ta.rating / (ta.rating + tb.rating) ? 0 : 1);
  const score = [ga, gb];
  if (ga === gb) score[winner]++; // golden goal
  return { winner, score };
}

export const ROUND_NAMES = { 1: 'final', 2: 'semi', 3: 'quarter', 4: 'r16', 5: 'r32' };
export function roundKey(cup, r) { return ROUND_NAMES[cup.rounds - r] || 'r32'; }

// Completion of a cup for a profile: Normal win 40, Normal stars up to 20, Hard win 20, Hard stars up to 20.
export function progress(cup, rec) {
  if (!rec) return 0;
  const max = cup.rounds * 3;
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
  return Math.round((rec.normalWon ? 40 : 0) + 20 * sum(rec.stars?.normal) / max + (rec.hardWon ? 20 : 0) + 20 * sum(rec.stars?.hard) / max);
}

export function grade(pct, rec) {
  if (!rec || !rec.normalWon) return '–';
  if (pct >= 100) return 'Z';
  return pct >= 90 ? 'S' : pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'D';
}

export function unlocked(cupIdx, cupsRec) {
  // also open if it was already played (the order changed on 1 November: old progress stays open)
  return cupIdx === 0 || !!cupsRec?.[CUPS[cupIdx - 1].id]?.normalWon || !!cupsRec?.[CUPS[cupIdx].id];
}
