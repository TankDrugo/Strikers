// P1 pack walkout, the 3D part (interfaccia-gioco/DESIGN.md): after the clues the character walks out on our own
// stage and does one of the original goal celebrations at random (clips from the .nis cut scenes, animation/nis.py).
// The camera is ours, as decided: only the character animation comes from the cut scenes.
import * as THREE from 'three';
import { Player } from '../player.js';

const WALK_FROM = -6.8; // the character starts at the back of the stage and runs towards the camera
const WALK_TO = -0.4;

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
  }

  // card: catalogue entry. Resolves when the celebration is over (or skip() is called).
  start(card, beam = '#ffd21f') {
    this.stop();
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
    this.player.play(this.walkClip, { loop: true, fade: 0 });
    this.player.root.position.set(0, 0, WALK_FROM);
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
    if (this.phase === 'walk') {
      const z = Math.min(WALK_TO, WALK_FROM + this.walkSpeed * this.t);
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
      // the camera waits in front and slowly pulls back as the character arrives
      this.camera.position.set(Math.sin(0.35) * h * 2.6, h * 0.75, Math.cos(0.35) * h * 2.6 + Math.min(0, z + 1.5) * 0.25);
      this.camera.lookAt(0, h * 0.6, z * 0.7);
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
      const ang = this.camAng + 0.35 + Math.sin(this.t * 0.6) * 0.15, dist = h * 2.6;
      const at = p.root.position;
      this.camera.position.set(at.x + Math.sin(ang) * dist, h * 0.7, at.z + Math.cos(ang) * dist);
      this.camera.lookAt(at.x, h * 0.58, at.z);
      if (this.t > dur + 0.3) this.skip();
    }
  }

  render() { this.renderer.render(this.scene, this.camera); }

  stop() {
    if (this.player) { this.scene.remove(this.player.root); this.player = null; }
    this.active = false;
    this.done = null;
  }
}
