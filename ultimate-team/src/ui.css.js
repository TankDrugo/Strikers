// Styles of the Ultimate Team screens (added once to the page). The screens use the game's .screen
// overlay, so the controller moves between their buttons like in every other menu.
export const CSS = `
.screen .card.ut{max-width:1060px;max-height:calc(100vh - 32px);overflow:auto;gap:12px}
.ut header{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px}
.ut header h1{flex:1 1 auto}
.ut .pill{background:rgba(255,255,255,.1);border-radius:999px;padding:5px 12px;font-size:14px;white-space:nowrap}
.ut .pill b{color:#ffd23f}
.ut .note{font-size:13px;opacity:.75}
.ut .warn{font-size:13px;color:#ffb3a0}
.ut .grid{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.ut .packs{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.ut .pack{display:flex;flex-direction:column;gap:6px;align-items:stretch;text-align:left;padding:14px!important;border-radius:12px;color:#fff!important}
.ut .pack small{font-weight:400;opacity:.85;line-height:1.4}
.ut .pack.bronzo{background:linear-gradient(160deg,#8a5a32,#3b2715)!important}
.ut .pack.argento{background:linear-gradient(160deg,#8d99a8,#3a4350)!important}
.ut .pack.oro{background:linear-gradient(160deg,#d9a92c,#6b4b0c)!important}
.ut .pack.campioni{background:linear-gradient(160deg,#1c1c2e,#5a2a8a 60%,#d4a72c)!important}
.ut .pack[disabled]{opacity:.45;cursor:not-allowed}
.ut .formation{display:grid;grid-template-columns:repeat(3,auto);justify-content:center;gap:8px 18px;align-items:center}
.ut .formation .s3{grid-column:2}.ut .formation .s2{grid-column:1}.ut .formation .s1{grid-column:3}.ut .formation .s0{grid-column:2}.ut .formation .s4{grid-column:2}
.ut .slot{display:flex;flex-direction:column;align-items:center;gap:4px;background:none!important;padding:4px!important;color:#fff!important}
.ut .slot .lab{font-size:12px;opacity:.8;font-weight:700}
.ut .empty{width:118px;height:168px;border:2px dashed rgba(255,255,255,.3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:30px;opacity:.6}
.utc{--a:#c58a52;--b:#6b4423;--ink:#fff3e4;position:relative;width:118px;height:168px;border-radius:10px 10px 22px 22px;background:linear-gradient(165deg,var(--a),var(--b));color:var(--ink);
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.25),0 6px 16px rgba(0,0,0,.35);overflow:hidden;font-family:"Trebuchet MS",system-ui,sans-serif;flex:none;text-align:left}
.utc.argento{--a:#dfe5ec;--b:#7c8796;--ink:#18202a}
.utc.oro{--a:#ffe08a;--b:#b88414;--ink:#2a1d02}
.utc.informa{--a:#1d2333;--b:#090b12;--ink:#fff;box-shadow:inset 0 0 0 2px #ffd23f,0 6px 18px rgba(255,210,63,.35)}
.utc.icona{--a:#fff8e2;--b:#d8b65a;--ink:#2b2008;box-shadow:inset 0 0 0 2px #fff,0 0 22px rgba(255,236,160,.7)}
.utc .ovr{position:absolute;left:8px;top:6px;font-size:26px;font-weight:800;line-height:1}
.utc .pos{position:absolute;left:9px;top:33px;font-size:12px;font-weight:700}
.utc .face{position:absolute;right:2px;top:4px;width:82px;height:92px;object-fit:cover}
.utc .nm{position:absolute;left:0;right:0;top:94px;text-align:center;font-weight:800;font-size:12px;letter-spacing:.02em;border-bottom:1px solid rgba(127,127,127,.4);padding:0 4px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.utc .st{position:absolute;left:10px;right:10px;top:114px;display:grid;grid-template-columns:1fr 1fr;gap:1px 8px;font-size:11px}
.utc .st b{font-weight:800;margin-right:3px}
.utc .tm{position:absolute;left:0;right:0;bottom:4px;text-align:center;font-size:9px;opacity:.8;text-transform:uppercase;letter-spacing:.08em}
.utc .rar{position:absolute;left:9px;top:50px;font-size:9px;font-weight:700;text-transform:uppercase;opacity:.85;writing-mode:vertical-rl}
.utc .cnt{position:absolute;right:6px;bottom:16px;background:rgba(0,0,0,.55);color:#fff;border-radius:6px;font-size:11px;padding:0 5px}
.utc.off{filter:grayscale(1) brightness(.35)}
.utc.big{transform:scale(1.6);transform-origin:top center;margin-bottom:110px}
button.cardbtn{background:none!important;padding:3px!important;border-radius:12px!important}
button.cardbtn.sel{outline:3px solid #8fd3ff}
.ut .filters{display:flex;flex-wrap:wrap;gap:6px}
.ut .filters button{padding:6px 12px;font-size:13px}
.ut .vs{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;text-align:center}
.ut .vs .big{font-size:40px;font-weight:800}
.ut .reveal{animation:utIn .45s ease-out both}
@keyframes utIn{from{transform:scale(.6) rotateY(90deg);opacity:0}to{transform:none;opacity:1}}
.ut-walk{position:fixed;inset:0;pointer-events:none;z-index:4;font-family:"Trebuchet MS",system-ui,sans-serif;color:#fff}
.ut-walk .hints{position:absolute;left:50%;top:7%;transform:translateX(-50%);display:flex;gap:14px}
.ut-walk .hint{background:rgba(8,12,22,.75);border-radius:12px;padding:10px 18px;font-size:22px;font-weight:800;animation:utIn .4s ease-out both;text-align:center}
.ut-walk .hint small{display:block;font-size:12px;font-weight:400;opacity:.8}
.ut-walk .skip{position:absolute;right:18px;bottom:18px;pointer-events:auto;font:inherit;font-weight:700;border:0;border-radius:10px;padding:9px 16px;background:rgba(8,12,22,.75);color:#fff;cursor:pointer}
.ut-walk .flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,226,140,.65),transparent 70%);animation:utFlash 1.2s ease-out both}
@keyframes utFlash{from{opacity:1}to{opacity:0}}
@media (max-width:560px){.utc.big{transform:scale(1.3);margin-bottom:56px}.ut .vs .big{font-size:28px}}
`;
