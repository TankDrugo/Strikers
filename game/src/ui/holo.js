// Holographic cards (1 November, after studying selop/pokebox): every special card has stacked light layers that move
// with the pointer, like a real foil card turned under a lamp. The layers (our own CSS and textures, same idea as the
// pokebox shaders): a rainbow band that slides with the pointer, bright diagonal bars, a glare under the pointer,
// and per kind a sparkle, star, mosaic or etched texture drawn here on canvases. Where it shines follows the card:
// the gold rare only in the picture window, holo cards everywhere. The card tilts with a spring, a focused card (pad)
// sweeps by itself, and a card that comes out of a pack is "activated" by a golden sweep.
//
// Variables on .card: --mx, --my pointer 0..100 (50 = centre), --o interaction 0..1 (set by bindHolo),
// --orest light at rest per kind, --ofocus 1 when focused or on show (CSS).

const RB = 'hsl(2,100%,73%) 0%,hsl(53,100%,69%) 4%,hsl(93,100%,69%) 8%,hsl(176,100%,76%) 12%,hsl(228,100%,74%) 16%,hsl(283,100%,73%) 20%,hsl(2,100%,73%) 24%';

const CSS = `
@property --mx{syntax:'<number>';inherits:true;initial-value:50}
@property --my{syntax:'<number>';inherits:true;initial-value:50}
@property --ofocus{syntax:'<number>';inherits:true;initial-value:0}
.ui .card{--o:0;--orest:0;--ofocus:0;--rb:${RB};
  --bx:calc(37% + var(--mx) * .26%);--by:calc(37% + var(--my) * .26%);
  --hl:max(var(--o),var(--orest),var(--ofocus));
  --pd:min(1,calc(hypot(var(--mx) - 50,var(--my) - 50) / 50))}
.ui .card .foil,.ui .card .glare{position:absolute;inset:0;pointer-events:none;border-radius:inherit}
.ui .card .foil{z-index:2;opacity:var(--hl);mix-blend-mode:color-dodge}
.ui .card .foil::before,.ui .card .foil::after,.ui .card .glare::after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit}
/* glare under the pointer: every card, only while it is handled or shown */
.ui .card .glare{z-index:4;opacity:calc(max(var(--o),var(--ofocus) * .7) * .85);mix-blend-mode:overlay;
  background:radial-gradient(farthest-corner circle at calc(var(--mx) * 1%) calc(var(--my) * 1%),#fffc 8%,#fff8 22%,#0007 95%)}
.ui .card .glare::after{mix-blend-mode:soft-light;opacity:.55;
  background:radial-gradient(circle at calc(var(--mx) * 1%) calc(var(--my) * 1%),#e8ffff 0%,#3337 30%,#cfe4f580 70%)}

/* gold rare: classic holo in the picture window, rainbow and two crossing families of bars */
.ui .card.r-goldRare{--orest:.38}
.ui .card.r-goldRare .foil{clip-path:inset(4% 4% 21% 4% round 3cqw);filter:brightness(.6) contrast(2) saturate(.9);
  background:repeating-linear-gradient(118deg,var(--rb)) var(--bx) var(--by)/220% 700%}
.ui .card.r-goldRare .foil::before{mix-blend-mode:multiply;opacity:.75;
  background:repeating-linear-gradient(calc(135deg + (var(--mx) - 50) * .5deg),#0b1022 0 3%,#9cb0bc 4.2%,#eaf8ff 4.8%,#9cb0bc 5.4%,#0b1022 7%,#0b1022 10%) calc(var(--mx) * -1.5%) calc(var(--my) * -1.5%)/300% 300%}
.ui .card.r-goldRare .foil::after{mix-blend-mode:overlay;background:radial-gradient(circle at calc(var(--mx) * 1%) calc(var(--my) * 1%),#fff 0,#fff0 40%)}

/* the holo kinds without their own background are printed on silver foil, like real holo cards */
.ui .card.h-rainbow,.ui .card.h-glitter,.ui .card.h-prism{background:linear-gradient(160deg,#e9edf5,#aab4c7 34%,#737e95 68%,#485166)}
/* rainbow: the whole card, rainbow over a glitter grain */
.ui .card.h-rainbow{--orest:.45}
.ui .card.h-rainbow .foil{filter:brightness(.62) contrast(1.6) saturate(1.9);
  background:var(--glitter) calc(var(--mx) * .3cqw) calc(var(--my) * .3cqw)/42cqw 42cqw,repeating-linear-gradient(112deg,var(--rb)) var(--bx) var(--by)/260% 640%;background-blend-mode:hard-light}
.ui .card.h-rainbow .foil::before{mix-blend-mode:soft-light;opacity:.9;
  background:repeating-linear-gradient(calc(128deg + (var(--mx) - 50) * .4deg),#000 0 4%,#fff 6%,#000 8%,#000 12%) calc(var(--mx) * -1%) calc(var(--my) * -1%)/260% 260%}

/* glitter: sparkles that catch the light, wide bright bands crossing the card */
.ui .card.h-glitter{--orest:.45}
.ui .card.h-glitter .foil{filter:brightness(.55) contrast(1.7) saturate(1.9);
  background:var(--sparkle) calc(var(--mx) * .5cqw) calc(var(--my) * .5cqw)/56cqw 56cqw,var(--glitter) calc(var(--mx) * -.25cqw) calc(var(--my) * -.25cqw)/30cqw 30cqw,repeating-linear-gradient(150deg,var(--rb)) var(--bx) var(--by)/300% 500%;background-blend-mode:screen,multiply}
.ui .card.h-glitter .foil::after{mix-blend-mode:overlay;opacity:.95;
  background:repeating-linear-gradient(115deg,#fff0 0 18%,#fffc 24%,#fff0 30%,#fff0 46%) calc(var(--mx) * -2% + 50%) 0/240% 100%}

/* lava: embers and heat bars over the dark card */
.ui .card.h-lava{--orest:.6}
.ui .card.h-lava .foil{mix-blend-mode:screen;
  background:radial-gradient(circle at calc(var(--mx) * 1%) 82%,#ffb31f,#ffb31f00 36%),radial-gradient(circle at 18% calc(var(--my) * 1%),#ff4a12,#ff4a1200 42%),radial-gradient(circle at 82% 18%,#ff7b1c,#ff7b1c00 32%),repeating-linear-gradient(35deg,#0000 0 7%,#0008 7.5% 8%);
  animation:holo-lava 4s ease-in-out infinite alternate}
.ui .card.h-lava .foil::before{mix-blend-mode:color-dodge;opacity:.8;
  background:var(--sparkle) calc(var(--mx) * .4cqw) calc(var(--my) * -.4cqw)/48cqw 48cqw,repeating-linear-gradient(calc(120deg + (var(--mx) - 50) * .4deg),#ffd06a00 0 6%,#ffd06a 8%,#ffd06a00 10%,#ffd06a00 16%) calc(var(--mx) * -1%) 0/300% 300%}
@keyframes holo-lava{to{filter:hue-rotate(-18deg) brightness(1.2)}}

/* prism: a mosaic of cells, each with its own colour that turns as the light moves */
.ui .card.h-prism{--orest:.5}
.ui .card.h-prism .foil{filter:brightness(.5) contrast(1.7) saturate(1.6);
  background:var(--voronoi) 0 0/38cqw 38cqw,repeating-linear-gradient(calc(100deg + (var(--mx) - 50) * .6deg),var(--rb)) var(--bx) var(--by)/240% 560%;background-blend-mode:difference}
.ui .card.h-prism .foil::before{mix-blend-mode:overlay;opacity:.7;
  background:repeating-linear-gradient(140deg,#fff0 0 10%,#fffb 13%,#fff0 16%,#fff0 26%) calc(var(--mx) * -1.6%) calc(var(--my) * -1%)/260% 260%}

/* galaxy: two star layers at different depths and a moving nebula */
.ui .card.h-galaxy{--orest:.6}
.ui .card.h-galaxy .foil{mix-blend-mode:screen;
  background:var(--stars) calc(var(--mx) * .6cqw) calc(var(--my) * .6cqw)/60cqw 60cqw,var(--stars) calc(var(--mx) * -.3cqw) calc(var(--my) * -.3cqw)/34cqw 34cqw,radial-gradient(ellipse at calc(var(--mx) * 1%) calc(var(--my) * 1%),#ff4fd8aa,#ff4fd800 45%),conic-gradient(from calc(var(--mx) * 2deg) at 50% 50%,#6a2fd800,#ff4fd844,#6a2fd800 30%,#1fb6ff44 60%,#6a2fd800)}
.ui .card.h-galaxy .foil::before{mix-blend-mode:color-dodge;opacity:.55;filter:contrast(1.4);
  background:repeating-linear-gradient(125deg,var(--rb)) var(--bx) var(--by)/300% 600%}

/* numbered: etched foil, the rainbow only in the engraving */
.ui .card.r-numbered{--orest:.5}
.ui .card.r-numbered .foil{mix-blend-mode:screen;opacity:calc(var(--hl) * .8);filter:brightness(.75) contrast(1.8) saturate(1.5);
  background:var(--etch) calc(var(--mx) * .2cqw) 0/50cqw 50cqw,repeating-linear-gradient(105deg,var(--rb)) var(--bx) var(--by)/250% 600%;background-blend-mode:multiply}
.ui .card.r-numbered .foil::before{mix-blend-mode:screen;opacity:.75;background:var(--glitter) calc(var(--mx) * -.3cqw) calc(var(--my) * -.3cqw)/26cqw 26cqw}

/* 1/1: polished gold, light bands and sparkles */
.ui .card.r-oneOfOne{--orest:.65}
.ui .card.r-oneOfOne .foil{mix-blend-mode:overlay;
  background:repeating-linear-gradient(115deg,#fff0 0 14%,#fff 20%,#fff0 26%,#fff0 40%) calc(var(--mx) * -2% + 60%) 0/260% 100%}
.ui .card.r-oneOfOne .foil::before{mix-blend-mode:color-dodge;opacity:.9;
  background:var(--sparkle) calc(var(--mx) * .5cqw) calc(var(--my) * .5cqw)/44cqw 44cqw,linear-gradient(calc(var(--mx) * 1.8deg),#ffe27a55,#fff3b0aa,#d79a1255)}

/* the character drawn again over the foil, half transparent: the background shines, the face stays clean
   (what the holo masks do on real cards) */
.ui .card .art.top{z-index:2;pointer-events:none;opacity:var(--keep,.6)}
.ui .card.h-rainbow,.ui .card.h-glitter,.ui .card.h-prism{--keep:.72}
.ui .card.h-lava,.ui .card.h-galaxy,.ui .card.r-goldRare{--keep:.55}
.ui .card.r-numbered,.ui .card.r-oneOfOne{--keep:.45}
/* on show (pack reveal), focused with the pad: the light sweeps by itself */
.ui .card.idle,.ui .cpick.focus .card,.ui .slotc.focus .card{--ofocus:1;animation:holo-sweep 3.6s ease-in-out infinite alternate}
@keyframes holo-sweep{0%{--mx:18;--my:22}50%{--mx:70;--my:40}100%{--mx:84;--my:78}}
/* activation: a golden sweep over a card that has just come out of the pack */
.ui .card.activate::after{content:"";position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;mix-blend-mode:screen;
  background:linear-gradient(105deg,#fff0 38%,#ffe27a00 41%,#ffe27aee 47%,#fff 50%,#ffe27aee 53%,#ffe27a00 59%,#fff0 62%) 0 0/320% 100%,repeating-linear-gradient(105deg,var(--rb)) 0 0/200% 200%;
  background-blend-mode:screen;animation:holo-activate 1.5s cubic-bezier(.45,0,.3,1) both}
@keyframes holo-activate{0%{background-position:100% 0,0 0;opacity:0}12%{opacity:1}80%{opacity:1}100%{background-position:0 0,100% 0;opacity:0}}
`;

function canvas(n) { const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d')]; }
const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

// textures drawn once; tileable where it matters (wrapped drawing)
function textures() {
  const out = {};
  // fine glitter grain
  let [c, g] = canvas(128);
  for (let i = 0; i < 420; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.9})`; const s = rnd() < 0.1 ? 2 : 1; g.fillRect(rnd() * 128, rnd() * 128, s, s); }
  out.glitter = c.toDataURL();
  // sparkles: four-pointed stars of several sizes on black
  [c, g] = canvas(256);
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 256, y = rnd() * 256, r = 1.5 + rnd() ** 3 * 9, a = 0.35 + rnd() * 0.65;
    for (const [ox, oy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r * 1.6);
      gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x + ox, y + oy, r * 1.6, 0, 7); g.fill();
      g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = Math.max(0.6, r / 6);
      g.beginPath(); g.moveTo(x + ox - r * 2.4, y + oy); g.lineTo(x + ox + r * 2.4, y + oy); g.moveTo(x + ox, y + oy - r * 2.4); g.lineTo(x + ox, y + oy + r * 2.4); g.stroke();
    }
  }
  out.sparkle = c.toDataURL();
  // star field
  [c, g] = canvas(256);
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) { const x = rnd() * 256, y = rnd() * 256, r = rnd() < 0.06 ? 1.6 : rnd() * 0.9 + 0.3; g.fillStyle = `hsla(${200 + rnd() * 120},80%,${70 + rnd() * 30}%,${0.4 + rnd() * 0.6})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  out.stars = c.toDataURL();
  // voronoi cells, each a grey level (the mosaic of the prism)
  [c, g] = canvas(192);
  const pts = Array.from({ length: 34 }, () => [rnd() * 192, rnd() * 192, Math.floor(rnd() * 255)]);
  const img = g.createImageData(192, 192);
  for (let y = 0; y < 192; y++) for (let x = 0; x < 192; x++) {
    let best = 1e9, v = 0;
    for (const [px, py, gv] of pts) for (const ox of [-192, 0, 192]) for (const oy of [-192, 0, 192]) { const d = (x - px - ox) ** 2 + (y - py - oy) ** 2; if (d < best) { best = d; v = gv; } }
    const i = (y * 192 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  out.voronoi = c.toDataURL();
  // etched foil: fine wavy engraving lines, white on black
  [c, g] = canvas(256);
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#fff'; g.lineWidth = 1.2;
  for (let k = -256; k < 512; k += 7) {
    g.beginPath();
    for (let x = 0; x <= 256; x += 4) { const y = k + x * 0.5 + Math.sin(x / 256 * Math.PI * 4) * 6; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  out.etch = c.toDataURL();
  return out;
}

export function installHolo() {
  if (document.getElementById('ui-holo')) return;
  const st = document.createElement('style'); st.id = 'ui-holo'; st.textContent = CSS; document.head.appendChild(st);
  const tx = textures();
  for (const [k, v] of Object.entries(tx)) document.documentElement.style.setProperty('--' + k, `url(${v})`);
  // every card that appears anywhere in the menus gets the pointer light
  const bindNew = () => bindHolo(document.body);
  new MutationObserver(() => { if (!bindNew.t) bindNew.t = requestAnimationFrame(() => { bindNew.t = 0; bindNew(); }); }).observe(document.body, { childList: true, subtree: true });
  bindNew();
}

// The light follows the pointer on every card under root (and its case), with a spring; it goes back to rest
// when the pointer leaves.
export const SHINY = ['r-goldRare', 'h-rainbow', 'h-glitter', 'h-prism', 'h-lava', 'h-galaxy', 'r-numbered', 'r-oneOfOne'];
export function bindHolo(root) {
  for (const card of root.querySelectorAll('.card')) {
    if (card._holo) continue;
    // a second copy of the picture above the foil (once per card)
    const art = card.querySelector('.art'), foil = card.querySelector('.foil');
    if (art && foil && !card.querySelector('.art.top') && SHINY.some((k) => card.classList.contains(k))) {
      const top = art.cloneNode(true); top.classList.add('top'); foil.after(top);
    }
    const box = card.closest('.loader') || card;
    const s = card._holo = { x: 50, y: 50, o: 0, tx: 50, ty: 50, to: 0, raf: 0 };
    const tick = () => {
      s.x += (s.tx - s.x) * 0.16; s.y += (s.ty - s.y) * 0.16; s.o += (s.to - s.o) * 0.12;
      card.style.setProperty('--mx', s.x.toFixed(2)); card.style.setProperty('--my', s.y.toFixed(2)); card.style.setProperty('--o', s.o.toFixed(3));
      s.raf = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) + Math.abs(s.to - s.o) * 50 > 0.05 && card.isConnected ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
    box.addEventListener('pointermove', (e) => {
      const r = box.getBoundingClientRect();
      if (card.classList.contains('idle')) { card.classList.remove('idle'); const cs = getComputedStyle(card); s.x = +cs.getPropertyValue('--mx') || 50; s.y = +cs.getPropertyValue('--my') || 50; }
      s.tx = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); s.ty = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100)); s.to = 1;
      kick();
    });
    box.addEventListener('pointerleave', () => { s.tx = 50; s.ty = 50; s.to = 0; kick(); });
  }
}

// golden sweep when a card comes out of a pack
export function activateCard(el) {
  const card = el.classList?.contains('card') ? el : el.querySelector('.card');
  if (!card) return;
  card.classList.remove('activate'); void card.offsetWidth; card.classList.add('activate');
  setTimeout(() => card.classList.remove('activate'), 1600);
}
