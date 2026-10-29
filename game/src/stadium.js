import * as THREE from 'three';
import { FIELD } from './config.js';

// An original enclosed arena built around the measured pitch: apron, electric barrier,
// stepped stands with an animated crowd, roof ring, four floodlight towers,
// LED boards and a big screen that shows score and clock.

const F = FIELD;

function roundedRect(hl, hw, r) {
  const s = new THREE.Shape();
  s.moveTo(-hl + r, -hw);
  s.lineTo(hl - r, -hw); s.absarc(hl - r, -hw + r, r, -Math.PI / 2, 0, false);
  s.lineTo(hl, hw - r); s.absarc(hl - r, hw - r, r, 0, Math.PI / 2, false);
  s.lineTo(-hl + r, hw); s.absarc(-hl + r, hw - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-hl, -hw + r); s.absarc(-hl + r, -hw + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function ringGeometry(innerHl, innerHw, innerR, outerHl, outerHw, outerR, height) {
  const outer = roundedRect(outerHl, outerHw, outerR);
  const hole = new THREE.Path(roundedRect(innerHl, innerHw, innerR).getPoints(48).reverse());
  outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, { depth: height, bevelEnabled: false, curveSegments: 24 });
  g.rotateX(-Math.PI / 2); // extrude upwards, shape lies on XZ
  return g;
}

// Points along a rounded rectangle, evenly spaced.
function perimeterPoints(hl, hw, r, spacing) {
  const pts = roundedRect(hl, hw, r).getSpacedPoints(Math.max(8, Math.round((4 * (hl + hw)) / spacing)));
  return pts.map((p) => new THREE.Vector2(p.x, p.y));
}

function ledTexture(lines) {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, c.width, 0);
  grad.addColorStop(0, '#0b1a3a'); grad.addColorStop(0.5, '#122a5c'); grad.addColorStop(1, '#0b1a3a');
  g.fillStyle = grad; g.fillRect(0, 0, c.width, c.height);
  g.font = 'bold 40px Trebuchet MS, sans-serif';
  g.textBaseline = 'middle';
  let x = 30;
  for (let i = 0; x < c.width; i++) {
    const t = lines[i % lines.length];
    g.fillStyle = ['#ffd23f', '#ffffff', '#ff6b6b', '#7dd3ff'][i % 4];
    g.fillText(t, x, 34);
    x += g.measureText(t).width + 90;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Stadium {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);
    this.time = 0;
    this.buildSky(scene);
    this.buildApron();
    this.buildBarrier();
    this.buildStands();
    this.buildCrowd();
    this.buildRoofAndLights();
    this.buildScreen();
    this.lastScreen = '';
  }

  buildSky(scene) {
    const geo = new THREE.SphereGeometry(180, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { top: { value: new THREE.Color(0x0b1430) }, bottom: { value: new THREE.Color(0x3a4f7a) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);} void main(){ float t = clamp(vP.y*1.6+0.15,0.0,1.0); vec3 c = mix(bottom, top, t); float s = step(0.9975, h(floor(vP*240.0))) * smoothstep(0.15,0.6,vP.y); gl_FragColor = vec4(c + s*0.8, 1.0); }',
    });
    const sky = new THREE.Mesh(geo, mat);
    scene.add(sky);
    scene.background = null;
    scene.fog = new THREE.Fog(0x1d2a48, 70, 170);
  }

  buildApron() {
    // run-off area between pitch and stands
    const g = ringGeometry(F.halfLength + 1.4, F.halfWidth + 1.4, F.cornerRadius + 1.4, F.halfLength + 7.5, F.halfWidth + 7.5, F.cornerRadius + 7.5, 0.02);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x24324a, roughness: 0.95 }));
    m.position.y = -0.03; m.receiveShadow = true;
    this.root.add(m);
    // under the pitch edge
    const edge = ringGeometry(F.halfLength, F.halfWidth, F.cornerRadius, F.halfLength + 1.45, F.halfWidth + 1.45, F.cornerRadius + 1.45, 0.02);
    const e = new THREE.Mesh(edge, new THREE.MeshStandardMaterial({ color: 0x2f7d3a, roughness: 1 }));
    e.position.y = -0.025; this.root.add(e);
  }

  buildBarrier() {
    // electric barrier: glass panels, glowing rails and posts following the rounded pitch edge
    const h = 1.15, hl = F.halfLength + 0.25, hw = F.halfWidth + 0.25, r = F.cornerRadius + 0.25;
    const pts = perimeterPoints(hl, hw, r, 0.5);
    const glass = new THREE.MeshStandardMaterial({ color: 0x8fe3ff, emissive: 0x1677aa, emissiveIntensity: 0.6, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
    this.railMat = new THREE.MeshStandardMaterial({ color: 0x9ff0ff, emissive: 0x4fd8ff, emissiveIntensity: 1.6 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0xc9d6e4, metalness: 0.6, roughness: 0.3 });
    const panelPos = [], railPos = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const mx = (a.x + b.x) / 2, mz = (a.y + b.y) / 2;
      if (Math.abs(mx) > F.halfLength - 0.2 && Math.abs(mz) < F.goalHalfWidth + 0.3) continue; // goal mouths stay open
      panelPos.push(a.x, 0, a.y, b.x, 0, b.y, b.x, h, b.y, a.x, 0, a.y, b.x, h, b.y, a.x, h, a.y);
      railPos.push([a, b]);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(panelPos, 3));
    pg.computeVertexNormals();
    this.root.add(new THREE.Mesh(pg, glass));
    const rail = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.07, 0.07), this.railMat, railPos.length * 2);
    const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.045, 0.06, h + 0.12, 8), postMat, Math.ceil(railPos.length / 3));
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    let ri = 0, pi = 0;
    railPos.forEach(([a, b], i) => {
      const len = Math.hypot(b.x - a.x, b.y - a.y) + 0.02;
      q.setFromAxisAngle(up, -Math.atan2(b.y - a.y, b.x - a.x));
      for (const y of [h, 0.12]) { m.compose(p.set((a.x + b.x) / 2, y, (a.y + b.y) / 2), q, s.set(len, 1, 1)); rail.setMatrixAt(ri++, m); }
      if (i % 3 === 0 && pi < post.count) { m.compose(p.set(a.x, (h + 0.12) / 2, a.y), q, s.set(1, 1, 1)); post.setMatrixAt(pi++, m); }
    });
    rail.count = ri; post.count = pi;
    this.root.add(rail, post);
  }

  buildStands() {
    // stepped bowl; the near touchline side (+Z, where the camera sits) stays low
    const concrete = new THREE.MeshStandardMaterial({ color: 0x51607a, roughness: 0.9 });
    const seatA = new THREE.MeshStandardMaterial({ color: 0x2b3f6b, roughness: 0.8 });
    const seatB = new THREE.MeshStandardMaterial({ color: 0x34508a, roughness: 0.8 });
    this.tiers = [];
    const base = 7.6, depth = 0.95, rise = 0.55, steps = 12;
    for (let i = 0; i < steps; i++) {
      const o = base + i * depth;
      const g = ringGeometry(F.halfLength + o, F.halfWidth + o, F.cornerRadius + o, F.halfLength + o + depth + 0.02, F.halfWidth + o + depth + 0.02, F.cornerRadius + o + depth + 0.02, 1.2 + i * rise);
      const mesh = new THREE.Mesh(g, i % 2 ? seatA : seatB);
      mesh.receiveShadow = true;
      this.root.add(mesh);
      this.tiers.push({ inner: o, top: 1.2 + i * rise });
    }
    // front wall between apron and first tier, carrying the LED boards
    const wall = new THREE.Mesh(ringGeometry(F.halfLength + 7.3, F.halfWidth + 7.3, F.cornerRadius + 7.3, F.halfLength + 7.62, F.halfWidth + 7.62, F.cornerRadius + 7.62, 1.25), concrete);
    this.root.add(wall);
    // back wall
    const outer = base + steps * depth;
    const back = new THREE.Mesh(ringGeometry(F.halfLength + outer, F.halfWidth + outer, F.cornerRadius + outer, F.halfLength + outer + 0.6, F.halfWidth + outer + 0.6, F.cornerRadius + outer + 0.6, 1.2 + steps * rise + 2.5), concrete);
    this.root.add(back);
    this.outer = outer;
    // LED boards: a strip on the inside face of the front wall
    this.led = ledTexture(['CALCIO ARCADE', '5 CONTRO 5', 'TIRO PERFETTO', 'GOL!', 'ARENA ELETTRICA', 'PARATA!']);
    const ledMat = new THREE.MeshBasicMaterial({ map: this.led, toneMapped: false });
    const pts = perimeterPoints(F.halfLength + 7.28, F.halfWidth + 7.28, F.cornerRadius + 7.28, 0.6);
    const pos = [], uv = [];
    let u = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y), u2 = u + len / 40;
      pos.push(a.x, 0.25, a.y, b.x, 0.25, b.y, b.x, 1.1, b.y, a.x, 0.25, a.y, b.x, 1.1, b.y, a.x, 1.1, a.y);
      uv.push(u, 0, u2, 0, u2, 1, u, 0, u2, 1, u, 1);
      u = u2;
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    lg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    this.root.add(new THREE.Mesh(lg, ledMat));
  }

  buildCrowd() {
    // one small figure per seat block; colours lean yellow on the -X half and red on the +X half
    const body = new THREE.CapsuleGeometry(0.17, 0.32, 3, 6);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.8 });
    this.crowdUniforms = { uTime: { value: 0 }, uHype: { value: 0 } };
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = this.crowdUniforms.uTime;
      sh.uniforms.uHype = this.crowdUniforms.uHype;
      sh.vertexShader = 'uniform float uTime; uniform float uHype; attribute float aPhase;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n float j = max(0.0, sin(uTime * (3.0 + uHype * 6.0) + aPhase * 6.2831)); transformed.y += j * (0.04 + uHype * 0.32);');
    };
    const spots = [];
    this.tiers.forEach((t, i) => {
      const pts = perimeterPoints(F.halfLength + t.inner + 0.45, F.halfWidth + t.inner + 0.45, F.cornerRadius + t.inner + 0.45, 0.62);
      for (const p of pts) {
        if (Math.random() < 0.12) continue; // a few empty seats
        spots.push([p.x, t.top + 0.33, p.y]);
      }
    });
    const crowd = new THREE.InstancedMesh(body, mat, spots.length);
    const phase = new Float32Array(spots.length);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    const yellow = [0xffd23f, 0xffe27a, 0xf2b705], red = [0xff4f4f, 0xe23b3b, 0xff7a7a], neutral = [0xdfe6ee, 0x6b7a90, 0x2e3a4f, 0x88c0ff];
    spots.forEach(([x, y, z], i) => {
      m.makeTranslation(x, y, z);
      crowd.setMatrixAt(i, m);
      const pal = Math.random() < 0.65 ? (x < 0 ? yellow : red) : neutral;
      crowd.setColorAt(i, c.setHex(pal[Math.floor(Math.random() * pal.length)]));
      phase[i] = Math.random();
    });
    body.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1));
    crowd.frustumCulled = false;
    this.root.add(crowd);
    this.crowdCount = spots.length;
  }

  buildRoofAndLights() {
    const o = this.outer;
    const roofY = 1.2 + 12 * 0.55 + 4.5;
    const roof = new THREE.Mesh(ringGeometry(F.halfLength + o - 6, F.halfWidth + o - 6, F.cornerRadius + o - 6, F.halfLength + o + 0.8, F.halfWidth + o + 0.8, F.cornerRadius + o + 0.8, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x2a3550, roughness: 0.7, metalness: 0.3, side: THREE.DoubleSide }));
    roof.position.y = roofY;
    this.root.add(roof);
    const strip = new THREE.Mesh(ringGeometry(F.halfLength + o - 6.05, F.halfWidth + o - 6.05, F.cornerRadius + o - 6.05, F.halfLength + o - 5.75, F.halfWidth + o - 5.75, F.cornerRadius + o - 5.75, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x8fe3ff, toneMapped: false }));
    strip.position.y = roofY - 0.05;
    this.root.add(strip);
    // floodlight towers at the four corners
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x9aa7ba, metalness: 0.6, roughness: 0.4 });
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfffbe8, toneMapped: false });
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,250,230,1)'); r.addColorStop(0.25, 'rgba(255,240,200,.5)'); r.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const x = sx * (F.halfLength + o - 1), z = sz * (F.halfWidth + o - 1);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, roofY + 9, 10), poleMat);
      pole.position.set(x, (roofY + 9) / 2, z); this.root.add(pole);
      const head = new THREE.Mesh(new THREE.BoxGeometry(5, 2.4, 0.5), lampMat);
      head.position.set(x, roofY + 9, z); head.lookAt(0, 0, 0); this.root.add(head);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.position.copy(head.position); glow.scale.setScalar(14); this.root.add(glow);
    }
  }

  buildScreen() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 384;
    this.screenCanvas = c;
    this.screenTex = new THREE.CanvasTexture(c);
    this.screenTex.colorSpace = THREE.SRGBColorSpace;
    const o = this.outer;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(16.6, 6.6, 0.6), new THREE.MeshStandardMaterial({ color: 0x1b2233, metalness: 0.4 }));
    frame.position.set(0, 1.2 + 12 * 0.55 + 4.5 + 4.2, -(F.halfWidth + o - 2));
    this.root.add(frame);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), new THREE.MeshBasicMaterial({ map: this.screenTex, toneMapped: false }));
    scr.position.copy(frame.position); scr.position.z += 0.31;
    this.root.add(scr);
    this.drawScreen([0, 0], 180, '');
  }

  drawScreen(score, clock, msg) {
    const key = `${score[0]}-${score[1]}-${Math.ceil(clock)}-${msg}`;
    if (key === this.lastScreen) return;
    this.lastScreen = key;
    const g = this.screenCanvas.getContext('2d');
    g.fillStyle = '#050b18'; g.fillRect(0, 0, 1024, 384);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (msg) {
      g.fillStyle = '#ffd23f'; g.font = 'bold 190px Trebuchet MS, sans-serif'; g.fillText(msg, 512, 200);
    } else {
      g.font = 'bold 170px Trebuchet MS, sans-serif';
      g.fillStyle = '#ffd23f'; g.fillText(String(score[0]), 260, 175);
      g.fillStyle = '#ffffff'; g.fillText('–', 512, 170);
      g.fillStyle = '#ff6b6b'; g.fillText(String(score[1]), 764, 175);
      const c = Math.max(0, Math.ceil(clock));
      g.font = 'bold 64px Trebuchet MS, sans-serif'; g.fillStyle = '#9fdcff';
      g.fillText(`${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`, 512, 320);
    }
    this.screenTex.needsUpdate = true;
  }

  update(dt, game) {
    this.time += dt;
    this.crowdUniforms.uTime.value = this.time;
    const hype = game && game.phase === 'goal' ? 1 : game && game.ball && game.ball.shotTimer > 0 ? 0.45 : 0.05;
    this.crowdUniforms.uHype.value += (hype - this.crowdUniforms.uHype.value) * Math.min(1, dt * 3);
    this.led.offset.x = (this.time * 0.05) % 1;
    this.railMat.emissiveIntensity = 1.3 + Math.sin(this.time * 9) * 0.25;
    if (game) this.drawScreen(game.score, game.clock, game.phase === 'goal' ? 'GOL!' : '');
  }
}
