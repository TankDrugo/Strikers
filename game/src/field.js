import * as THREE from 'three';
import { FIELD, BALL } from './config.js';

const F = FIELD;

function pitchTexture(grass = ['#3f9a45', '#47a84d']) {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 1200;
  const g = c.getContext('2d');
  const sx = c.width / (2 * (F.halfLength + 1.5)), sz = c.height / (2 * (F.halfWidth + 1.5));
  const X = (x) => c.width / 2 + x * sx, Z = (z) => c.height / 2 + z * sz;
  for (let i = 0; i < 14; i++) {
    g.fillStyle = i % 2 ? grass[0] : grass[1];
    g.fillRect((i * c.width) / 14, 0, c.width / 14 + 1, c.height);
  }
  g.strokeStyle = 'rgba(255,255,255,0.92)';
  g.lineWidth = 0.12 * sx;
  const r = F.cornerRadius;
  g.beginPath();
  g.moveTo(X(-F.halfLength + r), Z(-F.halfWidth));
  g.lineTo(X(F.halfLength - r), Z(-F.halfWidth));
  g.arcTo(X(F.halfLength), Z(-F.halfWidth), X(F.halfLength), Z(-F.halfWidth + r), r * sx);
  g.lineTo(X(F.halfLength), Z(F.halfWidth - r));
  g.arcTo(X(F.halfLength), Z(F.halfWidth), X(F.halfLength - r), Z(F.halfWidth), r * sx);
  g.lineTo(X(-F.halfLength + r), Z(F.halfWidth));
  g.arcTo(X(-F.halfLength), Z(F.halfWidth), X(-F.halfLength), Z(F.halfWidth - r), r * sx);
  g.lineTo(X(-F.halfLength), Z(-F.halfWidth + r));
  g.arcTo(X(-F.halfLength), Z(-F.halfWidth), X(-F.halfLength + r), Z(-F.halfWidth), r * sx);
  g.stroke();
  g.beginPath(); g.moveTo(X(0), Z(-F.halfWidth)); g.lineTo(X(0), Z(F.halfWidth)); g.stroke();
  g.beginPath(); g.ellipse(X(0), Z(0), F.centerCircle * sx, F.centerCircle * sz, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.92)';
  g.beginPath(); g.ellipse(X(0), Z(0), 0.2 * sx, 0.2 * sz, 0, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) {
    g.strokeRect(Math.min(X(s * F.penaltyX), X(s * F.halfLength)), Z(-F.penaltyHalfWidth),
      Math.abs(X(s * F.halfLength) - X(s * F.penaltyX)), Z(F.penaltyHalfWidth) - Z(-F.penaltyHalfWidth));
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function ballTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#f7f7f2'; g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#1b1b1b';
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
    const x = i * 44 + (j % 2) * 22 + 10, y = 22 + j * 42;
    g.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
      g.lineTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11);
    }
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildField(scene, { stadium = false, grass } = {}) {
  const root = new THREE.Group();
  scene.add(root);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2 * (F.halfLength + 1.5), 2 * (F.halfWidth + 1.5)),
    new THREE.MeshStandardMaterial({ map: pitchTexture(grass), roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  if (stadium) { buildGoals(root); return root; }

  const outer = new THREE.Mesh(new THREE.PlaneGeometry(140, 100),
    new THREE.MeshStandardMaterial({ color: 0x2b3a4e, roughness: 1 }));
  outer.rotation.x = -Math.PI / 2; outer.position.y = -0.02;
  root.add(outer);

  // Electric barrier around the pitch (rounded corners), open behind each goal mouth.
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x66d9ff, emissive: 0x1a6aa0, transparent: true, opacity: 0.32, side: THREE.DoubleSide });
  const postMat = new THREE.MeshStandardMaterial({ color: 0xdfe8f0, metalness: 0.5, roughness: 0.35 });
  const fenceH = 1.6;
  const pts = [];
  const r = F.cornerRadius, hl = F.halfLength, hw = F.halfWidth;
  const corner = (cx, cz, a0) => { for (let i = 0; i <= 8; i++) { const a = a0 + (i / 8) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  corner(hl - r, hw - r, 0); corner(-hl + r, hw - r, Math.PI / 2); corner(-hl + r, -hw + r, Math.PI); corner(hl - r, -hw + r, Math.PI * 1.5);
  pts.push(pts[0]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
    const segs = [[x0, z0, x1, z1]];
    for (const [ax, az, bx, bz] of segs) {
      // skip the goal mouths
      if (Math.abs(ax) > hl - 0.01 && Math.abs(bx) > hl - 0.01 && Math.abs(az) < F.goalHalfWidth + 0.01 && Math.abs(bz) < F.goalHalfWidth + 0.01) continue;
      let sa = [ax, az], sb = [bx, bz];
      if (Math.abs(ax) > hl - 0.01 && Math.abs(bx) > hl - 0.01) {
        // straight goal-line wall: split around the mouth
        const s = Math.sign(ax), zs = [az, bz].sort((p, q) => p - q);
        for (const [za, zb] of [[zs[0], -F.goalHalfWidth], [F.goalHalfWidth, zs[1]]]) if (zb - za > 0.01) addFence(s * hl, za, s * hl, zb);
        continue;
      }
      addFence(sa[0], sa[1], sb[0], sb[1]);
    }
  }
  function addFence(ax, az, bx, bz) {
    const len = Math.hypot(bx - ax, bz - az);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, fenceH), fenceMat);
    m.position.set((ax + bx) / 2, fenceH / 2, (az + bz) / 2);
    m.rotation.y = -Math.atan2(bz - az, bx - ax);
    root.add(m);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, fenceH + 0.1, 8), postMat);
    p.position.set(ax, (fenceH + 0.1) / 2, az);
    root.add(p);
  }

  buildGoals(root);

  // Stands as simple blocks so the stadium has a frame
  const standMat = new THREE.MeshStandardMaterial({ color: 0x3a4a63, roughness: 1 });
  for (const s of [-1, 1]) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(50, 4, 6), standMat);
    st.position.set(0, 2, s * (hw + 7)); root.add(st);
    const st2 = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 34), standMat);
    st2.position.set(s * (hl + 7), 2, 0); root.add(st2);
  }
  return root;
}

function buildGoals(root) {
  const hl = F.halfLength;
  const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.3 });
  const netMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  for (const s of [-1, 1]) {
    const gx = s * (hl - 0.065);
    for (const z of [-F.goalHalfWidth, F.goalHalfWidth]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(F.postRadius, F.postRadius, F.goalHeight, 12), goalMat);
      post.position.set(gx, F.goalHeight / 2, z); post.castShadow = true; root.add(post);
    }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(F.postRadius, F.postRadius, 2 * F.goalHalfWidth, 12), goalMat);
    bar.rotation.x = Math.PI / 2; bar.position.set(gx, F.goalHeight, 0); bar.castShadow = true; root.add(bar);
    const pos = [], d = F.goalDepth, h = F.goalHeight, w = F.goalHalfWidth, step = 0.3;
    const bx = s * (hl + d);
    for (let z = -w; z <= w + 1e-6; z += step) { pos.push(gx, h, z, bx, h * 0.75, z, bx, h * 0.75, z, bx, 0, z); }
    for (let y = 0; y <= h * 0.75 + 1e-6; y += step) pos.push(bx, y, -w, bx, y, w);
    for (const zz of [-w, w]) {
      for (let x = 0; x <= d + 1e-6; x += step) { const xx = gx + s * x; pos.push(xx, 0, zz, xx, h - (x / d) * h * 0.25, zz); }
      for (let y = 0; y <= h; y += step) pos.push(gx, y, zz, bx, Math.min(y, h * 0.75), zz);
    }
    for (let x = 0; x <= d + 1e-6; x += step) { const xx = gx + s * x; pos.push(xx, h - (x / d) * h * 0.25, -w, xx, h - (x / d) * h * 0.25, w); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    root.add(new THREE.LineSegments(geo, netMat));
  }
}

export function buildBallMesh() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(BALL.radius, 28, 20),
    new THREE.MeshStandardMaterial({ map: ballTexture(), roughness: 0.45 }));
  m.castShadow = true;
  return m;
}
