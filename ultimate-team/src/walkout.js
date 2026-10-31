// Pack walkout: the best card of a pack (gold and up) runs out of the tunnel and celebrates, filmed
// with the cameras of the original cut scenes (game/assets/walkout.json, from animation/nis.py).
//   1. establishing shot (camera_establish): the player runs out of the tunnel while the hints appear
//   2. celebration (goal_winner low for gold, high for in-form and icon) with its two cameras
// The cut scenes are in the original's axes (glTF axes, X across the pitch, Z along it): the whole
// scene is turned by +90° about Y (the same turn Player.render gives a player facing +X), and the
// character-centred parts are scaled by the character's size (nis_scale × model scale).

const CUT_AT = 0.55; // share of the celebration filmed by Camera01 before cutting to Camera02
const RUN_SECONDS = 3.4;
const TUNNEL_Z = 19.9;
const HEAD_SHARE = 0.82; // head bone height / body height of our models // tunnel mouth in the near stand wall (stadium.js: wall at halfWidth + 7.3)

export class Walkout {
  constructor(ctx, card, { onDone, hint }) {
    const { THREE } = ctx;
    this.ctx = ctx; this.THREE = THREE; this.card = card; this.onDone = onDone; this.hint = hint;
    this.data = ctx.walkoutData;
    this.stage = ctx.makeStage();
    this.scene = this.stage.scene;
    this.camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 300);
    const tpl = ctx.template.byId[card.char];
    this.player = new ctx.Player({ scene: this.scene, teams: [{ color: '#ffffff' }] }, tpl, 0, 'fielder', 0, card.stats);
    this.player.ring.visible = false;
    this.k = (tpl.nisScale?.nis_win_high || 2.5) * this.player.scale; // game metres per original metre
    this.addTunnel();
    this.t = 0;
    this.phase = 'run';
    this.celebrate = card.rarity === 'oro' ? 'nis_win_low' : 'nis_win_high';
    this.player.play('nis_walkout', { loop: true, fade: 0 });
    const run = this.data.clips.nis_walkout;
    const end = run.path[run.path.length - 1];
    this.runSpeed = Math.hypot(end[0], end[1]) / (run.keys / 30) * (tpl.nisScale?.nis_walkout || 2.1) * this.player.scale;
    this.hintsShown = 0;
  }

  addTunnel() {
    const THREE = this.THREE;
    const g = new THREE.Group();
    const dark = new THREE.MeshBasicMaterial({ color: 0x05070c });
    const frame = new THREE.MeshStandardMaterial({ color: 0x3a4766, roughness: 0.6, metalness: 0.3 });
    const hole = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.9, 2.5), dark);
    hole.position.set(0, 1.45, TUNNEL_Z + 0.9);
    g.add(hole);
    for (const x of [-1.75, 1.75]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.2, 0.5), frame); p.position.set(x, 1.6, TUNNEL_Z - 0.2); g.add(p); }
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.4, 0.5), frame); top.position.set(0, 3.2, TUNNEL_Z - 0.2); g.add(top);
    const glow = new THREE.PointLight(0x9fd8ff, 6, 9); glow.position.set(0, 2.4, TUNNEL_Z - 1.2); g.add(glow);
    this.scene.add(g);
  }

  // original glTF axes -> stadium: turn +90° about Y (x, y, z) -> (z, y, -x)
  map(v, s = 1, o = [0, 0, 0]) { return new this.THREE.Vector3(o[0] + v[2] * s, o[1] + v[1] * s, o[2] - v[0] * s); }

  sample(arr, f) {
    const i = Math.min(arr.length - 1, Math.floor(f)), j = Math.min(arr.length - 1, i + 1), u = f - Math.floor(f);
    return Array.isArray(arr[i]) ? arr[i].map((v, n) => v + (arr[j][n] - v) * u) : arr[i] + (arr[j] - arr[i]) * u;
  }

  setFov(hfov) {
    // the original fields of view are horizontal on a 4:3 screen
    const v = 2 * Math.atan(Math.tan((hfov * Math.PI) / 360) / (4 / 3));
    this.camera.fov = (v * 180) / Math.PI;
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  skip() {
    if (this.phase === 'done') return;
    if (this.phase === 'run') this.startCelebration();
    else this.finish();
  }

  startCelebration() {
    this.phase = 'celebrate';
    this.t = 0;
    this.player.play(this.celebrate, { fade: 0.05 });
    this.hint(3);
    this.hintsShown = 4;
  }

  finish() {
    this.phase = 'done';
    this.onDone();
  }

  update(dt) {
    this.t += dt;
    const p = this.player;
    p.mixer.update(dt);
    if (this.phase === 'run') {
      const z = TUNNEL_Z + 0.4 - this.runSpeed * this.t;
      p.root.position.set(0, 0, Math.max(14.2, z));
      p.root.rotation.y = Math.PI / 2;
      if (z < 14.2 && p.currentName !== 'idle') p.play('idle', { loop: true, fade: 0.25 });
      const est = this.data.establish;
      const f = Math.min(1, this.t / RUN_SECONDS) * (est.fov.length - 1);
      this.camera.position.copy(this.map(est.pos[0]));
      // the original shot looks at the tunnel; here it follows the runner a little
      const look = this.map(est.target[0]);
      look.lerp(p.root.position.clone().setY(0.9), 0.6);
      this.camera.lookAt(look);
      this.setFov(this.sample(est.fov, f) * 0.4);
      while (this.hintsShown < 3 && this.t > 0.6 + this.hintsShown * 0.9) this.hint(this.hintsShown++);
      if (this.t > RUN_SECONDS) this.startCelebration();
    } else if (this.phase === 'celebrate') {
      const c = this.data.clips[this.celebrate];
      const dur = c.keys / 30;
      const f = Math.min(1, this.t / dur) * (c.keys - 1);
      const anchor = [0, 0, 9.5]; // centre of the celebration on the near half of the pitch
      const path = this.sample(c.path, f);
      p.root.position.copy(this.map([path[0], 0, path[1]], this.k, anchor));
      p.root.rotation.y = Math.PI / 2;
      const cam = c.cameras[this.t / dur < CUT_AT || c.cameras.length < 2 ? 0 : 1];
      // cameras scale by head height, so the framing matches although the bodies differ (the path
      // scales by leg length, so the feet do not slide)
      const kc = (p.cfg.height * HEAD_SHARE) / (c.head || 0.66);
      const at = p.root.position;
      const rel = (v) => this.map(v, kc).add(at).sub(this.map([path[0], 0, path[1]], kc));
      this.camera.position.copy(rel(this.sample(cam.pos, f)));
      this.camera.position.y = Math.max(0.25, this.camera.position.y);
      this.camera.lookAt(rel(this.sample(cam.target, f)));
      this.setFov(this.sample(cam.fov, f));
      if (this.t > dur + 0.4) this.finish();
    }
    this.stage.update(dt);
  }

  render(renderer) { renderer.render(this.scene, this.camera); }
  dispose() { this.stage.dispose(); }
}
