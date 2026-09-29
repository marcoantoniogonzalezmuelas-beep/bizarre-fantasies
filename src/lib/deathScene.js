// Escena de remate del iframe: reparto completo o gag de autogolpe.
export const DEATH_SCENE_CSS = `
#bf-kill-ov{position:fixed;inset:0;z-index:100006;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2vh,20px);padding:clamp(12px,3vh,28px);overflow:hidden;background:radial-gradient(ellipse at 50% 30%,#443055,#110c1e 70%,#06040b);color:#fff2d7;font-family:Rubik,system-ui,sans-serif;text-align:center;animation:bfSceneIn .3s ease-out}
@keyframes bfSceneIn{from{opacity:0}to{opacity:1}}#bf-kill-ov.bf-kill-out{opacity:0;transition:opacity .4s}
#bf-kill-ov .bf-kill-title{flex:none;font:800 clamp(20px,5vw,38px)/1.1 Cinzel,serif;color:#ffda82;text-shadow:0 3px 14px #000;letter-spacing:.08em}
#bf-kill-ov .bf-kill-sub{flex:none;font-weight:700;font-size:clamp(13px,2vw,19px);color:#f5dcbb}
#bf-kill-ov .bf-kill-cast{display:flex;align-items:center;justify-content:center;gap:clamp(10px,3vw,38px);width:100%;min-height:0;max-height:62vh}
#bf-kill-ov .bf-kill-actor,#bf-kill-ov .bf-kill-victims{display:flex;flex-direction:column;align-items:center;min-width:0;min-height:0;max-height:100%}
#bf-kill-ov .bf-kill-victims{flex-direction:row;flex-wrap:wrap;justify-content:center;align-content:center;gap:clamp(8px,2vw,18px);overflow-y:auto;max-width:min(70vw,760px)}
#bf-kill-ov .bf-kill-actor{flex:none}#bf-kill-ov .bf-kill-actor .bf-kill-portrait{border-color:#f7cc72;animation:bfKillerPose .7s ease-out both}
#bf-kill-ov .bf-kill-vic{min-width:0;animation:bfVictimFall .8s .15s ease-out both}
#bf-kill-ov.bf-kill-self .bf-kill-vic{animation:bfSelfTrip 1s ease-in-out both}
#bf-kill-ov .bf-kill-portrait{width:clamp(85px,17vw,205px);height:clamp(110px,30vh,270px);border:3px solid #9d8da8;border-radius:16px;background:#251a33 center 10%/cover no-repeat;box-shadow:0 15px 36px #000a}
#bf-kill-ov .bf-kill-name{max-width:210px;margin-top:7px;font:800 clamp(13px,2vw,20px)/1.15 Cinzel,serif;overflow-wrap:anywhere;text-shadow:0 2px 6px #000}
#bf-kill-ov .bf-kill-role{margin-top:4px;color:#f7d58b;font-size:clamp(10px,1.3vw,13px);font-weight:800;text-transform:uppercase;letter-spacing:.09em}
#bf-kill-ov .bf-kill-action{flex:none;font-size:clamp(30px,5vw,70px);text-shadow:0 3px 15px #000;animation:bfActionPop .9s ease-in-out both}
#bf-kill-ov .bf-kill-ko{flex:none;max-width:min(92vw,780px);max-height:18vh;overflow-y:auto;padding:10px 16px;background:#140f23;border:1px solid #af8b5a;border-radius:14px;font-size:clamp(12px,1.8vw,17px);line-height:1.35}
#bf-kill-ov .bf-kill-line+.bf-kill-line{margin-top:7px}#bf-kill-ov .bf-kill-speaker{color:#ffdc91;font-weight:800}
@keyframes bfKillerPose{from{opacity:0;transform:translateX(-45px) rotate(-8deg)}to{opacity:1;transform:none}}
@keyframes bfVictimFall{from{opacity:0;transform:translateY(-26px) rotate(0)}to{opacity:1;transform:translateY(0) rotate(6deg)}}
@keyframes bfSelfTrip{0%{opacity:0;transform:translateY(-25px) rotate(-15deg)}50%{opacity:1;transform:translateY(0) rotate(14deg)}75%{transform:rotate(-8deg)}100%{opacity:1;transform:rotate(9deg)}}
@keyframes bfActionPop{from{opacity:0;transform:scale(.3) rotate(-20deg)}to{opacity:1;transform:scale(1) rotate(0)}}
@media(max-width:600px){#bf-kill-ov{gap:8px;padding:10px}#bf-kill-ov .bf-kill-cast{max-height:57vh;gap:6px}#bf-kill-ov .bf-kill-victims{max-width:62vw;gap:6px}#bf-kill-ov .bf-kill-portrait{width:clamp(68px,21vw,110px);height:clamp(92px,24vh,160px);border-width:2px}#bf-kill-ov .bf-kill-vic .bf-kill-portrait{width:clamp(62px,19vw,95px)}#bf-kill-ov .bf-kill-action{font-size:26px}#bf-kill-ov .bf-kill-ko{max-height:21vh;padding:7px 10px}}
@media(prefers-reduced-motion:reduce){#bf-kill-ov,#bf-kill-ov *{animation:none!important}}
`;

export function createDeathScene(doc, actor, victims, self, pick, english) {
  var ov=doc.createElement('div');ov.id='bf-kill-ov';ov.dataset.bfNew='1';
  if(self) ov.className='bf-kill-self';
  function el(tag,cl,text,parent){var n=doc.createElement(tag);n.className=cl;if(text)n.textContent=text;parent.appendChild(n);return n;}
  el('div','bf-kill-title',self?(english?'EPIC FAIL!':'¡PIFIA LEGENDARIA!'):(victims.length>1?(english?'TOTAL CHAOS!':'¡CAOS TOTAL!'):(english?'FINAL BLOW!':'¡GOLPE MORTAL!')),ov);
  el('div','bf-kill-sub',self?(english?'Nobody needed to help...':'Nadie tuvo que ayudarle...'):(english?'One move, spectacular consequences':'Una jugada, consecuencias desastrosas'),ov);
  var cast=el('div','bf-kill-cast','',ov);
  function person(hero,cl,role,parent){
    var box=el('div',cl,'',parent);var portrait=el('div','bf-kill-portrait','',box);
    if(hero.art)portrait.style.backgroundImage='url("'+hero.art.replace(/"/g,'%22')+'")';
    el('div','bf-kill-name',hero.name|| (english?'Unknown hero':'Héroe desconocido'),box);
    el('div','bf-kill-role',role,box);
  }
  if(actor&&!self)person(actor,'bf-kill-actor',english?'Killer':'El asesino',cast);
  if(actor&&!self)el('div','bf-kill-action',actor.kind==='castSpell'?'✨':actor.kind==='useItem'?'🧪':actor.kind==='useAbility'?'💥':'⚔️',cast);
  if(self)el('div','bf-kill-action','🍌',cast);
  var group=el('div','bf-kill-victims','',cast);
  victims.forEach(function(v){person(v,'bf-kill-vic',english?'Fallen':'Caído',group);});
  var lines=el('div','bf-kill-ko','',ov);
  victims.forEach(function(v){var line=el('div','bf-kill-line','',lines);el('span','bf-kill-speaker',(v.name||'')+': ',line);el('span','bf-kill-quip','«'+pick(v.clan,english,self?'self':'')+'»',line);});
  return ov;
}