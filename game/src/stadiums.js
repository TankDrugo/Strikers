import * as THREE from 'three';
import { FIELD } from './config.js';

// Themed stadiums, one per game our characters come from (decided with the user on 1 November). Every theme changes
// sky, lights, grass, apron, barrier, stands, LED boards and adds its own scenery around the bowl; the pitch, the goals
// and the barrier line stay the measured ones (FIELD). No logos and no real names: only the look of each world.
// `cast`: the characters of that world (their cup fills the CPU teams mostly with them).

const F = FIELD;

export const STADIUMS = [
  { id: 'arena', cast: [] },
  { id: 'giungla', cast: ['spike_brasile'] },
  { id: 'circuito', cast: ['dastardly_croazia'] },
  { id: 'isole', cast: ['sora_argentina', 'riku_uruguay', 'kairi_colombia', 'roxas_senegal'] },
  { id: 'eco', cast: ['jak_paesibassi'] },
  { id: 'quartiere', cast: ['bigsmoke_belgio'] },
  { id: 'base', cast: ['snake_usa'] },
  { id: 'bullone', cast: ['ratchet_inghilterra'] },
  { id: 'torneo', cast: ['goku_spagna', 'goku_ssj_germania', 'crilin_giappone', 'piccolo_norvegia', 'vegeta_italia'] },
];
export const stadiumIds = STADIUMS.map((s) => s.id);

// colours: sky top/bottom, fog, grass stripes, apron, barrier glass and rail, stands (concrete, seats A/B),
// roof, steps of the stands, floodlight towers, light rig (hemisphere sky/ground/intensity, sun colour/intensity/position)
const BASE = {
  sky: [0x0b1430, 0x3a4f7a], stars: true, sun: null, fog: [0x1d2a48, 70, 170],
  grass: ['#3f9a45', '#47a84d'], apron: 0x24324a, edge: 0x2f7d3a,
  glass: [0x8fe3ff, 0x1677aa], rail: [0x9ff0ff, 0x4fd8ff], post: 0xc9d6e4,
  concrete: 0x51607a, seats: [0x2b3f6b, 0x34508a], steps: 12, roof: { color: 0x2a3550, strip: 0x8fe3ff }, towers: true,
  led: { lines: ['CALCIO ARCADE', '5 CONTRO 5', 'TIRO PERFETTO', 'GOL!', 'ARENA ELETTRICA', 'PARATA!'], bg: ['#0b1a3a', '#122a5c'], colors: ['#ffd23f', '#ffffff', '#ff6b6b', '#7dd3ff'] },
  screen: 0x1b2233, crowd: [0xdfe6ee, 0x6b7a90, 0x2e3a4f, 0xb9c4d4],
  light: { sky: 0xcfe0ff, ground: 0x2a3a2a, hemi: 1.35, sun: 0xffffff, sunI: 2.2, sunPos: [-10, 34, 14] },
  decor: null,
};

const THEMES = {
  arena: {},
  // Ape Escape: jungle in the daytime, wooden stands, bamboo rails, a smoking volcano
  giungla: {
    sky: [0x2f8fe0, 0xc8ecff], stars: false, sun: { dir: [-0.4, 0.55, -0.7], color: 0xfff3c4, size: 0.035 }, fog: [0x9fd8c4, 60, 175],
    grass: ['#3d9a3a', '#48aa44'], apron: 0x5a4426, edge: 0x3a7a2a,
    glass: [0xb8f08a, 0x2f7a1a], rail: [0xd9b25a, 0x6a4a10], post: 0x8a6a3a,
    concrete: 0x6e4a2a, seats: [0x4f7d2f, 0x3d6624], steps: 9, roof: null, towers: false,
    led: { lines: ['SCIMMIE IN FUGA', 'BANANE!', 'RETINO PRONTO', 'GOL!', 'GIUNGLA', 'PRESA!'], bg: ['#1d3a12', '#2f5a1c'], colors: ['#ffe04a', '#ffffff', '#ff8a2a', '#9cff6a'] },
    screen: 0x4a3018, crowd: [0xf2d36b, 0x8a5a2a, 0xe8e0c8, 0x5a7a2a],
    light: { sky: 0xe8fff0, ground: 0x4a6a2a, hemi: 1.5, sun: 0xfff1d0, sunI: 2.6, sunPos: [-14, 30, -18] },
    decor: 'jungle',
  },
  // Wacky Races: desert racetrack at sunset, chequered grandstands, mesas, cacti, a start gantry
  circuito: {
    sky: [0x4a7ad0, 0xffc98a], stars: false, sun: { dir: [0.6, 0.18, -0.75], color: 0xffd08a, size: 0.05 }, fog: [0xe8b884, 70, 190],
    grass: ['#5a9a3c', '#66a746'], apron: 0xc79a62, edge: 0x6a8a3a,
    glass: [0xffe2b0, 0x7a4a10], rail: [0xff3a2a, 0xaa1a10], post: 0xf2f2f2,
    concrete: 0x9a7a5a, seats: [0x1a1a1a, 0xf2f2f2], steps: 8, roof: null, towers: false,
    led: { lines: ['GRAN PREMIO PAZZO', 'PIT STOP', 'BANDIERA A SCACCHI', 'GOL!', 'SORPASSO!', 'IMBROGLIONI IN AGGUATO'], bg: ['#2a1a0a', '#4a2a10'], colors: ['#ffd23f', '#ffffff', '#ff4a2a', '#ffb07a'] },
    screen: 0x2a2a2a, crowd: [0xffd23f, 0xff4a2a, 0xf2f2f2, 0x6a4a2a],
    light: { sky: 0xffe8c8, ground: 0x8a6a3a, hemi: 1.4, sun: 0xffd6a0, sunI: 2.4, sunPos: [24, 22, -20] },
    decor: 'race',
  },
  // Kingdom Hearts: a little island at sunset, sand, the sea, palm trees, a clock tower on the horizon
  isole: {
    sky: [0x4a3f8a, 0xffa86a], stars: false, sun: { dir: [0.2, 0.08, -1], color: 0xffd28a, size: 0.09 }, fog: [0xf0a07a, 80, 200],
    grass: ['#46a24a', '#52b052'], apron: 0xe8d4a0, edge: 0xd9c08a,
    glass: [0xbfe8ff, 0x2a7aaa], rail: [0xf2e6c8, 0x8a6a3a], post: 0x8a6a3a,
    concrete: 0x9a7a52, seats: [0x2a6aa8, 0xe8e0c8], steps: 7, roof: null, towers: false,
    led: { lines: ['ISOLA DEL TRAMONTO', 'CHIAVE DEL CUORE', 'AMICIZIA!', 'GOL!', 'ONDA DEL MARE', 'PARATA!'], bg: ['#2a1a4a', '#4a2a6a'], colors: ['#ffd23f', '#ffffff', '#ff9ab8', '#9ad8ff'] },
    screen: 0x5a4028, crowd: [0xf2e6c8, 0xffb36b, 0x6a4aa8, 0x2a6aa8],
    light: { sky: 0xffd8b0, ground: 0x6a5a8a, hemi: 1.35, sun: 0xffb070, sunI: 2.3, sunPos: [8, 16, -30] },
    decor: 'islands',
  },
  // Jak & Daxter: a sunny green island, ancient metal ruins, floating blue eco
  eco: {
    sky: [0x2a9ad8, 0xb8f0f0], stars: false, sun: { dir: [-0.5, 0.6, -0.6], color: 0xffffe0, size: 0.03 }, fog: [0xa8e0d8, 70, 190],
    grass: ['#48a03e', '#55af48'], apron: 0x8a7a52, edge: 0x4a8a3a,
    glass: [0x7af0ff, 0x1aa8c8], rail: [0x5ae8ff, 0x1ac8ff], post: 0x6a7a6a,
    concrete: 0x7a6a4a, seats: [0x3a8a8a, 0x8a6a3a], steps: 8, roof: null, towers: false,
    led: { lines: ['VILLAGGIO DELL\'ECO', 'ECO BLU!', 'ROVINE ANTICHE', 'GOL!', 'SALTO DOPPIO', 'PARATA!'], bg: ['#0a2a2a', '#124040'], colors: ['#7af0ff', '#ffffff', '#ffd23f', '#9cff6a'] },
    screen: 0x3a3a2a, crowd: [0xe8d8a8, 0x3a8a8a, 0xffd23f, 0x6a4a2a],
    light: { sky: 0xe8fff8, ground: 0x3a5a3a, hemi: 1.5, sun: 0xffffe8, sunI: 2.5, sunPos: [-16, 32, -14] },
    decor: 'eco',
  },
  // San Andreas: a city block at golden hour, asphalt, green seats, skyline, palms, graffiti, street lamps
  quartiere: {
    sky: [0x5a7aa8, 0xffb070], stars: false, sun: { dir: [-0.7, 0.15, -0.7], color: 0xffb060, size: 0.06 }, fog: [0xd09a70, 60, 170],
    grass: ['#4a9a3e', '#55a646'], apron: 0x3a3a3e, edge: 0x4a6a3a,
    glass: [0xd8e8d0, 0x3a6a3a], rail: [0x2fd16a, 0x0a8a3a], post: 0x8a8a8a,
    concrete: 0x7a7a7e, seats: [0x2e8b3a, 0x1f6a2a], steps: 9, roof: null, towers: true,
    led: { lines: ['QUARTIERE DELLE PALME', 'RISPETTO +', 'SQUADRA DI CASA', 'GOL!', 'GIRO DEL QUARTIERE', 'PARATA!'], bg: ['#0a1a0a', '#1a2a1a'], colors: ['#2fd16a', '#ffffff', '#ffd23f', '#d070ff'] },
    screen: 0x2a2a2a, crowd: [0x2e8b3a, 0xf2f2f2, 0x1a1a1a, 0xd8b070],
    light: { sky: 0xffd8b0, ground: 0x5a4a3a, hemi: 1.3, sun: 0xffb878, sunI: 2.3, sunPos: [-26, 18, -20] },
    decor: 'city',
  },
  // Metal Gear: an arctic base at night, snow, searchlights, crates, a radar dish
  base: {
    sky: [0x050a18, 0x26344e], stars: true, sun: null, fog: [0x2a3a52, 45, 140],
    grass: ['#5a8a6a', '#64957a'], apron: 0xdfe8f0, edge: 0xc8d8e0,
    glass: [0xc8e8ff, 0x3a6aaa], rail: [0xffd23f, 0xaa7a10], post: 0x6a7a6a,
    concrete: 0x5a6262, seats: [0x3a4a3a, 0x4a5a4a], steps: 10, roof: null, towers: true,
    led: { lines: ['BASE ARTICA', '!', 'ALLERTA', 'GOL!', 'SCATOLA DI CARTONE', 'PARATA!'], bg: ['#0a0a0a', '#1a1a10'], colors: ['#ffd23f', '#ffffff', '#ff3a2a', '#9ad8ff'] },
    screen: 0x2a3028, crowd: [0x4a5a3a, 0x3a3a3a, 0xc8d0c8, 0x6a6a5a],
    light: { sky: 0xb8d0ff, ground: 0x3a4a5a, hemi: 1.15, sun: 0xd8e8ff, sunI: 1.9, sunPos: [-8, 34, 16] },
    decor: 'arctic',
  },
  // Ratchet & Clank: a far-away planet at night, metal plates, neon, big planets, floating bolts
  bullone: {
    sky: [0x12062e, 0x5a2a8a], stars: true, sun: null, fog: [0x2a1650, 70, 190],
    grass: ['#3e9a52', '#48a85c'], apron: 0x4a5266, edge: 0x3a6a4a,
    glass: [0xff9a4a, 0xaa4a10], rail: [0xffa83a, 0xff6a10], post: 0x9aa2b8,
    concrete: 0x4a4a62, seats: [0x2a6ad8, 0xffa83a], steps: 12, roof: { color: 0x3a3a52, strip: 0xffa83a }, towers: true,
    led: { lines: ['PIANETA BULLONE', 'BULLONI x2', 'CHIAVE INGLESE', 'GOL!', 'GALASSIA', 'PARATA!'], bg: ['#1a0a3a', '#2a1a5a'], colors: ['#ffa83a', '#ffffff', '#31d6c2', '#ff4fd8'] },
    screen: 0x2a2a3a, crowd: [0xffa83a, 0x31d6c2, 0x9aa2b8, 0x6a2fd8],
    light: { sky: 0xd8c8ff, ground: 0x2a1a4a, hemi: 1.3, sun: 0xffe0c0, sunI: 2.1, sunPos: [-10, 34, 14] },
    decor: 'space',
  },
  // Dragon Ball: the open-air tournament: stone ring, temple roofs, clouds, island peaks
  torneo: {
    sky: [0x2a7ae8, 0xbfe4ff], stars: false, sun: { dir: [0.3, 0.7, -0.6], color: 0xffffff, size: 0.03 }, fog: [0xb8dcf8, 80, 200],
    grass: ['#44a246', '#50b050'], apron: 0xd8d0b8, edge: 0xc8c0a8,
    glass: [0xffe8c0, 0xaa6a1a], rail: [0xff8a1a, 0xff5a0a], post: 0xd8d0b8,
    concrete: 0xc8bea4, seats: [0xd8402a, 0xe8a83a], steps: 8, roof: null, towers: false,
    led: { lines: ['TORNEO CELESTE', 'COLPO SEGRETO', 'ENERGIA AL MASSIMO', 'GOL!', 'ARTI MARZIALI', 'PARATA!'], bg: ['#3a1a0a', '#5a2a10'], colors: ['#ffd23f', '#ffffff', '#ff8a1a', '#7dd3ff'] },
    screen: 0x5a2a1a, crowd: [0xffd23f, 0xff8a1a, 0xf2f2f2, 0x2a6ad8],
    light: { sky: 0xeaf4ff, ground: 0x6a6a4a, hemi: 1.5, sun: 0xffffff, sunI: 2.6, sunPos: [10, 34, -12] },
    decor: 'tournament',
  },
};

export function stadiumTheme(id) {
  const t = THEMES[id] ? id : 'arena';
  return { id: t, ...BASE, ...THEMES[t], led: { ...BASE.led, ...(THEMES[t].led || {}) }, light: { ...BASE.light, ...(THEMES[t].light || {}) } };
}

// ---------------------------------------------------------------- scenery helpers

const rnd = (() => { let s = 12345; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

function rrPoint(d, u) {
  // a point at fraction u of a rounded rectangle d metres outside the pitch
  const hl = F.halfLength + d, hw = F.halfWidth + d, r = F.cornerRadius + d;
  const s = new THREE.Shape();
  s.moveTo(-hl + r, -hw); s.lineTo(hl - r, -hw); s.absarc(hl - r, -hw + r, r, -Math.PI / 2, 0, false);
  s.lineTo(hl, hw - r); s.absarc(hl - r, hw - r, r, 0, Math.PI / 2, false);
  s.lineTo(-hl + r, hw); s.absarc(-hl + r, hw - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-hl, -hw + r); s.absarc(-hl + r, -hw + r, r, Math.PI, Math.PI * 1.5, false);
  return s.getPointAt(u);
}

// spots around the bowl at distance [d0, d1] from the pitch edge; the near side (+Z, behind the camera) is skipped
function spots(n, d0, d1, { farOnly = false } = {}) {
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < n * 20) {
    const d = d0 + rnd() * (d1 - d0), p = rrPoint(d, rnd());
    // things on the apron stay on the far half: the touchline camera looks across from the near side
    if (p.y > (farOnly ? -F.halfWidth : d < 8 ? -2 : F.halfWidth * 0.6)) continue;
    out.push(new THREE.Vector3(p.x, 0, p.y));
  }
  return out;
}

function instanced(geo, mat, list) {
  // list: [{ p: Vector3, s: number|Vector3, r: rotation y, rx?, rz? }]
  const m = new THREE.InstancedMesh(geo, mat, list.length);
  const o = new THREE.Object3D();
  list.forEach((it, i) => {
    o.position.copy(it.p); o.rotation.set(it.rx || 0, it.r || 0, it.rz || 0);
    if (typeof it.s === 'number') o.scale.setScalar(it.s); else o.scale.copy(it.s || new THREE.Vector3(1, 1, 1));
    o.updateMatrix(); m.setMatrixAt(i, o.matrix);
  });
  m.frustumCulled = false;
  return m;
}

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
const glow = (color) => new THREE.MeshBasicMaterial({ color, toneMapped: false });

function palms(root, list, trunkColor = 0x8a6a3a, leafColor = 0x3a8a2a) {
  // trunk (slightly bent cylinder) + a crown of drooping leaves
  const trunk = new THREE.CylinderGeometry(0.22, 0.38, 1, 7); trunk.translate(0, 0.5, 0);
  const leaf = new THREE.ConeGeometry(0.9, 4.2, 4, 1); leaf.rotateX(Math.PI / 2); leaf.translate(0, 0, 2.0); leaf.scale(1, 0.25, 1);
  const trunks = [], leaves = [];
  for (const { p, h } of list) {
    const lean = (rnd() - 0.5) * 0.25;
    trunks.push({ p, s: new THREE.Vector3(1, h, 1), rz: lean });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + rnd();
      leaves.push({ p: new THREE.Vector3(p.x - Math.sin(lean) * h, h, p.z), r: a, rx: 0.35 + rnd() * 0.3, s: 1 + h / 18 });
    }
  }
  root.add(instanced(trunk, std(trunkColor), trunks), instanced(leaf, std(leafColor, { side: THREE.DoubleSide }), leaves));
}

function skyline(root, n, d0, d1, colors, winColor, hMin, hMax) {
  // boxes with a window texture
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 64, 128);
  for (let y = 4; y < 128; y += 10) for (let x = 4; x < 64; x += 12) { g.fillStyle = Math.random() < 0.55 ? winColor : '#111'; g.fillRect(x, y, 7, 6); }
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace;
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  for (const col of colors) {
    const list = spots(Math.ceil(n / colors.length), d0, d1, { farOnly: true }).map((p) => ({ p, s: new THREE.Vector3(5 + rnd() * 9, hMin + rnd() * (hMax - hMin), 5 + rnd() * 9), r: rnd() * 0.3 }));
    root.add(instanced(box, new THREE.MeshStandardMaterial({ color: col, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5, roughness: 0.9 }), list));
  }
}

function mountains(root, n, d0, d1, color, hMin, hMax, { snow = null, radius = [10, 22] } = {}) {
  const cone = new THREE.ConeGeometry(1, 1, 7, 1); cone.translate(0, 0.5, 0);
  const list = spots(n, d0, d1, { farOnly: true }).map((p) => ({ p, s: new THREE.Vector3(radius[0] + rnd() * (radius[1] - radius[0]), hMin + rnd() * (hMax - hMin), radius[0] + rnd() * (radius[1] - radius[0])), r: rnd() * 3 }));
  root.add(instanced(cone, std(color, { flatShading: true }), list));
  if (snow) {
    const cap = new THREE.ConeGeometry(1, 1, 7, 1); cap.translate(0, 0.5, 0);
    root.add(instanced(cap, std(snow, { flatShading: true }), list.map((it) => ({ p: it.p.clone().setY(it.s.y * 0.68), s: it.s.clone().multiply(new THREE.Vector3(0.33, 0.33, 0.33)), r: it.r }))));
  }
}

function clouds(root, n, y0, y1, color = 0xffffff) {
  const sph = new THREE.SphereGeometry(1, 10, 8);
  const list = [];
  for (const p of spots(n, 30, 90, { farOnly: true })) {
    const y = y0 + rnd() * (y1 - y0);
    for (let k = 0; k < 5; k++) list.push({ p: new THREE.Vector3(p.x + (k - 2) * 3.2, y + rnd() * 1.5, p.z + rnd() * 2), s: 2.5 + rnd() * 2.5 });
  }
  root.add(instanced(sph, new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.35 }), list));
}

function sea(root, color) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.3 }));
  m.rotation.x = -Math.PI / 2; m.position.y = -0.6;
  root.add(m);
  return m;
}

function ground(root, color, y = -0.08) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), std(color));
  m.rotation.x = -Math.PI / 2; m.position.y = y;
  root.add(m);
}

function flagTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#111' : '#f2f2f2'; g.fillRect(x * 8, y * 8, 8, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
  return t;
}

// ---------------------------------------------------------------- scenery per theme
// ctx: { outer (stands depth beyond the pitch edge), top (height of the last step), anim: [] (update callbacks) }

const DECOR = {
  jungle(root, ctx) {
    ground(root, 0x2f5a1c);
    mountains(root, 9, 70, 120, 0x2a6a2a, 25, 55, { radius: [16, 30] });
    // the volcano with its smoke
    const v = new THREE.Mesh(new THREE.CylinderGeometry(8, 34, 48, 9, 1, true), std(0x5a4a3a, { flatShading: true }));
    v.position.set(-30, 24, -110); root.add(v);
    const smoke = [];
    for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(6 + k * 1.5, 10, 8), new THREE.MeshLambertMaterial({ color: 0xd8d8d0, transparent: true, opacity: 0.7 })); s.position.set(-30, 52 + k * 7, -110); root.add(s); smoke.push(s); }
    ctx.anim.push((t) => smoke.forEach((s, k) => { s.position.y = 52 + ((k * 7 + t * 2) % 42); s.material.opacity = 0.75 * (1 - ((k * 7 + t * 2) % 42) / 42); }));
    // jungle trees: trunks and round canopies, taller than the stands
    const trunk = new THREE.CylinderGeometry(0.5, 0.9, 1, 7); trunk.translate(0, 0.5, 0);
    const crown = new THREE.SphereGeometry(1, 9, 7);
    const pts = spots(70, ctx.outer + 1, ctx.outer + 22);
    const trunks = pts.map((p) => ({ p, s: new THREE.Vector3(1, 12 + rnd() * 10, 1) }));
    root.add(instanced(trunk, std(0x5a3a1e), trunks));
    root.add(instanced(crown, std(0x2f7a24, { flatShading: true }), trunks.flatMap((t) => [0, 1, 2].map((k) => ({ p: new THREE.Vector3(t.p.x + (k - 1) * 2.4, t.s.y + rnd() * 2, t.p.z + rnd() * 2), s: 3.2 + rnd() * 2.2 })))));
    palms(root, spots(18, 2.2, 6.5).map((p) => ({ p, h: 5 + rnd() * 3 })), 0x8a6a3a, 0x3aa02a);
    // banana bunches on the apron
    const banana = new THREE.CapsuleGeometry(0.12, 0.5, 3, 6);
    root.add(instanced(banana, std(0xffd83a), spots(40, 2, 6.5).map((p) => ({ p: p.setY(0.15), rz: Math.PI / 2, r: rnd() * 3, s: 1 }))));
  },

  race(root, ctx) {
    ground(root, 0xc89a5a);
    // mesas and buttes
    const butte = new THREE.CylinderGeometry(1, 1.15, 1, 8); butte.translate(0, 0.5, 0);
    root.add(instanced(butte, std(0xa8522a, { flatShading: true }), spots(16, 55, 120, { farOnly: true }).map((p) => ({ p, s: new THREE.Vector3(8 + rnd() * 14, 14 + rnd() * 26, 8 + rnd() * 14), r: rnd() }))));
    // cacti
    const cact = new THREE.CapsuleGeometry(0.35, 2.6, 3, 8); cact.translate(0, 1.6, 0);
    const arm = new THREE.CapsuleGeometry(0.22, 1.0, 3, 6); arm.translate(0, 0.5, 0);
    const cpts = spots(40, ctx.outer + 2, ctx.outer + 30);
    root.add(instanced(cact, std(0x3a7a3a), cpts.map((p) => ({ p, s: 1 + rnd() }))));
    root.add(instanced(arm, std(0x3a7a3a), cpts.flatMap((p, i) => [{ p: p.clone().add(new THREE.Vector3(0.45, 1.6 + (i % 3) * 0.3, 0)), rz: -0.7, s: 1 }, { p: p.clone().add(new THREE.Vector3(-0.45, 1.3, 0)), rz: 0.7, s: 0.8 }])));
    // chequered flags on poles along the apron, and tyre stacks
    const flagMat = new THREE.MeshBasicMaterial({ map: flagTexture(), side: THREE.DoubleSide });
    const pole = new THREE.CylinderGeometry(0.05, 0.05, 3, 6); pole.translate(0, 1.5, 0);
    const flag = new THREE.PlaneGeometry(1.2, 0.8); flag.translate(0.6, 2.6, 0);
    const fpts = spots(24, 2.5, 6.8);
    root.add(instanced(pole, std(0xdddddd), fpts.map((p) => ({ p }))));
    const flags = instanced(flag, flagMat, fpts.map((p) => ({ p, r: rnd() * 3 })));
    root.add(flags);
    const tyre = new THREE.TorusGeometry(0.42, 0.18, 6, 12); tyre.rotateX(Math.PI / 2);
    root.add(instanced(tyre, std(0x1a1a1a), spots(22, 2, 6.5).flatMap((p) => [0, 1, 2].map((k) => ({ p: p.clone().setY(0.18 + k * 0.34), s: 1 })))));
    // start gantry over the far stands
    const gm = std(0xd8d8d8, { metalness: 0.5 });
    const z = -(F.halfWidth + ctx.outer + 3);
    for (const x of [-12, 12]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.8, ctx.top + 9, 0.8), gm); leg.position.set(x, (ctx.top + 9) / 2, z); root.add(leg); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(25, 2.4, 1), new THREE.MeshBasicMaterial({ map: flagTexture() }));
    beam.material.map.repeat.set(10, 1); beam.material.map.wrapS = THREE.RepeatWrapping;
    beam.position.set(0, ctx.top + 9, z); root.add(beam);
    const lights = [];
    for (let k = 0; k < 5; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), glow(0x330000)); l.position.set(-6 + k * 3, ctx.top + 7.2, z + 0.6); root.add(l); lights.push(l); }
    ctx.anim.push((t) => lights.forEach((l, k) => l.material.color.setHex(((t * 1.2) % 7) > k ? ((t * 1.2) % 7 > 5.5 ? 0x22ff44 : 0xff2222) : 0x330000)));
  },

  islands(root, ctx) {
    sea(root, 0x2a6aa8);
    // sand island under the bowl
    const sand = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 40), std(0xe8d4a0));
    sand.scale.set(F.halfLength + ctx.outer + 26, 0.6, F.halfWidth + ctx.outer + 20); sand.position.y = -0.35; root.add(sand);
    palms(root, [...spots(26, ctx.outer + 2, ctx.outer + 18), ...spots(8, 2.3, 6.5)].map((p) => ({ p, h: 6 + rnd() * 6 })), 0x9a7a4a, 0x2f9a3a);
    // small islands on the sea
    const isle = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    root.add(instanced(isle, std(0x4a8a3a, { flatShading: true }), spots(7, 70, 130, { farOnly: true }).map((p) => ({ p: p.setY(-0.6), s: new THREE.Vector3(8 + rnd() * 10, 4 + rnd() * 8, 8 + rnd() * 10) }))));
    // wooden pier and a lookout tower with a little bridge
    const wood = std(0x8a6a3a);
    const z = -(F.halfWidth + ctx.outer + 8);
    for (const x of [-24, -16]) { const t = new THREE.Mesh(new THREE.BoxGeometry(3, 10, 3), wood); t.position.set(x, 5, z); root.add(t); const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 2.4, 4), std(0x6a4a2a)); roof.position.set(x, 11.2, z); roof.rotation.y = Math.PI / 4; root.add(roof); }
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 1.4), wood); bridge.position.set(-20, 8.5, z); root.add(bridge);
    // the town clock tower far away
    const tower = new THREE.Mesh(new THREE.BoxGeometry(7, 46, 7), std(0xc87a4a)); tower.position.set(46, 23, -120); root.add(tower);
    const clock = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), glow(0xfff2c8)); clock.position.set(46, 40, -116.4); root.add(clock);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(5.6, 8, 4), std(0x8a3a2a)); cap.position.set(46, 50, -120); cap.rotation.y = Math.PI / 4; root.add(cap);
    clouds(root, 6, 30, 50, 0xffc8a8);
  },

  eco(root, ctx) {
    sea(root, 0x2a8ac8);
    const land = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 1, 40), std(0x4a8a3a));
    land.scale.set(F.halfLength + ctx.outer + 30, 2, F.halfWidth + ctx.outer + 24); land.position.y = -1.05; root.add(land);
    mountains(root, 8, 60, 110, 0x3a7a3a, 30, 60, { radius: [14, 26] });
    // ancient metal ruins: tall tilted pillars with glowing lines
    const pil = new THREE.CylinderGeometry(1.2, 1.8, 1, 6); pil.translate(0, 0.5, 0);
    const ppts = spots(14, ctx.outer + 3, ctx.outer + 26);
    root.add(instanced(pil, std(0x6a6e64, { metalness: 0.5, flatShading: true }), ppts.map((p) => ({ p, s: new THREE.Vector3(1, 10 + rnd() * 14, 1), rz: (rnd() - 0.5) * 0.3 }))));
    const band = new THREE.TorusGeometry(1.6, 0.12, 6, 18); band.rotateX(Math.PI / 2);
    root.add(instanced(band, glow(0x4ae8ff), ppts.map((p) => ({ p: p.clone().setY(6 + rnd() * 4) }))));
    // floating blue eco
    const orb = new THREE.SphereGeometry(0.35, 12, 10);
    const orbs = instanced(orb, glow(0x5af0ff), spots(46, 1.8, ctx.outer + 10).map((p) => ({ p: p.setY(1 + rnd() * 2) })));
    root.add(orbs);
    const base = []; const o = new THREE.Matrix4();
    for (let i = 0; i < orbs.count; i++) { orbs.getMatrixAt(i, o); base.push(new THREE.Vector3().setFromMatrixPosition(o)); }
    ctx.anim.push((t) => { base.forEach((b, i) => { o.makeTranslation(b.x, b.y + Math.sin(t * 2 + i) * 0.35, b.z); orbs.setMatrixAt(i, o); }); orbs.instanceMatrix.needsUpdate = true; });
    // a silo tower
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(5, 6, 34, 16), std(0x9a9a8a, { metalness: 0.4 })); silo.position.set(-48, 17, -70); root.add(silo);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(0x6a8a8a, { metalness: 0.6 })); dome.position.set(-48, 34, -70); root.add(dome);
    palms(root, spots(14, ctx.outer + 2, ctx.outer + 14).map((p) => ({ p, h: 7 + rnd() * 5 })), 0x8a6a3a, 0x3aa03a);
  },

  city(root, ctx) {
    ground(root, 0x3a3a3e);
    skyline(root, 40, ctx.outer + 14, ctx.outer + 70, [0x8a7a6a, 0x6a6a72, 0xb09a7a, 0x5a5a62], '#ffd88a', 10, 46);
    palms(root, spots(30, ctx.outer + 2, ctx.outer + 12).map((p) => ({ p, h: 14 + rnd() * 8 })), 0x7a5a3a, 0x3a7a2a);
    // street lamps
    const pole = new THREE.CylinderGeometry(0.08, 0.1, 5, 6); pole.translate(0, 2.5, 0);
    const lamp = new THREE.SphereGeometry(0.28, 8, 6); lamp.translate(0, 5.1, 0);
    const lpts = spots(20, 2.4, 6.8);
    root.add(instanced(pole, std(0x3a3a3a), lpts.map((p) => ({ p }))), instanced(lamp, glow(0xffd28a), lpts.map((p) => ({ p }))));
    // graffiti on the far wall of the apron
    const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
    const g = c.getContext('2d'); g.fillStyle = '#6a6a6a'; g.fillRect(0, 0, 1024, 128);
    for (let i = 0; i < 26; i++) { g.fillStyle = ['#2fd16a', '#d070ff', '#ffd23f', '#ff4a6a', '#3ab0ff'][i % 5]; g.beginPath(); g.ellipse(Math.random() * 1024, 30 + Math.random() * 70, 30 + Math.random() * 60, 18 + Math.random() * 25, Math.random(), 0, Math.PI * 2); g.fill(); }
    g.font = 'bold 72px Impact, sans-serif'; g.fillStyle = '#111'; g.fillText('QUARTIERE', 300, 96); g.fillStyle = '#2fd16a'; g.fillText('QUARTIERE', 294, 90);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(36, 4.5), new THREE.MeshBasicMaterial({ map: tex }));
    wall.position.set(0, ctx.top + 4.5, -(F.halfWidth + ctx.outer + 1)); root.add(wall);
    // a hill with big white letters far away (just shapes)
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(0x7a6a3a, { flatShading: true }));
    hill.scale.set(70, 34, 30); hill.position.set(-30, -2, -150); root.add(hill);
    const lb = new THREE.BoxGeometry(2.2, 5, 0.4);
    root.add(instanced(lb, glow(0xf2f2f2), [0, 1, 2, 3, 4, 5, 6].map((k) => ({ p: new THREE.Vector3(-46 + k * 4.5, 22, -122) }))));
  },

  arctic(root, ctx) {
    ground(root, 0xdfe8f0);
    mountains(root, 10, 60, 120, 0x4a5a6a, 30, 60, { snow: 0xf2f8ff, radius: [16, 28] });
    // hangars, crates and a radar dish
    const hangar = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI); hangar.rotateZ(Math.PI / 2); hangar.rotateY(Math.PI / 2);
    root.add(instanced(hangar, std(0x6a7a6a, { metalness: 0.4, side: THREE.DoubleSide }), [-34, 0, 34].map((x) => ({ p: new THREE.Vector3(x, 0, -(F.halfWidth + ctx.outer + 14)), s: new THREE.Vector3(9, 9, 16), r: Math.PI / 2 }))));
    const crate = new THREE.BoxGeometry(1, 1, 1); crate.translate(0, 0.5, 0);
    root.add(instanced(crate, std(0x7a6a4a), spots(30, 2.2, 6.8).flatMap((p) => { const n = 1 + Math.floor(rnd() * 2); return [...Array(n)].map((_, k) => ({ p: p.clone().setY(k * 1.2), s: 1.2, r: rnd() })); })));
    // one cardboard box, of course
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.8), std(0xb08a5a)); box.position.set(F.halfLength + 3, 0.45, -F.halfWidth - 3); root.add(box);
    const dishPole = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 16, 8), std(0x7a7a7a)); dishPole.position.set(50, 8, -60); root.add(dishPole);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(7, 18, 10, 0, Math.PI * 2, 0, Math.PI / 3), std(0xdddddd, { side: THREE.DoubleSide, metalness: 0.4 }));
    dish.position.set(50, 17, -60); dish.rotation.x = -1.1; root.add(dish);
    ctx.anim.push((t) => { dish.rotation.z = t * 0.25; });
    // searchlights sweeping the sky
    const beams = [];
    for (const x of [-30, 0, 30]) {
      const geo = new THREE.ConeGeometry(3.5, 60, 16, 1, true); geo.translate(0, -30, 0); geo.rotateX(Math.PI);
      const b = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xf2f8ff, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      b.position.set(x, ctx.top + 3, -(F.halfWidth + ctx.outer + 4)); root.add(b); beams.push(b);
    }
    ctx.anim.push((t) => beams.forEach((b, k) => { b.rotation.z = Math.sin(t * 0.5 + k * 2) * 0.6; b.rotation.x = -0.35 + Math.cos(t * 0.4 + k) * 0.2; }));
    // falling snow
    const n = 1500, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 90; pos[i * 3 + 1] = Math.random() * 30; pos[i * 3 + 2] = (Math.random() - 0.5) * 60; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const snow = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.85, depthWrite: false }));
    snow.frustumCulled = false; root.add(snow);
    let last = 0;
    ctx.anim.push((t) => { const dt = Math.min(0.1, t - last); last = t; for (let i = 0; i < n; i++) { let y = pos[i * 3 + 1] - dt * (1.2 + (i % 5) * 0.2); if (y < 0) y += 30; pos[i * 3 + 1] = y; pos[i * 3] += Math.sin(t + i) * dt * 0.3; } sg.attributes.position.needsUpdate = true; });
  },

  space(root, ctx) {
    ground(root, 0x2a2a3a);
    // two big planets with a ring, and a moon
    const p1 = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 24), std(0xd88a4a, { emissive: 0x3a1a0a }));
    p1.position.set(-60, 55, -150); root.add(p1);
    const ring = new THREE.Mesh(new THREE.RingGeometry(38, 52, 48), new THREE.MeshBasicMaterial({ color: 0xffc89a, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    ring.position.copy(p1.position); ring.rotation.set(1.2, 0.3, 0.2); root.add(ring);
    const p2 = new THREE.Mesh(new THREE.SphereGeometry(11, 24, 16), std(0x6ad8c8, { emissive: 0x0a2a2a })); p2.position.set(70, 70, -130); root.add(p2);
    // futuristic towers with neon bands
    const tw = new THREE.CylinderGeometry(1, 1.6, 1, 8); tw.translate(0, 0.5, 0);
    const tpts = spots(22, ctx.outer + 6, ctx.outer + 50, { farOnly: true });
    root.add(instanced(tw, std(0x5a5a72, { metalness: 0.6 }), tpts.map((p) => ({ p, s: new THREE.Vector3(2.5, 18 + rnd() * 30, 2.5) }))));
    const nb = new THREE.TorusGeometry(2.8, 0.18, 6, 20); nb.rotateX(Math.PI / 2);
    root.add(instanced(nb, glow(0x31d6c2), tpts.flatMap((p) => [10, 16].map((y) => ({ p: p.clone().setY(y + rnd() * 6) })))));
    // floating bolts (hex nuts) spinning over the apron
    const nut = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 6); nut.rotateX(Math.PI / 2);
    const bolts = instanced(nut, std(0xd8dce8, { metalness: 0.9, roughness: 0.25 }), spots(36, 2, 6.8).map((p) => ({ p: p.setY(1.5 + rnd() * 1.5) })));
    root.add(bolts);
    const base = []; const o = new THREE.Object3D(), m = new THREE.Matrix4();
    for (let i = 0; i < bolts.count; i++) { bolts.getMatrixAt(i, m); base.push(new THREE.Vector3().setFromMatrixPosition(m)); }
    ctx.anim.push((t) => { base.forEach((b, i) => { o.position.set(b.x, b.y + Math.sin(t * 1.6 + i) * 0.3, b.z); o.rotation.set(0, t * 1.5 + i, 0); o.scale.setScalar(1); o.updateMatrix(); bolts.setMatrixAt(i, o.matrix); }); bolts.instanceMatrix.needsUpdate = true; });
  },

  tournament(root, ctx) {
    sea(root, 0x3a8ad8);
    clouds(root, 10, 12, 40);
    // island peaks: tall round rocks with green tops
    const rock = new THREE.CylinderGeometry(0.8, 1, 1, 9); rock.translate(0, 0.5, 0);
    const rpts = spots(12, 50, 110, { farOnly: true });
    const rocks = rpts.map((p) => ({ p: p.setY(-0.6), s: new THREE.Vector3(5 + rnd() * 6, 20 + rnd() * 40, 5 + rnd() * 6) }));
    root.add(instanced(rock, std(0xb89a6a, { flatShading: true }), rocks));
    const top = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    root.add(instanced(top, std(0x3a8a3a, { flatShading: true }), rocks.map((r) => ({ p: r.p.clone().setY(r.s.y - 0.6), s: new THREE.Vector3(r.s.x * 0.9, 3, r.s.z * 0.9) }))));
    // the stone island under the arena
    const isle = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48), std(0xd8d0b8));
    isle.scale.set(F.halfLength + ctx.outer + 16, 0.6, F.halfWidth + ctx.outer + 14); isle.position.y = -0.35; root.add(isle);
    // temple gates with curved orange roofs at the corners and over the far stands
    const pillar = new THREE.CylinderGeometry(0.5, 0.5, 1, 10); pillar.translate(0, 0.5, 0);
    const roofGeo = new THREE.BoxGeometry(1, 1, 1);
    const red = std(0xc8321e), roofMat = std(0xff8a1a);
    const gates = [[0, -(F.halfWidth + ctx.outer + 3), 0], [-(F.halfLength + ctx.outer + 2), -6, Math.PI / 2], [F.halfLength + ctx.outer + 2, -6, Math.PI / 2]];
    for (const [x, z, r] of gates) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r;
      for (const dx of [-6, 6]) { const p = new THREE.Mesh(pillar, red); p.scale.set(1, ctx.top + 8, 1); p.position.x = dx; g.add(p); }
      for (const [y, w] of [[ctx.top + 8, 17], [ctx.top + 6.2, 14]]) { const b = new THREE.Mesh(roofGeo, y > ctx.top + 7 ? roofMat : red); b.scale.set(w, 0.8, 1.6); b.position.y = y; g.add(b); }
      const tipL = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 6), roofMat); tipL.position.set(-8.6, ctx.top + 8.6, 0); tipL.rotation.z = 0.9; g.add(tipL);
      const tipR = tipL.clone(); tipR.position.x = 8.6; tipR.rotation.z = -0.9; g.add(tipR);
      root.add(g);
    }
    // lanterns on the apron
    const lan = new THREE.SphereGeometry(0.35, 10, 8);
    const pole = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6); pole.translate(0, 1.2, 0);
    const lpts = spots(24, 2.4, 6.8);
    root.add(instanced(pole, std(0x4a2a1a), lpts.map((p) => ({ p }))), instanced(lan, glow(0xffa83a), lpts.map((p) => ({ p: p.clone().setY(2.5) }))));
  },
};

export function buildDecor(root, theme, ctx) {
  const f = theme.decor && DECOR[theme.decor];
  if (f) f(root, ctx);
}
