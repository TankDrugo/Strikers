import { installHolo } from './holo.js';
// Menu look "M1, cartoon tropicale" chosen by the player (interfaccia-gioco/DESIGN.md): thick outlines, saturated
// colours, bouncy tiles, chunky outlined titles, animated sunburst. Each mode has its own colours (--m1/--m2/--m3).
// Sizes are in em: the root font size follows the window, so the menu scales like a console screen.

const FONTS = 'https://fonts.googleapis.com/css2?family=Lilita+One&family=Baloo+2:wght@500;700;800&family=Bungee&display=swap';

const CSS = `
.ui{--ink:#1b1036;--paper:#fff5dc;--sun:#ffd21f;--orange:#ff7b1c;--leaf:#41c24a;--grape:#6a2fd8;--cherry:#ff3d6e;--sky:#2b7fe0;
  --m1:#ff7b1c;--m2:#ffd21f;--m3:#ffe9b8;
  --fd:"Lilita One","Arial Black",Impact,sans-serif;--fb:"Baloo 2","Trebuchet MS",system-ui,sans-serif;--fn:"Bungee","Arial Black",Impact,sans-serif;
  position:fixed;inset:0;z-index:6;font-family:var(--fb);color:var(--ink);font-size:clamp(11px,min(1.45vw,2.6vh),24px);line-height:1.35;pointer-events:none}
.ui *{box-sizing:border-box}
.ui .layer{position:absolute;inset:0;pointer-events:auto;overflow:hidden;display:flex;flex-direction:column}
.ui .layer.dim{background:rgba(27,16,54,.55)}
.ui .layer.layer-in>.panel,.ui .layer.layer-in>.hub-ui{animation:ui-pop .35s cubic-bezier(.3,1.6,.5,1)}
@keyframes ui-pop{from{transform:scale(.94) translateY(1.5em);opacity:0}}
.ui .bg{position:absolute;inset:-25%;z-index:0;background:repeating-conic-gradient(from 0deg at 50% 60%,var(--m2) 0 10deg,var(--m3) 10deg 20deg);animation:ui-drift 40s linear infinite}
.ui[data-mode="cups"]{--m1:#e03a1e;--m2:#ff9a1f;--m3:#ffc65a}
.ui[data-mode="cups"] .hub .bg{background:radial-gradient(circle,var(--m3) 0 22%,transparent 23%) 0 0/5em 5em,var(--m2)}
.ui[data-mode="ut"]{--m1:#c03cff;--m2:#2a1260;--m3:#3e1d8a}
.ui[data-mode="ut"] .hub .bg{background:linear-gradient(90deg,#ffffff10 1px,transparent 1px) 0 0/2.4em 2.4em,linear-gradient(#ffffff10 1px,transparent 1px) 0 0/2.4em 2.4em,radial-gradient(circle at 70% 30%,var(--m3),var(--m2) 70%)}
.ui[data-sub="market"]{--m1:#d9a640;--m2:#3b2a1a;--m3:#5a4026}
.ui[data-sub="market"] .hub .bg{background:repeating-linear-gradient(90deg,#d9a64022 0 2px,transparent 2px 2em),repeating-conic-gradient(from 0deg at 50% 110%,#d9a64018 0 4deg,transparent 4deg 8deg),var(--m2)}
@keyframes ui-drift{to{transform:translate(6%,4%) rotate(3deg)}}
@media (prefers-reduced-motion:reduce){.ui .bg{animation:none}.ui .layer.layer-in>*{animation:none!important}}
.ui .hub-ui{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;gap:1.1em;
  padding:max(1.4em,env(safe-area-inset-top,0px)) max(1.8em,env(safe-area-inset-right,0px)) max(1.2em,env(safe-area-inset-bottom,0px)) max(1.8em,env(safe-area-inset-left,0px));min-height:0}
.ui .bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1em}
.ui .crumb{font-family:var(--fd);font-size:1.35em;color:#fff;-webkit-text-stroke:.22em var(--ink);paint-order:stroke fill;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ui .mode-tag{display:inline-block;background:var(--m1);border:.18em solid var(--ink);border-radius:.6em;padding:0 .6em;margin-right:.4em;-webkit-text-stroke:0;color:#fff;transform:skew(-8deg)}
.ui .tabs{display:flex;align-items:center;gap:.4em;background:var(--ink);border-radius:1.2em;padding:.35em .5em}
.ui .shoulder{font-family:var(--fn);font-size:.85em;color:var(--ink);background:#fff;border-radius:.6em;padding:.15em .55em;border:0;cursor:pointer}
.ui .tab{font-family:var(--fd);font-size:1.15em;color:#fff;opacity:.6;padding:.15em .7em;border-radius:.8em;cursor:pointer;white-space:nowrap;border:0;background:none}
.ui .tab.on{opacity:1;background:var(--m1);transform:scale(1.08) skew(-6deg);box-shadow:0 .2em 0 #00000055}
.ui .chip-profile{justify-self:end;display:flex;align-items:center;gap:.5em;background:#fff;border:.2em solid var(--ink);border-radius:2em;padding:.2em .9em .2em .2em;box-shadow:0 .25em 0 var(--ink)}
.ui .av{width:2.2em;height:2.2em;border-radius:50%;border:.18em solid var(--ink);display:grid;place-items:center;font-family:var(--fd);color:#fff;font-size:1.1em;flex:none;-webkit-text-stroke:.12em var(--ink);paint-order:stroke fill}
.ui .chip-profile b{font-family:var(--fd);font-weight:400;font-size:1.05em;line-height:1;display:block}
.ui .chip-profile small{font-family:var(--fn);font-size:.7em;color:var(--grape)}
.ui .stage{flex:1;min-height:0;position:relative}
.ui .view{position:absolute;inset:0;display:grid;gap:1em}
.ui .view.enter{animation:ui-pop .35s cubic-bezier(.3,1.6,.5,1)}
.ui .tile{position:relative;background:#fff;border:.25em solid var(--ink);border-radius:1.1em;box-shadow:0 .35em 0 var(--ink);padding:.9em 1em;display:flex;flex-direction:column;gap:.3em;
  cursor:pointer;overflow:hidden;min-width:0;min-height:0;text-align:left;font:inherit;color:inherit;transition:transform .12s cubic-bezier(.3,1.8,.5,1),background .12s}
.ui .tile h3{font-family:var(--fd);font-weight:400;font-size:1.5em;line-height:1.05;margin:0}
.ui .tile p{margin:0;font-size:.95em}
.ui .tile .big{font-family:var(--fd);font-size:2.6em;line-height:1;color:var(--m1);-webkit-text-stroke:.06em var(--ink);paint-order:stroke fill}
.ui .tile .hint{margin-top:auto;font-family:var(--fn);font-size:.72em;opacity:.8}
.ui .tile.focus{transform:scale(1.035) rotate(-.8deg);background:var(--sun);outline:.3em solid #fff;outline-offset:.15em;z-index:1}
.ui .tile:focus{outline:none}.ui .tile.focus:focus-visible{outline:.3em solid #fff}
.ui .tile.soon{cursor:default}
.ui .tile .soon-tag{position:absolute;right:.8em;top:.8em;font-family:var(--fn);font-size:.65em;background:var(--ink);color:var(--sun);border-radius:.5em;padding:.1em .5em}
.ui .tile.locked{background:#f1e8d4}
.ui .footer{display:flex;gap:1.6em;flex-wrap:wrap;font-family:var(--fd);font-size:.95em;color:#fff;-webkit-text-stroke:.18em var(--ink);paint-order:stroke fill}
.ui .btnA,.ui .btnB,.ui .btnY,.ui .btnLR{display:inline-grid;place-items:center;min-width:1.5em;height:1.5em;border-radius:.75em;border:.15em solid var(--ink);font-family:var(--fn);font-size:.75em;-webkit-text-stroke:0;color:#fff;margin-right:.35em;padding:0 .3em;vertical-align:middle}
.ui .btnA{background:#3fbf3f}.ui .btnB{background:#e8352b}.ui .btnY{background:#f2b90f}.ui .btnLR{background:#fff;color:var(--ink)}
.ui .iris{position:absolute;inset:0;z-index:20;pointer-events:none;background:var(--ink);clip-path:circle(0% at 50% 50%)}
.ui .iris.run{animation:ui-iris .7s ease-in-out}
@keyframes ui-iris{0%{clip-path:circle(0% at 50% 50%)}45%,55%{clip-path:circle(80% at 50% 50%)}100%{clip-path:circle(0% at 50% 50%)}}
.ui .banner{position:absolute;z-index:21;left:50%;top:45%;transform:translate(-50%,-50%) rotate(-4deg);font-family:var(--fd);font-size:4.5em;color:var(--sun);-webkit-text-stroke:.12em var(--ink);paint-order:stroke fill;opacity:0;pointer-events:none;white-space:nowrap}
.ui .banner.run{animation:ui-banner .9s ease-out}
@keyframes ui-banner{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-12deg)}30%{opacity:1;transform:translate(-50%,-50%) scale(1.1) rotate(-4deg)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1) rotate(-4deg)}}
/* centred panels: language, profiles, setup, pause, end */
.ui .center{position:relative;z-index:1;flex:1;display:flex;align-items:center;justify-content:center;padding:1.5em max(1.5em,env(safe-area-inset-right,0px)) 1.5em max(1.5em,env(safe-area-inset-left,0px));min-height:0}
.ui .panel{background:var(--paper);border:.3em solid var(--ink);border-radius:1.5em;box-shadow:0 .5em 0 var(--ink);padding:1.4em 1.6em;width:min(52em,100%);max-height:100%;overflow:auto;display:flex;flex-direction:column;gap:1em}
.ui .title{font-family:var(--fd);font-weight:400;font-size:2.6em;line-height:1;margin:0;color:var(--sun);-webkit-text-stroke:.09em var(--ink);paint-order:stroke fill;text-shadow:0 .08em 0 var(--ink);transform:rotate(-1.5deg);transform-origin:left}
.ui .sub{margin:0;font-size:1em}
.ui .grid{display:grid;gap:1em}
.ui .row-btns{display:flex;gap:.8em;flex-wrap:wrap}
.ui .btn{font-family:var(--fd);font-size:1.15em;color:var(--ink);cursor:pointer;background:#fff;border:.2em solid var(--ink);border-radius:.8em;padding:.35em 1em;box-shadow:0 .25em 0 var(--ink);transition:transform .1s}
.ui .btn.primary{background:var(--leaf);color:#fff;-webkit-text-stroke:.08em var(--ink);paint-order:stroke fill}
.ui .btn.focus{background:var(--sun);color:var(--ink);transform:scale(1.06) rotate(-1deg);-webkit-text-stroke:0}
.ui .btn:focus{outline:none}
.ui .profile-tile{align-items:center;text-align:center;gap:.5em}
.ui .profile-tile .av{width:4.2em;height:4.2em;font-size:1.6em}
.ui .name-box{font-family:var(--fd);font-size:2em;background:#fff;border:.15em solid var(--ink);border-radius:.5em;padding:.1em .5em;min-height:1.5em;display:flex;align-items:center}
.ui .name-box .caret{display:inline-block;width:.08em;height:1em;background:var(--ink);margin-left:.05em;animation:ui-blink 1s steps(1) infinite}
@keyframes ui-blink{50%{opacity:0}}
.ui .kb{display:grid;grid-template-columns:repeat(10,1fr);gap:.35em}
.ui .key{font-family:var(--fd);font-size:1.15em;padding:.3em 0;background:#fff;border:.15em solid var(--ink);border-radius:.5em;cursor:pointer;color:var(--ink);box-shadow:0 .15em 0 var(--ink)}
.ui .key.wide{grid-column:span 3}.ui .key.focus{background:var(--sun);transform:scale(1.1)}
.ui .key:focus{outline:none}
.ui .colors{display:flex;gap:.6em}
.ui .swatch{width:2.4em;height:2.4em;border-radius:50%;border:.2em solid var(--ink);cursor:pointer}
.ui .swatch.on{box-shadow:0 0 0 .25em #fff,0 0 0 .45em var(--ink)}
.ui .swatch.focus{transform:scale(1.18)}.ui .swatch:focus{outline:none}
.ui .err{color:#c0182f;font-weight:700;min-height:1.3em;margin:0}
.ui .opt-row{display:grid;grid-template-columns:1fr 1.4fr;align-items:center;gap:1em;background:#fff;border:.2em solid var(--ink);border-radius:.8em;padding:.45em .9em;cursor:pointer;font:inherit;color:inherit;text-align:left}
.ui .opt-row .lbl{font-family:var(--fd);font-size:1.15em}
.ui .opt-row .val{display:flex;align-items:center;justify-content:space-between;gap:.5em;font-weight:800}
.ui .opt-row .arrow{font-family:var(--fn);opacity:.35}
.ui .opt-row.focus{background:var(--sun)}.ui .opt-row.focus .arrow{opacity:1}
.ui .opt-row.fixed .arrow{visibility:hidden}.ui .opt-row:focus{outline:none}
.ui .slots{display:grid;grid-template-columns:1fr 1fr;gap:1em}
.ui .slot{border:.25em dashed var(--ink);border-radius:1em;padding:1em;text-align:center;display:flex;flex-direction:column;gap:.3em;align-items:center;background:#ffffff80}
.ui .slot.on{border-style:solid;background:#fff}
.ui .slot b{font-family:var(--fd);font-weight:400;font-size:1.4em}
.ui .slot .dev{font-family:var(--fn);font-size:.8em}
.ui .keys{display:grid;grid-template-columns:auto 1fr;gap:.25em .8em;font-size:.95em;align-items:baseline}
.ui .keys>*:nth-child(odd){justify-self:start}
.ui kbd{font-family:var(--fn);font-size:.75em;background:var(--ink);color:#fff;border-radius:.35em;padding:.05em .4em;white-space:nowrap}
.ui table.stats{border-collapse:collapse;font-size:1.05em;font-variant-numeric:tabular-nums}.ui table.stats td{padding:.15em 1em .15em 0}
.ui .bar-load{height:1.2em;border:.2em solid var(--ink);border-radius:.8em;background:#fff;overflow:hidden}
.ui .bar-load i{display:block;height:100%;width:0;background:repeating-linear-gradient(45deg,var(--orange) 0 .8em,var(--sun) .8em 1.6em);transition:width .2s}
.ui pre.errtxt{white-space:pre-wrap;font-size:.8em;background:#fff;border:.15em solid var(--ink);border-radius:.5em;padding:.6em;margin:0;user-select:text;max-height:10em;overflow:auto}
.ui .news{background:linear-gradient(135deg,#6a2fd8,#ff3d6e);color:#fff}
.ui .news.focus{background:linear-gradient(135deg,#7d45ee,#ff5a84)}
.ui .news h3{font-size:2.2em;-webkit-text-stroke:.07em var(--ink);paint-order:stroke fill}
.ui .news .lab{align-self:flex-start;font-family:var(--fn);font-size:.65em;background:var(--ink);color:var(--sun);border-radius:.5em;padding:.1em .5em}
.ui .news .dots{display:flex;gap:.35em}.ui .news .dots i{width:.6em;height:.6em;border-radius:50%;background:#ffffff66}.ui .news .dots i.on{background:#fff}
.ui .mini-cards{display:flex;gap:.8em;align-items:flex-end;margin-top:auto}
.ui .mini-cards .cardbox{width:5.5em;flex:none}
/* trading card (same drawing as the drafts page) */
.ui .cardbox{position:relative;width:100%;container-type:inline-size}
.ui .card{--mx:50;--my:50;position:relative;aspect-ratio:5/7;width:100%;container-type:inline-size;border-radius:7cqw;border:4cqw solid var(--ink);overflow:hidden;isolation:isolate;
  background:linear-gradient(160deg,#fff0a0,#e8a91a 55%,#9a5d05);transform:perspective(700px) rotateY(calc((var(--mx) - 50) * .22deg)) rotateX(calc((50 - var(--my)) * .18deg));box-shadow:0 3cqw 0 #00000040;font-family:var(--fd);color:var(--ink)}
.ui .card .art{position:absolute;inset:5% 3% 19% 17%;z-index:1}.ui .card .art svg{width:100%;height:100%;display:block}
.ui .card .ovr{position:absolute;z-index:3;left:7%;top:4%;font-size:17cqw;line-height:.9;-webkit-text-stroke:1.2cqw #fff;paint-order:stroke fill}
.ui .card .role{position:absolute;z-index:3;left:8%;top:20%;font-size:8cqw;-webkit-text-stroke:.8cqw #fff;paint-order:stroke fill}
.ui .card .nm{position:absolute;z-index:3;left:5%;right:5%;bottom:8%;text-align:center;background:var(--ink);color:#fff;border-radius:3cqw;font-size:8.4cqw;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-inline:2cqw}
.ui .h-lava{background:linear-gradient(170deg,#4a0d05,#1c0503)}
.ui .h-galaxy{background:radial-gradient(ellipse at 30% 30%,#6a2fd8,transparent 60%),radial-gradient(ellipse at 75% 70%,#1fb6ff,transparent 55%),#0b0626}
.ui .h-lava .ovr,.ui .h-lava .role,.ui .h-galaxy .ovr,.ui .h-galaxy .role{color:#fff;-webkit-text-stroke-color:var(--ink)}
/* cups */
.ui .match{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:.6em;background:#fff;border:.2em solid var(--ink);border-radius:.8em;padding:.45em .8em;box-shadow:0 .2em 0 var(--ink);min-width:0}
.ui .match span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}
.ui .match small{font-weight:500;opacity:.75}
.ui .match .w{font-weight:800;color:var(--ink)}.ui .match .l{opacity:.45;text-decoration:line-through}
.ui .match .sc{font-family:var(--fn);font-size:.9em;background:var(--ink);color:#fff;border-radius:.5em;padding:.1em .5em;white-space:nowrap}
.ui .obj{background:#fff;border:.18em solid var(--ink);border-radius:.6em;padding:.3em .7em;font-weight:700}
.ui .obj.done{background:#d8f7c9}.ui .obj.failed{background:#f3d6dc;opacity:.8}
.ui .trophy{animation:ui-trophy 1.6s ease-in-out infinite alternate}
@keyframes ui-trophy{from{transform:rotate(-6deg) scale(1)}to{transform:rotate(6deg) scale(1.08)}}
.hud .toast{position:absolute;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);font-family:"Lilita One","Arial Black",sans-serif;font-size:20px;color:#1b1036;background:#fff5dc;border:3px solid #1b1036;border-radius:12px;padding:6px 14px;box-shadow:0 4px 0 #1b1036;opacity:0;transition:opacity .25s,transform .25s;white-space:nowrap}
.hud .toast.on{opacity:1;transform:translateX(-50%) translateY(-6px)}
/* HUD and the old screens get the same look */
.hud .score{font-family:"Lilita One","Arial Black",sans-serif;font-weight:400;background:#1b1036e0;border:3px solid #fff}
.hud .flash{font-family:"Lilita One","Arial Black",sans-serif;font-weight:400;-webkit-text-stroke:3px #1b1036;paint-order:stroke fill}
.hud .ptag{position:absolute;font-family:"Bungee","Arial Black",sans-serif;font-size:14px;line-height:1.25;color:#fff;background:var(--pc,#2b8cff);border:2px solid #fff;border-radius:7px;padding:0 7px;transform:translate(-50%,calc(-100% - 11px));white-space:nowrap;box-shadow:0 2px 0 rgba(0,0,0,.45);text-shadow:0 1px 0 rgba(0,0,0,.5)}.hud .ptag::after{content:"";position:absolute;left:50%;top:100%;transform:translateX(-50%);border:8px solid transparent;border-top:10px solid #fff;margin-top:1px}.hud .ptag::before{content:"";position:absolute;left:50%;top:100%;transform:translateX(-50%);border:6px solid transparent;border-top:8px solid var(--pc,#2b8cff);z-index:1}
`;

export function installTheme() {
  installHolo();
  if (document.getElementById('ui-theme')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = FONTS;
  document.head.appendChild(link);
  const st = document.createElement('style'); st.id = 'ui-theme'; st.textContent = CSS;
  document.head.appendChild(st);
}

// Card art: a cartoon bust in the team's shirt (placeholder until the cards use real renders).
export function cardHtml({ ovr, role, name, shirt = '#5ec8ff', cls = '', seed = 0 }) {
  const hair = ['#3a2210', '#1b1036', '#c4561a', '#e8c25a'][seed % 4];
  const skin = ['#ffd2a8', '#e9a77a', '#b87348', '#ffe0c2'][(seed + 1) % 4];
  const svg = `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M14 100 Q16 68 50 64 Q84 68 86 100Z" fill="${shirt}" stroke="#1b1036" stroke-width="3.5"/>
    <circle cx="50" cy="40" r="23" fill="${skin}" stroke="#1b1036" stroke-width="3.5"/>
    <path d="M27 36 Q30 12 52 14 Q74 14 74 36 Q66 26 56 28 Q44 22 27 36Z" fill="${hair}" stroke="#1b1036" stroke-width="3"/>
    <ellipse cx="42" cy="41" rx="3.2" ry="4.4" fill="#1b1036"/><ellipse cx="59" cy="41" rx="3.2" ry="4.4" fill="#1b1036"/>
    <path d="M39 51 Q50 61 62 50" fill="#fff" stroke="#1b1036" stroke-width="3" stroke-linejoin="round"/></svg>`;
  return `<div class="cardbox"><div class="card ${cls}"><div class="art">${svg}</div>
    <div class="foil"></div>${cls ? '<div class="art top">' + svg + '</div>' : ''}<div class="glare"></div><div class="ovr">${ovr}</div><div class="role">${role}</div><div class="nm">${name}</div></div></div>`;
}
