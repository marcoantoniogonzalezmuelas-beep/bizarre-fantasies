// Cosmetic overrides for the shared ability die, inside the game iframe.
export const HERO_DICE_PRESENTATION_CSS = `
.bf-hdice{top:50%;width:min(90vw,600px);gap:12px;padding:24px;box-sizing:border-box;border:1px solid #967345;border-radius:24px;background:#130c20;box-shadow:0 18px 70px #000;text-align:center;--dice-ink:#fff5dc;--dice-gold:#ffd24a}
.bf-hdice-stage{position:relative;width:min(100%,380px);height:190px;display:flex;align-items:center;justify-content:center}
.bf-hdice-aura{width:180px;height:180px;opacity:.35;animation:none;filter:none}
.bf-hdice-cup{position:absolute;left:8%;top:20px;width:82px;height:108px;border-radius:12px 12px 30px 30px;background:repeating-linear-gradient(90deg,transparent 0 13px,#0002 14px 16px),linear-gradient(100deg,#60301c,#b96f35 45%,#713918);border:3px solid #e0b361;box-shadow:inset 0 -10px 0 #4d241c,0 15px 16px #0008;transform-origin:50% 80%;animation:bfHdCupThrow 1.4s ease-in-out both}
.bf-hdice-cup::before{content:'';position:absolute;inset:-10px -5px auto;height:22px;border-radius:50%;background:#160d09;border:5px solid #deb46b;box-shadow:inset 0 3px 7px #000}
.bf-hdice-cup::after{content:'BF';position:absolute;inset:30px 0 auto;color:#ffdd8d;font:bold 24px Georgia,serif;text-shadow:0 2px 2px #30120a}
@keyframes bfHdCupThrow{0%{transform:translateX(60px) rotate(-12deg)}15%,35%{transform:translateX(60px) rotate(15deg)}25%,45%{transform:translateX(60px) rotate(-15deg)}65%{transform:translateX(45px) rotate(105deg)}100%{transform:translateX(-25px) rotate(-12deg);opacity:.5}}
.bf-hdice-cube{width:142px;height:142px;font-size:76px;line-height:1;color:var(--dice-ink);text-shadow:0 3px 3px #000;box-shadow:0 12px 24px #0009,inset 0 0 18px #c05bff30;animation:bfHdTumble 1.65s ease-out both}
@keyframes bfHdTumble{0%,44%{opacity:0;transform:translate(-45px,-42px) scale(.25) rotate(-180deg)}52%{opacity:1;transform:translate(-25px,-55px) scale(.6) rotate(-130deg)}72%{transform:translate(65px,10px) scale(.9) rotate(55deg)}86%{transform:translate(25px,-18px) scale(1) rotate(-15deg)}100%{transform:translate(0,0) scale(1) rotate(0)}}
.bf-hdice-cube.bf-hd-locked{animation:bfHdResultLand .3s ease-out both}
@keyframes bfHdResultLand{from{transform:scale(1.08)}to{transform:scale(1)}}
.bf-hdice.bf-hd-result .bf-hdice-cup{opacity:.35}
.bf-hdice-lbl{font-size:17px;line-height:1.35;white-space:normal;letter-spacing:.5px;padding:8px 16px}
.bf-hdice.bf-hd-result .bf-hdice-lbl{font-size:28px;background:var(--dice-gold);color:#21120a;text-shadow:none;border-radius:12px}
.bf-hdice-note{font-size:18px;line-height:1.45;color:var(--dice-ink);letter-spacing:0;max-width:100%}
.bf-hdice.bf-hd-result .bf-hdice-note{font:900 clamp(22px,6vw,32px)/1.25 Cinzel,serif;color:#ffe49a;background:rgba(0,0,0,.6);border:2px solid #ffd24a;border-radius:14px;padding:12px 18px;text-transform:uppercase;letter-spacing:1px;text-shadow:0 0 14px rgba(255,210,74,.8),0 2px 4px #000;animation:bfHdNote .5s ease-out both}
@keyframes bfHdNote{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:none}}
.bf-hdice-who{color:#cfbfde;font:600 14px/1.4 Rubik,sans-serif}
.bf-hdice-crit{font-size:18px;line-height:1.4;white-space:normal;animation:none;text-shadow:none;color:#ffcece;letter-spacing:.5px}
.bf-hdice-eye{animation:none;display:none}
.bf-hdice-cube{background:none!important;border:0!important;box-shadow:none!important;isolation:isolate;filter:drop-shadow(0 10px 14px #000c) drop-shadow(0 0 16px #c05bff88)}
.bf-hdice-cube::before{content:'';position:absolute;inset:-8px;z-index:-2;clip-path:polygon(50% 0,94% 25%,94% 75%,50% 100%,6% 75%,6% 25%);background:linear-gradient(160deg,#fff0b0,#d9a43a 45%,#7a5216)}
.bf-hdice-cube::after{content:'';position:absolute;inset:-4px;z-index:-1;clip-path:polygon(50% 0,94% 25%,94% 75%,50% 100%,6% 75%,6% 25%);background:linear-gradient(180deg,#ffffff38 0 12%,transparent 12%),linear-gradient(60deg,transparent 0 46%,#0000004d 46% 47%,transparent 47%),linear-gradient(120deg,transparent 0 46%,#ffffff33 46% 47%,transparent 47%),conic-gradient(from 20deg at 50% 52%,#6a35b0,#3a1d63,#8a4bd6,#2a1350,#7a3fc4,#40206e,#6a35b0)}
.bf-hdice-cube.bf-hd-crit::after{background:linear-gradient(180deg,#ffffff38 0 12%,transparent 12%),conic-gradient(from 20deg at 50% 52%,#c0282e,#5d0f14,#e04046,#3a080c,#d0343a,#6a1015,#c0282e)}
@media(max-height:600px){.bf-hdice{gap:6px;padding:14px}.bf-hdice-stage{height:150px}.bf-hdice-cube{width:114px;height:114px;font-size:62px}.bf-hdice.bf-hd-result .bf-hdice-lbl{font-size:24px}.bf-hdice-note{font-size:16px}}
@media(prefers-reduced-motion:reduce){.bf-hdice-cup,.bf-hdice-cube,.bf-hdice,.bf-hdice-spark{animation:none!important}.bf-hdice-cup{left:0;opacity:.4}}
`;