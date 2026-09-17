const prepare = require('./targetingHarness.cjs');
const targeted = ['tor','Undertaker','Konb','vap','kre','pat','fut','gam','ret','ser','elder','zar','alf','dix','mor','renhu','pij','bat','nix','vex','sol','pac','rev','doc','caoffe','aje','rol','boski','nar','Faseve','bagslord','tk_ban','tk_pez','tk_caj','tk_lav','tk_patito_goma','tk_unicornio'];
module.exports = function audit(html,cards,specs){
  const setup=prepare(html), results=[], extra=[];
  const assert=(value,label)=>{if(!value)throw Error(label);};
  for(const card of cards.filter(c=>targeted.includes(c.card_id)))for(const elite of [false,true])for(const mode of ['host','guest','local','ai']){
    const name=card.name+(elite?' elite':' normal')+'/'+mode;
    try{
      const t=setup(card,elite,mode,specs);t.start();const picks=t.drain();
      let expected=(['pij','boski','nar','Faseve','tk_patito_goma','bagslord'].includes(card.card_id)&&elite)||(['tk_caj','tk_lav'].includes(card.card_id)&&!elite)?0:card.card_id==='nix'||(card.card_id==='ret'&&elite)?2:1;
      if(mode==='ai')expected=0;
      assert(picks===expected,'Expected '+expected+' selections, got '+picks);
      assert(t.state.done===1&&!t.c.B.pending&&!t.c.__bfAbilityChoiceWaiting&&!t.state.invalidDamage,'Incomplete or invalid resolution');
      results.push({name,pass:true});
    }catch(e){results.push({name,pass:false,error:e.message});}
  }
  const check=(name,fn)=>{try{fn();extra.push({name,pass:true});}catch(e){extra.push({name,pass:false,error:e.message});}};
  const fixture=(id,elite=false,mode='guest')=>setup(cards.find(c=>c.card_id===id),elite,mode,specs);
  check('Guest control stays separate from local UI',()=>{const t=fixture('tor');assert(!t.c.humanCtl('o')&&t.c.bfAbilityHuman('o'),'Guest treated as AI or host owns guest panel');t.c.G.demo=true;assert(!t.c.bfAbilityHuman('o'),'Demo must remain AI');});
  check('Long selection and cancel/retry',()=>{const t=fixture('tor');t.start();const p=t.c.B.pending;t.tick(16000);t.start();assert(t.c.B.pending===p&&t.state.done===0,'Selection duplicated after timeout');t.c.cancelPending();assert(!t.c.B.pending&&!t.c.__bfAbilBusy&&!t.hero.abilityUsed,'Cancel retained lock');t.start();assert(t.c.B.pending&&t.c.B.pending.requestId!==p.requestId,'Retry did not get new selection');t.drain();assert(t.state.done===1,'Retry did not complete');});
  check('Stale and wrong-turn network targets rejected',()=>{const t=fixture('ret',true);t.start();const first=t.c.B.pending,id=t.candidates().at(-1).id;t.c.handleIntent({t:'intent',op:'target',side:first.validSide,id,requestId:'stale'});assert(t.c.B.pending===first,'Stale selection accepted');t.c.handleIntent({t:'intent',op:'target',side:first.validSide,id,requestId:first.requestId});const second=t.c.B.pending;assert(second&&second.requestId!==first.requestId,'Second selection missing');t.c.handleIntent({t:'intent',op:'target',side:first.validSide,id,requestId:first.requestId});assert(t.c.B.pending===second,'Duplicate advanced another step');t.c.pickTarget(second.validSide,id);assert(t.c.B.pending===second,'Same target selected twice');t.c.B.current.side='p';t.c.handleIntent({t:'intent',op:'cancel',requestId:second.requestId});assert(t.c.B.pending===second,'Guest cancelled host turn');});
  check('Revival rejects living units',()=>{const t=fixture('sol');t.start();const p=t.c.B.pending;t.c.pickTarget(t.side,t.hero.id);assert(t.c.B.pending===p&&p.allowDead,'Living revival target accepted');t.drain();assert(t.teams[t.side][2].alive,'Chosen fallen ally did not revive');});
  check('Nixara cannot cancel after dealing damage',()=>{const t=fixture('nix');t.start();const p=t.c.B.pending,victim=t.candidates().at(-1);t.c.pickTarget(p.validSide,victim.id);assert(t.c.B.pending?.noCancel,'Healing continuation cancellable');const hp=victim.hp;t.c.cancelPending();assert(t.c.B.pending&&victim.hp===hp,'Partial action cancelled');t.drain();assert(t.state.done===1,'Drain did not finish');});
  check('Choice request validates key and identity',()=>{const t=fixture('Faseve');t.start();const p=t.c.B.pending;t.c.pickTarget(p.validSide,t.candidates().at(-1).id);const m=t.state.wire.find(x=>x.t==='bfChoice');assert(m,'Guest choice not forwarded');t.state.listeners.forEach(f=>f({t:'intent',op:'choice',choiceId:m.choiceId,key:'bad'}));assert(t.state.done===0&&t.c.__bfAbilityChoiceWaiting,'Bad choice accepted');t.drain();assert(t.state.done===1,'Valid choice incomplete');t.state.listeners.forEach(f=>f({t:'intent',op:'choice',choiceId:m.choiceId,key:'elite'}));assert(t.state.done===1,'Choice repeated');});
  check('Client sends target identity without applying effects',()=>{const t=fixture('tor');t.start();const p=t.c.B.pending,ally=t.candidates().at(-1);t.c.NET.role='client';t.c.pickTarget(p.validSide,ally.id);const msg=t.state.wire.at(-1);assert(msg.op==='target'&&msg.requestId===p.requestId&&ally.shield===0,'Client resolved locally or omitted selection identity');});
  check('Mixed custom steps keep enemy and ally distinct',()=>{const card={card_id:'test_mixed',name:'Mixed',ability_name:'Mixed'}, spec={card_id:'test_mixed',status:'implemented',effect_type:'custom_steps',params:{steps:[{action:'damage',target:'enemy',amount:5},{action:'heal',target:'ally',amount:7}]}};const t=setup(card,false,'guest',[spec]);t.start();assert(t.drain()===2,'Needs two independent targets');assert(t.teams[t.foe][2].hp===35&&t.teams[t.side][2].hp===47,'Enemy healed or ally damaged');assert(t.state.done===1,'Mixed action incomplete');});
  check('Dedicated Retropoeta without editor spec',()=>{const card=cards.find(c=>c.card_id==='ret');const t=setup(card,true,'guest',[]);t.start();assert(t.drain()===2&&t.state.done===1,'Dedicated multiple targeting failed');});
  check('Host portrait cannot choose guest target',()=>{const t=fixture('tor');t.start();let blocked=false;(t.state.events['dom:click']||[]).forEach(f=>f({target:{closest:()=>true},preventDefault(){},stopImmediatePropagation(){blocked=true;}}));assert(blocked,'Host portrait not blocked');});
  const full=[];
  for(const card of cards.filter(c=>['hero','bizarro'].includes(c.category)))for(const elite of [false,true])for(const mode of ['host','guest','local','ai']){
    const name=card.name+(elite?' elite':' normal')+'/'+mode;
    try{const t=setup(card,elite,mode,specs);t.start();t.drain();assert(t.state.done===1&&!t.c.B.pending&&!t.c.__bfAbilityChoiceWaiting&&!t.state.invalidDamage,'Incomplete resolution');full.push({name,pass:true});}
    catch(e){full.push({name,pass:false,error:e.message});}
  }
  return {scope:'Isolated actual-source logic, not a two-device UI match',scenarios:results.length,passed:results.filter(r=>r.pass).length,failures:results.filter(r=>!r.pass),regressions:extra,fullCoverage:{scenarios:full.length,passed:full.filter(r=>r.pass).length,failures:full.filter(r=>!r.pass)}};
};