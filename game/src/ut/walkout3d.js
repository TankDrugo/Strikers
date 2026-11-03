// P1 pack walkout, the 3D part (interfaccia-gioco/DESIGN.md): after the clues the character walks out on our own
// stage and does one of the original goal celebrations at random (clips from the .nis cut scenes, animation/nis.py).
// The camera is ours, as decided: only the character animation comes from the cut scenes.
import * as THREE from 'three';
import { Player } from '../player.js';

const WALK_FROM = -6.8; // the character starts at the back of the stage and runs towards the camera
const WALK_TO = -0.4;
// walkout of an 85+ card (decided with the user on 3 November): a giant card stands at the back of the stage and the
// character steps out of it, in front of it, while the card unlocks piece by piece (role, team, rating, then picture
// and name: unlock() from the clues of utMenu.js)
const CARD_Z = -4.4, CARD_H = 3.3, CARD_W = CARD_H * 5 / 7.6;
const CW = 512, CH = Math.round(CW * 7.6 / 5);

export class WalkoutStage {
  constructor(renderer, template, data) {
    this.renderer = renderer;
    this.template = template;
    this.data = data; // game/assets/walkout.json
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x140a33);
    this.scene.fog = new THREE.Fog(0x140a33, 9, 22);
    this.scene.add(new THREE.HemisphereLight(0xb9a8ff, 0x1b1036, 1.4));
    const key = new THREE.SpotLight(0xffffff, 60, 30, 0.5, 0.6);
    key.position.set(2.5, 7, 5); key.target.position.set(0, 0.8, 0); key.castShadow = true;
    this.scene.add(key, key.target);
    this.rim = new THREE.PointLight(0xc03cff, 25, 12); this.rim.position.set(-2.5, 2.5, -2.5); this.scene.add(this.rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshStandardMaterial({ color: 0x2a1260, roughness: 0.4, metalness: 0.3 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; this.scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.3, 64), new THREE.MeshBasicMaterial({ color: 0xffd21f }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; this.scene.add(ring);
    // back wall of light columns, like a tunnel mouth
    for (let i = -3; i <= 3; i++) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.5, 0.35), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x6a2fd8 : 0x31d6c2 }));
      col.position.set(i * 1.6, 2.25, -7); this.scene.add(col);
    }
    this.camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 60);
    this.active = false;
    this.player = null;
    // the giant card (a canvas texture redrawn at every unlock) and its glow
    this.cardCanvas = document.createElement('canvas'); this.cardCanvas.width = CW; this.cardCanvas.height = CH;
    this.cardTex = new THREE.CanvasTexture(this.cardCanvas); this.cardTex.colorSpace = THREE.SRGBColorSpace;
    this.card = new THREE.Group();
    this.cardGlow = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W * 1.25, CARD_H * 1.18), new THREE.MeshBasicMaterial({ color: 0xffd21f, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, map: glowTexture() }));
    this.cardGlow.position.z = -0.05;
    this.cardFace = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), new THREE.MeshBasicMaterial({ map: this.cardTex, transparent: true, alphaTest: 0.02 }));
    this.card.add(this.cardGlow, this.cardFace);
    this.card.position.set(0, CARD_H / 2 + 0.25, CARD_Z);
    this.card.visible = false;
    this.scene.add(this.card);
  }

  // what the card shows at each unlock level: 0 the back, 1 role, 2 team, 3 rating, 4 picture and name (everything)
  drawCard(level) {
    const g = this.cardCanvas.getContext('2d'), c = this.cardInfo, W = CW, H = CH, r = 46;
    g.clearRect(0, 0, W, H);
    const shape = () => { g.beginPath(); g.moveTo(r, 0); g.arcTo(W, 0, W, H, r); g.arcTo(W, H, 0, H, r); g.arcTo(0, H, 0, 0, r); g.arcTo(0, 0, W, 0, r); g.closePath(); };
    shape();
    const bg = g.createLinearGradient(0, 0, W, H);
    if (level === 0) { bg.addColorStop(0, '#2a1260'); bg.addColorStop(1, '#0d0624'); }
    else { bg.addColorStop(0, c.beam); bg.addColorStop(0.55, '#3a1a7a'); bg.addColorStop(1, '#140a33'); }
    g.fillStyle = bg; g.fill();
    g.save(); shape(); g.clip();
    // rays from the middle
    g.globalAlpha = level ? 0.18 : 0.1; g.fillStyle = c.beam;
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; g.beginPath(); g.moveTo(W / 2, H * 0.42); g.lineTo(W / 2 + Math.cos(a) * W * 2, H * 0.42 + Math.sin(a) * W * 2); g.lineTo(W / 2 + Math.cos(a + 0.12) * W * 2, H * 0.42 + Math.sin(a + 0.12) * W * 2); g.fill(); }
    g.globalAlpha = 1;
    if (level >= 4 && c.img && c.img.complete && c.img.naturalWidth) {
      const ih = H * 0.62, iw = ih * c.img.naturalWidth / c.img.naturalHeight;
      g.drawImage(c.img, (W - iw) / 2 + W * 0.08, H * 0.08, iw, ih);
    } else {
      // the silhouette waits behind a question mark
      g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(W / 2 + 30, H * 0.3, W * 0.16, W * 0.19, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(W / 2 + 30, H * 0.66, W * 0.33, H * 0.2, 0, Math.PI, 0); g.fill();
      g.fillStyle = 'rgba(255,255,255,.85)'; g.font = `900 ${W * 0.36}px "Arial Black",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('?', W / 2 + 30, H * 0.4);
    }
    g.restore();
    const txt = (s, x, y, size, col = '#fff', align = 'center') => {
      g.font = `900 ${size}px "Arial Black",sans-serif`; g.textAlign = align; g.textBaseline = 'middle';
      g.lineJoin = 'round'; g.lineWidth = size * 0.16; g.strokeStyle = '#1b1036'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y);
    };
    const slot = (x, y, w, h) => { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, y, w, h); };
    // rating and role, top left
    if (level >= 3) txt(String(c.ovr), 96, 92, 104, '#fff'); else slot(40, 44, 112, 92);
    if (level >= 1) txt(c.role, 96, 172, 44, c.beam); else slot(50, 152, 92, 40);
    // name band and team at the bottom
    g.fillStyle = 'rgba(27,16,54,.82)'; g.fillRect(0, H * 0.72, W, H * 0.13);
    if (level >= 4) txt(c.name, W / 2, H * 0.785, Math.min(64, W * 1.6 / Math.max(6, c.name.length)), '#fff'); else txt('? ? ?', W / 2, H * 0.785, 56, '#8a80a0');
    if (level >= 2) txt(c.team, W / 2, H * 0.9, 40, c.beam); else slot(W * 0.28, H * 0.875, W * 0.44, 44);
    if (level >= 4 && c.serial) txt(c.serial, W - 90, 92, 46, '#ffd21f');
    // frame
    shape(); g.lineWidth = 16; g.strokeStyle = level ? c.beam : '#6a2fd8'; g.stroke();
    shape(); g.lineWidth = 5; g.strokeStyle = '#1b1036'; g.stroke();
    this.cardTex.needsUpdate = true;
  }

  // next piece of the card: a flash and a little jump of the card
  unlock(level) {
    if (!this.cardInfo) return;
    this.cardLevel = Math.max(this.cardLevel || 0, level);
    this.drawCard(this.cardLevel);
    this.cardPulse = 1;
  }

  // card: catalogue entry. Resolves when the celebration is over (or skip() is called).
  // opts.card: { role, team, name, ovr, serial, portrait } shows the giant card the character steps out of;
  // opts.hold: seconds the character waits inside the card before stepping out
  start(card, beam = '#ffd21f', opts = {}) {
    this.stop();
    this.cardInfo = opts.card ? { ...opts.card, beam } : null;
    this.card.visible = !!this.cardInfo;
    this.cardLevel = 0; this.cardPulse = 0;
    this.hold = this.cardInfo ? opts.hold ?? 0 : 0;
    if (this.cardInfo) {
      this.cardGlow.material.color.set(beam);
      if (opts.card.portrait) { const img = new Image(); img.onload = () => { if (this.cardLevel >= 4) this.drawCard(this.cardLevel); }; img.src = opts.card.portrait; this.cardInfo.img = img; }
      this.drawCard(0);
    }
    const tpl = this.template.byId[card.char];
    this.player = new Player({ scene: this.scene, teams: [{ color: '#ffffff' }] }, tpl, 0, card.gk ? 'goalie' : 'fielder', 0, card.stats);
    this.player.ring.visible = false;
    this.player.model.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.rim.color.set(beam);
    this.nisScale = (tpl.nisScale || {});
    this.k = (n) => (this.nisScale[n] || 2.2) * this.player.scale; // game metres per original metre
    const walk = this.data.clips[this.data.walk];
    this.walkClip = this.player.clips[this.data.walk] ? this.data.walk : 'jog';
    this.walkYaw = walk?.yaw || 0;
    const end = walk ? walk.path[walk.path.length - 1] : [1, 0];
    this.walkSpeed = walk ? Math.hypot(end[0], end[1]) / (walk.keys / 30) * this.k(this.data.walk) : 1.4;
    const celebs = (this.data.celebrations || []).filter((c) => this.player.clips[c]);
    this.celeb = celebs.length ? celebs[Math.floor(Math.random() * celebs.length)] : 'wave';
    this.phase = 'walk';
    this.t = 0;
    this.player.play(this.cardInfo ? 'idle' : this.walkClip, { loop: true, fade: 0 });
    this.from = this.cardInfo ? CARD_Z - 0.35 : WALK_FROM; // with the card: from just behind it, through it
    this.player.root.position.set(0, 0, this.from);
    this.player.root.rotation.y = -this.walkYaw;
    this.active = true;
    this.resize();
    return new Promise((res) => { this.done = res; });
  }

  skip() { if (this.active && this.done) { const d = this.done; this.done = null; d(); } }

  resize() { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); }

  update(dt) {
    if (!this.active || !this.player) return;
    const p = this.player;
    this.t += dt;
    p.mixer.update(dt);
    const h = p.cfg.height;
    if (this.card.visible) {
      // the card floats and breathes; at every unlock it jumps and its glow flares
      this.cardPulse = Math.max(0, (this.cardPulse || 0) - dt * 2.5);
      const s = 1 + 0.06 * this.cardPulse;
      this.card.scale.setScalar(s);
      this.card.position.y = CARD_H / 2 + 0.25 + Math.sin(performance.now() / 700) * 0.05;
      this.card.rotation.y = Math.sin(performance.now() / 1300) * 0.06;
      this.cardGlow.material.opacity = 0.35 + 0.15 * Math.sin(performance.now() / 300) + 0.5 * this.cardPulse;
    }
    if (this.phase === 'walk') {
      if (this.t < this.hold) {
        // inside the card: the camera on the card
        this.camera.position.set(Math.sin(0.25) * 6.2, 1.9, Math.cos(0.25) * 6.2 - 0.6);
        this.camera.lookAt(0, CARD_H / 2 + 0.1, CARD_Z);
        return;
      }
      if (this.player.currentName !== this.walkClip) this.player.play(this.walkClip, { loop: true, fade: 0.1 });
      const z = Math.min(WALK_TO, this.from + this.walkSpeed * (this.t - this.hold));
      p.root.position.set(0, 0, z);
      if (z >= WALK_TO) {
        this.phase = 'celebrate'; this.t = 0; this.camAng = undefined;
        p.play(this.celeb, { fade: 0.25 });
        const c = this.data.clips[this.celeb];
        this.celebYaw = c?.yaw || 0;
        p.root.rotation.y = -this.celebYaw;
        this.celebFrom = p.root.position.clone();
        // the original runs a few metres; on our small stage the path is shortened to at most 1.2 m
        const e = c ? c.path[c.path.length - 1] : [0, 0], len = Math.hypot(e[0], e[1]) * this.k(this.celeb);
        this.celebK = this.k(this.celeb) * Math.min(1, 1.2 / Math.max(1e-3, len));
      }
      // the camera waits in front and slowly pulls back as the character arrives (with the card: framing the card too)
      if (this.card.visible) {
        const u = Math.min(1, (z - this.from) / (WALK_TO - this.from));
        this.camera.position.set(Math.sin(0.25 + 0.1 * u) * (6.2 - 2.2 * u), 1.9 - (1.9 - h * 0.85) * u, Math.cos(0.25 + 0.1 * u) * (6.2 - 2.2 * u) - 0.6 * (1 - u));
        this.camera.lookAt(0, CARD_H / 2 + 0.1 - (CARD_H / 2 + 0.1 - h * 0.7) * u, CARD_Z + (z * 0.7 - CARD_Z) * u);
      } else {
        this.camera.position.set(Math.sin(0.35) * h * 2.6, h * 0.75, Math.cos(0.35) * h * 2.6 + Math.min(0, z + 1.5) * 0.25);
        this.camera.lookAt(0, h * 0.6, z * 0.7);
      }
    } else {
      const c = this.data.clips[this.celeb], dur = c ? c.keys / 30 : 2.5;
      if (c) {
        // the celebration moves on the ground like the original, turned to face the camera
        const f = Math.min(c.path.length - 1, (this.t / dur) * (c.path.length - 1)), i = Math.floor(f), u = f - i, j = Math.min(c.path.length - 1, i + 1);
        const px = (c.path[i][0] + (c.path[j][0] - c.path[i][0]) * u) * this.celebK, pz = (c.path[i][1] + (c.path[j][1] - c.path[i][1]) * u) * this.celebK;
        const a = -this.celebYaw, ca = Math.cos(a), sa = Math.sin(a);
        p.root.position.set(this.celebFrom.x + px * ca + pz * sa, 0, this.celebFrom.z - px * sa + pz * ca);
      }
      // the camera stays in front of the character (some celebrations spin round), a little off to one side
      let face = 0;
      if (c && c.yaws) { const k = Math.min(c.yaws.length - 1, Math.floor((this.t / dur) * (c.yaws.length - 1))); face = c.yaws[k] - this.celebYaw; }
      this.camAng = this.camAng === undefined ? face : this.camAng + (face - this.camAng) * Math.min(1, dt * 2.5);
      // with the card behind: wider and a little lower, so the card stays in the picture
      const wide = this.card.visible ? 1.55 : 1;
      const ang = this.camAng * (this.card.visible ? 0.3 : 1) + (this.card.visible ? 0.12 : 0.35) + Math.sin(this.t * 0.6) * 0.15, dist = h * 2.6 * wide;
      const at = p.root.position;
      this.camera.position.set(at.x + Math.sin(ang) * dist, h * (this.card.visible ? 0.8 : 0.7), at.z + Math.cos(ang) * dist);
      this.camera.lookAt(at.x, h * (this.card.visible ? 0.75 : 0.58), at.z - (this.card.visible ? 1 : 0));
      if (this.t > dur + 0.3) this.skip();
    }
  }

  render() { this.renderer.render(this.scene, this.camera); }

  stop() {
    if (this.player) { this.scene.remove(this.player.root); this.player = null; }
    this.card.visible = false; this.cardInfo = null;
    this.active = false;
    this.done = null;
  }
}

// soft round glow behind the giant card
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 10, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
