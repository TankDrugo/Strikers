// Ultimate Team cards as drawn on the drafts page (interfaccia-gioco/bozze): rarity backgrounds, the five holo
// foils chosen by the player (Arcobaleno, Glitter, Lava, Prisma, Galassia), numbered cards in the graded case with
// the navy and gold label (L3b), the 1/1 in the black case with gold edge (L4), the pack theatre of P1.
// Art: a real render of the character (portraits from main.js), the cartoon bust only while it is not ready.
import { t } from './i18n.js';
import { STAT_KEYS } from '../ut/cards.js';

const CSS = `
.ui .card .st{position:absolute;z-index:3;left:4%;right:4%;bottom:3%;display:flex;justify-content:space-between;font-family:var(--fn);font-size:5.6cqw}
.ui .card .st span{display:flex;flex-direction:column;align-items:center;line-height:1}.ui .card .st small{font-size:3.8cqw;opacity:.75}
.ui .card .nm{bottom:13%}
.ui .card .art img{width:100%;height:100%;object-fit:contain;object-position:50% 100%;display:block}
.ui .card.r-bronze{background:linear-gradient(160deg,#f6c08a,#c47a3c 55%,#6e3c14)}
.ui .card.r-silver{background:linear-gradient(160deg,#ffffff,#c8d0dc 50%,#7d889a)}
.ui .card.r-gold{background:linear-gradient(160deg,#fff0a0,#e8a91a 55%,#9a5d05)}
.ui .card.r-goldRare{background:linear-gradient(160deg,#fff6c4,#f0b72a 45%,#b06a00)}
.ui .card.r-goldRare::before{content:"";position:absolute;inset:0;z-index:0;background:repeating-conic-gradient(from 0deg at 50% 45%,#ffffff40 0 8deg,transparent 8deg 16deg)}
.ui .card.r-numbered{background:linear-gradient(160deg,#23306a,#0c1233 70%);color:#fff}
.ui .card.r-numbered .ovr,.ui .card.r-numbered .role{color:var(--sun);-webkit-text-stroke-color:var(--ink)}
.ui .card.r-numbered .st{color:#ffe9a0}
.ui .card.r-oneOfOne{background:linear-gradient(135deg,#fff7c8,#f5c242 25%,#a26a06 50%,#ffe27a 70%,#b27a12)}
.ui .card.r-oneOfOne .foil{background:linear-gradient(115deg,transparent 30%,#ffffffcc 45%,transparent 60%) calc(var(--mx) * 2% - 50%) 0/200% 100%;mix-blend-mode:overlay}
.ui .h-glitter .foil{background:var(--glitter) 0 0/40cqw 40cqw,linear-gradient(calc(var(--mx) * 3.6deg),#ff4fa3,#ffe14f,#4fffd1,#6c5bff,#ff4fa3);background-position:calc(var(--mx) * .4cqw) calc(var(--my) * .4cqw),0 0;background-blend-mode:multiply;mix-blend-mode:color-dodge;opacity:.9}
.ui .h-prism .foil{background:repeating-conic-gradient(from calc(var(--mx) * 3.6deg) at calc(var(--mx) * 1%) calc(var(--my) * 1%),#ff3d6e 0 5deg,#ffd21f 10deg,#41c24a 15deg,#2bc0ff 20deg,#8a4dff 25deg,#ff3d6e 30deg),linear-gradient(45deg,#ffffff55 25%,transparent 25% 75%,#ffffff55 75%) 0 0/14cqw 14cqw;background-blend-mode:overlay;mix-blend-mode:color-dodge;opacity:.55}
.ui .h-lava .foil{animation:ut-lava 4s ease-in-out infinite alternate}@keyframes ut-lava{to{filter:hue-rotate(-18deg) brightness(1.2)}}
.ui .h-lava .st,.ui .h-galaxy .st{color:#fff}
.ui .card.idle{animation:ut-sweep 6s ease-in-out infinite alternate}
@keyframes ut-sweep{from{--mx:20;--my:35}to{--mx:80;--my:65}}
@property --mx{syntax:'<number>';inherits:true;initial-value:50}@property --my{syntax:'<number>';inherits:true;initial-value:50}
.ui .serial{position:absolute;z-index:5;right:6%;top:5%;font-family:var(--fn);font-size:7.5cqw;line-height:1;padding:1.5cqw 2.2cqw;border-radius:2cqw}
.ui .serial.foil-num{background:linear-gradient(115deg,#fff3b0,#d79a12 40%,#fff3b0 55%,#b47706);color:var(--ink);border:.8cqw solid var(--ink)}
.ui .serial.laser{color:#e9fbff;text-shadow:0 0 2cqw #6fe6ff,0 0 5cqw #2fb8ff;background:none;font-size:9cqw}
.ui .tagnew{position:absolute;z-index:6;left:50%;top:-6%;transform:translateX(-50%) rotate(-4deg);font-family:var(--fn);font-size:.7em;background:var(--cherry);color:#fff;border:.15em solid var(--ink);border-radius:.5em;padding:0 .4em;white-space:nowrap}
.ui .tagnew.dup{background:#fff;color:var(--ink)}
/* cases */
.ui .loader{position:relative;padding:9% 8% 8%;border-radius:5%/3.6%;container-type:inline-size}
.ui .loader .card{box-shadow:none;transform:none}
.ui .loader .sheen{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;background:linear-gradient(90deg,transparent 30%,#ffffffcc 50%,transparent 70%);border-radius:inherit}
.ui .loader::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(115deg,transparent 20%,#ffffff70 32%,transparent 42%,transparent 60%,#ffffff40 66%,transparent 72%)}
.ui .loader .plate{position:absolute;left:6%;right:6%;top:3.5%;height:18%;border-radius:3cqw;border:.9cqw solid var(--ink);display:flex;flex-direction:column;justify-content:center;padding-inline:4cqw;font-family:var(--fd)}
.ui .plate b{font-weight:400;font-size:7.5cqw;line-height:1}.ui .plate span{font-family:var(--fn);font-size:5cqw}
.ui .l-slab{background:linear-gradient(#e8f1ff55,#b8c9e855);border:.3em solid #f4f8ff;outline:.2em solid var(--ink);border-radius:4%;padding-top:30%;box-shadow:inset 0 0 0 .6em #ffffff2a,0 .5em 0 var(--ink)}
.ui .l-slab .plate{display:grid;grid-template-columns:1fr auto;align-items:center;background:linear-gradient(#1c2557,#0c1233);color:#ffe27a;border-color:#d9a640}
.ui .l-slab .plate b,.ui .l-slab .plate span{grid-column:1;font-size:5.5cqw}.ui .l-slab .plate span{color:#fff3c4}
.ui .l-slab .plate .grade{grid-column:2;grid-row:1/span 2;font-family:var(--fn);font-size:12cqw;line-height:1;text-align:center;background:linear-gradient(115deg,#fff3b0,#d79a12 50%,#b47706);color:var(--ink);border-radius:2cqw;padding:1cqw 2cqw}
.ui .l-slab .bars{position:absolute;left:6%;bottom:2.5%;width:30%;height:3%;background:repeating-linear-gradient(90deg,var(--ink) 0 2px,transparent 2px 4px,var(--ink) 4px 5px,transparent 5px 8px);opacity:.6}
.ui .l-gold{background:#111;border:.35em solid;border-image:linear-gradient(135deg,#fff3b0,#c98a0c,#fff3b0,#8a5a00) 1;outline:.2em solid var(--ink);padding-top:30%;box-shadow:0 .5em 0 var(--ink)}
.ui .l-gold .plate{background:linear-gradient(115deg,#fff3b0,#d79a12 40%,#fff3b0 55%,#b47706);border-color:#111;text-align:center;align-items:center;color:var(--ink)}
.ui .l-gold .plate b{font-family:var(--fn);font-size:10cqw}
/* card grids */
.ui .cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(7.2em,1fr));gap:1em .8em;align-content:start;overflow:auto;padding:.6em .4em 1em;min-height:0}
.ui .cpick{position:relative;background:none;border:0;padding:0;cursor:pointer;font:inherit;color:inherit;text-align:center;display:flex;flex-direction:column;gap:.25em;min-width:0}
.ui .cpick small{font-weight:800;font-size:.8em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ui .cpick.focus .cardbox{transform:scale(1.08) rotate(-1.5deg);filter:drop-shadow(0 0 .35em #fff)}
.ui .cpick:focus{outline:none}.ui .cpick.off{opacity:.35;filter:grayscale(1)}
.ui .cpick.ghost .card{filter:grayscale(1) brightness(.35)}
.ui .cardbox{transition:transform .12s cubic-bezier(.3,1.8,.5,1)}
/* squad */
.ui .pitch{position:relative;background:repeating-linear-gradient(90deg,#3fae4a 0 10%,#4bbb55 10% 20%);border:.25em solid var(--ink);border-radius:1.1em;box-shadow:0 .35em 0 var(--ink);display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,auto);gap:.4em 1em;padding:.8em 1.4em;justify-items:center;align-content:center;min-height:0}
.ui .pitch::before{content:"";position:absolute;left:50%;top:6%;bottom:6%;border-left:.2em solid #ffffff88}
.ui .slotc{position:relative;width:min(7.5em,100%);background:none;border:0;padding:0;cursor:pointer;font:inherit;display:flex;flex-direction:column;align-items:center;gap:.2em}
.ui .slotc .lab{font-family:var(--fn);font-size:.75em;background:var(--ink);color:#fff;border-radius:.5em;padding:0 .5em}
.ui .slotc.focus .cardbox{transform:scale(1.08)}.ui .slotc:focus{outline:none}
.ui .pitch .slotc{width:min(7.5em,100%,16cqh)} /* four rows of cards always fit the pitch */
.ui .slotc .empty{width:100%;aspect-ratio:5/7;border:.25em dashed #fff;border-radius:.8em;display:grid;place-items:center;font-family:var(--fd);font-size:2em;color:#fff}
/* P1 theatre */
.ui .theatre{position:absolute;inset:0;z-index:5;overflow:hidden;container-type:size;background:radial-gradient(ellipse at 50% 70%,#3e1d8a,#140a33 70%)}
.ui .theatre.see3d{background:none}
.ui .theatre .beams{position:absolute;inset:-50%;opacity:0;background:repeating-conic-gradient(from 0deg at 50% 50%,var(--beam,#fff) 0 6deg,transparent 6deg 18deg);transition:opacity .3s;animation:ut-spin 12s linear infinite;pointer-events:none}
@keyframes ut-spin{to{transform:rotate(360deg)}}
.ui .pack{position:absolute;left:50%;top:50%;width:min(28cqh,22cqw);aspect-ratio:5/7.6;transform:translate(-50%,-50%);border:.35em solid var(--ink);border-radius:1em;background:var(--pk,linear-gradient(160deg,#ffe066,#ff9a1f 50%,#e03a1e));
  display:grid;place-items:center;font-family:var(--fd);color:#fff;font-size:min(4cqh,3.2cqw);text-align:center;line-height:1;-webkit-text-stroke:.12em var(--ink);paint-order:stroke fill;box-shadow:0 .8em 0 #00000066}
.ui .pack.shake{animation:ut-shake .5s linear infinite}
@keyframes ut-shake{0%,100%{transform:translate(-50%,-50%) rotate(0)}25%{transform:translate(-51%,-50%) rotate(-4deg)}75%{transform:translate(-49%,-50%) rotate(4deg)}}
.ui .clue{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%) scale(.2);opacity:0;font-family:var(--fd);color:#fff;font-size:min(13cqh,10cqw);-webkit-text-stroke:.07em var(--ink);paint-order:stroke fill;white-space:nowrap;pointer-events:none}
.ui .reveal{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(40cqh,26cqw)}
.ui .reveal.boxed{width:min(46cqh,30cqw)}
.ui .confetti{position:absolute;width:1.2cqw;height:2cqw;top:-5%;pointer-events:none}
.ui .screen-shake{animation:ut-sshake .4s linear 2}
@keyframes ut-sshake{25%{transform:translate(-1.2%,.8%)}50%{transform:translate(1%,-1%)}75%{transform:translate(-.6%,1.2%)}}
.ui .theatre .hintline{position:absolute;left:0;right:0;bottom:4%;text-align:center;font-family:var(--fd);font-size:1.4em;color:#fff;-webkit-text-stroke:.15em var(--ink);paint-order:stroke fill}
.ui .theatre .skip{position:absolute;right:1.4em;bottom:1.2em}
.ui .packrow{display:flex;gap:1em;justify-content:center;flex-wrap:wrap;align-items:flex-end}
.ui .packrow .cpick{width:min(9em,17%)}
.ui .pk-tile .pk{width:4.4em;aspect-ratio:5/7.6;border:.2em solid var(--ink);border-radius:.5em;background:var(--pk);align-self:center;margin:.2em 0}
.ui .odds{font-size:.8em;line-height:1.3;opacity:.9}
.ui .bar-mini{height:.7em;border:.15em solid var(--ink);border-radius:.5em;background:#fff;overflow:hidden}.ui .bar-mini i{display:block;height:100%;background:var(--leaf)}
.ui .ladder{display:flex;gap:.3em;align-items:flex-end}
.ui .ladder i{flex:1;border:.15em solid var(--ink);border-radius:.3em .3em 0 0;background:#ffffff40}
.ui .ladder i.on{background:var(--m1)}.ui .ladder i.done{background:#ffffffaa}
.ui[data-mode="ut"] .tile.dark{background:linear-gradient(135deg,#2a1260,#6a2fd8);color:#fff}
.ui[data-mode="ut"] .tile.dark.focus{background:linear-gradient(135deg,#3a1a80,#7d45ee)}
`;

export const PACK_COLORS = {
  bronze: 'linear-gradient(160deg,#f6c08a,#c47a3c 55%,#6e3c14)', silver: 'linear-gradient(160deg,#fff,#c8d0dc 50%,#7d889a)',
  gold: 'linear-gradient(160deg,#fff0a0,#e8a91a 55%,#9a5d05)', premiumGold: 'linear-gradient(160deg,#fff6c4,#f0b72a 35%,#1b1036 36% 40%,#b06a00 41%)',
  holo: 'linear-gradient(115deg,#ff3d6e,#ffd21f,#41c24a,#2bc0ff,#8a4dff)',
};
// beam colour of the pack opening, by the best rarity
export const BEAM = { bronze: '#f6c08a', silver: '#e9eef5', gold: '#ffe27a', goldRare: '#ffe27a', holo: '#ff7bd5', holoRare: '#ff7b1c', holoEpic: '#b07bff', numbered: '#7fe8ff', oneOfOne: '#ffd21f' };

export function installCardStyles() {
  if (document.getElementById('ut-cards')) return;
  const st = document.createElement('style'); st.id = 'ut-cards'; st.textContent = CSS; document.head.appendChild(st);
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  for (let i = 0; i < 420; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.9})`; const s = Math.random() < 0.1 ? 2 : 1; x.fillRect(Math.random() * 128, Math.random() * 128, s, s); }
  document.documentElement.style.setProperty('--glitter', `url(${c.toDataURL()})`);
}

const BUST = (seed) => {
  const hair = ['#3a2210', '#1b1036', '#c4561a', '#e8c25a'][seed % 4], skin = ['#ffd2a8', '#e9a77a', '#b87348', '#ffe0c2'][(seed + 1) % 4];
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M14 100 Q16 68 50 64 Q84 68 86 100Z" fill="#9aa6b8" stroke="#1b1036" stroke-width="3.5"/>
    <circle cx="50" cy="40" r="23" fill="${skin}" stroke="#1b1036" stroke-width="3.5"/><path d="M27 36 Q30 12 52 14 Q74 14 74 36 Q66 26 56 28 Q44 22 27 36Z" fill="${hair}" stroke="#1b1036" stroke-width="3"/></svg>`;
};

// long names get a smaller font instead of being cut ("Centrocampista Celestini")
const nmSize = (n) => (n.length > 20 ? ' style="font-size:6cqw"' : n.length > 15 ? ' style="font-size:7cqw"' : '');

// card: catalogue entry (ut/cards.js); serial: number of a numbered card; portrait: data URL or null
export function utCardHtml(card, { serial = null, portrait = null, idle = false, name } = {}) {
  const keys = STAT_KEYS[card.gk ? 'goalie' : 'fielder'];
  const st = keys.map((k) => `<span>${card.stats[k]}<small>${t('ut.stat.' + k)}</small></span>`).join('');
  const ser = card.rarity === 'numbered' ? `<div class="serial laser">${String(serial || 0).padStart(2, '0')}/10</div>`
    : card.rarity === 'oneOfOne' ? '<div class="serial foil-num">1/1</div>' : '';
  return `<div class="cardbox"><div class="card r-${card.rarity} ${card.fx}${idle ? ' idle' : ''}"><div class="art">${portrait ? `<img src="${portrait}" alt="">` : BUST(card.char.length)}</div>
    <div class="foil"></div><div class="glare"></div><div class="ovr">${card.ovr}</div><div class="role">${t('ut.role.' + card.role)}</div>
    <div class="nm"${nmSize(name || t('ut.char.' + card.char))}>${name || t('ut.char.' + card.char)}</div><div class="st">${st}</div>${ser}</div></div>`;
}

// numbered and 1/1 in their case (L3b, L4)
export function caseHtml(card, opts = {}) {
  const inner = utCardHtml(card, opts);
  if (card.rarity === 'numbered') {
    const n = String(opts.serial || 0).padStart(2, '0');
    return `<div class="loader l-slab"><div class="plate"><b>${t('ut.char.' + card.char)}</b><span>${t('ut.numberedOf', { n })}</span><div class="grade">${n}</div></div><div class="bars"></div>${inner}<div class="sheen"></div></div>`;
  }
  if (card.rarity === 'oneOfOne') return `<div class="loader l-gold"><div class="plate"><b>1 / 1</b><span>${t('ut.oneOfOne')}</span></div>${inner}<div class="sheen"></div></div>`;
  return inner;
}

// light follows the pointer on a card (and its case)
export function bindTilt(root) {
  for (const c of root.querySelectorAll('.card')) {
    const box = c.closest('.loader') || c;
    box.addEventListener('pointermove', (e) => {
      const r = box.getBoundingClientRect();
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1));
      c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1));
      c.classList.remove('idle');
    });
  }
}
